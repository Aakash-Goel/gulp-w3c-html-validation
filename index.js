'use strict';

const _assign = require('lodash').assign;
const gutil = require('gulp-util');
const through = require('through2');
const w3cjs = require('w3cjs');

const utils = require('./lib/utils');
const colors = require('./lib/colors');
const rval = require('./lib/remoteval');
const HtmlReportsGenerator = require('./lib/htmlReportsGenerator');
const generateCheckstyleReport = require('./lib/generateCheckstyleReport');

const PluginError = gutil.PluginError;
const PLUGIN_NAME = 'gulp-plugin-w3c-html';

// default options
const defaultOptions = {
	charset:          false, // Defaults false for autodetect
	doctype:          false, // Defaults false for autodetect
	errorHTMLRootDir: 'w3cErrors',
	errorTemplate:    'template/w3c_validation_error_template.html',
	failHard:         false,
	generateReport:   true,
	maxTry:           3,
	statusPath:       'w3cErrors/validation-status.json',
	proxy:            null,
	relaxerror:       [],
	remotePath:       '',
	reportpath:       'w3cErrors/validation-report.json',
	reset:            true,
	stoponerror:      false,
	useTimeStamp:     true,
};

// Global variables
let msg = utils.messages;
let exitProcess = false;
let isRelaxError = false;
let dummyFile = null;
let remoteFilesArr = null;
let reportArry = [];
let readSettings = {};
let counter = 0;
let retryCount = 0;
let errorFileCounter = 0;
let len;
let htmlSource;

const gulpW3cHtml = (options = {}) => {
	// Extend options
	let gulpOptions = _assign({}, defaultOptions, options);

	// local variables
	let flen;
	let combinedErrorReports = [];
	let wrapfile;
	let wrapfile_line_start = 0;

	// Check if option relaxerror use
	isRelaxError = gulpOptions.relaxerror.length && gulpOptions.relaxerror.length !== '';

	// Reset current validation status and start from scratch.
	if (gulpOptions.reset) {
		utils.writeFile(gulpOptions.statusPath, '{}');
	}

	// Through2 is a thin wrapper around node transform streams
	let stream = through.obj(function(file, encoding, callback) {
		// if no file, check for urls
		if (file.isNull()) {
			// throw new PluginError(PLUGIN_NAME, 'No urls are specified ');
			if (isRemotePathError()) {
				callback(null);

				return;
			}

			initValidation(false, file, callback);
		}

		// if stream, throw an error
		if (file.isStream()) {
			throw new PluginError(PLUGIN_NAME, 'Cannot read streams');
		}

		if (file.isBuffer()) {
			// throw new PluginError(PLUGIN_NAME, 'Cannot read buffer');
			// gutil.log(new PluginError(PLUGIN_NAME, 'Cannot read buffer'));
			// this.emit('error', new PluginError(PLUGIN_NAME, 'Cannot read buffer'));
			// process.exit(1);

			if (isRemotePathError()) {
				callback(null, file);

				return;
			}

			initValidation(true, file, callback);
		}

	});

	function isRemotePathError() {
		let isRemotePathErrorExist = false;
		if (!gulpOptions.remotePath && gulpOptions.remoteFiles) {
			gutil.log(msg.remotePathError);
			isRemotePathErrorExist = true;
		}
		return isRemotePathErrorExist;
	};

	function setRemoteFiles() {
		if (!isRemotePathError() && gulpOptions.remotePath !== '') {
			remoteFilesArr = utils.makeFileList(gulpOptions.remoteFiles, gulpOptions.remotePath);
		}
		return remoteFilesArr;
	};

	function initValidation(isBuffer, file, callback) {
		// validation for remote files
		if (gulpOptions.remoteFiles) {
			remoteFilesArr = setRemoteFiles();

			dummyFile = remoteFilesArr;
			remoteFilesArr = [];

			for (let i = 0; i < dummyFile.length; i++) {
				let filePathTemp = dummyFile[i].split("/");
				filePathTemp = filePathTemp.slice(filePathTemp.length-2).join("").replace(/[&.+/http(s):=?]/g, "");
				remoteFilesArr.push(filePathTemp + '_tempvlidation.html');
			}

			rval(dummyFile[counter], gulpOptions.request, function () {
				validate(remoteFilesArr, true, callback);
			});

			return;
		}
		// validation for local files
		else if (!gulpOptions.remoteFiles && isBuffer) {
			validate(file, false, callback);

			// return callback(null, file);
		}
		else if (!gulpOptions.isRemoteFiles && !isBuffer) {
			gutil.log(msg.nofile);

			return callback(null);
		}
		else {
			gutil.log(msg.error);

			return callback(null);
		}

	};

	function checkRelaxError(error) {
		for (var i = 0, l = gulpOptions.relaxerror.length; i < l; i++) {
			var re = new RegExp(gulpOptions.relaxerror[i], 'g');
			if (re.test(error)) {
				return true;
			}
		}
	}

	function addToReport(fname, status) {
		let relaxedReport = [],
			report = {},
			styleToHighlight = '<strong style="background-color: #FFFF80; font-weight: bold;" title="Position where error was detected.">ErrorToCome</strong>';

		// No Need to execute complete method if status is coming as "false"
		if(status === false) {
			report.filename = fname;
			report.error = relaxedReport;
			reportArry.push(report);

			return;
		}

		for (let i = 0; i < status.length; i++) {
			if (!checkRelaxError(status[i].message)) {

				// Highlight the Source Code.
				if(status[i]["extract"]) {
					var extractTemp = status[i]["extract"],
						hiliteStart = status[i]["hiliteStart"],
						hiliteLength = status[i]["hiliteLength"];

						status[i]["errSrcFirstPart"] = extractTemp.substr(0, hiliteStart);
						status[i]["errSrcToHighlight"] = utils.escapeHtml(extractTemp.substr(hiliteStart, hiliteLength));
						status[i]["errSrcToHighlight"] = styleToHighlight.replace("ErrorToCome", status[i]["errSrcToHighlight"]);
						status[i]["errSrcSecondPart"] = extractTemp.substr(hiliteStart + hiliteLength);
				}

				relaxedReport.push(status[i]);
			}
		}

		report.filename = fname;
		report.error = relaxedReport;
		reportArry.push(report);

		/**
		 * Code to generate the HTML Reports if needed
		 */
		if(relaxedReport[0] && gulpOptions.generateReport === true) {
			new HtmlReportsGenerator(report, gulpOptions, errorFileCounter);
			errorFileCounter++;
		}
	};

	function validate(file, isRemoteFiles, cb) {
		let filePath;
		let errorReports = [];

		if (utils.isFileExist(gulpOptions.statusPath)) {
			readSettings = JSON.parse(utils.readFile(gulpOptions.statusPath));
		}

		if (isRemoteFiles) { // `filePath` for remote files
			flen = file.length;
			filePath = gulpOptions.remoteFiles ? dummyFile[counter] : '';
		}
		else { // `filePath` for local files
			flen = 1; // gulp works on streams, so files will be read one by one
			filePath = file.path.replace(file.cwd+'/', '');
		}

		gutil.log(msg.start + filePath);

		let w3cjs_options = {
			//file: files[counter],       // file can either be a local file or a remote file
			// file: 'http://localhost:9001/010_gul006_business_landing_o2_v11.html',
			output: 'json',             // Defaults to 'json', other option includes html
			doctype: gulpOptions.doctype,   // Defaults false for autodetect
			charset: gulpOptions.charset,   // Defaults false for autodetect
			proxy: gulpOptions.proxy,       // Proxy to pass to the w3c library
			callback: function (res) {
				errorReports.push( res );
				combinedErrorReports.push( res );

				if (!res.messages) {
					++retryCount;
					let netErrorMsg = msg.networkError + ' ' + retryCount.toString().error + ' ';

					if (retryCount === gulpOptions.maxTry) {
						counter++;
						if (counter !== flen) {
							netErrorMsg += msg.nextfile;
						} else {
							netErrorMsg += msg.eof;
							exitProcess = true;
						}
						retryCount = 0;
					}

					gutil.log(netErrorMsg);
					if (exitProcess) {
						process.exit(1);
					}

					let nFile = isRemoteFiles ? remoteFilesArr : file;
					let nIsRemoteFiles = isRemoteFiles ? true : false;
					validate(nFile, nIsRemoteFiles, cb);

					return;
				}

				var setGreen = function () {
					readSettings[filePath] = true;
					gutil.log(msg.ok.green);

					addToReport(filePath, false);
				};

				len = res.messages.length;
				if (len) {
					var errorCount = 0,
						prop;

					for (prop in res.messages) {
						res.messages[prop].unwrapLine = res.messages[prop].lastLine - wrapfile_line_start;
					}

					for (prop in res.messages) {
						let chkRelaxError;
						if (isRelaxError) {
							chkRelaxError = checkRelaxError(res.messages[prop].message);
						}

						if (!chkRelaxError) {
							errorCount = errorCount + 1;

							let lineNumber = ' Line no: ' + JSON.stringify(gulpOptions.wrapfile ? res.messages[prop].unwrapLine : res.messages[prop].lastLine);
							if (typeof(prompt) !== 'undefined') {
								lineNumber = lineNumber.prompt;
							}

							gutil.log(errorCount + '=> '.warn + JSON.stringify(res.messages[prop].message).help + lineNumber );
						}

					}

					if (errorCount !== 0) {
						gutil.log('No of errors: '.error + errorCount);
					}

					readSettings[filePath] = false;

					addToReport(filePath, res.messages);

					if (gulpOptions.stoponerror) {
						process.exit(1);
					}

					if (isRelaxError && errorCount === 0) {
						setGreen();
					}
				}
				else {
					setGreen();
				}

				utils.writeFile(gulpOptions.statusPath, JSON.stringify(readSettings));

				// depending on the output type, res will either be a json object or a html string
				counter++;

				if (!gulpOptions.remoteFiles) {
					initCheckstyleReport();
					initValidationReport();
					initFailHard();

					return cb(null, file);
				}

				if (gulpOptions.remoteFiles) {
					if (counter === flen) {
						initCheckstyleReport();
						initValidationReport();
						initFailHard();

						return;
					}

					rval(dummyFile[counter], gulpOptions.request, function () {
						validate(remoteFilesArr, true, cb);
					});
				}
            }
        };

		function initCheckstyleReport() {
			if (gulpOptions.generateCheckstyleReport) {
				let checkstyleReport = generateCheckstyleReport( combinedErrorReports );
				utils.writeFile( gulpOptions.generateCheckstyleReport, checkstyleReport );
				gutil.log('Checkstyle report generated: '.green + gulpOptions.generateCheckstyleReport );
			}
		};
		function initValidationReport() {
			if (gulpOptions.reportpath) {
				utils.writeFile(gulpOptions.reportpath, JSON.stringify(reportArry));
				gutil.log('Validation report generated: '.green + gulpOptions.reportpath);
			}
		};
		function initFailHard() {
			if (gulpOptions.failHard) {
				let validationErrCount = reportArry.reduce(function (sum, report) {
					return sum + report.error.length;
				}, 0);

				if (validationErrCount > 0) {
					gutil.log(validationErrCount + ' total unignored HTML validation error(s).');
					process.exit(1);
				}
			}
		};

		if (gulpOptions.wrapfile) {
			gutil.log(`'wrapfile' is not supported yet. Will be supported in upcoming version.`);
		}
		else if (gulpOptions.remoteFiles) {
			w3cjs_options.file = '_tempvlidation.html';
			htmlSource = utils.readFile(w3cjs_options.file);
		}
		else {
			w3cjs_options.file = filePath;
			htmlSource = utils.readFile(w3cjs_options.file);
		}

		// override default server
		if (gulpOptions.serverUrl) {
			w3cjs.setW3cCheckUrl(gulpOptions.serverUrl);
		}

		// @TODO: put below code inside try/catch block
		w3cjs.validate(w3cjs_options);
	}
	return stream;
}

// Exporting the plugin main function
module.exports = gulpW3cHtml;
