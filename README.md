ViralGraphics.io
================

**ViralGraphics.io** is a new JavaScript / HTML5 application framework under the MIT license. It is specifically designed to enable Desktop like applications inside your browser and provides a wide range of widgets and layouts to generate complex and good looking user interfaces.

It combines the best of the HMTL5 2D canvas and WebGL in an easy to use API.

Main Features:

* A lightweight MVC system with integrated undo / redo and load / save capabilities.
* Many different layouts and widgets.
* Integrated backend for user management, application folders and more.
* Compile and upload applications to the web using vgmake.js.
* An integrated nodes system. The node application (source code in apps/nodes) can be viewed [here](https://visualgraphics.tv/apps/nodes)
* WebGL abstraction classes.

ViralGraphics.io was previously named VisualGraphics.tv. There may stll be references and links to the old name in the documentation.

## Applications using ViralGraphics.io

The first major application based on ViralGraphics.io is [PaintSupreme 3D](https://www.paintsupreme3d.com). It is available on the Web, as well as in native Windows, Mac and Linux versions. It is also available inside the Mac and Windows App Stores. Native versions are possible via inbuild support of [Electron](https://electron.atom.io/).

Applications using ViralGraphics.io

1. [PaintSupreme 3D](https://www.paintsupreme3d.com)
2. [RaySupreme DF](https://www.raysupreme.com) (Under Development)

![Spaceship Screenshot](https://s3-us-west-2.amazonaws.com/braindistrict/Spaceship.jpg "PaintSupreme 3D Screenshot")

## Status

The current version is v0.4x with new features being implemented daily. ViralGraphics.io is already in a usable state, however APIs can change without notice and documentation is under development at the moment.

For more information please visit the ViralGraphics.io Documentation at http://www.viralgraphics.io or contact me at markusm@ViralGraphics.io.

# Developing for ViralGraphics.io

Makefiles of ViralGraphics.io applications (they end with .vg) can be compiled into project files (.vide) using a node.js based program called vgmake. vgmake also allows the creation and publishing of applications on the Web.

The documentation of ViralGraphics.io is currently the weak link and work in progress, you can find the (not complete) documention in the docs folder. We are working on this and hope to have a full documentation as soon as possible. Please also look at the example applications for reference.

V-IDE, the ViralGraphics.io IDE, has not yet catched up with the latest developments and has temporarily been taken out of the distribution. You can use vgmake to fully replace V-IDE for now.

## vgmake.js

vgmake is an node.js based script to compile a ViralGraphics.io makefile (.vg) into .vide project which can than be executed via the supplied .html files and published on the Web. vgmake.js is located inside the nodejs folder.


The syntax of vgmake is pretty easy, you just supply the path and name of the .vg file and it will compile it and save it as a .vide file in the same directory as the source .vg file, e.g. "node vgmake.js ../examples/cornellbox/cornellbox.vg". The .html file will read the .vide file and launch it via the supplied visualgraphics.js script.

Additionally you can supply parameters to vgmake to create and publish an application on the Web, this is done by supplying your www.visualgraphics.tv account username and password via the -u and -p parameters and by using additional -create and -update parameters. The syntax of .vg files is described below.

## vgbuild.js

This script builds vglib.min.js from the ViralGraphics.io sources and should only be used when you are actively developing ViralGraphics.io or need to insert debug info.

vgbuild.js uses the Google Closure Compiler to compress the ViralGraphics.io sources. As this can take quite some time, vgbuild supports an -debug option which creates an uncompressed vglib.min.js file, useful for ViralGraphics.io development.

## Syntax of .vg Makefiles

### Parameters


* _name_ - Sets the name of the Application. Has to be defined when you want to create the application on the ViralGraphics.io server.
* _url_ - Sets the Url the application will be available at inside the visualgraphics.tv/apps/ directory once published. Has to be defined when you want to create the application on the Visual Graphics server.
* _version_ - Sets the version string of the application.
* _author_ - Sets the author name of the application.
* _domain_ - Specifies an optional custom domain.
* _keywords_ - Keywords describing application functionality, will be inserted into the applications website meta-data once published.
* _title_ - Title of the application. Will be displayed in the browsers title bar once published.
* _description_ - Multi line description of the application.
* _webBorderColor_ - Specifies a custom web border color in CSS terms.

### Content

* _sources_ - A comma separated list with links to the sources of the application. Several _sources_ lines can be specified.
* _images_ - A comma separated list with links to the images used by the application. Several _images_ lines can be specified. An image can be requested inside an application with VG.Utils.getImageByName( Filename ).
* _html_ - A comma separated list with links to the html or text files used by the application. Several _html_ lines can be specified. An html/text file can be requested inside an application with VG.Utils.getTextByName( Filename ). Filename has to be the basename without any endings.
* _svg_ - A comma separated list with links to the scalable vector files of the application. Several vector file lines can be specified. An SVG can be requested inside an application with VG.Utils.getSVGByName( Filename ).

### An example .vg makefile:

```
name = Website
version = 0.31
url = website
author = Markus Moenig

sources = main.js
sources = homepage.js, newspage.js

images = images/banner.png, images/logo_home.png

svg = svg/glyphs.svg, svg/socialglyphs.svg

html = html/About Visual Graphics.html, html/Features Overview.html
```