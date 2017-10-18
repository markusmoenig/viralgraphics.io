<p>Widgets are the basic building blocks of every User Interface, in Visual Graphics everything is based on Widgets, even if you write a Game and just use one big OpenGL display it is based on a Widget (VG.UI.RenderWidget).</p>

<p>Let's try to write a simple Widget:</p>

```
CircleWidget=function()
{
    VG.UI.Widget.call( this );
 
    this.supportsFocus=false;
    this.color=VG.Core.Color();
};

CircleWidget.prototype=VG.UI.Widget();

CircleWidget.prototype.paintWidget=function( canvas )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.rect, this.color );	
};

function vgMain( workspace, argc, arg )
{
	workspace.content=new CircleWidget();
};
```

<p>Here we create a new Widget called CircleWidget. Every Widget has to derive from  <i>VG.UI.Widget</i> which is the base class of every Widget inside Visual Graphics. This tutorial assumes that you are familiar with JavaScript.</p>

<p>In the constructor of CircleWidget we define the color the Circle should be drawn in, by default black. We also indicate by setting <i>supportsFocus</i> to false that we do not want to receive mouse or keyboard events for this Widget. Next, inside <i>paintWidget</i> we paint the actual circle. This uses the canvas class, a 2D helper class which is always passed to <i>paintWidget</i> as well as the current rectangle of the Widget.</p>

<p>The rect(angle) object inside each Widget is a <i>VG.Core.Rectangle</i> class which gets set to the current dimensions of the Widget prior to each <i>paintWidget</i> call. 0,0 is the upper left corner of the Workspace.</p>

<h1>Mouse Events</h1>

<p>To receive mouse input for your Widget simply implement any of these functions: mouseDown, mouseUp, mouseMove, mouseDoubleClick. Here is a new version of the CircleWidget which changes the color of the widget on each mouse down event and also displays the mouse position:</p>

```
CircleWidget=function()
{
    VG.UI.Widget.call( this );

    this.supportsFocus=true;
    this.supportsAutoFocus=true;
    this.color=VG.Core.Color();
};

CircleWidget.prototype=VG.UI.Widget();

CircleWidget.prototype.mouseMove=function( event )
{
    VG.context.workspace.statusBar.message( (event.pos.x - this.rect.x) + ", " + (event.pos.y - this.rect.y) );
};

CircleWidget.prototype.mouseDown=function( event )
{
    this.color.r=Math.random(); this.color.g=Math.random(); this.color.b=Math.random();
    VG.update();
};

CircleWidget.prototype.paintWidget=function( canvas )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.rect, this.color );	
};

function vgMain( workspace, argc, arg )
{
	workspace.statusBar=new VG.UI.StatusBar();
    workspace.content=new CircleWidget();
};
```

<p>This example introduces quite a few new concepts:</p>

<ul>
<li>In the constructor of the CircleWidget we do now set the <i>supportsFocus</i> property to true. This tell Visual Graphics that the Widget will receive user input events when it has focus. A widget has focus when it is selected (clicked) by the user with the left mouse button. Here we actually go one step further and also set the <i>supportsAutoFocus</i> flag to true which will give the Widget focus whenever the mouse is over the Widget (the user does not need to click the Widget to set the focus).</li>	
<li>In the mouseDown event we set the r,g,b parameters of the color to a random value and call <i>VG.update()</i> which tells Visual Graphics to redraw the Applications UI.</li>
<li>in vgMain we create a new statusbar and assign it to the workspace. In mouseMove we call the message() function of VG.UI.StatusBar to display the mouse coordinates.</li>
<li>In mouseMove we retrieve the workspace using <i>VG.context.workspace</i>, VG.context is the application context of which workspace is a member. VG.context is the <i>this</i> object for vgMain.</li>
<li>In mouseMove we calculate the relative mouse coordinates of the Widget. The coordinates passed to a Widget are always the absolute coordinates of the Workspace, to calculate the relative mouse coordinates we therefore have to subtract the x and y values of this.rect (which contains the coordinates of the Widget inside the Workspace).</li>
</ul>

<h3>A Real Circle</h3>

<p>Up to now we talked about a CircleWidget, but we are actually painting an oval. Let's change that by adjusting the paintWidget member function:</p>

```
CircleWidget=function()
{
    VG.UI.Widget.call( this );

    this.supportsFocus=true;
    this.supportsAutoFocus=true;
    this.color=VG.Core.Color();
};

CircleWidget.prototype=VG.UI.Widget();

CircleWidget.prototype.mouseMove=function( event )
{
    VG.context.workspace.statusBar.message( (event.pos.x - this.rect.x) + ", " + (event.pos.y - this.rect.y) );
};

CircleWidget.prototype.mouseDown=function( event )
{
    this.color.r=Math.random(); this.color.g=Math.random(); this.color.b=Math.random();
    VG.update();
};

CircleWidget.prototype.paintWidget=function( canvas )
{
    this.contentRect.copy( this.rect );
    this.contentRect.width=this.rect.height;
    this.contentRect.x=(this.rect.width - this.rect.height)/2;
    canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.contentRect, this.color );	
};

function vgMain( workspace, argc, arg )
{
	workspace.statusBar=new VG.UI.StatusBar();
    workspace.content=new CircleWidget();
};
```

<p>We now make sure that we pass a square rectangle to the paint function and center it horizontally. To do this we use the contentRect property of the Widget, this property is a general helper <i>VG.Core.Rectangle</i> object for the Widget and not used by Visual Graphics itself.</p>

<h3>Key Events</h3>

<p>For keyboard events, Visual Graphics provides Widgets with 3 functions it can implement: keyDown, keyUp and textInput. keyDown and keyUp receive a keycode of the key which was pressed or released as well as an array of the keycodes of all keys which are currently pressed. textInput is easier and just receives a string of the pressed button (or buttons). This example displays the last button the user pressed:</p>

```
TextInputWidget=function()
{
    VG.UI.Widget.call( this );

    this.supportsFocus=true;
    this.lastKey="";
};

TextInputWidget.prototype=VG.UI.Widget();

TextInputWidget.prototype.textInput=function( text )
{
    this.lastKey=text;
    VG.update();
};

TextInputWidget.prototype.paintWidget=function( canvas )
{
    canvas.drawTextRect( this.lastKey, this.rect, VG.Core.Color(), 1, 1 );	
};

function vgMain( workspace, argc, arg )
{
    workspace.content=new TextInputWidget();
};
```

<p>We only set the supportsFocus property for the TextInputWidget, so make sure to click on the Widget first to see the key!</p>
