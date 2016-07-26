/*
 * Copyright (c) 2014-2016 Markus Moenig <markusm@visualgraphics.tv>
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

// ----------------------------------------------------------------- VG.UI.ListWidget

VG.UI.ListWidget=function()
{
    /** ListWidget
    **/
    
    if ( !(this instanceof VG.UI.ListWidget) ) return new VG.UI.ListWidget();
    
    VG.UI.Widget.call( this );
    this.name="ListWidget";

    this.offset=0;

    this.previousRect=VG.Core.Rect();

    this.minimumSize.set( 100, 100 );
    this.supportsFocus=true;

    this.vScrollbar=0;
    this.needsVScrollbar=false;
    this.verified=false;
    this._itemHeight=-1;

    this.toolLayout=VG.UI.Layout();
    this.layout=this.toolLayout;
    this.toolLayout.margin.set( 1, 1, 1, 1 );

    // --- Setup Default Context Menu

    this.contextMenu=VG.UI.ContextMenu();

    this.addMenuItem=this.contextMenu.addItem( "Add", null, function() { 
        if ( this.controller && this.controller.contentClassName ) this.controller.add(); 
    }.bind( this ));

    this.removeMenuItem=this.contextMenu.addItem( "Remove", null, function() {
        if ( this.controller && this.controller.canRemove() ) this.controller.remove( this.controller.selected ); 
    }.bind( this ));

    //this.contextMenu.addSeparator();

    this.contextMenu.aboutToShow=function() {
        // --- Disable / Enable the add and remove context menu items based on controller state
        this.addMenuItem.disabled=true;
        this.removeMenuItem.disabled=true;

        if ( this.controller ) {
            if ( this.controller.contentClassName ) this.addMenuItem.disabled=false;
            if ( this.controller.canRemove() ) this.removeMenuItem.disabled=false;
        }
    }.bind( this );
};

VG.UI.ListWidget.prototype=VG.UI.Widget();

VG.UI.ListWidget.prototype.bind=function( collection, path )
{
    this.controller=collection.controllerForPath( path );
    if ( !this.controller ) {
        this.controller=VG.Controller.Array( collection, path );
        collection.addControllerForPath( this.controller, path );
    }

    this.controller.addObserver( "changed", this.changed.bind( this ) );
    this.controller.addObserver( "selectionChanged", this.selectionChanged.bind( this ) );

    return this.controller;
};

Object.defineProperty( VG.UI.ListWidget.prototype, "itemHeight", 
{
    get: function() {
        if ( this._itemHeight === -1 ) {
            VG.context.workspace.canvas.pushFont( VG.UI.stylePool.current.skin.ListWidget.Font );
            var fontHeight=VG.context.workspace.canvas.getLineHeight();
            VG.context.workspace.canvas.popFont();
            return fontHeight + 4;
        } else return this._itemHeight;
    },
    set: function( itemHeight ) {
        this._itemHeight=itemHeight;
    }    
});

VG.UI.ListWidget.prototype.addToolWidget=function( widget )
{
    widget.supportsFocus=false;
    this.toolLayout.addChild( widget );
};

VG.UI.ListWidget.prototype.removeToolWidget=function( widget )
{
    this.toolLayout.removeChild( widget );
};

VG.UI.ListWidget.prototype.focusIn=function()
{
};

VG.UI.ListWidget.prototype.focusOut=function()
{
};

VG.UI.ListWidget.prototype.keyDown=function( keyCode )
{        
    if ( !this.controller.selected ) return;

    var index=this.controller.indexOf( this.controller.selected );
    if ( index === -1 ) return;

    if ( keyCode === VG.Events.KeyCodes.ArrowUp && index > 0 )
    {
        this.controller.selected=this.controller.at( index - 1 );

        if ( this.needsVScrollbar )
        {
            // --- Scroll one line up if necessary
            var y=this.contentRect.y - this.offset + (index-1) * (this.itemHeight + this.spacing);

            if ( y < this.contentRect.y ) {
                this.offset-=this.itemHeight + this.spacing;
                this.vScrollbar.scrollTo( this.offset );                
            }
        }        
    } else
    if ( keyCode === VG.Events.KeyCodes.ArrowDown && index < this.controller.length-1 )
    {
        this.controller.selected=this.controller.at( index + 1 );

        if ( this.needsVScrollbar )
        {
            // --- Scroll one line down if necessary
            var y=this.contentRect.y - this.offset + (index+1) * (this.itemHeight + this.spacing);

            if ( y + this.itemHeight > this.contentRect.bottom() ) {
                this.offset+=this.itemHeight + this.spacing;
                this.vScrollbar.scrollTo( this.offset );                
            }
        }
    } 
};

VG.UI.ListWidget.prototype.mouseWheel=function( step )
{
    if ( !this.needsVScrollbar ) return;

    if ( step > 0 ) {
        this.offset-=this.itemHeight + this.spacing;
        this.vScrollbar.scrollTo( this.offset );   
    } else
    {
        this.offset+=this.itemHeight + this.spacing;
        this.vScrollbar.scrollTo( this.offset );            
    }
};

VG.UI.ListWidget.prototype.mouseMove=function( event )
{
};

VG.UI.ListWidget.prototype.mouseDown=function( event )
{
    if ( this.needsVScrollbar && this.vScrollbar && this.vScrollbar.rect.contains( event.pos ) ) {
        this.vScrollbar.mouseDown( event );
        return;
    }

    if ( !this.rect.contains( event.pos ) ) return;

    var selectedIndex=-1;
    var y=this.contentRect.y - this.offset;
    var item=undefined;

    for ( var i=0; i < this.controller.count(); ++i ) {
        var item=this.controller.at( i ) ;

        if ( y + this.itemHeight + this.spacing >= event.pos.y && y <= event.pos.y ) {
            selectedIndex=i;
            break;
        } 
        y+=this.itemHeight + this.spacing;
    }

    if ( selectedIndex >=0 && selectedIndex < this.controller.count() )
        item=this.controller.at( selectedIndex );

    if ( this.controller.multiSelection ) 
    {
        if ( event.keysDown.indexOf( VG.Events.KeyCodes.Shift ) >= 0 )
        {
            if ( !this.controller.isSelected( item ) ) this.controller.addToSelection( item );
            else this.controller.removeFromSelection( item );
        } else
        if ( item )
            this.controller.setSelected( item );
    } else
    if ( item )
        this.controller.setSelected( item );
};

VG.UI.ListWidget.prototype.vHandleMoved=function( offsetInScrollbarSpace )
{
    this.offset=offsetInScrollbarSpace * this.vScrollbar.totalSize / this.vScrollbar.visibleSize;
};

VG.UI.ListWidget.prototype.verifyScrollbar=function( text )
{
    // --- Check if we have enough vertical space for all items

    this.needsVScrollbar=false;

    this.totalItemHeight=this.controller.count() * this.itemHeight + (this.controller.count()-1) * this.spacing;
    this.heightPerItem=this.totalItemHeight / this.controller.count();
    this.visibleItems=this.contentRect.height / this.heightPerItem;
    this.lastTopItem=Math.ceil( this.controller.count() - this.visibleItems );

    if ( this.totalItemHeight > this.contentRect.height )
        this.needsVScrollbar=true;
    else this.offset=0;

    if ( this.needsVScrollbar && !this.vScrollbar ) {
        this.vScrollbar=VG.UI.ScrollBar( "ListWidget Scrollbar" );
        this.vScrollbar.callbackObject=this;
    }

    this.verified=true;
};

VG.UI.ListWidget.prototype.changed=function()
{
    this.verified=false;    
    VG.update();
};

VG.UI.ListWidget.prototype.selectionChanged=function()
{
    VG.update();
};

VG.UI.ListWidget.prototype.paintWidget=function( canvas )
{
    this.spacing=VG.UI.stylePool.current.skin.ListWidget.Spacing;

    if ( !this.rect.equals( this.previousRect ) ) this.verified=false;    
    VG.UI.stylePool.current.drawListWidget( this, canvas );
    this.previousRect.set( this.rect );    
};
