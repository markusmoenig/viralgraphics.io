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

/**Creates a new HtmlWidget widget that can render HTML source text.
 * @param {string} html - The html to display.
 * @constructor
 */

VG.UI.HtmlWidget=function( html )
{
    if ( !(this instanceof VG.UI.HtmlWidget) ) return new VG.UI.HtmlWidget( html );

    VG.UI.Widget.call( this );
    this.name="HtmlWidget";
    this.supportsFocus=true;

    this._html=html ? html : "<html></html>";

    this.workRect=VG.Core.Rect();
    this.workSize=VG.Core.Size();
    this.margin=VG.Core.Margin( 2, 2, 2, 2 );

    this.lastRect=VG.Core.Rect();

    this.dirty=true;
    this.offset=0;
};

VG.UI.HtmlWidget.prototype=VG.UI.Widget();

Object.defineProperty( VG.UI.HtmlWidget.prototype, "html", {
    get: function() {

        return this._html;
    },
    set: function( html ) {
        if ( !html ) html="";

        this._html=html;
        this.dirty=true;
    }
});

VG.UI.HtmlWidget.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.UI.HtmlWidget.prototype.valueFromModel=function( value )
{
    if ( value === null ) this.html="";
    else this.html=value;
};

VG.UI.HtmlWidget.prototype.parseHtml=function()
{
    this.linkElements=[];
    if ( !this.html || !this.html.length ) return;

    this.elements=[];
    var elements=this.elements;
    var currEl;
    var ignoreFirstTopMargin=true;

    parser = VG.sax.parser( false, { lowercase : true } );//, trim : true, normalize : true } );

    var skin=VG.UI.stylePool.current.skin.HtmlWidget;
    var canvas=VG.context.workspace.canvas;
    var size=VG.Core.Size();

    // console.log( "-------------- Parsing " + this._html );

    var rect=VG.Core.Rect( this.contentRect );
    rect.y=this.margin.top;

    var margin=VG.Core.Margin( this.margin.left, this.margin.top, this.margin.right, 0 );
    var contentOffset=VG.Core.Point();

    var self=this;
    function createElement( name, skinObject, parent ) {
        var e={ name : name, skinObject : skinObject };

        e.startXOffset=0;

        var topMargin=skinObject.Margin.top;

        if ( topMargin && ignoreFirstTopMargin ) {
            topMargin=0;

            ignoreFirstTopMargin=false;
        }

        margin.left+=(self.adjustToHeight || self.emptyP) && name === "p" ? 0 : skinObject.Margin.left;
        margin.top+=topMargin;
        margin.right+=skinObject.Margin.right;

        e.rect=VG.Core.Rect( margin.left, rect.y + margin.top, rect.width - margin.left - margin.right, 0 );
        elements.push( e );

        rect.y+=topMargin;

        e.parent=parent;
        e.items=[];

        return e;
    }

    function addItem( el ) {

        var item={};
        item.rect=VG.Core.Rect();

        el.items.push( item );

        return item;
    }


    parser.onopentag = function ( node ) {
        // console.log( 'onopentag', node.name, rect.y, currEl );

        if ( skin[node.name] )
        {
            // --- Element exists in the Skin, create it

            currEl=createElement( node.name, skin[node.name], currEl );

            if ( node.name === "svg" ) {

                let item=addItem( currEl );

                item.svg = VG.Utils.getSVGByName( node.attributes.file );
                if ( item.svg )
                    item.svgGroup = item.svg.getGroupByName( node.attributes.group );

                item.rect.set( margin.left, rect.y + margin.top, rect.width - margin.left - margin.right, 0 );

                item.startXOffset=contentOffset.x;
                item.rect.y+=contentOffset.y;

                if ( currEl.parent.skinObject.Font ) {

                    canvas.pushFont( currEl.parent.skinObject.Font );

                    item.rect.width = Math.floor( canvas.getLineHeight() );
                    item.rect.height = item.rect.width;
                    canvas.popFont();
                } else {
                    item.rect.width = 13;
                    item.rect.height = 13;
                }

                if ( contentOffset.x + item.rect.width > rect.width - margin.left - margin.right )
                {
                    // --- Wordwrap

                    contentOffset.x=item.rect.width;
                    contentOffset.y += item.rect.width;

                    item.rect.y+=item.rect.width;

                    item.startXOffset=0;

                } else contentOffset.x += item.rect.width;

                if ( this.ulMode && this.circleMode ) {
                    item.Circle=true;
                    this.circleMode=false;
                }
            } else
            if ( node.name === "img" ) {

                let item=addItem( currEl );

                item.image = VG.Utils.getImageByName( node.attributes.src );
                item.rect.set( margin.left, rect.y + margin.top, rect.width - margin.left - margin.right, 0 );

                item.startXOffset=contentOffset.x;
                item.rect.y+=contentOffset.y;

                if ( item.image ) {
                    item.rect.width = item.image.width;
                    item.rect.height = item.image.height;
                }
            } else
            if ( node.name === "ul" ) {
                this.ulMode=true;
            }

            if ( node.name === "li" ) {
                if ( this.ulMode )
                    this.circleMode=true;
            }

            if ( skin[node.name].ResetLayout )
                contentOffset.set( 0, 0 );

            if ( skin[node.name].Link ) {
                currEl.href=node.attributes.href;
                self.linkElements.push( currEl );
            }
        }
    };

    parser.ontext = function ( text ) {
        // console.log( 'ontext', text, currEl );

        if ( !text.length || !text.trim().length ) return;

        if ( currEl ) {

            var item=addItem( currEl );
            item.text=text;

            if ( this.ulMode && this.circleMode ) {
                item.Circle=true;
                this.circleMode=false;
            }

            item.rect.set( margin.left, rect.y + margin.top, rect.width - margin.left - margin.right, 0 );
            item.rect.height=0;

            item.startXOffset=contentOffset.x;
            item.rect.y+=contentOffset.y;

            item.textLines=[];

            if ( rect.width > 5 ) {
                canvas.pushFont( currEl.skinObject.Font );
                var rc=canvas.wordWrap( text, contentOffset.x, item.rect.width, item.textLines );

                // --- Force a new line by adding an empty element to the front of the text
                if ( rc.forceStartNewLine ) item.textLines.unshift( "" );

                item.rect.height = canvas.getLineHeight() * item.textLines.length;
                // currEl.rect.height += item.rect.height;

                contentOffset.x=rc.nextStart;

                if ( item.textLines.length > 1 ) {
                    contentOffset.y += item.rect.height - canvas.getLineHeight();
                }

                //console.log( rc, item.textLines, contentOffset.y );

                canvas.popFont();
            }
        }
    };

    parser.onclosetag = function (name) {
        // console.log( 'onclosetag', name, rect.y, currEl.rect.height, currEl.skinObject.Margin.bottom, currEl );

        if ( currEl ) {

            margin.left-=(self.adjustToHeight || self.emptyP) && name === "p" ? 0 : currEl.skinObject.Margin.left;

            // margin.left-=currEl.skinObject.Margin.left;
            margin.top-=currEl.skinObject.Margin.top;
            margin.right-=currEl.skinObject.Margin.right;

            if ( currEl.skinObject.Margin.left ) {
                // rect.y+=currEl.rect.height + currEl.skinObject.Margin.bottom;

                var low=0;
                for ( var i=0; i < currEl.items.length; ++i )
                {
                    var item=currEl.items[i];
                    if( item.rect.bottom() > low ) low = item.rect.bottom();
                }
                if ( low ) {
                    var elHeight = low - rect.y;
                    rect.y += elHeight;
                    currEl.rect.height = elHeight;
                }
                rect.y += currEl.skinObject.Margin.bottom;
            }

            if ( currEl.skinObject.LineFeed ) {
                contentOffset.set( 0, 0 );
            }

            if ( name === "ul" )
                this.ulMode=false;

            currEl=currEl.parent;
        }
    };

    parser.onerror = function (e) {
        // an error happened.
        // console.log( "error", e );
    };

    try {
        parser.write( this._html ).close();
    } catch( e ) {
        // console.log( "error", e );
    }

    // ---- Debug elements

    for ( i=0; i < elements.length; ++i )
    {
        // console.log( elements[i] );
    }

    this.totalHeight = rect.y - this.margin.top;

    if ( this.adjustToHeight ) {
        this.maximumSize.height = this.totalHeight ? this.totalHeight : 20;
        this.minimumSize.height = this.totalHeight ? this.totalHeight : 20;
    }

    this.dirty=false;
    this.lastRect.copy( this.rect );

    if ( !this.adjustToHeight ) {
        this.needsVScrollbar=this.totalHeight > this.contentRect.height;

        if ( this.needsVScrollbar && !this.vScrollbar ) {
            this.vScrollbar=VG.UI.ScrollBar( "HtmlWidget Scrollbar" );
            this.vScrollbar.callbackObject=this;
        }

        if ( !this.needsVScrollbar ) this.offset=0;
    }
};

VG.UI.HtmlWidget.prototype.focusIn=function()
{

};

VG.UI.HtmlWidget.prototype.focusOut=function()
{

};

VG.UI.HtmlWidget.prototype.vHandleMoved=function( offsetInScrollbarSpace )
{
    this.offset = offsetInScrollbarSpace * this.vScrollbar.totalSize / this.vScrollbar.visibleSize;
};

VG.UI.HtmlWidget.prototype.mouseMove=function( event )
{
    this.hrefUnderMouse=undefined;
    var rect=this.workRect;
    var size=this.workSize;
    var canvas=VG.context.workspace.canvas;

    for ( i=0; i < this.linkElements.length; ++i ) {
        var el=this.linkElements[i];

        for ( e=0; e < el.items.length; ++e ) {
            var item=el.items[e];

            if ( item.textLines )
            {
                canvas.pushFont( el.skinObject.Font );

                rect.copy( item.rect );
                rect.x+=this.rect.x + item.startXOffset; rect.y+=this.rect.y;
                rect.height=canvas.getLineHeight();

                for ( j=0; j < item.textLines.length; ++j )
                {
                    rect.width=canvas.getTextSize( item.textLines[j], size ).width;

                    if ( rect.contains( event.pos ) ) {
                        this.hrefUnderMouse=el.href;
                        canvas.popFont();
                        VG.update();
                        return;
                    }

                    rect.y+=canvas.getLineHeight();
                    if ( !j ) rect.x-=item.startXOffset;
                }

                canvas.popFont();
            }
        }
    }
};

VG.UI.HtmlWidget.prototype.mouseDown=function( event )
{
    if ( this.needsVScrollbar && this.vScrollbar && this.vScrollbar.rect.contains( event.pos ) ) {
        this.vScrollbar.mouseDown( event );
        return;
    }

    if ( this.hrefUnderMouse && this.linkCallback ) this.linkCallback( this.hrefUnderMouse );

    this.mouseIsDown=true;
};

VG.UI.HtmlWidget.prototype.mouseUp=function( event )
{
    this.mouseIsDown=false;
};

VG.UI.HtmlWidget.prototype.mouseWheel=function( step )
{
    if ( !this.needsVScrollbar ) return;

    if ( step === 0 ) step=this.lastStep;

    if ( step > 0 ) {
        this.offset=Math.max( this.offset - 20, 0);
    } else {
        this.offset+=20;
    }

    if ( step ) this.lastStep=step;

    this.vScrollbar.scrollTo( this.offset );
};

VG.UI.HtmlWidget.prototype.mouseLeave=function( step )
{
    VG.setMouseCursor("default");
};

VG.UI.HtmlWidget.prototype.setVScrollbarDimensions=function( canvas )
{
    this.vScrollbar.rect=VG.Core.Rect( this.contentRect.right() + 2, this.contentRect.y, VG.UI.stylePool.current.skin.ScrollBar.Size, this.contentRect.height );
    this.vScrollbar.setScrollBarContentSize( this.totalItemHeight, this.contentRect.height );
};

VG.UI.HtmlWidget.prototype.paintWidget=function( canvas )
{
    var skin=VG.UI.stylePool.current.skin;
    var cRect=this.contentRect;

    cRect.copy( this.rect );
    cRect.width-=skin.ScrollBar.Size;

    if ( !this.lastRect.equals( this.rect ) ) this.dirty=true;
    if ( this.dirty ) this.parseHtml();

    canvas.pushClipRect( this.rect );

    var elements=this.elements;
    if ( !elements ) return;
    for( i=0; i < elements.length; ++i )
    {
        var el=elements[i];

        for ( e=0; e < el.items.length; ++e )
        {
            var item=el.items[e];

            // --- Debug
/*
            cRect.copy( item.rect );
            cRect.x+=this.rect.x; cRect.y+=this.rect.y;
            cRect.y-=this.offset;

            canvas.setAlpha( 0.2 );
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, cRect, VG.Core.Color.White );
            canvas.setAlpha( 1.0 );
*/
            // ---

            cRect.copy( item.rect );
            cRect.x+=this.rect.x + item.startXOffset; cRect.y+=this.rect.y;
            cRect.y-=this.offset;

            if ( cRect.y > this.rect.bottom() || cRect.bottom() < this.rect.y ) continue;

            if ( item.textLines ) {

                canvas.pushFont( el.skinObject.Font );

                for ( j=0; j < item.textLines.length; ++j )
                {
                    if ( j === 0 && item.Circle )
                    {
                        this.workRect.copy( cRect );

                        let size=el.skinObject.Font.size * 0.6;

                        this.workRect.x -= 2 * size;
                        this.workRect.y = cRect.y + (el.skinObject.Font.size-size);
                        this.workRect.width=size;
                        this.workRect.height=size;

                        canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.workRect, skin.HtmlWidget.p.Color );
                    }

                    canvas.drawTextRect( item.textLines[j], cRect, el.skinObject.Color, 0, 0 );

                    if ( el.href && el.href === this.hrefUnderMouse )
                    {
                        // --- Mouse is over this link, underline

                        var workRect=this.workRect;

                        workRect.x=cRect.x;
                        workRect.y=cRect.y + el.skinObject.Font.size + 2;
                        workRect.width=canvas.getTextSize( item.textLines[j], this.workSize ).width;
                        workRect.height=1;

                        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, workRect, el.skinObject.Color );
                    }

                    cRect.y+=canvas.getLineHeight();
                    if ( !j ) cRect.x-=item.startXOffset;
                }

                canvas.popFont();
            } else
            if ( item.svg ) {
                canvas.drawSVG( item.svg, item.svgGroup, cRect, el.skinObject.Color );
            } else
            if ( item.image ) {
                canvas.drawImage( cRect, item.image );
            }
        }
    }

    canvas.popClipRect();

    // VG.log( this.totalHeight, total );
    // this.totalHeight=total;

    cRect.copy( this.rect );

    if ( this.needsVScrollbar ) {
        this.vScrollbar.rect=VG.Core.Rect( cRect.right() - skin.ScrollBar.Size, cRect.y, skin.ScrollBar.Size, cRect.height );

        // this.totalItemHeight == Total height of all Items in the list widget including spacing
        // visibleHeight == Total height of all currently visible items
        // this.contentRect.height == Height of the available area for the list items

        this.vScrollbar.setScrollBarContentSize( this.totalHeight, this.rect.height );
        this.vScrollbar.paintWidget( canvas );
    }
};
