'use strict';

var gulp = require('gulp');
var w3cValidation = require('./index.js');

// default task
gulp.task('default', function() {
	console.log('gulp is working');
});

// gulp-w3c-html-validation task to generate reports
gulp.task('w3c', function() {
	return gulp.src(['example/**/*.html',
                      '!example/index.html',
                      '!example/404.html'])
		.pipe(w3cValidation({
			generateCheckstyleReport: 'w3cErrors/validation.xml',
			// remotePath: "http://decodize.com/", // use regex validation for domain check
			// remoteFiles: ["blog/2013/03/03/getting-started-with-yeoman-1-dot-0-beta-on-windows/",
			//               "blog/2015/01/09/front-end-d-workflow-redefined-jade/",
			// 			  "blog/2013/08/07/front-end-viewpoints-architecture-building-large-websites/",
			// 			  "blog/2013/03/10/linktomob-share-your-links-quickly-and-easily-on-mobile-devices/",
			// 			  "blog/2013/02/09/slidemote-universal-remote-control-for-html5-presentations/"],
			relaxerror: ['Bad value X-UA-Compatible for attribute http-equiv on element meta.',
							'Element title must not be empty.']
		}))
});
