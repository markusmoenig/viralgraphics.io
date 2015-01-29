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
 * You should have received a copy of the GNU General Public License
 * along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

// ----------------------------------------------------------------- VG.UI.NewsScrollerItem

VG.UI.NewsScrollerItem=function( header, body, image, date, link )
{    
    if ( !(this instanceof VG.UI.NewsScrollerItem) ) return new VG.UI.NewsScrollerItem( header, body, image, link );

    this.header=header;
    this.body=body;
    this.image=image;
    this.date=date;
    this.link=link;
    this.visible=false;

    this.rect=VG.Core.Rect();
};

// ----------------------------------------------------------------- VG.UI.NewsScroller

VG.UI.NewsScroller=function()
{
    if ( !(this instanceof VG.UI.NewsScroller) ) return new VG.UI.NewsScroller();
    
    VG.UI.Widget.call( this );
    this.name="NewsScroller";

    this.minimumSize.set( 100, 100 );
    this.supportsFocus=true;
    this.supportsAutoFocus=true;

    this.items=[];
    this.currentIndex=0;

    this.nextAnimationEventAt=0;

    this.leftImage=VG.UI.Image();
    this.leftImage.clicked=function() {
        //if ( !this.animActive )
        //    this.nextAnimationEventAt=new Date().getTime();
        if ( this.currentPage > 0 ) this.currentPage-=1;
        else this.currentPage=this.totalPages-1;
    }.bind( this );

    this.rightImage=VG.UI.Image();
    this.rightImage.clicked=function() {
        //if ( !this.animActive ) {
        //    this.nextAnimationEventAt=new Date().getTime();
        //    this.animDirectionLeft=false;
        //}
        if ( this.currentPage < ( this.totalPages -1 ) ) this.currentPage+=1;
        else this.currentPage=0;
    }.bind( this );    

    this.animStartTime=-1;
    this.animDuration=600;
    this.animDirectionLeft=true;
    this.animPeriod=8000;

    this.childWidgets=[];
    this.childWidgets.push( this.leftImage );    
    this.childWidgets.push( this.rightImage );   

    this.linkedItem=false;
    this.visibleItems=3;
    this.currentPage=0;
    this.totalPages=1;
};

VG.UI.NewsScroller.prototype=VG.UI.Widget();

VG.UI.NewsScroller.prototype.addItem=function( header, body, image, date, link )
{
    var item=new VG.UI.NewsScrollerItem( header, body, image, date, link );
    this.items.push( item );

    this.totalPages=Math.floor(this.items.length / this.visibleItems) + 1;
};

VG.UI.NewsScroller.prototype.calcSize=function()
{
    return VG.Core.Size( 100, 100 );
};

VG.UI.NewsScroller.prototype.mouseDown=function( event )
{
    if ( this.linkedItem ) VG.gotoWebLink( this.linkedItem.link );
};

VG.UI.NewsScroller.prototype.mouseMove=function( event )
{
    this.linkedItem=null;
    for ( var i=0; i < this.items.length; ++i )
    {
        var item=this.items[i];

        if ( item.link && item.visible && item.rect.contains( event.pos ) ) {
            this.linkedItem=item;
            VG.setMouseCursor("pointer");
            break;
        }
    }
    VG.update();
};

VG.UI.NewsScroller.prototype.paintWidget=function( canvas )
{
    // --- Draw Background (Custom Image Background and Background Color)

    if ( this.backgroundImageName ) {
        var image=VG.context.imagePool.getImageByName( this.backgroundImageName );
        if ( image ) {
            canvas.drawImage( VG.Core.Point( this.rect.x + ( this.rect.width - image.width) / 2, this.rect.y + ( this.rect.height - image.height ) / 2 ), image );
        }
    }
    
    if ( !this.backgroundColor ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, canvas.style.skin.NewsScroller.BackgroundColor );
    else canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, this.backgroundColor );

    // --- Draw the Header

    canvas.pushFont( canvas.style.skin.NewsScroller.Header.Font );

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( this.rect.x, this.rect.y + canvas.style.skin.NewsScroller.Header.Height, 
        this.rect.width, 1 ), canvas.style.skin.NewsScroller.Header.SeparatorColor );

    canvas.drawTextRect( "News", VG.Core.Rect( this.rect.x + canvas.style.skin.NewsScroller.Margin.left, this.rect.y, 
        this.rect.width, canvas.style.skin.NewsScroller.Header.Height ), canvas.style.skin.NewsScroller.Header.TextColor, 0, 1 );

    canvas.popFont();

    var imageDim=28;

    if ( !this.leftImage.isValid() ) {
        var image=VG.context.imagePool.getImageByName( "scroller_left.png" );
        if ( image ) { 
            this.leftImage.image.set( image ); this.leftImage.image.mul( VG.Core.Color( "#cbcfe0" ) ); 
            this.leftImage.clickedImage=VG.Core.Image(); this.leftImage.clickedImage.set( image ); this.leftImage.clickedImage.mul( VG.Core.Color( "#8b8def" ) );             
            this.leftImage.hoverImage=VG.Core.Image(); this.leftImage.hoverImage.set( image ); this.leftImage.hoverImage.mul( VG.Core.Color( "#7a7aa9" ) );             
        }
    }

    if ( !this.rightImage.isValid() ) {
        var image=VG.context.imagePool.getImageByName( "scroller_right.png" );
        if ( image ) { this.rightImage.image.set( image ); this.rightImage.image.mul( VG.Core.Color( "#cbcfe0" ) ); }
        this.rightImage.clickedImage=VG.Core.Image(); this.rightImage.clickedImage.set( image ); this.rightImage.clickedImage.mul( VG.Core.Color( "#8b8def" ) );             
        this.rightImage.hoverImage=VG.Core.Image(); this.rightImage.hoverImage.set( image ); this.rightImage.hoverImage.mul( VG.Core.Color( "#7a7aa9" ) );             
    }

    if ( this.leftImage.isValid() ) {
        this.leftImage.rect.set( this.rect.x + canvas.style.skin.NewsScroller.Margin.left + 105, this.rect.y + 26, this.leftImage.image.width, this.leftImage.image.height );
        this.leftImage.paintWidget( canvas );
    }    

    if ( this.rightImage.isValid() ) {
        this.rightImage.rect.set( this.rect.x + canvas.style.skin.NewsScroller.Margin.left + 140, this.rect.y + 26, this.rightImage.image.width, this.rightImage.image.height );
        this.rightImage.paintWidget( canvas );
    } 

    // ---

    var imageRect=VG.Core.Rect();
    var textRect=VG.Core.Rect();

    var offset=0; this.spacing=20;
    var x=this.rect.x + canvas.style.skin.NewsScroller.Margin.left;
    var y=this.rect.y + canvas.style.skin.NewsScroller.Header.Height + canvas.style.skin.NewsScroller.Body.Margin.top;
    var maxTextWidth=this.rect.width - (canvas.style.skin.NewsScroller.Margin.left + canvas.style.skin.NewsScroller.Body.Item.ImageSize.width 
        + this.spacing - canvas.style.skin.NewsScroller.Margin.right);

    for ( var i=0; i < this.items.length; ++i ) this.items[i].visible=false;

    var itemCounter=0;
    for ( var i=this.currentPage * this.visibleItems; i < this.items.length; ++i )
    {
        itemCounter++;
        if ( itemCounter === this.visibleItems + 1 ) break;

        var item=this.items[i];
        item.visible=true;

        // --- Item Image
        imageRect.set( x, y, canvas.style.skin.NewsScroller.Body.Item.ImageSize.width, canvas.style.skin.NewsScroller.Body.Item.ImageSize.height );
        item.rect.set( imageRect ); 
        var largestTextWidth=0;

        if ( !item.image ) {
            canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, imageRect, VG.Core.Color( "#5c6a97") );//, VG.Core.Color("#7182bc") );//VG.Core.Color( "#40465b")  
            canvas.pushFont( VG.Font.Font( "Visual Graphics", 64 ) );
            canvas.drawTextRect( "a", imageRect, VG.Core.Color( 248, 248, 248 ), 1, 1 );
            canvas.popFont();
        } else
        {
            canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, imageRect, VG.Core.Color( "#5c6a97") );//, VG.Core.Color("#7182bc") );//VG.Core.Color( "#40465b")  

            var image=VG.Utils.getImageByName( item.image );
            if ( image )
                canvas.drawImage( VG.Core.Point( imageRect.x + (imageRect.width - image.width)/2, imageRect.y + (imageRect.height - image.height)/2 ), image );
        }

        // --- Item Header
        canvas.pushFont( canvas.style.skin.NewsScroller.Body.Item.Header.Font );

        textRect.set( x + canvas.style.skin.NewsScroller.Body.Item.ImageSize.width + 20, y, maxTextWidth, canvas.style.skin.NewsScroller.Body.Item.ImageSize.height );
        var textWidth=canvas.drawTextRect( item.header, textRect, canvas.style.skin.NewsScroller.Body.Item.Header.TextColor, 0, 3 );
        if ( textWidth > largestTextWidth ) largestTextWidth=textWidth;

        // --- This item has hover, underline the header
        if ( item === this.linkedItem ) {
            textRect.set( imageRect.right() + 20, textRect.y + 17, textWidth, 2 );
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, textRect, canvas.style.skin.NewsScroller.Body.Item.Header.TextColor );
        }

        canvas.popFont();

        // --- Item Body
        canvas.pushFont( canvas.style.skin.NewsScroller.Body.Item.Body.Font );

        var textY=y + 32;
        var textArray=item.body.split(/\r\n|\r|\n/);
        textRect.set( x + canvas.style.skin.NewsScroller.Body.Item.ImageSize.width + 20, textY, maxTextWidth, canvas.style.skin.NewsScroller.Body.Item.ImageSize.height-35 );

        for ( var l=0; l < textArray.length; ++l )
        {
            textWidth=canvas.drawTextRect( textArray[l], textRect, canvas.style.skin.NewsScroller.Body.Item.Body.TextColor, 0, 3 );
            if ( textWidth > largestTextWidth ) largestTextWidth=textWidth;

            textRect.y+=canvas.getLineHeight();
            textRect.height-=canvas.getLineHeight();
        }

        canvas.popFont();        

        // --- Item Date
        if ( item.date && item.date.length )
        {
            canvas.pushFont( canvas.style.skin.NewsScroller.Body.Item.Date.Font );

            textRect.set( x + canvas.style.skin.NewsScroller.Body.Item.ImageSize.width + 20, y+3, 625, canvas.style.skin.NewsScroller.Body.Item.ImageSize.height );
            canvas.drawTextRect( item.date, textRect, canvas.style.skin.NewsScroller.Body.Item.Date.TextColor, 0, 2 );

            canvas.popFont();            
        }

        item.rect.width=canvas.style.skin.NewsScroller.Body.Item.ImageSize.width + 20 + largestTextWidth;

        y+=canvas.style.skin.NewsScroller.Body.Item.ImageSize.height + canvas.style.skin.NewsScroller.Body.Spacing;
    }

    // --- Footer
    canvas.pushFont( canvas.style.skin.NewsScroller.Body.Item.Date.Font );

    y=this.rect.y + canvas.style.skin.NewsScroller.Header.Height + canvas.style.skin.NewsScroller.Body.Margin.top + 
        this.visibleItems * canvas.style.skin.NewsScroller.Body.Item.ImageSize.height +
        (this.visibleItems-1) * + canvas.style.skin.NewsScroller.Body.Spacing + 30;

    textRect.set( x, y, 615, canvas.style.skin.NewsScroller.Body.Item.ImageSize.height );
    for ( var i=0; i < this.totalPages; i++ )
    {
        if ( i === this.currentPage )
            canvas.drawTextRect( String(i+1), textRect, canvas.style.skin.NewsScroller.Body.Item.Footer.ActiveTextColor, 0, 3 );
        else
            canvas.drawTextRect( String(i+1), textRect, canvas.style.skin.NewsScroller.Body.Item.Footer.TextColor, 0, 3 );

        textRect.x+=12;        
    }
    canvas.popFont();
}

// ----------------------------------------------------------------- VG.UI.TreeWidget

VG.UI.ScrollerItem=function( header, content )
{    
    if ( !(this instanceof VG.UI.ScrollerItem) ) return new VG.UI.ScrollerItem( header, content );

    this.header=header;
    this.content=content;
};

VG.UI.Scroller=function()
{
    if ( !(this instanceof VG.UI.Scroller) ) return new VG.UI.Scroller();
    
    VG.UI.Widget.call( this );
    this.name="Scroller";

    this.minimumSize.set( 100, 100 );
    this.supportsFocus=true;

    this.items=[];
    this.currentIndex=0;

    this.nextAnimationEventAt=0;

    this.leftImage=VG.UI.Image();
    this.leftImage.clicked=function() {
        if ( !this.animActive )
            this.nextAnimationEventAt=new Date().getTime();
    }.bind( this );

    this.rightImage=VG.UI.Image();
    this.rightImage.clicked=function() {
        if ( !this.animActive ) {
            this.nextAnimationEventAt=new Date().getTime();
            this.animDirectionLeft=false;
        }
    }.bind( this );    

    this.animStartTime=-1;
    this.animDuration=600;
    this.animDirectionLeft=true;
    this.animPeriod=8000;

    this.childWidgets=[];
    this.childWidgets.push( this.leftImage );    
    this.childWidgets.push( this.rightImage );    
};

VG.UI.Scroller.prototype=VG.UI.Widget();

VG.UI.Scroller.prototype.calcSize=function()
{
    return VG.Core.Size( 100, 100 );
};

VG.UI.Scroller.prototype.addItem=function( header, content )
{
    var item=new VG.UI.ScrollerItem( header, content );
    this.items.push( item );
};

VG.UI.Scroller.prototype.paintWidget=function( canvas )
{
    // --- Draw Background (Custom Image Background and Background Color)

    if ( this.backgroundImageName ) {
        var image=VG.context.imagePool.getImageByName( this.backgroundImageName );
        if ( image ) {
            canvas.drawImage( VG.Core.Point( this.rect.x + ( this.rect.width - image.width) / 2, this.rect.y + ( this.rect.height - image.height ) / 2 ), image );
        }
    }

    if ( !this.backgroundColor ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, canvas.style.skin.ScrollerBackgroundColor );
    else canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, this.backgroundColor );

    // ---

    var headerTextColor;
    if ( !this.headerTextColor ) headerTextColor=canvas.style.skin.ScrollerHeaderTextColor;
    else headerTextColor=this.headerTextColor;

    var imageDim=28;

    // --- Left / Right Images

    if ( !this.leftImage.isValid() ) {
        var image=VG.context.imagePool.getImageByName( "scroller_left.png" );
        if ( image ) {
            this.leftImage.image.set( image ); this.leftImage.image.mul( VG.Core.Color( "#cecece" ) ); 
            this.leftImage.clickedImage=VG.Core.Image(); this.leftImage.clickedImage.set( image ); this.leftImage.clickedImage.mul( VG.Core.Color( "#8b8def" ) );             
            this.leftImage.hoverImage=VG.Core.Image(); this.leftImage.hoverImage.set( image ); this.leftImage.hoverImage.mul( VG.Core.Color( "#7a7aa9" ) );                  
        }
    }

    if ( !this.rightImage.isValid() ) {
        var image=VG.context.imagePool.getImageByName( "scroller_right.png" );
        if ( image ) {
            this.rightImage.image.set( image ); this.rightImage.image.mul( VG.Core.Color( "#cecece" ) ); 
            this.rightImage.clickedImage=VG.Core.Image(); this.rightImage.clickedImage.set( image ); this.rightImage.clickedImage.mul( VG.Core.Color( "#8b8def" ) );             
            this.rightImage.hoverImage=VG.Core.Image(); this.rightImage.hoverImage.set( image ); this.rightImage.hoverImage.mul( VG.Core.Color( "#7a7aa9" ) );  
        }
    } 

    if ( this.leftImage.isValid() ) {
        this.leftImage.rect.set( this.rect.x + 44, this.rect.y + 34, imageDim, imageDim );
        this.leftImage.paintWidget( canvas );
    }    

    if ( this.rightImage.isValid() ) {
        this.rightImage.rect.set( this.rect.right() - 44 - imageDim, this.rect.y + 34, imageDim, imageDim );
        this.rightImage.paintWidget( canvas );
    } 

    if ( !this.items.length ) return;

    // --- Period Handling

    if ( this.items.length > 1 ) {
        var time=new Date().getTime();
        
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
                    this.animDirectionLeft=true;

                    this.currentIndex++;
                    if ( this.currentIndex >= this.items.length )
                    this.currentIndex=0;

                    this.nextAnimationEventAt=time + this.animPeriod;
                    VG.context.workspace.redrawList.push( this.nextAnimationEventAt );                    
                }
            }            
        }
    }

    // --- Draw the item (normal + animated)

    var item=this.items[this.currentIndex];

    if ( typeof(item.content) === 'string' )
    {
        var font=VG.context.style.skin.ScrollerTextItemHeaderFont;
        canvas.pushFont( font ); 

        this.contentRect.set( this.rect.x + 44 + imageDim + 50, this.rect.y + 34 + imageDim - canvas.getLineHeight() - font.triFont.descender * font.scale, 0, this.rect.height );
        this.contentRect.width=this.rect.width - this.contentRect.x - 44 - imageDim - 10;

        var nextItem, buffer;

        if ( this.animActive )
        {
            canvas.setClipRect( this.contentRect.add( -40, 0, 40, 0 ) );
            this.animPixelOffset=this.animOffset * this.contentRect.width / this.animDuration;

            if ( this.animDirectionLeft ) this.contentRect.x-=this.animPixelOffset;
            else this.contentRect.x+=this.animPixelOffset;

            var nextIndex=this.currentIndex + 1;
            if ( nextIndex >= this.items.length ) nextIndex=0;
            nextItem=this.items[nextIndex];
        } 

        this.contentRect.height=canvas.getLineHeight();

        canvas.drawTextRect( item.header, this.contentRect, headerTextColor, 0, 0 );
        if ( this.animActive ) {
            buffer=this.contentRect.x; 
            if ( this.animDirectionLeft ) this.contentRect.x+=this.contentRect.width;
            else this.contentRect.x=buffer - this.contentRect.width;
            canvas.drawTextRect( nextItem.header, this.contentRect, headerTextColor, 0, 0 );
            this.contentRect.x=buffer;
        }

        canvas.popFont();

        canvas.pushFont( VG.context.style.skin.ScrollerTextItemContentFont );

        this.contentRect.y+=this.contentRect.height + 10;
        this.contentRect.height=this.rect.height - (this.rect.y - this.contentRect.y);

        var textArray=item.content.split(/\r\n|\r|\n/);
        var nextTextArray;

        if ( this.animActive ) nextTextArray=nextItem.content.split(/\r\n|\r|\n/);

        for( var i=0; i < textArray.length; ++i )
        {
            canvas.drawTextRect( textArray[i], this.contentRect, headerTextColor, 0, 0 );
            if ( this.animActive ) {
                buffer=this.contentRect.x;
                if ( this.animDirectionLeft ) this.contentRect.x+=this.contentRect.width;
                else this.contentRect.x=buffer - this.contentRect.width;               
                canvas.drawTextRect( nextTextArray[i], this.contentRect, headerTextColor, 0, 0 );
                this.contentRect.x=buffer;
            }

            this.contentRect.y+=canvas.getLineHeight();
        }

        canvas.popFont();
    } else
    if ( item.content instanceof VG.Core.Image )
    {
        var font=VG.context.style.skin.ScrollerImageItemHeaderFont;
        canvas.pushFont( font ); 

        this.contentRect.set( this.rect.x + 44 + imageDim, this.rect.y + 34 + imageDim - canvas.getLineHeight() - font.triFont.descender * font.scale, 0, 0 );
        this.contentRect.width=this.rect.width - this.contentRect.x - 44 - imageDim;
        this.contentRect.height=canvas.getLineHeight();

        canvas.drawTextRect( item.header, this.contentRect, headerTextColor, 1, 0 );

        this.contentRect.y+=this.contentRect.height + 50;
        this.contentRect.height=this.rect.height - (this.rect.y - this.contentRect.y);
        canvas.popFont();

        canvas.drawImage( this.contentRect.pos(), item.content );
    }

    canvas.setClipRect();    
};