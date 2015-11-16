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

// ----------------------------------------------------------------- VG.UI.TreeWidget

VG.UI.TreeWidgetItem=function( item, rect )
{    
    if ( !(this instanceof VG.UI.TreeWidgetItem) ) return new VG.UI.TreeWidgetItem( item, rect );

    this.item=item;
    this.rect=VG.Core.Rect( rect );
};

VG.UI.TreeWidget=function()
{
    if ( !(this instanceof VG.UI.TreeWidget) ) return new VG.UI.TreeWidget();
    
    VG.UI.Widget.call( this );
    this.name="TreeWidget";

    this.offset=0;

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
};

VG.UI.TreeWidget.prototype=VG.UI.Widget();

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
}

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

    var treeItem=this.getItemAtPos( event.pos );
    if ( treeItem ) {
        if ( treeItem.item.children ) {

            if ( event.pos.x - treeItem.rect.x <  VG.UI.stylePool.current.skin.TreeWidget.ChildIndent || !treeItem.item.selectable ) {
                treeItem.item.open=treeItem.item.open ? false : true;
            }

            if ( treeItem.item.selectable ) this.controller.selected=treeItem.item;
        } else
        {
            this.controller.selected=treeItem.item;
            this.possibleDnDSource=treeItem;
        }
    }
    this.verified=false;
    this.mouseIsDown=true;
};

VG.UI.TreeWidget.prototype.mouseUp=function( event )
{
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

    //console.log( this.totalVisibleItemCount );

    this.totalItemHeight=this.totalVisibleItemCount * this.itemHeight + (this.totalVisibleItemCount-1) * this.spacing;
    this.heightPerItem=this.totalItemHeight / this.controller.length;
    this.visibleItems=this.contentRect.height / this.heightPerItem;
    this.lastTopItem=Math.ceil( this.totalVisibleItemCount - this.visibleItems );

    if ( this.totalItemHeight > this.contentRect.height )
        this.needsVScrollbar=true;

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