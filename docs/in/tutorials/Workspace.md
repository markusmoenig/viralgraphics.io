<p>So far we only used the content property of the Workspace object to register our main Layout or Widget to the Visual Graphics subsystem. However there are many more functionalities provided by the Workspace Object</p>

<h3>Dock Widgets</h3>

<p>Dock widgets can be attached to one of the sides of the Workspace. There are two different types of Dock Widgets, the classical Dock Widget itself and a SectionBar for displaying a list of Buttons. Let's take a look at an example:</p>

```
function vgMain( workspace, argc, arg )
{
    var dockWidget=VG.UI.DockWidget( "Text Edit" );
    dockWidget.addItem( VG.UI.TextEdit() );

    workspace.addDockWidget( dockWidget, VG.UI.DockWidgetLocation.Right );
    workspace.content=new VG.UI.Widget();
};
```

<p>This example adds a Dock Widget called "Text Edit" to the right of the Workspace, the Dock Widget only contains one item, a VG.UI.TextEdit, you can of course add many more items to the Dock Widget. Let's add a SectionBar to this example:</p>

```
function vgMain( workspace, argc, arg )
{
    var dockWidget=VG.UI.DockWidget( "TextEdit" );
    dockWidget.addItem( VG.UI.TextEdit() );

    var sectionBar=VG.UI.SectionBar("Buttons");
    sectionBar.addButton( "Button 1" );
    sectionBar.addButton( "Button 2" );

    workspace.addDockWidget( sectionBar, VG.UI.DockWidgetLocation.Left );
    workspace.addDockWidget( dockWidget, VG.UI.DockWidgetLocation.Right );
    workspace.content=new VG.UI.Widget();
};
```

<p>Note that you can resize a normal Dock Widget, but a Section Bar always has a fixed size.</p>

<h3>ToolBars</h3>

<p>Visual Graphics supports two different types of toolbars. The main one is called VG.UI.DecoratedToolBar. Although it's usage is optional, it is recommended that you use it for UI driven applications as it adds a QuickMenu to the application (which is discussed below) and adds default buttons for the Visual Graphics Data Model:</p>

```
function vgMain( workspace, argc, arg )
{
    workspace.createDecoratedToolBar();
    this.testQMI=workspace.addQuickMenuItem( "Test", function() { VG.log( "Test Button Clicked" ); }.bind( this ) );

    workspace.content=new VG.UI.Widget();
};
```

<p>We create a DecoratedToolBar and add an Item to it's Quick Menu. The Quick Menu is an integral part of the DecoratedToolBar, it's usage is recommended as it provides a good way to unify toolbar behavior between Desktop and Mobile applications.</p>

<p>Now we add a normal ToolBar to the this example. The VG.UI.ToolBar classes provides a toolbar where a Visual Graphics application can put it's application specific buttons.</p>

```
function vgMain( workspace, argc, arg )
{
    workspace.createDecoratedToolBar();
    this.testQMI=workspace.addQuickMenuItem( "Test", function() { VG.log( "Test Button Clicked" ); }.bind( this ) );

    var toolBar=VG.UI.ToolBar(); workspace.addToolBar( toolBar );
    toolBar.addItem( VG.UI.ToolButton( "Test Button") );

    workspace.content=new VG.UI.Widget();
};
```

<p>You can add any kind of Widget to the toolbar, like ToolButtons, DropDownMenus, ToolSeparators, Labels and you can even have several of them.</p>

<h3>Menus</h3>

<p>Visual Graphics also supports plain, old fashioned menus. However, don't add any functionality to them which the user needs to access on every platform, as they are ignored on mobile platforms. Use the QuickMenu inside a DecoratedToolBar and ToolBars for functionality which are critical. However, menus can have their merits, for example on Desktops like Mac OS X, Visual Graphics menus are mapped into native Menus and therefore are actually not drawn by Visual Graphics itself but by the operating system. Here is an example of a MenuBar with an Menu and several items:</p>

```
function vgMain( workspace, argc, arg )
{
	var menuBar=VG.UI.MenuBar();
	workspace.addMenuBar( menuBar );

    var testMenu=menuBar.addMenu( "Test" );

    var menuItem1=new VG.UI.MenuItem( "Test Item #1", null, function() { VG.log( "Menu Item #1 Clicked" ); }.bind( this ) );
    var menuItem2=new VG.UI.MenuItem( "Test Item #2", null, function() { VG.log( "Menu Item #2 Clicked" ); }.bind( this ) );
    var menuItem3=new VG.UI.MenuItem( "Test Item #3", null, function() { VG.log( "Menu Item #3 Clicked" ); }.bind( this ) );

    testMenu.addMenuItem( menuItem1 ); testMenu.addMenuItem( menuItem2 );
    testMenu.addSeparator();
    testMenu.addMenuItem( menuItem3 );

    workspace.content=new VG.UI.Widget();
};
```
