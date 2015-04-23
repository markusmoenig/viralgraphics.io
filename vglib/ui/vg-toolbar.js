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

// ----------------------------------------------------------------- VG.UI.ToolSeparator

VG.UI.ToolSeparator=function()
{
    if ( !(this instanceof VG.UI.ToolSeparator )) return new VG.UI.ToolSeparator();

    VG.UI.Widget.call( this );
    this.name="ToolSeparator";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;
};

VG.UI.ToolSeparator.prototype=VG.UI.Widget();

VG.UI.ToolSeparator.prototype.calcSize=function()
{
    var size=VG.Core.Size( 2, VG.context.style.skin.ToolbarHeight );
    return size;
};

VG.UI.ToolSeparator.prototype.paintWidget=function( canvas )
{
    var size=this.calcSize();
    this.contentRect.set( this.rect );
    
    VG.context.style.drawToolSeparator( canvas, this );
};

// ----------------------------------------------------------------- VG.UI.ToolButton

VG.UI.ToolButton=function( text )
{
    if ( !(this instanceof VG.UI.ToolButton) ) return new VG.UI.ToolButton( text );
    this.text=arguments[0];
    
    VG.UI.Widget.call( this );
    this.name="ToolButton";
    
    this.horizontalExpanding=false;
    this.verticalExpanding=false;
    
    this.role=VG.UI.ActionItemRole.None;
    this.minimumSize.width=VG.context.style.skin.ToolButtonMinimumWidth;
    this._icon=0; 
};

VG.UI.ToolButton.prototype=VG.UI.Widget();

Object.defineProperty( VG.UI.ToolButton.prototype, "icon", {
    get: function() {
        return this._icon;
    },
    set: function( icon ) {
        this._icon=icon;
    }    
});

VG.UI.ToolButton.prototype.calcSize=function()
{
    var size=VG.Core.Size();
    
    if ( !this.icon ) {
        VG.context.workspace.canvas.getTextSize( this.text, size );
        size.width+=10;
        size.height=VG.context.style.skin.ToolbarHeight;
    } else {
        size.set( 22 + 10, VG.context.style.skin.ToolbarHeight );
    }

    if ( size.width < this.minimumSize.width )
        size.width=this.minimumSize.width;

    return size;
};

VG.UI.ToolButton.prototype.mouseDown=function( event )
{
    this.mouseIsDown=true;
};

VG.UI.ToolButton.prototype.mouseUp=function( event )
{
    this.mouseIsDown=false;
};

VG.UI.ToolButton.prototype.paintWidget=function( canvas )
{
    var size=this.calcSize();
    this.contentRect.set( this.rect );
    var size=size.add( -10, 0 );
    
    VG.context.style.drawToolButton( canvas, this );
};

// ----------------------------------------------------------------- VG.UI.Toolbar

VG.UI.Toolbar=function()
{
    if ( !(this instanceof VG.UI.Toolbar) ) return VG.UI.Toolbar.creator( arguments );
    
    VG.UI.Widget.call( this );
    this.name="Toolbar";

    // ---
    
    this.layout=VG.UI.Layout();

    for( var i=0; i < arguments.length; ++i )
        this.addItem( arguments[i] );         
};

VG.UI.Toolbar.prototype=VG.UI.Widget();

VG.UI.Toolbar.prototype.addItem=function( item )
{
    this.layout.addChild( item );
}

VG.UI.Toolbar.prototype.addItems=function()
{
    for( var i=0; i < arguments.length; ++i )
        this.addItem( arguments[i] );    
};

VG.UI.Toolbar.prototype.paintWidget=function( canvas )
{
    this.rect.height=VG.context.style.skin.ToolbarHeight;

    VG.context.style.drawToolbar( canvas, this );
        
    this.layout.rect.set( this.rect );
    this.layout.layout( canvas );
};
