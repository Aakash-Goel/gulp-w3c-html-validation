/**
 * gulp-wcag-accessibility html report generator file
 * ------------------------
 * @summary		generate html files from AccessSniff reports.
 *
 * @author		Aakash Goel
 * @link		https://github.com/Aakash-Goel/gulp-wcag-accessibility
 *
 * copyright (c) 2016 Aakash Goel
 */

'use strict';

const gutil = require('gulp-util');
const handlebars = require('handlebars');
const utils = require('./utils.js');

const dateObj = utils.newDateObj();
const PluginError = gutil.PluginError;
const PLUGIN_NAME = 'gulp-plugin-w3c-html';

/**
 * HTML file generator from AccessSniff reports.
 *
 * @class			HTMLReportsGenerator
 *
 * @param {object} 	options. View AccessSniff (https://github.com/yargalot/AccessSniff) plugin options for all available options.
 * @param {object} 	accessibilityReport. Report object generated from AccessSniff.
 */
class HTMLReportsGenerator {
	constructor(report, options, errorFileCounter) {
		this.report = report;
		this.options = options;
		this.errorFileCounter = errorFileCounter;
		this.folderPath = '';
		this.filePath;

		if (utils.isFileExist(this.options.errorTemplate)) {
			this.errorTemplateSource = utils.readFile(this.options.errorTemplate);
		}
		else {
			gutil.log("Error: Provided Path for HTML Template file '".error + (this.options.errorTemplate).error + "' is not found.".error);
			return;
		}

		this.template = handlebars.compile(this.errorTemplateSource);

		this.generateReport()
	}

	generateReport() {
		if (!this.options.errorFileFunction) {
			let filePathTemp = this.report['filename'].split('/');

			filePathTemp = filePathTemp.slice(filePathTemp.length-2).join("-").replace(/[,<>=?|*:."%]/g, '');

			this.filePath = filePathTemp + "_validation-report" + ".html";
		}
		else if (typeof this.options.errorFileFunction === 'function') {
			this.filePath = this.options.errorFileFunction( this.report['filename'] );
		}

		this.folderPath = this.options.useTimeStamp ? "W3C_Errors-" + dateObj.getDate + '-' + dateObj.getSimplifyTime : "W3C_Errors";

		var errorCompletePath = (/([^\s])/.test(this.options.errorHTMLRootDir) === false) ? this.folderPath + "/" + this.filePath : this.options.errorHTMLRootDir + "/" + this.folderPath + "/" + this.filePath;

		utils.writeFile(errorCompletePath, this.template(this.report));

		gutil.log('HTML Validation report generated: '.info + errorCompletePath);
	}
}

module.exports = HTMLReportsGenerator;
