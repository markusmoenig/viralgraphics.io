HowTo
=====
 
Visual Graphics applications are packaged into files using the .vide extension. You can open .vide files using V-IDE, the integrated development environment for Visual Graphics.

From within V-IDE, you can develop your app, run it and also deploy it to the Web.

Desktop versions of V-IDE for Mac OS X, Windows 7/8 and Linux can be downloaded from the Downloads page on the Visual Graphics Homepage. You can run V-IDE locally in your browser by just double clicking the ide.html file.

From within V-IDE, you can open local projects by selecting "File / Open Locally..." in the Menu bar. Than Drag and Drop your local V-IDE project into the drop area of the File Requester.

##Web Deployment of your applications

Once you signed up to Visual Graphics, you can deploy your application via the Create toolbar item. For this to work, you need to enter a valid application name and an url in your project Settings. For example if your application is called "Foobar Pro", this would be your application name and the URL could be "foobar_pro", after deployment the app would than be reachable under www.visualgraphics.tv/apps/foobar_pro.

After Creating your application, Update will update the sources on the Server and Publish will make the application available at the given URL. Any changes you make to the application via Update will only be made public after a following Publish call.

Custom domains, www.foobarpro.com are currently under development and will be available in the next months.

##Desktop Deployment of your applications

There is no automatic deployment of your Visual Graphic applications to the Desktop yet. This will be added when the App Store opens later in 2015. Currently you will need to get the Visual Graphics runtime application for Mac, Windows or Linux and point it to your .vide project file. The project will than automatically run this application on startup.

The source code for the native Visual Graphics template application is in the sdl2_host/ directory. You can compile the source code yourself, see the README file, or download the binary for the runtime from the Downloads Page of www.visualgraphics.tv.

##Mobile Deployment of your applications

This is currently work in progress. The sdl2_host template does currently not yet compile on iOS and Android, we also do not yet have touch event support. However these can be added quickly, we just prioritize the core functionality of Visual Graphics over working out every platform at the moment.

##Documentation

Documentation for Visual Graphics is currently limited. The current API documentation is available on the Website and within V-IDE and is improved daily. 

Please have a look at the example applications in the examples folder.

##Contact

For questions and support, please eMail me at markusm@visualgraphics.tv.

