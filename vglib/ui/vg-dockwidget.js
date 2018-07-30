/*
 * Copyright (c) 2014-2018 Markus Moenig <markusm@visualgraphics.tv> and Contributors
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**Creates an VG.UI.DockWidget.<br>
 * Dock widgets can be added to the left or right side of an {@link VG.UI.Workspace} and can contain a list of vertically stacked Widgets or Layouts. Dock Widgets can be resized. Use
 * addItem() and addItems() to add items to the Dock widget.
 * @param {string} title - The title of the Dock Widget.
 * @constructor
 */

VG.UI.DockWidget=function( text )
{
    if ( !(this instanceof VG.UI.DockWidget) ) return new VG.UI.DockWidget( text );

    VG.UI.Widget.call( this );
    this.name="DockWidget";
    this.text=text === undefined ? "" : text;

    this.layout=VG.UI.Layout();
    this.layout.vertical=true;
    this.layout.margin.set( 0, 0, 0, 0 );
    this.layout.spacing=0;
    this.supportsFocus=true;

    this.dragOpStart=VG.Core.Point();
    this.dragOpPos=VG.Core.Point();

    this.dragOp=false;
};

VG.UI.DockWidget.prototype=VG.UI.Widget();

VG.UI.DockWidget.prototype.mouseMove=function( event )
{
    if ( !this.dragOp ) return;

    this.dragOpMoved=true;

    if ( this.location < VG.UI.DockWidgetLocation.Floating )
    {
        var offset=Math.abs( event.pos.x - this.dragOpStart.x );

        if ( offset > 10 ) {
            VG.context.workspace.detachDockWidget( this );
            VG.update();
        }
    } else
    {
        var offsetX=event.pos.x - this.dragOpStart.x;
        var offsetY=event.pos.y - this.dragOpStart.y;

        this.rect.x=this.dragOpPos.x + offsetX;
        this.rect.y=this.dragOpPos.y + offsetY;
        VG.update();
    }
};

VG.UI.DockWidget.prototype.mouseDown=function( event )
{
    if ( event.pos.y >= this.rect.y && event.pos.y <= ( this.rect.y + VG.UI.stylePool.current.skin.DockWidget.HeaderHeight ) )
    {
        this.dragOp=true;
        this.dragOpMoved=false;
        this.dragOpStart.set( event.pos );
        this.dragOpPos.x=this.rect.x;
        this.dragOpPos.y=this.rect.y;

        VG.context.workspace.mouseTrackerWidget=this;
        VG.update();
    }
};

VG.UI.DockWidget.prototype.mouseUp=function( event )
{
    VG.context.workspace.mouseTrackerWidget=0;

    if ( this.dragOp && this.dragOpMoved && this.location === VG.UI.DockWidgetLocation.Floating ) {
        VG.context.workspace.possiblyAttachDockWidget( this );
    }

    this.dragOp=false;
    VG.update();
};

VG.UI.DockWidget.prototype.mouseDoubleClick=function( event )
{
    this.dragOp=false;

    if ( this.rect.contains( event.pos ) )
    {
/*
        if ( this.location < VG.UI.DockWidgetLocation.Floating )
        {
            this.rect.x+=10;
            this.rect.y+=10;
            VG.context.workspace.detachDockWidget( this );
        } else
        {
            VG.context.workspace.possiblyAttachDockWidget( this, true );
        }
*/
    }
};

VG.UI.DockWidget.prototype.calcSize=function( canvas )
{
    var size=this.layout.calcSize( canvas );
    this.minimumSize.set( this.layout.minimumSize );
    return size;
};

/**Adds an item, either a Widget or a Layout, to the Dock widget.
 * @param {widget} widget - Widget or layout to add
 */

VG.UI.DockWidget.prototype.addItem=function( item )
{
    this.layout.addChild( item );
};

/**Adds a list of items, either a Widget or a Layout, to the Dock widget.
 * @param {widget} widgets - Widget or layout to add
 * @param {widget} ...
 */

VG.UI.DockWidget.prototype.addItems=function( item )
{
    for( var i=0; i < arguments.length; ++i )
        this.layout.addChild( arguments[i] );
};

/**Adds an item, either a Widget or a Layout, to the Dock widget.
 * @param {widget} widget - Widget or layout to add
 */

VG.UI.DockWidget.prototype.addChild=function( item )
{
    this.layout.addChild( item );
};

/**Adds a list of items, either a Widget or a Layout, to the Dock widget.
 * @param {widget} widgets - Widget or layout to add
 * @param {widget} ...
 */

VG.UI.DockWidget.prototype.addChildren=function( item )
{
    for( var i=0; i < arguments.length; ++i )
        this.layout.addChild( arguments[i] );
};

VG.UI.DockWidget.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawDockWidget( this, canvas );

    this.layout.rect.set( this.contentRect );
    this.layout.layout( canvas );

    this.minimumSize.set( this.layout.minimumSize );
};

/**Creates a VG.UI.SectionBar.<br>
 * SectionBars can be added to the left or right side of an {@link VG.UI.Workspace} and can contain a list of vertically stacked VG.UI.SectionBarButtons. SectionBars cannot be resized. Use
 * addItem() and addItems() to add items to the SectionBar.
 * @constructor
 */

VG.UI.SectionBar=function( text )
{
    if ( !(this instanceof VG.UI.SectionBar) ) return new VG.UI.SectionBar( text );

    VG.UI.DockWidget.call( this );
    this.name="SectionBar";

    this.text=text ? text : "";

    this.layout.margin.set( 9, 7, 9, 9 );
    this.layout.spacing=6;

    this.horizontalExpanding=false;
    this.verticalExpanding=true;

    this.activeButton=null;
};

VG.UI.SectionBar.prototype=VG.UI.DockWidget();

VG.UI.SectionBar.prototype.calcSize=function( canvas )
{
    var size=this.layout.calcSize( canvas );
    this.minimumSize.width=size.width;
    this.maximumSize.width=size.width;
    return size;
};

VG.UI.SectionBar.prototype.mouseMove=function( event )
{
};

VG.UI.SectionBar.prototype.mouseDown=function( event )
{
};

VG.UI.SectionBar.prototype.mouseUp=function( event )
{
};

/**Adds an VG.UI.SectionBarButton to the SectionBar.
 * @param {VG.UI.SectionBarButton} button - Button to add to the SectionBar
 */

VG.UI.SectionBar.prototype.addItem=function( item )
{
    this.layout.addChild( item );

    if ( item instanceof VG.UI.SectionBarButton ) {
        item.stripCallback=this.stripButtonSelectionCallback.bind( this );
        item.stripWidget=this;
        if ( !this.activeButton ) this.activeButton=item;
    }
};

/**Adds a Button to the SectionBar.
 * @param {string} text - The text of the button to add.
 */

VG.UI.SectionBar.prototype.addButton=function( text )
{
    var button=VG.UI.SectionBarButton( text );
    this.addItem( button );
    return button;
};

/**Adds a SwitchButton to the SectionBar.
 * @param {string} text - The text of the button to add.
 */

VG.UI.SectionBar.prototype.addSwitch=function( text1, text2 )
{
    var switchButton=VG.UI.SectionBarSwitch( text1, text2 );
    this.addItem( switchButton );
    return switchButton;
};

/**Adds a separator to the SectionBar.
 * @param {string} text - The text of the button to add.
 */

VG.UI.SectionBar.prototype.addSeparator=function( text )
{
    var sep=VG.UI.SectionBarSeparator();
    this.addItem( sep );
    return sep;
};

/**Adds a list of items to the SectionBar.
 * @param {VG.UI.SectionBarButton} button - Button to add to the SectionBar
 * @param {VG.UI.SectionBarSeparator} ...
 */

VG.UI.SectionBar.prototype.addItems=function( item )
{
    for( var i=0; i < arguments.length; ++i )
        this.addItem( arguments[i] );
};

VG.UI.SectionBar.prototype.stripButtonSelectionCallback=function( button )
{
    for( var i=0; i < this.layout.children.length; ++i )
    {
        var widget=this.layout.children[i];

        if ( widget instanceof VG.UI.SectionBarButton )
        {
            if ( widget === button ) widget.selected=true;
            else widget.selected=false;
        }
    }

    if ( this.selectionChanged ) this.selectionChanged( button );
};

VG.UI.SectionBar.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawSectionBar( this, canvas );

    this.layout.rect.set( this.contentRect );
    this.layout.layout( canvas );
};

/**Creates an VG.UI.SectionBarButton.<br>
 * DockStripButtons can be added to VG.UI.SectionBars. They contain either text or images.
 * @param {string} text - The text of the button.
 * @constructor
 */

VG.UI.SectionBarButton=function( text )
{
    if ( !(this instanceof VG.UI.SectionBarButton) ) return new VG.UI.SectionBarButton( text );
    this.text=arguments[0];

    if ( text.indexOf( "\n" ) !== -1 )
    {
        this.textArray=text.split( "\n" );
    }

    VG.UI.Widget.call( this );
    this.name="SectionBarButton";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;

    this.minimumSize.width=VG.UI.stylePool.current.skin.SectionBarButton.Size.Width;
};

VG.UI.SectionBarButton.prototype=VG.UI.Widget();

VG.UI.SectionBarButton.prototype.calcSize=function( canvas )
{
    var size=this.preferredSize;

    size.width=VG.UI.stylePool.current.skin.SectionBarButton.Size.width;
    size.height=VG.UI.stylePool.current.skin.SectionBarButton.Size.height;

    this.minimumSize.width=size.width;
    this.minimumSize.height=size.height;

    return size;
};

VG.UI.SectionBarButton.prototype.mouseDown=function( event )
{
    this.mouseIsDown=true;

    //if ( this.stripCallback ) this.stripCallback( this );
    //if ( this.clicked ) this.clicked( this );
    this.stripWidget.activeButton=this;
};

VG.UI.SectionBarButton.prototype.mouseUp=function( event )
{
    this.mouseIsDown=false;
};

VG.UI.SectionBarButton.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawSectionBarButton( this, canvas );
};

// ----------------------------------------------------------------- VG.UI.SectionBarSwitch

VG.UI.SectionBarSwitch=function( text1, text2 )
{
    if ( !(this instanceof VG.UI.SectionBarSwitch) ) return new VG.UI.SectionBarSwitch( text1, text2 );
    this.text=arguments[0];

    VG.UI.Widget.call( this );
    this.name="SectionBarSwitch";

    this.text1=text1;
    this.text2=text2;

    this.horizontalExpanding=false;
    this.verticalExpanding=false;
    this.left=true;

    this.customClick=true;
    this.leftRect=VG.Core.Rect();
    this.rightRect=VG.Core.Rect();

    this.minimumSize.width=VG.UI.stylePool.current.skin.SectionBarSwitch.Size.Width;
};

VG.UI.SectionBarSwitch.prototype=VG.UI.Widget();

VG.UI.SectionBarSwitch.prototype.calcSize=function( canvas )
{
    var size=this.preferredSize;

    size.width=VG.UI.stylePool.current.skin.SectionBarSwitch.Size.width;
    size.height=VG.UI.stylePool.current.skin.SectionBarSwitch.Size.height;

    this.minimumSize.width=size.width;
    this.minimumSize.height=size.height;

    return size;
};

VG.UI.SectionBarSwitch.prototype.mouseDown=function( event )
{
    this.mouseIsDown=true;

    if ( this.leftRect.contains( event.pos ) )
        this.left=true;
    else
    if ( this.rightRect.contains( event.pos ) )
        this.left=false;
    else return;

    if ( this.clicked ) this.clicked( this.left );
    VG.update();
};

VG.UI.SectionBarSwitch.prototype.mouseUp=function( event )
{
    this.mouseIsDown=false;
};

VG.UI.SectionBarSwitch.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawSectionBarSwitch( this, canvas );
};


/**Creates an VG.UI.SectionBarSeparator.<br>
 * A SectionBarSeparator can be added to VG.UI.SectionBar and draws a horizontal separator line.
 * @constructor
 */

VG.UI.SectionBarSeparator=function()
{
    if ( !(this instanceof VG.UI.SectionBarSeparator )) return new VG.UI.SectionBarSeparator();

    VG.UI.Widget.call( this );
    this.name="SectionBarSeparator";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;
};

VG.UI.SectionBarSeparator.prototype=VG.UI.Widget();

VG.UI.SectionBarSeparator.prototype.calcSize=function()
{
    var size=VG.Core.Size( 81, VG.UI.stylePool.current.skin.SectionBar.Separator.Height );
    return size;
};

VG.UI.SectionBarSeparator.prototype.paintWidget=function( canvas )
{
    var size=this.calcSize();
    this.contentRect.set( this.rect );

    if ( VG.UI.stylePool.current.skin.SectionBar.Separator.Height === 1 ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( this.rect.x, this.rect.y, this.rect.width, 1 ), VG.UI.stylePool.current.skin.SectionBar.Separator.Color1 );
    } else
    {
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( this.rect.x, this.rect.y, this.rect.width, 1 ), VG.UI.stylePool.current.skin.SectionBar.Separator.Color1 );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( this.rect.x, this.rect.y+1, this.rect.width, 1 ), VG.UI.stylePool.current.skin.SectionBar.Separator.Color2 );
    }
};

/**Creates a VG.UI.SectionToolBar.<br>
 * SectionToolBars can be added to the left or right side of an {@link VG.UI.Workspace} and can contain a list of vertically stacked {@link VG.UI.SectionToolBarButton}s which are grouped into sections.
 * SectionToolBars cannot be resized.
 * @constructor
 */

VG.UI.SectionToolBar=function( text )
{
    if ( !(this instanceof VG.UI.SectionToolBar) ) return new VG.UI.SectionToolBar( text );

    VG.UI.DockWidget.call( this );
    this.name="SectionToolBar";

    this.text=text ? text : "";

    this.layout.margin.set( 9, 7, 9, 0 );
    // this.layout.margin.set( 0, 0, 0, 0 );
    this.layout.spacing=6;

    this.horizontalExpanding=false;
    this.verticalExpanding=true;

    this.activeButton=null;
    this.childWidgets=[];
};

VG.UI.SectionToolBar.prototype=VG.UI.DockWidget();

VG.UI.SectionToolBar.prototype.calcSize=function( canvas )
{
    var size=this.preferredSize;

    size.width = this.small ? 44 : 54;
    size.height=VG.UI.MaxLayoutSize;

    this.minimumSize.width = size.width;
    this.maximumSize.width = size.width;
    return size;
};

VG.UI.SectionToolBar.prototype.mouseMove=function( event )
{
};

VG.UI.SectionToolBar.prototype.mouseDown=function( event )
{
};

VG.UI.SectionToolBar.prototype.mouseUp=function( event )
{
};

/**Adds a new section to the to the SectionToolBar.
 * @param {string} text - The text of the section to add
 * @returns {VG.UI.Layout}
 */

VG.UI.SectionToolBar.prototype.addSection=function( text )
{
    var layout=VG.UI.Layout();
    layout.vertical=true;
    layout.margin.clear();
    layout.spacing=1;
    layout.text=text;

    this.layout.addChild( layout );
    return layout;
};

/**Adds an VG.UI.SectionToolBarButton to the given section.
 * @param {VG.UI.Layout} section - The section to add thew new button to.
 * @param {string} iconName - Name of the icon to add to the section.
 * @returns {VG.UI.SectionToolBarButton}
 */

VG.UI.SectionToolBar.prototype.addButton=function( section, iconName )
{
    var button=VG.UI.SectionToolBarButton( iconName );
    button.small = this.small;
    section.addChild( button );

    if ( button instanceof VG.UI.SectionToolBarButton ) {
        button.sectionBarCallback=this.buttonSelectionCallback.bind( this );
        button.sectionBarWidget=this;
        if ( !this.activeButton ) this.activeButton=button;
    }

    this.childWidgets.push( button );

    return button;
};

/**Adds an VG.UI.SectionToolBarButton to the given section.
 * @param {VG.UI.Layout} section - The section to add thew new button to.
 * @param {string} group - Name of the svg group.
 * @param {string} name- Name of the svg.
 * @returns {VG.UI.SectionToolBarButton}
 */

VG.UI.SectionToolBar.prototype.addSVGButton=function( section, group, name )
{
    var button=VG.UI.SectionToolBarButton( group, name );
    button.small = this.small;
    section.addChild( button );

    if ( button instanceof VG.UI.SectionToolBarButton ) {
        button.sectionBarCallback=this.buttonSelectionCallback.bind( this );
        button.sectionBarWidget=this;
        if ( !this.activeButton ) this.activeButton=button;
    }

    this.childWidgets.push( button );

    return button;
};

VG.UI.SectionToolBar.prototype.buttonSelectionCallback=function( button )
{
    for( var i=0; i < this.layout.children.length; ++i )
    {
        var widget=this.layout.children[i];

        if ( widget instanceof VG.UI.SectionToolBarButton )
        {
            if ( widget === button ) widget.selected=true;
            else widget.selected=false;
        }
    }

    if ( this.selectionChanged ) this.selectionChanged( button );
};

VG.UI.SectionToolBar.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawSectionToolBar( this, canvas );

    //this.layout.rect.set( this.contentRect );
    //this.layout.layout( canvas );
};

// ----------------------------------------------------------------- VG.UI.SectionToolBarButton

VG.UI.SectionToolBarButton=function( iconName, svgGroupName )
{
    if ( !(this instanceof VG.UI.SectionToolBarButton) ) return new VG.UI.SectionToolBarButton( iconName, svgGroupName );

    VG.UI.Widget.call( this );
    this.name="SectionToolBarButton";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;

    if ( svgGroupName === undefined || typeof svgGroupName == 'number' ) {
        if ( !iconName.includes( ".svg" ) )
            this.iconName=iconName;
        else {
            let size = 24;
            if ( typeof svgGroupName == 'number' ) size = svgGroupName;
            VG.Utils.svgToImage( { data : VG.Utils.getTextByName( iconName ), width : size, height : size, callback : function( image ) {
                this.image = image;
            }.bind( this ) } );
        }
    }
    else
    {
        this.svgName=iconName;
        this.svgGroupName=svgGroupName;
    }

    this.minimumSize.width = this.small ? VG.UI.stylePool.current.skin.SectionToolBarButton.SmallSize.width : VG.UI.stylePool.current.skin.SectionToolBarButton.Size.width;
};

VG.UI.SectionToolBarButton.prototype=VG.UI.Widget();

VG.UI.SectionToolBarButton.prototype.calcSize=function( canvas )
{
    var size = this.preferredSize;

    size.width = this.small ? VG.UI.stylePool.current.skin.SectionToolBarButton.SmallSize.width : VG.UI.stylePool.current.skin.SectionToolBarButton.Size.width;
    size.height = this.small ? VG.UI.stylePool.current.skin.SectionToolBarButton.SmallSize.height : VG.UI.stylePool.current.skin.SectionToolBarButton.Size.height;

    this.minimumSize.width = size.width;
    this.minimumSize.height = size.height;

    return size;
};

VG.UI.SectionToolBarButton.prototype.mouseDown=function( event )
{
    this.mouseIsDown=true;

    if ( this.disabled )
        return;

    if ( this.sectionBarCallback ) this.sectionBarCallback( this );
    if ( this.clicked ) this.clicked( this );
    this.sectionBarWidget.activeButton=this;
};

VG.UI.SectionToolBarButton.prototype.mouseUp=function( event )
{
    this.mouseIsDown=false;
};

VG.UI.SectionToolBarButton.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawSectionToolBarButton( this, canvas );
};