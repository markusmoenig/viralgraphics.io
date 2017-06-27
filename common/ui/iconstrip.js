
// ----------------------------------------------------------------- VG.UI.IconStrip

IconStrip=function()
{
    /** IconStrip
    **/

    if ( !(this instanceof IconStrip) ) return new IconStrip();

    VG.UI.Widget.call( this );
    this.name="IconStrip";

    this.offset=0;

    this.minimumSize.set( 100, 100 );
    this.supportsFocus=true;

    this.vScrollbar=0;
    this.needsVScrollbar=false;
    this.verified=false;

    this.spacing=17;

    this.paintRect=VG.Core.Rect();
    this.textRect=VG.Core.Rect();

    this.hScrollbar=VG.UI.ScrollBar( "IconStrip ScrollBar" );
    this.hScrollbar.callbackObject=this;
    this.hScrollbar.direction=VG.UI.ScrollBar.Direction.Horizontal;
    this.hOffset=0;

    this.workRect=VG.Core.Rect();
    this.borderColor=VG.Core.Color( 151, 151, 151 );
};

IconStrip.prototype=VG.UI.Widget();

IconStrip.prototype.bind=function( collection, path )
{
    this.controller=collection.controllerForPath( path );

    if ( !this.controller ) {
        this.controller=VG.Controller.Array( collection, path );
        collection.addControllerForPath( this.controller, path );
    } else this.controller=this.controller.object;

    this.controller.addObserver( "changed", this.changed, this );
    this.controller.addObserver( "selectionChanged", this.selectionChanged, this );

    return this.controller;
};

IconStrip.prototype.hHandleMoved=function( offsetInScrollbarSpace )
{
    this.hOffset=offsetInScrollbarSpace * this.hScrollbar.totalSize / this.hScrollbar.visibleSize;
};

IconStrip.prototype.focusIn=function()
{
};

IconStrip.prototype.focusOut=function()
{
};

IconStrip.prototype.keyDown=function( keyCode )
{
};

IconStrip.prototype.mouseWheel=function( step )
{
};

IconStrip.prototype.mouseMove=function( event )
{
    if ( this.hScrollbar.visible && this.hScrollbar.rect.contains( event.pos ) ) {
        this.hScrollbar.mouseMove( event );
        return;
    }

    if ( this.mouseIsDown && this.dragSourceId && this.possibleDnDSource )
    {
        VG.context.workspace.dragOperationStarted( this, this.dragSourceId, this.possibleDnDSource );
    }
};

IconStrip.prototype.mouseUp=function( event )
{
    this.mouseIsDown=false;
};

IconStrip.prototype.mouseDown=function( event )
{
    if ( this.hScrollbar.visible && this.hScrollbar.rect.contains( event.pos ) ) {
        this.hScrollbar.mouseDown( event );
        return;
    }

    if ( !this.rect.contains( event.pos ) ) return;

    var selectedIndex=-1;
    var x=this.contentRect.x - this.hOffset + 5;
    var item=-1;

    for ( var i=0; i < this.controller.length; ++i ) {
        item=this.controller.at( i ) ;

        if ( x + this.itemWidth + this.spacing >= event.pos.x && x <= event.pos.x ) {
            selectedIndex=i;
            break;
        }
        x+=this.itemWidth + this.spacing;
    }

    if ( selectedIndex >=0 && selectedIndex < this.controller.length ) {
        item=this.controller.at( selectedIndex );
        this.possibleDnDSource=item;
    }

    if ( this.controller.multiSelection )
    {
    } else {
        if ( item !== -1 && !this.controller.isSelected( item ) )
            this.controller.selected=item;
    }
    this.mouseIsDown=true;
};

IconStrip.prototype.changed=function()
{
    this.verified=false;
    VG.update();
};

IconStrip.prototype.selectionChanged=function()
{
    VG.update();
};

IconStrip.prototype.paintWidget=function( canvas )
{
    if ( !this.controller || !this.controller.length ) return;
    let length=this.controller.length;

    let skin=VG.UI.stylePool.current.skin;
    this.rect.shrink( 4, 8, this.contentRect );

    this.iconStripHeight=this.rect.height;
    this.itemHeight=Math.floor( this.iconStripHeight-2 );
    this.itemWidth=Math.floor( this.itemHeight );

    this.imageWidth=this.itemWidth - 20;
    this.imageHeight=this.itemHeight - 40;

    this.totalWidth=this.itemWidth * length + this.spacing * (length-1) + 20;

    let reduce;

    if ( this.totalWidth > this.rect.width )
        reduce=30; else reduce=15;

    this.iconStripHeight -= reduce;
    this.itemHeight -= reduce;
    this.imageHeight -= reduce;

    let paintRect=this.paintRect; paintRect.copy( this.contentRect );
    paintRect.x+=5 - this.hOffset; paintRect.y+=1;
    paintRect.width=this.itemWidth;
    paintRect.height=this.itemHeight;

    let textRect=this.textRect; textRect.copy( this.contentRect );
    textRect.x -= this.hOffset; textRect.y += this.itemHeight - 23;
    textRect.width=this.itemWidth+10;
    textRect.height=23;

    canvas.pushClipRect( this.rect );

    let workRect=this.workRect;
    for ( var i=0; i < length; ++i )
    {
        var item=this.controller.at( i );

        // if ( paintRect.x > this.rect.right() )
            // break;

        // if ( this.paintRect.x + this.itemWidth + this.spacing < this.rect.x )
            // continue;

        // --- Draw Icon

        if ( item === this.controller.selected ) {
            canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, paintRect, skin.ListWidget.ItemSelectedBackColor );
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, paintRect.shrink( 1, 1, this.workRect ), skin.ListWidget.ItemSelectedBackColor );
        } else {
            canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, paintRect, skin.ListWidget.ItemBackColor );
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, paintRect.shrink( 1, 1, this.workRect ), skin.ListWidget.ItemBackColor );
        }

        if ( !item.iconStripImage || ( item.iconStripImage.width !== this.imageWidth || item.iconStripImage.height !== this.imageHeight ) )
        {
            if ( VG.context.editor.startRender )
            {
                VG.context.editor.startRender( this.renderPreviewCommand );
                item.needsIconStripUpdate=true;

                item.iconStripWidth=this.imageWidth;
                item.iconStripHeight=this.imageHeight;
            }
        }

        if ( item.iconStripImage && !item.needsIconStripUpdate )
        {
            workRect.x = paintRect.x + 9;
            workRect.y = paintRect.y + 9;
            workRect.width = this.imageWidth+2;
            workRect.height = this.imageHeight+2;
            canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, workRect, this.borderColor );

            canvas.pushClipRect( this.workRect );

            workRect.x += 1; workRect.y += 1;

            if ( this.renderPreviewCommand === "objectIconStripPreviews" ) {
                workRect.width-=2; workRect.height-=2;
                if ( workRect.right() > this.rect.x )
                    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, workRect, VG.Core.Color( 157, 157, 157 ) );
            }

            if ( workRect.right() > this.rect.x ) {
                if ( item.iconStripImage.needsUpdate )
                    canvas.drawImage( { x : -1000, y : -1000 }, item.iconStripImage );
                canvas.drawImage( workRect, item.iconStripImage );
            }

            canvas.popClipRect();
        }

        // --- Draw Text

        // canvas.pushFont( canvas.style.skin.IconStrip.Font );

        if ( item === this.controller.selected ) {
            // canvas.style.drawIconStripSelectedItemBackground( canvas, textRect, this );
            canvas.drawTextRect( item.text, textRect, skin.ListWidget.TextColor, 1, 0 );
        } else canvas.drawTextRect( item.text, textRect, skin.ListWidget.TextColor, 1, 0 );

        // canvas.popFont();

        // ---

        paintRect.x+=this.itemWidth + this.spacing;
        textRect.x+=this.itemWidth + this.spacing;

        if ( paintRect.x > this.rect.right() )
            break;
    }

    if ( this.totalWidth > this.rect.width )
    {
        this.hScrollbar.rect.set( this.rect.x, this.rect.bottom() - skin.ScrollBar.Size, this.rect.width, skin.ScrollBar.Size );
        this.hScrollbar.setScrollBarContentSize( this.totalWidth, this.rect.width );
        this.hScrollbar.visible=true;
        this.hScrollbar.paintWidget( canvas );
    } else this.hScrollbar.visible=false;

    canvas.popClipRect();
};

/*
IconStrip.prototype.calculateAspectRatioFit=function(srcWidth, srcHeight, maxWidth, maxHeight, size) {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    size.width=Math.round( srcWidth*ratio );
    size.height=Math.round( srcHeight*ratio );
};
*/