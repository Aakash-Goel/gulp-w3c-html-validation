/*
 * gulp-w3c-html-validation remote validation helper
 * https://github.com/praveen/gulp-w3c-html-validation
 *
 * Copyright (c) 2017 - Aakash Goel
 * Licensed under the MIT license.
 */

'use strict';

const gutil = require('gulp-util');
const path = require('path');
const request = require('request');

const utils = require('./utils.js');
const getDirName = path.dirname;

module.exports = function remoteval (file, opts, cb) {
    opts = opts || {};
    opts.uri = file;

    request(opts, function (error, response, body) {
        if (response && response.statusCode === 404) {
            gutil.log(utils.messages.fileNotFound);
        }

        if (!error && response && response.statusCode === 200) {
			utils.writeFile('_tempvlidation.html', body);
            return cb(true);
        }
    });
};
