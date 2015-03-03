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

// ----------------------------------------------------------------- VG.UI.LayoutHSeparator

VG.UI.LayoutHSeparator=function()
{
    if ( !(this instanceof VG.UI.LayoutHSeparator )) return new VG.UI.LayoutHSeparator();

    VG.UI.Widget.call( this );
    this.name="ToolSeparator";

    this.horizontalExpanding=false;
    this.verticalExpanding=true;
};

VG.UI.LayoutHSeparator.prototype=VG.UI.Widget();

VG.UI.LayoutHSeparator.prototype.calcSize=function()
{
    var size=VG.Core.Size( 1,1 );
    return size;
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
};

VG.UI.LayoutVSeparator.prototype=VG.UI.Widget();

VG.UI.LayoutVSeparator.prototype.calcSize=function()
{
    var size=VG.Core.Size( 1,1 );
    return size;
};

VG.UI.LayoutVSeparator.prototype.paintWidget=function( canvas )
{
    this.contentRect.set( this.rect );
    
    //VG.context.style.drawToolSeparator( canvas, this );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, VG.Core.Color("#BBC0C7") );

};

// ----------------------------------------------------------------- VG.UI.LayoutHSpacer

VG.UI.LayoutHSpacer=function()
{
    if ( !(this instanceof VG.UI.LayoutHSpacer )) return new VG.UI.LayoutHSpacer();

    VG.UI.Widget.call( this );
    this.name="LayoutHSpacer";

    this.horizontalExpanding=true;
    this.verticalExpanding=false;
};

VG.UI.LayoutHSpacer.prototype=VG.UI.Widget();

VG.UI.LayoutHSpacer.prototype.calcSize=function()
{
    var size=VG.Core.Size( 1,1 );
    return size;
};

VG.UI.LayoutHSpacer.prototype.paintWidget=function( canvas )
{
    this.contentRect.set( this.rect );
};

// ----------------------------------------------------------------- VG.UI.Layout

VG.UI.Layout=function()
{
    if ( this instanceof VG.UI.Layout ) {
        this.name="Layout";
        this.children=[];
        this.spacing=4;

        this.hoverIn=0;
        this.hoverOut=0;

        this.mouseDown=0;
        this.mouseUp=0;

        this.rect=VG.Core.Rect();
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

        for( var i=0; i < arguments.length; ++i )
            this.addChild( arguments[i] );

    } else return VG.UI.Layout.creator( arguments );
};

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
            makeAllChildsLooseFocus( child );
        }
    }
}

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

VG.UI.Layout.prototype.insertAt=function( index, child )
{
    this.children.splice( index, 0, child );
    child.parent=this;
};

VG.UI.Layout.prototype.addChild=function( child )
{
    this.children.push( child );
    child.parent=this;
};

VG.UI.Layout.prototype.childAt=function( index )
{
    return this.children[index];
};

VG.UI.Layout.prototype.removeChild=function( child )
{
    var index=this.children.indexOf( child );
    if ( index >= 0 ) {
        this.children.splice( index, 1 );
    }    
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
    if ( !this.children.length ) return;

    if ( this.animationIsRunning == true ) {
        this.animate( canvas );
        return;
    }

    // --- Visible Children

    var visibleChildren=0;

    for( var i=0; i < this.children.length; ++i )
    {
        var child=this.children[i];
        if ( child.visible ) ++visibleChildren;    

        if ( this.font ) child.font=this.font;        
    }

    // ---

    var rect=this.rect;
    var totalSpacing=(visibleChildren-1) * this.spacing;
    
    var availableSpace=rect[this.primarySize] - totalSpacing - this.margin[this.primaryLesserMargin] - this.margin[this.primaryGreaterMargin];
    var expandingChilds=0;
        
    for( var i=0; i < this.children.length; ++i ) {
        var child=this.children[i];

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
            var childLayoutSize=child.calcSize( canvas );

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
        
    for( var i=0; i < this.children.length; ++i ) 
    {
        var child=this.children[i];
            
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
                var secondaryCoord=rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin] + ( rect[this.secondarySize] - 
                    this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin] - size[this.secondarySize] ) / 2;

                child.rect[this.primaryCoord]=pos;
                child.rect[this.secondaryCoord]=secondaryCoord;

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
                var secondaryCoord, secondarySize;
                    
                if ( child[this.secondaryLayoutExpanding] === false ) {
                    secondaryCoord=rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin] +  (rect[this.secondarySize] - 
                        this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin] - size[this.secondarySize])/2;
                    secondarySize=size[this.secondarySize];

                } else
                if ( child[this.secondaryLayoutExpanding] ) {
                    secondaryCoord=rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin];
                    secondarySize=rect[this.secondarySize] - this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin];
                }
                    
                child.rect[this.primaryCoord]=pos;
                child.rect[this.secondaryCoord]=secondaryCoord;

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
            var childLayoutSize=child.calcSize( canvas );

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
    };
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
        VG.context.workspace.redrawList.push( currentTime + 1 )//VG.AnimationTick /2 )
    } else {
        if ( this.animationIsRunning )
            VG.context.workspace.redrawList.push( currentTime + VG.AnimationTick )
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

                if ( sItem.label )
                    VG.context.workspace.canvas.drawTextRect( sItem.label, sItem.labelRect, VG.context.style.skin.WidgetTextColor, 2, sItem.labelVAlignment );
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
                    if ( fadeLabel ) canvas.setAlpha( percent / 100.0 );                    
                    canvas.drawTextRect( item.label, item.labelRect, VG.context.style.skin.WidgetTextColor, 2, item.labelVAlignment );                
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

// ----------------------------------------------------------------- VG.UI.SplitLayout

VG.UI.SplitLayout=function()
{
    if ( !(this instanceof VG.UI.SplitLayout) ) return VG.UI.SplitLayout.creator( arguments );        

    VG.UI.Layout.call( this );
    this.name="SplitLayout";
    
    this.minimumSize.set( 200, 200 );

    this.hoverIn=VG.UI.SplitLayout.hoverIn;
    this.hoverOut=VG.UI.SplitLayout.hoverOut;

    this.mouseDown=VG.UI.SplitLayout.mouseDown;
    this.mouseUp=VG.UI.SplitLayout.mouseUp;
    this.mouseMove=VG.UI.SplitLayout.mouseMove;

    this.dragOpStart=VG.Core.Point();

    this.dragOpItemIndex=0;
    this.dragOp=false;

    this.items=[];
    this.spacing=2;

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
}

VG.UI.SplitLayout.prototype.addChild=function( child, percent )
{
    this.children.push( child );
    child.parent=this;

    var item=VG.UI.SplitLayoutItem();

    if ( arguments.length == 2 )
        item.percent=percent;

    this.items.push( item );
};

VG.UI.SplitLayout.prototype.insertChild=function( index, child, percent )
{
    child.parent=this;    
    this.children.splice( index, 0, child );   

    var item=VG.UI.SplitLayoutItem();

    if ( arguments.length == 3 )
        item.percent=percent;

    this.items.splice( index, 0, item );       
};

VG.UI.SplitLayout.prototype.removeChild=function( child )
{
    var index=this.children.indexOf( child );
    if ( index >= 0 ) {
        this.children.splice( index, 1 );
        this.items.splice( index, 1 );
    }
};

VG.UI.SplitLayout.prototype.getChildPercentAt=function( index )
{
    return this.items[index].percent;
};

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

            return true;      
        }
    }
    VG.setMouseCursor( "default" );
    return false;
};

VG.UI.SplitLayout.hoverIn=function()
{
    //console.log( "hoverIn" );
};

VG.UI.SplitLayout.hoverOut=function()
{
    //console.log( "hoverOut" );

    //this.dragOp=0;
};

VG.UI.SplitLayout.mouseMove=function( event )
{
    //console.log( "mouseMove" );

    if ( this.dragOp ) {

        var item=this.items[this.dragOpItemIndex];
        var nextItem=this.items[this.dragOpItemIndex + 1 ];

        var widget=this.children[this.dragOpItemIndex ];
        var nextWidget=this.children[this.dragOpItemIndex + 1];

        var oldItemOffset=item.offset;
        var oldNextItemOffset=nextItem.offset;

        if ( event.pos[this.primaryCoord] > this.dragOpStart[this.primaryCoord] ) 
        {
            // --- User drags to the right / down

            var offset=event.pos[this.primaryCoord] - this.dragOpStart[this.primaryCoord];
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

            var offset=this.dragOpStart[this.primaryCoord] - event.pos[this.primaryCoord];

            var lesserBorder=widget.rect[this.primaryCoord] + this.margin[this.primaryLesserMargin] + widget.minimumSize[this.primarySize];
            if ( event.pos[this.primaryCoord] < lesserBorder ) offset-=lesserBorder - event.pos[this.primaryCoord];

            item.offset=-offset;
            nextItem.offset=+offset;
        }

        if ( ( oldItemOffset != item.offet ) || ( oldNextItemOffset != nextItem.offset ) )
            VG.context.workspace.canvas.update();
    }
};

VG.UI.SplitLayout.mouseDown=function( event )
{
    var widget=this.children[this.dragOpItemIndex];

    if ( event.pos[this.primaryCoord] > ( widget.rect[this.primaryCoord] + widget.rect[this.primarySize] - this.spacing ) ) {

        this.dragOp=true;
        this.dragOpStart.set( event.pos ); 

        VG.context.workspace.mouseTrackerWidget=this;
    }
};

VG.UI.SplitLayout.mouseUp=function( event )
{
    //console.log( "mouseUp" );
    this.dragOp=0;  
    VG.context.workspace.mouseTrackerWidget=0;

    for( var i=0; i < this.items.length; ++i ) {
        var item=this.items[i];

        item.totalOffset+=item.offset;
        item.offset=0;
    }

    VG.update();
};

VG.UI.SplitLayout.prototype.layout=function( canvas )
{
    if ( !this.children.length ) return;

    var rect=this.rect;
    var totalSpacing=(this.items.length-1) * this.spacing;

    var availableSpace=rect[this.primarySize] - totalSpacing - this.margin[this.primaryLesserMargin] - this.margin[this.primaryGreaterMargin];
    var expandingChilds=0;
        
    for( var i=0; i < this.children.length; ++i ) {
        var child=this.children[i];
            
        if ( child.isWidget ) {
            if ( child[this.primaryLayoutExpanding] === false ) {
                availableSpace-=child.calcSize( canvas )[this.primarySize];
            } else ++expandingChilds;
        } else 
        if ( child.isLayout ) {            
            var childLayoutSize=child.calcSize( canvas );
            /*if ( childLayoutSize[this.primarySize] < VG.UI.MaxLayoutSize ) {
                availableSpace-=childLayoutSize[this.primarySize];
            } else*/ ++expandingChilds;
        }
    }

    var expandingChildSpace=availableSpace;    
    var minAdjustmentCorrection=0;
    var pos=rect[this.primaryCoord] + this.margin[this.primaryLesserMargin];

    for( var i=0; i < this.children.length; ++i )
    {
        var child=this.children[i];
        var childRect=VG.Core.Rect();

        if ( child.isWidget )
        {
            // --- The Child is a Widget

            var size=child.calcSize( canvas );

            if ( child[this.primaryLayoutExpanding] === false ) 
            {                
                child.rect[this.primaryCoord]=pos;
                child.rect[this.secondaryCoord]=rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin];

                var secondaryCoord=rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin] + ( rect[this.secondarySize] - 
                    this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin] - size[this.secondarySize] ) / 2;
                
                if ( child[this.secondaryLayoutExpanding] === false ) {
                    child.rect.setSize( size.width, size.height );
                } else
                if ( child[this.secondaryLayoutExpanding] ) {

                    child.rect[this.primarySize]=size[this.primarySize];
                    child.rect[this.secondarySize]=rect[this.secondarySize];
                }

                child.paintWidget( canvas );    
                childRect.set( child.rect );   
            } else
            if ( child[this.primaryLayoutExpanding] ) 
            {
                var secondaryCoord, secondarySize;
                    
                if ( child[this.secondaryLayoutExpanding] === false ) {
                    var size=child.calcSize( canvas );

                    secondaryCoord=rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin] +  (rect[this.secondarySize] - 
                        this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin] - size[this.secondarySize])/2;
                    secondarySize=size[this.secondarySize];
                } else
                if ( child[this.secondaryLayoutExpanding] ) {
                    secondaryCoord=rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin];
                    secondarySize=rect[this.secondarySize] - this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin];
                }
                                
                child.rect[this.primaryCoord]=pos;
                child.rect[this.secondaryCoord]=secondaryCoord;
                child.rect[this.secondarySize]=secondarySize;

                var item=this.items[i];
                var primarySize=(expandingChildSpace*item.percent) / 100.0 - minAdjustmentCorrection;
                if ( primarySize < child.minimumSize[this.primarySize] )
                {
                    // --- Propagate the correction when a minimumSize conflicts with the assigned percentage
                    minAdjustmentCorrection+=child.minimumSize[this.primarySize] - primarySize;
                    primarySize=child.minimumSize[this.primarySize];
                }

                primarySize+=item.offset + item.totalOffset;

                // --- If the next widget is not expanding add the spacing to this expanding one

                if ( i < (this.children.length-1) ) {
                    var nextChild=this.children[i+1];
                    if ( nextChild.isWidget && nextChild[this.primaryLayoutExpanding] === false )
                        primarySize+=this.spacing;
                }

                // ---

                child.rect[this.primarySize]=primarySize;

                child.rect.round();
                child.paintWidget( canvas );    
                childRect.set( child.rect );               
            }
        } else  
        {
            // --- Child is a Layout

            childRect[this.primaryCoord]=pos;
            childRect[this.secondaryCoord]=rect[this.secondaryCoord] + this.margin[this.secondaryLesserMargin];
            childRect[this.secondarySize]=rect[this.secondarySize] - this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin];
                 
            var item=this.items[i];
            var primarySize=(expandingChildSpace*item.percent) / 100.0 - minAdjustmentCorrection;

            if ( primarySize < child.minimumSize[this.primarySize] )
            {
                // --- Propagate the correction when a minimumSize conflicts with the assigned percentage
                minAdjustmentCorrection+=child.minimumSize[this.primarySize] - primarySize;
                primarySize=child.minimumSize[this.primarySize];
            }

            primarySize+=item.offset + item.totalOffset;

            // --- If the next widget is not expanding add the spacing to this expanding one

            if ( i < (this.children.length-1) ) {
                var nextChild=this.children[i+1];
                if ( nextChild.isWidget && nextChild[this.primaryLayoutExpanding] === false )
                    primarySize+=this.spacing;
            }

            childRect[this.primarySize]=primarySize;

            child.rect.set( childRect.round() );
            child.layout( canvas );
        }

        var drawSplitbar=true;

        if ( i < (this.children.length-1) ) {
            var child=this.children[i];
            var item=this.items[i];

            if ( child.isWidget && child[this.primaryLayoutExpanding] === false )
                drawSplitbar=false;

            if ( this.children[i+1].isWidget && this.children[i+1][this.primaryLayoutExpanding] === false )
                drawSplitbar=false;

            if ( drawSplitbar ) {

                VG.context.style.drawSplitHandle( canvas, this, pos, item.rect, childRect, this.dragOp && this.dragOpItemIndex === i );

                item.rect[this.primaryCoord]=pos + childRect[this.primarySize];
                item.rect[this.secondaryCoord]=this.margin[this.secondaryLesserMargin] + rect[this.secondaryCoord];
                item.rect[this.primarySize]=this.spacing;
                item.rect[this.secondarySize]=rect[this.secondarySize] - this.margin[this.secondaryLesserMargin] - this.margin[this.secondaryGreaterMargin];
                item.canDrag=true;
            } else
            {
                item.canDrag=false;
            }
        }

        pos+=childRect[this.primarySize];
        if ( drawSplitbar ) pos+=this.spacing
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

// ----------------------------------------------------------------- VG.UI.LabelLayout

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

    for( var i=0; i < arguments.length; i+=2 )
        this.addChild( arguments[i], arguments[i+1] );        
};

VG.UI.LabelLayout.prototype=VG.UI.Layout();

VG.UI.LabelLayout.Mode={ "WidgetMax" : 0, "Centered" : 1 };

VG.UI.LabelLayout.prototype.calcSize=function( canvas )
{
    var size=VG.Core.Size();
    this.layout( VG.context.workspace.canvas, true );
    size.set( this.minimumSize );

    return size;
};

VG.UI.LabelLayout.prototype.addChild=function( label, widget )
{
    var item=VG.UI.LabelLayoutItem( label, widget );

    this.items.push( item );
    this.children.push( widget );
    widget.parent=this;
};

VG.UI.LabelLayout.prototype.layout=function( canvas, dontDraw )
{
    if ( !this.children.length ) return;

    if ( this.animationIsRunning == true ) {
        this.animate( canvas );
        return;
    }

    var rect=this.rect;
    var rectWidth=rect.width - this.margin.left - this.margin.right;

    var y=rect.y + this.margin.top;
    var sideWidth=(rectWidth - this.labelSpacing) / 2;

    var labelRect=VG.Core.Rect();
    var widgetRect=VG.Core.Rect();
    var minHeight=canvas.getLineHeight();

    this.minimumSize.set( 0, this.margin.top + this.margin.bottom );

    // --- Compute number of visible items

    var visibleItems=0;

    for( var i=0; i < this.children.length; ++i ) {
        var child=this.children[i];
        if ( child.visible ) ++visibleItems;
    }

    // ----

    var totalSpacing=(visibleItems-1) * this.spacing;
    var availableSpace=rect.height - totalSpacing - this.margin.top - this.margin.bottom;
    var expandingChilds=0;

    for( var i=0; i < this.children.length; ++i ) {
        var child=this.children[i];
            
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

    if ( this.mode === VG.UI.LabelLayout.Mode.WidgetMax ) 
    {
        var textSize=VG.Core.Size(); 
        var maxTextWidth=0;

        for( var i=0; i < this.items.length; ++i ) {
            var child=this.items[i];

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

    // ---

    for( var i=0; i < this.items.length; ++i ) {
        var child=this.items[i];
        var widget=child.widget;

        if ( !widget.visible ) continue;

        var widgetSize=child.widget.calcSize( canvas );
        var height;
        var textVAlignment=1;

        if ( widget.verticalExpanding === false )
            height=widgetSize.height; 
        else {

            if ( widget.maximumSize.height === VG.UI.MaxLayoutSize ) 
                height=expandingChildSpace
            else height=widget.maximumSize.height;
            textVAlignment=0;
        }

        if ( height < minHeight )
            height=minHeight;

        labelRect.y=y;
        labelRect.height=height;
        child.labelRect.set( labelRect );
        child.labelVAlignment=textVAlignment;

        labelRect.round();

        if ( arguments.length === 1 ) {
            if ( !this.disabled ) canvas.drawTextRect( child.label, labelRect, VG.context.style.skin.WidgetTextColor, this.labelAlignment, textVAlignment );
            else canvas.drawTextRect( child.label, labelRect, VG.context.style.skin.WidgetDisabledTextColor, this.labelAlignment, textVAlignment );
        }

        widget.rect.x=widgetRect.x;
        widget.rect.y=y;

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

        widget.rect.round();

        if ( arguments.length === 1 )
            child.widget.paintWidget( canvas );

        // --- Minimum Size: Width

        if ( this.margin.left + this.margin.right + this.labelSpacing + labelRect.width + widget.minimumSize.width > this.minimumSize.width )
            this.minimumSize.width=this.margin.left + this.margin.right + this.labelSpacing + labelRect.width + widget.minimumSize.width;

        // ---

        y+=height + this.spacing;
        this.minimumSize.height+=widget.minimumSize.height + this.spacing;
    }
}

// ----------------------------------------------------------------- VG.UI.StackedLayout

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

VG.UI.StackedLayout.prototype.addChild=function( child )
{
    VG.UI.Layout.prototype.addChild.call( this, child );

    if ( !this.current ) this.current=child;
};

VG.UI.StackedLayout.prototype.calcSize=function( canvas )
{
    if ( this.current ) {
        var size=this.current.calcSize( canvas );

        this.minimumSize.set( this.current.minimumSize );
        return size;
    } else {
        var size=VG.Core.Size( 100, 100 );
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

        if ( child === this.current ) child.visible=true;
        else child.visible=false;        
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
