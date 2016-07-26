_Warning, this documentation is not yet complete and considered work in progress._

<h3>Namespaces</h3>

All Visual Graphics functionality is implemented inside the {@link VG} namespace. This namespace contains a list of classes and sub-namespaces, here is a short overview of the most important namespaces and classes.

* At the very core is the WebGL abstraction layer which consists of the following classes: ... . These classes draw all visual information inside an application to the screen.
* {@link VG.Core} consists of core classes which are used in the UI system of Visual Graphics, like classes for {@link VG.Core.Point|Points}, {@link VG.Core.Rect|Rectangles} and {@link VG.Core.Image|Images} and so forth.
* {@link VG.UI} contains all Widget and Layout classes used by Visual Graphics, including the {@link VG.UI.Workspace|Workspace} class which manages the display space of an Visual Graphics application.
* {@link VG.Render} contains all classes handling visual realtime objects, like {@link VG.Render.Mesh|meshes} and the render {@link VG.Render.Pipeline|pipeline}.
* {@link VG.context} is the context namespace an application is running in and the _this_ of vgMain().

<h3>Structure of an Visual Graphics application</h3>

Every Visual Graphics application has to have a global vgMain() function which is the main entry point. A short example of an _Hello World_ example:

```
function vgMain( workspace, argc, arg )
{
    var label={@link VG.UI.Label}( "Hello World!");
    label.horizontalExpanding=true; // Center it horizontally

    workspace.content=VG.UI.Layout( label );
};
```

The content property of the {@link VG.UI.Workspace|workspace} parameter has to be set to the main widget or top layout used by the application.

You can see the _Hello World_ application in action <a href="http://visualgraphics.tv/apps/helloworld">here</a>. For more UI examples see the tutorials.

<h4>Low-level WebGL / OpenGL Support</h4>

The {@link VG.UI.RenderWidget} class is used to visualize realtime graphics and can be embedded in any layout inside Visual Graphics (like any other UI class). {@link VG.UI.RenderWidget} can use the material system and mesh classes inside the {@link VG.Render} namespace or it can create its own low-level shaders, as demonstrated by the shadertunnel example which can be seen live <a href="http://visualgraphics.tv/apps/shadertunnel">here</a>.

<h3>Available Tutorials</h3>

* {@tutorial Data Model}. An introduction to the Data Model of Visual Graphics. Important for every developer who wants to write UI driven applications with undo and redo support.
* {@tutorial Widget Basics}. How the Widget class works.
* {@tutorial Layouts}. The available layouts in Visual Graphics.
* Introduction to the {@tutorial Workspace}.

More to come.

<h3>Examples</h3>

The examples supplied in the examples folder demonstrate various aspects of Visual Graphics:

* The UI system and data model: AddressBook and CornellBox
* The Render system: MTL-Demo and GameSample
* Custom shaders: ShaderTunnel

The CornellBox example even demonstrates the integrated raytracer (WiP).

<h3>Support</h3>

Please ask questions or report bugs in our official <a href="http://visualgraphics.freeforums.net">forum</a>.