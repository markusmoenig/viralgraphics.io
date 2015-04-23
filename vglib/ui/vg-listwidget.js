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
 * You should have received a copy of the GNU Lesser General Public License
 * along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

// ----------------------------------------------------------------- VG.UI.ListWidget

VG.UI.ListWidget=function()
{
    /** ListWidget
    **/
    
    if ( !(this instanceof VG.UI.ListWidget) ) return new VG.UI.ListWidget();
    
    VG.UI.Widget.call( this );
    this.name="ListWidgetItem";

    this.offset=0;

    this.minimumSize.set( 100, 100 );
    this.supportsFocus=true;

    this.vScrollbar=0;
    this.needsVScrollbar=false;
    this.verified=false;

    // --- Setup Default Context Menu

    this.contextMenu=VG.UI.ContextMenu();

    this.addMenuItem=this.contextMenu.addItem( "Add", null, function() { 
        if ( this.controller && this.controller.contentClassName ) this.controller.add(); 
    }.bind( this ));

    this.removeMenuItem=this.contextMenu.addItem( "Remove", null, function() {
        if ( this.controller && this.controller.canRemove() ) this.controller.remove( this.controller.selected ); 
    }.bind( this ));

    this.contextMenu.addSeparator();
    this.bigItemsMenuItem=this.contextMenu.addItem( "Big Items", null, this.switchToBigItems.bind( this ) );
    this.smallItemsMenuItem=this.contextMenu.addItem( "Small Items", null, this.switchToSmallItems.bind( this ) );
    this.smallItemsMenuItem.addExclusions( this.bigItemsMenuItem );

    this.contextMenu.aboutToShow=function() {
        // --- Disable / Enable the add and remove context menu items based on controller state
        this.addMenuItem.disabled=true;
        this.removeMenuItem.disabled=true;

        if ( this.controller ) {
            if ( this.controller.contentClassName ) this.addMenuItem.disabled=false;
            if ( this.controller.canRemove() ) this.removeMenuItem.disabled=false;
        }
    }.bind( this );

    // --- Big Items as Default

    this.switchToBigItems();
};

VG.UI.ListWidget.prototype=VG.UI.Widget();

VG.UI.ListWidget.prototype.bind=function( collection, path )
{
    this.controller=collection.controllerForPath( path );
    if ( !this.controller ) {
        this.controller=VG.Controller.Array( collection, path );
        collection.addControllerForPath( this.controller, path );
    }

    this.controller.addObserver( "changed", this.changed, this );    
    this.controller.addObserver( "selectionChanged", this.selectionChanged, this );

    return this.controller;
};

Object.defineProperty( VG.UI.ListWidget.prototype, "bigItems", 
{
    get: function() {
        return this.bigItemsMenuItem.checked;
    },
    set: function( bigItems ) {
        if ( bigItems ) this.switchToBigItems();
        else this.switchToSmallItems();
    }    
});

VG.UI.ListWidget.prototype.switchToBigItems=function()
{
    this.bigItemsMenuItem.checked=true;
    this.smallItemsMenuItem.checked=false;
    this.itemHeight=VG.context.style.skin.ListWidgetBigItemHeight;
    this.spacing=VG.context.style.skin.ListWidgetBigItemDistance;
    this.verified=false;

    VG.update();   
};

VG.UI.ListWidget.prototype.switchToSmallItems=function()
{
    this.bigItemsMenuItem.checked=false;
    this.smallItemsMenuItem.checked=true;
    this.itemHeight=VG.context.style.skin.ListWidgetSmallItemHeight;
    this.spacing=VG.context.style.skin.ListWidgetSmallItemDistance;
    this.verified=false;

    VG.update();
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
    var item=-1;

    for ( var i=0; i < this.controller.length; ++i ) {
        var item=this.controller.at( i ) ;

        if ( y + this.itemHeight + this.spacing >= event.pos.y && y <= event.pos.y ) {
            selectedIndex=i;
            break;
        } 
        y+=this.itemHeight + this.spacing;
    }

    if ( selectedIndex >=0 && selectedIndex < this.controller.length )
        item=this.controller.at( selectedIndex );

    if ( this.controller.multiSelection ) 
    {/*
        if ( ! (totalSelected) ) {
            item.selected=true;
            changed=true;
        } else {
        if ( item.selected == false ) {
            if ( ! ( event.keysDown.indexOf( VG.Events.KeyCodes.Shift ) >= 0 ) ) {
                this.deselectAll();
            }
            item.selected=true;
            changed=true;
        } else {
            if ( event.keysDown.indexOf( VG.Events.KeyCodes.Shift ) >= 0 ) {
                item.selected=false;
                changed=true;
            }
        }
        }*/
    } else {
        if ( item !== -1 && !this.controller.isSelected( item ) ) {
            this.controller.selected=item;
        }
    } 
};

VG.UI.ListWidget.prototype.vHandleMoved=function( offsetInScrollbarSpace )
{
    this.offset=offsetInScrollbarSpace * this.vScrollbar.totalSize / this.vScrollbar.visibleSize;
};

VG.UI.ListWidget.prototype.verifyScrollbar=function( text )
{
    // --- Check if we have enough vertical space for all items

    this.needsVScrollbar=false;

    this.totalItemHeight=this.controller.length * this.itemHeight + (this.controller.length-1) * this.spacing;
    this.heightPerItem=this.totalItemHeight / this.controller.length;
    this.visibleItems=this.contentRect.height / this.heightPerItem;
    this.lastTopItem=Math.ceil( this.controller.length - this.visibleItems );

    if ( this.totalItemHeight > this.contentRect.height )
        this.needsVScrollbar=true;

    if ( this.needsVScrollbar && !this.vScrollbar ) {
        this.vScrollbar=VG.UI.Scrollbar( "ListWidget Scrollbar" );
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
    VG.context.style.drawListWidgetBorder( canvas, this );

    if ( !this.controller.length ) return;

    canvas.setClipRect( this.contentRect );
    this.contentRect=this.contentRect.add( 4, 4, -8, -8 );

    if ( !this.verified || canvas.hasBeenResized )
        this.verifyScrollbar();

    // ---

    var paintRect=VG.Core.Rect( this.contentRect );
    paintRect.height=this.itemHeight;

    if ( this.needsVScrollbar ) paintRect.width-=canvas.style.skin.ScrollbarSize + 1;

    if ( this.bigItems ) canvas.pushFont( canvas.style.skin.ListWidgetBigItemFont );
    else canvas.pushFont( canvas.style.skin.ListWidgetSmallItemFont );

    paintRect.y=this.contentRect.y - this.offset;

    for ( var i=0; i < this.controller.length; ++i ) {
        var item=this.controller.at( i ) ;

        if ( paintRect.y + this.itemHeight >= this.contentRect.y || paintRect.y < this.contentRect.bottom() ) {
            VG.context.style.drawListWidgetItem( canvas, item, this.controller.isSelected( item ), paintRect );

            paintRect.y+=this.itemHeight + this.spacing;
        } 
    }

    canvas.popFont();        

    if ( this.needsVScrollbar ) {
        this.vScrollbar.rect=VG.Core.Rect( this.contentRect.right() - canvas.style.skin.ScrollbarSize + 2, this.contentRect.y, canvas.style.skin.ScrollbarSize, this.contentRect.height );

        // this.totalItemHeight == Total height of all Items in the list widget including spacing
        // visibleHeight == Total height of all currently visible items
        // this.contentRect.height == Height of the available area for the list items

        this.vScrollbar.setScrollbarContentSize( this.totalItemHeight, this.contentRect.height );// this.visibleHeight );
        this.vScrollbar.paintWidget( canvas );
    }    

    canvas.setClipRect( false );
};
