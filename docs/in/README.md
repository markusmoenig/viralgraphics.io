# About ViralGraphics.io

**ViralGraphics.io** is a new JavaScript / HTML5 application framework under the MIT license. It is specifically designed to enable Desktop like applications inside your browser and provides a wide range of widgets and layouts to generate complex and good looking user interfaces.

ViralGraphics.io utilizes both the 2D and 3D canvas to draw it's widgets in the best possible quality and speed. It also provides abstraction layers for commonly used WebGL classes, like shaders.

The first major application based on ViralGraphics.io is [PaintSupreme 3D](https://www.paintsupreme3d.com). It is available on the Web, as well as in native Windows, Mac and Linux versions. It is also available inside the Mac and Windows App Stores. Native versions are possible via inbuild support of [Electron](https://electron.atom.io/).

ViralGraphics.io is actively developed and maintained by Markus Moenig. The source is hosted on [GitHub](https://github.com/markusmoenig/viralgraphics.io). **Note that ViralGraphics.io was previously named VisualGraphics.tv, some links and names in the documentation may still refer to the old name.**

![Spaceship Screenshot](https://s3-us-west-2.amazonaws.com/braindistrict/Spaceship.jpg "PaintSupreme 3D Screenshot")

## Developing for ViralGraphics.io

Makefiles of ViralGraphics.io applications (they end with .vg) can be compiled into project files (.vide) using the node module viralgraphics.io. viralgraphics.io also allows the creation and publishing of applications to the Web.

Note that viralgraphics.io only compiles .vg files, it does not (yet) create ready to use default projects for ViralGraphics.io applications. You currently have to do this youself using the examples supplied in the [ViralGraphics.io Git](https://github.com/markusmoenig/viralgraphics.io).

Fore more information please check the viralgraphics.io [nodejs module](https://www.npmjs.com/package/viralgraphics.io).

## Namespaces

All ViralGraphics.io functionality is implemented inside the {@link VG} namespace. This namespace contains a list of classes and sub-namespaces, here is a short overview of the most important namespaces and classes.

* At the very core is the WebGL abstraction layer which consists of the following classes: {@link VG.Shader}, {@link VG.GPUBuffer}, {@link VG.RenderTarget}, {@link VG.Texture}. These classes draw all visual information inside an application to the screen.
* {@link VG.Core} consists of core classes which are used in the UI system of ViralGraphics.io, like classes for {@link VG.Core.Point|Points}, {@link VG.Core.Rect|Rectangles} and {@link VG.Core.Image|Images} and so forth.
* {@link VG.UI} contains all Widget and Layout classes used by ViralGraphics.io, including the {@link VG.UI.Workspace|Workspace} class which manages the display space of an ViralGraphics.io application.
* {@link VG.Render} contains all classes handling visual realtime objects, like {@link VG.Render.Mesh|meshes} and the render {@link VG.Render.Pipeline|pipeline}.
* {@link VG.context} is the context namespace an application is running in and the _this_ of vgMain().

## Structure of an ViralGraphics.io application

Every ViralGraphics.io application has to have a global vgMain() function which is the main entry point. A short example of an _Hello World_ example:

```javascript
function vgMain( workspace, argc, arg )
{
    let label = {@link VG.UI.Label}( "Hello World!");
    label.horizontalExpanding = true; // Center it horizontally

    workspace.content = new VG.UI.Layout( label );
};
```

The content property of the {@link VG.UI.Workspace|workspace} parameter has to be set to the main widget or top layout used by the application.

You can see the _Hello World_ application in action <a href="http://visualgraphics.tv/apps/helloworld">here</a>. For more UI examples see the tutorials.

## Available Tutorials

* {@tutorial Data Model}. An introduction to the Data Model of ViralGraphics.io. Important for every developer who wants to write UI driven applications with undo and redo support.
* {@tutorial Widget Basics}. How the Widget class works.
* {@tutorial Layouts}. The available layouts in ViralGraphics.io.
* Introduction to the {@tutorial Workspace}.

More to come.

## Examples

The examples supplied in the examples folder demonstrate various aspects of ViralGraphics.io:

* The UI system and data model: AddressBook
* The Render system: MTL-Demo and GameSample
* Custom shaders: ShaderTunnel

## Support

Please ask questions or report bugs in our official support <a href="http://forum.braindistrict.com">forum</a>.