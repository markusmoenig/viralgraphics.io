/*
 * Copyright (c) 2014, 2015 Markus Moenig <markusm@visualgraphics.tv> and Contributors
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

// ----------------------------------------------------------------- VG.UI.Widget

VG.UI.Widget=function()
{
    /**Creates a Widget object.<br>
     * The Widget class is the base class for all user interface elements inside VG.UI.Workspace. Mostly, widgets are part of Layouts, however widgets can also
     * contain other widgets.<br>
     * A widget paints its user interface during paintWidget() according to its rect property which has been set by its parent prior to calling paintWidget().
     * @constructor
     */

    if ( !(this instanceof VG.UI.Widget) ) return new VG.UI.Widget();
    
    this.name="Widget";
    this.rect=VG.Core.Rect();
    this.contentRect=VG.Core.Rect();

    /**The optional layout of the Widget, only used by widgets which contain a complex layout, default is null
     * @member {object} */
    this.layout=0;
    
    /**The visual state of the Widget, set by the Workspace prior to a paintWidget call. Can be one of VG.UI.Widget.VisualState.Normal, VG.UI.Widget.VisualState.Hover,
     * VG.UI.Widget.VisualState.Normal, VG.UI.Widget.VisualState.Clicked or VG.UI.Widget.VisualState.Focus.
     * @member {VG.UI.Widget.VisualState} */    
    this.visualState=VG.UI.Widget.VisualState.Normal;

    this.hasFocusState=false;
    this.hasHoverState=false;
    
    /**The disabled state of the Widget, false by default. This property is set by the developer based on the state of his application.
     * @member {bool} */        
    this._disabled=false;

    /**The visible state of the Widget, true by default. If false, the widget will not be shown inside Layouts. Set by the developer based on the state of his application.
     * @member {bool} */     
    this._visible=true;

    /**If true indicates that the Widgets supports focus, i.e. accepts mouse and keyboard events. Default is false.
     * @member {bool} */       
    this.supportsFocus=false;

    /**If true indicates that the Widgets supports auto focus, i.e. accepts mouse and keyboard events automatically when the mouse is over the widget. Useful for Widgets on 
     * Website and Teblets. Default is false.
     * @member {bool} */        
    this.supportsAutoFocus=false;
    this.noFocusDrawing=false;

    /**If the widget is part of a layout, this property indicates to the Layout that it the Widget supports expanding in the horizontal direction and does not have a fixed width.
     * If not expanding it has a fixed width wich is set to the size calculated by calcSize().
     * This field is set by the widget developer based on the behaviour of the Widget and by application developers to modify the behaviour of existing Widgets. 
     * The default state depends on the Widget implementation.
     * @member {bool} */    
    this._horizontalExpanding=true;

    /**If the widget is part of a layout, this property indicates to the Layout that it the Widget supports expanding in the vertical direction and does not have a fixed height.
     * If not expanding it has a fixed height wich is set to the size calculated by calcSize().
     * This field is set by the widget developer based on the behaviour of the Widget and by application developers to modify the behaviour of existing Widgets. 
     * The default state depends on the Widget implementation.
     * @member {bool} */     
    this._verticalExpanding=true;
    
    this.canvas=0;
    this.parent=0;

    /**The minimumSize of the widget, defaults to 0, 0. Used in layouts to identify the minimum size for the Widget. This size is often set automatically during calcSize() by
    * the Widget itself. Application developer however can also set the size manually to modify the Widget behavior inside Layouts.
    * @member {VG.Core.Size}.*/
    this.minimumSize=VG.Core.Size( 0, 0 );

    /**The maximumSize of the widget, defaults to 32768, 32768. Used in layouts to identify the maximum size for the Widget. This size is often set automatically during calcSize() by
    * the Widget itself. Application developer however can also set the size manually to modify the Widget behavior inside Layouts. Defaults to VG.UI.MaxLayoutSize.
    * @member {VG.Core.Size}.*/    
    this.maximumSize=VG.Core.Size( 32768, 32768 );

    /**The preferredSize of the widget, defaults to 100, 100. Used in layouts to identify the preferred size for the Widget. This size is returned by calcSize().
    * @member {VG.Core.Size}.*/    
    this.preferredSize=VG.Core.Size( 100, 100 );

    /**If the Widget contains other VG.UI.Widget derived Widgets at fixed positions, which also need Keyboard or Mouse Events, the Widget can assign an array to the childWidgets
     * property and can push the Widget references. The Workspace will than take these widget into consideration for all user based events. The Widget has to set the rect and
     * call paintWidget() however itself in its own paintWidget() member. Defaults to null.
     * @member {array}. */
    this.childWidgets=null;

    this.isWidget=true;
    this.isLayout=false;

    this.dragSourceId=undefined;
};

VG.UI.Widget.VisualState={ "Normal" : 0, "Hover" : 1, "Clicked" : 2, "Focus" : 3, "Docs.Enum" : 9000 };

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

VG.UI.Widget.prototype.setFocus=function()
{
    /**Sets keyboard and mouse focus to this Widget.*/  
    VG.context.workspace.setFocus( this );
};

VG.UI.Widget.prototype.keyDown=function( keyCode, keysDown )
{
    /**Key down event, send to the widget when it has focus and the user is pressing a key. It is passed the code of the pressed key together with an array which
     * contains all currently pressed keys (including modifiers).
     * @param {VG.Events.KeyCodes} Keycode of the pressed key
     * @param {array} An array containing a list of all currently pressed keys
     */

    if ( this.supportsFocus && keyCode === VG.Events.KeyCodes.Tab )
        VG.context.workspace.cycleFocus( this );
};

VG.UI.Widget.prototype.keyUp=function( keyCode, keysDown )
{
    /**Key up event, send to the widget when it has focus and the user is releasing a key. It is passed the code of the released key together with an array which
     * contains all currently pressed keys (including modifiers).
     * @param {VG.Events.KeyCodes} Keycode of the released key
     * @param {array} An array containing a list of all currently pressed keys
     */

};

VG.UI.Widget.prototype.mouseMove=function( event )
{
    /**Mouse move event, send to the widget when it has focus and the user is moving the mouse.
     * @param {VG.Events.MouseMoveEvent} Event containing the mouse position
     */    
};

VG.UI.Widget.prototype.mouseDown=function( event )
{
    /**Mouse down event, send to the widget when one of the mouse buttons has been pressed and the widget has focus.
     * @param {VG.Events.MousDownEvent} Event containing information about the mouse state
     */    
};

VG.UI.Widget.prototype.mouseUp=function( event )
{
    /**Mouse up event, send to the widget when one of the mouse buttons has been released and the widget has focus.
     * @param {VG.Events.MouseUpEvent} Event containing information about the mouse state
     */    
};

VG.UI.Widget.prototype.showContextMenu=function( event )
{
    if ( this.contextMenu && this.rect.contains( event.pos ) )
        this.contextMenu.activate( event.pos );
}

VG.UI.Widget.prototype.paintWidget=function( canvas )
{
    /**Paints the widget. Called by the parent when the widget should be painted. The rect member of the widget has been set to the valid
     * dimensions for the Widget. All paint operations should be inside this rectangle.
     * @param {VG.Canvas} canvas - Canvas object providing convenience 2D draw functions
     */  

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, VG.UI.stylePool.current.skin.Widget.BackgroundColor );
    
    if ( this.layout ) this.layout.layout( canvas );
};

VG.UI.Widget.prototype.calcSize=function( canvas )
{
    /**Returns the recommended size for the Widget. Used by Layouts to calculate the Widget dimensions. If the Widget is not expanding
     * vertically or horizontally the Layout will fix the widget to the returned size. If the Widget is expanding, the Layout will consider
     * the returned size relatively to the sizes of the other Widgets in the layout. <br>The minimumSize and maximumSize dimensions can also be set
     * inside calcSize(), these are used to restrict dimensions of expanding widgets.
     * @returns {VG.Core.Size}
     */

     return this.preferredSize;
};

VG.UI.Widget.prototype.setFixedSize=function( width, height )
{
    /**Sets a fixed size for the Widget. Convenience function which adjusts the minimumSize, maximumSize and preferredSize properties as well as setting
     * horizontalExpanding and verticalExpanding to false.
     * @param {number} width - The fixed width
     * @param {number} width - The fixed height
     */

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

// ----------------------------------------------------------------- VG.UI.Widget3D

VG.UI.RenderWidget=function()
{
    /** Creates an RenderWidget to perform arbitrary realtime 2D/3D rendering.
     *  
     *  The method render() is called to perform the rendering and needs to be overriden. The widget receives
     *  calls to render() in 60 fps per second.
     */
    if ( !(this instanceof VG.UI.RenderWidget) ) return new VG.UI.RenderWidget();

    VG.UI.Widget.call( this );
 
    this.supportsFocus=true;
    this.clearColor=false;

    this._timer = new VG.Core.Timer();

    this._mainRT = VG.Renderer().mainRT;

    this.clearBackground=true;
    VG.context.workspace.autoRedrawInterval=0;
};

VG.UI.RenderWidget.prototype=VG.UI.Widget();

VG.UI.RenderWidget.prototype.render=function(delta)
{
    /** Called to perform rendering, must be overrided, otherwise this does nothing 
     *  @param {number} delta - The time passed in seconds from the last call to this method */
}

VG.UI.RenderWidget.prototype.paintWidget=function( canvas )
{
    canvas.pushClipRect( this.rect );

    var clearColor = this.clearColor || canvas.style.skin.Widget.BackgroundColor;

    //fakes a hardware clear by rendering a quad as background
    //if ( this.clearBackground ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, clearColor );
    if ( this.clearBackground ) this._mainRT.clear( clearColor, true );
    canvas.flush();

    this._mainRT.setViewport(this.rect);

    var delta = VG.Math.clamp(this._timer.getDelta(), 0.0001, 0.2);
    this.render(delta);

    if ( VG.context.workspace.mainRect ) this._mainRT.setViewport( VG.context.workspace.mainRect );
    else this._mainRT.setViewport(VG.context.workspace.rect);
    canvas.popClipRect();
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

// ----------------------------------------------------------------- VG.UI.Image

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
        var image=VG.Utils.getImageByName( this.imageName );
        if ( image && !image.locked ) this._image.set( image );

    } else    
    this._image=VG.Core.Image();
};

VG.UI.Image.prototype=VG.UI.Frame();

Object.defineProperty( VG.UI.Image.prototype, "image", {
    get: function() {
        return this._image;
    },
    set: function( image ) {

        this._image.set( image );

        if ( this.collection && this.path )
            this.collection.storeDataForPath( this.path, this._image.imageData );
    }    
});

VG.UI.Image.prototype.calcSize=function()
{
    var size=VG.Core.Size( 0, 0 );

    if ( this._image.isValid() ) {
        size.set( this._image.width, this._image.height );
    }

    this.checkSizeDimensionsMinMax( size );

    this.minimumSize.width=size.width/10;
    this.minimumSize.height=size.height/10;

    return size;
};

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

    if ( !this._image.isValid() )
    {
        // --- Check if this image is based on an imageName and if yes, try to load it
        if ( this.imageName ) {
            var image=VG.Utils.getImageByName( this.imageName );

            if ( image && !image.locked ) this._image.set( image );
            else return;
        } else return;
    }

    if ( !this.rect.width || !this.rect.height ) return;

    var image=this._image;

    if ( this.clickedImage && this.mouseIsDown ) image=this.clickedImage;
    else 
    if ( this.hoverImage && this.visualState === VG.UI.Widget.VisualState.Hover ) image=this.hoverImage;

    // --- Draw It

    if ( this.rect.width >= image.width && this.rect.height >= image.height ) 
    {
        if ( !this.upScaling ) {
            var x=this.contentRect.x + (this.contentRect.width - image.width) / 2;
            var y=this.contentRect.y + (this.contentRect.height - image.height) / 2;
            canvas.drawImage( VG.Core.Point( x, y ), image );
        } else canvas.drawImage( this.contentRect.pos(), image, this.contentRect.size() );
    } else canvas.drawScaledImage( this.contentRect, image );
};

// ----------------------------------------------------------------- VG.UI.Button

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

        size.width+=10;
        size.height+=15;//27;   

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
    if ( this.rect.contains( event.pos) )
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
}

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

    if ( this.direction === VG.UI.ScrollBar.Direction.Vertical )
    {
        var offset=event.pos.y - this.dragOpStartPos.y;

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
        var offset=event.pos.x - this.dragOpStartPos.x;

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

    VG.UI.stylePool.current.drawScrollBar( this, canvas );
};

// ----------------------------------------------------------------- VG.UI.CheckBox

VG.UI.CheckBox=function( checked )
{
    if ( !(this instanceof VG.UI.CheckBox) ) return new VG.UI.CheckBox( checked );

    VG.UI.Widget.call( this );
    this.name="Checkbox";

    this.setFixedSize( 16, 14 ); // 19,19
    this.supportsFocus=true;

    this.checked=checked;
};

VG.UI.CheckBox.prototype=VG.UI.Widget();

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
        this.changed.call( VG.context );   

    VG.update();    
};

VG.UI.CheckBox.prototype.mouseDown=function( event )
{
    if ( !this.rect.contains( event.pos ) ) return;

    if ( this.checked ) this.checked=false;
    else this.checked=true;

    if ( this.collection && this.path )
        this.collection.storeDataForPath( this.path, this.checked );   

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

// ----------------------------------------------------------------- VG.UI.DropDownMenu

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

VG.UI.DropDownMenu.prototype.clear=function( text )
{
    this.items=[];
    this.index=-1;
};

VG.UI.DropDownMenu.prototype.addItem=function( text )
{
    this.items.push( text );
    if ( this.index === -1 ) this.index=0;
};

VG.UI.DropDownMenu.prototype.addItems=function()
{
    for( var i=0; i < arguments.length; ++i )
        this.addItem( arguments[i] );
};

VG.UI.DropDownMenu.prototype.calcSize=function( canvas )
{
    var size=this.preferredSize;
    var minWidth=80;

    VG.context.workspace.canvas.pushFont( VG.UI.stylePool.current.skin.DropDownMenu.Font );

    for( var i=0; i < this.items.length; ++i ) {
        canvas.getTextSize( this.items[i], size );
        if ( size.width > minWidth ) minWidth=size.width;
    }

    size.set( minWidth, VG.context.workspace.canvas.getLineHeight() );

    size.add( 40, 2, size );
    //size.height=VG.UI.stylePool.current.skin.DropDownMenu.Height;
    this.minimumSize.set( size );

    if ( this.parent && size.height > this.parent.rect.height ) size.height=this.parent.rect.height;

    VG.context.workspace.canvas.popFont();

    return size;
};

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
        this.changed( this.index, this.items[this.index], this );
};

VG.UI.DropDownMenu.prototype.applyNewIndex=function( index )
{
    this.index=index;    
    if ( this.collection && this.path )
        this.collection.storeDataForPath( this.path, this.index );

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
    if ( this.rect.contains( event.pos ) ) {

        VG.context.workspace.mouseTrackerWidget=this;

        this.popup=true;
        this.oldIndex=this.index;
    }
};

VG.UI.DropDownMenu.prototype.mouseUp=function( event )
{
    this.popup=false;
    VG.context.workspace.mouseTrackerWidget=null;    

    if ( this.index !== this.oldIndex )
        this.applyNewIndex( this.index );

    VG.update();
};

VG.UI.DropDownMenu.prototype.paintWidget=function( canvas )
{
    this.contentRect.set( this.rect );

    if ( this.popup && canvas.delayedPaintWidgets.indexOf( this ) === -1 ) canvas.delayedPaintWidgets.push( this )
    else VG.UI.stylePool.current.drawDropDownMenu( this, canvas );   
};

// ----------------------------------------------------------------- VG.UI.Statusbar

VG.UI.StatusBar=function()
{
    if ( !(this instanceof VG.UI.StatusBar) ) return new VG.UI.StatusBar();
    
    VG.UI.Widget.call( this );
    this.name="StatusBar";

    // ---
    
    this.layout=VG.UI.Layout();

    this.layout.margin.left=10;
    this.layout.margin.top=10;

    this.label=VG.UI.Label( "" );
    this.label.hAlignment=VG.UI.HAlignment.Left;

    this.layout.addChild( this.label );

    this.spacer=VG.UI.LayoutHSpacer();
    this.layout.addChild( this.spacer );
};

VG.UI.StatusBar.prototype=VG.UI.Widget();

VG.UI.StatusBar.prototype.message=function( message, timeout )
{
    this.label.text=message;
    if ( timeout ) this.messageTimeOutTime=Date.now() + timeout;
    else this.messageTimeOutTime=0;
};

VG.UI.StatusBar.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawStatusBar( this, canvas );

    if ( this.messageTimeOutTime && this.messageTimeOutTime < Date.now() )
        this.label.text="";

    this.layout.rect.set( this.rect );
    this.layout.layout( canvas );
};

// ----------------------------------------------------------------- VG.UI.TabWidget

VG.UI.TabWidgetItem=function( text, object )
{
    this.text=text;
    this.object=object;
    this.rect=VG.Core.Rect();
};

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

VG.UI.TabWidget.prototype.addItem=function( text, object )
{
    if ( !this.layout.current ) {
        this.layout.current=object;
        if ( this.changed ) this.changed( object );
    }

    this.items.push( new VG.UI.TabWidgetItem( text, object ) );
    this.layout.addChild( object );

    VG.update();
};

VG.UI.TabWidget.prototype.addItems=function()
{
    for( var i=0; i < arguments.length; i+=2 )
        this.addItem( arguments[i], arguments[i+1] );    
};

VG.UI.TabWidget.prototype.mouseMove=function( event )
{
    if ( event.pos.y >= this.rect.y && event.pos.y <= this.rect.y + VG.UI.stylePool.current.skin.TabWidgetHeader.Height )
        VG.update();
};

VG.UI.TabWidget.prototype.mouseDown=function( event )
{
    if ( event.pos.y >= this.rect.y && event.pos.y <= this.rect.y + VG.UI.stylePool.current.skin.TabWidgetHeader.Height )
    {
        for ( var i=0; i < this.items.length; ++i )
        {
            var item=this.items[i];    

            if ( event.pos.x >= item.rect.x && event.pos.x <= item.rect.x + item.rect.width ) {
                this.layout.current=item.object;
                if ( this.changed ) this.changed( item.object );
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

VG.UI.SnapperWidgetItem=function( text, object, open )
{
    VG.UI.Widget.call( this );

    this.text=text;
    this.object=object;
    this.open=open === undefined ? true : open;
    this.object.visible=this.open;
    this.rect=VG.Core.Rect();

    this.horizontalExpanding=true;
    this.verticalExpanding=false;

    this.minimumSize.height=VG.UI.stylePool.current.skin.SnapperWidgetItem.Height;
    this.maximumSize.height=VG.UI.stylePool.current.skin.SnapperWidgetItem.Height;
    this.preferredSize.height=VG.UI.stylePool.current.skin.SnapperWidgetItem.Height;    
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
    this.open=!this.open;
    this.object.visible=this.open;
    this.mouseIsDown=true;

    VG.update();    
};

VG.UI.SnapperWidgetItem.prototype.mouseUp=function( event )
{   
    this.mouseIsDown=false;    
};

VG.UI.SnapperWidgetItem.prototype.paintWidget=function( canvas )
{
    VG.UI.stylePool.current.drawSnapperWidgetItem( this, canvas );  
};

// ----------------------------------------------------------------- VG.UI.SnapperWidget

VG.UI.SnapperWidget=function( text )
{
    if ( !(this instanceof VG.UI.SnapperWidget) ) return VG.UI.SnapperWidget.creator( arguments );
    VG.UI.Widget.call( this );

    this.name="SnapperWidget";
    this.text=text === undefined ? "" : text;

    this.layout=VG.UI.Layout();
    this.layout.vertical=true;
    this.layout.margin.set( 0, 0, 0, 0 );
    this.layout.spacing=0;
    this.layout.parent=this;

    this.supportsFocus=false;  

    this.items=[];

    for( var i=0; i < arguments.length; i+=2 )
        this.addItem( arguments[i], arguments[i+1] );      
};

VG.UI.SnapperWidget.prototype=VG.UI.Widget();

VG.UI.SnapperWidget.prototype.addItem=function( text, object, open )
{
    var item=new VG.UI.SnapperWidgetItem( text, object, open );

    this.items.push( item );
    this.layout.addChild( item );
    this.layout.addChild( object );

    VG.update();
};

VG.UI.SnapperWidget.prototype.addItems=function()
{
    for( var i=0; i < arguments.length; i+=2 )
        this.addItem( arguments[i], arguments[i+1] );    
};

VG.UI.SnapperWidget.prototype.mouseMove=function( event )
{
    //if ( event.pos.y >= this.rect.y && event.pos.y <= this.rect.y + VG.UI.stylePool.current.skin.TabWidgetHeader.Height )
    //    VG.update();
};

VG.UI.SnapperWidget.prototype.mouseDown=function( event )
{
    /*
    if ( event.pos.y >= this.rect.y && event.pos.y <= this.rect.y + VG.UI.stylePool.current.skin.TabWidgetHeader.Height )
    {
        for ( var i=0; i < this.items.length; ++i )
        {
            var item=this.items[i];    

            if ( event.pos.x >= item.rect.x && event.pos.x <= item.rect.x + item.rect.width ) {
                this.layout.current=item.object;
                if ( this.changed ) this.changed( item.object );
            }
        }
    }*/
};

VG.UI.SnapperWidget.prototype.mouseUp=function( event )
{   
};

VG.UI.SnapperWidget.prototype.calcSize=function( canvas )
{
    var size=this.layout.calcSize( canvas );
    this.minimumSize.set( this.layout.minimumSize );
    return size;
};

VG.UI.SnapperWidget.prototype.paintWidget=function( canvas )
{
    this.layout.rect.set( this.rect );
    this.layout.layout( canvas );
};

// ----------------------------------------------------------------- VG.UI.Slider

VG.UI.Slider=function( min, max, step )
{
    if ( !(this instanceof VG.UI.Slider) ) return new VG.UI.Slider( min, max, step );

    VG.UI.Widget.call( this );
    this.name="Slider";

    this.horizontalExpanding=true;
    this.verticalExpanding=false;

    this.minimumSize.set( 100, 20 );

    this.supportsFocus=true;
    this.min=min;
    this.max=max;
    this.step=step;
    this.value=min;

    this.sliderRect=VG.Core.Rect();
    this.sliderHandleRect=VG.Core.Rect();

    this.checked=false;
    this.dragging=false;
};

VG.UI.Slider.prototype=VG.UI.Widget();

VG.UI.Slider.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path ); 
};

VG.UI.Slider.prototype.valueFromModel=function( value )
{
    //console.log( "Slider.valueFromModel: " + value );

    if ( value === null ) this.value=this.min;
    else this.value=value;  

    if ( this.changed )
        this.changed.call( VG.context );   

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

    var distance=this.max - this.min;
    var perPixel=distance / this.sliderRect.width;

    if ( this.step == Math.round( this.step ) )
        this.value=this.min + Math.round( offset * perPixel );
    else
        this.value=this.min + offset * perPixel;

    if ( this.changed )
        this.changed.call( VG.context, this.value, true, this );      
};

VG.UI.Slider.prototype.mouseUp=function( event )
{
    if ( this.dragging ) {

        if ( this.collection && this.path )
            this.collection.storeDataForPath( this.path, this.value );   

        if ( this.changed )
            this.changed.call( VG.context, this.value, false, this );  
    }
    this.dragging=false;    
};

VG.UI.Slider.prototype.paintWidget=function( canvas )
{
    this.contentRect.set( this.rect );

    VG.UI.stylePool.current.drawSlider( this, canvas );  
};

// ----------------------------------------------------------------- VG.UI.Slider

VG.UI.ColorWheel=function( big )
{
    if ( !(this instanceof VG.UI.ColorWheel) ) return new VG.UI.ColorWheel( big );

    VG.UI.Widget.call(this);
    this.name="ColorWheel";
    this.supportsFocus=true;

    this.dragging=false;
    this._control=VG.UI.ColorWheel.Control.None;

    this.horizontalExpanding=true;
    this.verticalExpanding=true;

    if ( big )
    {
        this._pickerSize=300;
        this._circleSize=this._pickerSize * 0.9; //80%
    } else 
    {
        this._pickerSize=150;
        this._circleSize=this._pickerSize * 0.8; //80%
    }

    this.minimumSize=VG.Core.Size(this._pickerSize * 1.10, this._pickerSize );
    this.maximumSize=VG.Core.Size( 1000, this._pickerSize);
    
    this._alpha=1.0;
    
    this._lsSelector = VG.Core.Point();



    this._color=VG.Core.Color();

    //utility colors for painting (light sturation)
    this._ls1=VG.Core.Color();
    this._ls2=VG.Core.Color();
    this._ls3=VG.Core.Color();

    this._circleOffset=60.0;
    this._circleTickness=10.0;

    //in local space, sightly smaller than the widget to allow an alpha slider
    var circleXOffset = (this._pickerSize - this._circleSize) / 2;
    this._circleRect = VG.Core.Rect(/*circleXOffset*/0, /*10*/0, this._circleSize, this._circleSize);

    this._hueSelector = VG.Core.Point();

    this._lsRect=VG.Core.Rect();


    //set default values
    this.hue=0;
    this.saturation=1.0;
    this.lightness=0.5;

    this.toRGBA();

    // ---

    this.rEdit=VG.UI.NumberEdit( 0, 0, 255, 0 );
    this.rEdit.font.setSize( 12 );
    this.rEdit.maximumSize.width=40;
    this.rEdit.changed=function( value ) {
        var col=VG.Core.Color( value, this._color.g * 255, this._color.b * 255, this._color.a * 255 );
        //this._color.r=value / 255.0;
        this.color=col;
        //hthis.toRGBA();
        //VG.log( this._color.g );
    }.bind( this );
    var rLabel=VG.UI.Label("R");
    rLabel.font.setSize( 12 );

    this.gEdit=VG.UI.NumberEdit( 0, 0, 255, 0 );
    this.gEdit.font.setSize( 12 );
    this.gEdit.maximumSize.width=40;
    var gLabel=VG.UI.Label("G");
    gLabel.font.setSize( 12 );

    this.bEdit=VG.UI.NumberEdit( 0, 0, 255, 0 );
    this.bEdit.font.setSize( 12 );
    this.bEdit.maximumSize.width=40;
    var bLabel=VG.UI.Label("B");
    bLabel.font.setSize( 12 );

    this.rgbLayout=VG.UI.Layout( VG.UI.LayoutHSpacer(), rLabel, this.rEdit, gLabel, this.gEdit, bLabel, this.bEdit, VG.UI.LayoutHSpacer() );
    this.rgbLayout.spacing=1;
    this.rgbLayout.margin.clear();
    this.layout=this.rgbLayout;
    this.layout.parent=this;

    //this.childWidgets=[ this.rEdit, this.gEdit, this.bEdit ];
};

VG.UI.ColorWheel.Control = { None: 0, Hue: 1, LightSat: 2, Alpha: 3 }; 

VG.UI.ColorWheel.prototype=VG.UI.Widget(); 

Object.defineProperty(VG.UI.ColorWheel.prototype, "hue", 
{
    get: function() {
        return this._hue;
    },
    set: function(hue) {

        this._hue = hue;

        var rect = this.getCircleRect();
        var vC = new VG.Math.Vector2(this._circleSize / 2, this._circleSize / 2);

        var vD = new VG.Math.Vector2();
        vD.dirFromAngle(VG.Math.rad(this._hue - 180));

        vD.mul(this._circleSize * 0.45);

        vD = vC.clone().add(vD);

        this._hueSelector.x = vD.x;
        this._hueSelector.y = vD.y;
        this.toRGBA();
    }    
});

Object.defineProperty(VG.UI.ColorWheel.prototype, "saturation", 
{
    get: function() {
        return this._sat;
    },
    set: function(sat) {

        this._sat = VG.Math.clamp(sat, 0.0, 1.0);
        this._lsSelector.x = this._sat * this._circleSize * 0.5;
        this.toRGBA();
    }    
});

Object.defineProperty(VG.UI.ColorWheel.prototype, "lightness", 
{
    get: function() {
        return this._lit;
    },
    set: function(lit) {

        this._lit = VG.Math.clamp(lit, 0.0, 1.0);
        this._lsSelector.y = this._lit * this._circleSize * 0.5;
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

        this.hue = VG.Math.deg(hsl.h) + 180;
        this.saturation = hsl.s;
        this.lightness = hsl.l;
    }    
});

VG.UI.ColorWheel.prototype.toRGBA=function()
{
    var h = this._hue;
    var s = this._sat;
    var l = this._lit;

    this._color.setHSL(h, s, l);
    this._color.a = this._alpha;

    this._ls1.setHSL(h, 0.0, 0.0);
    this._ls2.setHSL(h, 1.0, 0.5);
    this._ls3.setHSL(h, 0.0, 1.0);

    if ( this.rEdit )
        this.rEdit.value=VG.Math.clamp( Math.round( this._color.r * 255), 0, 255 );
    if ( this.gEdit )
        this.gEdit.value=VG.Math.clamp( Math.round( this._color.g * 255), 0, 255 );
    if ( this.bEdit )
        this.bEdit.value=VG.Math.clamp( Math.round( this._color.b * 255), 0, 255 );
}

VG.UI.ColorWheel.prototype.calcSize=function( canvas )
{
    return this.minimumSize;
};

VG.UI.ColorWheel.prototype.mouseMove=function(event)
{
    var c = this.computeConstants(event);
    this.update(c);
}

VG.UI.ColorWheel.prototype.computeConstants=function(event)
{
    /* Computes mouse related constants needed by the click lookup and update function */


    var rect = this.getCircleRect();

    var cons = {};

    cons.w = rect.width;
    cons.h = rect.width;

    cons.localX = event.pos.x - rect.x;
    cons.localY = event.pos.y - rect.y;

    var inRect = this.getLightSatRect(rect);

    cons.iw = inRect.width;
    cons.ih = inRect.height;

    cons.ilocalX = VG.Math.clamp(event.pos.x - inRect.x, 0, cons.iw);
    cons.ilocalY = VG.Math.clamp(event.pos.y - inRect.y, 0, cons.ih);


    //the center
    cons.vC = new VG.Math.Vector2(cons.w / 2, cons.h / 2);

    //mouse click position
    cons.vM = new VG.Math.Vector2(cons.localX, cons.localY);


    cons.vD = cons.vM.clone().sub(cons.vC);
    cons.vD.normalize();

    cons.vD.mul(this._circleSize * 0.45);

    cons.vDist = cons.vC.dist(cons.vM);

    cons.v1 = cons.vC.clone().add(cons.vD);

    return cons;
}

VG.UI.ColorWheel.prototype.update=function(c)
{
    if (!this.dragging) return;

    switch (this._control)
    {
    case VG.UI.ColorWheel.Control.Hue:

        this._hue = VG.Math.deg(c.vC.angleTo(c.v1)) + 180;
        
        this._hueSelector.x = c.v1.x;
        this._hueSelector.y = c.v1.y;


        break;

    case VG.UI.ColorWheel.Control.LightSat:

        w = c.iw;
        h = c.ih;

        var localX = c.ilocalX;
        var localY = c.ilocalY;


        var hH = h / 2;

        //clamp it into the triangle
        this._sat = localX / w;

        localY = VG.Math.clamp(localY, hH - hH * (1.0 - this._sat), hH + hH * (1.0 - this._sat));

        this._lit = localY / h;

        this._lsSelector.x = localX;
        this._lsSelector.y = localY;
        
        break;

    }

    //TODO check if the color changed, otherwise skip this bit bellow
    this.toRGBA();

    if (this.changed)
        this.changed.call(VG.context, this._color, true, this ); 

    VG.update();
}

VG.UI.ColorWheel.prototype.mouseUp=function(event)
{
    this._control = VG.UI.ColorWheel.Control.None;
    this.dragging=false;

    if (this.changed)
        this.changed.call(VG.context, this._color, false, this );     
};

VG.UI.ColorWheel.prototype.mouseDown=function(event)
{ 
    var c = this.computeConstants(event);
    
    //distance from the circle's center
    if (c.vDist < this._circleSize * 0.30)
    {
        this._control = VG.UI.ColorWheel.Control.LightSat;
        this.dragging = true;
    }
    else
    if (c.vDist < this._circleSize * 0.50)
    { 
        this._control = VG.UI.ColorWheel.Control.Hue;
        this.dragging = true;
    }

    this.update(c);
}

VG.UI.ColorWheel.prototype.getLightSatRect=function(rect)
{
    var inRect = VG.Core.Rect();

    inRect.x = rect.x + ((this._circleSize * 0.5) * 0.5) + this._circleSize * 0.05;
    inRect.y = rect.y + ((this._circleSize * 0.5) * 0.5);
    inRect.width = this._circleSize * 0.5;
    inRect.height = this._circleSize * 0.5;

    return inRect;
}

VG.UI.ColorWheel.prototype.getCircleRect=function()
{
    var rect = VG.Core.Rect(this._circleRect);
    rect.x += this.rect.x;

    if ( this.rect.width > this._circleSize ) rect.x += (this.rect.width - this._circleSize)/2;
    rect.y += this.rect.y;

    return rect;
}

VG.UI.ColorWheel.prototype.paintWidget=function(canvas)
{
    var rect = this.getCircleRect();
    var cSize = rect.width;
    var hcSize = cSize / 2;

    //canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect, VG.UI.stylePool.current.skin.Widget.BackgroundColor);

    var inRect = this.getLightSatRect(rect);

    //circle debug draw
    var cRect = VG.Core.Rect();

    cRect.x = rect.x + (hcSize - cSize * 0.4);
    cRect.y = rect.y + (hcSize - cSize * 0.4);
    cRect.width = cSize * 0.8;
    cRect.height = cSize * 0.8;


    canvas.draw2DShape( VG.Canvas.Shape2D.CircleHue, rect);
    //TODO Hardcoded color, pick a color from the style instead
    canvas.draw2DShape( VG.Canvas.Shape2D.Circle, cRect, VG.Core.Color(70, 70, 70) );

    canvas.draw2DShape( VG.Canvas.Shape2D.ArrowRightGradient, inRect, this._ls1, this._ls2, this._ls3);

    //hue selector dot
    var hueRect = VG.Core.Rect();

    hueRect.x = rect.x + (this._hueSelector.x - 5);
    hueRect.y = rect.y + (this._hueSelector.y - 5);

    hueRect.width = 10;
    hueRect.height = 10;

    canvas.draw2DShape( VG.Canvas.Shape2D.Circle, hueRect, VG.Core.Color(255, 255, 255));


    //light sauration selection dot
    var lsRect = VG.Core.Rect();

    lsRect.x = inRect.x + (this._lsSelector.x - 2.5);
    lsRect.y = inRect.y + (this._lsSelector.y - 2.5);

    lsRect.width = 5;
    lsRect.height = 5;

    canvas.draw2DShape( VG.Canvas.Shape2D.Circle, lsRect, VG.Core.Color(255, 255, 255));


    // ---

    var numberEditSize=this.rEdit.calcSize( canvas );


    this.rgbLayout.rect.x=this.rect.x; this.rgbLayout.rect.y=this.rect.y + this.rect.height - numberEditSize.height;
    this.rgbLayout.rect.width=this.rect.width; this.rgbLayout.rect.height=numberEditSize.height;


    //this.rEdit.rect.x=this.rect.x; this.rEdit.rect.y=this.rect.y + this.rect.height - numberEditSize.height;
    //this.rEdit.rect.width=50; this.rEdit.rect.height=numberEditSize.height;

    this.rgbLayout.layout( canvas );
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

    if ( widget.text && widget.text.length ) {

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

    this.width+=2 * canvas.style.skin.ToolTip.BorderSize.width;
    canvas.popFont();
};

VG.UI.ToolTipWidget.prototype.paintWidget=function( canvas )
{
    this.rect.width=this.width;
    this.rect.height=this.height;

    this.rect.round();
    var rect=VG.context.workspace.getVisibleScreenRect( this.contentRect );

    if ( this.rect.bottom() > rect.bottom() ) this.rect.y-=this.rect.height;
    if ( this.rect.right() > rect.right() ) this.rect.x-=this.rect.width;

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

// ----------------------------------------------------------------- VG.UI.IconStrip

VG.UI.IconStrip=function()
{
    /** IconStrip
    **/
    
    if ( !(this instanceof VG.UI.IconStrip) ) return new VG.UI.IconStrip();
    
    VG.UI.Widget.call( this );
    this.name="IconStrip";

    this.offset=0;

    this.minimumSize.set( 100, 100 );
    this.supportsFocus=true;

    this.vScrollbar=0;
    this.needsVScrollbar=false;
    this.verified=false;

    this.spacing=17;
};

VG.UI.IconStrip.prototype=VG.UI.Widget();

VG.UI.IconStrip.prototype.bind=function( collection, path )
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

VG.UI.IconStrip.prototype.focusIn=function()
{
};

VG.UI.IconStrip.prototype.focusOut=function()
{
};

VG.UI.IconStrip.prototype.keyDown=function( keyCode )
{        
    /*
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
    } */
};

VG.UI.IconStrip.prototype.mouseWheel=function( step )
{/*
    if ( !this.needsVScrollbar ) return;

    if ( step > 0 ) {
        this.offset-=this.itemHeight + this.spacing;
        this.vScrollbar.scrollTo( this.offset );   
    } else
    {
        this.offset+=this.itemHeight + this.spacing;
        this.vScrollbar.scrollTo( this.offset );            
    }*/
};

VG.UI.IconStrip.prototype.mouseMove=function( event )
{
};

VG.UI.IconStrip.prototype.mouseDown=function( event )
{
    /*
    if ( this.needsVScrollbar && this.vScrollbar && this.vScrollbar.rect.contains( event.pos ) ) {
        this.vScrollbar.mouseDown( event );
        return;
    }*/

    if ( !this.rect.contains( event.pos ) ) return;

    var selectedIndex=-1;
    var x=this.contentRect.x - this.offset + 15;
    var item=-1;

    for ( var i=0; i < this.controller.length; ++i ) {
        var item=this.controller.at( i ) ;

        if ( x + this.itemWidth + this.spacing >= event.pos.x && x <= event.pos.x ) {
            selectedIndex=i;
            break;
        } 
        x+=this.itemWidth + this.spacing;
    }

    if ( selectedIndex >=0 && selectedIndex < this.controller.length )
        item=this.controller.at( selectedIndex );

    if ( this.controller.multiSelection ) 
    {
    } else {
        if ( item !== -1 && !this.controller.isSelected( item ) ) {
            this.controller.selected=item;
        }
    }
};

VG.UI.IconStrip.prototype.vHandleMoved=function( offsetInScrollbarSpace )
{
    this.offset=offsetInScrollbarSpace * this.vScrollbar.totalSize / this.vScrollbar.visibleSize;
};

VG.UI.IconStrip.prototype.verifyScrollbar=function( text )
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

VG.UI.IconStrip.prototype.changed=function()
{
    this.verified=false;    
    VG.update();
};

VG.UI.IconStrip.prototype.selectionChanged=function()
{
    VG.update();
};

VG.UI.IconStrip.prototype.paintWidget=function( canvas )
{
    this.iconStripHeight=this.rect.height - 4 - 5 - canvas.style.skin.IconStrip.TextStripHeight;

    this.itemHeight=Math.floor( this.iconStripHeight-2 );
    this.itemWidth=Math.floor( this.itemHeight * ( 114 / 76 ) );

    //VG.log( this.itemHeight, this.itemWidth );

    canvas.style.drawIconStripBackground( canvas, this );

    if ( !this.controller.length ) return;

    canvas.pushClipRect( this.contentRect );

    var paintRect=VG.Core.Rect( this.contentRect );
    paintRect.x+=15; paintRect.y+=1;
    paintRect.width=this.itemWidth;
    paintRect.height=this.itemHeight;

    var textRect=VG.Core.Rect( this.contentRect );
    textRect.x+=10; textRect.y+=this.itemHeight+5;
    textRect.width=this.itemWidth+10;
    textRect.height=18;

    for ( var i=0; i < this.controller.length; ++i ) {
        var item=this.controller.at( i );

        // --- Draw Icon

        if ( item === this.controller.selected )
            canvas.style.drawIconStripSelectedItemBackground( canvas, paintRect.add( -5, -1, 10, 2 ), this );

        var size=this.calculateAspectRatioFit( item.image.width, item.image.height, this.itemWidth, this.itemHeight );
        canvas.drawImage( VG.Core.Point( paintRect.x + (this.itemWidth - size.width)/2, paintRect.y + (this.itemHeight - size.height)/2), item.image, size );


        // --- Draw Text

        canvas.pushFont( canvas.style.skin.IconStrip.Font );

        if ( item === this.controller.selected ) {
            canvas.style.drawIconStripSelectedItemBackground( canvas, textRect, this );
            canvas.drawTextRect( item.text, textRect, canvas.style.skin.IconStrip.SelectedItem.TextColor, 1, 1 );
        } else canvas.drawTextRect( item.text, textRect, canvas.style.skin.IconStrip.Item.TextColor, 1, 1 );

        canvas.popFont();

        // ---

        paintRect.x+=this.itemWidth + this.spacing;
        textRect.x+=this.itemWidth + this.spacing;

        /*
        if ( paintRect.y + this.itemHeight >= this.contentRect.y || paintRect.y < this.contentRect.bottom() ) {
            VG.context.style.drawListWidgetItem( canvas, item, this.controller.isSelected( item ), paintRect, !this.paintItemCallback );

            if ( this.paintItemCallback ) this.paintItemCallback( canvas, item, paintRect, this.controller.isSelected( item ) );

            paintRect.y+=this.itemHeight + this.spacing;
        } */
    }

    canvas.popClipRect();
};

VG.UI.IconStrip.prototype.calculateAspectRatioFit=function(srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return VG.Core.Size( srcWidth*ratio, srcHeight*ratio );
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
    this.htmlView.elements.body.spacing=2;
    this.htmlView.html="Please login to use the Community Chat Feature.";

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
    this.bottomLayout.margin.clear();

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
    else this.htmlView.html="Please login to use the Community Chat Feature.";
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
    };        

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
            
            this.switchStyle( oldStyle );
            VG.context=mainContext;

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
        if ( data.search( appString ) == 0 ) {
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

    var mainContext=VG.context;
    this.switchFromMain();
    var oldStyle=this.switchStyle( VG.UI.stylePool.styles[0] );

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
    this.switchStyle( oldStyle );
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
};

VG.UI.AppWidget.prototype.switchToMain=function()
{
    VG.context.workspace.canvas.flush();    
    VG.context=this.mainContext;
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