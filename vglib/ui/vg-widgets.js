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
 * Creates a Widget object.<br>
 * The Widget class is the base class for all user interface elements inside VG.UI.Workspace. Mostly, widgets are part of Layouts, however widgets can also
 * contain other widgets.<br>
 * A widget paints its user interface during paintWidget() according to its rect property which has been set by its parent prior to calling paintWidget().
 * @constructor
 * @tutorial Widget Class
 */

VG.UI.Widget=function()
{
    if ( !(this instanceof VG.UI.Widget) ) return new VG.UI.Widget();

    this.name="Widget";
    this.rect=VG.Core.Rect();
    this.contentRect=VG.Core.Rect();

    /**The optional layout of the Widget, only used by widgets which contain a sub-layout, default is null.
     * @member {object} */
    this.layout=0;

    /**The visual state of the Widget as defined in {@link VG.UI.Widget.VisualState}, set by {@link VG.UI.Workspace}.
     * @member {VG.UI.Widget.VisualState} VG.UI.Widget.visualState */
    this.visualState=VG.UI.Widget.VisualState.Normal;

    /** True if the widget has focus state. An easier and quicker to use alternative than to read out {@link VG.UI.Widget.VisualState}
    * @member {bool}
    */
    this.hasFocusState=false;
    /** True if the widget has hover state. An easier and quicker to use alternative than to read out {@link VG.UI.Widget.VisualState}
    * @member {bool}
    */
    this.hasHoverState=false;

    /**The disabled state of the object, false by default.
     * @member {bool} VG.UI.Widget.disabled */
    this._disabled=false;

    /**The visible state of the object, true by default. If false, the object will not be shown inside layouts.
     * @member {bool} VG.UI.Widget.visible */
    this._visible=true;

    /**If true indicates that the Widgets supports focus, i.e. accepts mouse and keyboard events. Default is false.
     * @member {bool} */
    this.supportsFocus=false;

    /**If true indicates that the Widgets supports auto focus, i.e. accepts mouse and keyboard events automatically when the mouse is over the widget. Useful for Widgets on
     * Website and Teblets. Default is false.
     * @member {bool} */
    this.supportsAutoFocus=false;
    this.noFocusDrawing=false;

    /**If the widget is part of a layout, this property indicates to the Layout that the Widget supports expanding in the horizontal direction and does not have a fixed width.
     * If not expanding it has a fixed width which is set to the size calculated by calcSize().
     * The default state depends on the Widget implementation.
     * @member {bool} VG.UI.Widget.horizontalExpanding */
    this._horizontalExpanding=true;

    /**If the widget is part of a layout, this property indicates to the Layout that the Widget supports expanding in the vertical direction and does not have a fixed height.
     * If not expanding it has a fixed height which is set to the size calculated by calcSize().
     * The default state depends on the Widget implementation.
     * @member {bool} VG.UI.Widget.verticalExpanding */
    this._verticalExpanding=true;

    this.canvas=0;
    this.parent=0;

    /**The minimumSize of the widget, defaults to 0, 0. Used in layouts to identify the minimum size for the Widget.
    * @member {VG.Core.Size} */
    this.minimumSize=VG.Core.Size( 0, 0 );

    /**The maximumSize of the widget, defaults to {@link VG.UI.MaxLayoutSize}.
    * @member {VG.Core.Size} */
    this.maximumSize=VG.Core.Size( 32768, 32768 );

    /**The preferredSize of the widget, defaults to 100, 100. Used in layouts to identify the preferred size for the Widget. This size is returned by calcSize() by default.
    * @member {VG.Core.Size} */
    this.preferredSize=VG.Core.Size( 100, 100 );

    /**If the Widget contains other VG.UI.Widget derived Widgets at fixed positions, which also need keyboard or mouse events, the Widget can assign an array to childWidgets
     * containing the references to these child widgets. The Workspace will than take these widget into consideration for all user based events. The Widget however has to handle
     * all paintWidget() calls for it's child widget itself, including setting their rect. Defaults to null.
     * @member {array} */
    this.childWidgets=null;

    this.isWidget=true;
    this.isLayout=false;

    this.dragSourceId=undefined;
};

/**
 * Enum for the visible state of a widget stored in {@link VG.UI.Widget.visualState}
 * @enum
 */

VG.UI.Widget.VisualState={ /** @type {number} Widget has normal state */ "Normal" : 0,
    /** @type {number} Mouse is on top of the widget */ "Hover" : 1,
    /** @type {number} Widget is being clicked */ "Clicked" : 2,
    /** @type {number} Widget has focus*/ "Focus" : 3 };

Object.defineProperty( VG.UI.Widget.prototype, "disabled",
{
    get: function() {
        if ( !this.parent ) return this._disabled;
        else  return  this._disabled | this.parent.disabled;
    },
    set: function( disabled ) {
        this._disabled=disabled;
        if ( disabled ) {
            if ( this.visualState === VG.UI.Widget.VisualState.Focus )
                VG.context.workspace.widgetLostFocus( this );
        }
    }
});

Object.defineProperty( VG.UI.Widget.prototype, "visible",
{
    get: function() {
        return this._visible;
        //if ( !this.parent ) return this._visible;
        //else  return  this._visible | this.parent.visible;
    },
    set: function( visible ) {
        this._visible=visible;
        VG.update();
    }
});

Object.defineProperty( VG.UI.Widget.prototype, "horizontalExpanding",
{
    get: function() {
        return this._horizontalExpanding;
    },
    set: function( expanding ) {
        this._horizontalExpanding=expanding;
    }
});

Object.defineProperty( VG.UI.Widget.prototype, "verticalExpanding",
{
    get: function() {
        return this._verticalExpanding;
    },
    set: function( expanding ) {
        this._verticalExpanding=expanding;
    }
});

/** Sets keyboard and mouse focus to this Widget.*/

VG.UI.Widget.prototype.setFocus=function()
{
    VG.context.workspace.setFocus( this );
};

/** Implement in your sub-class to dispose allocated resources like textures etc.*/

VG.UI.Widget.prototype.dispose=function()
{
};

/**Key down event, send to the widget when it has focus and the user is pressing a key. The keycode together with an array containing all currently pressed keys are passed as arguments.
 * @param {VG.Events.KeyCodes} keyCode - Keycode of the key
 * @param {array} keysDown - An array containing a list of all currently pressed keys
 */

VG.UI.Widget.prototype.keyDown=function( keyCode, keysDown )
{
    if ( this.supportsFocus && keyCode === VG.Events.KeyCodes.Tab )
        VG.context.workspace.cycleFocus( this );
};

/**Key up event, send to the widget when it has focus and the user is releasing a key. The keycode together with an array containing all currently pressed keys are passed as arguments.
 * @param {VG.Events.KeyCodes} keyCode - Keycode of the released key
 * @param {array} keysDown - An array containing a list of all currently pressed keys
 */

VG.UI.Widget.prototype.keyUp=function( keyCode, keysDown )
{
};

/**Mouse move event, send to the widget when it has focus and the user is moving the mouse.
 * @param {VG.Events.MouseMoveEvent} event - Event containing the mouse position
 */

VG.UI.Widget.prototype.mouseMove=function( event )
{
};

 /**Mouse down event, send to the widget when one of the mouse buttons has been pressed and the widget has focus.
  * @param {VG.Events.MouseDownEvent} event - Event containing information about the mouse state
  */

VG.UI.Widget.prototype.mouseDown=function( event )
{
};

/**Mouse up event, send to the widget when one of the mouse buttons has been released and the widget has focus.
 * @param {VG.Events.MouseUpEvent} event - Event containing information about the mouse state
 */

VG.UI.Widget.prototype.mouseUp=function( event )
{
};

VG.UI.Widget.prototype.showContextMenu=function( event )
{
    if ( this.contextMenu && this.rect.contains( event.pos ) )
        this.contextMenu.activate( event.pos );
};

/**Paints the widget. Called by the parent when the widget should be painted. The rect member of the widget has been set to the valid
 * dimensions for the Widget before this call. All paint operations should be clipped to this rectangle.
 * @param {VG.Canvas} canvas - Canvas object providing convenience 2D draw functions
 */

VG.UI.Widget.prototype.paintWidget=function( canvas )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, VG.UI.stylePool.current.skin.Widget.BackgroundColor );

    if ( this.layout ) this.layout.layout( canvas );
};

/**Returns the recommended size for the Widget. Used by Layouts to calculate the Widget dimensions. If the Widget is not expanding
 * vertically or horizontally the Layout will fix the widget to the returned size. If the Widget is expanding, the Layout will consider
 * the returned size relatively to the sizes of the other Widgets in the layout. <br>The minimumSize and maximumSize dimensions can also be set
 * inside calcSize(), these are used to restrict dimensions of expanding widgets.
 * The default implementation returns {@link VG.UI.Widget.preferredSize}. This function only needs to be overriden if the widget is adjusting its size dynamically depending on its state.
 * @returns {VG.Core.Size}
 */

VG.UI.Widget.prototype.calcSize=function( canvas )
{
     return this.preferredSize;
};

/**Sets a fixed size for the Widget. Convenience function which adjusts the minimumSize, maximumSize and preferredSize properties as well as setting
 * horizontalExpanding and verticalExpanding to false.
 * @param {number} width - The fixed width
 * @param {number} width - The fixed height
 */

VG.UI.Widget.prototype.setFixedSize=function( width, height )
{
     this.minimumSize.width=this.maximumSize.width=this.preferredSize.width=width;
     this.minimumSize.height=this.maximumSize.height=this.preferredSize.height=height;
     this.horizontalExpanding=false; this.verticalExpanding=false;
};

VG.UI.Widget.prototype.checkSizeDimensionsMinMax=function( size )
{
    if ( !this.horizontalExpanding )
        if ( this.minimumSize.width < size.width )
            this.minimumSize.width=size.width;

    if ( !this.verticalExpanding )
        if ( this.minimumSize.height < size.height )
            this.minimumSize.height=size.height;

    if ( !this.horizontalExpanding )
        if ( this.minimumSize.width > size.width )
            size.width=this.minimumSize.width;

    if ( !this.verticalExpanding )
        if ( this.minimumSize.height > size.height )
            size.height=this.minimumSize.height;

    if ( !this.horizontalExpanding )
        if ( this.maximumSize.width < size.width )
            size.width=this.maximumSize.width;

    if ( !this.verticalExpanding )
        if ( this.maximumSize.height < size.height )
            size.height=this.maximumSize.height;
};

VG.UI.Widget.prototype.valueFromModel=function( value )
{
    //console.log( "received " + value );
};

VG.UI.Widget.prototype.setDragSourceId=function( id )
{
    this.dragSourceId=id;
};

/**
 * Creates an RenderWidget to perform arbitrary realtime 2D/3D rendering.
 *
 * The method render() is called to perform the rendering and needs to be overriden. The widget receives
 * calls to render() in 60 fps per second.
 * @constructor
 */

VG.UI.RenderWidget=function( noRealtime )
{
    if ( !(this instanceof VG.UI.RenderWidget) ) return new VG.UI.RenderWidget( noRealtime );

    VG.UI.Widget.call( this );

    this.supportsFocus=true;
    this.clearColor=false;

    this._timer = new VG.Core.Timer();

    this._mainRT = VG.Renderer().mainRT;

    this.clearBackground=true;
    if ( !noRealtime ) VG.context.workspace.autoRedrawInterval=0;
};

VG.UI.RenderWidget.prototype=VG.UI.Widget();

/** Called to perform rendering, must be overrided, otherwise this does nothing
 * @param {number} delta - The time passed in seconds from the last call to this method
 */

VG.UI.RenderWidget.prototype.render=function(delta)
{
};

VG.UI.RenderWidget.prototype.paintWidget=function( canvas )
{
    // canvas.pushClipRect( this.rect );

    var clearColor = this.clearColor || canvas.style.skin.Widget.BackgroundColor;

    //fakes a hardware clear by rendering a quad as background
    //if ( this.clearBackground ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, clearColor );
    // if ( this.clearBackground ) this._mainRT.clear( clearColor, true );
    canvas.flush();

    this._mainRT.setViewport(this.rect);

    var delta = VG.Math.clamp(this._timer.getDelta(), 0.0001, 0.2);
    this.render(delta);

    if ( VG.context.workspace.mainRect ) this._mainRT.setViewport( VG.context.workspace.mainRect );
    else this._mainRT.setViewport(VG.context.workspace.rect);
    // canvas.popClipRect();
};

// ----------------------------------------------------------------- VG.UI.Frame

VG.UI.Frame=function()
{
    if ( !(this instanceof VG.UI.Frame) ) return new VG.UI.Frame();

    VG.UI.Widget.call( this );

    this.frameType=VG.UI.Frame.Type.None;
    this._image=VG.Core.Image();
};

VG.UI.Frame.Type={ "None" : 0, "Box" : 1 };

VG.UI.Frame.prototype=VG.UI.Widget();

VG.UI.Frame.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawFrame( this, canvas );
};

/**
 * Displays an image.
 *
 * @property {VG.Core.Image} image - The image object to show.
 * @property {string} imageName - The name of the image to load from the applications image pool.
 * @constructor
 * @param image {VG.Core.Image|string} image - The image to display, can either be an image object or the name of the image which will be retrieved from the applications {@link VG.Core.ImagePool|image pool}.
 */

VG.UI.Image=function( image )
{
    if ( !(this instanceof VG.UI.Image) ) return new VG.UI.Image( image );

    VG.UI.Frame.call( this );

    this.frameType=VG.UI.Frame.Type.None;
    this._verticalExpanding=true;
    this._horizontalExpanding=true;
    this.upScaling=false;

    if ( image && image instanceof VG.Core.Image )
    {
        this.image=image;
    } else
    if ( image && typeof image === 'string' )
    {
        this.imageName=image;
        image=VG.Utils.getImageByName( this.imageName );
        if ( image && !image.locked ) this._image.set( image );

    } else
    this._image=VG.Core.Image();

    this.adjustSizeToImage=true;
};

VG.UI.Image.prototype=VG.UI.Frame();

Object.defineProperty( VG.UI.Image.prototype, "image", {
    get: function() {
        return this._image;
    },
    set: function( image ) {

        this._image.set( image );

        if ( this.collection && this.path )
            this.collection.storeDataForPath( { path : this.path, value : this._image.imageData } );
    }
});

VG.UI.Image.prototype.calcSize=function()
{
    if ( this.adjustSizeToImage === false )
        return this.preferredSize;

    var size=VG.Core.Size( 0, 0 );

    if ( this._image.isValid() ) {
        size.set( this._image.width, this._image.height );
    }

    this.checkSizeDimensionsMinMax( size );

    this.minimumSize.width=size.width/10;
    this.minimumSize.height=size.height/10;

    return size;
};

/**
 * Binds the widget to the data model. This widget has to be bound to a VG.Core.Image object (or null).
 * @param {VG.Data.Collection} collection - The data collection to link this widget to.
 * @param {string} path - The path inside the data collection to bind this widget to.
 * @tutorial Data Model
 */

VG.UI.Image.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.UI.Image.prototype.valueFromModel=function( value )
{
    //console.log( "Image.valueFromModel: ", value );

    if ( value === null ) this._image.clear();
    else VG.decompressImageData( value, this._image );
};

VG.UI.Image.prototype.isValid=function()
{
    return this._image.isValid();
};

VG.UI.Image.prototype.mouseDown=function( event )
{
    this.mouseIsDown=true;
};

VG.UI.Image.prototype.mouseUp=function( event )
{
    this.mouseIsDown=false;
};

VG.UI.Image.prototype.paintWidget=function( canvas )
{
    VG.UI.Frame.prototype.paintWidget.call( this, canvas );
    let image;

    if ( !this._image.isValid() )
    {
        // --- Check if this image is based on an imageName and if yes, try to load it
        if ( this.imageName ) {
            image=VG.Utils.getImageByName( this.imageName );

            if ( image && !image.locked ) this._image.set( image );
            else return;
        } else return;
    }

    if ( !this.rect.width || !this.rect.height ) return;

    image=this._image;

    if ( this.clickedImage && this.mouseIsDown ) image=this.clickedImage;
    else
    if ( this.hoverImage && this.visualState === VG.UI.Widget.VisualState.Hover ) image=this.hoverImage;

    // --- Draw It

    if ( this.rect.width >= image.width && this.rect.height >= image.height )
    {
        if ( !this.upScaling ) {
            let x=this.contentRect.x + (this.contentRect.width - image.width) / 2;
            let y=this.contentRect.y + (this.contentRect.height - image.height) / 2;
            canvas.drawImage( VG.Core.Point( x, y ), image );
        } else canvas.drawImage( this.contentRect.pos(), image, this.contentRect.size() );
    } else canvas.drawScaledImage( this.contentRect, image );
};

/**
 * Displays an clickable button widget.
 *
 *
 * @param {string} text - The text to display.
 * @property {string} text - The text to display.
 * @property {bool} checkable - Indicates if the button supports a checked state.
 * @property {bool} checked - If the button is checkable, indicates if the button is currently checked.
 * @property {callback} clicked - Set this property to a callback function which gets called when the users clicks (mouse-press and release) the button.
 * @constructor
 */

VG.UI.Button=function( text )
{
    if ( !(this instanceof VG.UI.Button) ) return new VG.UI.Button( text );
    this.text=arguments[0];

    VG.UI.Widget.call( this );
    this.name="Button";

    this.minimumSize.set( 80, 20 );

    this.horizontalExpanding=false;
    this.verticalExpanding=false;

    this.supportsFocus=true;
    this.mouseIsDown=false;
    this.big=true;

    this.checkable=false;
    this.checked=false;

    this._icon=0;
};

VG.UI.Button.prototype=VG.UI.Widget();
/*
Object.defineProperty( VG.UI.Button.prototype, "icon", {
    get: function() {
        return this._icon;
    },
    set: function( icon ) {
        this._icon=icon;
    }
});*/

VG.UI.Button.prototype.calcSize=function( canvas )
{
    var size=this.preferredSize;

    if ( this.big )
    {
        canvas.pushFont( VG.UI.stylePool.current.skin.Button.Font );

        VG.context.workspace.canvas.getTextSize( this.text, size );

        if ( size.width < 80 ) size.width=80;

        size.width+=20;

        if ( !this.__vgInsideToolBar ) size.height+=15;
        else size.height+=11;

        this.minimumSize.set( size );
    } else {
        canvas.pushFont( VG.UI.stylePool.current.skin.Button.SmallFont );

        VG.context.workspace.canvas.getTextSize( this.text, size );

        if ( size.width < 80 ) size.width=80;

        if ( size.height < 17 )
            size.height=17;

        size.width+=10;
        this.minimumSize.set( size );
    }

    this.checkSizeDimensionsMinMax( size );

    canvas.popFont();

    return size;
};

VG.UI.Button.prototype.mouseDown=function( event )
{
    if ( this.rect.contains( event.pos) && !this.disabled )
        this.mouseIsDown=true;
};

VG.UI.Button.prototype.mouseUp=function( event )
{
    if ( this.rect.contains( event.pos) )
    {
        if ( this.checkable && this.mouseIsDown ) {
            this.checked=true;

            // --- Uncheck other checkable VG.UI.Buttons if the parent is a VG.UI.Layout

            if ( this.parent && this.parent instanceof VG.UI.Layout ) {
                for ( var i=0; i <= this.parent.children.length; ++i ) {
                    var obj=this.parent.children[i];
                    if ( obj instanceof VG.UI.Button && obj !== this )
                        obj.checked=false;
                }
            }
        }
    }
    this.mouseIsDown=false;
};

VG.UI.Button.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawButton( this, canvas );
};

// ----------------------------------------------------------------- VG.UI.Scrollbar

VG.UI.ScrollBar=function()
{
    if ( !(this instanceof VG.UI.ScrollBar) ) return new VG.UI.ScrollBar();

    VG.UI.Widget.call( this );
    this.name="ScrollBar";

    this.direction=VG.UI.ScrollBar.Direction.Vertical;

    this.handleRect=VG.Core.Rect();

    this.dragOpStartPos=VG.Core.Point();
    this.dragHandleOffset=0;
    this.handleOffset=0;

    this.offset=0;
    this.callbackObject=0;
};

VG.UI.ScrollBar.Direction={ "Vertical" : 0, "Horizontal" : 1 };

VG.UI.ScrollBar.prototype=VG.UI.Widget();

VG.UI.ScrollBar.prototype.setScrollBarContentSize=function( totalSize, visibleSize )
{
    this.totalSize=totalSize;
    this.visibleSize=visibleSize;
};

VG.UI.ScrollBar.prototype.scrollTo=function( offset )
{
    offset=Math.max( offset, 0 );

    this.calibrateHandleOffset();
    this.handleOffset=offset / this.totalSize * this.visibleSize;
    this.verifyHandleRect();

    if ( this.direction === VG.UI.ScrollBar.Direction.Vertical ) this.callbackObject.vHandleMoved( this.handleRect.y - this.rect.y );
    else this.callbackObject.hHandleMoved( this.handleRect.x - this.rect.x );

    VG.update();
};

VG.UI.ScrollBar.prototype.calibrateHandleOffset=function( offset )
{
    // --- Reset the handle offset to its valid range

    if ( this.handleOffset < 0 ) this.handleOffset=0;

    if ( this.direction === VG.UI.ScrollBar.Direction.Vertical ) {
        if ( this.handleOffset > (this.rect.height - this.handleRect.height) ) this.handleOffset=this.rect.height - this.handleRect.height;
    } else
    if ( this.direction === VG.UI.ScrollBar.Direction.Horizontal ) {
        if ( this.handleOffset > (this.rect.width - this.handleRect.width) ) this.handleOffset=this.rect.width - this.handleRect.width;
    }
    this.dragHandleOffset=0;
};

VG.UI.ScrollBar.prototype.verifyHandleRect=function()
{
    this.handleRect.set( this.rect );
    if ( this.direction === VG.UI.ScrollBar.Direction.Vertical ) {

        this.handleRect.y+=this.handleOffset + this.dragHandleOffset;
        this.handleRect.height=this.rect.height / this.totalSize * this.visibleSize;

        if ( this.handleRect.y < this.rect.y )
            this.handleRect.y=this.rect.y;

        if ( this.handleRect.bottom() > this.rect.bottom() )
            this.handleRect.y=this.rect.bottom() - this.handleRect.height;
    } else
    if ( this.direction === VG.UI.ScrollBar.Direction.Horizontal ) {

        this.handleRect.x+=this.dragHandleOffset + this.handleOffset;
        this.handleRect.width=this.rect.width / this.totalSize * this.visibleSize;

        if ( this.handleRect.x < this.rect.x )
            this.handleRect.x=this.rect.x;

        if ( this.handleRect.right() > this.rect.right() )
            this.handleRect.x=this.rect.right() - this.handleRect.width;
    }
};

VG.UI.ScrollBar.prototype.mouseMove=function( event )
{
    if ( VG.context.workspace.mouseTrackerWidget !== this )
        return;

    var offset;
    if ( this.direction === VG.UI.ScrollBar.Direction.Vertical )
    {
        offset=event.pos.y - this.dragOpStartPos.y;

        if ( offset != this.handleOffset ) {

            this.handleOffset=offset;

            if ( this.callbackObject && this.callbackObject.vHandleMoved ) {
                this.verifyHandleRect();
                this.callbackObject.vHandleMoved( this.handleRect.y - this.rect.y );
            }
            VG.update();
        }
    } else
    if ( this.direction === VG.UI.ScrollBar.Direction.Horizontal )
    {
        offset=event.pos.x - this.dragOpStartPos.x;

        if ( offset != this.handleOffset ) {

            this.handleOffset=offset;

            if ( this.callbackObject && this.callbackObject.hHandleMoved ) {
                this.verifyHandleRect();
                this.callbackObject.hHandleMoved( this.handleRect.x - this.rect.x );
            }
            VG.update();
        }
    }
};

VG.UI.ScrollBar.prototype.getHandleOffset=function()
{
    if ( this.direction === VG.UI.ScrollBar.Direction.Vertical )
    {
        return this.handleRect.y - this.rect.y;
    } else
    if ( this.direction === VG.UI.ScrollBar.Direction.Horizontal )
    {
        return this.handleRect.x - this.rect.x;
    }
};

VG.UI.ScrollBar.prototype.setHandleOffset=function( offset )
{
    if ( this.direction === VG.UI.ScrollBar.Direction.Vertical )
    {
        if ( offset != this.handleOffset ) {

            this.handleOffset=offset;

            if ( this.callbackObject && this.callbackObject.vHandleMoved ) {
                this.verifyHandleRect();
                this.callbackObject.vHandleMoved( this.handleRect.y - this.rect.y );
            }
            VG.update();
        }
    } else
    if ( this.direction === VG.UI.ScrollBar.Direction.Horizontal )
    {
        if ( offset != this.handleOffset ) {

            this.handleOffset=offset;

            if ( this.callbackObject && this.callbackObject.hHandleMoved ) {
                this.verifyHandleRect();
                this.callbackObject.hHandleMoved( this.handleRect.x - this.rect.x );
            }
            VG.update();
        }
    }
};

VG.UI.ScrollBar.prototype.mouseDown=function( event )
{
    this.calibrateHandleOffset();

    if ( this.handleRect.contains( event.pos ) ) {
        VG.context.workspace.mouseTrackerWidget=this;

        this.dragOpStartPos.set( event.pos );
        this.handleOffset=0;

        if ( this.direction === VG.UI.ScrollBar.Direction.Vertical ) {
            this.dragHandleOffset=this.handleRect.y - this.rect.y;
        } else
        if ( this.direction === VG.UI.ScrollBar.Direction.Horizontal ) {
            this.dragHandleOffset=this.handleRect.x - this.rect.x;
        }
    } else
    if ( this.direction === VG.UI.ScrollBar.Direction.Vertical )
    {
        this.dragHandleOffset=0;

        if ( event.pos.y < this.handleRect.y ) {
            // --- User clicks above the ScrollBar

            this.handleOffset-=this.handleRect.height;
        }  else
        if ( event.pos.y > this.handleRect.bottom() ) {
            // --- User clicks below the ScrollBar

            this.handleOffset+=this.handleRect.height;
        }

        if ( this.callbackObject && this.callbackObject.vHandleMoved ) {
            this.verifyHandleRect();
            this.callbackObject.vHandleMoved( this.handleRect.y - this.rect.y );
        }
        VG.update();
    } else
    if ( this.direction === VG.UI.ScrollBar.Direction.Horizontal )
    {
        this.dragHandleOffset=0;

        if ( event.pos.x < this.handleRect.x ) {
            // --- User clicks left of the ScrollBar

            this.handleOffset-=this.handleRect.width;
        }  else
        if ( event.pos.x > this.handleRect.right() ) {
            // --- User clicks right of the ScrollBar

            this.handleOffset+=this.handleRect.width;
        }

        if ( this.callbackObject && this.callbackObject.hHandleMoved ) {
            this.verifyHandleRect();
            this.callbackObject.hHandleMoved( this.handleRect.x - this.rect.x );
        }
        VG.update();
    }
};

VG.UI.ScrollBar.prototype.autoScrollStart=function( event )
{
    this.calibrateHandleOffset();

    VG.context.workspace.mouseTrackerWidget=this;

    this.dragOpStartPos.set( event.pos );
    this.handleOffset=0;

    if ( this.direction === VG.UI.ScrollBar.Direction.Vertical ) {
        this.dragHandleOffset=this.handleRect.y - this.rect.y;
    } else
    if ( this.direction === VG.UI.ScrollBar.Direction.Horizontal ) {
        this.dragHandleOffset=this.handleRect.x - this.rect.x;
    }

    this.autoScrolling=true;
};

VG.UI.ScrollBar.prototype.mouseUp=function( event )
{
    if ( VG.context.workspace.mouseTrackerWidget === this )
        VG.context.workspace.mouseTrackerWidget=0;

    this.autoScrolling=false;

    VG.update();
};

VG.UI.ScrollBar.prototype.paintWidget=function( canvas, adjustAlpha )
{
    this.contentRect.set( this.rect );

    this.verifyHandleRect( this.handleOffset );
    if ( this.handleRect.width <= 0 || this.handleRect.height <= 0 ) return;

    VG.UI.stylePool.current.drawScrollBar( this, canvas, adjustAlpha );
};

/**
 * Displays a clickable check box widget.
 *
 * @param {bool} checked - The initial checked state of the button.
 * @property {bool} checked - The checked state of the button.
 * @property {callback} clicked - Set this property to a callback function which gets called when the users clicks (mouse-press and release) the check box.
 * @constructor
 */

VG.UI.CheckBox=function( checked )
{
    if ( !(this instanceof VG.UI.CheckBox) ) return new VG.UI.CheckBox( checked );

    VG.UI.Widget.call( this );
    this.name="Checkbox";

    this.setFixedSize( 16, 14 ); // 19,19
    this.supportsFocus=true;

    this.checked=checked;
    this.preferredSize.copy( this.minimumSize );
    this.preferredSize.height += 4;
};

VG.UI.CheckBox.prototype=VG.UI.Widget();

/**
 * Binds the widget to the data model. This widget has to be bound to a boolean Number value.
 * @param {VG.Data.Collection} collection - The data collection to link this widget to.
 * @param {string} path - The path inside the data collection to bind this widget to.
 * @tutorial Data Model
 */

VG.UI.CheckBox.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.UI.CheckBox.prototype.valueFromModel=function( value )
{
    //console.log( "TextEdit.valueFromModel: " + value );

    if ( value === null ) this.checked=false;
    else this.checked=value;

    if ( this.changed )
        this.changed( this.checked );

    VG.update();
};

VG.UI.CheckBox.prototype.mouseDown=function( event )
{
    if ( !this.rect.contains( event.pos ) ) return;

    if ( this.checked ) this.checked=false;
    else this.checked=true;

    if ( this.collection && this.path )
        this.collection.storeDataForPath( { path : this.path, value : this.checked, undoText : this.undoText } );

    if ( this.changed )
        this.changed( this.checked, this );

    VG.update();
};

VG.UI.CheckBox.prototype.mouseUp=function( event )
{
};

VG.UI.CheckBox.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawCheckBox( this, canvas );
};

// ----------------------------------------------------------------- VG.UI.ShiftWidget

VG.UI.ShiftWidgetItem=function( text, widget )
{
    this.text=text;
    this.widget=widget;
};

VG.UI.ShiftWidget=function()
{
    if ( !(this instanceof VG.UI.ShiftWidget) ) return VG.UI.ShiftWidget.creator( arguments );

    VG.UI.Widget.call( this );
    this.name="ShiftWidget";

    this.horizontalExpanding=true;
    this.verticalExpanding=true;

    this.minimumSize.set( 60, 40 );
    this.maximumSize.set( 32768, 32768 );
    this.preferredSize.set( 60, 40 );

    this.supportsFocus=false;

    this.childs=[];
    this.index=-1;
    this.popup=false;

    this.popupRect=VG.Core.Rect();
    this.layout=VG.UI.StackedLayout();

    this.maxUp=5; this.maxDown=5;
    this.itemHeight=30;

    for( var i=0; i < arguments.length; i+=2 )
        if ( String( arguments[i] ).length ) this.addChild( arguments[i], arguments[i+1] );
};

VG.UI.ShiftWidget.prototype=VG.UI.Widget();

Object.defineProperty( VG.UI.ShiftWidget.prototype, "index", {
    get: function() {
        return this._index;
    },
    set: function( index ) {
        this._index=index;

        if ( index === -1 )
            this.layout.current=undefined;
        else
            this.layout.current=this.childs[index].widget;
    }
});

VG.UI.ShiftWidget.prototype.clear=function( text )
{
    this.childs=[];
    this.index=-1;
};

VG.UI.ShiftWidget.prototype.text=function()
{
    var text="";
    if ( this.index !== -1 ) text=this.childs[this.index];
    return text;
};

VG.UI.ShiftWidget.prototype.addChild=function( text, widget )
{
    this.layout.addChild( widget );
    this.childs.push( new VG.UI.ShiftWidgetItem( text, widget ) );
    if ( this.index === -1 ) this.index=0;
};

VG.UI.ShiftWidget.prototype.addChilds=function()
{
    for( var i=0; i < arguments.length; i+=2 )
        this.addItem( arguments[i], arguments[i+1] );
};

VG.UI.ShiftWidget.prototype.calcSize=function( canvas )
{
    var size=this.preferredSize;
    return size;
};

VG.UI.ShiftWidget.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.UI.ShiftWidget.prototype.valueFromModel=function( value )
{
    //VG.log( "TextEdit.valueFromModel: " + value );

    if ( value === null ) this.index=0;
    else this.index=value;

    if ( this.changed )
        this.changed( this.index, this.childs[this.index], this );
};

VG.UI.ShiftWidget.prototype.applyNewIndex=function( index )
{
    this.index=index;
    if ( this.collection && this.path )
        this.collection.storeDataForPath( { path : this.path, value : this.index } );

    if ( this.changed )
        this.changed( index, this.childs[index].widget, this );
};

VG.UI.ShiftWidget.prototype.focusIn=function()
{
    if ( this.focusInCallback )
        this.focusInCallback( this );
};

VG.UI.ShiftWidget.prototype.keyDown=function( keyCode )
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
            if ( this.index < (this.childs.length -1 )) {
                this.applyNewIndex( this.index + 1 );
                VG.update();
            }
        }
    }
};

VG.UI.ShiftWidget.prototype.mouseMove=function( event )
{
    if ( this.popup && this.popupRect && this.popupRect.contains( event.pos ) )
    {
        var y=event.pos.y - this.popupRect.y;
        var index= Math.floor( y / this.itemHeight );

        this.highlightedIndex=(this.index - this.itemsUp + index );
        this.highlightedIndex=VG.Math.clamp( this.highlightedIndex, 0, this.childs.length-1 );
        VG.update();
    }
};

VG.UI.ShiftWidget.prototype.mouseDown=function( event )
{
    var index;
    if ( event.pos.x - this.rect.x < 25 )
    {
        if ( this.index === 0 ) index=this.childs.length-1;
        else index=this.index-1;

        this.applyNewIndex( index );
    } else
    if ( this.rect.right() - event.pos.x < 25 )
    {
        index=(this.index + 1 ) % this.childs.length;
        this.applyNewIndex( index );
    } else
    if ( this.rect.contains( event.pos ) ) {
        VG.context.workspace.mouseTrackerWidget=this;

        this.highlightedIndex=this.index;
        this.popup=true;
        this.oldIndex=this.index;
    }
};

VG.UI.ShiftWidget.prototype.mouseUp=function( event )
{
    VG.context.workspace.mouseTrackerWidget=null;

    if ( this.popup && this.highlightedIndex !== this.oldIndex )
        this.applyNewIndex( this.highlightedIndex );

    this.popup=false;

    VG.update();
};

VG.UI.ShiftWidget.prototype.paintWidget=function( canvas )
{
    this.contentRect.copy( this.rect );

    if ( this.popup && canvas.delayedPaintWidgets.indexOf( this ) === -1 ) {
        canvas.delayedPaintWidgets.push( this );
    } else
    {
        if ( this.index !== -1 ) {

            this.layout.rect.copy( this.rect );
            this.layout.rect.y+=this.itemHeight; this.layout.rect.height-=this.itemHeight;
            this.layout.layout( canvas );
        }

        VG.UI.stylePool.current.drawShiftWidget( this, canvas );
    }
};

/**
 * Displays a drop down menu widget, offering several selectable choices to the user.
 *
 * @param {string} Texts - Initial content of the widget.
 * @property {callback} changed - Called when the current string item changes, parameters are: index, text, this.
 * @constructor
 */

VG.UI.DropDownMenu=function()
{
    if ( !(this instanceof VG.UI.DropDownMenu) ) return VG.UI.DropDownMenu.creator( arguments );

    VG.UI.Widget.call( this );
    this.name="DropDownMenu";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;

    this.minimumSize.set( 60, 20 );
    this.maximumSize.set( 32768, 40 );

    this.supportsFocus=true;

    this.items=[];
    this.index=-1;
    this.popup=false;

    this.popupRect=VG.Core.Rect();

    for( var i=0; i < arguments.length; ++i )
        if ( String( arguments[i] ).length ) this.addItem( arguments[i] );
};

VG.UI.DropDownMenu.prototype=VG.UI.Widget();

/**
 * Clears the content of the widget.
 */

VG.UI.DropDownMenu.prototype.clear=function( text )
{
    this.items=[];
    this.index=-1;
};

/**
 * Returns the currently displayed text.
 * @returns {string} The currently displayed text.
 */

VG.UI.DropDownMenu.prototype.text=function()
{
    var text="";
    if ( this.index !== -1 ) text=this.items[this.index];
    return text;
};

/**
 * Adds a text to the drop down menu list.
 *
 * @param {string} Text - The text to add.
 */

VG.UI.DropDownMenu.prototype.addItem=function( text )
{
    this.items.push( text );
    if ( this.index === -1 ) this.index=0;
};

/**
 * Adds all text arguments to the drop down menu list.
 *
 * @param {string} Texts - The list of text to add.
 */

VG.UI.DropDownMenu.prototype.addItems=function()
{
    for( var i=0; i < arguments.length; ++i )
        this.addItem( arguments[i] );
};

VG.UI.DropDownMenu.prototype.calcSize=function( canvas )
{
    let size = this.preferredSize;
    let minWidth = 80;

    VG.context.workspace.canvas.pushFont( VG.UI.stylePool.current.skin.DropDownMenu.Font );

    for( var i=0; i < this.items.length; ++i ) {
        canvas.getTextSize( this.items[i], size );
        if ( size.width > minWidth ) minWidth=size.width;
    }

    size.set( minWidth, VG.context.workspace.canvas.getLineHeight() );

    size.add( 40, 3, size );

    size.width = Math.min( size.width, this.maximumSize.width );

    //size.height=VG.UI.stylePool.current.skin.DropDownMenu.Height;
    this.minimumSize.set( size );

    if ( this.parent && size.height > this.parent.rect.height ) size.height=this.parent.rect.height;

    VG.context.workspace.canvas.popFont();

    return size;
};

/**
 * Binds the widget to the data model. This widget has to be bound to a String value.
 * @param {VG.Data.Collection} collection - The data collection to link this widget to.
 * @param {string} path - The path inside the data collection to bind this widget to.
 * @tutorial Data Model
 */

VG.UI.DropDownMenu.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.UI.DropDownMenu.prototype.valueFromModel=function( value )
{
    //VG.log( "TextEdit.valueFromModel: " + value );

    if ( value === null ) this.index=0;
    else this.index=value;

    if ( this.changed )
        this.changed( this.index, this.items[this.index], this, true );
};

VG.UI.DropDownMenu.prototype.applyNewIndex=function( index )
{
    this.index=index;
    if ( this.collection && this.path )
        this.collection.storeDataForPath( { path : this.path, value : this.index, undoText : this.undoText } );

    if ( this.changed )
        this.changed( index, this.items[index], this );
};

VG.UI.DropDownMenu.prototype.focusIn=function()
{
    if ( this.focusInCallback )
        this.focusInCallback( this );
};

VG.UI.DropDownMenu.prototype.keyDown=function( keyCode )
{
    if ( VG.UI.Widget.prototype.keyDown.call( this, keyCode ) )
        return;

    if ( this.popup )
    {
        if ( keyCode == VG.Events.KeyCodes.Esc )
        {
            this.index=this.oldIndex;
            this.popup=false;
            VG.context.workspace.mouseTrackerWidget=null;

            VG.update();
        } else
        if ( keyCode == VG.Events.KeyCodes.ArrowUp )
        {
            if ( this.index > 0 ) {
                this.index--;
                VG.update();
            }
        } else
        if ( keyCode == VG.Events.KeyCodes.ArrowDown )
        {
            if ( this.index < (this.items.length -1 )) {
                this.index++;
                VG.update();
            }
        } else
        if ( keyCode == VG.Events.KeyCodes.Enter )
        {
            if ( this.index !== this.oldIndex )
                this.applyNewIndex( this.index );

            this.popup=false;
            VG.context.workspace.mouseTrackerWidget=null;
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

VG.UI.DropDownMenu.prototype.mouseMove=function( event )
{
    if ( this.popup && this.popupRect && this.popupRect.contains( event.pos ) )
    {
        var y=event.pos.y - this.popupRect.y;
        var index=y / this.itemHeight;

        if ( index < this.items.length ) {
            this.index=Math.floor( index );
            VG.update();
        }
    }
};

VG.UI.DropDownMenu.prototype.mouseDown=function( event )
{
    if ( this.popup === false )
    {
        if ( this.rect.contains( event.pos ) )
        {
            VG.context.workspace.mouseTrackerWidget=this;

            this.popup=true;
            this.oldIndex=this.index;
        }
    } else
    {
        if ( this.popupRect.contains( event.pos ) )
        {
            if ( this.index !== this.oldIndex )
                this.applyNewIndex( this.index );
        } else this.index=this.oldIndex;

        this.popup=false;
        VG.context.workspace.mouseTrackerWidget=null;
    }
};

VG.UI.DropDownMenu.prototype.mouseUp=function( event )
{
/*
    this.popup=false;
    VG.context.workspace.mouseTrackerWidget=null;

    if ( this.index !== this.oldIndex )
        this.applyNewIndex( this.index );
*/
};

VG.UI.DropDownMenu.prototype.paintWidget=function( canvas )
{
    this.contentRect.set( this.rect );

    if ( this.popup && canvas.delayedPaintWidgets.indexOf( this ) === -1 ) canvas.delayedPaintWidgets.push( this );
    else VG.UI.stylePool.current.drawDropDownMenu( this, canvas );
};

/**
 * Status bar widget. Create a status bar and set it to the {@link VG.UI.Workspace|workspace} via the {@link VG.UI.Workspace.statusBar} property.
 *
 * @property {VG.UI.Layout} layout - Modify this layout with the content you want to add to the status bar. By default this layout is empty.
 * @constructor
 */

VG.UI.StatusBar=function()
{
    if ( !(this instanceof VG.UI.StatusBar) ) return new VG.UI.StatusBar();

    VG.UI.Widget.call( this );
    this.name="StatusBar";

    // ---

    this.layout=VG.UI.Layout();

    this.layout.margin.left=10;
    this.layout.margin.top=10;

    // ---

    this.messageLayout=VG.UI.Layout();

    this.messageLayout.margin.left=10;
    this.messageLayout.margin.top=10;

    this.messageLabel=VG.UI.Label( "" );
    this.messageLabel.hAlignment=VG.UI.HAlignment.Left;
    this.messageLabel.vAlignment=VG.UI.HAlignment.Bottom;

    this.messageLayout.addChild( this.messageLabel );

    this.spacer=VG.UI.LayoutHSpacer();
    this.messageLayout.addChild( this.spacer );
};

VG.UI.StatusBar.prototype=VG.UI.Widget();

/**
 * Displays a temporary message on the status bar, clearing all other content. The timeout indicates how long the message should be displayed.
 * @param {string} message - The message to display.
 * @param {number} timeout - The timeout in milliseconds.
 */

VG.UI.StatusBar.prototype.message=function( message, timeout )
{
    this.messageLabel.text=message;
    if ( timeout ) this.messageTimeOutTime=Date.now() + timeout;
    else this.messageTimeOutTime=0;
    VG.update();
};

VG.UI.StatusBar.prototype.addWidget=function( widget )
{
    this.layout.addChild( widget );
};

VG.UI.StatusBar.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawStatusBar( this, canvas );

    if ( this.messageTimeOutTime && this.messageTimeOutTime < Date.now() )
        this.messageLabel.text="";

    if ( this.messageLabel.text === "" )
    {
        this.layout.rect.set( this.rect );
        this.layout.layout( canvas );
    } else
    {
        this.messageLayout.rect.set( this.rect );
        this.messageLayout.layout( canvas );
    }
};

// ----------------------------------------------------------------- VG.UI.TabWidget

VG.UI.TabWidgetItem=function( text, object )
{
    this.text=text;
    this.object=object;
    this.rect=VG.Core.Rect();
};

/**
 * Creates a tab widget, the tabs are listed at the top of the widget. Each tab points to a layout or widget which will be displayed if the tab is selected.
 *
 * @param {string} text - The initial text of the tab.
 * @param {object} object - The initial content object for the tab.
 * @property {callback} changed - Callback will be called when the current tab changes, will suppy the content object of the current tab as parameter.
 * @constructor
 */

VG.UI.TabWidget=function( text )
{
    if ( !(this instanceof VG.UI.TabWidget) ) return VG.UI.TabWidget.creator( arguments );
    VG.UI.Widget.call( this );
    this.name="TabWidget";
    this.text=text === undefined ? "" : text;

    this.layout=VG.UI.StackedLayout();
    this.layout.vertical=true;
    this.layout.margin.set( 0, 0, 0, 0 );
    this.layout.spacing=0;
    this.layout.parent=this;

    this.supportsFocus=true;

    this.items=[];

    for( var i=0; i < arguments.length; i+=2 )
        this.addItem( arguments[i], arguments[i+1] );
};

VG.UI.TabWidget.prototype=VG.UI.Widget();

/**
 * Adds a new tab item.
 *
 * @param {string} text - The text of the tab.
 * @param {object} object - The content object for the tab.
 */

VG.UI.TabWidget.prototype.addItem=function( text, object )
{
    let item = new VG.UI.TabWidgetItem( text, object );

    if ( !this.layout.current ) {
        this.layout.current=object;
        this.currentItem = item;
        if ( this.changed ) this.changed( object );
    }

    this.items.push( item );
    this.layout.addChild( object );

    VG.update();
};

/**
 * Adds several new new tab item.
 *
 * @param {string} text - The text of the tab.
 * @param {object} object - The content object for the tab.
 */

VG.UI.TabWidget.prototype.addItems=function()
{
    for( let i=0; i < arguments.length; i+=2 )
        this.addItem( arguments[i], arguments[i+1] );
};

VG.UI.TabWidget.prototype.mouseMove=function( event )
{
    let headerHeight = this.small ? VG.UI.stylePool.current.skin.TabWidgetSmallHeader.Height : VG.UI.stylePool.current.skin.TabWidgetHeader.Height;
    if ( event.pos.y >= this.rect.y && event.pos.y <= this.rect.y + headerHeight )
        VG.update();
};

VG.UI.TabWidget.prototype.mouseDown=function( event )
{
    let headerHeight = this.small ? VG.UI.stylePool.current.skin.TabWidgetSmallHeader.Height : VG.UI.stylePool.current.skin.TabWidgetHeader.Height;
    if ( event.pos.y >= this.rect.y && event.pos.y <= this.rect.y + headerHeight )
    {
        for ( let i=0; i < this.items.length; ++i )
        {
            let item=this.items[i];

            if ( event.pos.x >= item.rect.x && event.pos.x <= item.rect.x + item.rect.width ) {
                this.layout.current=item.object;
                this.currentItem = item;
                if ( this.changed ) this.changed( item.object, i );
            }
        }
    }
};

VG.UI.TabWidget.prototype.mouseUp=function( event )
{
};

VG.UI.TabWidget.prototype.calcSize=function( canvas )
{
    var size=this.layout.calcSize( canvas );
    this.minimumSize.set( this.layout.minimumSize );
    return size;
};

VG.UI.TabWidget.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawTabWidgetHeader( this, canvas );

    this.layout.rect.set( this.contentRect );
    this.layout.layout( canvas );
};

// ----------------------------------------------------------------- VG.UI.SnapperWidgetItem

VG.UI.SnapperWidgetItem=function( text, object, open, enabler, horizontal )
{
    VG.UI.Widget.call( this );

    this.text = text;
    this.object = object;
    this.open = open === undefined ? true : open;
    this.object.visible = this.open;
    this.rect = new VG.Core.Rect();
    this.horizontal = horizontal;

    if ( !horizontal ) {
        this.horizontalExpanding = true;
        this.verticalExpanding = false;

        this.minimumSize.height = VG.UI.stylePool.current.skin.SnapperWidgetItem.Height;
        this.maximumSize.height = VG.UI.stylePool.current.skin.SnapperWidgetItem.Height;
        this.preferredSize.height = VG.UI.stylePool.current.skin.SnapperWidgetItem.Height;
    } else {
        this.horizontalExpanding = false;
        this.verticalExpanding = true;

        this.minimumSize.width = VG.UI.stylePool.current.skin.SnapperWidgetItem.Height;
        this.maximumSize.width = VG.UI.stylePool.current.skin.SnapperWidgetItem.Height;
        this.preferredSize.width = VG.UI.stylePool.current.skin.SnapperWidgetItem.Height;
    }

    if ( enabler ) {
        this.enablerCB = VG.UI.CheckBox();
        this.enablerCB.undoText = enabler.undoText;
        this.enablerCB.bind( enabler.dc, enabler.path );
        this.enablerCB.changed = enabler.changed;

        this.childWidgets = [ this.enablerCB ];
    }
};

VG.UI.SnapperWidgetItem.prototype=VG.UI.Widget();

VG.UI.SnapperWidgetItem.prototype.calcSize=function( canvas )
{
    return this.preferredSize;
};

VG.UI.SnapperWidgetItem.prototype.mouseMove=function( event )
{
};

VG.UI.SnapperWidgetItem.prototype.mouseDown=function( event )
{
    this.open = !this.open;
    this.object.visible = this.open;
    this.mouseIsDown = true;

    VG.update();
};

VG.UI.SnapperWidgetItem.prototype.mouseUp=function( event )
{
    this.mouseIsDown = false;
};

VG.UI.SnapperWidgetItem.prototype.paintWidget=function( canvas )
{
    if ( !this.horizontal ) VG.UI.stylePool.current.drawSnapperWidgetItem( this, canvas );
    else VG.UI.stylePool.current.drawHorizontalSnapperWidgetItem( this, canvas );
};

// ----------------------------------------------------------------- VG.UI.SnapperWidget

VG.UI.SnapperWidget=function( { text, horizontal = false } = {} )
{
    if ( !(this instanceof VG.UI.SnapperWidget) ) return new VG.UI.SnapperWidget( { text, horizontal } );
    VG.UI.Widget.call( this );

    this.name="SnapperWidget";
    this.text=text === undefined ? "" : text;

    this._horizontal = horizontal;

    this.layout=VG.UI.Layout();
    this.layout.vertical = !this._horizontal;
    this.layout.margin.set( 0, 0, 0, 0 );
    this.layout.spacing=0;
    this.layout.parent=this;

    this.supportsFocus=false;

    this.items=[];

    for( var i=1; i < arguments.length; i+=2 )
        this.addItem( arguments[i], arguments[i+1] );
};

VG.UI.SnapperWidget.prototype=VG.UI.Widget();

Object.defineProperty( VG.UI.SnapperWidget.prototype, "disabled", {
    get: function() {
        return this._disabled;
    },
    set: function( value ) {
        this._disabled=value;
        for( var i=0; i < this.layout.children.length; ++i )
        {
            this.layout.children[i].disabled=value;
        }
    }
});

VG.UI.SnapperWidget.prototype.addItem=function( text, object, open, enabler )
{
    let item = new VG.UI.SnapperWidgetItem( text, object, open, enabler, this._horizontal );
    item.widget = this;

    this.items.push( item );
    this.layout.addChild( item );
    this.layout.addChild( object );

    VG.update();
    return item;
};

VG.UI.SnapperWidget.prototype.addItems=function()
{
    for( let i=0; i < arguments.length; i+=2 )
        this.addItem( arguments[i], arguments[i+1] );
};

VG.UI.SnapperWidget.prototype.mouseMove=function( event )
{
};

VG.UI.SnapperWidget.prototype.mouseDown=function( event )
{
};

VG.UI.SnapperWidget.prototype.mouseUp=function( event )
{
};

VG.UI.SnapperWidget.prototype.calcSize=function( canvas )
{
    let size = this.layout.calcSize( canvas );
    this.minimumSize.set( this.layout.minimumSize );
    return size;
};

VG.UI.SnapperWidget.prototype.paintWidget=function( canvas )
{
    this.layout.rect.set( this.rect );
    this.layout.layout( canvas );
};

/**
 * Creates a slider widget.
 *
 * @param {number} min - The initial minimum value of the slider.
 * @param {number} max - The initial maximum value of the slider.
 * @param {number} step - The initial step size of the slider.
 * @param {bool} editable - True if the current value should be editable.
 * @param {number} precision - Indicates how many floating point values should be used for the slider.
 * @property {number} min - The minimum value of the slider.
 * @property {number} max - The maximum value of the slider.
 * @property {number} step - The step size of the slider.
 * @property {number} value - The current value of the slider.
 * @property {callback} changed - Callback will be called when the current value changes, will suppy the current value as parameter.
 * @constructor
 */
/*
VG.UI.Slider=function( min, max, step, editable, precision )
{
    if ( !(this instanceof VG.UI.Slider) ) return new VG.UI.Slider( min, max, step, editable, precision );

    VG.UI.Widget.call( this );
    this.name="Slider";

    this.horizontalExpanding=true;
    this.verticalExpanding=false;

    this.minimumSize.set( 100, 20 );

    this.supportsFocus=true;
    this.min=min;
    this.max=max;
    this.step=step;
    this._value=min;

    this.sliderRect=VG.Core.Rect();
    this.sliderHandleRect=VG.Core.Rect();

    this.checked=false;
    this.dragging=false;

    if ( editable ) {
        this.editable=true;
        this.edit=VG.UI.NumberEdit( min, min, max, precision );
        this.edit.changed=function( value, cont, object, fromModel ) {
            this.value=value;

            if ( this.collection && this.path )
                this.collection.storeDataForPath( { path : this.path, value : this.value, undoText : this.undoText } );

            if ( this.changed )
                this.changed.call( VG.context, this.value, false, this, fromModel );
        }.bind( this );
        this.childWidgets=[ this.edit ];
    }
};

VG.UI.Slider.prototype=VG.UI.Widget();

Object.defineProperty( VG.UI.Slider.prototype, "value", {
    get: function() {
        return this._value;
    },
    set: function( value ) {
        this._value=value;
        if ( this.edit )
            this.edit.value=value;
    }
});

Object.defineProperty( VG.UI.Slider.prototype, "toolTip", {
    get: function() {
        return this._toolTip;
    },
    set: function( value ) {
        this._toolTip=value;
        if ( this.edit )
            this.edit.toolTip=value;
    }
});
*/
/**
 * Binds the widget to the data model. This widget has to be bound to a Number value.
 * @param {VG.Data.Collection} collection - The data collection to link this widget to.
 * @param {string} path - The path inside the data collection to bind this widget to.
 * @tutorial Data Model
 */
/*
VG.UI.Slider.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.UI.Slider.prototype.valueFromModel=function( value )
{
    if ( value === null ) this.value=this.min;
    else this.value=value;

    if ( this.changed )
        this.changed.call( VG.context, value, false, this, true );

    if ( this.edit )
        this.edit.value=value;

    VG.update();
};

VG.UI.Slider.prototype.calcSize=function( canvas )
{
    this.preferredSize.set( 100, canvas.getLineHeight() );
    return this.preferredSize;
};

VG.UI.Slider.prototype.mouseDown=function( event )
{
    if ( !this.rect.contains( event.pos ) ) return;

    if ( this.sliderHandleRect.contains( event.pos ) )
    {
        this.startValue=this.value;
        this.dragging=true;

        VG.context.workspace.mouseTrackerWidget=this;
    } else
    if ( event.pos.x >= this.sliderRect.x && event.pos.x <= (this.sliderRect.x + this.sliderRect.width) )
    {
        this.startValue=this.value;
        var offset=event.pos.x - this.sliderRect.x;
        this.gotoPixelOffset( offset );
        this.dragging=true;
    }

    VG.update();
};

VG.UI.Slider.prototype.mouseMove=function( event )
{
    if ( this.dragging )
    {
        var offset=event.pos.x - this.sliderRect.x;
        this.gotoPixelOffset( offset );
        VG.update();
    }
};

VG.UI.Slider.prototype.gotoPixelOffset=function( offset )
{
    if ( offset < 0 ) offset=0;
    if ( offset >= this.sliderRect.width ) offset=this.sliderRect.width;

    var oldValue=this.value;
    var distance, perPixel;

    if ( !this.halfWidthValue )
    {
        distance=this.max - this.min;
        perPixel=distance / this.sliderRect.width;

        if ( this.step == Math.round( this.step ) )
            this.value=this.min + Math.round( offset * perPixel );
        else
            this.value=this.min + offset * perPixel;
    } else
    {
        if ( offset <= this.sliderRect.width / 2 )
        {
            distance=this.halfWidthValue - this.min;
            perPixel=distance / this.sliderRect.width * 2;

            if ( this.step == Math.round( this.step ) )
                this.value=this.min + Math.round( offset * perPixel );
            else
                this.value=this.min + offset * perPixel;
        } else
        {
            offset-=this.sliderRect.width / 2;
            distance=this.max - this.halfWidthValue;
            perPixel=distance / this.sliderRect.width * 2;

            if ( this.step == Math.round( this.step ) )
                this.value=this.halfWidthValue + Math.round( offset * perPixel );
            else
                this.value=this.halfWidthValue + offset * perPixel;
        }
    }

    if ( oldValue !== this.value ) {
        if ( this.changed )
            this.changed.call( VG.context, this.value, true, this );

        if ( this.edit )
            this.edit.value=this.value;
    }
};

VG.UI.Slider.prototype.mouseUp=function( event )
{
    if ( this.dragging ) {

        if ( this.changed )
            this.changed.call( VG.context, this.value, false, this );

        if ( this.collection && this.path )
            this.collection.storeDataForPath( { path : this.path, value : this.value, undoText : this.undoText } );
    }
    this.dragging=false;
    VG.context.workspace.mouseTrackerWidget=null;
};

VG.UI.Slider.prototype.paintWidget=function( canvas )
{
    this.contentRect.copy( this.rect );

    VG.UI.stylePool.current.drawSlider( this, canvas );
};
*/
/**
 * Creates a slider widget.
 *
 * @param {number} min - The initial minimum value of the slider.
 * @param {number} max - The initial maximum value of the slider.
 * @param {number} step - The initial step size of the slider.
 * @param {bool} editable - True if the current value should be editable.
 * @param {number} precision - Indicates how many floating point values should be used for the slider.
 * @property {number} min - The minimum value of the slider.
 * @property {number} max - The maximum value of the slider.
 * @property {number} step - The step size of the slider.
 * @property {number} value - The current value of the slider.
 * @property {callback} changed - Callback will be called when the current value changes, will suppy the current value as parameter.
 * @constructor
 */

VG.UI.Slider=function( { min=0, max=100, step=1, editable=true, precision=0, noValue, value, halfWidthValue } = {} )
{
    if ( !(this instanceof VG.UI.Slider) ) return new VG.UI.Slider( { min : min, max : max, step : step, editable : editable, precision : precision, noValue : noValue, value : value, halfWidthValue: halfWidthValue } );

    VG.UI.Widget.call( this );
    this.name="Slider";

    this.horizontalExpanding=true;
    this.verticalExpanding=false;

    this.minimumSize.set( 100, 20 );

    this.supportsFocus=true;
    this.min=min;
    this.max=max;
    this.step=step;
    this._value=value !== undefined ? value : min;
    this.noValue=noValue;
    this.halfWidthValue=halfWidthValue;

    this.sliderRect=VG.Core.Rect();
    this.sliderHandleRect=VG.Core.Rect();

    this.checked=false;
    this.dragging=false;

    if ( editable ) {
        this.editable=true;
        this.edit=VG.UI.NumberEdit( min, min, max, precision );
        this.edit.value = this._value;
        this.edit.changed=function( value, cont, object, fromModel ) {
            this.value=value;

            if ( this.collection && this.path )
                this.collection.storeDataForPath( { path : this.path, value : this.value, undoText : this.undoText } );

            if ( this.changed )
                this.changed.call( VG.context, this.value, false, this, fromModel );
        }.bind( this );
        this.childWidgets=[ this.edit ];
    }
};

VG.UI.Slider.prototype=VG.UI.Widget();

Object.defineProperty( VG.UI.Slider.prototype, "value", {
    get: function() {
        return this._value;
    },
    set: function( value ) {
        this._value=value;
        if ( this.edit )
            this.edit.value=value;
    }
});

Object.defineProperty( VG.UI.Slider.prototype, "toolTip", {
    get: function() {
        return this._toolTip;
    },
    set: function( value ) {
        this._toolTip=value;
        if ( this.edit )
            this.edit.toolTip=value;
    }
});

/**
 * Binds the widget to the data model. This widget has to be bound to a Number value.
 * @param {VG.Data.Collection} collection - The data collection to link this widget to.
 * @param {string} path - The path inside the data collection to bind this widget to.
 * @tutorial Data Model
 */

VG.UI.Slider.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.UI.Slider.prototype.valueFromModel=function( value )
{
    if ( value === null ) this.value=this.min;
    else this.value=value;

    if ( this.changed )
        this.changed.call( VG.context, value, false, this, true );

    if ( this.edit )
        this.edit.value=value;

    VG.update();
};

VG.UI.Slider.prototype.calcSize=function( canvas )
{
    this.preferredSize.set( 100, canvas.getLineHeight() );
    return this.preferredSize;
};

VG.UI.Slider.prototype.mouseDown=function( event )
{
    if ( !this.rect.contains( event.pos ) ) return;

    if ( this.sliderHandleRect.contains( event.pos ) )
    {
        this.startValue=this.value;
        this.dragging=true;

        VG.context.workspace.mouseTrackerWidget=this;
    } else
    if ( event.pos.x >= this.sliderRect.x && event.pos.x <= (this.sliderRect.x + this.sliderRect.width) )
    {
        this.startValue=this.value;
        var offset=event.pos.x - this.sliderRect.x;
        this.gotoPixelOffset( offset );
        this.dragging=true;
    }

    VG.update();
};

VG.UI.Slider.prototype.mouseMove=function( event )
{
    if ( this.dragging )
    {
        var offset=event.pos.x - this.sliderRect.x;
        this.gotoPixelOffset( offset );
        VG.update();
    }
};

VG.UI.Slider.prototype.gotoPixelOffset=function( offset )
{
    if ( offset < 0 ) offset=0;
    if ( offset >= this.sliderRect.width ) offset=this.sliderRect.width;

    var oldValue=this.value;
    var distance, perPixel;

    if ( !this.halfWidthValue )
    {
        distance=this.max - this.min;
        perPixel=distance / this.sliderRect.width;

        if ( this.step == Math.round( this.step ) )
            this.value=this.min + Math.round( offset * perPixel );
        else
            this.value=this.min + offset * perPixel;
    } else
    {
        if ( offset <= this.sliderRect.width / 2 )
        {
            distance=this.halfWidthValue - this.min;
            perPixel=distance / this.sliderRect.width * 2;

            if ( this.step == Math.round( this.step ) )
                this.value=this.min + Math.round( offset * perPixel );
            else
                this.value=this.min + offset * perPixel;
        } else
        {
            offset-=this.sliderRect.width / 2;
            distance=this.max - this.halfWidthValue;
            perPixel=distance / this.sliderRect.width * 2;

            if ( this.step == Math.round( this.step ) )
                this.value=this.halfWidthValue + Math.round( offset * perPixel );
            else
                this.value=this.halfWidthValue + offset * perPixel;
        }
    }

    if ( oldValue !== this.value ) {
        if ( this.changed )
            this.changed.call( VG.context, this.value, true, this );

        if ( this.edit )
            this.edit.value=this.value;
    }
};

VG.UI.Slider.prototype.mouseUp=function( event )
{
    if ( this.dragging ) {

        if ( this.changed )
            this.changed.call( VG.context, this.value, false, this );

        if ( this.collection && this.path )
            this.collection.storeDataForPath( { path : this.path, value : this.value, undoText : this.undoText } );
    }
    this.dragging=false;
    VG.context.workspace.mouseTrackerWidget=null;
};

VG.UI.Slider.prototype.paintWidget=function( canvas )
{
    this.contentRect.copy( this.rect );

    VG.UI.stylePool.current.drawRoundSlider( this, canvas );
};

/**
 * Creates a color wheel widget.
 * @param {bool} expanding - True if the wheel should adjust to the size of the widget, false if the default widget size should be fixed (by default 80x80).
 * @property {number} hue - The current hue value.
 * @property {number} saturation - The current saturation value.
 * @property {number} lightness - The current lightness value.
 * @property {VG.Core.Color} color - The current RGB values.
 * @property {callback} changed - The callback will be called with the color object when the color wheel changes.
 * @constructor
 */

VG.UI.ColorWheel=function( expanding )
{
    if ( !(this instanceof VG.UI.ColorWheel) ) return new VG.UI.ColorWheel( expanding );

    VG.UI.Widget.call(this);
    this.name="ColorWheel";
    this.supportsFocus=true;

    this.horizontalExpanding=true;
    this.verticalExpanding=true;

    this._hue=0;
    this._saturation=1.0;
    this._lightness=0.5;

    this.hueDot=new VG.Math.Vector2();

    this._color=VG.Core.Color();

    // --- Triangle Colors
    this.ls1=VG.Core.Color();
    this.ls2=VG.Core.Color();
    this.ls3=VG.Core.Color();

    // --- Triangle Points
    this.ls1Pt=new VG.Math.Vector2();
    this.ls2Pt=new VG.Math.Vector2();
    this.ls3Pt=new VG.Math.Vector2();

    this.toRGBA();

    this.borderColor=VG.Core.Color( 128, 128, 128 );
    this.centerColor=VG.Core.Color( 70, 70, 70 );

    this.hueSize=12;

    if ( !expanding )
    {
        this.setFixedSize( 80, 80 );
        this.hueSize=8;
    }

    this.lastRect=VG.Core.Rect();
};

VG.UI.ColorWheel.prototype=VG.UI.Widget();

Object.defineProperty(VG.UI.ColorWheel.prototype, "hue",
{
    get: function() {
        return this._hue;
    },
    set: function(hue) {

        this._hue = hue;

        this.toRGBA();
    }
});

Object.defineProperty(VG.UI.ColorWheel.prototype, "saturation",
{
    get: function() {
        return this._saturation;
    },
    set: function(sat) {

        this._saturation = VG.Math.clamp(sat, 0.0, 1.0);
        this.toRGBA();
    }
});

Object.defineProperty(VG.UI.ColorWheel.prototype, "lightness",
{
    get: function() {
        return this._ligtness;
    },
    set: function(lit) {

        this._ligtness = VG.Math.clamp(lit, 0.0, 1.0);
        this.toRGBA();
    }
});

Object.defineProperty(VG.UI.ColorWheel.prototype, "color",
{
    get: function() {
        return this._color;
    },
    set: function(color) {
        this._color.copy(color);

        var hsl = this._color.toHSL();

        this.hue = hsl.h * 360;
        this._saturation = hsl.s;
        this._lightness = hsl.l;

        this.toRGBA();
    }
});

VG.UI.ColorWheel.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.UI.ColorWheel.prototype.valueFromModel=function( value )
{
    if ( value === null ) this.color=VG.Core.Color.Black;
    else this.color=VG.Core.Color( value );

    if ( this.changed )
        this.changed.call( VG.context, this._color, false, this, true );

    VG.update();
};

VG.UI.ColorWheel.prototype.toRGBA=function()
{
    var h = this._hue;
    var s = this._saturation;
    var l = this._lightness;

    this._color.setHSL(h, s, l);

    this.ls1.setHSL(h, 0.0, 0.0);
    this.ls2.setHSL(h, 1.0, 0.5);
    this.ls3.setHSL(h, 0.0, 1.0);

    this.dirty=true;
};

VG.UI.ColorWheel.prototype.calcSize=function( canvas )
{
    return this.minimumSize;
};

VG.UI.ColorWheel.prototype.mouseMove=function(event)
{
    if ( this.hueDrag ) {
        this.computeHueFromEvent( event );
        this.toRGBA();

        if ( this.changed )
            this.changed( this._color, true, this );

        VG.update();
    } else
    if ( this.slDrag )
    {
        this.computeSLFromEvent( event );
        this.toRGBA();

        if ( this.changed )
            this.changed( this._color, true, this );

        VG.update();
    }
};

VG.UI.ColorWheel.prototype.mouseUp=function(event)
{
    if ( this.hueDrag || this.slDrag )
    {
        if ( this.collection && this.path )
            VG.context.dc.storeDataForPath( { path : this.path, value : this._color.toHex(), undoText : this.undoText } );

        if ( this.changed )
            this.changed( this._color, false, this );
    }

    VG.context.workspace.mouseTrackerWidget=null;

    this.hueDrag=false;
    this.slDrag=false;
};

VG.UI.ColorWheel.prototype.mouseDown=function(event)
{
    VG.context.workspace.mouseTrackerWidget=this;

    var centerX=this.rect.x + this.rect.width / 2, centerY=this.rect.y + this.rect.height / 2;

    var dCX=centerX - event.pos.x, dCY=centerY - event.pos.y;
    var dToCenter=Math.sqrt( dCX * dCX + dCY * dCY );

    this.hueDrag=false;

    if ( dToCenter >= this.circleSize/2 - this.hueSize )
    {
        this.hueDrag=true;
        this.computeHueFromEvent( event );

        this.toRGBA();

        if ( this.changed )
            this.changed( this._color, true, this );

        VG.update();
    } else
    {
        this.slDrag=true;
        this.computeSLFromEvent( event );

        this.toRGBA();

        if ( this.changed )
            this.changed( this._color, true, this );

        VG.update();
    }
};

VG.UI.ColorWheel.prototype.computeHueFromEvent=function( event )
{
    var localX = event.pos.x - this.rect.x;
    var localY = event.pos.y - this.rect.y;

    //the center
    var center = new VG.Math.Vector2( this.circleSize /2, this.circleSize / 2 );

    //mouse click position
    var mouse = new VG.Math.Vector2( localX, localY );

    var vD = mouse.clone().sub( center );
    vD.normalize();

    vD.mul( this.circleSize / 2 - this.hueSize / 2 );

    var v1 = center.clone().add( vD );

    this._hue = VG.Math.deg( center.angleTo( v1 ) ) + 180;
};

VG.UI.ColorWheel.prototype.computeSLFromEvent=function( event )
{
    function pDistance(x, y, x1, y1, x2, y2)
    {
      var A = x - x1;
      var B = y - y1;
      var C = x2 - x1;
      var D = y2 - y1;

      var dot = A * C + B * D;
      var len_sq = C * C + D * D;
      var param = -1;
      if (len_sq !== 0) //in case of 0 length line
          param = dot / len_sq;

      var xx, yy;

      if (param < 0) {
        xx = x1;
        yy = y1;
      }
      else if (param > 1) {
        xx = x2;
        yy = y2;
      }
      else {
        xx = x1 + param * C;
        yy = y1 + param * D;
      }

      var dx = x - xx;
      var dy = y - yy;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function isLeft( a, b, c) {
        return ((b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x)) > 0;
    }

    var dSL13X=this.ls3Pt.x - this.ls1Pt.x;
    var dSL13Y=this.ls3Pt.y - this.ls1Pt.y;

    var midX=this.ls3Pt.x - dSL13X * 0.5;
    var midY=this.ls3Pt.y - dSL13Y * 0.5;

    var dWidthX=midX - this.ls2Pt.x;
    var dWidthY=midY - this.ls2Pt.y;

    var rectWidth=Math.sqrt( dWidthX * dWidthX + dWidthY * dWidthY );
    var rectHeight=Math.sqrt( dSL13X * dSL13X + dSL13Y * dSL13Y );

    // --- Get Saturation and Lightness

    /**
     * Is p1 on the left side of p2p3?
     * @param p1
     * @param p2
     * @param p3
     * @returns {Number}
     */
    function signOf(p1, p2, p3){
        "use strict";
        return (p2.x-p1.x) * (p3.y-p1.y) - (p2.y-p1.y) * (p3.x-p1.x);
    }

    function limit(v){
        "use strict";
        if(v<0) return 0;
        if(v>1) return 1;
        return v;
    }

    var ev = new VG.Math.Vector2(event.pos.x, event.pos.y);

    var b1 = signOf(ev, this.ls1Pt, this.ls2Pt) >= 0;
    var b2 = signOf(ev, this.ls2Pt, this.ls3Pt) >= 0;
    var b3 = signOf(ev, this.ls3Pt, this.ls1Pt) >= 0;

    var fail = false;
    // in this case coordinate axis is clockwise
    if(b1 && b2 && b3) { // inside triangle
        ev.sub(this.ls1Pt);
    } else if(b2 && b3) {
        let line = this.ls2Pt.clone().sub(this.ls1Pt);
        ev.sub(this.ls1Pt);
        ev.copy(line.mul(limit(line.dot(ev)/(line.length()*line.length()))));
    } else if (b1 && b2){
        let line = this.ls3Pt.clone().sub(this.ls1Pt);
        ev.sub(this.ls1Pt);
        ev.copy(line.mul(limit(line.dot(ev)/(line.length()*line.length()))));
    } else if (b1 && b3){
        var line = this.ls2Pt.clone().sub(this.ls3Pt);
        ev.sub(this.ls3Pt);
        ev.copy(line.mul(limit(line.dot(ev)/(line.length()*line.length()))));
        ev.add(this.ls3Pt).sub(this.ls1Pt);
    } else {
        fail = true;
    }
    if(!fail) {
        // at this point ev is wrt. p1
        var p3 = this.ls3Pt.clone().sub(this.ls1Pt);
        var side = p3.length();
        this._lightness = p3.dot(ev) / (side * side);
        if (this._lightness > 0.01 && this._lightness < 0.99) {
            var up = this.ls3Pt.clone().add(this.ls1Pt).mul(-0.5).add(this.ls2Pt);
            this._saturation = ev.clone().dot(up) / up.length() / up.length() * 0.5 / ((this._lightness < 0.5 ? this._lightness : 1 - this._lightness));
        }
    }

};

VG.UI.ColorWheel.prototype.computeUI=function(canvas)
{
    this.circleSize=Math.min( this.rect.width, this.rect.height );

    // --- Hue Dot

    var vC = new VG.Math.Vector2(this.circleSize / 2, this.circleSize / 2);

    var vD = new VG.Math.Vector2();
    vD.dirFromAngle(VG.Math.rad(this._hue - 180));
    vD.normalize();

    vD.mul( this.circleSize /2 - this.hueSize / 2 );

    this.hueDot.copy( vC );
    this.hueDot.add( vD );

    // --- SL Triangle

    vD = new VG.Math.Vector2();
    vD.dirFromAngle(VG.Math.rad(this._hue - 180));
    vD.normalize();

    vD.mul( this.circleSize /2 - this.hueSize - 2 );

    this.ls2Pt.copy( vC );
    this.ls2Pt.x+=this.rect.x; this.ls2Pt.y+=this.rect.y;
    this.ls2Pt.add(vD);

    //

    vD = new VG.Math.Vector2();
    vD.dirFromAngle(VG.Math.rad(this._hue - 180 + 120));
    vD.normalize();

    vD.mul( this.circleSize /2 - this.hueSize - 2 );

    this.ls1Pt.copy( vC );
    this.ls1Pt.x+=this.rect.x; this.ls1Pt.y+=this.rect.y;
    this.ls1Pt.add(vD);

    //

    vD = new VG.Math.Vector2();
    vD.dirFromAngle(VG.Math.rad(this._hue - 180 - 120));
    vD.normalize();

    vD.mul( this.circleSize /2 - this.hueSize - 2 );

    this.ls3Pt.copy( vC );
    this.ls3Pt.x+=this.rect.x; this.ls3Pt.y+=this.rect.y;
    this.ls3Pt.add(vD);

    // --- SL Dot

    // assume iso-sides triangle, with peak at p2
    // assume we work in coordinate with P1 as origin
    var base = this.ls3Pt.clone().sub(this.ls1Pt).mul(this._lightness);
    var up = this.ls3Pt.clone().add(this.ls1Pt).mul(-0.5).add(this.ls2Pt);
    this.slDot = base.add(
        up.mul(
            (this._lightness < 0.5 ? this._lightness : 1-this._lightness) *2.0*this._saturation )
    ).add(this.ls1Pt);

    // ---

    this.dirty=false;
};

VG.UI.ColorWheel.prototype.paintWidget=function(canvas)
{
    if ( !this.lastRect.equals( this.rect ) ) this.dirty=true;
    if ( this.disabled ) canvas.setAlpha( 0.8 );

    if ( this.dirty )
        this.computeUI();

    var rect=this.contentRect;
    rect.copy( this.rect );

    canvas.draw2DShape( VG.Canvas.Shape2D.CircleHue, rect );
    canvas.draw2DShape( VG.Canvas.Shape2D.CircleOutline, rect, this.borderColor );

    rect.shrink( this.hueSize, this.hueSize, rect );
    canvas.draw2DShapeGL( VG.Canvas.Shape2D.Circle, rect, this.centerColor );

    // --- Hue Dot

    rect.x = this.rect.x + ( this.hueDot.x - this.hueSize/2 );
    rect.y = this.rect.y + ( this.hueDot.y - this.hueSize/2 );

    rect.width = this.hueSize;
    rect.height = this.hueSize;

    canvas.draw2DShapeGL( VG.Canvas.Shape2D.Circle, rect, VG.Core.Color.Black );
    canvas.draw2DShapeGL( VG.Canvas.Shape2D.Circle, rect.shrink(1,1), VG.Core.Color.White );

    // --- SL Triangle

    canvas.addTriangle2D( this.ls1Pt.x, this.ls1Pt.y,
        this.ls2Pt.x, this.ls2Pt.y, this.ls3Pt.x, this.ls3Pt.y, this.ls1, this.ls2, this.ls3 );

    // --- SL Dot

    rect.x=this.slDot.x - 4;
    rect.y=this.slDot.y - 4;

    rect.width = 8;
    rect.height = 8;

    canvas.draw2DShapeGL( VG.Canvas.Shape2D.Circle, rect, VG.Core.Color.White );
    rect.shrink( 1, 1, rect );
    canvas.draw2DShapeGL( VG.Canvas.Shape2D.Circle, rect, VG.Core.Color.Black );

    this.lastRect.copy( this.rect );
    if ( this.disabled ) canvas.setAlpha( 1 );
};

// ----------------------------------------------------------------- VG.UI.ColorEdit

VG.UI.ColorEdit=function( { alpha = false } = {} )
{
    if ( !(this instanceof VG.UI.ColorEdit) ) return new VG.UI.ColorEdit( { alpha }  );

    VG.UI.Widget.call(this);
    this.name="ColorEdit";

    this.supportsFocus=true;
    this._color=VG.Core.Color();

    this.minimumSize.height = 26;
    this.maximumSize.height = 26;
    this.preferredSize.height = 26;

    this.horizontalExpanding=true;
    this.verticalExpanding=false;

    this.colorEdit=VG.UI.TextLineEdit( this.color.toHex() );
    this.colorEdit.maximumSize.width=80;
    this.colorEdit.textChanged=function( value, continous ) {
        this._color.setHex( value );
        this.color=this._color;
        if ( this.changed ) this.changed( this._color, false, this );
    }.bind( this );

    this.colorWheel=VG.UI.ColorWheel();
    this.colorWheel.color=this._color;
    this.colorWheel.changed=function( value, continous ) {
        if ( continous ) return;
        this._color.copy( value );
        // this.color=this._color;
        this.colorEdit.text=this.color.toHex();
        if ( this.changed ) this.changed( this._color, false, this );
    }.bind( this );

    if ( alpha ) {
        this.alphaSlider = new VG.UI.Slider( { min : 0, max : 1, step: 0.01, editable : true, precision: 2 } );
        this.alphaSlider.toolTip="Alpha (transparency) value of the color.";
        this.alphaSlider.text="Alpha";
        this.alphaSlider.changed=function( value, cont ) {
            this._material.a = value;
            this.material.color.a = value;
            this.material=this._material;
            if ( this.changed ) this.changed( this._material, cont, this );
        }.bind( this );
    }

    this.colorLayout = VG.UI.LabelLayout( "Color", this.colorWheel );
    if ( alpha ) this.colorLayout.addChild( this.alphaSlider );

    this.toolSettings = new VG.UI.ToolSettings( VG.UI.Label( { svgName : "icons.svg", svgGroupName : "ToolSettings", color : this._color } ),
        { layout : this.colorLayout, width: 150, height: 110, noHeader: true, text : "Color Settings", autoClose: true } );

    this.layout = new VG.UI.Layout( this.colorEdit, this.toolSettings );
    this.layout.margin.left = 0;

    Object.defineProperty( this.layout, "disabled", {
        get: () => this.parent ? this.parent._disabled : this._disabled
    } );
};

VG.UI.ColorEdit.prototype=VG.UI.Widget();

Object.defineProperty(VG.UI.ColorEdit.prototype, "color",
{
    get: function() {
        return this._color;
    },
    set: function(color) {

        this._color.copy(color);

        this.colorWheel.color=color;
        this.colorEdit.text=this.color.toHex();
    }
});

Object.defineProperty(VG.UI.ColorEdit.prototype, "disabled",
{
    get: function() {
        if ( !this.parent ) return this.colorEdit.disabled;
        else  return this.colorEdit.disabled | this.parent.disabled;
    },
    set: function(disabled) {
        this.colorWheel.disabled=disabled;
        this.colorEdit.disabled=disabled;
    }
});

Object.defineProperty(VG.UI.ColorEdit.prototype, "toolTip",
{
    get: function() {
        return this.colorEdit.toolTip;
    },
    set: function(value) {

        this.colorWheel.toolTip=value;
        this.colorEdit.toolTip=value;
    }
});

VG.UI.ColorEdit.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    this.colorWheel.bind( collection, path );
    this.colorEdit.bind( collection, path );
};

VG.UI.ColorEdit.prototype.paintWidget=function(canvas)
{
    this.layout.rect.copy( this.rect );
    this.layout.layout( canvas );
};

// ----------------------------------------------------------------- VG.UI.MaterialEdit

VG.UI.MaterialEdit=function( { alpha = false } = {} )
{
    if ( !(this instanceof VG.UI.MaterialEdit) ) return new VG.UI.MaterialEdit( { alpha } );

    VG.UI.Widget.call(this);
    this.name="MaterialEdit";

    this.preferredSize.height = 26;
    this.minimumSize.height = 26;
    this.maximumSize.height = 26;
    this.supportsFocus=true;

    this.horizontalExpanding=true;
    this.verticalExpanding=false;

    this._material=VG.Core.Material();

    this.colorWheel=VG.UI.ColorWheel();
    this.colorWheel.color=this._material.color;
    this.colorWheel.changed=function( value, continous ) {
        this._material.copy( value );
        this.material=this._material;
        if ( this.changed ) this.changed( this._material, continous, this );
    }.bind( this );

    this.colorEdit=VG.UI.TextLineEdit( this._material.color.toHex() );
    this.colorEdit.maximumSize.width=80;
    this.colorEdit.textChanged=function( value, continous ) {
        this._material.color.setHex( value );
        this.material=this._material;
        if ( this.changed ) this.changed( this._material, false, this );
    }.bind( this );

    if ( alpha ) {
        this.alphaSlider = new VG.UI.Slider( { min : 0, max : 1, step: 0.01, editable : true, precision: 2 } );
        this.alphaSlider.toolTip="Alpha (transparency) value of the color.";
        this.alphaSlider.text="Alpha";
        this.alphaSlider.changed=function( value, cont ) {
            this._material.a = value;
            this.material.color.a = value;
            this.material=this._material;
            if ( this.changed ) this.changed( this._material, cont, this );
        }.bind( this );
    }

    this.metallicSlider = new VG.UI.Slider( { min : 0, max : 1, step: 0.01, editable : true, precision: 2 } );
    this.metallicSlider.toolTip="Metallic property of the Material.";
    this.metallicSlider.text="Metallic";
    this.metallicSlider.changed=function( value, cont ) {
        this._material.metallic=value;
        if ( this.changed ) this.changed( this._material, cont, this );
    }.bind( this );

    this.smoothnessSlider = new VG.UI.Slider( { min : 0, max : 1, step: 0.01, editable : true, precision: 2 } );
    this.smoothnessSlider.toolTip="Smoothness property of the Material.";
    this.smoothnessSlider.text="Smoothness";
    this.smoothnessSlider.changed=function( value, cont ) {
        this._material.smoothness=value;
        if ( this.changed ) this.changed( this._material, cont, this );
    }.bind( this );

    this.reflectanceSlider = new VG.UI.Slider( { min : 0, max : 1, step: 0.01, editable : true, precision: 2 } );
    this.reflectanceSlider.toolTip="Reflectance property of the Material.";
    this.reflectanceSlider.text="Reflectance";
    this.reflectanceSlider.changed=function( value, cont ) {
        this._material.reflectance=value;
        if ( this.changed ) this.changed( this._material, cont, this );
    }.bind( this );

    this.materialLayout=VG.UI.LabelLayout( "Color", this.colorWheel );
    if ( alpha ) this.materialLayout.addChild( "Alpha", this.alphaSlider );
    this.materialLayout.addDivider();
    this.materialLayout.addChild( "Metallic", this.metallicSlider );
    this.materialLayout.addChild( "Smoothness", this.smoothnessSlider );
    this.materialLayout.addChild( "Reflectance", this.reflectanceSlider );

    this.toolSettings = new VG.UI.ToolSettings( VG.UI.Label( { svgName : "icons.svg", svgGroupName : "ToolSettings", color : this._material.color } ),
        { layout : this.materialLayout, width: 260, height: 224, noHeader: true, text : "Material Settings" } );

    this.layout = new VG.UI.Layout( this.colorEdit, this.toolSettings );
    this.layout.margin.left = 0;
};

VG.UI.MaterialEdit.prototype=VG.UI.Widget();

Object.defineProperty(VG.UI.MaterialEdit.prototype, "material",
{
    get: function() {
        return this._material;
    },
    set: function(material) {

        this._material.copy( material );

        this.metallicSlider.value = material.metallic;
        this.smoothnessSlider.value = material.smoothness;
        this.reflectanceSlider.value = material.reflectance;

        if ( this.alphaSlider ) this.alphaSlider.value = material.color.a;
        this.colorWheel.color = material.color;
        this.colorEdit.text = material.color.toHex();
    }
});

Object.defineProperty(VG.UI.MaterialEdit.prototype, "disabled",
{
    get: function() {
        return this.colorEdit.disabled;
    },
    set: function(disabled) {

        this.colorWheel.disabled=disabled;
        this.colorEdit.disabled=disabled;
    }
});

VG.UI.MaterialEdit.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    this.colorWheel.bind( collection, path );
    this.colorEdit.bind( collection, path );
};

VG.UI.MaterialEdit.prototype.paintWidget=function(canvas)
{
    this.layout.rect.copy( this.rect );
    this.layout.layout( canvas );
};

// ----------------------------------------------------------------- VG.UI.ToolTipWidget

VG.UI.ToolTipWidget=function()
{
    if ( !(this instanceof VG.UI.ToolTipWidget) ) return new VG.UI.ToolTipWidget();

    VG.UI.Widget.call( this );
    this.name="ToolTip";

    this.offset=0;

    this.minimumSize.set( 100, 100 );
    this.supportsFocus=true;

    this.spacing=0;
};

VG.UI.ToolTipWidget.prototype=VG.UI.Widget();

VG.UI.ToolTipWidget.prototype.setToolTip=function( canvas, widget )
{
    this.textLines=[];

    canvas.wordWrap( widget.toolTip, 0, 300, this.textLines );
    this.width=0;
    this.height=0;
    this.title=undefined;

    if ( widget.text && widget.text.length && isNaN( widget.text ) ) {

        this.title=widget.text;

        canvas.pushFont( canvas.style.skin.ToolTip.TitleFont );
        this.height=canvas.getLineHeight() + 10;
        canvas.popFont();
    }

    canvas.pushFont( canvas.style.skin.ToolTip.Font );
    this.height+=canvas.getLineHeight() * this.textLines.length + 2 * canvas.style.skin.ToolTip.BorderSize.height;

    var size=VG.Core.Size();

    for( var i=0; i < this.textLines.length; ++i ) {
        canvas.getTextSize( this.textLines[i], size );
        if ( size.width > this.width ) this.width=size.width;
    }

    this.width+=2 * canvas.style.skin.ToolTip.BorderSize.width + 2;
    canvas.popFont();
};

VG.UI.ToolTipWidget.prototype.paintWidget=function( canvas )
{
    this.rect.width=this.width;
    this.rect.height=this.height;

    if ( !this.rect.width || !this.rect.height ) return;
    this.rect.round();

    let rect = VG.context.workspace.getVisibleScreenRect( this.contentRect );

    if ( this.rect.bottom() > rect.bottom() ) this.rect.y-=this.rect.height;
    if ( this.rect.right() > rect.right() ) this.rect.x-=this.rect.width;

    if ( canvas.twoD ) canvas.clearGLRect( this.rect );

    canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, this.rect, canvas.style.skin.ToolTip.BorderColor );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect.shrink( 1, 1, this.contentRect ), canvas.style.skin.ToolTip.BackColor );

    this.contentRect.shrink( canvas.style.skin.ToolTip.BorderSize.width, canvas.style.skin.ToolTip.BorderSize.height, this.contentRect );

    if ( this.title ) {
        canvas.pushFont( canvas.style.skin.ToolTip.TitleFont );
        canvas.drawTextRect( this.title, this.contentRect, canvas.style.skin.ToolTip.TextColor, 0, 0 );
        this.contentRect.y+=canvas.getLineHeight() + 10;
        canvas.popFont();
    }

    canvas.pushFont( canvas.style.skin.ToolTip.Font );

    for( var i=0; i < this.textLines.length; ++i ) {
        canvas.drawTextRect( this.textLines[i], this.contentRect, canvas.style.skin.ToolTip.TextColor, 0, 0 );
        this.contentRect.y+=canvas.getLineHeight();
    }

    canvas.popFont();
};

// ----------------------------------------------------------------- VG.UI.ChatWidget

VG.UI.ChatWidget=function()
{
    if ( !(this instanceof VG.UI.ChatWidget) ) return new VG.UI.ChatWidget();

    VG.UI.Widget.call( this );

    this.htmlView=VG.UI.HtmlView();
    this.htmlView.readOnly=true;

    this.htmlView.elements.body.margin.left=5;
    this.htmlView.elements.body.margin.top=5;
    this.htmlView.elements.br.lineHeight=0;
    this.htmlView.elements.body.spacing=3;
    this.htmlView.elements.body.font=VG.Font.Font( "Open Sans Semibold", 13 );
    this.htmlView.elements.b.font=VG.Font.Font( "Open Sans Bold", 13 );

    this.htmlView.html="Please Login to use the Community Chat Feature.";

    this.textLineEdit=VG.UI.TextLineEdit();
    this.textLineEdit.disabled=true;

    this.postButton=VG.UI.Button( "Post" );
    this.postButton.disabled=true;
    this.postButton.clicked=function() {
        VG.DB.postAppChatMessage( VG.context.workspace.appId, "<b>" + this.userName + "</b>" + ": " + this.textLineEdit.text );
        this.textLineEdit.text="";
        VG.update();
    }.bind( this );

    this.bottomLayout=VG.UI.Layout( this.textLineEdit, this.postButton );
    this.bottomLayout.margin.set( 0, 1, 0, 0 );

    this.layout=VG.UI.Layout( this.htmlView, this.bottomLayout );
    this.layout.margin.clear();
    this.layout.vertical=true;

    this.requestSendAt=0;
    this.requestSendAtString=(new Date()).toISOString();
    this.messages="";
};

VG.UI.ChatWidget.prototype=VG.UI.Widget();

VG.UI.ChatWidget.prototype.setUserInfo=function( userName, appId )
{
    this.userName=userName;
    this.appId=appId;

    this.textLineEdit.disabled=!appId;
    this.postButton.disabled=!appId;

    if ( appId ) this.htmlView.html=this.messages;
    else this.htmlView.html="Please Login to use the Community Chat Feature.";
};

VG.UI.ChatWidget.prototype.paintWidget=function( canvas )
{
    if ( !this.requestSend && this.appId )
    {
        if ( Date.now() - this.requestSendAt > 3000 )
        {
            this.requestSend=true;
            this.requestSendAt=Date.now();

            VG.DB.getAppChatMessages( this.appId, function( messages ) {
                this.requestSend=false;

                for ( var i=0; i < messages.length; ++i )
                {
                    if ( messages[i].data && messages[i].data.msg ) {
                        var msg=messages[i].data.msg;

                        if ( msg ) {
                            this.messages+=msg + "<br>";
                            this.htmlView.html=this.messages;
                        }
                    }
                }
            }.bind( this ), this.requestSendAtString );

            this.requestSendAtString=(new Date()).toISOString();
        }
    }

    this.layout.rect.copy( this.rect );
    this.layout.layout( canvas );
};

// ----------------------------------------------------------------- VG.UI.AppWidget

VG.UI.AppWidget=function()
{
    if ( !(this instanceof VG.UI.AppWidget) ) return new VG.UI.AppWidget();

    VG.UI.Widget.call( this );

    this.supportsAutoFocus=true;
    this.childWidgets=[];
};

VG.UI.AppWidget.prototype=VG.UI.Widget();

VG.UI.AppWidget.prototype.setAppSource=function( type, content )
{
    //VG.log( type, content );

    var mainContext=VG.context;

    var appContext={ workspace : VG.UI.Workspace() };

    appContext.canvas=appContext.workspace.canvas;
    appContext.imagePool=mainContext.imagePool;
    appContext.svgPool=mainContext.svgPool;
    appContext.workspace.mainRect=VG.Core.Rect( mainContext.workspace.rect );
    appContext.style=VG.UI.stylePool.current;

    VG.context=appContext;

    if ( type === "Function" )
    {
        content( VG.context.workspace );
    } else
    if ( type === "Source" )
    {
        var success=true;
        try {
            eval( content );
        } catch ( e )
        {
            success=false;
        }

        if ( success ) vgMain.call( VG.context, VG.context.workspace );
    } else
    if ( type === "RemoteVIDE" )
    {
        this.loading=true;

        VG.DB.getAppSource( content, function( object ) {

            VG.context=appContext;
            var oldStyle=this.switchStyle( VG.UI.stylePool.styles[0] );

            VG.App=object.source;
            this.processVIDE( null, true );

            VG.context=mainContext;
            this.switchStyle( oldStyle );

            this.loading=false;
        }.bind( this ) );
    } else
    if ( type === "LocalVIDE" )
    {
        this.processVIDE( content );
    }

    VG.context=mainContext;
    this.appContext=appContext;
};

VG.UI.AppWidget.prototype.processVIDE=function( data, dontProcessData )
{
    if ( !dontProcessData ) {
        var appString="VG.App=";
        if ( data.search( appString ) === 0 ) {
            data=appString + data;
        }

        eval( data );
    }

    // --- Add the images of the project to the image pool
    for (var imageName in VG.App.images )  {
        var image=new VG.Core.Image();
        image.name=imageName;

        VG.decompressImageData( VG.App.images[imageName], image );
        VG.context.imagePool.addImage( image );
    }

    // --- Eval the sources of the App stored in the VG.App Namespace
    for (var sourceName in VG.App.sources )  {

        var decodedSource=VG.Utils.decompressFromBase64( VG.App.sources[sourceName] );

        try {
            eval( decodedSource );
        } catch ( e ) {
            success=false;
        }
    }

    // --- Add the SVGs of the project to the pool
    for (var svgName in VG.App.svg )  {
        var decodedSVG=VG.Utils.decompressFromBase64( VG.App.svg[svgName] );

        var svg=VG.Core.SVG( svgName, decodedSVG );
        VG.context.svgPool.addSVG( svg );
    }

    // ---

    var arg=[];
    vgMain.call( VG.context, VG.context.workspace, arg.length, arg );
};

VG.UI.AppWidget.prototype.paintWidget=function( canvas )
{
    if ( !this.appContext ) return;

    this.switchFromMain();

    if ( this.loading )
    {
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, VG.UI.stylePool.current.skin.Widget.BackgroundColor );
        canvas.drawTextRect( "Loading Application from Database...", this.rect, VG.UI.stylePool.current.skin.Widget.TextColor, 1, 1 );
    } else
    {

        VG.context.workspace.mainRect.copy( this.mainContext.workspace.rect );

        VG.context.workspace.rect.copy( this.rect );
        VG.context.workspace.contentRect.copy( this.rect );

        VG.context.workspace.paintWidget();
    }

    this.switchToMain();
};

VG.UI.AppWidget.prototype.mouseMove=function( event )
{
    if ( this.appContext && this.appContext.workspace.rect.contains( event.pos ) ) {
        this.switchFromMain();
        this.appContext.workspace.mouseMove( event.pos.x, event.pos.y );
        this.switchToMain();
    }
};

VG.UI.AppWidget.prototype.mouseDown=function( event )
{
    if ( this.appContext && this.appContext.workspace.rect.contains( event.pos ) ) {
        this.switchFromMain();
        this.appContext.workspace.mouseDown( event.button );
        this.switchToMain();
    }
};

VG.UI.AppWidget.prototype.showContextMenu=function()
{
    if ( this.appContext ) {
        this.switchFromMain();
        this.appContext.workspace.showContextMenu();
        this.switchToMain();
    }
};

VG.UI.AppWidget.prototype.mouseUp=function( event )
{
    if ( this.appContext && this.appContext.workspace.rect.contains( event.pos ) ) {
        this.switchFromMain();
        this.appContext.workspace.mouseUp( event.button );
        this.switchToMain();
    }
};

VG.UI.AppWidget.prototype.mouseDoubleClick=function( event )
{
    if ( this.appContext && this.appContext.workspace.rect.contains( event.pos ) ) {
        this.switchFromMain();
        this.appContext.workspace.mouseDoubleClick( event );
        this.switchToMain();
    }
};

VG.UI.AppWidget.prototype.mouseWheel=function( step )
{
    if ( this.appContext ) {
        this.switchFromMain();
        this.appContext.workspace.mouseWheel( step );
        this.switchToMain();
    }
};

VG.UI.AppWidget.prototype.keyDown=function( keyCode )
{
    if ( this.appContext ) {
        this.switchFromMain();
        this.appContext.workspace.keyDown( keyCode );
        this.switchToMain();
    }
};

VG.UI.AppWidget.prototype.keyUp=function( keyCode )
{
    if ( this.appContext ) {
        this.switchFromMain();
        this.appContext.workspace.keyUp( keyCode );
        this.switchToMain();
    }
};

VG.UI.AppWidget.prototype.textInput=function( text )
{
    if ( this.appContext ) {
        this.switchFromMain();
        this.appContext.workspace.textInput( text );
        this.switchToMain();
    }
};

VG.UI.AppWidget.prototype.switchFromMain=function()
{
    VG.context.workspace.canvas.flush();

    this.mainContext=VG.context;
    VG.context=this.appContext;

    this.switchStyle( VG.UI.stylePool.styles[0] );
};

VG.UI.AppWidget.prototype.switchToMain=function()
{
    VG.context.workspace.canvas.flush();
    VG.context=this.mainContext;

    this.switchStyle( this.appContext.style );
};

VG.UI.AppWidget.prototype.switchStyle=function( style )
{
    var oldStyle=VG.UI.stylePool.current;
    VG.context.workspace.switchToStyle( style );
    return oldStyle;
};

// ----------------------------------------------------------------- VG.UI.AppEditWidget

VG.UI.AppEditWidget=function( code )
{
    if ( !(this instanceof VG.UI.AppEditWidget) ) return new VG.UI.AppEditWidget( code );

    VG.UI.Widget.call( this );

    this.supportsAutoFocus=true;
    this.childWidgets=[];
    this.code=code ? code : "";

    this.codeEdit=VG.UI.CodeEdit( code );
    this.codeEdit.readOnly=false;

    // ---

    this.appWidget=VG.UI.AppWidget();

    this.runButton=VG.UI.Button( "Start" );
    this.runButton.clicked=function()
    {
        if ( !this.running )
        {
            this.appWidget.setAppSource( "Source", this.codeEdit.text );

            this.runButton.text="Stop";
            this.stackedLayout.current=this.appWidget;
            this.running=true;

            this.codeEdit.visible=true;
            this.appWidget.visible=false;
        } else
        {
            this.runButton.text="Start";
            this.stackedLayout.current=this.codeEdit;
            this.running=false;

            this.codeEdit.visible=false;
            this.appWidget.visible=true;
        }
    }.bind( this );

    this.running=false;
    this.runLayout=VG.UI.Layout( this.runButton );
    this.runLayout.margin.clear();
    this.stackedLayout=VG.UI.StackedLayout( this.codeEdit, this.appWidget );
    this.mainLayout=VG.UI.Layout( this.stackedLayout, this.runLayout );
    this.mainLayout.vertical=true;
    this.mainLayout.margin.clear();

    this.codeEdit.visible=true;
    this.appWidget.visible=false;

    this.childWidgets=[ this.codeEdit,  this.appWidget, this.runButton ];
};

VG.UI.AppEditWidget.prototype=VG.UI.Widget();

VG.UI.AppEditWidget.prototype.paintWidget=function( canvas )
{
    this.mainLayout.rect.copy( this.rect );
    this.mainLayout.layout( canvas );
};

// ----------------------------------------------------------------- VG.UI.HistoryWidgetController

VG.UI.HistoryWidgetController=function()
{
    this.name="HistoryWidgetController";

    this.emptyProject={ text : "Last Available State", visible : true };
};

Object.defineProperty( VG.UI.HistoryWidgetController.prototype, "selected",
{
    get: function() {
        return this._visible;
    },
    set: function( visible ) {
    }
});

VG.UI.HistoryWidgetController.prototype=VG.UI.Widget();

VG.UI.HistoryWidgetController.prototype.at=function( index )
{
    //VG.log( "HistoryWidgetController at", index );

    if ( index === 0 ) return this.emptyProject;

    var dc=VG.context.workspace.dataCollectionForUndoRedo;
    var steps=dc.__vgUndo.steps;
    return steps[index-1];
};

VG.UI.HistoryWidgetController.prototype.count=function( index )
{
    //VG.log( "HistoryWidgetController count" );

    var dc=VG.context.workspace.dataCollectionForUndoRedo;

    if ( dc ) {
        var undo=dc.__vgUndo;
        if ( undo ) return undo.steps.length+1;
        else return 0;
    } else return 0;
};

VG.UI.HistoryWidgetController.prototype.isSelected=function( item )
{
    //VG.log( "HistoryWidgetController isSelected", item );

    var dc=VG.context.workspace.dataCollectionForUndoRedo;
    var undo=dc.__vgUndo;

    if ( undo.stepIndex === 0 ) {
        return item === this.emptyProject;
    } else {
        return undo.steps[undo.stepIndex-1] === item;
    }
};

VG.UI.HistoryWidgetController.prototype.setSelected=function( item )
{
    var dc=VG.context.workspace.dataCollectionForUndoRedo;
    var undo=dc.__vgUndo;

    var offset=0, i, diff;

    if ( item !== this.emptyProject ) {
        offset=undo.steps.indexOf( item ) + 1;
    }

    if ( offset > undo.stepIndex )
    {
        diff=offset - undo.stepIndex;
        //VG.log( diff, "forwards" );

        for ( i=0; i < diff; ++i ) {
            undo.redo();
        }
    } else {
        diff=undo.stepIndex - offset;
        //VG.log( diff, "backwards" );

        for ( i=0; i < diff; ++i ) {
            undo.undo();
        }
    }
};

// ----------------------------------------------------------------- VG.UI.HistoryWidget

VG.UI.HistoryWidget=function()
{
    if ( !(this instanceof VG.UI.HistoryWidget) ) return new VG.UI.HistoryWidget();

    VG.UI.Widget.call( this );

    this.listWidget=VG.UI.ListWidget();
    this.listWidget.controller=new VG.UI.HistoryWidgetController();

    this.childWidgets=[ this.listWidget ];
};

VG.UI.HistoryWidget.prototype=VG.UI.Widget();

VG.UI.HistoryWidget.prototype.paintWidget=function( canvas )
{
    canvas.hasBeenResized=true;
    this.listWidget.rect.copy( this.rect );
    this.listWidget.paintWidget( canvas );
    canvas.hasBeenResized=false;
};

// ----------------------------------------------------------------- VG.UI.ButtonGroup

VG.UI.ButtonGroupItem=function( text, icon, statusTip )
{
    this.text=text;
    this.icon=icon;
    this.rect=VG.Core.Rect();
    this.statusTip=statusTip;

    var canvas=VG.context.workspace.canvas;
    canvas.pushFont( VG.UI.stylePool.current.skin.ButtonGroup.Font );
    this.textWidth=canvas.getTextSize( this.text ).width + 8;
    this.textHeight=canvas.getLineHeight();
    canvas.popFont();
};

VG.UI.ButtonGroup=function()
{
    if ( !(this instanceof VG.UI.ButtonGroup) ) return VG.UI.ButtonGroup.creator( arguments );

    VG.UI.Widget.call( this );
    this.name="ButtonGroup";

    this.supportsFocus=true;
    this.items=[];

    for( var i=0; i < arguments.length; i+=3 )
        this.addButton( arguments[i], arguments[i+1], arguments[i+2] );
};

VG.UI.ButtonGroup.prototype=VG.UI.Widget();

VG.UI.ButtonGroup.prototype.addButton=function( text, icon, statusTip )
{
    var button=new VG.UI.ButtonGroupItem( text, icon, statusTip );
    this.items.push( button );

    if ( this.activeButton === undefined ) {
        this.activeButton=button;
        this.index=this.items.indexOf( this.activeButton );

        if ( this.selected )
            this.selected( this.items.indexOf( this.activeButton ) );
    }

    VG.update();
    return button;
};

VG.UI.ButtonGroup.prototype.addSVGButton=function( text, svgName, svgGroupName, statusTip )
{
    var button=new VG.UI.ButtonGroupItem( text, undefined, statusTip );

    button.svgName=svgName;
    button.svgGroupName=svgGroupName;

    this.items.push( button );

    if ( this.activeButton === undefined ) {
        this.activeButton=button;
        this.index=this.items.indexOf( this.activeButton );

        if ( this.selected )
            this.selected( this.items.indexOf( this.activeButton ) );
    }

    VG.update();
    return button;
};

VG.UI.ButtonGroup.prototype.addButtons=function()
{
    for( var i=0; i < arguments.length; i+=3 )
        this.addButton( arguments[i], arguments[i+1], arguments[i+2] );
};

VG.UI.ButtonGroup.prototype.focusIn=function()
{
    for ( var i=0; i < this.items.length; ++i )
    {
        var item=this.items[i];

        if ( item.rect.contains( VG.context.workspace.mousePos ) )
        {
            this.hoverButton=item;
            this.activeButton=this.hoverButton;
            this.index=this.items.indexOf( this.activeButton );

            if ( this.activeButton && this.changed )
                this.changed( this.items.indexOf( this.activeButton ) );

            this.activeButtonNotified = true;

            VG.update();
        }
    }
};

VG.UI.ButtonGroup.prototype.mouseMove=function( event )
{
    this.hoverButton=undefined;

    for ( var i=0; i < this.items.length; ++i )
    {
        var item=this.items[i];

        if ( item.rect.contains( event.pos ) ) {

            this.hoverButton=item;
            break;
        }
    }

    VG.update();
};

VG.UI.ButtonGroup.prototype.mouseDown=function( event )
{
    this.activeButton=this.hoverButton;
    this.index=this.items.indexOf( this.activeButton );

    if ( this.activeButtonNotified ) {
        this.activeButtonNotified = false;
        return;
    }

    if ( this.activeButton && this.changed )
        this.changed( this.items.indexOf( this.activeButton ) );

    VG.update();
};

VG.UI.ButtonGroup.prototype.mouseUp=function( event )
{
    this.activeButtonNotified = false;
};

VG.UI.ButtonGroup.prototype.calcSize=function( canvas )
{
    this.preferredSize.width=0;

    for ( var i=0; i < this.items.length; ++i ) {
        var item=this.items[i];

        this.preferredSize.width+=item.textWidth + 16;
        if ( item.icon ) this.preferredSize.width+=5 + item.icon.width;
        else if ( item.svgName ) this.preferredSize.width+=15;
        this.preferredSize.height=item.textHeight;
    }

    this.preferredSize.width+=(this.items.length-1);

    this.maximumSize.width=this.preferredSize.width;
    this.maximumSize.height=this.preferredSize.height + 4;

    return this.preferredSize;
};

VG.UI.ButtonGroup.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawButtonGroup( this, canvas );
};

// ----------------------------------------------------------------- VG.UI.DropArea

VG.handleImageDropEvent_DropArea=function( event )
{
    event.stopPropagation();
    event.preventDefault();

    var files = event.dataTransfer.files;
    var file = files[0];
    var fileType;

    var match=true;

    if ( match )
    {
        var reader=new FileReader();

        reader.onload = function( e )
        {
            VG.dropArea.fileDropped( file.name, reader.result );
        };

        if ( VG.dropArea.typeName === "Image" || VG.dropArea.typeName === "Binary" )
            reader.readAsDataURL( file );
        else reader.readAsText( file );
    }
};

VG.handleDragOver_DropArea=function( event )
{
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect='copy';
};

/**
 * Creates a drop area, i.e. an area where users can drop files from the Desktop to, like for example an image.
 * @param {string} type - The file type name this drop area should support, like "Image", "Text", or "Binary".
 * @param {callback} paintCallback - The optional paint callback (called with the {@link VG.Canvas|canvas} argument). By default the drop area is drawn with a border and a centered "Drop (Filetype) here" text.
 * @param {callback} droppedCallback - The optional dropped callback when a file was dropped on the area, arguments are the name and data. If the type is an image also an {@link VG.Core.Image|image} object is passed.
 * @property {callback} paintCallback - Same as the paintCallback parameter.
 * @property {callback} droppedCallback - Same as the droppedCallback parameter.
 * @example
 * var imageDropWidget=VG.UI.DropArea( "Image", undefined, function( name, data, image ) {
 *    VG.log( "Image", name, "is", image.width, "pixel wide and", image.height, "pixels high" );
 *    this.image=image;
 * }.bind( this ) );
 * @constructor
 */

VG.UI.DropArea=function( typeName, paintCallback, droppedCallback )
{
    if ( !(this instanceof VG.UI.DropArea) ) return VG.UI.DropArea.creator( arguments );

    VG.UI.Widget.call( this );
    this.name="DropArea";

    this.typeName=typeName;

    this.supportsFocus=true;
    this.platform=VG.context.workspace.platform;
    this.paintCallback=paintCallback;
    this.droppedCallback=droppedCallback;

    this.horizontalExpanding=true;
    this.verticalExpanding=true;

    if ( this.platform === VG.HostProperty.PlatformWeb )
    {
        // --- Web, initialize DnD area

        VG.dropArea=this;
        VG.handleImageDropEvent=VG.handleImageDropEvent_DropArea;
        VG.handleDragOver=VG.handleDragOver_DropArea;

        VG.dropZone.addEventListener('dragover', VG.handleDragOver, false);
        VG.dropZone.addEventListener('drop', VG.handleImageDropEvent, false);

        this.makeVisible=true;

        this.button=VG.UI.Button( "Select " + typeName + " ...");
        this.button.clicked = () => {

            let chooseFile = (name) => {
                let chooser = document.querySelector( name );
                let changeEvent = ( evt ) => {
                    chooser.removeEventListener( "change", changeEvent );

                    let reader = new FileReader();
                    let file = evt.target.files[0];

                    reader.onload = ( e ) => {
                        this.fileDropped( file.name, reader.result );
                    };

                    if ( typeName === "Image" ) reader.readAsDataURL( file );
                    else reader.readAsText( file );

                };
                chooser.addEventListener( "change", changeEvent, false );
                chooser.click();
            };
            chooseFile('#fileDialog');
        };
    } else
    {
        this.button=VG.UI.Button( "Import " + typeName + " ...");
        this.button.clicked=function() {

            if ( typeName === "Image" ) {

                var fileDialog=VG.OpenFileDialog( VG.UI.FileDialog.Image, function( name, image ) {
                    this.image=image;
                    image.name=name;
                    this.droppedCallback( name, image.imageData, image );
                }.bind( this ) );
            }
        }.bind( this );
    }
};

VG.UI.DropArea.prototype=VG.UI.Widget();

VG.UI.DropArea.prototype.fileDropped=function( name, data )
{
    if ( this.typeName !== 'Image' && this.droppedCallback )
        this.droppedCallback( name, data );

    if ( this.typeName === 'Image' && !this.paintCallback )
    {
        if ( !this.image ) this.image=VG.Core.Image();

        this.image.name=name;
        this.image.forcePowerOfTwo=false;

        VG.decompressImageData( data, this.image, function() {
            this.droppedCallback( name, data, this.image );
            VG.update();
        }.bind( this ) );

        if ( this.platform !== VG.HostProperty.PlatformWeb ) {
            this.droppedCallback( name, data, this.image );
            VG.update();
        }
    }
};

VG.UI.DropArea.prototype.disableDropZone=function()
{
    if ( this.platform === VG.HostProperty.PlatformWeb )
    {
        VG.dropZone.style.display="none";
        this.makeVisible=true;
    }
};

VG.UI.DropArea.prototype.paintWidget=function( canvas )
{
    if ( !this.visible ) return;

    this.contentRect.copy( this.rect );

    if ( this.paintCallback )
        this.paintCallback( canvas );
    else
    {

        if ( this.typeName === "Image" && this.image && this.image.isValid() )
        {
            canvas.drawScaledImage( this.contentRect, this.image, this.contentRect );
        } else
        if ( this.platform === VG.HostProperty.PlatformWeb ) {

            var text=this.customText ? this.customText : "Drop " + this.typeName + " Here";

            canvas.drawTextRect( text, this.contentRect, VG.UI.stylePool.current.skin.Widget.TextColor, 1, 1 );
        }


    }

    if ( this.platform === VG.HostProperty.PlatformWeb )
    {
        VG.dropZone.style.left=String( this.contentRect.x ) + "px";
        VG.dropZone.style.top=String( this.contentRect.y ) + "px";
        VG.dropZone.style.width=String( this.contentRect.width ) + "px";
        VG.dropZone.style.height=String( this.contentRect.height ) + "px";

        if ( this.makeVisible ) {
            VG.dropZone.style.display="inline";
            this.makeVisible=false;
        }
    }

    canvas.draw2DShapeGL( VG.Canvas.Shape2D.RectangleOutlineMin1px, this.contentRect, VG.UI.stylePool.current.skin.TextEdit.BorderColor1 );
};