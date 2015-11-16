Desktop / Mobile Host 
=====================

This directory contains the sources of the cross platform host application for Visual Graphics, it provides the runtime environment for Visual Graphics applications for all platforms except the Web.

Simply put, it executes an .vide project and you can use it to run your Visual Graphics projects (.vide) natively on every supported platform.

This Visual Graphics application runtime is based on cmake, SDL2 and Google V8 / SpiderMonkey.

##Compiling

First, make sure you have the SDL2 development runtime installed in your system (https://www.libsdl.org). Than, download and compile Google V8 or SpiderMonkey 38 (https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Releases/38).

Create a directory named "build" inside the sdl2_host directory. Open a Terminal and enter this directory. Than run cmake like this:

`cmake .. -DV8_DIR=<PATH_TO_V8> -DCMAKE_BUILD_TYPE=Debug`

if you want to use Google's V8 or

`cmake .. -DSM_DIR=<PATH_TO_SM>/js/src/build-release -DCMAKE_BUILD_TYPE=Debug`

if you want to use SpiderMonkey.

After this, you can just build using 'make'

You can define the .vide project to be executed by specifying the path on the command line.

##Automation

Normally you would not need to compile the native version of the Host environment yourself as the Backend of Visual Graphics has an integrated build system which supplies you with native builds of your application once you published your Visual Graphics application. Please see the documentation of VIDE or VGMAKE for futher information.

##Contact

For questions and support, please eMail me at markusm@visualgraphics.tv
