'use strict';

const checkstyleFormatter = require('checkstyle-formatter');

module.exports = function ( files ) {
    let errorFormatted = [];

    files.forEach( function ( file ) {
        let errorFile = {
            filename: file.context,
            messages: []
        };
        errorFormatted.push(errorFile);
        file.messages.forEach( function ( error ) {
            if ( error.type !== 'info' ) {
                errorFile.messages.push({
                    line: error.lastLine,
                    column: error.firstColumn,
                    severity: error.type,
                    message: error.message
                });
            }
        });
    });

    return checkstyleFormatter( errorFormatted );
};
