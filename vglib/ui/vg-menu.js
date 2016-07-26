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
// ----------------------------------------------------------------- VG.UI.MenuItem

VG.UI.MenuItem=function( text, iconName, clicked, shortcut )
{
    if ( !(this instanceof VG.UI.MenuItem) ) return VG.UI.MenuItem.creator( arguments );

    this.text=text;
    this.iconName=iconName;
    this.clicked=clicked;
    this.shortcut=shortcut;

    this._disabled=false;
    this.exclusions=[];
    this.checkable=false;
    this._checked=false;

    this._rect=VG.Core.Rect();

    this.id=-1;
};

Object.defineProperty( VG.UI.MenuItem.prototype, "disabled", 
{
    get: function() {
        return this._disabled;
    },
    set: function( disabled ) {
        this._disabled=disabled;
        if ( VG.setNativeMenuItemState ) VG.setNativeMenuItemState( this.id, disabled, this._checked );
    }    
});

Object.defineProperty( VG.UI.MenuItem.prototype, "checked", 
{
    get: function() {
        return this._checked;
    },
    set: function( checked ) {
        this._checked=checked;
        if ( VG.setNativeMenuItemState ) VG.setNativeMenuItemState( this.id, this._disabled, checked );
    }    
});

VG.UI.MenuItem.prototype.addExclusions=function()
{
    this.checkable=true;

    for ( var i=0; i < arguments.length; ++i ) {
        if ( this.exclusions.indexOf( arguments[i] ) === -1 ) this.exclusions.push( arguments[i] );

        if ( arguments[i].exclusions.indexOf( this ) === -1 )
        {
            arguments[i].exclusions.push( this );
            arguments[i].checkable=true;
        }

        for ( var k=0; k < arguments.length; ++k )
            if ( arguments[i] !== arguments[k] && arguments[i].exclusions.indexOf( arguments[k] ) === -1 ) arguments[i].exclusions.push( arguments[k] );
    }
};

// ----------------------------------------------------------------- VG.UI.Menubar

VG.UI.MenuBar=function()
{
    if ( !(this instanceof VG.UI.MenuBar) ) return new VG.UI.MenuBar();

    VG.UI.Widget.call( this );
    this.name="MenuBar";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;

    this.minimumSize.set( 0, 26 );
    this.maximumSize.set( 32768, 20 );

    this.supportsFocus=false;

    this.items=[];
    this.active=null;

    this.itemIdCounter=1;
};

VG.UI.MenuBar.prototype=VG.UI.Widget();

VG.UI.MenuBar.prototype.addMenu=function( text, callback )
{
    var menu=new VG.UI.Menu( text, callback, this );

    if ( VG.addNativeMenu ) VG.addNativeMenu( menu );

    this.items.push( menu );

    return menu;
};

VG.UI.MenuBar.prototype.activateMenu=function( menu )
{
    this.active=menu;

    if ( menu.aboutToShow ) menu.aboutToShow();
    VG.update();    
};

VG.UI.MenuBar.prototype.mouseMove=function( event )
{
    if ( this.active )
    {
        for( var i=0; i < this.items.length; ++i )
        {
            var item=this.items[i];

            if ( item.rect.contains( event.pos ) ) {
                if ( this.active !== item ) {
                    this.activateMenu( item );
                }
            }
        }
    }
};

VG.UI.MenuBar.prototype.mouseDown=function( event )
{
    if ( !this.active )
    {
        for( var i=0; i < this.items.length; ++i )
        {
            var item=this.items[i];

            if ( item.rect.contains( event.pos ) ) {
                this.activateMenu( item );
            }
        }
    } else 
    {
        this.active=null;
        VG.context.workspace.mouseTrackerWidget=null;        
    }
};

VG.UI.MenuBar.prototype.mouseUp=function( event )
{  
};

VG.UI.MenuBar.prototype.menuItemById=function( id )
{
    for( var i=0; i < this.items.length; ++i )
    {
        var menu=this.items[i];

        for( var m=0; m < menu.items.length; ++m )
        {
            var menuItem=menu.items[m];

            if ( menuItem.id !== -1 && menuItem.id === id )
                return menuItem;
        }
    }
    return -1;
};

VG.UI.MenuBar.prototype.clickMenuItemById=function( id )
{
    for( var i=0; i < this.items.length; ++i )
    {
        var menu=this.items[i];

        for( var m=0; m < menu.items.length; ++m )
        {
            var menuItem=menu.items[m];

            if ( menuItem.id !== -1 && menuItem.id === id )
            {
                menu.externalClickItem=menuItem;
                //menu.externalClickTime=Date.now();

                menu.clickItem( menuItem );
            }
        }
    }
    return -1;
};

VG.UI.MenuBar.prototype.calcSize=function( canvas )
{
    var size=VG.Core.Size( VG.UI.MaxLayoutSize, 26 );
    return size;
};

VG.UI.MenuBar.prototype.paintWidget=function( canvas )
{
    if ( !this.visible ) return;
    VG.UI.stylePool.current.drawMenuBar( this, canvas );

    if ( this.active && canvas.delayedPaintWidgets.indexOf( this.active ) === -1 )  {

        this.active.visible=true;
        canvas.delayedPaintWidgets.push( this.active );
        VG.context.workspace.mouseTrackerWidget=this.active;
    }
};

// ----------------------------------------------------------------- VG.UI.Menu

VG.UI.Menu=function( text, callback, menubar )
{
    if ( !(this instanceof VG.UI.Menu) ) return VG.UI.Menu.creator( arguments );

    VG.UI.Widget.call( this );
    this.name="Menu";

    this.text=text;
    this.aboutToShow=callback;
    this.parent=menubar;

    this.horizontalExpanding=false;
    this.verticalExpanding=false;

    this.minimumSize.set( 60, 20 );
    this.maximumSize.set( 32768, 20 );

    this.supportsFocus=true;

    this.items=[];
    this.selected=null;
    this.separatorCount=0;
};

VG.UI.Menu.prototype=VG.UI.Widget();

VG.UI.Menu.prototype.addItem=function( text, icon, callback, shortcut )
{
    var item=VG.UI.MenuItem( text, icon, callback, shortcut );
    this.addMenuItem( item );

    return item;
};

VG.UI.Menu.prototype.addMenuItem=function( menuItem )
{
    this.items.push( menuItem );

    if ( this.parent) menuItem.id=this.parent.itemIdCounter++;
    if ( VG.addNativeMenuItem ) VG.addNativeMenuItem( this, menuItem );

    return menuItem;
};

VG.UI.Menu.prototype.insertMenuItem=function( index, menuItem )
{
    this.items.splice( index, 0, menuItem );

    if ( this.parent) menuItem.id=this.parent.itemIdCounter++;
    if ( VG.addNativeMenuItem ) VG.addNativeMenuItem( this, menuItem );

    return menuItem;
};

VG.UI.Menu.prototype.addSeparator=function()
{
    var item=VG.UI.MenuItem();
    item.isSeparator=true;
    ++this.separatorCount;
    this.items.push( item );

    if ( VG.addNativeMenuItem ) VG.addNativeMenuItem( this, item );

    return item;
};

VG.UI.Menu.prototype.insertSeparator=function( index )
{
    var item=VG.UI.MenuItem();
    item.isSeparator=true;
    ++this.separatorCount;
    this.items.splice( index, 0, item );

    if ( VG.addNativeMenuItem ) VG.addNativeMenuItem( this, item );

    return item;
};

VG.UI.Menu.prototype.clickItem=function( item )
{
    if ( item.clicked ) item.clicked();            

    // --- Apply checkable state ?

    if ( item.checkable )
    {
        item.checked=true;

        for ( var i=0; i < item.exclusions.length; ++i ) 
            item.exclusions[i].checked=false;
    }    
};

VG.UI.Menu.prototype.calcSize=function( canvas )
{
    var size=this.preferredSize;
    
    var minWidth=80;

    VG.context.workspace.canvas.pushFont( VG.UI.stylePool.current.skin.Menu.Font );

    for( var i=0; i < this.items.length; ++i ) {
        if ( !this.items[i].isSeparator ) {
            VG.context.workspace.canvas.getTextSize( this.items[i].text, size );
            if ( size.width > minWidth ) minWidth=size.width;
        }
    }

    size.set( minWidth, (VG.context.workspace.canvas.getLineHeight()+7) * (this.items.length-this.separatorCount) + 2 + this.separatorCount );

    size=size.add( 100, 0 );
    this.minimumSize.set( size );

    VG.context.workspace.canvas.popFont();

    return size;
};

VG.UI.Menu.prototype.mouseMove=function( event )
{
    var selected;

    if ( !this.contentRect.contains( event.pos ) ) 
    {
        selected=null;
        this.parent.mouseMove( event );
    }
    else
    {
        for( var i=0; i < this.items.length; ++i )
        {
            var item=this.items[i];

            if ( !item.isSeparator ) {
                if ( item._rect.contains( event.pos ) ) {
                    selected=item;
                    break;
                }
            }    
        }
    }

    if ( selected !== this.selected ) {
        this.selected=selected;

        // --- StatusTip
        if ( VG.context.workspace.statusbar )
        {
            if ( selected && selected.statusTip && !selected.disabled ) VG.context.workspace.statusbar.message( selected.statusTip, 4000 );
            else VG.context.workspace.statusbar.message( "" );
        } 

        VG.update();
    }
};

VG.UI.Menu.prototype.mouseDown=function( event )
{
    if ( this.selected && this.contentRect.contains( event.pos ) && this.visible && event.button === VG.Events.MouseButton.Left ) {

    } else this.parent.mouseDown( event );
};

VG.UI.Menu.prototype.mouseUp=function( event )
{
    if ( this.selected && this.contentRect.contains( event.pos ) && this.visible && event.button === VG.Events.MouseButton.Left ) {

        if ( this.selected.clicked )
            this.selected.clicked();            

        // --- Apply checkable state ?

        if ( this.selected.checkable )
        {
            this.selected.checked=true;

            for ( var i=0; i < this.selected.exclusions.length; ++i ) 
                this.selected.exclusions[i].checked=false;
        }

        // --- Dismiss menu

        this.visible=false;
        this.parent.active=null;
        VG.context.workspace.mouseTrackerWidget=null;          
    } else
    if ( !this.parent.rect.contains( event.pos ) )
    {
        // --- Dismiss menu

        this.visible=false;
        this.parent.active=null;
        VG.context.workspace.mouseTrackerWidget=null;        
    }
};

VG.UI.Menu.prototype.paintWidget=function( canvas )
{
    if ( !this.visible ) return;
    VG.UI.stylePool.current.drawMenu( this, canvas );    
};

// ----------------------------------------------------------------- VG.UI.ContextMenu

VG.UI.ContextMenu=function()
{
    if ( !(this instanceof VG.UI.ContextMenu) ) return new VG.UI.ContextMenu();

    VG.UI.Widget.call( this );
    this.name="ContextMenu";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;

    this.minimumSize.set( 60, 20 );
    this.maximumSize.set( 32768, 20 );

    this.supportsFocus=true;

    this.items=[];
    this.selected=null;
    this.separatorCount=0;

    this.aboutToShow=null;
};

VG.UI.ContextMenu.prototype=VG.UI.Widget();

VG.UI.ContextMenu.prototype.addItem=function( text, icon, callback, shortcut )
{
    var item=VG.UI.MenuItem( text, icon, callback, shortcut );
    this.items.push( item );

    return item;
};

VG.UI.ContextMenu.prototype.insertItem=function( index, text, icon, callback, shortcut )
{
    var item=VG.UI.MenuItem( text, icon, callback, shortcut );
    this.items.splice( index, 0, item );

    return item;
};

VG.UI.ContextMenu.prototype.addSeparator=function()
{
    var item=VG.UI.MenuItem();
    item.isSeparator=true;
    ++this.separatorCount;
    this.items.push( item );

    return item;
};

VG.UI.ContextMenu.prototype.keyDown=function( keyCode )
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

VG.UI.ContextMenu.prototype.mouseMove=function( event )
{
    var selected;

    if ( !this.rect.contains( event.pos ) ) selected=null;
    else
    {
        for( var i=0; i < this.items.length; ++i )
        {
            var item=this.items[i];

            if ( !item.isSeparator ) {
                if ( item._rect.contains( event.pos ) ) {
                    selected=item;
                    break;
                }
            }    
        }
    }

    if ( selected !== this.selected ) {
        this.selected=selected;
        VG.update();
    }
};

VG.UI.ContextMenu.prototype.mouseDown=function( event )
{
    if ( this.rect.contains( event.pos ) && event.button === VG.Events.MouseButton.Left ) {
        this.popup=true;
        this.oldIndex=this.index;
    }
};

VG.UI.ContextMenu.prototype.mouseUp=function( event )
{
    if ( this.selected && this.visible && event.button === VG.Events.MouseButton.Left ) {

        if ( this.selected.clicked )
            this.selected.clicked();  

        // --- Apply checkable state ?

        if ( this.selected.checkable )
        {
            this.selected.checked=true;

            for ( var i=0; i < this.selected.exclusions.length; ++i ) 
                this.selected.exclusions[i].checked=false;
        }

        // --- Dismiss context menu

        this.visible=false;
        VG.context.workspace.contextMenu=undefined;
        VG.context.workspace.mouseTrackerWidget=undefined;
    }
};

VG.UI.ContextMenu.prototype.activate=function( pos )
{
    if ( this.aboutToShow )
        this.aboutToShow();

    this.rect.setPos( pos );
    this.rect.setSize( this.calcSize( VG.context.workspace.canvas ) );

    this.visible=true;
    VG.context.workspace.contextMenu=this;
    VG.context.workspace.mouseTrackerWidget=this;
};

VG.UI.ContextMenu.prototype.calcSize=function( canvas )
{
    var size=this.preferredSize;
    
    var minWidth=80;

    VG.context.workspace.canvas.pushFont( canvas.style.skin.ContextMenu.Font );

    for( var i=0; i < this.items.length; ++i ) {
        if ( !this.items[i].isSeparator ) {
            VG.context.workspace.canvas.getTextSize( this.items[i].text, size );
            if ( size.width > minWidth ) minWidth=size.width;
        }
    }

    size.set( minWidth, (VG.context.workspace.canvas.getLineHeight()+4) * (this.items.length-this.separatorCount) + 2 + this.separatorCount );

    size=size.add( 100, 0 );
    this.minimumSize.set( size );

    VG.context.workspace.canvas.popFont();

    return size;
};

VG.UI.ContextMenu.prototype.paintWidget=function( canvas )
{
    if ( !this.visible ) return;
    VG.UI.stylePool.current.drawContextMenu( this, canvas );
};
