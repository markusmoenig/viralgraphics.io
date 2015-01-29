/*
 * (C) Copyright 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>.
 *
 * This file is part of Visual Graphics.
 *
 * Visual Graphics is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Visual Graphics is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
 *
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
    if ( event.pos.y >= this.rect.y && event.pos.y <= ( this.rect.y + VG.context.style.skin.DockWidgetHeaderHeight ) ) 
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
    VG.context.style.drawDockWidget( canvas, this );

    this.layout.rect.set( this.contentRect );
    this.layout.layout( canvas );

    this.minimumSize.set( this.layout.minimumSize );
};

// ----------------------------------------------------------------- VG.UI.DockStripWidget

VG.UI.DockStripWidget=function( text )
{
    /**Creates an VG.UI.DockStripWidget.<br>
     * DockStripWidgets can be added to the left or right side of an VG.UI.Workspace and can contain a list of vertically stacked VG.UI.DockStripWidgetButtons. DockStripWidgets cannot be resized. Use
     * addItem() and addItems() to add items to the DockStripWidget.
     * @constructor
     */

    if ( !(this instanceof VG.UI.DockStripWidget) ) return new VG.UI.DockStripWidget( text );

    VG.UI.DockWidget.call( this );
    this.name="DockStripWidget";

    this.horizontalExpanding=false;
    this.verticalExpanding=true;

    this.selectedIndex=0;
};

VG.UI.DockStripWidget.prototype=VG.UI.DockWidget();

VG.UI.DockStripWidget.prototype.calcSize=function( canvas )
{
    var size=this.layout.calcSize( canvas );
    //size.width=54;
    this.minimumSize.width=size.width;
    this.maximumSize.width=size.width;
    //this.minimumSize.set( 54, this.layout.minimumSize.height );
    return size;
};

VG.UI.DockStripWidget.prototype.mouseMove=function( event )
{
};

VG.UI.DockStripWidget.prototype.mouseDown=function( event )
{
};

VG.UI.DockStripWidget.prototype.mouseUp=function( event )
{
};

VG.UI.DockStripWidget.prototype.addItem=function( item )
{
    /**Adds an VG.UI.DockStripButton to the DockStripWidget.
     * @param {VG.UI.DockStripButton} button - Button to add to the DockStripWidget
     */       
    this.layout.addChild( item );

    if ( item instanceof VG.UI.DockStripButton ) {
        item.stripCallback=this.stripButtonSelectionCallback.bind( this );
    }
};

VG.UI.DockStripWidget.prototype.addItems=function( item )
{
    /**Adds a list of VG.UI.DockStripButton to the DockStripWidget.
     * @param {VG.UI.DockStripButton} button - Button to add to the DockStripWidget
     * @param {VG.UI.DockStripButton} ...     
     */      
    for( var i=0; i < arguments.length; ++i )
        this.addItem( arguments[i] );    
};

VG.UI.DockStripWidget.prototype.stripButtonSelectionCallback=function( button )
{
    for( var i=0; i < this.layout.children.length; ++i )
    {
        var widget=this.layout.children[i];

        if ( widget instanceof VG.UI.DockStripButton )
        {
            if ( widget === button ) widget.selected=true;
            else widget.selected=false;
        }
    }

    if ( this.selectionChanged ) this.selectionChanged( button );
};

VG.UI.DockStripWidget.prototype.paintWidget=function( canvas )
{
    VG.context.style.drawDockStripWidget( canvas, this );

    this.contentRect.set( this.rect.add( 0, VG.context.style.skin.DockStripWidgetHeaderHeight, 0, -1 ) );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.contentRect, VG.context.style.skin.DockStripWidgetBackgroundColor);        

    this.layout.rect.set( this.contentRect );
    this.layout.layout( canvas );  
};

// ----------------------------------------------------------------- VG.UI.DockStripButton

VG.UI.DockStripButton=function( text )
{
    /**Creates an VG.UI.DockStripButton.<br>
     * DockStripButtons can be added to VG.UI.DockStripWidgets. They contain either text or images. TODO: Currently only vertical texts are supported.
     * @param {string} text - The text of the button.
     * @constructor
     */

    if ( !(this instanceof VG.UI.DockStripButton) ) return new VG.UI.DockStripButton( text );
    this.text=arguments[0];
    
    VG.UI.Widget.call( this );
    this.name="DockStripToolButton";
    
    this.horizontalExpanding=false;
    this.verticalExpanding=false;
    
    this.minimumSize.width=VG.context.style.skin.DockStripWidgetButtonMinimumWidth;
};

VG.UI.DockStripButton.prototype=VG.UI.Widget();

VG.UI.DockStripButton.prototype.calcSize=function( canvas )
{
    var size=VG.Core.Size();
    
    if ( !this.icon && this.iconName ) {
        this.icon=VG.Core.imagePool.getImageByName( this.iconName );
    }

    if ( this.text.length && !this.iconName ) {

        canvas.pushFont( canvas.style.skin.DockStripWidgetFont );        
        canvas.getTextSize( this.text, size );
        canvas.popFont();

        size.width+=40;

        var temp=size.width;
        size.width=size.height;
        size.height=temp;

        if ( size.width < VG.context.style.skin.DockStripWidgetButtonMinimumWidth ) size.width=VG.context.style.skin.DockStripWidgetButtonMinimumWidth;
        //size.height=26;
    } else 
    if ( this.icon )
    {
        //size.set( 22 + 10, VG.context.style.skin.ToolbarHeight );
        size.width=this.icon.width + 10;
        size.height=this.icon.height + 10;
    }

    this.minimumSize.width=size.width;
    this.minimumSize.height=size.height;

    //if ( size.width < this.minimumSize.width )
    //    size.width=this.minimumSize.width;

    return size;
};

VG.UI.DockStripButton.prototype.mouseDown=function( event )
{
    this.mouseIsDown=true;

    if ( this.stripCallback ) this.stripCallback( this );
};

VG.UI.DockStripButton.prototype.mouseUp=function( event )
{
    this.mouseIsDown=false;
};

VG.UI.DockStripButton.prototype.paintWidget=function( canvas )
{
    var size=this.calcSize( canvas );
    this.contentRect.set( this.rect );
    
    if ( !this.icon && this.iconName ) {
        this.icon=VG.Core.imagePool.getImageByName( this.iconName );
        if ( !this.icon ) return;
    }  

    if ( this.iconName )
    {
        if ( this.icon )
        {
            var x=this.contentRect.x + (this.contentRect.width - this.icon.width)/2;
            var y=this.contentRect.y + (this.contentRect.height - this.icon.height)/2;     

            if ( this.mouseIsDown || this.selected )
            {
                if ( !this.clickedIcon )
                {
                    this.clickedIcon=VG.Core.Image( this.icon.width, this.icon.height );
                    for ( var h=0; h < this.icon.height; ++h )
                    {
                        for ( var w=0; w < this.icon.width; ++w )
                        {
                            var offset=h * this.icon.modulo + w *4;
                            this.clickedIcon.data[offset]=this.icon.data[offset] * 0.568;
                            this.clickedIcon.data[offset+1]=this.icon.data[offset+1] * 0.619;
                            this.clickedIcon.data[offset+2]=this.icon.data[offset+2] * 0.921;
                            this.clickedIcon.data[offset+3]=this.icon.data[offset+3];
                        }
                    }
                }
                canvas.drawImage( VG.Core.Point( x, y ), this.clickedIcon );
            } else canvas.drawImage( VG.Core.Point( x, y ), this.icon );
        }
    } else {
        canvas.pushFont( canvas.style.skin.DockStripWidgetFont );
        canvas.drawTextRect( this.text, this.contentRect, this.visualState === VG.UI.Widget.VisualState.Hover ? canvas.style.skin.DockStripWidgetHoverColor : canvas.style.skin.DockStripWidgetTextColor, 1, 1, -90 );
        canvas.popFont();
    }

    if ( this.visualState === VG.UI.Widget.VisualState.Hover ) {
        var rect=VG.Core.Rect( this.parent.rect );
        rect.x=rect.right()-3; rect.width=3;
        rect.y=this.rect.y; rect.height=this.rect.height;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect, canvas.style.skin.DockStripWidgetHoverColor );
    }      
};

// ----------------------------------------------------------------- VG.UI.DockStripSeparator

VG.UI.DockStripSeparator=function()
{
    /**Creates an VG.UI.DockStripSeparator.<br>
     * DockStripSeparator can be added to VG.UI.DockStripWidgets and draw a horizontal separator line.
     * @constructor
     */    
    if ( !(this instanceof VG.UI.DockStripSeparator )) return new VG.UI.DockStripSeparator();

    VG.UI.Widget.call( this );
    this.name="DockStripSeparator";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;
};

VG.UI.DockStripSeparator.prototype=VG.UI.Widget();

VG.UI.DockStripSeparator.prototype.calcSize=function()
{
    var size=VG.Core.Size( 40, 1 );//VG.context.style.skin.ToolbarHeight );
    return size;
};

VG.UI.DockStripSeparator.prototype.paintWidget=function( canvas )
{
    var size=this.calcSize();
    this.contentRect.set( this.rect );

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( this.rect.x, this.rect.y, this.rect.width, 1 ), VG.context.style.skin.DockStripWidgetSeparatorColor );
    //canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( this.rect.x, this.rect.y+2, this.rect.width, 1 ), VG.context.style.skin.DockStripWidgetSeparatorColor );
};
