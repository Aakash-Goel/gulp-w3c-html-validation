# gulp-w3c-html-validation
> W3C html validation gulp plugin. Validate all files in a directory automatically.

Useful features:
- This plug-in generate the W3C error's source code context/reference from validated code. This will help users to find the error easily by just copy/paste from validated page source.
- This plug-in will validate all configured files/URLs.
- This plug-in will generate W3C reports in HTML format.

## Getting Started

If you haven't used [Gulp](http://gulpjs.com/) before, be sure to check out the [Getting Started](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) guide, as it explains how to create a [Gulpfile](https://github.com/gulpjs/gulp/blob/master/docs/API.md) as well as install and use Gulp plugins. Once you're familiar with that process, you may install this plugin with this command:

```
npm install gulp-w3c-html-validation --save-dev
```

Once the plugin has been installed, add below line inside your Gulpfile:
```
const w3cValidation = require('gulp-w3c-html-validation');
```

## The "validation" task

### Overview
In your project's Gulpfile, add below code.

```js
gulp.task('w3c', function() {
  return gulp.src('')
    .pipe(w3cValidation({
        generateCheckstyleReport: 'w3cErrors/validation.xml',
        remotePath: "http://decodize.com/", // use regex validation for domain check
        remoteFiles: ["blog/2013/03/03/getting-started-with-yeoman-1-dot-0-beta-on-windows/",
            "blog/2015/01/09/front-end-d-workflow-redefined-jade/",
            "blog/2013/08/07/front-end-viewpoints-architecture-building-large-websites/",
            "blog/2013/03/10/linktomob-share-your-links-quickly-and-easily-on-mobile-devices/",
            "blog/2013/02/09/slidemote-universal-remote-control-for-html5-presentations/"],
        relaxerror: ['Bad value X-UA-Compatible for attribute http-equiv on element meta.',
                        'Element title must not be empty.']
    }))
});
```

### Options

#### options.errorFileFunction

Type: `Mixed` <br/>
Default value: `undefined`

This is a generator for the error file. It must be a `function`

#### options.generateReport
Type: `Boolean` <br/>
Default value: `'true'`
Flag to get the W3C errors to be generated in form of HTML files, if set to `false` then it will will not generate HTML report of errors.

Note: Error HTMLs files will be generated only if file/URL has some errors, in case of no error it will not generate the error file.

#### options.generateCheckstyleReport
Type: `String`<br>
Default value: `undefined`

When a string is set ther will be generated a checkstyle report in this path.

#### options.errorHTMLRootDir
Type: `String` <br/>
Default value: `w3cErrorFolder`
Sets the name for Root Folder which will contain W3C error HTMLs wrapped by another folder.

#### options.useTimeStamp
Type: `String` <br/>
Default value: `'true'`
If set to `false` then it will overwrite the error sub folder and will not have the Timestamp, folder name will be 'w3cErrors'.

#### options.errorTemplate
Type: `String` <br/>
Default value: `w3c_validation_error_template.html`
Expects name for 'Handlebar' template to generate the error's HTMLs. Sample template is provided with plug-in in root folder.

#### options.request
Type `object` <br/>
Default value: `undefined`

Configuration for the `request` Module. For more information please read [the docs](https://github.com/request/request/tree/v2.40.0).

#### options.serverUrl
Type: `String` <br/>
Default value: `null`

Supply a different validator server URL, for instance [if you run a local server](http://validator.w3.org/source/).
Eg: `http://localhost/w3c-validator/check`

#### options.statusPath
Type: `String` <br/>
Default value: `'w3cErrors/validation-status.json'`

Default file for storing validation information.

#### options.reportpath
Type: `String` <br/>
Default value: `w3cErrors/validation-report.json`

Consolidated report in JSON format, if reportpath is `false` it will not generated.

#### options.stoponerror
Type: `Boolean` <br/>
Default value: `false`

When hit by a validation error, html-validator continue validating next file by default and this process continues until all files in the list completes validation. If 'stoponerror' set to  `true`, validator will stop validating next file.

#### options.maxTry
Type: `Number` <br/>
Default value: `3`

Number of retries when network error occuers. Default case, after 3 reties validator will move to next file.

#### options.remotePath
Type: `String` <br/>
Default value: ``

#### options.remoteFiles
Type: `Array` <br/>
Default value: ``

Array of page paths to be validated. When remote files are not present validator will append file names from local folder. `remotePath` is mandatory when this option is specified.

eg:

```js
remoteFiles: ['html/moving-from-wordpress-to-octopress/',
              'css/site-preloading-methods/']
```

you can also provide a file that contains an array of pages.

```js
remoteFiles: 'validation-files.json'
```

```js
['html/getting-started-with-yeoman-1-dot-0-beta-on-windows',
'html/slidemote-universal-remote-control-for-html5-presentations/',
'html/simple-responsive-image-technique/']
```

#### options.relaxerror
Type: `Array` <br/>
Default value: ``

Helps to skip certain w3c errors messages from validation. Give exact error message or a regular expression in an array & validator will ignore those relaxed errors from validation.

```js
relaxerror: ['Bad value X-UA-Compatible for attribute http-equiv on element meta.',
             'document type does not allow element "[A-Z]+" here']
```

#### options.doctype
Type: `String` <br/>
Default value: `false`

Set `false` for autodetect or chose one of this options:

- `HTML5`
- `XHTML 1.0 Strict`
- `XHTML 1.0 Transitional`
- `XHTML 1.0 Frameset`
- `HTML 4.01 Strict`
- `HTML 4.01 Transitional`
- `HTML 4.01 Frameset`
- `HTML 4.01 + RDFa 1.1`
- `HTML 3.2`
- `HTML 2.0`
- `ISO/IEC 15445:2000 ("ISO HTML")`
- `XHTML 1.1`
- `XHTML + RDFa`
- `XHTML Basic 1.0`
- `XHTML Basic 1.1`
- `XHTML Mobile Profile 1.2`
- `XHTML-Print 1.0`
- `XHTML 1.1 plus MathML 2.0`
- `XHTML 1.1 plus MathML 2.0 plus SVG 1.1`
- `MathML 2.0`
- `SVG 1.0`
- `SVG 1.1`
- `SVG 1.1 Tiny`
- `SVG 1.1 Basic`
- `SMIL 1.0`
- `SMIL 2.0`


#### options.charset
Type: `String` <br/>
Default value: `false`

Set `false` for autodetect or chose one of this options:

- `utf-8`
- `utf-16`
- `iso-8859-1`
- `iso-8859-2`
- `iso-8859-3`
- `iso-8859-4`
- `iso-8859-5`
- `iso-8859-6-i`
- `iso-8859-7`
- `iso-8859-8`
- `iso-8859-8-i`
- `iso-8859-9`
- `iso-8859-10`
- `iso-8859-11`
- `iso-8859-13`
- `iso-8859-14`
- `iso-8859-15`
- `iso-8859-16`
- `us-ascii`
- `euc-jp`
- `shift_jis`
- `iso-2022-jp`
- `euc-kr`
- `gb2312`
- `gb18030`
- `big5`
- `big5-HKSCS`
- `tis-620`
- `koi8-r`
- `koi8-u`
- `iso-ir-111`
- `macintosh`
- `windows-1250`
- `windows-1251`
- `windows-1252`
- `windows-1253`
- `windows-1254`
- `windows-1255`
- `windows-1256`
- `windows-1257`

#### options.failHard
Type: `boolean` <br/>
Default value: `false`

If true, the task will fail at the end of its run if there were any validation errors that were not ignored via `options.relaxerror`.
