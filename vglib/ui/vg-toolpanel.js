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

// ----------------------------------------------------------------- VG.UI.ToolPanelSeparator

VG.UI.ToolPanelSeparator=function()
{
    if ( !(this instanceof VG.UI.ToolPanelSeparator )) return new VG.UI.ToolPanelSeparator();

    VG.UI.Widget.call( this );
    this.name="ToolPanelSeparator";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;
};

VG.UI.ToolPanelSeparator.prototype=VG.UI.Widget();

VG.UI.ToolPanelSeparator.prototype.calcSize=function()
{
    var size=VG.context.style.skin.ToolPanel.Separator.Size;
    return size;
};

VG.UI.ToolPanelSeparator.prototype.paintWidget=function( canvas )
{
    var size=this.calcSize();
    this.contentRect.set( this.rect );
    
    VG.context.style.drawToolPanelSeparator( canvas, this );
};

// ----------------------------------------------------------------- VG.UI.ToolPanelButton

VG.UI.ToolPanelButton=function( text )
{
    if ( !(this instanceof VG.UI.ToolPanelButton) ) return new VG.UI.ToolPanelButton( text );
    this.text=arguments[0];
    
    VG.UI.Widget.call( this );
    this.name="ToolPanelButton";
    
    this.horizontalExpanding=false;
    this.verticalExpanding=false;
    
    this.role=VG.UI.ActionItemRole.None;
    this.minimumSize.width=VG.context.style.skin.ToolPanelButtonMinimumWidth;
    this._icon=0;
};

VG.UI.ToolPanelButton.prototype=VG.UI.Widget();

Object.defineProperty( VG.UI.ToolPanelButton.prototype, "icon", {
    get: function() {
        return this._icon;
    },
    set: function( icon ) {
        this._icon=icon;
    }    
});

VG.UI.ToolPanelButton.prototype.calcSize=function()
{
    var size=VG.Core.Size();
/*
    if ( !this.icon ) {
        VG.context.workspace.canvas.getTextSize( this.text, size );
        size.width+=10;
        size.height=VG.context.style.skin.ToolPanel.Height;
    } else {
        size.set( 22 + 10, VG.context.style.skin.ToolPanel.Height );
    }*/

    this.minimumSize.width=VG.context.style.skin.ToolPanelButton.MinimumWidth;

    if ( !this.icon ) {
        VG.context.workspace.canvas.getTextSize( this.text, size );
        size.width+=10;
        if ( VG.context.style.skin.ToolPanelButton.ScaleToParentHeight )
            size.height=VG.context.style.skin.ToolPanel.Height;
        else size.height+=10;
    } else {
        if ( VG.context.style.skin.ToolPanelButton.ScaleToParentHeight )
            size.set( 22 + 10, VG.context.style.skin.ToolPanel.Height );
        else size.set( 22 + 10, 22 + 10 );
    }    

    if ( size.width < this.minimumSize.width )
        size.width=this.minimumSize.width;

    return size;
};

VG.UI.ToolPanelButton.prototype.mouseDown=function( event )
{
    this.mouseIsDown=true;
};

VG.UI.ToolPanelButton.prototype.mouseUp=function( event )
{
    this.mouseIsDown=false;
};

VG.UI.ToolPanelButton.prototype.paintWidget=function( canvas )
{
    var size=this.calcSize();
    this.contentRect.set( this.rect );
    var size=size.add( -10, 0 );
    
    VG.context.style.drawToolPanelButton( canvas, this );
};

// ----------------------------------------------------------------- VG.UI.ToolPanelPopupButton

VG.UI.ToolPanelPopupButton=function()
{
    if ( !(this instanceof VG.UI.ToolPanelPopupButton) ) return new VG.UI.ToolPanelPopupButton();

    VG.UI.Widget.call( this );
    this.name="ToolPanelPopupButton";

    this.horizontalExpanding=true;
    this.verticalExpanding=false;

    this.minimumSize.set( 60, 20 );
    this.maximumSize.set( 32768, 20 );

    this.supportsFocus=true;

    this.items=[];
    this.index=-1;
    this.popup=false;
};

VG.UI.ToolPanelPopupButton.prototype=VG.UI.Widget();

VG.UI.ToolPanelPopupButton.prototype.clear=function()
{
    this.items=[];
    this.index=-1;
};

VG.UI.ToolPanelPopupButton.prototype.addItem=function( text )
{
    this.items.push( text );
    if ( this.index === -1 ) this.index=0;
};

VG.UI.ToolPanelPopupButton.prototype.addItems=function()
{
    for( var i=0; i < arguments.length; ++i )
        this.addItem( arguments[i] );
};

VG.UI.ToolPanelPopupButton.prototype.calcSize=function()
{
    var size=VG.Core.Size();
    var minWidth=80;

    VG.context.workspace.canvas.pushFont( VG.context.style.skin.ToolPanelPopupButton.Font );

    for( var i=0; i < this.items.length; ++i ) {
        VG.context.workspace.canvas.getTextSize( this.items[i], size );
        if ( size.width > minWidth ) minWidth=size.width;
    }

    size.set( minWidth, VG.context.style.skin.ToolPanel.Height );

    size=size.add( 36, 0 );
    this.minimumSize.set( size );

    VG.context.workspace.canvas.popFont();

    return size;
};

VG.UI.ToolPanelPopupButton.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.UI.ToolPanelPopupButton.prototype.valueFromModel=function( value )
{
    if ( value === null ) this.index=0;
    else this.index=value; 
};

VG.UI.ToolPanelPopupButton.prototype.applyNewIndex=function( index )
{
    this.index=index;    
    if ( this.collection && this.path )
        this.collection.storeDataForPath( this.path, this.index );

    if ( this.indexChanged ) this.indexChanged( index );
};

VG.UI.ToolPanelPopupButton.prototype.keyDown=function( keyCode )
{
    if ( VG.UI.Widget.prototype.keyDown.call( this, keyCode ) )
        return;

    if ( this.popup )
    {
        if ( keyCode == VG.Events.KeyCodes.Esc )
        {
            this.index=this.oldIndex;
            this.popup=false;
            VG.update();
        }
    } else
    {
        if ( keyCode == VG.Events.KeyCodes.ArrowUp )
        {
            if ( this.index > 0 ) {
                this.applyNewIndex( this.index -1 );
                VG.update();
            }
        } else        
        if ( keyCode == VG.Events.KeyCodes.ArrowDown )
        {
            if ( this.index < (this.items.length -1 )) {
                this.applyNewIndex( this.index + 1 );
                VG.update();
            }
        }
    }
};

VG.UI.ToolPanelPopupButton.prototype.mouseMove=function( event )
{
    if ( this.popup && this.popupRect.contains( event.pos ) )
    {
        var y=event.pos.y - this.popupRect.y;
        var index=y / this.itemHeight;

        if ( index < this.items.length ) {
            this.index=Math.floor( index );
            VG.update();
        }
    }
};

VG.UI.ToolPanelPopupButton.prototype.mouseDown=function( event )
{
    if ( this.rect.contains( event.pos ) ) {

        VG.context.workspace.mouseTrackerWidget=this;

        this.popup=true;
        this.oldIndex=this.index;
    }
};

VG.UI.ToolPanelPopupButton.prototype.mouseUp=function( event )
{
    this.popup=false;
    VG.context.workspace.mouseTrackerWidget=null;

    if ( this.index !== this.oldIndex )
        this.applyNewIndex( this.index );

    VG.update();    
};

VG.UI.ToolPanelPopupButton.prototype.paintWidget=function( canvas )
{
    this.contentRect.set( this.rect );

    if ( this.popup && canvas.delayedPaintWidgets.indexOf( this ) === -1 ) canvas.delayedPaintWidgets.push( this )
    else VG.context.style.drawToolPanelPopupButton( canvas, this );    
};

// ----------------------------------------------------------------- VG.UI.ToolPanel

VG.UI.ToolPanel=function()
{
    if ( !(this instanceof VG.UI.ToolPanel) ) return VG.UI.ToolPanel.creator( arguments );

    VG.UI.Widget.call( this );
    this.name="ToolPanel";

    this.verticalExpanding=false;

    // ---
    
    this.layout=VG.UI.Layout();
    //this.layout.margin.left=0;
    //this.layout.margin.right=0;
    this.layout.margin.set( VG.context.style.skin.ToolPanel.Margin );
    this.layout.spacing=VG.context.style.skin.ToolPanel.Spacing;

    for( var i=0; i < arguments.length; ++i )
        this.addItem( arguments[i] );    
};

VG.UI.ToolPanel.prototype=VG.UI.Widget();

VG.UI.ToolPanel.prototype.calcSize=function()
{
    var layoutSize=this.layout.calcSize();
    var size=VG.Core.Size( layoutSize.width, VG.context.style.skin.ToolPanel.Height );

    this.minimumSize.set( this.layout.minimumSize );
    return size;
};

VG.UI.ToolPanel.prototype.addItem=function( item )
{
    this.layout.addChild( item );
};

VG.UI.ToolPanel.prototype.addItems=function()
{
    for( var i=0; i < arguments.length; ++i )
        this.addItem( arguments[i] );    
};

VG.UI.ToolPanel.prototype.paintWidget=function( canvas )
{
    this.layout.spacing=VG.context.style.skin.ToolPanel.Spacing;
    this.layout.margin.set( VG.context.style.skin.ToolPanel.Margin );

    VG.context.style.drawToolPanel( canvas, this );

    for( var i=0; i < this.layout.children.length; ++i )
    {
        if ( this.layout.children[i] instanceof VG.UI.TextLineEdit )
            this.layout.children[i].backgroundColor=VG.context.style.skin.Widget.BackgroundColor;
    }

    this.layout.rect.set( this.rect );
    this.layout.layout( canvas );
};