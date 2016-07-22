
var fs = require('fs'),
    ClosureCompiler = require('google-closure-compiler').compiler;

// ---

var out="";
var index = fs.readFileSync( "vgbuild.index" ).toString();
var lines = index.split(/\r\n|\r|\n/);
lines =  cleanArray( lines );
var quick=false;

if ( process.argv.length > 2 && process.argv[2] === "-quick" )
    quick=true;


if ( quick ) {
    // --- For VG development / debugging

    for ( var i=0; i < lines.length; ++i ) {
        var sLink=lines[i];

        if ( sLink.length ) {
            out+=fs.readFileSync( sLink ).toString();
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
    });
}

// ----------------------------------------------------------------------- Helper Functions

function cleanArray( actual )
{
    // http://stackoverflow.com/questions/281264/remove-empty-elements-from-an-array-in-javascript
    var newArray = new Array();
    for(var i = 0; i<actual.length; i++) {
        if (actual[i])
            newArray.push(actual[i]);
    }
    return newArray;
}