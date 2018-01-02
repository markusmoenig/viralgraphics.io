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

// ----------------------------------------------------------------- VG.UI.NewsScrollerItem

VG.UI.ScrollerImageItem=function( image )
{
    if ( !(this instanceof VG.UI.ScrollerImageItem) ) return new VG.UI.ScrollerImageItem( image );

    this.rect = new VG.Core.Rect();
    this.contentRect = new VG.Core.Rect();
    this.image=image;
};

VG.UI.ScrollerImageItem.prototype.paintWidget=function( canvas )
{
    if ( this.image.isValid() ) {

        let rect1=this.contentRect;
        rect1.copy( this.rect );

        if ( this.image.width < this.rect.width )
            rect1.x=this.rect.x + (this.rect.width - this.image.width)/2;

        if ( this.image.height < this.rect.height )
            rect1.y=this.rect.y + (this.rect.height - this.image.height)/2;

        canvas.drawImage( rect1, this.image );
    }
};

// ----------------------------------------------------------------- VG.UI.Scroller

VG.UI.Scroller=function()
{
    if ( !(this instanceof VG.UI.Scroller) ) return new VG.UI.Scroller();

    VG.UI.Widget.call( this );
    this.name="Scroller";

    this.supportsFocus=true;
    this.supportsAutoFocus=true;

    this.items=[];
    this.current=null;
    this.currentIndex=0;

    this.nextAnimationEventAt=0;

    this.animStartTime=-1;
    this.animDuration=600;
    this.animDirectionLeft=true;
    this.animPeriod=8000;

    this.circleColor=VG.Core.Color( 255, 255, 255 );
    this.titleColor=VG.Core.Color( 255, 255, 255 );
    this.titleFont=VG.Font.Font( "Open Sans Bold", 20 );
    this.blurbBackColor=VG.Core.Color();
    this.blurbBackColor.a=0.6;
    this.htmlFont=VG.Font.Font( "Open Sans Semibold", 8 );

    this.blurbAlpha=0;
};

VG.UI.Scroller.prototype=VG.UI.Widget();

VG.UI.Scroller.prototype.addItem=function( item )
{
    this.items.push( item );
    item._circleRect=VG.Core.Rect();
    if ( !this.current ) this.current=item;
};

VG.UI.Scroller.prototype.scrollLeft=function( canvas )
{
    this.nextAnimationEventAt = new Date().getTime();
    this.animDirectionLeft = true;
    VG.update();
};

VG.UI.Scroller.prototype.scrollRight=function( canvas )
{
    this.nextAnimationEventAt = new Date().getTime();
    this.animDirectionLeft = false;
    VG.update();
};

VG.UI.Scroller.prototype.paintWidget=function( canvas )
{
    if ( !this.current ) return;

    // --- Period Handling

    if ( this.items.length > 1 ) {
        let time = new Date().getTime();

        if ( this.nextAnimationEventAt === 0 )
        {
            this.nextAnimationEventAt=time + this.animPeriod;
            VG.context.workspace.redrawList.push( this.nextAnimationEventAt );
        } else {

            if ( time > this.nextAnimationEventAt )
            {
                // --- Inside Scroll Event

                if ( !this.animActive ) this.animStartTime=time;

                if ( ( time - this.animStartTime ) <= this.animDuration )
                {
                    this.animActive=true;
                    this.animOffset=time - this.animStartTime;

                    this.nextAnimationEventAt=time + 1;
                    VG.context.workspace.redrawList.push( this.nextAnimationEventAt );
                } else
                {
                    this.animActive=false;
                    this.animOffset=0;

                    this.currentIndex++;
                    if ( this.currentIndex >= this.items.length )
                    this.currentIndex=0;

                    this.animDirectionLeft=true;
                    this.nextAnimationEventAt=time + this.animPeriod;
                    VG.context.workspace.redrawList.push( this.nextAnimationEventAt );
                }
            }
        }
    }

    // --- Draw the item (normal + animated)

    this.current=this.items[this.currentIndex];

    let rect=this.contentRect;
    rect.copy( this.rect );

    if ( this.animActive ) {
        this.animPixelOffset = this.animOffset * this.contentRect.width / this.animDuration;

        rect.x -= this.animDirectionLeft ? this.animPixelOffset : -this.animPixelOffset;

        this.current.rect.copy( rect );
        this.current.paintWidget( canvas );

        let nextIndex;
        if ( this.animDirectionLeft ) {
            nextIndex = this.currentIndex + 1;
            if ( nextIndex >= this.items.length ) nextIndex = 0;
        } else {
            nextIndex = this.currentIndex - 1;
            if ( nextIndex < 0 ) nextIndex = this.items.length - 1;
        }
        let nextItem=this.items[nextIndex];

        rect.copy( this.rect );

        if ( this.animDirectionLeft ) rect.x = this.rect.right() - this.animPixelOffset;
        else rect.x -= this.contentRect.width - this.animPixelOffset;

        nextItem.rect.copy( rect );
        nextItem.paintWidget( canvas );
    } else {
        this.current.rect.copy( rect );
        this.current.paintWidget( canvas );

        // --- Draw the Circles

        if ( this.items.length > 1 ) {
            // let xOff = this.rect.right() - 13 - this.items.length * 10 - (this.items.length-1) * 6;
            let xOff = this.rect.x + ( this.rect.width - this.items.length * 10 - (this.items.length-1) * 6) / 2;
            for ( let i=0; i < this.items.length; ++i )
            {
                rect.copy( this.rect );
                rect.x = xOff; rect.y = rect.bottom() - 28;

                if ( this.currentIndex === i ) {
                    rect.width = 10; rect.height = 10;
                    this.circleColor.a = 1.0;
                }
                else {
                    rect.width = 6; rect.height = 6;
                    rect.y += 2;
                    this.circleColor.a = 0.5;
                }

                canvas.draw2DShapeGL( VG.Canvas.Shape2D.Circle, rect, this.circleColor );
                this.items[i]._circleRect.copy( rect );

                xOff += 10 + 6;
            }
        }
    }
};
