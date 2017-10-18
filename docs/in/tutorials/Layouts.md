Every Application needs a Layout. Visual Graphics offers several different Layouts which we will introduce here, also Widgets have several properties which define their behavior in a Layout.

<h3>VG.UI.Layout</h3>

<p>This is the most common layout, it displays its child widgets in either a horizontal (default) or vertical row. Let's have a look at an easy example, here we create three instances of a RectangleWidget, a very simple widget which just paints its rectangle black, and add them into an horizontal layout:</p>

```
function vgMain( workspace, argc, arg )
{
    var RectangleWidget=function() { VG.UI.Widget.call( this ); };
    RectangleWidget.prototype=VG.UI.Widget();
    RectangleWidget.prototype.paintWidget=function( canvas ) { canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, VG.Core.Color() ); };

    workspace.content=new VG.UI.Layout( new RectangleWidget, new RectangleWidget, new RectangleWidget );
};
```

<p>After starting this example you will see three large rectangles, the widgets, separated by grey areas, around the layout itself (this is the margin of the Layout) and between the widgets, this is the spacing of the Layout.</p>

<p>The margin of a Layout is specified by an <i>VG.Core.Margin</i> class inside the <i>margin</i> property of the Layout. The margin class defines the left, top, right and bottom margin of the Layout. The spacing between Widgets is a defined by the <i>spacing</i> property of the Layout. If we clear the margin and set the spacing to 0, we will only see one big black area, i.e. the three rectangles:</p>

```
function vgMain( workspace, argc, arg )
{
    var RectangleWidget=function() { VG.UI.Widget.call( this ); };
    RectangleWidget.prototype=VG.UI.Widget();
    RectangleWidget.prototype.paintWidget=function( canvas ) { canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, VG.Core.Color() ); };

    workspace.content=new VG.UI.Layout( new RectangleWidget, new RectangleWidget, new RectangleWidget );
    workspace.content.margin.clear(); workspace.content.spacing=0;
};

```

<p>We use the <i>clear</i> member function of the Layout to set all 4 properties of the margin (left, top, right, bottom) to 0, play around with the margin and spacing values and examine how that changes the characteristics of the Layout.</p>

<p>The size of a Widget inside a Layout can be controlled by the minimumSize, maximumSize and preferredSize properties of a Widget. These are <i>VG.Core.Size</i> based objects which have width and height properties. Default values are 0 for the minimum sizes and 32768 for the maximum sizes and 100 for the preferred sizes. The preferred size gives the Layout an idea which size is best suited for the Widget. Let's try to reduce the width of the widgets by setting it's maximum width to 40 in the constructor:</p>

```
function vgMain( workspace, argc, arg )
{
    var RectangleWidget=function() { VG.UI.Widget.call( this ); this.maximumSize.width=40; };
    RectangleWidget.prototype=VG.UI.Widget();
    RectangleWidget.prototype.paintWidget=function( canvas ) { canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, VG.Core.Color() ); };

    workspace.content=new VG.UI.Layout( new RectangleWidget, new RectangleWidget, new RectangleWidget );
};
```

<p>Additionally to setting the minimum, maximum and preferred sizes, Widgets also support two properties called <i>horizontalExpanding</i> and <i>verticalExpanding</i> which indicate to the Layout if a Widget should expand horizontally and vertically at all, the default values for these properties are true. If you remember the 'Hello World' example from the vgMain section, we had to set the <i>horizontalExpanding</i> property of the Label to true, as the default behaviour of the label is to have a fixed, minimum size horizontally (otherwise the Label would expand which would add a lot of empty space to it's left and right, not a desired behavior in a toolbar for example).</p>

<p>By default Layouts (except an VG.UI.LabelLayout which is always vertical) are horizontal, you can switch a Layout to be vertical by setting it's <i>vertical</i> property to true.</p>

<h3>VG.UI.SplitLayout</h3>

<p>Split Layouts split the available space into resizable areas. You can define the initial percentage each Widget occupies when you add the Widget to the Layout, just make sure the percentages sum up to 100 percent. Here is an example which adds 3 RectangleWidgets to a SplitLayout and the middle widget takes 3 times as much space as the other two Widgets. You can resize the Widgets by the handle in the middle. Normally you set a minimum size to the Widgets to make sure the resize operations stay inside a valid range for the Widget, here we set the minimum size for the Widgets to 20:</p>

```
function vgMain( workspace, argc, arg )    
{
    var RectangleWidget=function() { VG.UI.Widget.call( this ); this.minimumSize.width=20; };
    RectangleWidget.prototype=VG.UI.Widget();
    RectangleWidget.prototype.paintWidget=function( canvas ) { canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, VG.Core.Color() ); };

    workspace.content=new VG.UI.SplitLayout( new RectangleWidget, 20, new RectangleWidget, 60, new RectangleWidget, 20 );
};
```

<p>Up to now we always added Widgets to a Layout using the Layout's constructor, you could however also use it's <i>addChild( widget )</i> member function to add a child, <i>removeChild( widget )</i> to remove a child and <i>insertChild( index, widget )</i> to insert a Widget at a given index into the Layout.</p>

<p>You can make a Widget invisible in a Layout by setting it's <i>visible</i> property to false. This will free up the space of the Widget inside the Layout until you set this property to true again.</p>

<p>We only talk about Widgets here to keep things simple, but of course you can also add a Layout into another Layout, allowing for complex User Interfaces.</p>

<h3>VG.UI.LabelLayout</h3>

<p>A Label Layout is always vertical and displays a label before each child widget. Here is an easy example:</p> 

```
function vgMain( workspace, argc, arg )
{
    var RectangleWidget=function( color ) { VG.UI.Widget.call( this ); this.maximumSize.width=200; this.color=color; };
    RectangleWidget.prototype=VG.UI.Widget();
    RectangleWidget.prototype.paintWidget=function( canvas ) { canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, this.color ); };

    workspace.content=new VG.UI.LabelLayout();
    workspace.content.addChild( "Red", new RectangleWidget( VG.Core.Color( 255, 0, 0 ) ) );
    workspace.content.addChild( "Green", new RectangleWidget( VG.Core.Color( 0, 255, 0 ) ) );
};
```

<p>We did set the maximum width of the Rectangles to 200 to prevent them for being too wide.</p>

<h3>VG.UI.StackedLayout</h3>

<p>The last Layout we want to discuss here is a stacked layout, it behaves a bit different than other Layout's inside Visual Graphics, it only displays the <i>current</i> child and ignores all of it's other children. This is best explained by an example. Here we create a <i>VG.UI.DropDownMenu</i> (to be properly introduced in the UI Widgets section later on) with two items, changing the selection of the drop down menu will change the widget being displayed.</p> 

```
function vgMain( workspace, argc, arg )
{
    var RectangleWidget=function( color ) { VG.UI.Widget.call( this ); this.setFixedSize( 100, 100 ); this.color=color; };
    RectangleWidget.prototype=VG.UI.Widget();
    RectangleWidget.prototype.paintWidget=function( canvas ) { canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, this.color ); };

    var stackedLayout=new VG.UI.StackedLayout( new RectangleWidget( VG.Core.Color( 255, 0, 0 ) ), new RectangleWidget( VG.Core.Color( 0, 255, 0 ) ) );
    var dropDownMenu=new VG.UI.DropDownMenu( "Red", "Green" );
    dropDownMenu.changed=function( index ) { stackedLayout.current=stackedLayout.childAt( index ); }

    workspace.content=new VG.UI.LabelLayout( "Type", dropDownMenu, "", stackedLayout );
};
```

<p>Here we also call <i>setFixedSize( width, height )</i> on the rectangles, this convenience function sets the minimum, maximum and preferred sizes to the given size and disables horizontal and vertical expansion. Note how the displayed rectangle does not expand but stays fixed at 100, 100</p>

