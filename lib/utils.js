/**
 * gulp-wcag-accessibility helper file
 * ------------------------
 * @summary		helper methods required for the plugin
 *
 * @author		Aakash Goel
 * @link		https://github.com/Aakash-Goel/gulp-wcag-accessibility
 *
 * copyright (c) 2016 Aakash Goel
 */

'use strict';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const colors = require('./colors');

const getDirName = path.dirname;

const entityMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"/": '&#x2F;'
};

const Utils = () => {
    let utils = {};

    utils.newDateObj = () => {
        const newDateObj = new Date();
        let newDate = {
			getDate: (newDateObj.getMonth() + 1) + "-" + newDateObj.getDate() + "-" + newDateObj.getFullYear(),
			getTime: newDateObj.toTimeString(),
			getSimplifyTime: newDateObj.toTimeString().substr(0, newDateObj.toTimeString().lastIndexOf(":")).replace(/:/g, "_"),
		}
        return newDate;
    };

	utils.messages = {
		error: 'Something went wrong',
		ok: 'Validation successful..',
		start: 'Validation started for.. '.info,
		networkError: 'Network error re-validating..'.error,
		validFile: 'Validated skipping..',
		nofile: ':- No file is specified in the path!',
		nextfile: 'Skipping to next file..'.verbose,
		eof: 'End of File..'.verbose,
		fileNotFound: 'File not found..'.error,
		remotePathError: 'Remote path '.error + '(options->remotePath) '.grey +
                        'is mandatory when remote files '.error +
                        '(options-> remoteFiles) '.grey + 'are specified!'.error
	};

	utils.writeFile = (filePath, writableContent) => {
		mkdirp.sync(getDirName(filePath));
		fs.writeFileSync(filePath, writableContent);
	};

	utils.readFile = (filePath, encoding = 'utf-8') => {
		let file = fs.readFileSync(filePath, encoding);
		return file;
	};

	utils.isFileExist = (filePath) => {
		return fs.existsSync(filePath);
	};

	utils.escapeHtml = (str) => {
		return String(str).replace(/[&<>"'\/]/g, function (s) {
			return entityMap[s];
		});
	};

	utils.makeFileList = (filesArr, path) => {
		return filesArr.map(function (file) {
			return path + file;
		});
	};

    return utils;
}

module.exports = Utils();
