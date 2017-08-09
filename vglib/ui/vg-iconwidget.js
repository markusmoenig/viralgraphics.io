/*
 * Copyright (c) 2014-2017 Markus Moenig <markusm@visualgraphics.tv> and Contributors
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

/**
 * Creates an VG.UI.IconWidget. An icon widget displays a flat (not nested) list of items.
 *
 * A list widget has to be bound to a path inside a {@link VG.Data.Collection}.
 *
 * @example
 * var dc=VG.Data.Collection( "MainData" );
 * dc.items=[];
 *
 * var listWidget=VG.UI.ListWidget();
 *
 * var controller=listWidget.bind( dc, "items" );
 * controller.addObserver( "selectionChanged", function() {
 *     var item=this.controller.selected;
 *     VG.log( "Selected \"" + item.text + "\" at index " + this.controller.indexOf( item ) );
 * }.bind( this ) );
 *
 * function item( text ) {
 *     this.text=text;
 * }
 *
 * controller.add( new item( "First Item" ) );
 * controller.add( new item( "Second Item" ) );
 * controller.add( new item( "Third Item" ) );
 * @constructor
 */

VG.UI.IconWidget=function()
{
    if ( !(this instanceof VG.UI.IconWidget) ) return new VG.UI.IconWidget();

    VG.UI.Widget.call( this );
    this.name="IconWidget";

    this.offset=0;

    this.previousRect=VG.Core.Rect();

    this.minimumSize.set( 100, 100 );
    this.supportsFocus=true;

    this.vScrollbar=0;
    this.needsVScrollbar=false;
    this.verified=false;
    this._itemSize=VG.Core.Size( 91, 117 );

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

VG.UI.IconWidget.prototype=VG.UI.Widget();

/**
 * Binds the widget to the data model.
 * @param {VG.Data.Collection} collection - The data collection to link this widget to.
 * @param {string} path - The path inside the data collection to bind this widget to.
 * @returns {VG.Controller.Array} The array controller created for this widget.
 * @tutorial Data Model
 */

VG.UI.IconWidget.prototype.bind=function( collection, path )
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

Object.defineProperty( VG.UI.IconWidget.prototype, "itemSize",
{
    get: function() {
        return this._itemSize;
    },
    set: function( itemSize ) {
        this._itemSize.copy( itemSize );
    }
});

VG.UI.IconWidget.prototype.addToolWidget=function( widget )
{
    widget.supportsFocus=false;
    this.toolLayout.addChild( widget );
};

VG.UI.IconWidget.prototype.removeToolWidget=function( widget )
{
    this.toolLayout.removeChild( widget );
};

VG.UI.IconWidget.prototype.focusIn=function()
{
};

VG.UI.IconWidget.prototype.focusOut=function()
{
};

VG.UI.IconWidget.prototype.keyDown=function( keyCode )
{
    if ( !this.controller.selected ) return;

    var index=this.controller.indexOf( this.controller.selected );
    if ( index === -1 ) return;

    if ( keyCode === VG.Events.KeyCodes.ArrowLeft && index > 0 )
    {
        this.controller.selected=this.controller.at( index - 1 );

        if ( this.needsVScrollbar )
        {
            // --- Scroll one line up if necessary
            y=this.contentRect.y - this.offset + (index-1) * (this._itemSize.height + this.spacing.height);

            if ( y < this.contentRect.y ) {
                this.offset-=this._itemSize.height + this.spacing;
                this.vScrollbar.scrollTo( this.offset );
            }
        }
    } else
    if ( keyCode === VG.Events.KeyCodes.ArrowRight && index < this.controller.length-1 )
    {
        this.controller.selected=this.controller.at( index + 1 );

        if ( this.needsVScrollbar )
        {
            // --- Scroll one line down if necessary
            y=this.contentRect.y - this.offset + (index+1) * (this._itemSize.height + this.spacing.height);

            if ( y + this.itemHeight > this.contentRect.bottom() ) {
                this.offset+=this._itemSize.height + this.spacing.height;
                this.vScrollbar.scrollTo( this.offset );
            }
        }
    } else
    if ( keyCode === VG.Events.KeyCodes.ArrowUp && index >= this.itemsPerRow )
    {
        this.controller.selected=this.controller.at( index - this.itemsPerRow );

        if ( this.needsVScrollbar )
        {
            // --- Scroll one line up if necessary
            y=this.contentRect.y - this.offset + (index-this.itemsPerRow) * (this._itemSize.height + this.spacing.height);

            if ( y < this.contentRect.y ) {
                this.offset-=this._itemSize.height + this.spacing.height;
                this.vScrollbar.scrollTo( this.offset );
            }
        }
    } else
    if ( keyCode === VG.Events.KeyCodes.ArrowDown && index < this.controller.length-this.itemsPerRow )
    {
        this.controller.selected=this.controller.at( index + this.itemsPerRow );

        if ( this.needsVScrollbar )
        {
            // --- Scroll one line down if necessary
            y=this.contentRect.y - this.offset + (index+this.itemsPerRow) * (this._itemSize.height + this.spacing.height);

            if ( y + this._itemSize.height > this.contentRect.bottom() ) {
                this.offset+=this._itemSize.height + this.spacing.height;
                this.vScrollbar.scrollTo( this.offset );
            }
        }
    }
};

VG.UI.IconWidget.prototype.mouseWheel=function( step )
{
    if ( !this.needsVScrollbar ) return;

    if ( step > 0 ) {
        this.offset-=this._itemSize.height + this.spacing.height;
        this.vScrollbar.scrollTo( this.offset );
    } else
    {
        this.offset+=this._itemSize.height + this.spacing.height;
        this.vScrollbar.scrollTo( this.offset );
    }
};

VG.UI.IconWidget.prototype.mouseMove=function( event )
{
    if ( this.mouseIsDown && this.dragSourceId && this.possibleDnDSource )
    {
        VG.context.workspace.dragOperationStarted( this, this.dragSourceId, this.possibleDnDSource );
    }
};

VG.UI.IconWidget.prototype.mouseDown=function( event )
{
    if ( this.needsVScrollbar && this.vScrollbar && this.vScrollbar.rect.contains( event.pos ) ) {
        this.vScrollbar.mouseDown( event );
        return;
    }

    if ( !this.rect.contains( event.pos ) ) return;

    var selectedIndex=-1;
    var y=this.contentRect.y - this.offset;
    var item, rect=VG.Core.Rect();

    var skin=VG.UI.stylePool.current.skin.IconWidget;

    rect.y=skin.Margin.top;
    rect.width=this._itemSize.width;
    rect.height=this._itemSize.height;

    for ( var r=0; r < this.rows; ++r )
    {
        rect.x=skin.Margin.left;

        for ( var i=0; i < this.itemsPerRow; ++i )
        {
            var itemIndex=this.itemsPerRow * r + i;
            if ( itemIndex >= this.controller.count() ) break;

            if ( rect.contains( event.pos.x - this.rect.x, event.pos.y - this.rect.y + this.offset ) ) {
                selectedIndex=itemIndex;
                break;
            }

            rect.x+=this._itemSize.width + this.spacing.width;
        }

        if ( selectedIndex >= 0 ) break;
        rect.y+=this._itemSize.height + this.spacing.height;
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
        if ( item ) {
            this.controller.setSelected( item );
            this.possibleDnDSource=item;
        }
    } else
    if ( item ) {
        this.controller.setSelected( item );
        this.possibleDnDSource=item;
    }

    this.mouseIsDown=true;
};

VG.UI.IconWidget.prototype.mouseUp=function( event )
{
    this.mouseIsDown=false;
};

VG.UI.IconWidget.prototype.vHandleMoved=function( offsetInScrollbarSpace )
{
    this.offset=offsetInScrollbarSpace * this.vScrollbar.totalSize / this.vScrollbar.visibleSize;
};

VG.UI.IconWidget.prototype.verifyScrollbar=function( text )
{
    // --- Check if we have enough vertical space for all items

    var skin=VG.UI.stylePool.current.skin;

    this.needsVScrollbar=false;

    var availableWidth=this.rect.width - skin.IconWidget.Margin.left - skin.IconWidget.Margin.right - skin.ScrollBar.Size - 4;
    this.itemsPerRow=Math.floor( availableWidth / this._itemSize.width );
    availableWidth-=(this.itemsPerRow-1) * skin.IconWidget.Spacing.width;
    this.itemsPerRow=Math.floor( availableWidth / this._itemSize.width );
    this.rows=Math.ceil( this.controller.count() / this.itemsPerRow );

    this.totalItemHeight=this.rows * this._itemSize.height + (this.rows-1) * this.spacing.height;
    this.heightPerItem=this.totalItemHeight / this.rows;
    this.visibleItems=this.contentRect.height / this.heightPerItem;
    this.lastTopItem=Math.ceil( this.rows - this.visibleItems );

    if ( this.totalItemHeight > this.contentRect.height )
        this.needsVScrollbar=true;
    else this.offset=0;

    if ( this.needsVScrollbar && !this.vScrollbar ) {
        this.vScrollbar=VG.UI.ScrollBar( "IconWidget Scrollbar" );
        this.vScrollbar.callbackObject=this;
    }

    this.verified=true;
};

VG.UI.IconWidget.prototype.changed=function()
{
    this.verified=false;
    VG.update();
};

VG.UI.IconWidget.prototype.selectionChanged=function()
{
    VG.update();
};

VG.UI.IconWidget.prototype.paintWidget=function( canvas )
{
    this.spacing=VG.UI.stylePool.current.skin.IconWidget.Spacing;

    if ( !this.rect.equals( this.previousRect ) ) this.verified=false;
    VG.UI.stylePool.current.drawIconWidget( this, canvas );
    this.previousRect.set( this.rect );
};
