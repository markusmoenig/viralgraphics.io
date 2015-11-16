/*
 * Copyright (c) 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>
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

// ----------------------------------------------------------------- VG.UI.DockWidget

VG.UI.DockWidget=function( text )
{
    /**Creates an VG.UI.DockWidget.<br>
     * Dock widgets can be added to the left or right side of an VG.UI.Workspace and can contain a list of vertically stacked Widgets or Layouts. Dock Widgets can be resized. Use
     * addItem() and addItems() to add items to the Dock widget.
     * @param {string} title - The title of the Dock Widget.
     * @constructor
     */
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
    if ( event.pos.y >= this.rect.y && event.pos.y <= ( this.rect.y + VG.context.style.skin.DockWidget.Header.Height ) ) 
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
        if ( this.location < VG.UI.DockWidgetLocation.Floating ) 
        {
            this.rect.x+=10;
            this.rect.y+=10;
            VG.context.workspace.detachDockWidget( this );
        } else
        {
            VG.context.workspace.possiblyAttachDockWidget( this, true );        
        }
    }
};

VG.UI.DockWidget.prototype.calcSize=function( canvas )
{
    var size=this.layout.calcSize( canvas );
    this.minimumSize.set( this.layout.minimumSize );
    return size;
};

VG.UI.DockWidget.prototype.addItem=function( item )
{
    /**Adds an item, either a Widget or a Layout, to the Dock widget.
     * @param {widget} widget - Widget or layout to add
     */    
    this.layout.addChild( item );
};

VG.UI.DockWidget.prototype.addItems=function( item )
{
    /**Adds a list of items, either a Widget or a Layout, to the Dock widget.
     * @param {widget} widgets - Widget or layout to add
     * @param {widget} ...
     */       
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

// ----------------------------------------------------------------- VG.UI.DockStripWidget

VG.UI.SectionBar=function( text )
{
    /**Creates an VG.UI.SectionBar.<br>
     * SectionBars can be added to the left or right side of an VG.UI.Workspace and can contain a list of vertically stacked VG.UI.SectionBarButtons. SectionBars cannot be resized. Use
     * addItem() and addItems() to add items to the SectionBar.
     * @constructor
     */

    if ( !(this instanceof VG.UI.SectionBar) ) return new VG.UI.SectionBar( text );

    VG.UI.DockWidget.call( this );
    this.name="SectionBar";

    this.text=text ? text : "";

    this.layout.margin.set( 9, 7, 9, 0 );
    this.layout.spacing=6;

    this.horizontalExpanding=false;
    this.verticalExpanding=true;

    this.selectedButton=null;
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

VG.UI.SectionBar.prototype.addItem=function( item )
{
    /**Adds an VG.UI.SectionBarButton to the SectionBar.
     * @param {VG.UI.SectionBarButton} button - Button to add to the SectionBar
     */       
    this.layout.addChild( item );

    if ( item instanceof VG.UI.SectionBarButton ) {
        item.stripCallback=this.stripButtonSelectionCallback.bind( this );
        item.stripWidget=this;
        if ( !this.selectedButton ) this.selectedButton=item;
    }
};

VG.UI.SectionBar.prototype.addButton=function( text )
{
    /**Adds a Button to the SectionBar.
     * @param {string} text - The text of the button to add.
     */       

    var button=VG.UI.SectionBarButton( text );
    this.addItem( button );
    return button;
};

VG.UI.SectionBar.prototype.addItems=function( item )
{
    /**Adds a list of VG.UI.DockStripButton to the SectionBar.
     * @param {VG.UI.DockStripButton} button - Button to add to the SectionBar
     * @param {VG.UI.DockStripButton} ...     
     */      
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

// ----------------------------------------------------------------- VG.UI.DockStripButton

VG.UI.SectionBarButton=function( text )
{
    /**Creates an VG.UI.SectionBarButton.<br>
     * DockStripButtons can be added to VG.UI.SectionBars. They contain either text or images.
     * @param {string} text - The text of the button.
     * @constructor
     */

    if ( !(this instanceof VG.UI.SectionBarButton) ) return new VG.UI.SectionBarButton( text );
    this.text=arguments[0];
    
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

    if ( this.stripCallback ) this.stripCallback( this );
    if ( this.clicked ) this.clicked( this );
    this.stripWidget.selectedButton=this;
};

VG.UI.SectionBarButton.prototype.mouseUp=function( event )
{
    this.mouseIsDown=false;
};

VG.UI.SectionBarButton.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawSectionBarButton( this, canvas );
};

// ----------------------------------------------------------------- VG.UI.SectionBarSeparator

VG.UI.SectionBarSeparator=function()
{
    /**Creates an VG.UI.SectionBarSeparator.<br>
     * A SectionBarSeparator can be added to VG.UI.SectionBar and draws a horizontal separator line.
     * @constructor
     */    
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
