/*
 * (C) Copyright 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>, Luis Jimenez <kuko@kvbits.com>.
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
 * Contributors:
 *   - Luis Jimenez implemented the ColorPicker Widget.
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

    /**The maximumSize of the widget, defaults to 0, 0. Used in layouts to identify the maximum size for the Widget. This size is often set automatically during calcSize() by
    * the Widget itself. Application developer however can also set the size manually to modify the Widget behavior inside Layouts. Defaults to VG.UI.MaxLayoutSize.
    * @member {VG.Core.Size}.*/    
    this.maximumSize=VG.Core.Size( 32768, 32768 );

    /**If the Widget contains other VG.UI.Widget derived Widgets at fixed positions, which also need Keyboard or Mouse Events, the Widget can assign an array to the childWidgets
     * property and can push the Widget references. The Workspace will than take these widget into consideration for all user based events. The Widget has to set the rect and
     * call paintWidget() however itself in its own paintWidget() member. Defaults to null.
     * @member {array}. */
    this.childWidgets=null;

    this.isWidget=true;
    this.isLayout=false;
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

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, canvas.style.skin.Widget.BackgroundColor );
    
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

     return VG.Core.Size( 100, 100 );
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

    VG.context.workspace.autoRedrawInterval=0;
};

VG.UI.RenderWidget.prototype=VG.UI.Widget();


VG.UI.RenderWidget.prototype.requestRender=function()
{
    /** Internally calls for a redraw, allowing realtime graphics */
    VG.context.workspace.redrawList.push(new Date());
}

VG.UI.RenderWidget.prototype.render=function(delta)
{
    /** Called to perform rendering, must be overrided, otherwise this does nothing 
     *  @param {number} delta - The time passed in seconds from the last call to this method */
}

VG.UI.RenderWidget.prototype.paintWidget=function( canvas )
{
    var clearColor = this.clearColor || canvas.style.skin.Widget.BackgroundColor;

    //fakes a hardware clear by rendering a quad as background
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, clearColor );
    canvas.flush();

    this._mainRT.setViewport(this.rect);

    var delta = VG.Math.clamp(this._timer.getDelta(), 0.0001, 0.2);
    this.render(delta);

    this._mainRT.setViewport(VG.context.workspace.rect);

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
    VG.context.style.drawFrame( canvas, this );
};

// ----------------------------------------------------------------- VG.UI.Image

VG.UI.Image=function( image )
{
    if ( !(this instanceof VG.UI.Image) ) return new VG.UI.Image( image );

    VG.UI.Frame.call( this );
    
    this.frameType=VG.UI.Frame.Type.None;
    this._verticalExpanding=false;
    this._horizontalExpanding=false;
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
    var size=VG.Core.Size();
    
    if ( this.iconName )
    {
        if ( !this.icon ) this.icon=VG.Utils.getImageByName( this.iconName );
        
        if ( this.icon ) size.set( this.icon.width + 15, this.icon.height + 12 );
        else size.set( 35, 21 );
        return size;
    }

    if ( this.big )
    {
        canvas.pushFont( canvas.style.skin.Button.Font );

        if ( !this.icon ) {
            VG.context.workspace.canvas.getTextSize( this.text, size );

            if ( size.width < 80 )
                size.width=80;  

            if ( size.height < 20 )
                size.height=20;          

            size=size.add( 10, 10 );
            this.minimumSize.set( size );
        } else {
         size.set( 22 + 10, 22 + 10 );
        }
    } else
    {
        canvas.pushFont( canvas.style.skin.Button.SmallFont );

        if ( !this.icon ) {
            VG.context.workspace.canvas.getTextSize( this.text, size );

            if ( size.width < 80 )
                size.width=80;  

            if ( size.height < 17 )
                size.height=17;

            size=size.add( 10, 10 );
            this.minimumSize.set( size );
        } else {
         size.set( 22 + 10, 22 + 10 );
        }        
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
    var size=this.calcSize( canvas );
    this.contentRect.set( this.rect );
    var size=size.add( -10, -10 );
    
    VG.context.style.drawButton( canvas, this );
};

// ----------------------------------------------------------------- VG.UI.Scrollbar

VG.UI.Scrollbar=function()
{
    if ( !(this instanceof VG.UI.Scrollbar) ) return new VG.UI.Scrollbar();
    
    VG.UI.Widget.call( this );  
    this.name="Scrollbar";

    this.direction=VG.UI.Scrollbar.Direction.Vertical;

    this.handleRect=VG.Core.Rect();

    this.dragOpStartPos=VG.Core.Point();
    this.dragHandleOffset=0;
    this.handleOffset=0;

    this.callbackObject=0;
};

VG.UI.Scrollbar.Direction={ "Vertical" : 0, "Horizontal" : 1 };

VG.UI.Scrollbar.prototype=VG.UI.Widget();

VG.UI.Scrollbar.prototype.setScrollbarContentSize=function( totalSize, visibleSize )
{
    this.totalSize=totalSize;
    this.visibleSize=visibleSize;
};

VG.UI.Scrollbar.prototype.scrollTo=function( offset )
{    
    this.calibrateHandleOffset();
    this.handleOffset=offset / this.totalSize * this.visibleSize;
    this.verifyHandleRect();
    
    if ( this.direction === VG.UI.Scrollbar.Direction.Vertical ) this.callbackObject.vHandleMoved( this.handleRect.y - this.rect.y );
    else this.callbackObject.hHandleMoved( this.handleRect.x - this.rect.x );

    VG.update();    
};

VG.UI.Scrollbar.prototype.calibrateHandleOffset=function( offset )
{
    // --- Reset the handle offset to its valid range

    if ( this.handleOffset < 0 ) this.handleOffset=0;

    if ( this.direction === VG.UI.Scrollbar.Direction.Vertical ) {
        if ( this.handleOffset > (this.rect.height - this.handleRect.height) ) this.handleOffset=this.rect.height - this.handleRect.height;            
    } else
    if ( this.direction === VG.UI.Scrollbar.Direction.Horizontal ) {
        if ( this.handleOffset > (this.rect.width - this.handleRect.width) ) this.handleOffset=this.rect.width - this.handleRect.width; 
    }
    this.dragHandleOffset=0;  
}

VG.UI.Scrollbar.prototype.verifyHandleRect=function()
{
    this.handleRect.set( this.rect );    
    if ( this.direction === VG.UI.Scrollbar.Direction.Vertical ) {

        this.handleRect.y+=this.handleOffset + this.dragHandleOffset;
        this.handleRect.height=this.rect.height / this.totalSize * this.visibleSize;

        if ( this.handleRect.y < this.rect.y )
            this.handleRect.y=this.rect.y;

        if ( this.handleRect.bottom() > this.rect.bottom() )
            this.handleRect.y=this.rect.bottom() - this.handleRect.height;
    } else
    if ( this.direction === VG.UI.Scrollbar.Direction.Horizontal ) {

        this.handleRect.x+=this.dragHandleOffset + this.handleOffset;
        this.handleRect.width=this.rect.width / this.totalSize * this.visibleSize;

        if ( this.handleRect.x < this.rect.x )
            this.handleRect.x=this.rect.x;

        if ( this.handleRect.right() > this.rect.right() )
            this.handleRect.x=this.rect.right() - this.handleRect.width;
    }    
};

VG.UI.Scrollbar.prototype.mouseMove=function( event )
{
    if ( VG.context.workspace.mouseTrackerWidget !== this ) 
    { 
        // --- Hover
        if ( this.visualState === VG.UI.Widget.VisualState.Normal )
        {
            this.visualState=VG.UI.Widget.VisualState.Hover;
            VG.update();
        }
        return; 
    }

    if ( this.direction === VG.UI.Scrollbar.Direction.Vertical )
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
    if ( this.direction === VG.UI.Scrollbar.Direction.Horizontal )
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

VG.UI.Scrollbar.prototype.mouseDown=function( event )
{
    this.calibrateHandleOffset();

    if ( this.handleRect.contains( event.pos ) ) {
        VG.context.workspace.mouseTrackerWidget=this;

        this.dragOpStartPos.set( event.pos );     
        this.handleOffset=0;

        if ( this.direction === VG.UI.Scrollbar.Direction.Vertical ) {
            this.dragHandleOffset=this.handleRect.y - this.rect.y;
        } else
        if ( this.direction === VG.UI.Scrollbar.Direction.Horizontal ) {
            this.dragHandleOffset=this.handleRect.x - this.rect.x;
        }        
    } else
    if ( this.direction === VG.UI.Scrollbar.Direction.Vertical )
    {
        this.dragHandleOffset=0;

        if ( event.pos.y < this.handleRect.y ) {
            // --- User clicks above the scrollbar

            this.handleOffset-=this.handleRect.height;
        }  else        
        if ( event.pos.y > this.handleRect.bottom() ) {
            // --- User clicks below the scrollbar

            this.handleOffset+=this.handleRect.height;
        }        

        if ( this.callbackObject && this.callbackObject.vHandleMoved ) {
            this.verifyHandleRect();                
            this.callbackObject.vHandleMoved( this.handleRect.y - this.rect.y );
        }
        VG.update();        
    }
};    

VG.UI.Scrollbar.prototype.mouseUp=function( event )
{
    if ( VG.context.workspace.mouseTrackerWidget === this ) 
        VG.context.workspace.mouseTrackerWidget=0;  

    VG.update();    
};  

VG.UI.Scrollbar.prototype.paintWidget=function( canvas, adjustAlpha )
{
    this.contentRect.set( this.rect );

    //if ( this.handleRect.width <= 0 || this.handleRect.height <= 0 ) return;

    this.verifyHandleRect( this.handleOffset );
    VG.context.style.drawScrollbar( canvas, this, adjustAlpha );
};

// ----------------------------------------------------------------- VG.UI.Checkbox

VG.UI.Checkbox=function()
{
    if ( !(this instanceof VG.UI.Checkbox) ) return new VG.UI.Checkbox();

    VG.UI.Widget.call( this );
    this.name="Checkbox";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;

    this.minimumSize.set( 19, 19 );
    this.maximumSize.set( 19, 19 );

    this.supportsFocus=true;

    this.checked=false;
};

VG.UI.Checkbox.prototype=VG.UI.Widget();

VG.UI.Checkbox.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path ); 
};

VG.UI.Checkbox.prototype.valueFromModel=function( value )
{
    //console.log( "TextEdit.valueFromModel: " + value );

    if ( value === null ) this.checked=false;
    else this.checked=value;  

    if ( this.changed )
        this.changed.call( VG.context );   

    VG.update();    
};

VG.UI.Checkbox.prototype.calcSize=function()
{
    var size=VG.Core.Size( 19, 19 );
    return size;
};

VG.UI.Checkbox.prototype.mouseDown=function( event )
{
    if ( !this.rect.contains( event.pos ) ) return;

    if ( this.checked ) this.checked=false;
    else this.checked=true;

    if ( this.collection && this.path )
        this.collection.storeDataForPath( this.path, this.checked );   

    if ( this.changed )
        this.changed.call( VG.context );  

    VG.update();
};

VG.UI.Checkbox.prototype.mouseUp=function( event )
{
};

VG.UI.Checkbox.prototype.paintWidget=function( canvas )
{
    this.contentRect.set( this.rect );

    VG.context.style.drawCheckbox( canvas, this );    
};

// ----------------------------------------------------------------- VG.UI.PopupButton

VG.UI.PopupButton=function()
{
    if ( !(this instanceof VG.UI.PopupButton) ) return VG.UI.PopupButton.creator( arguments );

    VG.UI.Widget.call( this );
    this.name="PopupButton";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;

    this.minimumSize.set( 60, 20 );
    this.maximumSize.set( 32768, 40 );

    this.supportsFocus=true;

    this.items=[];
    this.index=-1;
    this.popup=false;

    for( var i=0; i < arguments.length; ++i )
        if ( String( arguments[i] ).length ) this.addItem( arguments[i] );
};

VG.UI.PopupButton.prototype=VG.UI.Widget();

VG.UI.PopupButton.prototype.clear=function( text )
{
    this.items=[];
    this.index=-1;
};

VG.UI.PopupButton.prototype.addItem=function( text )
{
    this.items.push( text );
    if ( this.index === -1 ) this.index=0;
};

VG.UI.PopupButton.prototype.addItems=function()
{
    for( var i=0; i < arguments.length; ++i )
        this.addItem( arguments[i] );
};

VG.UI.PopupButton.prototype.calcSize=function( canvas )
{
    var size=VG.Core.Size();
    var minWidth=80;

    VG.context.workspace.canvas.pushFont( canvas.style.skin.PopupButton.Font );

    for( var i=0; i < this.items.length; ++i ) {
        VG.context.workspace.canvas.getTextSize( this.items[i], size );
        if ( size.width > minWidth ) minWidth=size.width;
    }

    size.set( minWidth, VG.context.workspace.canvas.getLineHeight() );

    size=size.add( 40, 4 );
    this.minimumSize.set( size );

    VG.context.workspace.canvas.popFont();

    return size;
};

VG.UI.PopupButton.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.UI.PopupButton.prototype.valueFromModel=function( value )
{
    //console.log( "TextEdit.valueFromModel: " + value );

    if ( value === null ) this.index=0;
    else this.index=value;

    //if ( this.textChanged )
    //    this.textChanged.call( VG.context );    
};

VG.UI.PopupButton.prototype.applyNewIndex=function( index )
{
    this.index=index;    
    if ( this.collection && this.path )
        this.collection.storeDataForPath( this.path, this.index );

    if ( this.changed )
        this.changed( index, this.items[index] );
};

VG.UI.PopupButton.prototype.focusIn=function()
{
    if ( this.focusInCallback )
        this.focusInCallback( this );
};

VG.UI.PopupButton.prototype.keyDown=function( keyCode )
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

VG.UI.PopupButton.prototype.mouseMove=function( event )
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

VG.UI.PopupButton.prototype.mouseDown=function( event )
{
    if ( this.rect.contains( event.pos ) ) {

        VG.context.workspace.mouseTrackerWidget=this;

        this.popup=true;
        this.oldIndex=this.index;
    }
};

VG.UI.PopupButton.prototype.mouseUp=function( event )
{
    this.popup=false;
    VG.context.workspace.mouseTrackerWidget=null;    

    if ( this.index !== this.oldIndex )
        this.applyNewIndex( this.index );

    VG.update();
};

VG.UI.PopupButton.prototype.paintWidget=function( canvas )
{
    this.contentRect.set( this.rect );

    if ( this.popup && canvas.delayedPaintWidgets.indexOf( this ) === -1 ) canvas.delayedPaintWidgets.push( this )
    else VG.context.style.drawPopupButton( canvas, this );    
};

// ----------------------------------------------------------------- VG.UI.Statusbar

VG.UI.Statusbar=function()
{
    if ( !(this instanceof VG.UI.Statusbar) ) return new VG.UI.Statusbar();
    
    VG.UI.Widget.call( this );
    this.name="Statusbar";

    // ---
    
    this.layout=VG.UI.Layout();

    this.layout.margin.left=10;
    this.layout.margin.top=10;

    this.label=VG.UI.Label( "" );
    this.label.hAlignment=VG.UI.HAlignment.Left;

    this.layout.addChild( this.label );
};

VG.UI.Statusbar.prototype=VG.UI.Widget();

VG.UI.Statusbar.prototype.message=function( message, timeout )
{
    this.label.text=message;
    if ( timeout ) this.messageTimeOutTime=Date.now() + timeout;
    else this.messageTimeOutTime=0;
}

VG.UI.Statusbar.prototype.paintWidget=function( canvas )
{
    VG.context.style.drawStatusbar( canvas, this );

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
    this.supportsFocus=true;  

    this.items=[];

    for( var i=0; i < arguments.length; i+=2 )
        this.addItem( arguments[i], arguments[i+1] );      
};

VG.UI.TabWidget.prototype=VG.UI.Widget();

VG.UI.TabWidget.prototype.addItem=function( text, object )
{
    this.items.push( new VG.UI.TabWidgetItem( text, object ) );
    this.layout.addChild( object );

    if ( !this.layout.current )
        this.layout.current=object;

    VG.update();
};

VG.UI.TabWidget.prototype.addItems=function()
{
    for( var i=0; i < arguments.length; i+=2 )
        this.addItem( arguments[i], arguments[i+1] );    
};

VG.UI.TabWidget.prototype.mouseMove=function( event )
{
};

VG.UI.TabWidget.prototype.mouseDown=function( event )
{
    if ( event.pos.y >= this.rect.y && event.pos.y <= this.rect.y + VG.context.style.skin.TabWidget.HeaderHeight )
    {
        for ( var i=0; i < this.items.length; ++i )
        {
            var item=this.items[i];    

            if ( event.pos.x >= item.x && event.pos.x <= item.x + item.width ) {
                this.layout.current=item.object;
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
    canvas.style.drawTabWidgetHeader( canvas, this );

    this.layout.rect.set( this.contentRect );
    this.layout.layout( canvas );

    /*
    VG.context.style.drawDockWidget( canvas, this );

    this.layout.rect.set( this.contentRect );
    this.layout.layout( canvas );

    this.minimumSize.set( this.layout.minimumSize );*/
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
    var size=VG.Core.Size(100, canvas.getLineHeight() );

    //size.height=canvas.getLineHeight;

    return size;
};

VG.UI.Slider.prototype.mouseDown=function( event )
{
    if ( !this.rect.contains( event.pos ) ) return;

    if ( this.sliderHandleRect.contains( event.pos ) )
    {
        this.dragging=true;
    } else
    if ( event.pos.x >= this.sliderRect.x && event.pos.x <= (this.sliderRect.x + this.sliderRect.width) )
    {
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
        this.changed.call( VG.context );      
};

VG.UI.Slider.prototype.mouseUp=function( event )
{
    if ( this.dragging ) {

        if ( this.collection && this.path )
            this.collection.storeDataForPath( this.path, this.value );   

        if ( this.changed )
            this.changed.call( VG.context );  
    }
    this.dragging=false;    
};

VG.UI.Slider.prototype.paintWidget=function( canvas )
{
    this.contentRect.set( this.rect );

    VG.context.style.drawSlider( canvas, this );    
};



// ----------------------------------------------------------------- VG.UI.Slider

VG.UI.ColorPicker=function()
{
    if ( !(this instanceof VG.UI.ColorPicker) ) return new VG.UI.ColorPicker();

    VG.UI.Widget.call(this);
    this.name="ColorPicker";
    this.supportsFocus=true;

    this.dragging=false;
    this._control=VG.UI.ColorPicker.Control.None;

    this.horizontalExpanding=true;
    this.verticalExpanding=true;

    this._pickerSize=300;
    this._circleSize=this._pickerSize * 0.7; //80%

    this.minimumSize=VG.Core.Size(this._pickerSize, this._pickerSize);
    this.maximumSize=VG.Core.Size(this._pickerSize, this._pickerSize);
    
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
    this._circleRect = VG.Core.Rect(circleXOffset, 10, this._circleSize, this._circleSize);

    this._hueSelector = VG.Core.Point();

    this._lsRect=VG.Core.Rect();


    //set default values
    this.hue=0;
    this.saturation=1.0;
    this.lightness=0.5;

    this.toRGBA();
};

VG.UI.ColorPicker.Control = { None: 0, Hue: 1, LightSat: 2, Alpha: 3 }; 

VG.UI.ColorPicker.prototype=VG.UI.Widget(); 

Object.defineProperty(VG.UI.ColorPicker.prototype, "hue", 
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

Object.defineProperty(VG.UI.ColorPicker.prototype, "saturation", 
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

Object.defineProperty(VG.UI.ColorPicker.prototype, "lightness", 
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

Object.defineProperty(VG.UI.ColorPicker.prototype, "color", 
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

VG.UI.ColorPicker.prototype.toRGBA=function()
{
    var h = this._hue;
    var s = this._sat;
    var l = this._lit;

    this._color.setHSL(h, s, l);
    this._color.a = this._alpha;

    this._ls1.setHSL(h, 0.0, 0.0);
    this._ls2.setHSL(h, 1.0, 0.5);
    this._ls3.setHSL(h, 0.0, 1.0);
}

VG.UI.ColorPicker.prototype.mouseMove=function(event)
{
    var c = this.computeConstants(event);
    this.update(c);
}

VG.UI.ColorPicker.prototype.computeConstants=function(event)
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

VG.UI.ColorPicker.prototype.update=function(c)
{
    if (!this.dragging) return;

    switch (this._control)
    {
    case VG.UI.ColorPicker.Control.Hue:

        this._hue = VG.Math.deg(c.vC.angleTo(c.v1)) + 180;
        
        this._hueSelector.x = c.v1.x;
        this._hueSelector.y = c.v1.y;


        break;

    case VG.UI.ColorPicker.Control.LightSat:

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
        this.changed.call(VG.context, this._color, this ); 

    VG.update();
}

VG.UI.ColorPicker.prototype.mouseUp=function(event)
{
    this._control = VG.UI.ColorPicker.Control.None;
    this.dragging=false;
}

VG.UI.ColorPicker.prototype.mouseDown=function(event)
{ 
    var c = this.computeConstants(event);
    
    //distance from the circle's center
    if (c.vDist < this._circleSize * 0.30)
    {
        this._control = VG.UI.ColorPicker.Control.LightSat;
        this.dragging = true;
    }
    else
    if (c.vDist < this._circleSize * 0.50)
    { 
        this._control = VG.UI.ColorPicker.Control.Hue;
        this.dragging = true;
    }

    this.update(c);
}

VG.UI.ColorPicker.prototype.getLightSatRect=function(rect)
{
    var inRect = VG.Core.Rect();

    inRect.x = rect.x + ((this._circleSize * 0.5) * 0.5) + this._circleSize * 0.05;
    inRect.y = rect.y + ((this._circleSize * 0.5) * 0.5);
    inRect.width = this._circleSize * 0.5;
    inRect.height = this._circleSize * 0.5;

    return inRect;
}

VG.UI.ColorPicker.prototype.getCircleRect=function()
{
    var rect = VG.Core.Rect(this._circleRect);
    rect.x += this.rect.x;
    rect.y += this.rect.y;

    return rect;
}

VG.UI.ColorPicker.prototype.paintWidget=function(canvas)
{

    var rect = this.getCircleRect();
    var cSize = rect.width;
    var hcSize = cSize / 2;

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect, canvas.style.skin.Widget.BackgroundColor);

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
};


