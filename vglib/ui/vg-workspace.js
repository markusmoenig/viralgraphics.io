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
 * Creates an VG.UI.Workspace class.<br>
 * VG.UI.Workspace represents the visual workspace of every VG application or game. Before your application gets started, a VG.UI.Workspace object will be created
 * and passed as the first argument to vgMain().
 *
 * <br>VG.context is the context of your application and set as "this" for vgMain(). A reference to the application Workspace is set in
 * VG.context.workspace.
 *
 * @constructor
 * @tutorial Workspace
 */

VG.UI.Workspace=function()
{
    if ( !(this instanceof VG.UI.Workspace) ) return new VG.UI.Workspace();

    VG.UI.Widget.call( this );

    this.name="Workspace";
    this.focusWidget=0;

    /** Holds the content of the Workspace and has to be set within vgMain() to either a VG.UI.Widget derived object or one of the Layout objects. This object will fill the
     * available space of the Workspace and is the root object for all display widgets.
     *  @member {object} */
    this.content=0;

    this.needsRedraw=true;
    this.redrawList=[];

    /** The {@link VG.Canvas} for the Workspace, used for all drawing operations.
     *  @member {VG.Canvas} */
    this.canvas=VG.Canvas();
    this.canvas.style=VG.UI.stylePool.current;

    this.shortcutManager=VG.Shortcut.Manager();

    this.mouseTrackerWidget=null;
    this.mousePos=VG.Core.Point();

    this.keysDown=[];

    this.filePath=undefined;

    this.menubars=[];
    this.toolbars=[];
    this.windows=[];
    this.widgets3d=[];

    /** Set this member to an {@link VG.UI.StatusBar} object if your application should have a status bar at the bottom of the screen.
     * @member {VG.UI.StatusBar}
     */
    this.statusBar=null;
    this.layout=VG.UI.SplitLayout();
    this.layout.name = "MainLayout";
    this.layout.margin.set( 0, 0, 0, 0 );

    this.loginButton=VG.UI.ToolBarButton( "Login" );
    this.signupButton=VG.UI.ToolBarButton( "Signup" );
    this.loginButton.clicked=this.showLoginDialog.bind( this );
    this.signupButton.clicked=this.showSignupDialog.bind( this );

    this.loginDialog=null;
    this.signupDialog=null;
    this.userName="";
    this.userId=undefined;
    this.userIsAdmin=false;

    this.modelToolButtonRoles=[];
    this.modelMenuItemRoles=[];

    this.dataCollectionForLoadSave=null;
    this.dataCollectionForUndoRedo=null;

    this.undo=null;

    this.platform=VG.getHostProperty( VG.HostProperty.Platform );
    this.operatingSystem=VG.getHostProperty( VG.HostProperty.OperatingSystem );

    this.textClipboard="";
    this.nodesClipboard="";
    this.imageClipboard=undefined;

    this.singleShotCallbacks=[];
    this.aboutToSaveCallbacks=[];

    // --- Force a redraw every 2000ms
    this.autoRedrawInterval=2000;
    this.maxRedrawInterval=0;//1000/60;

    // --- Current Project Info

    this.projectName="Untitled";
    this.projectExtension=undefined;

    // --- Send an isLoggedIn request to the server to check if we are logged in or not.

    VG.sendBackendRequest( "/user/isLoggedIn", "", function( responseText ) {
        if ( !responseText ) return;
        //VG.log( responseText )
        var response=JSON.parse( responseText );

        if ( response.status === "ok" && response.loggedIn === true )
        {
            this.userName=response.username;
            this.userId=response.userid;
            this.userIsAdmin=response.isAdmin;

            this.modelLoggedStateChanged( this.userName.length > 0 ? true : false, this.userName, this.userId );

            if ( this.callbackForLoggedStateChanged )
                this.callbackForLoggedStateChanged( this.userName.length > 0 ? true : false, this.userName, this.userId );
            VG.update();
        } else {
            // --- Not logged in, try to get the appId of the current application
            if ( !this.appId ) {
                VG.DB.getAppId( function( appId ) {
                    this.appId=appId;
                }.bind( this ) );
            }
        }
    }.bind(this), "GET" );

    // --- Default Events

    this.mainMoveEvent=VG.Events.MouseMoveEvent();

    // ---

    this.toolTipWidget=VG.UI.ToolTipWidget();

    // --- Adjust the CSS Background Color to the StatusBar if running on the Web

    if ( VG.getHostProperty( VG.HostProperty.Platform ) === VG.HostProperty.PlatformWeb ) {
        var canvas=document.getElementById( 'webgl' );
        var body=document.body;

        body.style["background-color"]=this.canvas.style.skin.StatusBar.BackColor.toHex();
    }

    // --- CmdCtrl Shortcut depending on platform

    if ( this.operatingSystem === VG.HostProperty.OSMac )
        VG.Events.KeyCodes.CmdCtrl=VG.Events.KeyCodes.AppleLeft;
    else VG.Events.KeyCodes.CmdCtrl=VG.Events.KeyCodes.Ctrl;

    // --- Electron Events

    if ( this.isElectron() ) {
        const ipc = require('electron').ipcRenderer;

        ipc.on( 'workspace-open', ( event ) => {
            this.modelOpenCallback_electron();
        });
        ipc.on( 'workspace-save', ( event ) => {
            this.modelSaveCallback();
        });
        ipc.on( 'workspace-saveas', ( event ) => {
            this.modelSaveAsCallback_electron();
        });

        ipc.on( 'workspace-undo', ( event ) => {
            if ( this.dataCollectionForUndoRedo ) this.dataCollectionForUndoRedo.__vgUndo.undo();
            VG.update();
        });
        ipc.on( 'workspace-redo', ( event ) => {
            if ( this.dataCollectionForUndoRedo ) this.dataCollectionForUndoRedo.__vgUndo.redo();
            VG.update();
        });
    }
};

VG.UI.Workspace.prototype=VG.UI.Widget();

Object.defineProperty( VG.UI.Workspace.prototype, "content",
{
    get: function() {
        return this._content;
    },
    set: function( content ) {
        if ( this.layout ) {
            this._content=content;

            var insertAt=0;
            for( var i=0; i < this.layout.children.length; ++i )
            {
                var widget=this.layout.children[i];
                if ( widget instanceof VG.UI.DockWidget ) {
                    if ( widget.location === VG.UI.DockWidgetLocation.Left ) {
                        insertAt++;
                    } else break;
                } else break;
            }

            this.layout.insertChild( insertAt, content, 100 );

            //this.layout.addChild( content, 100 );
            this.recalcLayoutPercentages();
        }
    }
});

Object.defineProperty( VG.UI.Workspace.prototype, "projectName",
{
    get: function() {
        return this._projectName;
    },
    set: function( projectName ) {
        this._projectName = projectName;
        if ( this.isElectron() ) {
            const win = require('electron').remote.getCurrentWindow();
            win.setTitle( projectName );
        }
    }
});

VG.UI.Workspace.prototype.resize=function( width, height )
{
    this.rect.setSize( width, height );
    this.contentRect.set( this.rect );

    VG.context.workspace.needsRedraw=true;
    VG.context.workspace.canvas.hasBeenResized=true;

    VG.Renderer().onResize( width, height );
};

/**
 * Adds a Dock widget to the Workspace.
 * @param {VG.UI.DockWidget} widget - The DockWidget to add to the Workspace
 * @param {VG.UI.DockWidgetLocation} location - Currently limited to VG.UI.DockWidgetLocation.Left and VG.UI.DockWidgetLocation.Right.
 * @param {number} percent - Optional, the width this dock widget should cover in percent, default is 20.
 */

VG.UI.Workspace.prototype.addDockWidget=function( dockWidget, location, percent )
{
    if ( !location ) location=VG.UI.DockWidgetLocation.Left;

    if ( !percent )
        percent=dockWidget._oldPercent ? dockWidget._oldPercent : 20;

    var contentIndex=this.layout.children.indexOf( this._content );
    if ( contentIndex > -1 ) {
        if ( location === VG.UI.DockWidgetLocation.Left || location === "Left" ) {
            this.layout.insertChild( contentIndex, dockWidget, percent );
        } else
        if ( location === VG.UI.DockWidgetLocation.Right || location === "Right" ) {
            this.layout.insertChild( contentIndex+1, dockWidget, percent );
        }
    } else this.layout.addChild( dockWidget, percent );

    dockWidget.location=location;
    this.recalcLayoutPercentages();
};

/**
 * Removes the given dock widget from the Workspace.
 * @param {VG.UI.DockWidget} widget - The DockWidget to remove from the Workspace.
 */

VG.UI.Workspace.prototype.removeDockWidget=function( dockWidget )
{
    this.layout.removeChild( dockWidget );
};

/**
 * Detaches a Dock widget from the Workspace.
 * @param {VG.UI.DockWidget} widget - The DockWidget to detach from the Workspace
 */

VG.UI.Workspace.prototype.detachDockWidget=function( dockWidget )
{
    dockWidget._oldPercent=dockWidget.rect.width / this.layout.rect.width * 100.0;

    this.layout.removeChild( dockWidget );
    this.windows.push( dockWidget );
    dockWidget.oldLocation=dockWidget.location;
    dockWidget.location=VG.UI.DockWidgetLocation.Floating;
    this.recalcLayoutPercentages();
};

VG.UI.Workspace.prototype.possiblyAttachDockWidget=function( dockWidget, useOldLocation )
{
    var index;
    if ( dockWidget.oldLocation !== undefined && useOldLocation )
    {
        this.addDockWidget( dockWidget, dockWidget.oldLocation );
        index=this.windows.indexOf( dockWidget );
        if ( index >= 0 )
            this.windows.splice( index, 1 );
    } else
    {
        // --- Check if the mouse position is near a border and if yes attach the dockwidget to that border
        if ( this.mousePos.x < this._content.rect.x + 100 ) {
            // --- Left of Content
            this.addDockWidget( dockWidget, VG.UI.DockWidgetLocation.Left );

            index=this.windows.indexOf( dockWidget );
            if ( index >= 0 )
                this.windows.splice( index, 1 );
        } else
        if ( this.mousePos.x > this._content.rect.right() - 100 ) {
            // --- Right of Content
            this.addDockWidget( dockWidget, VG.UI.DockWidgetLocation.Right );

            index=this.windows.indexOf( dockWidget );
            if ( index >= 0 )
                this.windows.splice( index, 1 );
        }
    }
};

VG.UI.Workspace.prototype.recalcLayoutPercentages=function()
{
    var percent=100.0;
    var contentOffset=-1;

    for( var i=0; i < this.layout.children.length; ++i ) {
        var widget=this.layout.children[i];
        if ( widget instanceof VG.UI.DockWidget ) {
            if ( widget.horizontalExpanding )
                percent-=this.layout.getChildPercentAt( i );
        } else contentOffset=i;
    }

    if ( contentOffset !== -1 )
        this.layout.setChildPercentAt( contentOffset, percent );
};

/**
 * Adds a VG.UI.ToolBar to the top of the Workspace
 * @param {VG.UI.ToolBar} toolbar - The toolbar to add. Several Toolbars can be added to each Workspace
 */

VG.UI.Workspace.prototype.addToolBar=function( toolbar )
{
    this.toolbars.push( toolbar );
};

/**
 * Adds a VG.UI.MenuBar to the top of the Workspace
 * @param {VG.UI.MenuBar} menubar - The VG.UI.MenuBar to add. Several MenuBars can be added to each Workspace.
 */

VG.UI.Workspace.prototype.addMenuBar=function( menubar )
{
    this.menubars.push( menubar );
    this.paintMenubar=VG.getHostProperty( VG.HostProperty.DrawMenus );
};

/**
 * Adds a decorated ToolBar (VG.UI.DecoratedToolBar) to the application.
 */

VG.UI.Workspace.prototype.createDecoratedToolBar=function()
{
    this.decoratedToolBar=VG.UI.DecoratedToolBar();

    this.addToolButtonRole( this.decoratedToolBar, VG.UI.ActionItemRole.QuickMenu );
    // var spacer30px=VG.UI.LayoutHSpacer();
    // spacer30px.maximumSize.width=1;
    // this.decoratedToolBar.addItem( spacer30px );
    this.decoratedToolBar.addItem( VG.UI.DecoratedToolSeparator() );
    //this.decoratedToolBar.addItem( VG.UI.DecoratedToolSeparator() );
    //this.decoratedToolBar.addItem( VG.UI.DecoratedToolSeparator() );
    this.addToolButtonRole( this.decoratedToolBar, VG.UI.ActionItemRole.Undo );
    this.addToolButtonRole( this.decoratedToolBar, VG.UI.ActionItemRole.Redo );
    this.decoratedToolBar.addItem( VG.UI.DecoratedToolSeparator() );
    this.addToolButtonRole( this.decoratedToolBar, VG.UI.ActionItemRole.New );
    this.addToolButtonRole( this.decoratedToolBar, VG.UI.ActionItemRole.Open );
    this.addToolButtonRole( this.decoratedToolBar, VG.UI.ActionItemRole.Save );
    this.addToolButtonRole( this.decoratedToolBar, VG.UI.ActionItemRole.SaveAs );
    // this.decoratedToolBar.addItem( VG.UI.DecoratedToolSeparator() );
    // this.addToolButtonRole( this.decoratedToolBar, VG.UI.ActionItemRole.SkinCycle );
    this.decoratedToolBar.addItem( VG.UI.LayoutHSpacer() );
    this.decoratedToolBar.addItem( VG.UI.DecoratedToolSeparator() );
    this.addToolButtonRole( this.decoratedToolBar, VG.UI.ActionItemRole.Login );
    this.addToolButtonRole( this.decoratedToolBar, VG.UI.ActionItemRole.Signup );
    this.addToolButtonRole( this.decoratedToolBar, VG.UI.ActionItemRole.UserTool );

    return this.decoratedToolBar;
};

VG.UI.Workspace.prototype.addQuickMenuItem=function( text, callback )
{
    if ( this.quickMenu )
    {
        var item=VG.UI.DecoratedQuickMenuItem( text, callback );
        this.quickMenu.items.push( item );

        return item;
    }

    return undefined;
};

// --- paintWidget

VG.UI.Workspace.prototype.paintWidget=function()
{
    this.contentRect.set( this.rect );

    // --- Draw Menubar if any and if the menubar is painted by VG itself

    var i;
    if ( this.menubars.length && this.paintMenubar ) {
        for ( i=0; i < this.menubars.length; ++i)
        {
            var menubar=this.menubars[i];

            menubar.rect.x=this.contentRect.x; menubar.rect.y=this.contentRect.y;
            menubar.rect.setSize( this.rect.width, VG.UI.stylePool.current.skin.MenuBar.Height );

            menubar.paintWidget( this.canvas );

            this.contentRect.y+=menubar.rect.height;
            this.contentRect.height-=menubar.rect.height;
        }
    }

    // --- Draw Decorated ToolBar

    if ( this.decoratedToolBar )
    {
        this.decoratedToolBar.rect.copy( this.contentRect );
        this.decoratedToolBar.rect.height=VG.UI.stylePool.current.skin.DecoratedToolBar.Height;
        this.decoratedToolBar.paintWidget( this.canvas );

        //this.contentRect.shrink( 0, VG.context.style.skin.DecoratedToolbar.Height, this.contentRect );

        this.contentRect.y+=VG.UI.stylePool.current.skin.DecoratedToolBar.Height;
        this.contentRect.height-=VG.UI.stylePool.current.skin.DecoratedToolBar.Height;
    }

    // --- Draw Toolbar

    for ( i=0; i < this.toolbars.length; ++i)
    {
        var toolbar=this.toolbars[i];

        toolbar.rect.x=this.contentRect.x; toolbar.rect.y=this.contentRect.y;
        toolbar.rect.setSize( this.rect.width, VG.UI.stylePool.current.skin.ToolBar.Height );

        toolbar.paintWidget( this.canvas );
        this.contentRect.y+=toolbar.rect.height;
        this.contentRect.height-=toolbar.rect.height;
    }

    // --- Setup Statusbar

    if ( this.statusBar )
    {
        this.statusBar.rect.set( this.rect.x, this.rect.y + this.rect.height - VG.UI.stylePool.current.skin.StatusBar.Height, this.rect.width, VG.UI.stylePool.current.skin.StatusBar.Height );
        this.contentRect=this.contentRect.add( 0, 0, 0, -VG.UI.stylePool.current.skin.StatusBar.Height );
    }

    // --- Draw Layout

    this.canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.contentRect, VG.UI.stylePool.current.skin.Widget.BackgroundColor );

    if ( this.layout ) {
        this.layout.rect.set( this.contentRect );
        this.layout.layout( this.canvas );
    }

    // --- Draw Statusbar

    if ( this.statusBar )
        this.statusBar.paintWidget( this.canvas );

    // --- Draw Windows

    for ( i=0; i < this.windows.length; ++i)
    {
        let window=this.windows[i];

        if ( !window.visible ) continue;

        if ( this.canvas.twoD )
            this.canvas.clearGLRect( window.rect );
        window.paintWidget( this.canvas );
    }

    // --- Check for delayed paint widgets (widgets with popups)

    if ( this.canvas.delayedPaintWidgets.length )
    {
        for( i=0; i < this.canvas.delayedPaintWidgets.length; ++i ) {
            let widget = this.canvas.delayedPaintWidgets[i];
            widget.paintWidget( this.canvas );
        }
        this.canvas.delayedPaintWidgets=[];
    }

    // --- Check if we have an active context Menu

    if ( this.contextMenu )
        this.contextMenu.paintWidget( this.canvas );

    // ---

    this.canvas.hasBeenResized=false;
};

VG.UI.Workspace.prototype.mouseMove=function( x, y )
{
    var event=this.mainMoveEvent;
    event.pos.set( x, y );
    var i, found;

    // --- If a widget is tracking the mouse, this has priority

    if ( this.mouseTrackerWidget ) {

        this.mousePos.set( x, y );
        this.mouseTrackerWidget.mouseMove( event );
        return;
    }

    // ---

    var windowUnderMouse=0;
    var widgetUnderMouse=0;
    var layoutUnderMouse=0;

    this.modalDialog=0;

    // --- Search for a window under the mouse

    for( i=0; i < this.windows.length; ++i ) {
        var window=this.windows[i];

        if ( window.visible && window.rect.contains( event.pos ) ) {

            windowUnderMouse=window;
            widgetUnderMouse=window;

            // --- Search the layout

            if ( windowUnderMouse.layout ) {
                found=this.findLayoutItemAtMousePos( windowUnderMouse.layout, event.pos );
                if ( found && found.isWidget ) {
                    widgetUnderMouse=found;
                } else
                if ( found && found.isLayout ) {
                    layoutUnderMouse=found;
                }
            }

            // --- Search the buttonLayout (Dialogs Only)

            if ( widgetUnderMouse === window && windowUnderMouse.buttonLayout ) {
                found=this.findLayoutItemAtMousePos( windowUnderMouse.buttonLayout, event.pos );
                if ( found && found.isWidget ) {
                    widgetUnderMouse=found;
                }
            }

            // --- Search optional childWidgets

            if ( window.childWidgets ) {
                for ( var cw=0; cw < window.childWidgets.length; ++cw) {
                    var child=window.childWidgets[cw];
                    if ( child.rect.contains( event.pos ) )
                        widgetUnderMouse=child;
                }
            }
        }

        // --- Check if a dialog is currently being shown and if yes, set the modal flag for the workspace, i.e.
        // --- Dont accept any mouse or key input except from the modal dialog.

        if ( window.visible && (window instanceof VG.UI.Dialog ) ) {
            this.modalDialog=window;
        }

    }

    // --- Search for the widget or layout under the mouse

    // --- Draw Menubar if any and if the menubar is painted by VG itself

    if ( this.paintMenubar && !windowUnderMouse  ) {
        for ( i=0; i < this.menubars.length; ++i)
        {
            var menubar=this.menubars[i];
            if ( menubar.rect.contains( event.pos ) )
                widgetUnderMouse=menubar;
        }
    }

    // --- Search the decorated toolbar

    if ( this.decoratedToolBar )
    {
        found=this.findLayoutItemAtMousePos( this.decoratedToolBar.layout, event.pos );
        if ( found && found.isWidget )
            widgetUnderMouse=found;
    }

    // --- Search the overlay layout

    if ( this.overlayWidget )
    {
        found=this.findLayoutItemAtMousePos( this.overlayWidget.layout, event.pos );
        if ( found && found.isWidget )
            widgetUnderMouse=found;

        if ( !widgetUnderMouse && this.overlayWidget.rect.contains( event.pos ) ) {
            widgetUnderMouse = this.overlayWidget;
        }
    }

    // --- Search the toolbars

    if ( !windowUnderMouse && !widgetUnderMouse ) {

        if ( y < this.contentRect.y ) {
            for ( i=0; i < this.toolbars.length; ++i)
            {
                var toolbar=this.toolbars[i];
                found=this.findLayoutItemAtMousePos( toolbar.layout, event.pos );
                if ( found && found.isWidget ) {
                    widgetUnderMouse=found;
                }
            }
        } else
        {
            // --- Search the main layout

            found=this.findLayoutItemAtMousePos( this.layout, event.pos );

            if ( found ) {
                //VG.log( "Found:" + found.name );

                if ( found.isWidget ) {
                    widgetUnderMouse=found;
                } else
                if ( found.isLayout ) {
                    layoutUnderMouse=found;
                }
            }
        }
    }

    // --- If we have a modal dialog and it is currently not under the mouse, ignore this event

    if ( this.modalDialog && windowUnderMouse !== this.modalDialog )
        { this.mousePos.set( x, y ); return; }

    // --- Evalutate the layout under the mouse

    if ( layoutUnderMouse !== this.layoutUnderMouse ) {

        if ( layoutUnderMouse ) {
            // --- New Layout has Hover

            if ( layoutUnderMouse.hoverIn )
                layoutUnderMouse.hoverIn();
        }

        if ( this.layoutUnderMouse ) {
            // --- This Layout has lost Hover State

            if ( this.layoutUnderMouse.hoverOut )
                this.layoutUnderMouse.hoverOut();
        }

        this.layoutUnderMouse=layoutUnderMouse;

        if ( layoutUnderMouse && layoutUnderMouse.mouseMove )
            layoutUnderMouse.mouseMove( event );
    }

    if ( this.layoutUnderMouse && this.layoutUnderMouse.mouseMove )
        this.layoutUnderMouse.mouseMove( event );

    // --- Drag and Drop

    if ( this.dndOperation )
    {
        this.dndValidDragTarget=undefined;

        if ( widgetUnderMouse.checkDragSourceItemId ) {
            var accepts=widgetUnderMouse.checkDragSourceItemId( event.pos, this.dndItemId, this.dndItem );
            if ( accepts && widgetUnderMouse.acceptDragSourceItem ) {

                // set mouse ptr to accept mode

                this.dndValidDragTarget=widgetUnderMouse;
            }
        }
        this.mousePos.set( x, y );

        if ( this.dndValidDragTarget ) VG.setMouseCursor( "pointer" );
        else VG.setMouseCursor( "no-drop" );

        return;
    }

    // --- Evalutate the widget under the mouse

    if ( widgetUnderMouse !== this.widgetUnderMouse ) {

        if ( widgetUnderMouse )
        {
            // --- New Widget has Hover
            if ( !widgetUnderMouse.disabled && widgetUnderMouse.visualState === VG.UI.Widget.VisualState.Normal ) {
                widgetUnderMouse.visualState=VG.UI.Widget.VisualState.Hover;
                widgetUnderMouse.hasHoverState=true;
                widgetUnderMouse.hasFocusState=false;
                this.canvas.update();
            }

            // --- Send mouseEnter
            if ( !widgetUnderMouse.disabled && widgetUnderMouse.mouseEnter )
                widgetUnderMouse.mouseEnter( event );
        }

        if ( this.widgetUnderMouse )
        {
            // --- This Widget has lost Hover
            if ( this.focusWidget === this.widgetUnderMouse ) {
                this.widgetUnderMouse.visualState=VG.UI.Widget.VisualState.Focus;
                this.widgetUnderMouse.hasFocusState=true;
                this.widgetUnderMouse.hasHoverState=false;
            } else {
                this.widgetUnderMouse.visualState=VG.UI.Widget.VisualState.Normal;
                this.widgetUnderMouse.hasFocusState=false;
                this.widgetUnderMouse.hasHoverState=false;
            }

            // --- Send mouseLeave
            if ( !this.widgetUnderMouse.disabled && this.widgetUnderMouse.mouseLeave )
                this.widgetUnderMouse.mouseLeave( event );

            this.canvas.update();
        }

        this.widgetUnderMouse=widgetUnderMouse;
    }

    this.windowUnderMouse=windowUnderMouse;

    if ( this.widgetUnderMouse && this.widgetUnderMouse.supportsAutoFocus === true && this.widgetUnderMouse !== this.focusWidget )
    {
        if ( !this.widgetUnderMouse.autoFocusRect )
            this.setFocus( this.widgetUnderMouse );
        else
        if ( this.widgetUnderMouse.autoFocusRect.contains( event.pos ) )
            this.setFocus( this.widgetUnderMouse );
    }

    if ( this.focusWidget && this.focusWidget.mouseMove )
        this.focusWidget.mouseMove( event );
    else
    if ( this.widgetUnderMouse && this.widgetUnderMouse.mouseMove )
        this.widgetUnderMouse.mouseMove( event );

    this.lastMouseMove=Date.now();
    this.mousePos.set( x, y );
};

VG.UI.Workspace.prototype.mouseDown=function( button )
{
    // ---

    this.mouseDownButton=button;
    this.mouseDownWidget=this.widgetUnderMouse;

    var event=VG.Events.MouseDownEvent( this );
    event.pos.set( this.mousePos );
    event.button=button;

    // --- If a widget is tracking the mouse, this has priority

    if ( this.mouseTrackerWidget && !this.contextMenu ) {
        this.mouseTrackerWidget.mouseDown( event );
        return;
    }

    // --- An active context menu has priority

    if ( this.contextMenu ) {

        if ( this.contextMenu.rect.contains( event.pos ) ) {
            this.contextMenu.mouseDown( event );
            this.canvas.update();
            return;
        }
        else
        {
            // --- A click outside the menu closes it
            this.contextMenu.visible=false;
            this.contextMenu=null;
            this.mouseTrackerWidget=null;
        }
    }

    // ---

    this.setFocus( this.mouseDownWidget );

    if ( this.layoutUnderMouse && this.layoutUnderMouse.mouseDown )
        this.layoutUnderMouse.mouseDown( event );

    if ( this.mouseDownWidget && this.mouseDownWidget.mouseDown && !this.mouseDownWidget.supportsFocus )
        this.mouseDownWidget.mouseDown( event );
    else
    if ( this.focusWidget && this.focusWidget.mouseDown && this.focusWidget.rect.contains( this.mousePos ) )
        this.focusWidget.mouseDown( event );

    if ( this.customEventWidget && this.customEventWidget.mouseDown && this.customEventWidget.rect.contains( this.mousePos ) )
        this.customEventWidget.mouseDown( event );

    this.canvas.update();
};

VG.UI.Workspace.prototype.mouseUp=function( button )
{
    //console.log( "mouseUp();", button );

    this.mouseDownButton=undefined;

    // --- Handle possible DnD Operation

    if ( this.dndOperation ) {
        if ( this.dndValidDragTarget )
            this.dndValidDragTarget.acceptDragSourceItem( this.mousePos, this.dndItemId, this.dndItem );

        VG.setMouseCursor( "default" );
    }

    this.dndOperation=false;

    // --- Send mouseUp event

    var event=VG.Events.MouseUpEvent( this );
    event.pos.set( this.mousePos );
    event.button=button;

    // --- If a widget or layout tracks the mouse, this has priority

    if ( this.mouseTrackerWidget ) {
        this.mouseTrackerWidget.mouseUp( event );
        this.mouseDownWidget=undefined;
        this.lastMouseMove=-1;
        return;
    }

    if ( this.layoutUnderMouse && this.layoutUnderMouse.mouseUp )
        this.layoutUnderMouse.mouseUp( event );

    if ( this.mouseDownWidget && this.mouseDownWidget.mouseUp && !this.mouseDownWidget.supportsFocus )
        this.mouseDownWidget.mouseUp( event );
    else
    if ( this.focusWidget && this.focusWidget.mouseUp )
        this.focusWidget.mouseUp( event );

    // --- If the widget handles click events (buttons), send one.

    if ( this.mouseDownWidget && this.mouseDownWidget === this.widgetUnderMouse && this.mouseDownWidget.clicked && !this.mouseDownWidget.disabled && !this.mouseDownWidget.customClick )
        this.mouseDownWidget.clicked.call( VG.context, this.mouseDownWidget );

    this.mouseDownWidget=undefined;
    this.lastMouseMove=-1;

    this.canvas.update();
};

VG.UI.Workspace.prototype.mouseDoubleClick=function()
{
    this.mouseDownWidget=this.widgetUnderMouse;

    var event=VG.Events.MouseDownEvent( this );
    event.pos.set( this.mousePos );

    if ( this.layoutUnderMouse && this.layoutUnderMouse.mouseDoubleClick )
        this.layoutUnderMouse.mouseDoubleClick( event );

    if ( this.mouseDownWidget && this.mouseDownWidget.mouseDoubleClick && !this.mouseDownWidget.supportsFocus )
        this.mouseDownWidget.mouseDoubleClick( event );
    else
    if ( this.focusWidget && this.focusWidget.mouseDoubleClick )
        this.focusWidget.mouseDoubleClick( event );

    this.canvas.update();
};

VG.UI.Workspace.prototype.mouseWheel=function( step, xStep )
{
    let rc, widget;
    if ( this.layoutUnderMouse && this.layoutUnderMouse.mouseWheel ) {
        rc=this.layoutUnderMouse.mouseWheel( step, xStep );
        if ( rc === true ) return true;
    }

    if ( this.widgetUnderMouse && !this.widgetUnderMouse.disabled && this.widgetUnderMouse.mouseWheel ) {
        rc=this.widgetUnderMouse.mouseWheel( step, xStep );
        if ( rc === true ) return true;
    }

    if ( this.widgetUnderMouse ) {
        widget=this.widgetUnderMouse.parent;
        while ( widget )
        {
            //VG.log( "iter widget", widget.name );
            if ( widget && !widget.disabled && widget.mouseWheel )
            {
                rc=widget.mouseWheel( step, xStep );
                if ( rc === true ) return true;
            }
            widget=widget.parent;
        }
    }

    if ( this.layoutUnderMouse ) {
        widget=this.layoutUnderMouse.parent;
        while ( widget )
        {
            //VG.log( "iter layout", widget.name );
            if ( widget && widget.mouseWheel )
            {
                rc=widget.mouseWheel( step, xStep );
                if ( rc === true ) return true;
            }
            widget=widget.parent;
        }
    }

    return false;
};

VG.UI.Workspace.prototype.showContextMenu=function()
{
    // if ( this.keysDown.length || (this.widgetUnderMouse && this.widgetUnderMouse.noContextMenuSupport ) ) {
    if ( this.widgetUnderMouse && this.widgetUnderMouse.noContextMenuSupport ) {
        return;
    }

    this.mouseDownWidget=this.widgetUnderMouse;

    var event=VG.Events.MouseDownEvent( this );
    event.pos.set( this.mousePos );

    this.setFocus( this.mouseDownWidget );

    if ( this.layoutUnderMouse && this.layoutUnderMouse.showContextMenu )
        this.layoutUnderMouse.showContextMenu( event );

    if ( this.mouseDownWidget && this.mouseDownWidget.parent.childWidgets && this.mouseDownWidget.parent.showContextMenu )
    {
        // --- Forwarding for embedded widgets (TableWidget)
        this.mouseDownWidget.parent.showContextMenu( event );
    } else
    if ( this.mouseDownWidget && this.mouseDownWidget.showContextMenu && !this.mouseDownWidget.supportsFocus )
        this.mouseDownWidget.showContextMenu( event );
    else
    if ( this.focusWidget && this.focusWidget.showContextMenu )
        this.focusWidget.showContextMenu( event );

    this.canvas.update();
};

VG.UI.Workspace.prototype.keyDown=function( keyCode )
{
    // --- Test for Keyboard Shortcuts

    var shortCutFound=false;
    if ( this.decoratedToolBar )  {
        if ( this.shortcutManager.verifyToolBar( String.fromCharCode( keyCode ), this.keysDown, this.decoratedToolBar ) ) {
            shortCutFound=true;

            // --- Check if the click was originated from a native menu bar / shortcut outside of VG
            // --- If yes, dont block the next text input
            this.ignoreTextInput=!this.shortcutManager.duplicateFromHost;
            VG.update();
        }
    }

    // if ( !shortCutFound && this.keysDown.length && this.focusWidget && this.focusWidget.contextMenu ) {
        // this.ignoreTextInput=this.shortcutManager.verifyMenu( String.fromCharCode( keyCode ), this.keysDown, this.focusWidget.contextMenu );

        //if ( this.ignoreTextInput ) VG.log( "ignored key input", keyCode, this.keysDown.toString(), 1 );
    // }

    // ---

    if ( this.keysDown.indexOf( keyCode ) === -1 )
        this.keysDown.push( keyCode );

    if ( !shortCutFound )
    {
        if ( this.focusWidget && this.focusWidget.keyDown )
            this.focusWidget.keyDown( keyCode, this.keysDown );
    }
};

VG.UI.Workspace.prototype.keyUp=function( keyCode )
{
    while ( this.keysDown.indexOf( keyCode ) >= 0 )
        this.keysDown.splice( this.keysDown.indexOf( keyCode ), 1 );

    if ( this.focusWidget && this.focusWidget.keyUp )
        this.focusWidget.keyUp( keyCode, this.keysDown );

    if ( keyCode === 91 || keyCode === 17 || keyCode === 18 )
        this.keysDown = [];
};

VG.UI.Workspace.prototype.textInput=function( text )
{
    if ( !this.ignoreTextInput && this.focusWidget && this.focusWidget.textInput )
        this.focusWidget.textInput( text );

    this.ignoreTextInput=false;
};

/**
 * Sets focus to a VG.UI.Widget derived widget. The widget has to support supportsFocus
 * @param {VG.UI.Widget} widget - The widget to set focus to.
 */

VG.UI.Workspace.prototype.setFocus=function( widget )
{
     if ( this.focusVerification && !this.focusVerification( widget ) ) return;

    if ( widget && widget.supportsFocus && !widget.disabled &&
         widget.visualState !== VG.UI.Widget.VisualState.Focus )
    {
        widget.visualState=VG.UI.Widget.VisualState.Focus;
        widget.hasFocusState=true;
        widget.hasHoverState=false;

        if ( this.focusWidget ) {
            if ( this.focusWidget.focusOut ) this.focusWidget.focusOut();
            this.focusWidget.visualState=VG.UI.Widget.VisualState.Normal;
            this.focusWidget.hasHoverState=false;
            this.focusWidget.hasFocusState=false;
        }

        if ( widget.focusIn )
            widget.focusIn();

        this.focusWidget=widget;
        this.canvas.update();
    }
};

VG.UI.Workspace.prototype.widgetLostFocus=function( widget )
{
    if ( this.focusWidget === widget ) {

        if ( this.focusWidget.focusOut )
            this.focusWidget.focusOut();

        this.focusWidget.visualState=VG.UI.Widget.VisualState.Normal;
        this.focusWidget.hasHoverState=false;
        this.focusWidget.hasFocusState=false;
        this.focusWidget=0;
        this.canvas.update();
    } else VG.log( "Unknown widget called widgetLostFocus()" );
};

VG.UI.Workspace.prototype.cycleFocus=function( widget )
{
    if ( this.focusWidget === widget ) {

        var parent=widget.parent;
        if ( !parent || !parent.children ) return;
        var index=parent.children.indexOf( widget );
        if ( index >= 0 ) {
            ++index;

            var newFocusWidget=0;

            while ( !newFocusWidget ) {
                if ( index >= parent.children.length ) {
                    index=0;
                }

                if ( parent.children[index].isWidget && parent.children[index].visible && !parent.children[index].disabled && parent.children[index].supportsFocus ) {
                    newFocusWidget=parent.children[index];
                }

                ++index;
            }

            this.setFocus( newFocusWidget );
        }

    } else VG.log( "Unknown widget called cycleFocus()" );
};

VG.UI.Workspace.prototype.focusIn=function()
{
    if ( this.callbackForFocusChanged )
        this.callbackForFocusChanged( true );
};

VG.UI.Workspace.prototype.focusOut=function()
{
    if ( this.callbackForFocusChanged )
        this.callbackForFocusChanged( false );
};

VG.UI.Workspace.prototype.tick=function( needsRedraw )
{
    var redraw=false;
    var current = Date.now();
    var i, time;

    // --- ToolTips Controller

    if ( this.lastMouseMove !== -1 && current - this.lastMouseMove > 800 && this.widgetUnderMouse && !this.widgetUnderMouse.disabled &&
        this.widgetUnderMouse.toolTip && this.mouseDownWidget === undefined ) {

        this.toolTipWidget.rect.x=this.mousePos.x;
        this.toolTipWidget.rect.y=this.mousePos.y;

        if ( this.canvas.delayedPaintWidgets.indexOf( this.toolTipWidget ) === -1 )
            this.canvas.delayedPaintWidgets.push( this.toolTipWidget );

        if ( !this.toolTipWidget.visible ) {
            needsRedraw=true;
            this.toolTipWidget.visible=true;
            this.toolTipWidget.setToolTip( this.canvas, this.widgetUnderMouse );
        }
    } else
    if ( this.toolTipWidget.visible ) {
        needsRedraw=true;
        this.toolTipWidget.visible=false;
        this.canvas.delayedPaintWidgets=[];
    }

    // --- StatusTips

    if ( this.statusBar && this.widgetUnderMouse && !this.widgetUnderMouse.disabled && !this.widgetUnderMouse.noStatusTip && this.widgetUnderMouse.statusTip ) {
        this.statusBar.message( this.widgetUnderMouse.statusTip, 4000 );
    }

    // ---

    if ( this.singleShotCallbacks.length ) {
        for( i=0; i < this.singleShotCallbacks.length; ++i ) {
            this.singleShotCallbacks[i]();
        }
        if ( this.singleShotCallbacks ) delete this.singleShotCallbacks;
        this.singleShotCallbacks=[];
    }

    if ( ( ( current - this.lastRedrawTime ) > this.autoRedrawInterval ) || needsRedraw ) redraw=true;
    else
    {
        // --- Check if a redraw request time is true

        for( i=0; i < this.redrawList.length; ++i ) {

            time=this.redrawList[i];

            if ( time <= current ) {
                redraw=true;
                break;
            }
        }

        if ( redraw && this.redrawList.length )
        {
            // --- Create a new array only containing the none-expired redraw requests
            var array=[];

            for( i=0; i < this.redrawList.length; ++i ) {
                time=this.redrawList[i];

                if ( time > current ) array.push( time );
            }

            // --- Replace the redrawList array
            if ( this.redrawList ) delete this.redrawList;
            this.redrawList=array;
        }
    }

    var rt=VG.Renderer().mainRT;

    var diff=current - this.lastRedrawTime;
    if ( diff < this.maxRedrawInterval ) redraw=false;

    if ( redraw ) {
        rt.clear( true, 1.0);
        rt.setViewport(this.rect);

        if ( this.canvas.twoD ) {
            this.canvas.canvas = document.getElementById( 'workspace' );
            this.canvas.ctx = this.canvas.canvas.getContext('2d');

            this.canvas.canvas.width = VG.context.workspace.rect.width; this.canvas.canvas.height = VG.context.workspace.rect.height;
            this.canvas.ctx.clearRect( 0, 0, VG.context.workspace.rect.width, VG.context.workspace.rect.height );
        }

        this.paintWidget();
        this.canvas.flush();

        // VG.log( "Redraw time", Date.now() - current );

        this.lastRedrawTime=current;
    } else
    if ( this.renderCallback ) this.renderCallback();

    return redraw;
};

VG.UI.Workspace.prototype.findLayoutItemAtMousePos=function( layout, pos )
{
    //console.log( "findLayoutItemAtMousePos: " + layout.name );

    // --- Check if top layout is a StackedWidget and if yes do the proper forwarding
    if ( layout instanceof VG.UI.StackedLayout ) {
        while ( layout instanceof VG.UI.StackedLayout )
            layout=layout.current;

        if ( layout === undefined || layout === null ) return layout;
        else if ( layout.isWidget ) return layout;
    }

    var found, i, t;
    if ( layout )
    {
        if ( layout.specialLayoutHitTest && layout.specialLayoutHitTest( pos ) )
        {
            return layout;
        } else
        {
            for ( i=0; i < layout.children.length; ++i ) {
                var child=layout.children[i];

                if ( !child.visible ) continue;

                // --- Check for StackedLayout Forwarding for childs
                if ( child instanceof VG.UI.StackedLayout )
                {
                    // --- Handle recursive VG.UI.StackedLayout situations
                    while ( child instanceof VG.UI.StackedLayout )
                        child=child.current;

                    if ( child === undefined || child === null ) continue;
                }

                // --- Check for StackedLayout Forwarding for child layouts of widgets
                if ( child.isWidget && child.layout instanceof VG.UI.StackedLayout && child.layout.rect.contains( pos ) )
                {
                    child=child.layout.current;
                    // --- Handle recursive VG.UI.StackedLayout situations
                    while ( child instanceof VG.UI.StackedLayout )
                        child=child.current;

                    if ( child === null ) continue;
                }

                if ( !child ) continue;

                if ( child.isWidget ) {
                    if ( child.visible && child.rect.contains( pos ) ) {
                        if ( child.layout && child.layout.visible && child.layout.rect.contains( pos ) ) {
                            found=this.findLayoutItemAtMousePos( child.layout, pos );
                            if ( found ) return found;
                            else return child.layout;
                        } else
                        if ( child.childWidgets ) {
                            for ( t=0; t < child.childWidgets.length; ++t ) {
                                var widget=child.childWidgets[t];
                                if ( widget.visible && widget.rect.contains( pos ) ) {
                                    if ( !widget.childWidgets ) return widget;
                                    else
                                    {
                                        for ( var w=0; w < widget.childWidgets.length; ++w ) {
                                            var subChild=widget.childWidgets[w];
                                            if ( subChild.visible && subChild.rect.contains( pos ) ) return subChild;
                                        }
                                        return widget;
                                    }
                                }
                            }
                            return child;
                        } else return child;
                    }
                } else
                if ( child.isLayout ) {
                    found=this.findLayoutItemAtMousePos( child, pos );
                    if ( found ) return found;

                    // --- If inside a LabelLayout and did not find any child, return the LabelLayout itself
                    if ( child instanceof VG.UI.LabelLayout && child.rect.contains( pos ) )
                        return child;
                }
            }
        }
    }
    return 0;
};

VG.UI.Workspace.prototype.modelNewCallback=function()
{
    if ( this.callbackForConfirmNew )
        this.callbackForConfirmNew( this.modelPerformNew.bind( this ) );
    else this.modelPerformNew();
};


VG.UI.Workspace.prototype.modelPerformNew=function()
{
    if ( this.dataCollectionForUndoRedo )
    {
        this.dataCollectionForUndoRedo.clearUndo();
        this.dataCollectionForUndoRedo.updateTopLevelBindings();
    }
    this.filePath=undefined;

    if ( this.platform === VG.HostProperty.PlatformDesktop )
        VG.setWindowTitle( "", "" );
};

/**
 * Called for displaying a file open dialog when running on the web. The dialog is passed a function pointer to modelOpen which
 * will be called with the project data.
 */

VG.UI.Workspace.prototype.modelOpenCallback=function()
{
    if ( this.dataCollectionForLoadSave || this.callbackForOpen )
    {
        if ( !this.appId ) {

            // --- Show Error Message when no appId (either not logged in or app does not yet exist )

            var message;

            if ( !this.userName ) message="Please login to Visual Graphics first!";
            else message="Application was not yet created @ Visual Graphics.\nPlease create the application first.";

            var dialog=VG.UI.StatusDialog( VG.UI.StatusDialog.Type.Error, "Cannot Open File Dialog", message );
            this.showWindow( dialog );
            return;
        }

        //var fileDialog=VG.RemoteFileDialog( this.modelFileType, this.modelOpen.bind( this ), "Select File", "Open" );
        //this.showWindow( fileDialog );

        var openProject=VG.RemoteOpenProject( this, this.modelOpen.bind( this ) );
        this.showWindow( openProject );
    }
};

/**
 * Called for displaying a file open dialog when running on the desktop using electron. The dialog is passed a function pointer to modelOpen which
 * will be called with the project data.
 */

VG.UI.Workspace.prototype.modelOpenCallback_electron=function()
{
    if ( this.dataCollectionForLoadSave || this.callbackForOpen )
    {
        const ipc = require('electron').ipcRenderer;
        ipc.send('open-file-dialog');

        ipc.once( 'selected-project-file', function ( event, paths ) {
            const fs = require( 'fs' );
            const { app } = require('electron').remote;

            let filePath = paths[0];
            let data = fs.readFileSync( filePath ).toString();

            app.addRecentDocument( filePath );
            VG.context.workspace.modelOpen( filePath, data );
        });
    }
};

/**
 * Opens the given project data.
 */

VG.UI.Workspace.prototype.modelOpen=function( name, data )
{
    let path = name;
    this.projectName=VG.Utils.fileNameFromPath( path, true );

    if ( this.dataCollectionForLoadSave )
    {
        // --- Clear Undo History
        this.dataCollectionForUndoRedo.clearUndo();

        // --- Load the data into the dataCollection
        var dc=this.dataCollectionForLoadSave;
        var json=JSON.parse( VG.Utils.decompressFromBase64( data ) );

        for (var key in json ) {
            if ( dc.hasOwnProperty(key)) {
                dc[key]=json[key];
            }
        }
    } else
    if ( this.callbackForOpen )
    {
        this.callbackForOpen( name, data );
    }

    // --- Update the model
    this.dataCollectionForUndoRedo.updateTopLevelBindings();

    this.setFilePath( path );
    VG.update();
};

/**
 * Sets the file path of the currently active project file.
 */

VG.UI.Workspace.prototype.setFilePath=function( filePath )
{
    this.filePath = filePath;
    if ( this.isElectron() ) {
        const win = require('electron').remote.getCurrentWindow();
        win.setRepresentedFilename( filePath );
    }
};

/**
 * Called by the "Save" callback to actually save the provided data based on the given platform and last save operation.
 * @param {object} data - The data to save
 */

VG.UI.Workspace.prototype.modelPerformSave=function( data )
{
    if ( this.isElectron() ) {
        const fs = require( 'fs' );
        fs.writeFile( this.filePath, data, (err) => { if ( err ) console.log( err ); } );
    } else
    if ( this.lastSaveType === 2 || this.lastSaveType === undefined ) {
        var params = {};
        params.filename = this.filePath;
        params.content = data;

        VG.downloadRequest("/api/download", params, "POST");
    } else {
        VG.remoteSaveFile( this.filePath, data, function( data ) {

            if ( this.statusBar ) {
                var obj=JSON.parse( data );

                if ( obj.status === 'ok' )
                    this.statusBar.message( "\"" + VG.Utils.fileNameFromPath( this.filePath ) + "\" has been saved successfully.", 2000 );
                else this.statusBar.message( "Error during saving \"" + VG.Utils.fileNameFromPath( this.filePath ) + "\"!", 2000 );
            }
        }.bind( this ) );
    }
};

/**
 * The main callback for the "Save" function for both the web and electron.
 */

VG.UI.Workspace.prototype.modelSaveCallback=function( callback )
{
    if ( !this.filePath ) return;

    this.modelNotifyAboutToSaveCallbacks();
    if ( this.dataCollectionForLoadSave ) {
        let data=VG.Utils.compressToBase64( JSON.stringify( this.dataCollectionForLoadSave ) );
        this.modelPerformSave( data );
    } else
    if ( this.callbackForSave ) this.callbackForSave( function( appEncodedData ) {
        this.modelPerformSave( appEncodedData );
    }.bind( this ) );
};

/**
 * The main callback for the "Save As" function for the web. Shows the web dialog and provides modelSaveAs() as success callback.
 */

VG.UI.Workspace.prototype.modelSaveAsCallback=function()
{
    if ( this.dataCollectionForLoadSave || this.callbackForSave ) {
        let saveProject = VG.RemoteSaveProject( this, this.modelSaveAs.bind( this ) );
        this.showWindow( saveProject );
    }
};

/**
 * The main callback for the "Save As" function for electron. Shows the native dialog and calls modelSaveAs().
 */

VG.UI.Workspace.prototype.modelSaveAsCallback_electron=function()
{
    if ( this.dataCollectionForLoadSave || this.callbackForSave ) {
        const ipc = require('electron').ipcRenderer;
        ipc.send('save-project-dialog');

        ipc.once( 'save-project-file', function ( event, filePath ) {
            let object = { filePath : filePath };
            VG.context.workspace.modelSaveAs( object );
        });
    }
};

/**
 * Saves the file data for the "Save As" callback.
 * @param {object} callbackObject - The object containing information about the destination path, most notably the filePath.
 * @param {function} rcCallback - Optional callback for showing a success message, only used for cloud storage.
 * @param {data} - The data to save.
 */

VG.UI.Workspace.prototype.modelPerformSaveAs=function( callbackObject, rcCallback, data )
{
    let path = callbackObject.filePath;

    this.setFilePath( path );
    this.projectName = VG.Utils.fileNameFromPath( path, true );

    if ( this.isElectron() ) {
        const fs = require( 'fs' );
        fs.writeFile( path, data, (err) => { if ( err ) console.log( err ); } );
        this.lastSaveType = 3;
    } else
    if ( !callbackObject.download ) {
        this.lastSaveType = 1;
        VG.remoteSaveFile( path, data, rcCallback );
    } else {
        var params = {};
        params.filename = path;
        params.content = data;

        VG.downloadRequest("/api/download", params, "POST");
        this.lastSaveType = 2;
    }
};

/**
 * Generates the data to save and calls modelPerformSaveAs for the actual saving.
 * @param {object} callbackObject - The object containing information about the destination path, most notably the filePath.
 * @param {function} rcCallback - Optional callback for showing a success message, only used for cloud storage.
 */

VG.UI.Workspace.prototype.modelSaveAs=function( callbackObject, rcCallback )
{
    let path = callbackObject.filePath;
    if ( !path.length ) return;

    this.modelNotifyAboutToSaveCallbacks();
    if ( this.dataCollectionForLoadSave ) {
        let data = VG.Utils.compressToBase64( JSON.stringify( this.dataCollectionForLoadSave ) );
        this.modelPerformSaveAs( callbackObject, rcCallback, data );
        return data;
    } else if ( this.callbackForSave ) this.callbackForSave( function( data ) {
        this.modelPerformSaveAs( callbackObject, rcCallback, data );
        return data;
    }.bind( this ) );
};

VG.UI.Workspace.prototype.modelNotifyAboutToSaveCallbacks=function()
{
    for( var i=0; i < this.aboutToSaveCallbacks.length; ++i )
    {
        var callback=this.aboutToSaveCallbacks[i];
        if ( callback ) callback();
    }
};

VG.UI.Workspace.prototype.modelCutCallback=function( hostCall )
{
    if ( hostCall ) this.shortCutHostCall=true;
    else if ( this.shortCutHostCall ) { this.shortCutHostCall=undefined; return; }

    if ( this.focusWidget && this.focusWidget.clipboardCut )
        this.focusWidget.clipboardCut();
};

/**
 * The main copy entry point. Called whenever the user initiates a copy operation.
 */

VG.UI.Workspace.prototype.modelCopyCallback=function( hostCall )
{
    if ( hostCall ) this.shortCutHostCall=true;
    else if ( this.shortCutHostCall ) { this.shortCutHostCall=undefined; return; }

    if ( this.focusWidget && this.focusWidget.clipboardCopy )
        this.focusWidget.clipboardCopy();

    if ( !hostCall && this.platform === VG.HostProperty.PlatformWeb )
        document.execCommand( "copy" );
};

/**
 * The main paste entry point. Called whenever the user initiates a paste operation. When running on Electron, copy the image data from the system clipboard.
 */

VG.UI.Workspace.prototype.modelPasteCallback=function( hostCall )
{
    if ( hostCall ) this.shortCutHostCall=true;
    else if ( this.shortCutHostCall ) { this.shortCutHostCall=undefined; return; }

    if ( this.isElectron() ) {
        const { clipboard, nativeImage } = require('electron');
        let formats = clipboard.availableFormats();

        formats.forEach( ( text ) => {
            if ( text.startsWith( "image/" ) ) {
                let nativeImage = clipboard.readImage( text );
                let dataURL = nativeImage.toDataURL();
                let image = VG.decompressImageData( dataURL, new VG.Core.Image(), ( image ) => {
                    this.imageClipboard = image;
                    if ( this.focusWidget && this.focusWidget.clipboardPaste )
                        this.focusWidget.clipboardPaste();
                } );
            } else
            if ( text === "text/plain" ) {
                this.textClipboard = clipboard.readText( text );
            }
        } );
    } else {
        if ( this.focusWidget && this.focusWidget.clipboardPaste )
            this.focusWidget.clipboardPaste();
    }
};

VG.UI.Workspace.prototype.modelDeleteCallback=function()
{
    if ( this.focusWidget && this.focusWidget.clipboardDeleteSelection )
        this.focusWidget.clipboardDeleteSelection();
};

VG.UI.Workspace.prototype.modelSelectAllCallback=function()
{
    if ( this.focusWidget && this.focusWidget.selectAll )
        this.focusWidget.selectAll();
};

VG.UI.Workspace.prototype.modelLoggedStateChanged=function( logged, userName, userId )
{
    var userNamePopup=this.getToolButtonOfRole( VG.UI.ActionItemRole.UserTool );
    var loginButton=this.getToolButtonOfRole( VG.UI.ActionItemRole.Login );
    var signupButton=this.getToolButtonOfRole( VG.UI.ActionItemRole.Signup );

    if ( userNamePopup ) userNamePopup.visible=logged;
    if ( loginButton ) loginButton.visible=!logged;
    if ( signupButton ) signupButton.visible=!logged;

    if ( !logged ) return;

    if ( userNamePopup )
    {
        userNamePopup.clear();
        userNamePopup.addItems( userName, "Settings", "Logout" );
        var size=userNamePopup.calcSize( this.canvas );
        userNamePopup.minimumSize.set( size );
        userNamePopup.maximumSize.set( size );

        if ( !userNamePopup.changed )
        {
            userNamePopup.changed=function( index )
            {
               if ( index === 1 )
               {
                    this.showUserSettingsDialog();

                    var userNamePopup=this.getToolButtonOfRole( VG.UI.ActionItemRole.UserTool );
                    if ( userNamePopup ) userNamePopup.index=0;
                } else
                if ( index === 2 )
                {
                    VG.DB.userLogOut( function() {
                        this.userName="";
                        this.userId=undefined;
                        this.userIsAdmin=false;

                        this.modelLoggedStateChanged( this.userName.length > 0 ? true : false, this.userName, this.userId );

                        if ( this.callbackForLoggedStateChanged )
                            this.callbackForLoggedStateChanged( this.userName.length > 0 ? true : false );

                        VG.update();
                    }.bind( this ) );
                }
            }.bind( this );
        }
    }

    // --- Get the appId of the current application

    VG.DB.getAppId( function( appId ) {
        this.appId=appId;

        // --- Check if the logged user is an admin of this app
        if ( this.userId !== undefined ) {
            VG.DB.userIsAppAdmin( appId, this.userId, function( isAppAdmin ) {
                this.userIsAppAdmin=isAppAdmin;

                if ( this.callbackForLoggedStateChanged )
                    this.callbackForLoggedStateChanged( this.userName.length > 0 ? true : false, this.userName, this.userId, isAppAdmin );
            }.bind( this ) );
        }
    }.bind( this ) );
};

/*
 * Callback used to update the disabled state of items with ActionRoles like Copy / Paste for the given menu.
 */

VG.UI.Workspace.prototype.modelMenuActionRoleValidationCallback=function( menu )
{
    for( var i=0; i < menu.items.length; ++i ) {
        var menuItem=menu.items[i];

        switch( menuItem.role ) {
            case VG.UI.ActionItemRole.Copy:
                if ( this.focusWidget && this.focusWidget.clipboardCopyIsAvailable && this.focusWidget.clipboardCopyIsAvailable() !== null )
                    menuItem.disabled=false; else menuItem.disabled=true;
            break;

            case VG.UI.ActionItemRole.Cut:
            case VG.UI.ActionItemRole.Delete:
                if ( this.focusWidget && this.focusWidget.clipboardCopyIsAvailable ) {
                    var clipboardType=this.focusWidget.clipboardCopyIsAvailable();

                    // --- Check if we can paste into this widget, i.e. is not read only
                    if ( clipboardType !== null && this.focusWidget.clipboardPasteIsAvailableForType( clipboardType ) )
                        menuItem.disabled=false; else menuItem.disabled=true;
                } else menuItem.disabled=true;
            break;

            case VG.UI.ActionItemRole.Paste:

                if ( VG.clipboardPasteDataForType( "Text" ) && this.focusWidget && this.focusWidget.clipboardPasteIsAvailableForType && this.focusWidget.clipboardPasteIsAvailableForType( "Text" ) )
                    menuItem.disabled=false;
                else
                if ( VG.clipboardPasteDataForType( "Nodes" ) && this.focusWidget && this.focusWidget.clipboardPasteIsAvailableForType && this.focusWidget.clipboardPasteIsAvailableForType( "Nodes" ) )
                    menuItem.disabled=false;
                else menuItem.disabled=true;
            break;

            case VG.UI.ActionItemRole.SelectAll:
                if ( this.focusWidget && this.focusWidget.selectAll )
                    menuItem.disabled=false; else menuItem.disabled=true;
            break;
        }
    }
};

/**
 * Registers a VG.Data.Collection with the specified roles to the Workspace.
 * @param {VG.Data.Collection} dc - The data collection to register
 * @param {VG.UI.DataCollectionRole} roles - Currently supported roles are VG.UI.DataCollectionRole.LoadSaveRole, the DC is used for Application Load / Save operations, and
 * VG.UI.DataCollectionRole.UndoRedoRole, which adds automatic Undo / Redo functionality to the DC
 */

VG.UI.Workspace.prototype.registerDataCollection=function( dataCollection, roles )
{
    var button;
    if ( roles & VG.UI.DataCollectionRole.LoadSaveRole )
    {
        this.dataCollectionForLoadSave=dataCollection;

        button=this.getToolButtonOfRole( VG.UI.ActionItemRole.Open );
        if ( button ) button.disabled=false;
        button=this.getToolButtonOfRole( VG.UI.ActionItemRole.Save );
        if ( button ) button.disabled=false;
        button=this.getToolButtonOfRole( VG.UI.ActionItemRole.SaveAs );
        if ( button ) button.disabled=false;
    }

    if ( roles & VG.UI.DataCollectionRole.UndoRedoRole )
    {
        this.dataCollectionForUndoRedo=dataCollection;
        dataCollection.__vgUndo=VG.Data.Undo();

        button=this.getToolButtonOfRole( VG.UI.ActionItemRole.Undo );
        if ( button ) button.disabled=false;
        button=this.getToolButtonOfRole( VG.UI.ActionItemRole.Redo );
        if ( button ) button.disabled=false;
    }
};

/**
 * Registers a callback for a specified callback type.
 * @param {VG.UI.CallbackType} type - The type of the callback
 * @param {function} func - The callback which gets invoked for the specified callback type
 */

VG.UI.Workspace.prototype.registerCallback=function( type, callback )
{
    var button;
    switch ( type ) {

        case VG.UI.CallbackType.New:
            if ( this.dataCollectionForUndoRedo ) this.dataCollectionForUndoRedo.__vgUndo.callbackForClear=callback;
            button=this.getToolButtonOfRole( VG.UI.ActionItemRole.New );
            if ( button ) button.disabled=false;
        break;

        case VG.UI.CallbackType.UndoRedo:
            if ( this.dataCollectionForUndoRedo ) this.dataCollectionForUndoRedo.__vgUndo.callbackForUndoRedo=callback;
        break;

        case VG.UI.CallbackType.Open:
            this.callbackForOpen=callback;
            button=this.getToolButtonOfRole( VG.UI.ActionItemRole.Open );
            if ( button ) button.disabled=false;
        break;

        case VG.UI.CallbackType.Save:
            this.callbackForSave=callback;
        break;

        case VG.UI.CallbackType.LoggedStateChanged:
            this.callbackForLoggedStateChanged=callback;
            this.callbackForLoggedStateChanged( this.userName.length > 0 ? true : false, this.userName, this.userId );
        break;

        case VG.UI.CallbackType.ConfirmNew:
            this.callbackForConfirmNew=callback;
        break;

        case VG.UI.CallbackType.FocusChanged:
            this.callbackForFocusChanged=callback;
        break;

        case VG.UI.CallbackType.PlaceWindow:
            this.callbackForPlaceWindow=callback;
        break;
    }
};

VG.UI.Workspace.prototype.addToolButtonRole=function( toolbar, role )
{
    /**Creates a VG.UI.ToolButton, adds a specified default role to it and inserts it to the specified toolbar.
     * @param {VG.UI.Toolbar} toolbar - The toolbar to add the new VG.UI.ToolButton to.
     * @param {VG.UI.ActionItemRole} role - The role to apply
     */
    var button;

    if ( role === VG.UI.ActionItemRole.QuickMenu )
        button=VG.UI.DecoratedQuickMenu( "" );
    else
    if ( role === VG.UI.ActionItemRole.UserTool ) {
        button=VG.UI.DropDownMenu();
        button.supportsFocus=false;
        button.addItems( "Settings", "Logout" );
    } else
    if ( role !== VG.UI.ActionItemRole.UserTool )
        button=VG.UI.ToolBarButton( "" );

    this.setupActionItemRole( button, role );
    button.role=role;

    this.modelToolButtonRoles.push( button );

    toolbar.addItem( button );
    return button;
};

VG.UI.Workspace.prototype.addMenuItemRole=function( menu, role )
{
    /**Creates a VG.UI.MenuItem, adds a specified default role to it and inserts it to the specified VG.UI.Menu.
     * @param {VG.UI.Menu} menu - The menubar to add the new VG.UI.MenuItem to.
     * @param {VG.UI.ActionItemRole} role - The role to apply
     */
    var menuItem=VG.UI.MenuItem( "" );

    this.setupActionItemRole( menuItem, role, menu );
    menuItem.role=role;

    menu.addMenuItem( menuItem );
    return menuItem;
};

VG.UI.Workspace.prototype.getToolButtonOfRole=function( role )
{
    for ( var i=0; i < this.modelToolButtonRoles.length; ++i )
    {
        var button=this.modelToolButtonRoles[i];
        if ( button.role === role ) return button;
    }
    return undefined;
};

VG.UI.Workspace.prototype.setupActionItemRole=function( object, role, parent )
{
    switch ( role ) {

        case VG.UI.ActionItemRole.New:
            object.text="New";

            if ( !VG.Utils.getImageByName( "_new.png" ) ) {
                VG.Utils.svgToImage( { data : VG.Shaders.fs["vgstyle_gray_new.svg"], width : 24, height : 24, callback : function( image ) {
                    image.name="_new.png";
                    VG.context.imagePool.addImage( image );
                }.bind( this ) } );
            }
            // object.svgName="glyphs.svg";
            //object.svgGroupName="New";

            object.iconName="_new.png";
            object.toolTip="Clear the current project, i.e. resets the application state.";
            object.statusTip="Clear the current project, i.e. resets the application state.";

            object.clicked=this.modelNewCallback.bind( this );
            if ( this.dataCollectionForUndoRedo ) this.dataCollectionForUndoRedo.__vgUndo.addNewWidget( object );
            // else object.disabled=true;
            //object.svgName="glyphs.svg";
            //object.svgGroupName="new";
        break;

        case VG.UI.ActionItemRole.Open:
            object.text="Open...";

            if ( !VG.Utils.getImageByName( "_open.png" ) ) {
                VG.Utils.svgToImage( { data : VG.Shaders.fs["vgstyle_gray_open.svg"], width : 24, height : 24, callback : function( image ) {
                    image.name="_open.png";
                    VG.context.imagePool.addImage( image );
                }.bind( this ) } );
            }
            // object.svgName="glyphs.svg";
            // object.svgGroupName="Open";

            object.iconName="_open.png";
            object.statusTip="Open an existing project.";
            object.toolTip="Open an existing project.";

            if ( !this.isElectron() ) object.clicked = this.modelOpenCallback.bind( this );
            else object.clicked = this.modelOpenCallback_electron.bind( this );

            if ( parent instanceof VG.UI.Menu ) object.shortcut=this.shortcutManager.createDefault( VG.Shortcut.Defaults.Open );
            //else object.disabled=true;

            if ( this.callbackForOpen ) object.disabled=false;

        break;

        case VG.UI.ActionItemRole.Save:
            object.text="Save";

            if ( !VG.Utils.getImageByName( "_save.png" ) ) {
                VG.Utils.svgToImage( { data : VG.Shaders.fs["vgstyle_gray_save.svg"], width : 24, height : 24, callback : function( image ) {
                    image.name="_save.png";
                    VG.context.imagePool.addImage( image );
                }.bind( this ) } );
            }
            //object.svgName="glyphs.svg";
            //object.svgGroupName="Save";

            object.iconName="_save.png";
            object.statusTip="Save the project.";
            object.toolTip="Save the project.";

            object.clicked = this.modelSaveCallback.bind( this );

            if ( this.dataCollectionForUndoRedo ) this.dataCollectionForUndoRedo.__vgUndo.addSaveWidget( object );
            else object.disabled=true;

            if ( parent instanceof VG.UI.Menu ) object.shortcut=this.shortcutManager.createDefault( VG.Shortcut.Defaults.Save );

        break;

        case VG.UI.ActionItemRole.SaveAs:
            object.text="Save As...";

            if ( !VG.Utils.getImageByName( "_saveas.png" ) ) {
                VG.Utils.svgToImage( { data : VG.Shaders.fs["vgstyle_gray_saveas.svg"], width : 24, height : 24, callback : function( image ) {
                    image.name="_saveas.png";
                    VG.context.imagePool.addImage( image );
                }.bind( this ) } );
            }
            // object.svgName="glyphs.svg";
            // object.svgGroupName="SaveAs";

            object.iconName="_saveas.png";
            object.statusTip="Save the project under a new file name.";
            object.toolTip="Save the project under a new file name.";

            if ( !this.isElectron() ) object.clicked = this.modelSaveAsCallback.bind( this );
            else object.clicked = this.modelSaveAsCallback_electron.bind( this );

            if ( this.dataCollectionForUndoRedo ) this.dataCollectionForUndoRedo.__vgUndo.addSaveWidget( object );
            else object.disabled=true;

            if ( parent instanceof VG.UI.Menu ) object.shortcut=this.shortcutManager.createDefault( VG.Shortcut.Defaults.SaveAs );

        break;

        case VG.UI.ActionItemRole.Undo:
            object.text="Undo";

            if ( !VG.Utils.getImageByName( "_undo.png" ) ) {
                VG.Utils.svgToImage( { data : VG.Shaders.fs["vgstyle_gray_undo.svg"], width : 24, height : 24, callback : function( image ) {
                    image.name="_undo.png";
                    VG.context.imagePool.addImage( image );
                }.bind( this ) } );
            }

            object.iconName="_undo.png";
            object.toolTip="Undo the last user action in the application.";
            object.statusTip="Undo the last user action in the application.";

            if ( this.dataCollectionForUndoRedo ) this.dataCollectionForUndoRedo.__vgUndo.addUndoWidget( object );
            else object.disabled=true;

            object.shortcut = this.shortcutManager.createDefault( VG.Shortcut.Defaults.Undo );

            // object.svgName="glyphs.svg";
            // object.svgGroupName="Undo";
        break;

        case VG.UI.ActionItemRole.Redo:
            object.text="Redo";

            if ( !VG.Utils.getImageByName( "_redo.png" ) ) {
                VG.Utils.svgToImage( { data : VG.Shaders.fs["vgstyle_gray_redo.svg"], width : 24, height : 24, callback : function( image ) {
                    image.name="_redo.png";
                    VG.context.imagePool.addImage( image );
                }.bind( this ) } );
            }

            object.iconName="_redo.png";
            object.toolTip="Redo the last user action, previously undone via undo.";
            object.statusTip="Redo the last user action, previously undone via undo.";

            if ( this.dataCollectionForUndoRedo ) this.dataCollectionForUndoRedo.__vgUndo.addRedoWidget( object );
            else object.disabled=true;
            object.shortcut=this.shortcutManager.createDefault( VG.Shortcut.Defaults.Redo );

            // object.svgName="glyphs.svg";
            // object.svgGroupName="Redo";
        break;

        case VG.UI.ActionItemRole.Cut:
            object.text="Cut";

            if ( parent instanceof VG.UI.Menu ) object.statusTip="Delete the selected data and copies it to clipboard.";
            if ( parent instanceof VG.UI.Menu ) parent.aboutToShow=this.modelMenuActionRoleValidationCallback.bind( this );
            object.clicked=this.modelCutCallback.bind( this );
            if ( parent instanceof VG.UI.Menu ) object.shortcut=this.shortcutManager.createDefault( VG.Shortcut.Defaults.Cut );
        break;

        case VG.UI.ActionItemRole.Copy:
            object.text="Copy";
            if ( parent instanceof VG.UI.Menu ) object.statusTip="Copy the selected data to the clipboard.";
            object.clicked=this.modelCopyCallback.bind( this );
            if ( parent instanceof VG.UI.Menu ) object.shortcut=this.shortcutManager.createDefault( VG.Shortcut.Defaults.Copy );
        break;

        case VG.UI.ActionItemRole.Paste:
            object.text="Paste";
            if ( parent instanceof VG.UI.Menu ) object.statusTip="Paste the clipboard data to the current widget.";
            object.clicked=this.modelPasteCallback.bind( this );
            if ( parent instanceof VG.UI.Menu ) object.shortcut=this.shortcutManager.createDefault( VG.Shortcut.Defaults.Paste );
        break;

        case VG.UI.ActionItemRole.Delete:
            object.text="Delete";
            if ( parent instanceof VG.UI.Menu ) object.statusTip="Delete the current selection.";
            if ( parent instanceof VG.UI.Menu ) parent.aboutToShow=this.modelMenuActionRoleValidationCallback.bind( this, parent );
            object.clicked=this.modelDeleteCallback.bind( this );
        break;

        case VG.UI.ActionItemRole.SelectAll:
            object.text="Select All";
            if ( parent instanceof VG.UI.Menu ) object.statusTip="Select all data in the current widget.";
            if ( parent instanceof VG.UI.Menu ) parent.aboutToShow=this.modelMenuActionRoleValidationCallback.bind( this, parent );
            object.clicked=this.modelSelectAllCallback.bind( this );
            if ( parent instanceof VG.UI.Menu ) object.shortcut=this.shortcutManager.createDefault( VG.Shortcut.Defaults.SelectAll );
        break;

        case VG.UI.ActionItemRole.Login:
            object.text="LOGIN";

            if ( !VG.Utils.getImageByName( "_user.png" ) ) {
                VG.Utils.svgToImage( { data : VG.Shaders.fs["vgstyle_gray_user.svg"], width : 24, height : 24, callback : function( image ) {
                    image.name="_user.png";
                    VG.context.imagePool.addImage( image );
                }.bind( this ) } );
            }

            // object.svgName="glyphs.svg";
            // object.svgGroupName="User";

            object.iconName="_user.png";
            object.toolTip="Login to the application.";
            object.statusTip="Login to the application.";

            object.clicked=this.showLoginDialog.bind( this );
            object.visible=!this.userId;
        break;

        case VG.UI.ActionItemRole.Signup:
            object.text="SIGNUP";

            if ( !VG.Utils.getImageByName( "_login.png" ) ) {
                VG.Utils.svgToImage( { data : VG.Shaders.fs["vgstyle_gray_login.svg"], width : 24, height : 24, callback : function( image ) {
                    image.name="_login.png";
                    VG.context.imagePool.addImage( image );
                }.bind( this ) } );
            }

            object.iconName="_login.png";
            object.toolTip="Signup and become a user.";
            object.statusTip="Signup and become a user.";

            object.clicked=this.showSignupDialog.bind( this );
            object.visible=!this.userId;
            // object.svgName="glyphs.svg";
            // object.svgGroupName="SignUp";
        break;

        case VG.UI.ActionItemRole.UserTool:
            object.visible=this.userId;

            var size=object.calcSize( this.canvas );
            object.minimumSize.set( size );
            object.maximumSize.set( size );
        break;

        case VG.UI.ActionItemRole.QuickMenu:
            object.text="QuickMenu";

            if ( !VG.Utils.getImageByName( "_quickmenu.png" ) ) {
                VG.Utils.svgToImage( { data : VG.Shaders.fs["vgstyle_gray_quickmenu.svg"], width : 24, height : 24, callback : function( image ) {
                    image.name="_quickmenu.png";
                    VG.context.imagePool.addImage( image );
                }.bind( this ) } );
            }

            object.iconName="_quickmenu.png";
            object.toolTip="Show the application menu.";
            object.statusTip="Show the application menu.";

            // object.svgName="glyphs.svg";
            // object.svgGroupName="quickmenu";
            this.quickMenu=object;
        break;

        case VG.UI.ActionItemRole.SkinCycle:
            object.text="Skin Cycle";

            if ( !VG.Utils.getImageByName( "_skin.png" ) ) {
                VG.Utils.svgToImage( { data : VG.Shaders.fs["vgstyle_gray_skin.svg"], width : 24, height : 24, callback : function( image ) {
                    image.name="_skin.png";
                    VG.context.imagePool.addImage( image );
                }.bind( this ) } );
            }

            // object.svgName="glyphs.svg";
            // object.svgGroupName="SkinCycle";

            object.iconName="_skin.png";
            object.toolTip="Cycle through the available skins of the application.";
            object.statusTip="Cycle through the available skins of the application.";

            object.clicked=function() {
                var style=VG.UI.stylePool.current;
                var skin=style.skin;
                var skinIndex=style.skins.indexOf( skin );

                if ( skinIndex < style.skins.length - 1 ) skinIndex++;
                else skinIndex=0;

                style.skin=style.skins[skinIndex];

                VG.update();
            };
        break;

        default:
            object.text="Unknown Role";
        break;
    }
};

/**
 * Returns a rectangle with the visible screen area. Useful on Websites when the VG app is larger than the visible size and the browser
 * uses a scrollbar. In this case the returned rectangle contains the width and height of the visible area along with its offet. On all other
 * platforms the returned retangle is the same size as the Workspace rectangle.
 * @param {VG.Core.Rect} rect - Optional, the rectangle to fill out. If undefined a new rect will be allocated.
 * @returns A filled out rectangle with the visible screen space.
 */

VG.UI.Workspace.prototype.getVisibleScreenRect=function( rect )
{
    if ( !rect ) rect=VG.Core.Rect();

    if ( VG.getHostProperty( VG.HostProperty.Platform ) === VG.HostProperty.PlatformWeb ) {

        rect.x=document.body.scrollLeft;
        rect.y=document.body.scrollTop;
        rect.width=window.innerWidth;
        rect.height=window.innerHeight;
    } else rect.set( this.rect );
    return rect;
};

/**
 * Shows the VG.UI.Window derived object, like VG.UI.Dialog on the Workspace.
 * @param {VG.UI.Window} window - The window to display. Be sure to call the close() function of the Window / Dialog to close it after use.
 */

VG.UI.Workspace.prototype.showWindow=function( window, pos )
{
    if ( this.windows.indexOf( window ) !== -1 ) return;

    window.calcSize( this.canvas );

    if ( pos )
    {
        window.rect.x = pos.x;
        window.rect.y = pos.y;
    } else {
        var screenRect=this.getVisibleScreenRect();

        window.rect.x = Math.round( (this.contentRect.width - window.rect.width) / 2 );
        window.rect.y = Math.round( (screenRect.height - window.rect.height) * 0.25 );

        if ( this.callbackForPlaceWindow )
            this.callbackForPlaceWindow( window, screenRect );
    }

    window.visible=true;
    window.setFocus();

    window.close=function() {
        if ( VG.context.workspace.windows.indexOf( this ) !== -1 )  {
            VG.context.workspace.windows.splice( VG.context.workspace.windows.indexOf( this ), 1 );
            this.dispose();
            VG.update();
            window.visible = false;
        }
    }.bind( window );

    this.windows.push( window );
};

VG.UI.Workspace.prototype.tryToLogin=function( userName, password )
{
    VG.DB.userLogIn( userName, password, function( success, userName, userId, isAdmin )
    {
        if ( success )
        {
            this.userName=userName;
            this.userId=userId;
            this.userIsAdmin=isAdmin;

            this.modelLoggedStateChanged( this.userName.length > 0 ? true : false, this.userName, this.userId );

            if ( this.callbackForLoggedStateChanged )
                this.callbackForLoggedStateChanged( this.userName.length > 0 ? true : false, this.userName, this.userId );

        }
    }.bind( this ) );
};

VG.UI.Workspace.prototype.switchToStyle=function( style, skin )
{
    VG.UI.stylePool.current=style;
    this.canvas.style=style;

    if ( skin ) style.skin=skin;

    // --- Adjust the CSS background color to the statusbar end color
    if ( VG.getHostProperty( VG.HostProperty.Platform ) === VG.HostProperty.PlatformWeb ) {
        var canvas=document.getElementById( 'webgl' );
        var body=document.body;

        body.style["background-color"]=this.canvas.style.skin.StatusBar.BackColor.toHex();
    }
    return;
    /*
    VG.context.style=style;
    VG.context.workspace.canvas.style=style;

    if ( skin ) style.skin=skin;

    // --- Adjust the CSS background color to the statusbar end color
    if ( VG.getHostProperty( VG.HostProperty.Platform ) === VG.HostProperty.PlatformWeb ) {
        var canvas=document.getElementById( 'webgl' );
        var body=document.body;

        body.style["background-color"]=VG.context.style.skin.StatusBar.GradientColor2.toHex();
    }

    VG.update();*/
};

/**
 * Returns the currently active style.
 * @returns The currently active UI style.
 */

VG.UI.Workspace.prototype.getCurrentStyle=function()
{
    return VG.UI.stylePool.current;
};

VG.UI.Workspace.prototype.dragOperationStarted=function( source, itemId, item )
{
    if ( !this.dndOperation ) {
        this.dndOperation=true;
        this.dndSource=source;
        this.dndItemId=itemId;
        this.dndItem=item;
    }
};

VG.UI.Workspace.prototype.isDirty=function()
{
    let dirty=false;

    if ( this.dataCollectionForUndoRedo && this.dataCollectionForUndoRedo.__vgUndo )
    {
        if ( this.dataCollectionForUndoRedo.__vgUndo.undoIsAvailable )
        {
            dirty=true;
        }
    }

    return dirty;
};

VG.UI.Workspace.prototype.canBeClosed=function()
{
    let canBeClosed=true;

    if ( this.dataCollectionForUndoRedo && this.dataCollectionForUndoRedo.__vgUndo )
    {
        if ( this.dataCollectionForUndoRedo.__vgUndo.undoIsAvailable )
        {
            canBeClosed=false;
        }
    }

    if ( this._downloadIP ) {
        this._downloadIP=false;
        canBeClosed=true;
    }

    return canBeClosed;
};

/**
 * Returns true if running inside Electron
 * @returns {boolean} true if the application is running inside an Electron instance, false otherwise.
 */

VG.UI.Workspace.prototype.isElectron=function()
{
    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer')
        return true;
    if (typeof process !== 'undefined' && process.versions && !!process.versions.electron)
        return true;
    return false;
};