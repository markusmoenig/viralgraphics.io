## Using the Development Tools

## viralgraphics.io

Please check the viralgraphics.io [nodejs module](https://www.npmjs.com/package/viralgraphics.io).

## vgbuild.js

This script builds vglib.min.js from the Visual Graphics sources and should only be used when you are actively developing Visual Graphics or need to insert debug info.

vgbuild.js uses the Google Closure Compiler to compress the Visual Graphics sources. As this can take quite some time, vgbuild supports an -quick option which creates an uncompressed vglib.min.js file. Useful for Visual Graphics development.
