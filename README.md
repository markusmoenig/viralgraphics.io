Visual Graphics
===============

Visual Graphics is an Open Source Application Framework written completely in JavaScript / C++ and WebGL. It's main goal is to create and distribute 3D / Graphics enabled Desktop like applications on the Web. It has an easy to use API, similar to other Desktop Application Frameworks, and is released under the MIT license.

Developers can choose from a wide collection of various layouts and widgets to create professional (looking) applications. As Visual Graphics is drawing all widgets itself using styles and skins, applications can completely control their own look and feel. For example the Visual Graphics Website is actually not a Website, but an Visual Graphics application.

Everything drawn by Visual Graphics is rendered via an WebGL abstraction layer. Basically, if WebGL can do it, your application can do it. You can create fully enabled 3D contexts and they are just widgets inside the Visual Graphics UI System.

Applications written for Visual Graphics can be easily deployed and distributed to the Web using the supplied node.js based vgmake product. You can even create support for custom domains and Google Analytics.

Several example applications based on Visual Graphics are supplied with their sources in the examples folder. Just click on their .html files to start them.

##Developing for Visual Graphics

Makefiles of Visual Graphics applications (they end with .vg) can be compiled into project files (.vide) using a node.js based program called vgmake. vgmake also allows the creation and publishing of applications on the Web.

The documentation of Visual Graphics is currently the weak link and work in progress, you can find the (not complete) documention in the docs folder. We are working on this and hope to have a full documentation as soon as possible. Please also look at the example applications for reference.

V-IDE, the Visual Graphics IDE, has not yet catched up with the latest developments and has temporarily been taken out of the distribution. You can use vgmake to fully replace V-IDE for now.    

##Other Platforms

We initially envisioned Visual Graphics to be a cross platform toolkit. Meaning that we already created an SDL2 based host framework to run Visual Graphics applications natively on Desktop and Mobile platforms like Windows, Mac and iOS / Android. However the performance of Visual Graphics in modern browsers is so good that we want to focus on creating the best possible platform to develop and distribute Desktop like applications on the Web. To keep things simple we have therefore taken the SDL2 host sources from the distribution, if you are interested to run your Visual Graphics application natively on Desktop or Mobile devices please contact me and I will supply the sources (they are also under the MIT license).

##Status

The current version is v0.33 with new features being implemented daily.  Visual Graphics is already in a usable state, however APIs can change without notice and documentation is quite minimal at the moment. 

For more information please visit the Visual Graphics Homepage at http://www.visualgraphics.tv.

#Developing for Visual Graphics

These tools are located inside the nodejs folder. 

##vgmake.js

vgmake is an node.js based script to compile a Visual Graphics makefile (.vg) into .vide project files which can than be executed via the supplied .html files and published on the Web.

The syntax of vgmake is pretty easy, you just supply the path and name of the .vg file and it will compile it and save it as a .vide file in the same directory as the source .vg file, e.g. "node vgmake.js ../examples/cornellbox/cornellbox.vg". The .html file will read the .vide file and launch it via the supplied visualgraphics.js script.

Additionally you can supply parameters to vgmake to create and publish an application on the Web, this is done by supplying your www.visualgraphics.tv account username and password via the -u and -p parameters and by using adding additional -create and -update parameters. The syntax of .vg files is described below.

##vgbuild.js

This script builds vglib.min.js from the Visual Graphics sources and should only be used when you are actively developing Visual Graphics or need to insert debug info.

vgbuild.js uses the Google Closure Compiler to compress the Visual Graphics sources. As this can take quite some time, vgbuild supports an -quick option which creates an uncompressed vglib.min.js file. Useful for Visual Graphics development.

##Syntax of .VG files

###Parameters


* _name_ - Sets the name of the Application. Has to be defined when you want to create the application on the Visual Graphics server.
* _url_ - Sets the Url the application will be available at inside the visualgraphics.tv/apps/ directory once published. Has to be defined when you want to create the application on the Visual Graphics server.
* _version_ - Sets the version string of the application.
* _author_ - Sets the author name of the application.
* _domain_ - Specifies an optional custom domain.
* _keywords_ - Keywords describing application functionality, will be inserted into the applications website meta-data once published.
* _title_ - Title of the application. Will be displayed in the browsers title bar once published.
* _description_ - Multi line description of the application.
* _webBorderColor_ - Specifies a custom web border color in CSS terms.

###Content

* _sources_ - A comma separated list with links to the sources of the application. Several _sources_ lines can be specified.
* _images_ - A comma separated list with links to the images used by the application. Several _images_ lines can be specified. An image can be requested inside an application with VG.Utils.getImageByName( Filename ).
* _html_ - A comma separated list with links to the html or text files used by the application. Several _html_ lines can be specified. An html/text file can be requested inside an application with VG.Utils.getTextByName( Filename ). Filename has to be the basename without any endings.
* _svg_ - A comma separated list with links to the scalable vector files of the application. Several vector file lines can be specified. An SVG can be requested inside an application with VG.Utils.getSVGByName( Filename ).

###An example .vg makefile:

```name = Website
version = 0.31
url = website
author = Markus Moenig

sources = main.js
sources = homepage.js, newspage.js

images = images/banner.png, images/logo_home.png

svg = svg/glyphs.svg, svg/socialglyphs.svg

html = html/About Visual Graphics.html, html/Features Overview.html
```