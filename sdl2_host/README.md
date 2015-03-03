Desktop / Mobile Host 
=====================

This directory contains the sources of the cross platform host application for Visual Graphics, it provides the runtime environment for Visual Graphics applications for all platforms except the Web.

Simply put, it executes an .vide project and you can use it to run your Visual Graphics projects on every supported platform. It provides abstractions for Visual Graphics modules like the OpenGL Abstraction layer as well as platform specific functionality like native menus, toolbars or access to the camera and so on. (Currently work in progress).

This Visual Graphics application runtime is based on cmake, SDL2 and SpiderMonkey.

##Compiling

First, make sure you have the SDL2 development runtime installed in your system (https://www.libsdl.org). Than, download and compile SpiderMonkey 31 (https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Releases/31). 

Create a directory named "build" inside the sdl2_host directory. Open a Terminal and enter this directory. Than run cmake like this:

`cmake .. -DSM_DIR=<PATH_TO_SM>/js/src/build-release -DCMAKE_BUILD_TYPE=Debug -D__VG_OPENGL3__=1`

Where PATH_TO_SM should be replaced with the path to the directory containing the compiled SpiderMonkey source. The __VG__OPENGL3__ define specifies which OpenGL profile to use, set it to 1 for Windows and Mac, which do not have a full OpenGL ES 2 profile, and to 0 for Linux which is currently the only Desktop platform with a full ES 2 profile.

After this, you can just build using 'make'

The Visual Graphics host template runs by default the addressbook sample application. You can define a different .vide project to be executed by specifying the path on the command line.

##Automation

In the future you will be able to receive custom tailored, native applications running your Visual Graphics project from within V-IDE. We plan to have this automatic server based, runtime generation implemented by Visual Graphics v1.

##Platforms

The host template has been compiled on and tested under Windows, Mac and Linux. Native functionality for all of these platforms are currently under development, like native menus and toolbars for each platform.

Support for iOS and Android will be implemented soon.

##Download

Compiled and ready to use versions of the host application are available here on the Downloads page on www.visualgraphics.tv

##Contact

For questions and support, please eMail me at markusm@visualgraphics.tv
