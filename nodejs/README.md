## Using the Development Tools

## vgmake.js

vgmake is an node.js based script to compile Visual Graphics applications into .vide project files which can than be executed via the supplied .html files and published on the Web.

The syntax of vgmake is pretty easy, you just supply the path and name of the .vg file and it will compile it and save it as a .vide file in the same directory as the source .vg file, e.g. "node vgmake.js ../examples/cornellbox/cornellbox.vg". The .html file will read the .vide file and launch it via the supplied visualgraphics.js script.

Additionally you can supply parameters to vgmake to create and publish an application on the Web, this is done by supplying your www.visualgraphics.tv account username and password via the -u and -p parameters and by using adding additional -create and -update parameters. The syntax of .vg files is described below.

## vgbuild.js

This script builds vglib.min.js from the Visual Graphics sources and should only be used when you are actively developing Visual Graphics or need to insert debug info.

vgbuild.js uses the Google Closure Compiler to compress the Visual Graphics sources. As this can take quite some time, vgbuild supports an -quick option which creates an uncompressed vglib.min.js file. Useful for Visual Graphics development.
