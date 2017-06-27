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

VG.UI.TreeWidgetItem=function( item, rect )
{
    if ( !(this instanceof VG.UI.TreeWidgetItem) ) return new VG.UI.TreeWidgetItem( item, rect );

    this.item=item;
    this.rect=VG.Core.Rect( rect );
};

 /**
 * Creates an VG.UI.TreeWidget. A tree widget displays an hierarchical tree of items.
 *
 * A list widget has to be bound to a path inside a {@link VG.Data.Collection}.
 *
 * @example
 *
 * var dc=VG.Data.Collection( "MainData" );
 * dc.items=[];
 *
 * var treeWidget=VG.UI.TreeWidget();
 *
 * controller=treeWidget.bind( dc, "items" );
 * controller.addObserver( "selectionChanged", function() {
 *     var item=this.controller.selected;
 *     VG.log( "Selected \"" + item.text + "\" at index " + this.controller.indexOf( item ) );
 * }.bind( this ) );
 *
 * function folder( text, open, selectable ) {
 *     this.text=text;
 *     this.children=[];
 *     this.open=open;
 *     this.selectable=selectable;
 * }
 *
 * function item( text, folder, open ) {
 *     this.text=text;
 * }
 *
 * controller.add( "", new folder( "Folder #1", true ) );
 * controller.add( "0", new item( "First Item" ) );
 * controller.add( "0", new folder( "Selectable Subfolder", false, true ) );
 * controller.add( "0.1", new item( "Second Item" ) );
 * controller.add( "", new item( "Third Item" ) );
 *
 * @borrows VG.UI.ListWidget.bind as VG.UI.TreeWidget.bind
 * @constructor
 */

VG.UI.TreeWidget=function()
{
    if ( !(this instanceof VG.UI.TreeWidget) ) return new VG.UI.TreeWidget();

    VG.UI.Widget.call( this );
    this.name="TreeWidget";

    this.offset=0;
    this._itemHeight=-1;

    this.toolLayout=VG.UI.Layout();
    this.layout=this.toolLayout;
    this.toolLayout.margin.set( 1, 1, 1, 1 );

    this.minimumSize.set( 100, 100 );
    this.supportsFocus=true;

    this.items=[];
    this.vScrollbar=0;
    this.needsVScrollbar=false;
    this.verified=false;
    this.previousRect=VG.Core.Rect();

    this.columns = [];
};

VG.UI.TreeWidget.prototype=VG.UI.Widget();

/**
 * Binds the widget to the data model.
 * @param {VG.Data.Collection} collection - The data collection to link this widget to.
 * @param {string} path - The path inside the data collection to bind this widget to.
 * @returns {VG.Controller.Tree} The tree controller created for this widget.
 * @tutorial Data Model
 */

VG.UI.TreeWidget.prototype.bind=function( collection, path )
{
    this.controller=collection.controllerForPath( path );
    if ( !this.controller ) {
        this.controller=VG.Controller.Tree( collection, path );
        collection.addControllerForPath( this.controller, path );
    }

    this.controller.addObserver( "changed", this.changed, this );
    this.controller.addObserver( "selectionChanged", this.selectionChanged, this );

    return this.controller;
};

Object.defineProperty( VG.UI.TreeWidget.prototype, "itemHeight",
{
    get: function() {
        if ( this._itemHeight === -1 ) {
            return VG.UI.stylePool.current.skin.TreeWidget.Font.size + 8;

            //VG.context.workspace.canvas.pushFont( VG.UI.stylePool.current.skin.TreeWidget.Font );
            //var fontHeight=VG.context.workspace.canvas.getLineHeight();
            //VG.context.workspace.canvas.popFont();
            //return fontHeight + 4;
        } else return this._itemHeight;
    },
    set: function( itemHeight ) {
        this._itemHeight=itemHeight;
    }
});

VG.UI.TreeWidget.prototype.addColumn=function( column )
{
    if ( column.hAlign !== 1 )
        column.hAlign = 0;

    this.columns.push( column );
};

VG.UI.TreeWidget.prototype.addToolWidget=function( widget )
{
    widget.supportsFocus=false;
    this.toolLayout.addChild( widget );
};

VG.UI.TreeWidget.prototype.removeToolWidget=function( widget )
{
    this.toolLayout.removeChild( widget );
};

VG.UI.TreeWidget.prototype.focusIn=function()
{
};

VG.UI.TreeWidget.prototype.focusOut=function()
{
};

VG.UI.TreeWidget.prototype.mouseWheel=function( step )
{
    if ( !this.needsVScrollbar ) return false;

    if ( step > 0 ) {
        this.offset-=this.itemHeight + this.spacing;
        this.vScrollbar.scrollTo( this.offset );
    } else
    {
        this.offset+=this.itemHeight + this.spacing;
        this.vScrollbar.scrollTo( this.offset );
    }

    return true;
};

VG.UI.TreeWidget.prototype.keyDown=function( keyCode )
{
    if ( !this.controller.selected ) return;

    var index=this.controller.indexOf( this.controller.selected );
    if ( index === -1 ) return;

    if ( keyCode === VG.Events.KeyCodes.ArrowUp && index > 0 )
    {
        if ( this.offset >= index ) {
            this.offset=index-1;
            this.vScrollbar.scrollTo( this.offset * this.itemHeight + (this.offset-1) * this.spacing );
        }
        this.controller.selected=this.controller.at( index - 1 );
    } else
    if ( keyCode === VG.Events.KeyCodes.ArrowDown && index < this.controller.length-1 )
    {
        if ( Math.floor( this.offset + this.visibleItems ) <= index +1 ) {
            this.offset=index+2-Math.floor(this.visibleItems);
            this.vScrollbar.scrollTo( this.offset * this.itemHeight + (this.offset-1) * this.spacing );
        }

        this.controller.selected=this.controller.at( index + 1 );
    }
};

VG.UI.TreeWidget.prototype.mouseMove=function( event )
{
    if ( this.mouseIsDown && this.dragSourceId && this.possibleDnDSource )
    {
        VG.context.workspace.dragOperationStarted( this, this.dragSourceId, this.possibleDnDSource.item );
    }
};

VG.UI.TreeWidget.prototype.mouseDown=function( event )
{
    this.possibleDnDSource=undefined;

    if ( this.needsVScrollbar && this.vScrollbar && this.vScrollbar.rect.contains( event.pos ) ) {
        this.vScrollbar.mouseDown( event );
        return;
    }

    if ( !this.rect.contains( event.pos ) ) return;

/*
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
*/

    var treeItem=this.getItemAtPos( event.pos );
    if ( treeItem ) {
        if ( treeItem.item.children ) {

            if ( event.pos.x - treeItem.rect.x <  VG.UI.stylePool.current.skin.TreeWidget.ChildIndent || !treeItem.item.selectable ) {
                treeItem.item.open=treeItem.item.open ? false : true;
            }

            if ( treeItem.item.selectable ) this.controller.selected=treeItem.item;
        } else
        {
            if ( this.controller.multiSelection )
            {
                if ( event.keysDown.indexOf( VG.Events.KeyCodes.Shift ) >= 0 )
                {
                    if ( !this.controller.isSelected( treeItem.item ) ) this.controller.addToSelection( treeItem.item );
                    else this.controller.removeFromSelection( treeItem.item );
                } else {
                    this.controller.selected=treeItem.item;
                }
            } else {
                this.controller.selected=treeItem.item;
            }
        }
        this.possibleDnDSource=treeItem;
    }
    this.verified=false;
    this.mouseIsDown=true;
};

VG.UI.TreeWidget.prototype.mouseUp=function( event )
{
    this.possibleDnDSource=undefined;
    VG.context.workspace.dndOperation=undefined;
    VG.context.workspace.dndValidDragTarget=undefined;

    this.mouseIsDown=false;
};

VG.UI.TreeWidget.prototype.mouseDoubleClick=function( event )
{
    if ( this.controller.selected ) {
        var selected=this.controller.selected;
        var itemUnderMouse=this.getItemAtPos( event.pos );
        if ( itemUnderMouse ) itemUnderMouse=itemUnderMouse.item;

        if ( selected === itemUnderMouse )
            this.controller.selected.open=this.controller.selected.open ? false : true;
    }
    this.verified=false;
};

VG.UI.TreeWidget.prototype.vHandleMoved=function( offsetInScrollbarSpace )
{
    this.offset=offsetInScrollbarSpace * this.vScrollbar.totalSize / this.vScrollbar.visibleSize;
};

VG.UI.TreeWidget.prototype.verifyScrollbar=function( text )
{
    // --- Check if we have enough vertical space for all items

    this.needsVScrollbar=false;

    this.totalVisibleItemCount=this.countVisibleControllerItems();

    this.totalItemHeight=this.totalVisibleItemCount * this.itemHeight + (this.totalVisibleItemCount-1) * this.spacing;
    this.heightPerItem=this.totalItemHeight / this.controller.length;
    this.visibleItems=this.contentRect.height / this.heightPerItem;
    this.lastTopItem=Math.ceil( this.totalVisibleItemCount - this.visibleItems );

    if ( this.totalItemHeight > this.contentRect.height )
        this.needsVScrollbar=true;
    else this.offset=0;

    if ( this.needsVScrollbar && !this.vScrollbar ) {
        this.vScrollbar=VG.UI.ScrollBar( "TreeWidget Scrollbar" );
        this.vScrollbar.callbackObject=this;
    }

    this.verified=true;
};

VG.UI.TreeWidget.prototype.changed=function()
{
    this.verified=false;
    VG.update();
};

VG.UI.TreeWidget.prototype.selectionChanged=function()
{
    VG.update();
};

VG.UI.TreeWidget.prototype.paintWidget=function( canvas )
{
    this.spacing=VG.UI.stylePool.current.skin.TreeWidget.Spacing;

    if ( !this.rect.equals( this.previousRect ) ) this.verified=false;
    VG.UI.stylePool.current.drawTreeWidget( this, canvas );
    this.previousRect.set( this.rect );
};

VG.UI.TreeWidget.prototype.getItemAtPos=function( pos )
{
    for ( var i=0; i < this.items.length; ++i ) {
        if ( this.items[i].rect.contains( pos ) )
            return this.items[i];
    }
    return null;
};

VG.UI.TreeWidget.prototype.countVisibleControllerItems=function()
{
    var count=0;
    for ( var i=0; i < this.controller.length; ++i ) {
        var item=this.controller.at( i );

        ++count;

        if ( item.children && item.open )
            count+=this.countVisibleControllerChildItems( item );
    }

    return count;
};

VG.UI.TreeWidget.prototype.countVisibleControllerChildItems=function( item )
{
    var count=0;

    for ( var i=0; i < item.children.length; ++i )
    {
        var child=item.children[i];

        ++count;

        if ( child.children && child.open ) {
            count+=this.countVisibleControllerChildItems( child );
        }
    }

    return count;
};