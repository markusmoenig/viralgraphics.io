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

// ----------------------------------------------------------------- VG.UI.LayoutHSeparator

VG.UI.LayoutHSeparator=function()
{
    if ( !(this instanceof VG.UI.LayoutHSeparator )) return new VG.UI.LayoutHSeparator();

    VG.UI.Widget.call( this );
    this.name="ToolSeparator";

    this.horizontalExpanding=false;
    this.verticalExpanding=true;

    this.preferredSize.set( 1, 1 );
};

VG.UI.LayoutHSeparator.prototype=VG.UI.Widget();

VG.UI.LayoutHSeparator.prototype.calcSize=function()
{
    return this.preferredSize;
};

VG.UI.LayoutHSeparator.prototype.paintWidget=function( canvas )
{
    this.contentRect.set( this.rect );

    //VG.context.style.drawToolSeparator( canvas, this );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, VG.Core.Color("#BBC0C7") );
};

// ----------------------------------------------------------------- VG.UI.LayoutVSeparator

VG.UI.LayoutVSeparator=function()
{
    if ( !(this instanceof VG.UI.LayoutVSeparator )) return new VG.UI.LayoutVSeparator();

    VG.UI.Widget.call( this );
    this.name="ToolSeparator";

    this.horizontalExpanding=true;
    this.verticalExpanding=false;

    this.preferredSize.set( 2, 2 );

    this.color1 = VG.Core.Color("#525252");
    this.color2 = VG.Core.Color("#7e7e7e");
};

VG.UI.LayoutVSeparator.prototype=VG.UI.Widget();

VG.UI.LayoutVSeparator.prototype.calcSize=function()
{
    return this.preferredSize;
};

VG.UI.LayoutVSeparator.prototype.paintWidget=function( canvas )
{
    this.contentRect.copy( this.rect );

    this.contentRect.y += Math.floor( (this.rect.height - 2 ) / 2 );
    this.contentRect.height = 1;

    //VG.context.style.drawToolSeparator( canvas, this );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.contentRect, this.color1 );
    this.contentRect.y += 1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.contentRect, this.color2 );
};

// ----------------------------------------------------------------- VG.UI.LayoutHSpacer

VG.UI.LayoutHSpacer=function()
{
    if ( !(this instanceof VG.UI.LayoutHSpacer )) return new VG.UI.LayoutHSpacer();

    VG.UI.Widget.call( this );
    this.name="LayoutHSpacer";

    this.horizontalExpanding=true;
    this.verticalExpanding=false;

    this.preferredSize.set( 1,1 );
};

VG.UI.LayoutHSpacer.prototype=VG.UI.Widget();

VG.UI.LayoutHSpacer.prototype.calcSize=function()
{
    return this.preferredSize;
};

VG.UI.LayoutHSpacer.prototype.paintWidget=function( canvas )
{
    this.contentRect.set( this.rect );
};

// ----------------------------------------------------------------- VG.UI.LayoutVSpacer

VG.UI.LayoutVSpacer=function( maxSize )
{
    if ( !(this instanceof VG.UI.LayoutVSpacer )) return new VG.UI.LayoutVSpacer( maxSize );

    VG.UI.Widget.call( this );
    this.name="LayoutVSpacer";

    this.horizontalExpanding=false;
    this.verticalExpanding=true;

    if ( maxSize !== undefined )
        this.maximumSize.height=maxSize;
};

VG.UI.LayoutVSpacer.prototype=VG.UI.Widget();

VG.UI.LayoutVSpacer.prototype.calcSize=function()
{
    var size=VG.Core.Size( 1,1 );
    return size;
};

VG.UI.LayoutVSpacer.prototype.paintWidget=function( canvas )
{
    this.contentRect.set( this.rect );
};

/**
 * The base clase and most simple layout class. It arranges child objects either horizontally or vertically. Layouts can contain {@link VG.UI.Widget} based classes or other layouts.
 * @borrows VG.UI.Widget.disabled as VG.UI.Layout.disabled
 * @borrows VG.UI.Widget.visible as VG.UI.Layout.visible
 * @property {number} length - The number of child objects in this layout (read-only).
 * @property {bool} horizontal - If true, child objects are arranged horizontally (the default).
 * @property {bool} vertical - If true, child objects are arranged vertically.
 * @constructor
 * @tutorial Layouts
 * @param {object} object - The  objects to add to the layout.
 */

VG.UI.Layout=function()
{
    if ( this instanceof VG.UI.Layout ) {
        this.name="Layout";
        this.children=[];
        this.spacing=4;

        this.rect=VG.Core.Rect();
        this.workRect=VG.Core.Rect();
        this.contentRect=VG.Core.Rect();
        this.margin=VG.Core.Margin( 8, 8, 8, 8 );
        this.minimumSize=VG.Core.Size( 100, 100 );
        this.maximumSize=VG.Core.Size( VG.UI.MaxLayoutSize, VG.UI.MaxLayoutSize );

        this.isWidget=false;
        this.isLayout=true;

        this._disabled=false;
        this._visible=true;

        this._horizontal=true;
        this._vertical=false;
        this.initLayoutAccessors();

        this.hOffset=0; this.vOffset=0;

        for( var i=0; i < arguments.length; ++i )
            this.addChild( arguments[i] );

    } else return VG.UI.Layout.creator( arguments );
};

Object.defineProperty( VG.UI.Layout.prototype, "length",
{
    get: function() {
        return this.children.length;
    }
});

Object.defineProperty( VG.UI.Layout.prototype, "disabled",
{
    get: function() {
        return this._disabled;
    },
    set: function( disabled ) {
        this._disabled=disabled;
        this.makeAllChildsLooseFocus( this );
        VG.context.workspace.canvas.update();
    }
});

Object.defineProperty( VG.UI.Layout.prototype, "visible",
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

Object.defineProperty( VG.UI.Layout.prototype, "horizontal",
{
    get: function() {
        return this._horizontal;
    },
    set: function( horizontal  ) {
        this._vertical=!horizontal;
        this._horizontal=horizontal;

        this.initLayoutAccessors();
        VG.update();
    }
});

Object.defineProperty( VG.UI.Layout.prototype, "vertical",
{
    get: function() {
        return this._vertical;
    },
    set: function( vertical  ) {
        this._vertical=vertical;
        this._horizontal=!vertical;

        this.initLayoutAccessors();
        VG.update();
    }
});

VG.UI.Layout.prototype.makeAllChildsLooseFocus=function( layout )
{
    for( var i=0; i < layout.children.length; ++i )
    {
        var child=this.children[i];

        if ( child.isWidget ) {
            if ( child.visualState === VG.UI.Widget.VisualState.Focus )
                VG.context.workspace.widgetLostFocus( child );
        } else
        if ( child.isLayout ) {
            this.makeAllChildsLooseFocus( child );
        }
    }
};

VG.UI.Layout.prototype.initLayoutAccessors=function()
{
    if ( this._horizontal ) {
        this.primaryCoord="x";
        this.secondaryCoord="y";

        this.primarySize="width";
        this.secondarySize="height";

        this.primaryLayoutExpanding="horizontalExpanding";
        this.secondaryLayoutExpanding="verticalExpanding";

        this.primaryLesserMargin="left";
        this.secondaryLesserMargin="top";

        this.primaryGreaterMargin="right";
        this.secondaryGreaterMargin="bottom";
    } else
    if ( this._vertical ) {
        this.primaryCoord="y";
        this.secondaryCoord="x";

        this.primarySize="height";
        this.secondarySize="width";

        this.primaryLayoutExpanding="verticalExpanding";
        this.secondaryLayoutExpanding="horizontalExpanding";

        this.primaryLesserMargin="top";
        this.secondaryLesserMargin="left";

        this.primaryGreaterMargin="bottom";
        this.secondaryGreaterMargin="right";
    }
};

/**
 * Adds a small title to the top of the layout.
 * @param {string} title - The title text to show.
 */

VG.UI.Layout.prototype.addTitle=function( title )
{
    this.title=title;
};

VG.UI.Layout.prototype.clear=function()
{
    this.children = [];
};

/**
 * Inserts a child object at a specific index to this layout.
 * @param {number} index - The index position to insert the child at.
 * @param {object} child - The child oject to add.
 */

VG.UI.Layout.prototype.insertChildAt=function( index, child )
{
    this.children.splice( index, 0, child );
    child.parent=this;
};

// Legacy
VG.UI.Layout.prototype.insertAt=function( index, child )
{
    this.insertChildAt( index, child );
};

/**
 * Adds a child object to the end of this layout.
 * @param {object} child - The child object to add to this layout.
 */

VG.UI.Layout.prototype.addChild=function( child )
{
    this.children.push( child );
    child.parent=this;
};

/**
 * Adds child objects to the end of this layout.
 * @param {object} childs - The child objects to add to this layout.
 */

VG.UI.Layout.prototype.addChilds=function()
{
    for( var i=0; i < arguments.length; ++i )
        this.addChild( arguments[i] );
};

/**
 * Returns the child object at the given index.
 * @param {number} index - The index position to of the object to return.
 * @returns {object} The object at the given index.
 */

VG.UI.Layout.prototype.childAt=function( index )
{
    return this.children[index];
};

/**
 * Removes the given child object from the layout.
 * @param {object} child - The child object to remove.
 */

VG.UI.Layout.prototype.removeChild=function( child )
{
    var index=this.children.indexOf( child );
    if ( index >= 0 ) {
        this.children.splice( index, 1 );
    }
};

/**
 * Returns true of the layout contains the given child object.
 * @param {object} child - The child object.
 * @returns {bool} True if the layout contains the child object, false otherwise.
 */

VG.UI.Layout.prototype.contains=function( child )
{
    if ( this.children.indexOf( child ) === -1 ) return false;
    else return;
};

VG.UI.Layout.prototype.hHandleMoved=function( offsetInScrollbarSpace, customLine )
{
    this.hOffset=offsetInScrollbarSpace * this.hScrollbar.totalSize / this.hScrollbar.visibleSize;
};

VG.UI.Layout.prototype.vHandleMoved=function( offsetInScrollbarSpace, customLine )
{
    this.vOffset=offsetInScrollbarSpace * this.vScrollbar.totalSize / this.vScrollbar.visibleSize;
};

VG.UI.Layout.prototype.specialLayoutHitTest=function( pt )
{
    if ( !this.hScrollbar && !this.vScrollbar ) return false;

    if ( this.needsHScrollbar && this.hScrollbar.rect.contains( pt ) )
        return true;
    else
    if ( this.needsVScrollbar && this.vScrollbar.rect.contains( pt ) )
        return true;
    else
    {
        if ( ( this.hScrollbar && this.hScrollbar.visualState === VG.UI.Widget.VisualState.Hover ) || ( this.vScrollbar && this.vScrollbar.visualState === VG.UI.Widget.VisualState.Hover ) )
            return true;
    }
    return false;
};

VG.UI.Layout.prototype.mouseMove=function( event )
{
    if ( this.needsHScrollbar && this.hScrollbar )
    {
        if ( this.hScrollbar.rect.contains( event.pos ) ) {
            this.hScrollbar.mouseMove( event );
            return;
        } else
        {
            if ( this.hScrollbar.visualState === VG.UI.Widget.VisualState.Hover ) {
                this.hScrollbar.visualState=VG.UI.Widget.VisualState.Normal;
                VG.update();
            }
        }
    }

    if ( this.needsVScrollbar && this.vScrollbar )
    {
        if ( this.vScrollbar.rect.contains( event.pos ) ) {
            this.vScrollbar.mouseMove( event );
            return;
        } else
        {
            if ( this.vScrollbar.visualState === VG.UI.Widget.VisualState.Hover ) {
                this.vScrollbar.visualState=VG.UI.Widget.VisualState.Normal;
                VG.update();
            }
        }
    }
};

VG.UI.Layout.prototype.mouseWheel=function( step )
{
    if ( !this.needsVScrollbar ) return false;

    if ( step > 0 ) {
        this.vOffset-=1 + this.spacing;
        this.vScrollbar.scrollTo( this.vOffset );
        return true;
    } else
    {
        this.vOffset+=1 + this.spacing;
        this.vScrollbar.scrollTo( this.vOffset );
        return true;
    }
};

VG.UI.Layout.prototype.mouseDown=function( event )
{
    if ( this.needsHScrollbar && this.hScrollbar.rect.contains( event.pos ) ) {
        this.hScrollbar.mouseDown( event );
    } else
    if ( this.needsVScrollbar && this.vScrollbar.rect.contains( event.pos ) ) {
        this.vScrollbar.mouseDown( event );
    }
};

VG.UI.Layout.prototype.autoScrollStart=function( event )
{
    if ( this.needsVScrollbar )
        this.vScrollbar.autoScrollStart( event );
};

VG.UI.Layout.prototype.calcSize=function( canvas )
{
    var size=VG.Core.Size();
    var visibleChildren=0;

    for( var i=0; i < this.children.length; ++i )
    {
        var child=this.children[i];
        var childSize=child.calcSize( canvas );

        if ( child.visible ) ++visibleChildren;

        if ( child.isWidget && child.visible )
        {
            if ( child[this.primaryLayoutExpanding] )
                size[this.primarySize]=VG.UI.MaxLayoutSize;
            else {
                if ( size[this.primarySize] < VG.UI.MaxLayoutSize )
                    size[this.primarySize]+=childSize[this.primarySize];
            }

            if ( child[this.secondaryLayoutExpanding] === false )
            {
                if ( childSize[this.secondarySize] > size[this.secondarySize] )
                    size[this.secondarySize]=childSize[this.secondarySize];
            } else
            if ( child[this.secondaryLayoutExpanding] )
            {
                if ( child.maximumSize[this.secondarySize] === VG.UI.MaxLayoutSize )
                    size[this.secondarySize]=VG.UI.MaxLayoutSize;
                else size[this.secondarySize]=child.maximumSize[this.secondarySize];
            }
        }
    }

    if ( size[this.primarySize] < VG.UI.MaxLayoutSize )
    {
        size[this.primarySize]+=(visibleChildren-1) * this.spacing;

        size[this.primarySize]+=this.margin[this.primaryLesserMargin] + this.margin[this.primaryGreaterMargin];
    }

    if ( size[this.secondarySize] < VG.UI.MaxLayoutSize )
    {
        size[this.secondarySize]+=this.margin[this.secondaryLesserMargin] + this.margin[this.secondaryGreaterMargin];
    }

    if ( size[this.primarySize] > this.maximumSize[this.primarySize] ) size[this.primarySize]=this.maximumSize[this.primarySize];
    if ( size[this.secondarySize] > this.maximumSize[this.secondarySize] ) size[this.secondarySize]=this.maximumSize[this.secondarySize];

    this.layout( canvas, true );

    return size;
};

VG.UI.Layout.prototype.layout=function( canvas, dontDraw )
{
    if ( !this.visible ) return;

    if ( !dontDraw && this.title ) {
        this.contentRect.copy( this.rect ); this.contentRect.height=VG.UI.stylePool.current.skin.TitleBar.Height;
        VG.UI.stylePool.current.drawTitleBar( canvas, this.contentRect, this.title );
    }

    if ( !this.children.length ) return;

    if ( this.animationIsRunning === true ) {
        this.animate( canvas );
        return;
    }

    this.contentRect.copy( this.rect );
    if ( this.title ) {
        this.contentRect.y+=VG.UI.stylePool.current.skin.TitleBar.Height;
        this.contentRect.height-=VG.UI.stylePool.current.skin.TitleBar.Height;
    }

    if ( !this.noClipping )
        canvas.pushClipRect( this.contentRect );
/*
    if ( this.children.length === 1 && this.children[0].isLayout )
    {
        var child=this.children[0];

        child.rect.set( this.rect );
        child.rect.x+=this.margin.left; child.rect.width-=this.margin.left + this.margin.right;
        child.rect.y+=this.margin.top; child.rect.height-=this.margin.top + this.margin.bottom;
        child.layout( canvas );

        canvas.popClipRect();

        return;
    }*/

    var primaryOffset=0, secondaryOffset=0;

    // --- Check for H Scrollbar
    if ( this.allowScrollbars && this.contentRect.width < this.minimumSize.width ) {
        this.needsHScrollbar=true;
        //VG.log( "VG.UI.Layout needs HScrollbar", this.rect.width, this.size.width );
        this.contentRect.height-=/*this.rect.height - */VG.UI.stylePool.current.skin.ScrollBar.Size;

        if ( !this.hScrollbar ) {
            this.hScrollbar=VG.UI.ScrollBar( "Horizontal LabelLayout" );
            this.hScrollbar.direction=VG.UI.ScrollBar.Direction.Horizontal;
            this.hScrollbar.callbackObject=this;
        }
        if ( this.primaryCoord === "x" ) primaryOffset=this.hOffset;
        else secondaryOffset=this.hOffset;
    } else this.needsHScrollbar=false;

    // --- Check for V Scrollbar
    if ( this.allowScrollbars && this.contentRect.height< this.minimumSize.height ) {
        this.needsVScrollbar=true;
        //VG.log( "VG.UI.Layout needs VScrollbar", this.rect.height, this.minimumSize.height );
        this.contentRect.width-=/*this.rect.width -*/ VG.UI.stylePool.current.skin.ScrollBar.Size;

        if ( !this.vScrollbar ) {
            this.vScrollbar=VG.UI.ScrollBar( "Vertical LabelLayout" );
            this.vScrollbar.direction=VG.UI.ScrollBar.Direction.Vertical;
            this.vScrollbar.callbackObject=this;
        }
        if ( this.primaryCoord === "y" ) primaryOffset=this.vOffset;
        else secondaryOffset=this.vOffset;
    } else this.needsVScrollbar=false;

    // --- Visible Children

    var visibleChildren=0, i, child;

    for( i=0; i < this.children.length; ++i )
    {
        child=this.children[i];
        if ( child.visible ) ++visibleChildren;

        if ( this.font ) child.font=this.font;
    }

    // ---

    var rect=this.contentRect;
    var totalSpacing=(visibleChildren-1) * this.spacing;

    var availableSpace=rect[this.primarySize] - totalSpacing - this.margin[this.primaryLesserMargin] - this.margin[this.primaryGreaterMargin];
    var expandingChilds=0, childLayoutSize;

    for( i=0; i < this.children.length; ++i ) {
        child=this.children[i];

        if ( !child.visible ) continue;

        if ( child.isWidget ) {
            if ( child[this.primaryLayoutExpanding] === false ) {
                availableSpace-=child.calcSize( canvas )[this.primarySize];
            } else {
                if ( child.maximumSize[this.primarySize] === VG.UI.MaxLayoutSize )
                    ++expandingChilds;
                else availableSpace-=child.maximumSize[this.primarySize];
            }
        } else
        if ( child.isLayout ) {
            childLayoutSize=child.calcSize( canvas );

            if ( childLayoutSize[this.primarySize] < VG.UI.MaxLayoutSize ) {
                availableSpace-=childLayoutSize[this.primarySize];
            } else ++expandingChilds;
        }
    }

    var expandingChildSpace=availableSpace;
    if ( expandingChilds ) expandingChildSpace/=expandingChilds;

    this.minimumSize[this.primarySize]=this.margin[this.primaryLesserMargin] + totalSpacing + this.margin[this.primaryGreaterMargin];
    this.minimumSize[this.secondarySize]=0;

    var pos=rect[this.primaryCoord] + this.margin[this.primaryLesserMargin];
    var secondaryCoord;

    for( i=0; i < this.children.length; ++i )
    {
        child=this.children[i];

        if ( !child.visible ) continue;

        if ( child.isWidget )
        {
            // --- Child is a Widget

            var size=child.calcSize( canvas );

            // --- Add Child Minimum Size

            this.minimumSize[this.primarySize]+=child.minimumSize[this.primarySize];
            if ( child.minimumSize[this.secondarySize] > this.minimumSize[this.secondarySize] ) this.minimumSize[this.secondarySize]=child.minimumSize[this.secondarySize];

            // ---

            if ( child[this.primaryLayoutExpanding] === false )
            {
                secondaryCoord=rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin] + ( rect[this.secondarySize] -
                    this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin] - size[this.secondarySize] ) / 2;

                child.rect[this.primaryCoord]=pos - primaryOffset;
                child.rect[this.secondaryCoord]=secondaryCoord - secondaryOffset;

                if ( child[this.secondaryLayoutExpanding] === false ) {
                    child.rect.setSize( size.width, size.height );
                } else
                if ( child[this.secondaryLayoutExpanding] ) {
                    child.rect[this.secondaryCoord]=rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin];
                    child.rect[this.secondarySize]=rect[this.secondarySize] - this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin];
                    child.rect[this.primarySize]=size[this.primarySize];
                }
            } else
            if ( child[this.primaryLayoutExpanding] )
            {
                var secondarySize;

                if ( child[this.secondaryLayoutExpanding] === false ) {
                    secondaryCoord=rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin] +  (rect[this.secondarySize] -
                        this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin] - size[this.secondarySize])/2;
                    secondarySize=size[this.secondarySize];

                } else
                if ( child[this.secondaryLayoutExpanding] ) {
                    secondaryCoord=rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin];
                    secondarySize=rect[this.secondarySize] - this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin];
                }

                child.rect[this.primaryCoord]=pos - primaryOffset;
                child.rect[this.secondaryCoord]=secondaryCoord - secondaryOffset;

                if ( child.maximumSize[this.primarySize] === VG.UI.MaxLayoutSize )
                    child.rect[this.primarySize]=expandingChildSpace;
                else child.rect[this.primarySize]=child.maximumSize[this.primarySize];

                child.rect[this.secondarySize]=secondarySize;
            }

            child.rect.round();
            if ( !dontDraw ) child.paintWidget( canvas );
            pos+=child.rect[this.primarySize] + this.spacing;
        } else
        {
            // --- Child is a Layout

            var childRect=VG.Core.Rect();
            childLayoutSize=child.calcSize( canvas );

            // --- Add Child Minimum Size

            this.minimumSize[this.primarySize]+=child.minimumSize[this.primarySize];
            if ( child.minimumSize[this.secondarySize] > this.minimumSize[this.secondarySize] ) this.minimumSize[this.secondarySize]=child.minimumSize[this.secondarySize];

            // ---

            childRect[this.primaryCoord]=pos;
            childRect[this.secondaryCoord]=rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin];
            childRect[this.secondarySize]=rect[this.secondarySize] - this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin];

            if ( childLayoutSize[this.primarySize] < VG.UI.MaxLayoutSize ) {
                childRect[this.primarySize]=childLayoutSize[this.primarySize];
            } else childRect[this.primarySize]=expandingChildSpace;

            child.rect.set( childRect );
            if ( !dontDraw ) child.layout( canvas );

            pos+=childRect[this.primarySize] + this.spacing;
        }
    }

    this.minimumSize[this.secondarySize]+=this.margin[this.secondaryLesserMargin] + this.margin[this.secondaryGreaterMargin];

    if ( this.needsHScrollbar ) {
        this.setHScrollbarDimensions( canvas );
        this.hScrollbar.paintWidget( canvas );
    }

    if ( this.needsVScrollbar ) {
        this.setVScrollbarDimensions( canvas );
        this.vScrollbar.paintWidget( canvas );
    }

    if ( !this.noClipping )
        canvas.popClipRect();
};

VG.UI.Layout.prototype.setHScrollbarDimensions=function( canvas )
{
    this.hScrollbar.rect=VG.Core.Rect( this.contentRect.x + 1, this.contentRect.bottom(),
        this.contentRect.width - 2, VG.UI.stylePool.current.skin.Scrollbar.Size );

    this.hScrollbar.setScrollBarContentSize( this.minimumSize.width, this.contentRect.width-2 );
};

VG.UI.Layout.prototype.setVScrollbarDimensions=function( canvas )
{
    this.vScrollbar.rect=VG.Core.Rect( this.contentRect.right() /*- VG.UI.stylePool.current.skin.ScrollBar.Size*/, this.contentRect.y + 1,
        VG.UI.stylePool.current.skin.ScrollBar.Size, this.contentRect.height-2 );

    this.vScrollbar.setScrollBarContentSize( this.minimumSize.height, this.contentRect.height );
};

VG.UI.LayoutAnimationItem=function( widget )
{
    this.rect=VG.Core.Rect( widget.rect );
    this.visible=widget.visible;
    this.widget=widget;
};

VG.UI.LayoutAnimationState=function( layout )
{
    this.animationItems=[];

    layout.layout( VG.context.workspace.canvas, true );

    for( var i=0; i < layout.children.length; ++i )
    {
        var child=layout.children[i];

        var animationItem=new VG.UI.LayoutAnimationItem( child );
        this.animationItems.push( animationItem );

        if ( layout instanceof VG.UI.LabelLayout ) {
            var item=layout.items[i];

            animationItem.label=item.label;
            animationItem.labelRect=VG.Core.Rect( item.labelRect );
            animationItem.labelVAlignment=item.labelVAlignment;
        }
    }
};

VG.UI.Layout.prototype.lockAnimationSourceData=function()
{
    this.animationStates=[];
    this.animationStates.push( new VG.UI.LayoutAnimationState( this ) );
};

VG.UI.Layout.prototype.lockAnimationDestData=function()
{
    this.animationStates.push( new VG.UI.LayoutAnimationState( this ) );
};

VG.UI.Layout.prototype.startAnimation=function( mode, time )
{
    if ( !this.visible ) return;

    this.animationIsRunning=true;
    this.animationStartTime=new Date().getTime();
    this.animationDuration=time;

    VG.context.workspace.redrawList.push( this.animationStartTime + 1 );
};

VG.UI.Layout.prototype.animate=function( canvas )
{
    var currentTime=new Date().getTime();
    var timeElapsed=currentTime - this.animationStartTime;

    var percent=timeElapsed * 100 / this.animationDuration;

    if ( percent < 100 ) {
        VG.context.workspace.redrawList.push( currentTime + 1 );
    } else {
        if ( this.animationIsRunning )
            VG.context.workspace.redrawList.push( currentTime + VG.AnimationTick );
        this.animationIsRunning=false;
        percent=100;
    }

    for( var i=0; i < this.animationStates[0].animationItems.length; ++i )
    {
        var sItem=this.animationStates[0].animationItems[i];
        var dItem=this.animationStates[1].animationItems[i];

        if ( sItem.widget === dItem.widget )
        {
            if ( sItem.visible !== dItem.visible )
            {
                if ( sItem.visible ) canvas.setAlpha( (100 - percent) / 100.0 );
                else canvas.setAlpha( percent / 100.0 );

                sItem.widget.rect.set( dItem.rect );
                sItem.widget.paintWidget( VG.context.workspace.canvas );

                if ( sItem.label ) {
                    canvas.pushFont( VG.UI.stylePool.current.skin.Widget.Font );
                    VG.context.workspace.canvas.drawTextRect( sItem.label, sItem.labelRect, VG.UI.stylePool.current.skin.Widget.TextColor, 2, sItem.labelVAlignment );
                    canvas.popFont();
                }
            } else
            {
                var item=dItem;
                var rect, fadeLabel=false;

                if ( sItem.rect.equals( dItem.rect ) ) rect=sItem.rect;
                else {
                    // --- Compute the middle rect

                    rect=VG.Core.Rect();

                    rect.x=sItem.rect.x + ((dItem.rect.x - sItem.rect.x)/100) * percent;
                    rect.y=sItem.rect.y + ((dItem.rect.y - sItem.rect.y)/100) * percent;
                    rect.width=sItem.rect.width + ((dItem.rect.width - sItem.rect.width)/100) * percent;
                    rect.height=sItem.rect.height + ((dItem.rect.height - sItem.rect.height)/100) * percent;

                    fadeLabel=true;
                }

                canvas.setAlpha( 1.0 );

                item.widget.rect.set( rect.round() );
                item.widget.paintWidget( VG.context.workspace.canvas );

                if ( item.label ) {
                    canvas.pushFont( VG.UI.stylePool.current.skin.Widget.Font );
                    if ( fadeLabel ) canvas.setAlpha( percent / 100.0 );
                    canvas.drawTextRect( item.label, item.labelRect, VG.UI.stylePool.current.skin.Widget.TextColor, 2, item.labelVAlignment );
                    canvas.popFont();
                }
            }
        }
    }

    canvas.setAlpha( 1.0 );
};

// ----------------------------------------------------------------- VG.UI.SplitLayoutItem

VG.UI.SplitLayoutItem=function()
{
    if ( !(this instanceof VG.UI.SplitLayoutItem) ) return new VG.UI.SplitLayoutItem();

    this.percent=50;
    this.offset=0;
    this.totalOffset=0;
    this.canDrag=false;

    this.rect=VG.Core.Rect();
};

/**
 * This layout arranges it's relatively sized child objects next to each other. Expanding child object can be resized by the use of a small bar next the object.
 * Each object is given a percentage (out of 100) which defines its relative size compared to the other child objects.
 * Layouts can contain {@link VG.UI.Widget} based classes or other layouts.
 * @borrows VG.UI.Widget.disabled as VG.UI.Layout.disabled
 * @borrows VG.UI.Widget.visible as VG.UI.Layout.visible
 * @property {number} length - The number of child objects in this layout (read-only).
 * @property {bool} horizontal - If true, child objects are arranged horizontally (the default).
 * @property {bool} vertical - If true, child objects are arranged vertically.
 * @constructor
 * @tutorial Layouts
 * @param {object} child - The  object to add to the layout.
 * @param {number} percent - The relative size of the object in percent.
 */

VG.UI.SplitLayout=function()
{
    if ( !(this instanceof VG.UI.SplitLayout) ) return VG.UI.SplitLayout.creator( arguments );

    VG.UI.Layout.call( this );
    this.name="SplitLayout";

    this.minimumSize.set( 200, 200 );

    this.dragOpStart=VG.Core.Point();

    this.dragOpItemIndex=0;
    this.dragOp=false;

    this.items=[];
    this.spacing = VG.UI.stylePool.current.skin.SplitLayout.Size;

    for( var i=0; i < arguments.length; i+=2 )
        this.addChild( arguments[i], arguments[i+1] );
};

VG.UI.SplitLayout.prototype=VG.UI.Layout();

VG.UI.SplitLayout.prototype.calcSize=function( canvas )
{
    var size=VG.Core.Size();
    size.width=VG.UI.MaxLayoutSize;
    size.height=VG.UI.MaxLayoutSize;

    if ( size[this.primarySize] > this.maximumSize[this.primarySize] ) size[this.primarySize]=this.maximumSize[this.primarySize];
    if ( size[this.secondarySize] > this.maximumSize[this.secondarySize] ) size[this.secondarySize]=this.maximumSize[this.secondarySize];

    return size;
};

/**
 * Adds a child object to the end of this layout.
 * @param {object} child - The child object to add to the layout.
 * @param {number} percent - The relative size of the object in percent (out of 100).
 */

VG.UI.SplitLayout.prototype.addChild=function( child, percent )
{
    this.children.push( child );
    child.parent=this;

    var item=VG.UI.SplitLayoutItem();

    if ( arguments.length == 2 )
        item.percent=percent;

    this.items.push( item );
};

/**
 * Inserts a child object at a specific index to this layout.
 * @param {number} index - The index position to insert the child at.
 * @param {object} child - The child oject to add.
 * @param {number} percent - The relative size of the object in percent (out of 100).
 */

VG.UI.SplitLayout.prototype.insertChildAt=function( index, child, percent )
{
    child.parent=this;
    this.children.splice( index, 0, child );

    let item = VG.UI.SplitLayoutItem();

    if ( arguments.length == 3 )
        item.percent=percent;

    this.items.splice( index, 0, item );
};

// Legacy
VG.UI.SplitLayout.prototype.insertChild=function( index, child )
{
    this.insertChildAt( index, child );
};

/**
 * Removes the given child object from the layout.
 * @param {object} child - The child object to remove.
 */

VG.UI.SplitLayout.prototype.removeChild=function( child )
{
    var index=this.children.indexOf( child );
    if ( index >= 0 ) {
        this.children.splice( index, 1 );
        this.items.splice( index, 1 );
    }
};

/**
 * Returns the relative child object's percentage at the given index.
 * @param {number}  index - The index of the child object.
 * @returns {number} The child object's relative percentage.
 */

VG.UI.SplitLayout.prototype.getChildPercentAt=function( index )
{
    return this.items[index].percent;
};

/**
 * Sets the child object's relative percentage at the given index.
 * @param {number} index - The index of the child object.
 * @param {number} percent - The relative size of the object in percent (out of 100).
 */

VG.UI.SplitLayout.prototype.setChildPercentAt=function( index, percent )
{
    this.items[index].percent=percent;
};

VG.UI.SplitLayout.prototype.specialLayoutHitTest=function( pt )
{
    for( i=0; i < this.children.length; ++i )
    {
        var item=this.items[i];
        if ( item.canDrag && item.rect.contains( pt ) ) {
            this.dragOpItemIndex=i;

            if ( this.horizontal ) VG.setMouseCursor( "col-resize" );
            else VG.setMouseCursor( "row-resize" );

            if ( !this.hasHoverState ) {
                this.hasHoverState=true;
                VG.update();
            }

            this.mouseCursorChanged=true;

            return true;
        }
    }

    if ( this.mouseCursorChanged ) {
        VG.setMouseCursor( "default" );
        this.mouseCursorChanged=false;
    }

    if ( this.hasHoverState ) {
        this.hasHoverState=false;
        VG.update();
    }
    return false;
};

VG.UI.SplitLayout.prototype.hoverIn=function()
{
    //console.log( "hoverIn" );
};

VG.UI.SplitLayout.prototype.hoverOut=function()
{
    if ( this.mouseCursorChanged ) {
        VG.setMouseCursor( "default" );
        this.mouseCursorChanged=false;
    }
};

VG.UI.SplitLayout.prototype.mouseMove=function( event )
{
    if ( VG.context.workspace.mouseDownButton === undefined ) {

        this.dragOp=0;
        VG.context.workspace.mouseTrackerWidget=0;

        for( let i=0; i < this.items.length; ++i ) {
            let item=this.items[i];
            item.offset=0;
        }
        return;
    }

    if ( this.dragOp )
    {
        let item=this.items[this.dragOpItemIndex];
        let nextItem=this.items[this.dragOpItemIndex + 1 ];

        let widget=this.children[this.dragOpItemIndex ];
        let nextWidget=this.children[this.dragOpItemIndex + 1];

        let oldItemOffset=item.offset;
        let oldNextItemOffset=nextItem.offset;
        let offset;

        if ( event.pos[this.primaryCoord] > this.dragOpStart[this.primaryCoord] )
        {
            // --- User drags to the right / down

            offset=event.pos[this.primaryCoord] - this.dragOpStart[this.primaryCoord];
            var greaterBorder;

            if ( (this.dragOpItemIndex + 1 ) < ( this.items.length - 1 ) ) {
                // --- There is another item to the right / bottom, use it as the greater border.
                var rightWidget=this.children[this.dragOpItemIndex + 2];
                greaterBorder=rightWidget.rect[this.primaryCoord] - this.spacing - nextWidget.minimumSize[this.primarySize];
            } else {
                // --- greater border is rect
                greaterBorder=this.rect[this.primaryCoord] + this.rect[this.primarySize] - this.margin[this.primaryGreaterMargin] -
                    this.spacing - nextWidget.minimumSize[this.primarySize];
            }

            if ( event.pos[this.primaryCoord] > greaterBorder ) {
                offset-=event.pos[this.primaryCoord] - greaterBorder;
            }

            item.offset=offset;
            nextItem.offset=-offset;
        } else {
            // --- User drags to the left / top

            offset=this.dragOpStart[this.primaryCoord] - event.pos[this.primaryCoord];

            let lesserBorder=widget.rect[this.primaryCoord] + this.margin[this.primaryLesserMargin] + widget.minimumSize[this.primarySize];
            if ( event.pos[this.primaryCoord] < lesserBorder ) offset-=lesserBorder - event.pos[this.primaryCoord];

            item.offset=-offset;
            nextItem.offset=offset;
        }

        if ( ( oldItemOffset != item.offet ) || ( oldNextItemOffset != nextItem.offset ) )
            VG.context.workspace.canvas.update();
    }
};

VG.UI.SplitLayout.prototype.mouseDown=function( event )
{
    if ( !this.specialLayoutHitTest( event.pos ) ) return;

    var widget=this.children[this.dragOpItemIndex];

    if ( event.pos[this.primaryCoord] > ( widget.rect[this.primaryCoord] + widget.rect[this.primarySize] - this.spacing ) ) {

        this.dragOp=true;
        this.dragOpStart.set( event.pos );

        VG.context.workspace.mouseTrackerWidget=this;
    }
};

VG.UI.SplitLayout.prototype.mouseUp=function( event )
{
    this.dragOp=0;
    VG.context.workspace.mouseTrackerWidget=0;

    for( let i=0; i < this.items.length; ++i ) {
        let item=this.items[i];

        item.totalOffset+=item.offset;
        item.offset=0;
    }

    VG.update();
};

VG.UI.SplitLayout.prototype.recalcOffset=function()
{
    for( let i=0; i < this.items.length; ++i ) {
        let item=this.items[i];

        item.totalOffset+=item.offset;
        item.offset=0;
    }
};

VG.UI.SplitLayout.prototype.layout=function( canvas )
{
    if ( !this.children.length ) return;

    this.rect.round();
    let sepSize = this.spacing;
    this.spacing=sepSize;

    let rect=this.rect;

    let availableSpace=rect[this.primarySize] - this.margin[this.primaryLesserMargin] - this.margin[this.primaryGreaterMargin];
    let expandingChilds=0, i, child;

    for( i=0; i < this.children.length; ++i ) {
        child=this.children[i];

        if ( child.isWidget ) {
            if ( child[this.primaryLayoutExpanding] === false ) {
                availableSpace-=child.calcSize( canvas )[this.primarySize];
            } else ++expandingChilds;
        } else
        if ( child.isLayout ) {
            let childLayoutSize=child.calcSize( canvas );
            /*if ( childLayoutSize[this.primarySize] < VG.UI.MaxLayoutSize ) {
                availableSpace-=childLayoutSize[this.primarySize];
            } else*/ ++expandingChilds;
        }
    }

    let totalSpacing=(expandingChilds-1) * sepSize;
    availableSpace-=totalSpacing;

    let expandingChildSpace=availableSpace;
    let minAdjustmentCorrection=0;
    let pos=rect[this.primaryCoord] + this.margin[this.primaryLesserMargin];

    for( i=0; i < this.children.length; ++i )
    {
        child = this.children[i];
        let childRect=this.workRect;

        let size, item, primarySize;
        let secondaryCoord, secondarySize;

        let adjustY = 0;
        if ( VG.context.workspace.layout === this && VG.context.workspace.decoratedToolBar && child.__rightDock )
            adjustY = VG.context.workspace.appLogo.rect.height - VG.UI.stylePool.current.skin.DecoratedToolBar.Height;

        if ( child.isWidget )
        {
            // --- The Child is a Widget

            size = child.calcSize( canvas );

            if ( child[this.primaryLayoutExpanding] === false )
            {
                child.rect[this.primaryCoord] = pos;
                child.rect[this.secondaryCoord] = rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin] - adjustY;

                secondaryCoord = rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin] + ( rect[this.secondarySize] -
                    this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin] - size[this.secondarySize] ) / 2 - adjustY;

                if ( child[this.secondaryLayoutExpanding] === false ) {
                    child.rect.setSize( size.width, size.height );
                } else
                if ( child[this.secondaryLayoutExpanding] ) {

                    child.rect[this.primarySize] = size[this.primarySize];
                    child.rect[this.secondarySize] = rect[this.secondarySize] + adjustY;
                }

                child.rect.round();
                // canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, child.rect, VG.UI.stylePool.current.skin.Widget.BackgroundColor );
                child.paintWidget( canvas );
                childRect.copy( child.rect );
            } else
            if ( child[this.primaryLayoutExpanding] )
            {
                if ( child[this.secondaryLayoutExpanding] === false ) {
                    size = child.calcSize( canvas );

                    secondaryCoord = rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin] +  (rect[this.secondarySize] -
                        this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin] - size[this.secondarySize])/2 - adjustY;
                    secondarySize = size[this.secondarySize] + adjustY;
                } else
                if ( child[this.secondaryLayoutExpanding] ) {
                    secondaryCoord = rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin] - adjustY;
                    secondarySize = rect[this.secondarySize] - this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin] + adjustY;
                }

                child.rect[this.primaryCoord] = pos;
                child.rect[this.secondaryCoord] = secondaryCoord;
                child.rect[this.secondarySize] = secondarySize;

                item = this.items[i];
                primarySize=(expandingChildSpace*item.percent) / 100.0 - minAdjustmentCorrection;
                if ( primarySize < child.minimumSize[this.primarySize] )
                {
                    // --- Propagate the correction when a minimumSize conflicts with the assigned percentage
                    minAdjustmentCorrection += child.minimumSize[this.primarySize] - primarySize;
                    primarySize = child.minimumSize[this.primarySize];
                }

                availableSpace -= primarySize;
                if ( availableSpace < 0 ) primarySize += availableSpace;

                primarySize+=item.offset + item.totalOffset;
                child.rect[this.primarySize] = primarySize;

                child.rect.round();
                if ( primarySize > 1 ) {
                    // canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, child.rect, VG.UI.stylePool.current.skin.Widget.BackgroundColor );
                    child.paintWidget( canvas );
                }
                childRect.copy( child.rect );
            }
        } else
        {
            // --- Child is a Layout

            childRect[this.primaryCoord] = pos;
            childRect[this.secondaryCoord] = rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin] - adjustY;
            childRect[this.secondarySize] = rect[this.secondarySize] - this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin] + adjustY;

            item = this.items[i];
            primarySize = (expandingChildSpace*item.percent) / 100.0 - minAdjustmentCorrection;

            if ( primarySize < child.minimumSize[this.primarySize] )
            {
                // --- Propagate the correction when a minimumSize conflicts with the assigned percentage
                minAdjustmentCorrection += child.minimumSize[this.primarySize] - primarySize;
                primarySize = child.minimumSize[this.primarySize];
            }

            availableSpace -= primarySize;
            if ( availableSpace < 0 ) primarySize += availableSpace;

            primarySize += item.offset + item.totalOffset;
            childRect[this.primarySize] = primarySize;

            child.rect.copy( childRect );
            child.rect.round();
            if ( primarySize > 1 ) {
                // canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, child.rect, VG.UI.stylePool.current.skin.Widget.BackgroundColor );
                child.layout( canvas );
            }
        }

        let drawSplitbar = true;

        if ( i < (this.children.length-1) ) {
            child = this.children[i];
            item = this.items[i];

            adjustY = 0;
            if ( VG.context.workspace.layout === this && VG.context.workspace.decoratedToolBar && this.children[i+1].__rightDock )
                adjustY = VG.context.workspace.appLogo.rect.height - VG.UI.stylePool.current.skin.DecoratedToolBar.Height;

            if ( child.isWidget && child[this.primaryLayoutExpanding] === false )
                drawSplitbar=false;

            if ( this.children[i+1].isWidget && this.children[i+1][this.primaryLayoutExpanding] === false )
                drawSplitbar=false;

            if ( drawSplitbar ) {

                VG.UI.stylePool.current.drawSplitHandle( canvas, this, pos, item.rect, childRect, this.dragOp && this.dragOpItemIndex === i, this.hasHoverState && this.dragOpItemIndex === i, adjustY );

                item.rect[this.primaryCoord]=pos + childRect[this.primarySize];
                item.rect[this.secondaryCoord]=this.margin[this.secondaryLesserMargin] + rect[this.secondaryCoord] - adjustY;
                item.rect[this.primarySize]=sepSize;
                item.rect[this.secondarySize]=rect[this.secondarySize] - this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin] + adjustY;
                item.canDrag=true;
            } else item.canDrag=false;
        }

        pos += childRect[this.primarySize];
        if ( drawSplitbar ) pos+=sepSize;
    }
};

// ----------------------------------------------------------------- VG.UI.LabelLayoutItem

VG.UI.LabelLayoutItem=function( label, widget )
{
    if ( !(this instanceof VG.UI.LabelLayoutItem) ) return new VG.UI.LabelLayoutItem( label, widget );

    this.label=label;
    this.labelRect=VG.Core.Rect();
    this.widget=widget;
};

/**
 * Arranges it's child objects vertically with a text label to the left of each child object.
 * Layouts can contain {@link VG.UI.Widget} based classes or other layouts.
 * @borrows VG.UI.Widget.disabled as VG.UI.Layout.disabled
 * @borrows VG.UI.Widget.visible as VG.UI.Layout.visible
 * @property {number} length - The number of child objects in this layout (read-only).
 * @constructor
 * @tutorial Layouts
 * @param {string} label - The text label of the object.
 * @param {object} child - The  object to add to the layout.
 */

VG.UI.LabelLayout=function()
{
    if ( !(this instanceof VG.UI.LabelLayout) ) return VG.UI.LabelLayout.creator( arguments );

    VG.UI.Layout.call( this );
    this.name="LabelLayout";

    this.items=[];
    this.spacing=8;
    this.labelSpacing=8;
/*
    this.margin.left=12;
    this.margin.right=12;
    this.margin.top=12;
    this.margin.bottom=12;*/

    this.labelAlignment=VG.UI.HAlignment.Right;
    this.mode=VG.UI.LabelLayout.Mode.WidgetMax;

    this.size=VG.Core.Size();

    for( var i=0; i < arguments.length; i+=2 ) {
        let widget = arguments[i+1];
        if ( typeof widget === 'string' || widget instanceof String ) this.addDivider( widget );
        else this.addChild( arguments[i], arguments[i+1] );
    }

    this.hOffset=0; this.vOffset=0;
    this.allowScrollbars=false;
};

VG.UI.LabelLayout.prototype=VG.UI.Layout();

VG.UI.LabelLayout.Mode={ "WidgetMax" : 0, "Centered" : 1 };

VG.UI.LabelLayout.prototype.calcSize=function( canvas )
{
    this.layout( canvas, true );
    this.size.set( this.minimumSize );

    return this.size;
};

/**
 * Adds a child object to the end of this layout.
 * @param {string} label - The text label of the child object to add.
 * @param {object} child - The child object to add to the layout.
 */

VG.UI.LabelLayout.prototype.addChild=function( label, widget )
{
    let item=VG.UI.LabelLayoutItem( label, widget );

    this.items.push( item );
    this.children.push( widget );
    widget.parent=this;
};

/**
 * Adds a child object to the end of this layout.
 * @param {string} label - The text label of the child object to add.
 * @param {object} child - The child object to add to the layout.
 */

VG.UI.LabelLayout.prototype.addDivider=function( label = "" )
{
    let widget = VG.UI.LayoutVSeparator();
    let item=VG.UI.LabelLayoutItem( label, widget );
    item.isDivider = true;

    this.items.push( item );
    this.children.push( widget );
};

VG.UI.LabelLayout.prototype.hHandleMoved=function( offsetInScrollbarSpace, customLine )
{
    this.hOffset=offsetInScrollbarSpace * this.hScrollbar.totalSize / this.hScrollbar.visibleSize;
};

VG.UI.LabelLayout.prototype.vHandleMoved=function( offsetInScrollbarSpace, customLine )
{
    this.vOffset=offsetInScrollbarSpace * this.vScrollbar.totalSize / this.vScrollbar.visibleSize;
};

VG.UI.LabelLayout.prototype.specialLayoutHitTest=function( pt )
{
    if ( !this.hScrollbar && !this.vScrollbar ) return false;

    if ( this.needsHScrollbar && this.hScrollbar.rect.contains( pt ) )
        return true;
    else
    if ( this.needsVScrollbar && this.vScrollbar.rect.contains( pt ) )
        return true;
    else
    {
        if ( ( this.hScrollbar && this.hScrollbar.visualState === VG.UI.Widget.VisualState.Hover ) || ( this.vScrollbar && this.vScrollbar.visualState === VG.UI.Widget.VisualState.Hover ) )
            return true;
    }
    return false;
};

VG.UI.LabelLayout.prototype.mouseMove=function( event )
{
    if ( this.needsHScrollbar && this.hScrollbar )
    {
        if ( this.hScrollbar.rect.contains( event.pos ) ) {
            this.hScrollbar.mouseMove( event );
            return;
        } else
        {
            if ( this.hScrollbar.visualState === VG.UI.Widget.VisualState.Hover ) {
                this.hScrollbar.visualState=VG.UI.Widget.VisualState.Normal;
                VG.update();
            }
        }
    }

    if ( this.needsVScrollbar && this.vScrollbar )
    {
        if ( this.vScrollbar.rect.contains( event.pos ) ) {
            this.vScrollbar.mouseMove( event );
            return;
        } else
        {
            if ( this.vScrollbar.visualState === VG.UI.Widget.VisualState.Hover ) {
                this.vScrollbar.visualState=VG.UI.Widget.VisualState.Normal;
                VG.update();
            }
        }
    }
};

VG.UI.LabelLayout.prototype.mouseWheel=function( step )
{
    if ( !this.needsVScrollbar ) return false;

    if ( step > 0 ) {
        this.vOffset-=1 + this.spacing;
        this.vScrollbar.scrollTo( this.vOffset );
        return true;
    } else
    {
        this.vOffset+=1 + this.spacing;
        this.vScrollbar.scrollTo( this.vOffset );
        return true;
    }
};

VG.UI.LabelLayout.prototype.mouseDown=function( event )
{
    if ( this.needsHScrollbar && this.hScrollbar.rect.contains( event.pos ) ) {
        this.hScrollbar.mouseDown( event );
    } else
    if ( this.needsVScrollbar && this.vScrollbar.rect.contains( event.pos ) ) {
        this.vScrollbar.mouseDown( event );
    }
};

VG.UI.LabelLayout.prototype.mouseUp=function( event )
{
    //console.log( "mouseUp" );
};

VG.UI.LabelLayout.prototype.layout=function( canvas, dontDraw )
{
    if ( !this.visible ) return;

    if ( !dontDraw && this.title ) {
        this.contentRect.copy( this.rect ); this.contentRect.height=VG.UI.stylePool.current.skin.TitleBar.Height;
        VG.UI.stylePool.current.drawTitleBar( canvas, this.contentRect, this.title );
    }

    if ( !this.children.length ) return;

    if ( this.animationIsRunning === true ) {
        this.animate( canvas );
        return;
    }

    this.rect.round();
    this.contentRect.copy( this.rect );
    if ( this.title ) {
        this.contentRect.y+=VG.UI.stylePool.current.skin.TitleBar.Height;
        this.contentRect.height-=VG.UI.stylePool.current.skin.TitleBar.Height;
    }

    // --- Check for H Scrollbar
    if ( this.allowScrollbars && Math.floor( this.rect.width ) < Math.floor( this.size.width ) ) {
        this.needsHScrollbar=true;
        //VG.log( "VG.UI.LabelLayout needs HScrollbar", this.rect.width, this.size.width );
        this.contentRect.height-=/*this.rect.height -*/ VG.UI.stylePool.current.skin.ScrollBar.Size;

        if ( !this.hScrollbar ) {
            this.hScrollbar=VG.UI.ScrollBar( "Horizontal LabelLayout" );
            this.hScrollbar.direction=VG.UI.ScrollBar.Direction.Horizontal;
            this.hScrollbar.callbackObject=this;
        }
    } else this.needsHScrollbar=false;

    // --- Check for V Scrollbar
    if ( this.allowScrollbars && Math.floor( this.rect.height ) < Math.floor( this.size.height ) ) {
        this.needsVScrollbar=true;
        //VG.log( "VG.UI.LabelLayout needs VScrollbar", this.rect.height, this.size.height );
        this.contentRect.width-=/*this.rect.width -*/ VG.UI.stylePool.current.skin.ScrollBar.Size;

        if ( !this.vScrollbar ) {
            this.vScrollbar=VG.UI.ScrollBar( "Vertical LabelLayout" );
            this.vScrollbar.direction=VG.UI.ScrollBar.Direction.Vertical;
            this.vScrollbar.callbackObject=this;
        }
    } else this.needsVScrollbar=false;

    canvas.pushClipRect( this.contentRect );

    canvas.pushFont( VG.UI.stylePool.current.skin.Widget.Font );

    var rect=this.contentRect;
    var rectWidth=rect.width - this.margin.left - this.margin.right;

    var y=rect.y + this.margin.top;
    var sideWidth=(rectWidth - this.labelSpacing) / 2;

    var labelRect=VG.Core.Rect();
    var widgetRect=VG.Core.Rect();
    var minHeight=canvas.getLineHeight();
    var i;

    this.minimumSize.set( 0, this.margin.top + this.margin.bottom );

    if ( this.title )
        this.minimumSize.height+=VG.UI.stylePool.current.skin.TitleBar.Height;

    // --- Compute number of visible items

    var visibleItems=0, child;

    for( i=0; i < this.children.length; ++i ) {
        child=this.children[i];
        if ( child.visible ) ++visibleItems;
    }

    // ----

    var totalSpacing=(visibleItems-1) * this.spacing;
    var availableSpace=rect.height - totalSpacing - this.margin.top - this.margin.bottom;
    if ( this.title ) availableSpace-=VG.UI.stylePool.current.skin.TitleBar.Height;

    var expandingChilds=0;

    for( i=0; i < this.children.length; ++i ) {
        child=this.children[i];

        if ( child.isWidget && child.visible ) {
            if ( child.verticalExpanding === false ) {
                availableSpace-=child.calcSize( canvas ).height;
            } else {
                if ( child.maximumSize.height === VG.UI.MaxLayoutSize )
                    ++expandingChilds;
                else availableSpace-=child.maximumSize.height;
            }
        }
    }

    var expandingChildSpace=availableSpace / expandingChilds;

    // ---

    let textSize=VG.Core.Size();
    if ( this.mode === VG.UI.LabelLayout.Mode.WidgetMax )
    {
        var maxTextWidth=0;

        for( i=0; i < this.items.length; ++i ) {
            child=this.items[i];

            if ( child.isDivider )
                continue;

            canvas.getTextSize( child.label, textSize );

            if ( textSize.width > maxTextWidth )
                maxTextWidth=textSize.width;
        }

        labelRect.x=rect.x + this.margin.left;
        labelRect.width=maxTextWidth;

        widgetRect.x=rect.x + this.margin.left + maxTextWidth + this.labelSpacing;
        widgetRect.width=rectWidth - maxTextWidth - this.labelSpacing;
    } else
    if ( this.mode === VG.UI.LabelLayout.Mode.Centered )
    {
        labelRect.x=rect.x + this.margin.left;
        labelRect.width=sideWidth;

        widgetRect.x=rect.x + rectWidth / 2 + this.labelSpacing / 2;
        widgetRect.width=sideWidth;
    }

    labelRect.x-=this.hOffset;
    widgetRect.x-=this.hOffset;

    // ---

    for( i=0; i < this.items.length; ++i ) {
        child=this.items[i];
        var widget=child.widget;

        if ( widget.isLayout && widget instanceof VG.UI.StackedLayout && widget.current )
            widget=widget.current;

        if ( !widget.visible ) continue;

        var widgetSize=widget.calcSize( canvas );
        var height;
        var textVAlignment=1;

        if ( widget.verticalExpanding === false )
            height=widgetSize.height;
        else {

            if ( widget.maximumSize.height === VG.UI.MaxLayoutSize )
                height=expandingChildSpace;
            else height=widget.maximumSize.height;
            textVAlignment=0;
        }

        if ( height < minHeight )
            height=minHeight;

        labelRect.y=y - this.vOffset;
        labelRect.height=height;
        child.labelRect.set( labelRect );
        child.labelVAlignment=textVAlignment;

        labelRect.round();

        if ( arguments.length === 1 ) {

            if ( child.isDivider )
            {
                canvas.getTextSize( child.label, textSize );

                widget.rect.copy( labelRect );
                widget.rect.x = rect.x + this.margin.left;
                widget.rect.width = rect.width;
                widget.rect.y -= this.spacing /2;

                canvas.drawTextRect( child.label, widget.rect, VG.UI.stylePool.current.skin.Widget.TextColor, 1, textVAlignment );
            } else {
                if ( !this.disabled && !widget.disabled ) canvas.drawTextRect( child.label, labelRect, VG.UI.stylePool.current.skin.Widget.TextColor, this.labelAlignment, textVAlignment );
                else canvas.drawTextRect( child.label, labelRect, VG.UI.stylePool.current.skin.Widget.DisabledTextColor, this.labelAlignment, textVAlignment );
            }
        }

        widget.rect.y=y - this.vOffset;

        if ( child.isDivider )
        {
            widget.rect.y -= this.spacing /2;
            if ( child.label.length > 1 ) {
                widget.rect.x = rect.x + this.margin.left;
                widget.rect.width = (rect.width - textSize.width)/2 - this.margin.right;

                widget.rect.round();

                if ( arguments.length === 1 )
                    widget.paintWidget( canvas );

                widget.rect.x += widget.rect.width + textSize.width + 12;
                widget.rect.width -= 12;
            } else {
                widget.rect.x = rect.x + this.margin.left;
                widget.rect.width = rect.width - this.margin.left - this.margin.right;
            }
            widget.rect.height = minHeight;
            y-=this.spacing;
        } else
        {
            widget.rect.x=widgetRect.x;

            if ( widgetRect.width > widget.maximumSize.width )
            {
                widget.rect.width=widget.maximumSize.width;
            } else widget.rect.width=widgetRect.width;

            if ( height > widget.maximumSize.height )
            {
                widget.rect.y+=(height - widget.maximumSize.height) / 2;
                widget.rect.height=widget.maximumSize.height;
            } else widget.rect.height=height;

            if ( widget.horizontalExpanding === false ) {
                if ( widgetSize.width < widgetRect.width )
                    widget.rect.width=widgetSize.width;
            }
        }

        widget.rect.round();

        if ( arguments.length === 1 )
            widget.paintWidget( canvas );

        // --- Minimum Size: Width

        if ( this.margin.left + this.margin.right + this.labelSpacing + labelRect.width + widget.minimumSize.width > this.minimumSize.width )
            this.minimumSize.width=this.margin.left + this.margin.right + this.labelSpacing + labelRect.width + widget.minimumSize.width;

        // ---

        y+=height + this.spacing;
        this.minimumSize.height+=widget.minimumSize.height + this.spacing;
    }

    canvas.popFont();
    canvas.popClipRect();

    if ( this.needsHScrollbar ) {
        this.setHScrollbarDimensions( canvas );
        this.hScrollbar.paintWidget( canvas );
    }

    if ( this.needsVScrollbar ) {
        this.setVScrollbarDimensions( canvas );
        this.vScrollbar.paintWidget( canvas );
    }
};

VG.UI.LabelLayout.prototype.setHScrollbarDimensions=function( canvas )
{
    this.hScrollbar.rect=VG.Core.Rect( this.contentRect.x + 1, this.contentRect.bottom(),
        this.contentRect.width - 2, VG.UI.stylePool.current.skin.ScrollBar.Size );

    this.hScrollbar.setScrollBarContentSize( this.size.width, this.contentRect.width-2 );
};

VG.UI.LabelLayout.prototype.setVScrollbarDimensions=function( canvas )
{
    this.vScrollbar.rect=VG.Core.Rect( this.contentRect.right(), this.contentRect.y + 1,
        VG.UI.stylePool.current.skin.ScrollBar.Size, this.contentRect.height - 2 );

    this.vScrollbar.setScrollBarContentSize( this.size.height, this.contentRect.height );
};

/**
 * Arranges it's child objects stacked on top of each other. The <i>current</i> property defines the currently visible child object at the top of the stack. By default the first added child object
 * is currently visible.
 * Layouts can contain {@link VG.UI.Widget} based classes or other layouts.
 * @borrows VG.UI.Widget.disabled as VG.UI.Layout.disabled
 * @borrows VG.UI.Widget.visible as VG.UI.Layout.visible
 * @property {number} length - The number of child objects in this layout (read-only).
 * @property {object} current - The currently visible child object.
 * @constructor
 * @tutorial Layouts
 * @param {object} child - Optional, the  object to add to the layout.
 */

VG.UI.StackedLayout=function()
{
    if ( !(this instanceof VG.UI.StackedLayout) ) return VG.UI.StackedLayout.creator( arguments );

    VG.UI.Layout.call( this );
    this.name="StackedLayout";

    this._current=undefined;

    for( var i=0; i < arguments.length; ++i )
        this.addChild( arguments[i] );
};

VG.UI.StackedLayout.prototype=VG.UI.Layout();

Object.defineProperty( VG.UI.StackedLayout, "current",
{
    get: function() {
        return this._current;
    },
    set: function( current ) {
        this._current=current;

        for( var i=0; i < this.children.length; ++i )
        {
            var child=this.children[i];

            if ( child === current ) child.visible=true;
            else child.visible=false;
        }
    }
});

/**
 * Adds a child object to the layout.
 * @param {object} child - The child object to add to the layout.
 */

VG.UI.StackedLayout.prototype.addChild=function( child )
{
    VG.UI.Layout.prototype.addChild.call( this, child );

    if ( !this.current ) this.current=child;
};

VG.UI.StackedLayout.prototype.childAt=function( index )
{
    return this.children[index];
};

VG.UI.StackedLayout.prototype.calcSize=function( canvas )
{
    var size;
    if ( this.current ) {
        size=this.current.calcSize( canvas );

        this.minimumSize.set( this.current.minimumSize );

        if ( this.current.horizontalExpanding ) size.width=VG.UI.MaxLayoutSize;
        if ( this.current.verticalExpanding ) size.height=VG.UI.MaxLayoutSize;
        return size;
    } else {
        size=VG.Core.Size( 100, 100 );
        return size;
    }
};

VG.UI.StackedLayout.prototype.layout=function( canvas )
{
    // --- Adjust the rect of all children
    for( var i=0; i < this.children.length; ++i )
    {
        var child=this.children[i];

        child.rect.set( this.rect );

        if ( child === this.current ) {
            if ( !child._visible && child.aboutToShow ) child.aboutToShow();
            child.visible=true;
        } else child.visible=false;
    }

    // --- Layout the current item

    if ( this.current )
    {
        this.current.rect.set( this.rect );
        if ( this.current.isLayout )
            this.current.layout( canvas );
        else
            this.current.paintWidget( canvas );
    }
};
