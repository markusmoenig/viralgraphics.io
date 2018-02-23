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

 // ----------------------------------------------------------------- VG.UI.DecoratedToolSeparator

VG.UI.DecoratedToolSeparator=function()
{
    if ( !(this instanceof VG.UI.DecoratedToolSeparator )) return new VG.UI.DecoratedToolSeparator();

    VG.UI.Widget.call( this );
    this.name="DecoratedToolSeparator";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;
};

VG.UI.DecoratedToolSeparator.prototype=VG.UI.Widget();

VG.UI.DecoratedToolSeparator.prototype.calcSize=function()
{
    this.preferredSize.set( VG.UI.stylePool.current.skin.DecoratedToolBar.Separator.Size );
    return this.preferredSize;
};

VG.UI.DecoratedToolSeparator.prototype.paintWidget=function( canvas )
{
    var size=this.calcSize();
    this.contentRect.set( this.rect );

    VG.UI.stylePool.current.drawDecoratedToolSeparator( this, canvas );
};

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
    var size=VG.Core.Size( 2, VG.UI.stylePool.current.skin.ToolBar.Separator.Size.height );
    return size;
};

VG.UI.ToolSeparator.prototype.paintWidget=function( canvas )
{
    var size=this.calcSize();
    this.contentRect.set( this.rect );

    VG.UI.stylePool.current.drawToolSeparator( this, canvas );
};

// ----------------------------------------------------------------- VG.UI.ToolBarButton

VG.UI.ToolBarButton=function( text, svgGroupName )
{
    if ( !(this instanceof VG.UI.ToolBarButton) ) return new VG.UI.ToolBarButton( text, svgGroupName );

    if ( svgGroupName ) {
        this.svgName=text ? text : undefined;
        this.svgGroupName=svgGroupName ? svgGroupName : undefined;
    } else
    this.text=text ? text : "";

    VG.UI.Widget.call( this );
    this.name="ToolBarButton";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;

    this.role=VG.UI.ActionItemRole.None;
    this.minimumSize.width=VG.UI.stylePool.current.skin.ToolBarButton.MinimumWidth;
    this._icon=0;

    this.checkable=false;
    this.checked=false;
    this.exclusions=[];
};

VG.UI.ToolBarButton.prototype=VG.UI.Widget();

Object.defineProperty( VG.UI.ToolBarButton.prototype, "icon", {
    get: function() {
        return this._icon;
    },
    set: function( icon ) {
        this._icon=icon;
    }
});

VG.UI.ToolBarButton.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.UI.ToolBarButton.prototype.valueFromModel=function( value )
{
    //console.log( "TextEdit.valueFromModel: " + value );

    if ( value === null ) this.checked=false;
    else this.checked=value;

    if ( this.changed )
        this.changed.call( VG.context, value, false, this );

    VG.update();
};

VG.UI.ToolBarButton.prototype.addExclusions=function()
{
    this.checkable=true;

    for ( var i=0; i < arguments.length; ++i ) {
        if ( this.exclusions.indexOf( arguments[i] ) === -1 ) this.exclusions.push( arguments[i] );

        if ( arguments[i].exclusions.indexOf( this ) === -1 )
        {
            arguments[i].exclusions.push( this );
            arguments[i].checkable=true;

            for ( var ai=0; ai < arguments.length; ++ai ) {
                if ( i !== ai ) arguments[i].exclusions.push( arguments[ai] );
            }
        }
    }
};

VG.UI.ToolBarButton.prototype.calcSize=function( canvas )
{
    var size=this.preferredSize;

    if ( !this.icon && !this.svgName && !this.svg && this.text )
    {
        canvas.pushFont( canvas.style.skin.ToolBarButton.Font );
        this.minimumSize.width=canvas.style.skin.ToolBarButton.MinimumWidth;

        canvas.getTextSize( this.text, size );
        size.width+=canvas.style.skin.ToolBarButton.TextMargin.width; size.height=canvas.getLineHeight() + canvas.style.skin.ToolBarButton.TextMargin.height;

        if ( size.width < this.minimumSize.width )
            size.width=this.minimumSize.width;

        if ( this.__vgInsideToolBar ) size.height+=2;

        canvas.popFont();
    } else  {
        if ( this.__vgInsideToolBar ) {
            size.copy( canvas.style.skin.ToolBar.IconSize );
        }
        else
        if ( this.iconSize ) size.copy( this.iconSize );
        else size.set( canvas.style.skin.ToolBarButton.IconSize.width, canvas.style.skin.ToolBarButton.IconSize.height );
    }

    if ( this.parent && this.parent.decorated )
        size.set( 33, 33 );

    return size;
};

VG.UI.ToolBarButton.prototype.mouseDown=function( event )
{
    if ( !this.disabled && this.rect.contains( event.pos) )
        this.mouseIsDown=true;
};

VG.UI.ToolBarButton.prototype.mouseUp=function( event )
{
    if ( !this.disabled && this.rect.contains( event.pos) )
    {
        if ( this.checkable && this.mouseIsDown )
        {
            if ( this.exclusions.length && this.checked === false )
            {
                this.checked=true;
                var undo;

                if ( this.collection && this.path )
                    undo=this.collection.storeDataForPath( this.path, this.checked, false, true, this.undoText );

                for ( var i=0; i < this.exclusions.length; ++i )
                {
                    var exclusion=this.exclusions[i];
                    exclusion.checked=false;

                    if ( this.collection && this.path && undo ) {
                        undo.addSubItem( exclusion.path, exclusion.checked );

                        if ( exclusion.changed ) exclusion.changed( exclusion.checked, true, exclusion );
                    }
                }

                if ( this.changed ) this.changed( this.checked, true, this );
            } else
            if ( !this.exclusions.length )
            {
                this.checked=!this.checked;

                if ( this.collection && this.path )
                    this.collection.storeDataForPath( this.path, this.checked, undefined, undefined, this.undoText  );

                if ( this.changed ) this.changed( this.checked, true, this );
            }
        }
        this.mouseIsDown=false;
    }
};

VG.UI.ToolBarButton.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawToolBarButton( this, canvas );
};

// ----------------------------------------------------------------- VG.UI.ToolButton

VG.UI.ToolButton=function( iconName, svgGroupName )
{
    if ( !(this instanceof VG.UI.ToolButton) ) return new VG.UI.ToolButton( iconName, svgGroupName );

    if ( svgGroupName ) {
        this.svgName=iconName ? iconName : undefined;
        this.svgGroupName=svgGroupName ? svgGroupName : undefined;
    } else
    this.iconName=iconName ? iconName : undefined;

    VG.UI.Widget.call( this );
    this.name="ToolButton";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;

    this.role=VG.UI.ActionItemRole.None;
    this.minimumSize.width=VG.UI.stylePool.current.skin.ToolButton.Size.width;
    this._icon=0;

    this.checkable=false;
    this.checked=false;
    this.exclusions=[];
    this.preferredSize=VG.UI.stylePool.current.skin.ToolButton.Size;
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

VG.UI.ToolButton.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.UI.ToolButton.prototype.valueFromModel=function( value )
{
    //console.log( "TextEdit.valueFromModel: " + value );

    if ( value === null ) this.checked=false;
    else this.checked=value;

    if ( this.changed )
        this.changed.call( VG.context, value, false, this );

    VG.update();
};

VG.UI.ToolButton.prototype.addExclusions=function()
{
    this.checkable=true;

    for ( var i=0; i < arguments.length; ++i ) {
        if ( this.exclusions.indexOf( arguments[i] ) === -1 ) this.exclusions.push( arguments[i] );

        if ( arguments[i].exclusions.indexOf( this ) === -1 )
        {
            arguments[i].exclusions.push( this );
            arguments[i].checkable=true;

            for ( var ai=0; ai < arguments.length; ++ai ) {
                if ( i !== ai ) arguments[i].exclusions.push( arguments[ai] );
            }
        }
    }
};

VG.UI.ToolButton.prototype.calcSize=function( canvas )
{
    var size=this.preferredSize;

    return size;
};

VG.UI.ToolButton.prototype.mouseDown=function( event )
{
    if ( !this.disabled && this.rect.contains( event.pos) )
        this.mouseIsDown=true;
};

VG.UI.ToolButton.prototype.mouseUp=function( event )
{
    if ( !this.disabled && this.rect.contains( event.pos) )
    {
        if ( this.checkable && this.mouseIsDown )
        {
            if ( this.exclusions.length && this.checked === false )
            {
                this.checked=true;
                var undo;

                if ( this.collection && this.path )
                    undo=this.collection.storeDataForPath( this.path, this.checked, false, true, this.undoText );

                for ( var i=0; i < this.exclusions.length; ++i )
                {
                    var exclusion=this.exclusions[i];
                    exclusion.checked=false;

                    if ( this.collection && this.path && undo ) {
                        undo.addSubItem( exclusion.path, exclusion.checked );

                        if ( exclusion.changed ) exclusion.changed( exclusion.checked, true, exclusion );
                    }
                }

                if ( this.changed ) this.changed( this.checked, true, this );
            } else
            if ( !this.exclusions.length )
            {
                this.checked=!this.checked;

                if ( this.collection && this.path )
                    this.collection.storeDataForPath( this.path, this.checked, undefined, undefined, this.undoText );

                if ( this.changed ) this.changed( this.checked, true, this );
            }
        }
        this.mouseIsDown=false;
    }
};

VG.UI.ToolButton.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawToolButton( this, canvas );
};

// ----------------------------------------------------------------- VG.UI.ToolBarButtonGroup

VG.UI.ToolBarButtonGroup=function( noneExclusiv )
{
    if ( !(this instanceof VG.UI.ToolBarButtonGroup) ) return new VG.UI.ToolBarButtonGroup( noneExclusiv );

    VG.UI.Widget.call( this );
    this.name="ToolBarButtonGroup";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;

    this.layout=VG.UI.Layout();
    this.layout.margin.clear();
    this.layout.spacing=1;

    this._index=-1;

    this.childWidgets=[];
    this.noneExclusiv=noneExclusiv;
};

VG.UI.ToolBarButtonGroup.prototype=VG.UI.Widget();

Object.defineProperty( VG.UI.ToolBarButtonGroup.prototype, "index", {
    get: function() {
        return this._index;
    },
    set: function( index ) {
        this._index=index;

        for ( var i=0; i < this.layout.children.length; ++i )
            this.layout.children[i].checked=false;

        this.layout.children[index].checked=true;

        if ( this.changed ) this.changed( index, true, this );
    }
});

Object.defineProperty( VG.UI.ToolBarButtonGroup.prototype, "__vgInsideToolBar", {
    set: function( index ) {
        for ( var i=0; i < this.layout.children.length; ++i ) {
            var child=this.layout.children[i];
            child.__vgInsideToolBar=true;
        }
    }
});

VG.UI.ToolBarButtonGroup.prototype.calcSize=function( canvas )
{
    return this.layout.calcSize( canvas );
};

VG.UI.ToolBarButtonGroup.prototype.addImageButton=function( iconName, toolTip )
{
    var button=VG.UI.ToolBarButton();
    button.icon=VG.Utils.getImageByName( iconName );
    button.toolTip=toolTip;

    this.addButton( button );

    return button;
};

VG.UI.ToolBarButtonGroup.prototype.addSVGButton=function( svgName, groupName, toolTip )
{
    var button=VG.UI.ToolBarButton();
    button.svgName=svgName;
    button.svgGroupName=groupName;
    button.toolTip=toolTip;

    this.addButton( button );

    return button;
};

VG.UI.ToolBarButtonGroup.prototype.addTextButton=function( text, toolTip )
{
    var button=VG.UI.ToolBarButton( text );
    button.toolTip=toolTip;

    this.addButton( button );

    return button;
};

VG.UI.ToolBarButtonGroup.prototype.addButton=function( button )
{
    //button.iconSize=VG.Core.Size( 28, 24 );
    button.checkable=true;
    button.changed=function( value, cont, object ) {
        if ( !this.noneExclusiv )
            this.index=this.layout.children.indexOf( object );
        else {
            if ( this.changed ) this.changed( this.layout.children.indexOf( object ), false, object );
        }
    }.bind( this );

    this.layout.addChild( button );
    this.childWidgets.push( button );

    var size=this.layout.calcSize( VG.context.workspace.canvas );

    this.minimumSize.copy( size );
    this.maximumSize.copy( size );
    this.preferredSize.copy( size );

    if ( this._index === -1 ) this.index=0;

    if ( this.noneExclusiv ) return;
    for ( var i=0; i < this.layout.children.length; ++i )
    {
        var child=this.layout.children[i];

        if ( child !== button ) {
            child.exclusions.push( button );
            button.exclusions.push( child );
        }
    }
};

VG.UI.ToolBarButtonGroup.prototype.paintWidget=function( canvas )
{
    this.layout.rect.copy( this.rect);
    this.layout.layout( canvas );
};

// ----------------------------------------------------------------- VG.UI.ToolButtonGroup

VG.UI.ToolButtonGroup=function( noneExclusiv )
{
    if ( !(this instanceof VG.UI.ToolButtonGroup) ) return new VG.UI.ToolButtonGroup( noneExclusiv );

    VG.UI.Widget.call( this );
    this.name="ToolButtonGroup";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;

    this.layout=VG.UI.Layout();
    this.layout.margin.clear();
    this.layout.spacing=1;

    this._index=-1;

    this.childWidgets=[];
    this.noneExclusiv=noneExclusiv;
};

VG.UI.ToolButtonGroup.prototype=VG.UI.Widget();

Object.defineProperty( VG.UI.ToolButtonGroup.prototype, "index", {
    get: function() {
        return this._index;
    },
    set: function( index ) {
        this._index=index;

        for ( var i=0; i < this.layout.children.length; ++i )
            this.layout.children[i].checked=false;

        this.layout.children[index].checked=true;

        if ( this.changed ) this.changed( index, true, this );
    }
});

Object.defineProperty( VG.UI.ToolButtonGroup.prototype, "__vgInsideToolBar", {
    set: function( index ) {
        for ( var i=0; i < this.layout.children.length; ++i ) {
            var child=this.layout.children[i];
            child.__vgInsideToolBar=true;
        }
    }
});

VG.UI.ToolButtonGroup.prototype.calcSize=function( canvas )
{
    return this.layout.calcSize( canvas );
};

VG.UI.ToolButtonGroup.prototype.addImageButton=function( iconName, toolTip )
{
    var button=VG.UI.ToolButton();
    button.icon=VG.Utils.getImageByName( iconName );
    button.toolTip=toolTip;

    this.addButton( button );

    return button;
};

VG.UI.ToolButtonGroup.prototype.addSVGButton=function( svgName, groupName, toolTip )
{
    var button=VG.UI.ToolButton();
    button.svgName=svgName;
    button.svgGroupName=groupName;
    button.toolTip=toolTip;

    this.addButton( button );

    return button;
};

VG.UI.ToolButtonGroup.prototype.addTextButton=function( text, toolTip )
{
    var button=VG.UI.ToolButton( text );
    button.toolTip=toolTip;

    this.addButton( button );

    return button;
};

VG.UI.ToolButtonGroup.prototype.addButton=function( button )
{
    //button.iconSize=VG.Core.Size( 28, 24 );
    button.checkable=true;
    button.changed=function( value, cont, object ) {
        if ( !this.noneExclusiv )
            this.index=this.layout.children.indexOf( object );
        else {
            if ( this.changed ) this.changed( this.layout.children.indexOf( object ), false, object );
        }
    }.bind( this );

    this.layout.addChild( button );
    this.childWidgets.push( button );

    var size=this.layout.calcSize( VG.context.workspace.canvas );

    this.minimumSize.copy( size );
    this.maximumSize.copy( size );
    this.preferredSize.copy( size );

    if ( this._index === -1 ) this.index=0;

    if ( this.noneExclusiv ) return;
    for ( var i=0; i < this.layout.children.length; ++i )
    {
        var child=this.layout.children[i];

        if ( child !== button ) {
            child.exclusions.push( button );
            button.exclusions.push( child );
        }
    }
};

VG.UI.ToolButtonGroup.prototype.paintWidget=function( canvas )
{
    this.layout.rect.copy( this.rect);
    this.layout.layout( canvas );
};

// ----------------------------------------------------------------- VG.UI.DecoratedQuickMenu

VG.UI.DecoratedQuickMenuItem=function( text, callback, iconName, svgName, svgGroupName )
{
    if ( !(this instanceof VG.UI.DecoratedQuickMenuItem) ) return new VG.UI.DecoratedQuickMenuItem( text, callback, iconName, svgName, svgGroupName );

    this.text=text;
    this.callback=callback;

    this.rect=VG.Core.Rect();

    // --- Sub Menu

    this.index=undefined;
    this.items=[];
    this.itemsRect=VG.Core.Rect();
};

VG.UI.DecoratedQuickMenuItem.prototype.addItem=function( text, callback, iconName, svgName, svgGroupName )
{
    var item=new VG.UI.DecoratedQuickMenuItem( text, callback, iconName, svgName, svgGroupName );

    item.text=text;
    item.callback=callback;

    item.rect=VG.Core.Rect();

    this.items.push( item );

    return item;
};

// ----------------------------------------------------------------- VG.UI.DecoratedQuickMenu

VG.UI.DecoratedQuickMenu=function()
{
    if ( !(this instanceof VG.UI.DecoratedQuickMenu) ) return new VG.UI.DecoratedQuickMenu();

    VG.UI.Widget.call( this );
    this.name="DecoratedQuickMenu";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;

    this.minimumSize.set( VG.UI.stylePool.current.skin.DecoratedQuickMenu.Size.width, VG.UI.stylePool.current.skin.DecoratedQuickMenu.Size.height );
    this.maximumSize.set( VG.UI.stylePool.current.skin.DecoratedQuickMenu.Size.width, VG.UI.stylePool.current.skin.DecoratedQuickMenu.Size.height );

    this.role=VG.UI.ActionItemRole.None;
    this._icon=0;

    this.open=false;
    this.popupRect=VG.Core.Rect();
    this.closeButtonRect=VG.Core.Rect();
    this.closeButtonHover=false;

    this.items=[];
};

VG.UI.DecoratedQuickMenu.prototype=VG.UI.Widget();

VG.UI.DecoratedQuickMenu.prototype.calcSize=function()
{
    return this.minimumSize;
};

VG.UI.DecoratedQuickMenu.prototype.addItem=function( text, callback )
{
    var item=VG.UI.DecoratedQuickMenuItem( text, callback );
    this.items.push( item );

    return item;
};

VG.UI.DecoratedQuickMenu.prototype.mouseDown=function( event )
{
    var oldOpenState=this.open, selItem;

    // --- Test for Main Menu Click
    if ( this.popupRect.contains( event.pos ) )
    {
        if ( this.open && this.index !== undefined )
        {
            selItem=this.items[this.index];
            if ( selItem && !selItem.items.length && !selItem.disabled && selItem.callback ) selItem.callback();
        }
    }

    // --- Test for Sub Menu Click

    if ( this.open && this.index !== undefined ) {
        selItem=this.items[this.index];
        if ( selItem && selItem.items.length && selItem.index !== undefined ) {
            selItem=selItem.items[selItem.index];
            if ( selItem && !selItem.disabled && selItem.callback ) selItem.callback();
        }
    }

    if ( !VG.UI.stylePool.current.skin.DecoratedQuickMenu.UsesCloseButton )
    {
        if ( this.rect.contains( event.pos) )
        {
            this.mouseIsDown=true;
            this.open=!this.open;
        } else this.open=false;
    } else
    {
        this.mouseIsDown=true;
        if ( !this.open ) this.open=true;
        else
        {
            if ( this.closeButtonRect.contains( event.pos ) || this.popupRect.contains( event.pos ) )
                this.open=false;
        }
    }

    if ( this.open ) VG.context.workspace.mouseTrackerWidget=this;
    else VG.context.workspace.mouseTrackerWidget=null;

    if ( this.open && !oldOpenState && this.aboutToShow )
        this.aboutToShow();

    VG.update();
};

VG.UI.DecoratedQuickMenu.prototype.mouseUp=function( event )
{
    this.noStatusTip = false;
    if ( this.rect.contains( event.pos) )
    {
        this.mouseIsDown=false;
    }
};

VG.UI.DecoratedQuickMenu.prototype.mouseMove=function( event )
{
    this.closeButtonHover=false;
    if ( VG.UI.stylePool.current.skin.DecoratedQuickMenu.UsesCloseButton && this.open && this.closeButtonRect && this.closeButtonRect.contains( event.pos ) )
    {
        this.closeButtonHover=true;
    }

    if ( this.open && this.popupRect )
    {
        var item, i;

        if ( this.popupRect.contains( event.pos ) )
        {
            var y=event.pos.y - this.popupRect.y;
            var index;

            for ( i=0; i < this.items.length; ++i ) {
                item=this.items[i];

                if ( item.rect.contains( event.pos ) && item.text && item.text.length )
                    { index=i; break; }
            }

            if ( index !== undefined && index < this.items.length ) {
                this.index=index;
                VG.update();

                if ( VG.context.workspace.statusBar ) {
                    if ( this.items[index].statusTip && !this.items[index].disabled ) {
                        VG.context.workspace.statusBar.message( this.items[index].statusTip, 4000 );
                        this.noStatusTip = true;
                    }
                    else VG.context.workspace.statusBar.message( "" );
                }
            }
        }

        if ( this.index !== undefined )
        {
            item=this.items[this.index];
            item.index=undefined;

            if ( item.items.length && item.itemsRect.contains( event.pos ) )
            {
                for ( i=0; i < item.items.length; ++i ) {
                    var childItem=item.items[i];

                    if ( childItem.rect.contains( event.pos ) && childItem.text && childItem.text.length )
                        { item.index=i; VG.update(); break; }
                }
            }
        }
    }
};

VG.UI.DecoratedQuickMenu.prototype.paintWidget=function( canvas )
{
    this.contentRect.set( this.rect );

    if ( this.open && canvas.delayedPaintWidgets.indexOf( this ) === -1 ) canvas.delayedPaintWidgets.push( this );
    else VG.UI.stylePool.current.drawDecoratedQuickMenu( this, canvas );
};

// ----------------------------------------------------------------- VG.UI.DecoratedToolBar

VG.UI.DecoratedToolBar=function()
{
    if ( !(this instanceof VG.UI.DecoratedToolBar) ) return VG.UI.DecoratedToolBar.creator( arguments );

    VG.UI.Widget.call( this );
    this.name="DecoratedToolBar";

    // ---

    this.layout=VG.UI.Layout();
    this.layout.decorated=true;
    this.layout.spacing=VG.UI.stylePool.current.skin.DecoratedToolBar.Spacing;
    this.layout.margin.right=12;

    for( var i=0; i < arguments.length; ++i )
        this.addItem( arguments[i] );

    this.maximumSize.height=VG.UI.stylePool.current.skin.DecoratedToolBar.Height;
};

VG.UI.DecoratedToolBar.prototype=VG.UI.Widget();

VG.UI.DecoratedToolBar.prototype.addItem=function( item )
{
    this.layout.addChild( item );
};

VG.UI.DecoratedToolBar.prototype.addItems=function()
{
    for( var i=0; i < arguments.length; ++i )
        this.addItem( arguments[i] );
};

VG.UI.DecoratedToolBar.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawDecoratedToolBar( this, canvas );

    this.layout.rect.set( this.contentRect );
    this.layout.layout( canvas );
};

// ----------------------------------------------------------------- VG.UI.ToolBar

VG.UI.ToolBar=function()
{
    if ( !(this instanceof VG.UI.ToolBar) ) return VG.UI.ToolBar.creator( arguments );

    VG.UI.Widget.call( this );
    this.name="ToolBar";

    // ---

    this.layout=VG.UI.Layout();

    for( var i=0; i < arguments.length; ++i )
        this.addItem( arguments[i] );

    this.maximumSize.height=VG.UI.stylePool.current.skin.ToolBar.Height;
};

VG.UI.ToolBar.prototype=VG.UI.Widget();

VG.UI.ToolBar.prototype.addItem=function( item )
{
    this.layout.addChild( item );
    item.__vgInsideToolBar=true;
};

VG.UI.ToolBar.prototype.addItems=function()
{
    for( var i=0; i < arguments.length; ++i )
        this.addItem( arguments[i] );
};

VG.UI.ToolBar.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawToolBar( this, canvas );

    this.layout.rect.set( this.contentRect );
    this.layout.layout( canvas );
};

// ----------------------------------------------------------------- VG.UI.ToolSettings

VG.UI.ToolSettings=function( label, options )
{
    if ( !(this instanceof VG.UI.ToolSettings) ) return new VG.UI.ToolSettings( label, options );

    VG.UI.Widget.call( this );
    this.name="ToolSettings";

    this.options = options || {};
    this.label = label;
    this.label.textMargin = VG.Core.Size( 12, 12 );

    this.horizontalExpanding=false;
    this.verticalExpanding=false;

    this.label.minimumSize.set( VG.UI.stylePool.current.skin.ToolSettings.Size.width, VG.UI.stylePool.current.skin.ToolSettings.Size.height );
    this.label.maximumSize.set( VG.UI.stylePool.current.skin.ToolSettings.Size.width, VG.UI.stylePool.current.skin.ToolSettings.Size.height );

    this.open=false;
    this.popupRect=VG.Core.Rect();
    this.closeButtonRect=VG.Core.Rect();

    this.widget = VG.UI.Widget();
    this.widget.supportsFocus = true;
    this.widget.layout = this.options.layout;
    this.widget.parent = this;
    this.widget.mouseDown=function( event ) {
        if ( this.open && this.closeButtonRect.contains( event.pos ) ) {

            if ( VG.context.workspace.overlayWidget.parent ) {
                VG.context.workspace.overlayWidget.parent.open = false;
                VG.context.workspace.overlayWidget.parent.childWidgets = [];
            }

            this.open = false;
            VG.context.workspace.overlayWidget = undefined;
        }
    }.bind( this );

    this.childWidgets = [];
};

VG.UI.ToolSettings.prototype=VG.UI.Widget();

VG.UI.ToolSettings.prototype.calcSize=function()
{
    if ( this.label ) return this.label.preferredSize;
    else return this.minimumSize;
};

VG.UI.ToolSettings.prototype.addItem=function( text, callback )
{
    let item=VG.UI.DecoratedQuickMenuItem( text, callback );
    this.items.push( item );

    return item;
};

VG.UI.ToolSettings.prototype.mouseDown=function( event )
{
    let oldOpenState=this.open;

    let closeExisting = () => {
        if ( VG.context.workspace.overlayWidget && VG.context.workspace.overlayWidget !== this.widget ) {
            if ( VG.context.workspace.overlayWidget.parent ) {
                VG.context.workspace.overlayWidget.parent.open = false;
                VG.context.workspace.overlayWidget.parent.childWidgets = [];
            }
            VG.context.workspace.overlayWidget = undefined;
        }
    };

    if ( this.rect.contains( event.pos) )
    {
        this.mouseIsDown=true;
        this.open=!this.open;

        // if ( this.popupRect.contains( event.pos ) )
            // this.open=false;
    }

    if ( this.open && !oldOpenState )
    {
        if ( this.aboutToShow )
            this.aboutToShow();

        if ( this.widget.layout ) {
            closeExisting();
            VG.context.workspace.overlayWidget = this.widget;
            this.setFocus( this.widget );
        }
    }

    if ( this.open ) {
        closeExisting();
        VG.context.workspace.overlayWidget = this.widget;
        this.childWidgets = [this.widget];
    } else {
        VG.context.workspace.overlayWidget = undefined;
        this.childWidgets = [];
    }

    VG.update();
};

VG.UI.ToolSettings.prototype.mouseUp=function( event )
{
    // if ( this.rect.contains( event.pos) )
    {
        this.mouseIsDown=false;
    }
};

VG.UI.ToolSettings.prototype.paintWidget=function( canvas )
{
    this.contentRect.copy( this.rect );

    if ( this.open && canvas.delayedPaintWidgets.indexOf( this ) === -1 ) canvas.delayedPaintWidgets.unshift( this );
    else VG.UI.stylePool.current.drawToolSettings( this, canvas );
};