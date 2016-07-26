One of the core Visual Graphics features is an easy to use data model which allows you to bind values, inside a model, to widgets, and which supports automatic load / save and undo / redo.

<p>All widgets in Visual Graphics which use a singular value (like an image) can either be used directly, i.e. you supply a value to the widget, or the widgets can be bound to a path inside your data model and the widget will automatically update itself if this value has been changed.</p>

<p>All widgets which use multiple input values, like a list widget, only support usage with the data model.</p>

<h3>Data Collection</h3>

<p>A data collection is the fundamental object which holds values which can be bound to widgets. An application can have multiple data collections, you can create a data collection like this.</p>

```
var dc=VG.Data.Collection( "MainData" );
```

<p>If you want to use this data collection automatically for loading and saving your application data and for undo and redo, you need to register it to the {@link VG.UI.Workspace|workspace}.</p>

```
workspace.registerDataCollection( dc, VG.UI.DataCollectionRole.LoadSaveRole | VG.UI.DataCollectionRole.UndoRedoRole );
```

<p>The {@link VG.UI.Workspace|workspace} object is passed as a first argument to your vgMain() function, your main entry point for every Visual Graphics application.</p>

<h3>Using Paths inside a Data Collection</h3>

<p>You can assign values to your data collection by just assigning them to the properties of the data collection. For example we want to create a list widget and list widgets hold their data in an array, so we create a property like this:<p>

```
dc.items=[];
```

<p>"items" is called the <i>path</i> to the value. Paths can be nested, for example a path of "items.image" would point to the image property of the currently selected object in items.</p>

<h3>Binding your Widgets</h3>

<p>You can use the bind() function of every widget to bind it to a path inside your data collection, let's have a look at an example. Imagine you want to create a database of your contacts and each contact should have an image associated with it. You would do something like:</p>

```
var dc=VG.Data.Collection( "MainData" );
dc.contacts=[];

var listWidget=VG.UI.ListWidget();
var controller=listWidget.bind( dc, "contacts" );

var imageView=VG.UI.Image();
imageView.bind( dc, "contacts.image" );
```

<h3>Controllers</h3>

<p>As you can see, the {@link VG.UI.ListWidget} returns an controller object when you bind it to "contaccts". As the list widget handles multiple items, it needs to have a controller, in the case of the list widget it will be a {@link VG.Controller.Array} controller. Controllers are needed if you want to add, remove or otherwise change the objects managed by the controller. For example to add an object to contacts:</p>

```
Contact=function()
{    
    this.image=null;
};

controller.add( new Contact() );

```

<p>It is good practise to create default values for every value you use inside an object, like in this case the image property. You can also indicate to the controller which class to create on add() operations. The following code adds a new contact when a button is pressed.</p>

```
controller.contentClassName="Contact";

var addButton=VG.UI.ToolButton( "Add" );
addButton.clicked=function() {
    var item=controller.add();// new Contact() );
    controller.selected=item;
}.bind( this );
```

<p>This code creates a new tool button, when the tool button is clicked it creates a new contact. As we supplied the <i>contentClassName</i> property to the controller, we did not need to supply a class object, the controller will add it automatically.</p>

<p>Controllers of course support more functionality than only adding items, like inserting and removing items. Please have look at the API reference of your controller.<p>

<p>You can also add observers to a controller, these observers will notify you when specific actions occur inside the controller, like when the selection has changed:</p>

```
controller.addObserver( "selectionChanged", function {
    var selected=constroller.selected;
    var selection=controller.selection; 
    console.log( "The new current object of the selection is", selected );
} );
```    

<h3>Tree Controller</h3>

<p>The tree controller handles hierarchical trees of objects and is used for example by {@link VG.UI.TreeWidget|tree widgets}. A short example:</p>

```
var dc=VG.Data.Collection( "MainData" );
dc.items=[];

var treeWidget=VG.UI.TreeWidget();
var controller=treeWidget.bind( dc, "items" );

controller.addObserver( "selectionChanged", function() {
    var item=this.controller.selected;
    VG.log( "Selected \"" + item.text + "\" at index " + this.controller.indexOf( item ) );
}.bind( this ) );

function folder( text, open, selectable ) {
    this.text=text;
    this.children=[];
    this.open=open;
    this.selectable=selectable;
}

function item( text, folder, open ) {
    this.text=text;
}

controller.add( "", new folder( "Folder #1", true ) );
controller.add( "0", new item( "First Item" ) );
controller.add( "0", new folder( "Selectable Subfolder", false, true ) );
controller.add( "0.1", new item( "Second Item" ) );
controller.add( "", new item( "Third Item" ) );
```

<p>Note that the add() function of the controller takes an addition argument, the fully qualified string index of the path to add the item to where "" indicates the root level of the hierachy.</p>

<h3>Summary</h3>

<p>The data model of Visual Graphics allows your application to bind widgets to a light-weight data model, providing a powerful and flexible way to add automatic project based load/save as well as automated undo/redo functionality to your applicatoon.</p>

<p>Please have a look at the supplied addressbook example application for further example code.</p>