
var fs = require('fs'),
    ClosureCompiler = require('google-closure-compiler').compiler,
    jshint = require('jshint');

// ---

var out="";
var index = fs.readFileSync( "vgbuild.index" ).toString();
var lines = index.split(/\r\n|\r|\n/);
lines =  cleanArray( lines );
var quick=false;

if ( process.argv.length > 2 && process.argv[2] === "-debug" )
    quick=true;


if ( quick ) {
    // --- For VG development / debugging

    var ignore=['typeface', 'vglib_a.js', 'vg-compressor.js', 'vg-sax.js'];

    for ( var i=0; i < lines.length; ++i ) {
        var sLink=lines[i];

        if ( sLink.length ) {
            var source=fs.readFileSync( sLink ).toString();

            if ( sLink.indexOf( "typeface") === -1 && sLink.indexOf( "vglib_a.js") === -1 && sLink.indexOf( "vg-sax.js") === -1 && sLink.indexOf( "vg-compressor.js") === -1 ) {
                jshint.JSHINT( source, { evil : true, esversion: 6, loopfunc : true } );
                jshint.JSHINT.errors.forEach( function( error ) {
                    if ( !error ) return;
                    var evidence=error.evidence ? " ( '" + error.evidence.substring( 0, 10 ) + " )'" : "";
                    console.log( sLink + ", line " + error.line + ": " + error.reason + evidence );
                } );
            }

            out+=source;
            out+="\n";
        }
    }
    fs.writeFile( "../vglib.min.js", out );
} else {
    // --- By default, use Googles Closure Compiler

    var closureCompiler = new ClosureCompiler({
        js: lines,
        compilation_level: 'SIMPLE'
    });

    var compilerProcess = closureCompiler.run(function(exitCode, stdOut, stdErr) {
        //compilation complete
        fs.writeFile( "../vglib.min.js", stdOut );
        // console.log( stdErr );
    });
}

// ----------------------------------------------------------------------- Helper Functions

function cleanArray( actual )
{
    var newArray = [];
    for(var i = 0; i<actual.length; i++) {
        if (actual[i])
            newArray.push(actual[i]);
    }
    return newArray;
}