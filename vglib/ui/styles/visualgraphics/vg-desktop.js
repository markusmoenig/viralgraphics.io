/*
 * Copyright (c) 2014-2017 Markus Moenig <markusm@visualgraphics.tv>
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

VG.UI.VisualGraphicsStyle=function()
{
    this.name="Visual Graphics";
    this.skins=[];

    this.prefix="vgstyle_";
    this.path="visualgraphics";

    this.rect1=VG.Core.Rect();
    this.rect2=VG.Core.Rect();
    this.rect3=VG.Core.Rect();
    this.rect4=VG.Core.Rect();
};

VG.UI.VisualGraphicsStyle.prototype.addSkin=function( skin )
{
    this.skins.push( skin );

    if ( !this.skin )
        this.skin=skin;

    skin.style=this;
    skin.activate();
};

// --- Button

VG.UI.VisualGraphicsStyle.prototype.drawButton=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );
    widget.contentRect.set( widget.rect );

    // --- Border

    if ( widget.hasFocusState ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin2px, widget.contentRect, this.skin.Button.FocusBorderColor1 );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleCorners, widget.contentRect, this.skin.Button.FocusBorderColor1 );

        if ( widget.checked || widget.mouseIsDown )
            canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.Button.FocusBorderCheckedColor2 );
        else canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.Button.FocusBorderColor2 );

        widget.contentRect.shrink( 1, 1, widget.contentRect );
    } else
    {
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.Button.BorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
    }

    // --- Content

    if ( widget.hasHoverState && widget.checked || widget.mouseIsDown ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, widget.contentRect, this.skin.Button.CheckedBackGradColor1, this.skin.Button.CheckedBackGradColor2 );
    } else
    if ( widget.hasHoverState ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, widget.contentRect, this.skin.Button.HoverBackGradColor1, this.skin.Button.HoverBackGradColor2 );
    } else
    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, widget.contentRect, this.skin.Button.BackGradColor1, this.skin.Button.BackGradColor2 );

    if ( widget.big ) canvas.pushFont( this.skin.Button.Font );
    else canvas.pushFont( this.skin.Button.SmallFont );

    canvas.drawTextRect( widget.text, widget.contentRect, this.skin.Button.TextColor );
    canvas.popFont();

    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- ButtonGroup

VG.UI.VisualGraphicsStyle.prototype.drawButtonGroup=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );

    this.rect1.copy( widget.rect );

    canvas.pushFont( this.skin.ButtonGroup.Font );

    for ( var i=0; i < widget.items.length; ++i )
    {
        var item=widget.items[i];

        this.rect1.width=item.textWidth + 16;
        this.rect1.height=item.textHeight;

        if ( !widget.__vgInsideToolBar ) this.rect1.height+=4;

        if ( item.icon ) this.rect1.width+=5 + item.icon.width;
        else if ( item.svgName ) this.rect1.width+=15;

        this.rect1.y=widget.rect.y + ( widget.rect.height - this.rect1.height ) / 2;

        var borderColor, backColor;

        if ( widget.activeButton === item ) {
            borderColor=this.skin.ButtonGroup.PressedBorderColor;
            backColor=this.skin.ButtonGroup.PressedBackColor;
        } else
        if ( widget.hoverButton === item ) {
            borderColor=this.skin.ButtonGroup.HoverBorderColor;
            backColor=this.skin.ButtonGroup.HoverBackColor;
            if ( item.statusTip ) widget.statusTip=item.statusTip;
        } else {
            borderColor=this.skin.ButtonGroup.NormalBorderColor;
            backColor=this.skin.ButtonGroup.NormalBackColor;
        }

        if ( !VG.context.workspace.mouseTrackerWidget && widget.hasHoverState && item.rect.contains( VG.context.workspace.mousePos) )
        {
            borderColor=this.skin.ButtonGroup.HoverBorderColor;
            backColor=this.skin.ButtonGroup.HoverBackColor;
            if ( item.statusTip ) widget.statusTip=item.statusTip;
        }

        // ---

        if ( i === 0 )
        {
            this.rect2.copy( this.rect1 );

            this.rect2.x+=1; this.rect2.width-=1;
            this.rect2.height=1;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, borderColor );

            this.rect2.y+=this.rect1.height-1;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, borderColor );

            this.rect2.copy( this.rect1 );
            this.rect2.y+=1; this.rect2.height-=2;
            this.rect2.width=1;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, borderColor );

            this.rect2.copy( this.rect1 );
            this.rect2.x+=1; this.rect2.width-=1;
            this.rect2.y+=1; this.rect2.height-=2;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, backColor );
        } else
        if ( i === widget.items.length - 1 )
        {
            this.rect2.copy( this.rect1 );

            this.rect2.width-=1;
            this.rect2.height=1;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, borderColor );

            this.rect2.y+=this.rect1.height-1;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, borderColor );

            this.rect2.copy( this.rect1 );
            this.rect2.y+=1; this.rect2.height-=2;
            this.rect2.x+=this.rect1.width - 1; this.rect2.width=1;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, borderColor );

            this.rect2.copy( this.rect1 );
            this.rect2.width-=1;
            this.rect2.y+=1; this.rect2.height-=2;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, backColor );
        } else
        {
            this.rect2.copy( this.rect1 );

            this.rect2.height=1;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, borderColor );

            this.rect2.y+=this.rect1.height-1;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, borderColor );

            this.rect2.copy( this.rect1 );
            this.rect2.y+=1; this.rect2.height-=2;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, backColor );
        }

        item.rect.copy( this.rect1 );

        this.rect2.copy( this.rect1 );

        var iconAdder=0;

        if ( item.icon ) {
            this.rect2.x+=5;
            this.rect2.y=widget.rect.y + (widget.rect.height - item.icon.height)/2;
            canvas.drawImage( this.rect2, item.icon );
        } else if ( item.svgName )
        {
            var svg=VG.Utils.getSVGByName( item.svgName );

            iconAdder=10;
            this.rect2.x+=5;
            this.rect2.y=widget.rect.y + (widget.rect.height - 15)/2;
            this.rect2.width=15;
            this.rect2.height=15;

            svgGroup=svg.getGroupByName( item.svgGroupName );
            canvas.drawSVG( svg, svgGroup, this.rect2, this.skin.Widget.TextColor );
        }

        this.rect2.copy( this.rect1 );

        this.rect2.x+=7 + iconAdder;
        this.rect2.width-=14 + iconAdder;

        canvas.drawTextRect( item.text, this.rect2, this.skin.ButtonGroup.TextColor, 1, 1 );

        this.rect1.x+=this.rect1.width + 1;
    }

    canvas.popFont();

    if ( widget.disabled ) canvas.setAlpha( 1 );
};


// --- CheckBox

VG.UI.VisualGraphicsStyle.prototype.drawCheckBox=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );

    var imageName="checkbox";

    if ( widget.hasFocusState ) imageName+="_focus";
    if ( widget.hasHoverState ) imageName+="_hover";

    if ( widget.checked ) imageName+="_checked";

    imageName+=".png";

    var image=VG.Utils.getImageByName( imageName );

    if ( image )
        canvas.drawImage( VG.Core.Point( widget.rect.x + (widget.rect.width-image.width)/2, widget.rect.y + (widget.rect.height-image.height)/2), image );

    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- ContextMenu

VG.UI.VisualGraphicsStyle.prototype.drawContextMenu=function( widget, canvas )
{
    canvas.pushFont( this.skin.ContextMenu.Font );

    if ( canvas.twoD )
        canvas.clearGLRect( widget.rect );

    widget.rect.shrink( 1, 1, widget.contentRect );

    canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, widget.rect, this.skin.ContextMenu.BorderColor );

    widget.rect.shrink( 1, 1, this.rect1 );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.ContextMenu.BackColor );

    var itemHeight=canvas.getLineHeight() + 4;

    var rect=widget.contentRect;
    var y=widget.contentRect.y;

    for( var i=0; i < widget.items.length; ++i )
    {
        var item=widget.items[i];

        if ( !item.isSeparator ) {
            this.rect1.set( rect.x, y, rect.width, itemHeight );
            this.rect1.round();

            if ( item.disabled ) {
                canvas.drawTextRect( item.text, this.rect1.add( 10, 0, -10, 0, this.rect2 ), this.skin.ContextMenu.DisabledTextColor, 0, 1 );
            } else
            if ( item === widget.selected )  {
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.ContextMenu.HighlightedBackColor );
                canvas.drawTextRect( item.text, this.rect1.add( 10, 0, -10, 0, this.rect2 ), this.skin.ContextMenu.HighlightedTextColor, 0, 1 );
            } else {
                canvas.drawTextRect( item.text, this.rect1.add( 10, 0, -10, 0, this.rect2 ), this.skin.ContextMenu.TextColor, 0, 1 );
            }

            if ( item.checkable && item.checked ) {
                var imageName="checkmark";
                if ( item.checked ) imageName+="_checked";
                imageName+=".png";

                var image=VG.context.imagePool.getImageByName( imageName );
                if ( image ) {
                    canvas.drawImage( VG.Core.Point( this.rect1.right() - image.width - 10, this.rect1.y + (this.rect1.height-image.height)/2), image );
                }
            }

            if ( item.shortcut ) {

                var textColor=this.skin.ContextMenu.TextColor;
                if ( item.disabled ) textColor=this.skin.ContextMenu.DisabledTextColor;
                var shortCutSize=canvas.getTextSize( item.shortcut.text );
                this.rect3.set( this.rect1.right() - shortCutSize.width - 10, this.rect1.y, shortCutSize.width, this.rect1.height );
                canvas.drawTextRect( item.shortcut.text, this.rect3, textColor, 0, 1 );
            }

            item._rect.set( this.rect1 );
            y+=itemHeight;
        } else {
            this.rect1.set( rect.x, y, rect.width, 1 );
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.ContextMenu.SeparatorColor );

            y++;
        }
    }

    canvas.popFont();
};

// --- DecoratedToolBar

VG.UI.VisualGraphicsStyle.prototype.drawDecoratedToolBar=function( widget, canvas )
{
    // --- Background
    this.rect1.copy( widget.rect ); this.rect1.height=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.DecoratedToolBar.TopBorderColor );
    //this.rect1.y+=1;
    //canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.DecoratedToolBar.TopBorderColor2 );
    this.rect1.y+=widget.rect.height-1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.DecoratedToolBar.BottomBorderColor );

    widget.contentRect.set( widget.rect );
    widget.contentRect.y+=1; widget.contentRect.height-=2;

    this.rect1.copy( widget.contentRect );
    this.rect1.height/=2;
    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect1, this.skin.DecoratedToolBar.BackGradColor1, this.skin.DecoratedToolBar.BackGradColor2 );
    this.rect1.y+=this.rect1.height;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.DecoratedToolBar.BackGradColor2 );

    // --- Logo
    var logoName="vglogo_text.svg";
    //if ( this.workRect1.width < 400 ) logoName="vg_logo.svg"

    this.rect1.copy( widget.rect );

    var svgLogo=VG.Utils.getSVGByName( logoName );
    if ( svgLogo )
    {
        var group=svgLogo.groups[0];

        this.rect1.x+=10; this.rect1.width=180;//250;
        this.rect1.y+=4; this.rect1.height-=8;

        canvas.drawSVG( svgLogo, undefined, this.rect1, this.skin.DecoratedToolBar.LogoColor );
    }

    widget.contentRect.x+=265;//300;
    widget.contentRect.width-=265;//300;
};

// --- DecoratedToolSeparator

VG.UI.VisualGraphicsStyle.prototype.drawDecoratedToolSeparator=function( widget, canvas )
{
    this.rect1.copy( widget.rect );
    this.rect1.width=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.DecoratedToolBar.Separator.Color1 );
    this.rect1.x+=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.DecoratedToolBar.Separator.Color2 );
};

// --- DecoratedQuickMenuButton

VG.UI.VisualGraphicsStyle.prototype.drawDecoratedQuickMenu=function( widget, canvas )
{
    // --- Draw SubMenu

    function drawSubMenu( rect, menu, style, rect1 )
    {
        var i, item;
        rect.height=0;
        for ( i=0; i < menu.items.length; ++i ) {
            item=menu.items[i];
            if ( item.text && item.text.length ) rect.height+=style.skin.DecoratedQuickMenu.Items.Size.height;
            else rect.height+=0;
        }

        rect.height-=menu.items.length-1;

        menu.itemsRect.copy( rect );

        if ( canvas.twoD )
            canvas.clearGLRect( rect );

        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, rect, style.skin.DecoratedQuickMenu.SubMenuBorderColor );
        rect1.copy( rect );
        rect1.shrink( 1, 1, rect1 );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect1, style.skin.DecoratedQuickMenu.BackgroundColor );

        rect.height=style.skin.DecoratedQuickMenu.Items.Size.height;

        for ( i=0; i < menu.items.length; ++i )
        {
            item=menu.items[i];

            rect1.copy( rect );
            item.rect.copy( rect );

            if ( menu.index === i && !item.disabled && item.text && item.text.length ) {
                canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, rect, style.skin.DecoratedQuickMenu.BorderColor );

                rect1.shrink( 1, 1, rect1 );
                canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, rect1, style.skin.DecoratedQuickMenu.Items.BackGradSelectionColor1, style.skin.DecoratedQuickMenu.Items.BackGradSelectionColor2 );

                rect1.copy( rect );
            }

            rect1.x+=70; rect1.width=style.skin.DecoratedQuickMenu.Items.Size.width - 70;

            if ( item.text && item.text.length )
            {
                if ( !item.disabled ) canvas.drawTextRect( item.text, rect1, style.skin.DecoratedQuickMenu.Items.TextColor, 0, 1 );
                else canvas.drawTextRect( item.text, rect1, style.skin.DecoratedQuickMenu.Items.DisabledTextColor, 0, 1 );
                rect.y+=style.skin.DecoratedQuickMenu.Items.Size.height-1;
            } else {
                // --- Separator
                rect1.copy( rect );
                rect1.y+=0; rect1.height=1;
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect1, style.skin.DecoratedQuickMenu.Items.TextColor );

                rect.y+=-1;
            }
        }
    }

    // ---

    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );

    // --- Calc Height

    var contentHeight=this.skin.DecoratedQuickMenu.ContentMargin.top + this.skin.DecoratedQuickMenu.ContentMargin.bottom;
    var i, item;

    for ( i=0; i < widget.items.length; ++i ) {
        item=widget.items[i];
        if ( item.text && item.text.length ) contentHeight+=this.skin.DecoratedQuickMenu.Items.Size.height;
        else contentHeight+=0;
    }

    contentHeight-=widget.items.length-1;

    // ---

    if ( widget.open )
    {
        this.rect2.copy( widget.contentRect );
        this.rect2.y+=10;
        this.rect2.height=this.skin.DecoratedToolBar.Height - widget.rect.y + VG.context.workspace.decoratedToolBar.rect.y - 10;

        if ( canvas.twoD )
            canvas.clearGLRect( this.rect2 );

        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, this.rect2, this.skin.DecoratedQuickMenu.BorderColor );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2.add( 1, 1, -2, 0, this.rect2), this.skin.DecoratedQuickMenu.BackgroundColor );
    }

    if ( widget.iconName )
    {
        this.rect1.copy( widget.contentRect );
        this.rect1.shrink( 20, 20, this.rect1 );

        // --- Icon
        if ( !widget.icon ) widget.icon=VG.context.imagePool.getImageByName( widget.iconName );
        if ( widget.icon && widget.icon.isValid() )
        {
            let x=Math.round( widget.contentRect.x + (widget.contentRect.width - widget.icon.width)/2 );
            let y=Math.round( widget.contentRect.y + (widget.contentRect.height - widget.icon.height)/2);

            canvas.drawImage( { x : x, y : y }, widget.icon );
        }

/*
        var svg=VG.Utils.getSVGByName( widget.svgName );
        if ( svg )
        {
            svgGroup=svg.getGroupByName( widget.svgGroupName );

            if ( widget.visualState === VG.UI.Widget.VisualState.Hover || widget.mouseIsDown || widget.open )
                canvas.drawSVG( svg, svgGroup, this.rect1, this.skin.DecoratedQuickMenu.HoverColor );
            else
                canvas.drawSVG( svg, svgGroup, this.rect1, this.skin.DecoratedQuickMenu.Color );
        }*/
    }

    if ( widget.open )
    {
        canvas.pushFont( this.skin.DecoratedQuickMenu.Items.Font );

        this.rect1.x=0; this.rect1.y=VG.context.workspace.decoratedToolBar.rect.bottom();
        this.rect1.width=widget.rect.x+1; this.rect1.height=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.DecoratedQuickMenu.BorderColor );

        this.rect2.x=VG.context.workspace.rect.x; this.rect2.y=VG.context.workspace.decoratedToolBar.rect.bottom();
        this.rect2.width=widget.rect.right() - VG.context.workspace.rect.x; this.rect2.height=contentHeight;
        widget.popupRect.copy( this.rect2 );

        this.rect1.copy( this.rect2 );

        if ( canvas.twoD )
            canvas.clearGLRect( this.rect2 );

        this.rect1.width=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.DecoratedQuickMenu.BorderColor );
        this.rect1.x+=this.rect2.width-1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.DecoratedQuickMenu.BorderColor );
        this.rect1.copy( this.rect2 );
        this.rect1.y+=this.rect2.height-1; this.rect1.height=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.DecoratedQuickMenu.BorderColor );

        this.rect1.copy( this.rect2 );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2.add( 1, 1, -2, -2 ), this.skin.DecoratedQuickMenu.BackgroundColor );

        this.rect1.add( this.skin.DecoratedQuickMenu.ContentMargin.left, this.skin.DecoratedQuickMenu.ContentMargin.top,
            -2 * this.skin.DecoratedQuickMenu.ContentMargin.right, 0, this.rect1 );
        this.rect1.height=this.skin.DecoratedQuickMenu.Items.Size.height;

        for ( i=0; i < widget.items.length; ++i )
        {
            item=widget.items[i];

            this.rect2.copy( this.rect1 );
            item.rect.copy( this.rect1 );

            var cy=this.rect2.y;

            if ( widget.index === i && !item.disabled && item.text && item.text.length ) {
                canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, this.rect2, this.skin.DecoratedQuickMenu.BorderColor );

                this.rect2.shrink( 1, 1, this.rect2 );
                canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect2, this.skin.DecoratedQuickMenu.Items.BackGradSelectionColor1, this.skin.DecoratedQuickMenu.Items.BackGradSelectionColor2 );

                this.rect2.copy( this.rect1 );
            }

            this.rect2.x+=70; this.rect2.width=this.skin.DecoratedQuickMenu.Items.Size.width - 70;

            if ( item.text && item.text.length )
            {
                if ( !item.disabled ) canvas.drawTextRect( item.text, this.rect2, this.skin.DecoratedQuickMenu.Items.TextColor, 0, 1 );
                else canvas.drawTextRect( item.text, this.rect2, this.skin.DecoratedQuickMenu.Items.DisabledTextColor, 0, 1 );
                this.rect1.y+=this.skin.DecoratedQuickMenu.Items.Size.height-1;
            } else {
                // --- Separator
                this.rect2.copy( this.rect1 );
                this.rect2.y+=0; this.rect2.height=1;
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, this.skin.DecoratedQuickMenu.Items.TextColor );

                this.rect1.y+=-1;
            }

            if ( item.items.length && widget.index === i && !item.disabled && item.text && item.text.length ) {
                // --- SubMenu
                this.rect2.copy( this.rect1 );
                this.rect2.y=cy; this.rect2.x=widget.rect.right();
                drawSubMenu( this.rect2, item, this, this.rect3 );
            }
        }

        canvas.popFont();
    }

    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- DockWidget

VG.UI.VisualGraphicsStyle.prototype.drawDockWidget=function( widget, canvas )
{
    widget.contentRect.set( widget.rect );
    if ( widget.location === VG.UI.DockWidgetLocation.Floating ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, widget.contentRect, this.skin.DockWidget.FloatingBorderColor );
        widget.contentRect.shrink( 1,1, widget.contentRect );
    }

    // --- Draw Header

    this.rect1.set( widget.contentRect ); this.rect1.height=this.skin.DockWidget.HeaderHeight;
    canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, this.rect1, this.skin.DockWidget.HeaderBorderColor );
    this.rect1.shrink( 1, 1, this.rect1 );
    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect1, this.skin.DockWidget.HeaderBackGradColor1, this.skin.DockWidget.HeaderBackGradColor2 );

    this.rect2.set( this.rect1 );
    canvas.pushFont( this.skin.DockWidget.HeaderFont );
    this.rect2.add( 30, 0, -30, 0, this.rect2 );
    canvas.drawTextRect( widget.text, this.rect2, this.skin.DockWidget.HeaderTextColor, 0, 1 );
    canvas.popFont();

    var imageName="darrow_";
    if ( widget.rightIndicator ) imageName+="right.png";
    else imageName+="left.png";

    var image=VG.context.imagePool.getImageByName( imageName );

    if ( image ) {
        this.rect2.set( this.rect1 );

        if ( widget.rightIndicator ) {
            this.rect2.x+=this.rect2.width - 14; this.rect2.width=image.width;
        } else {
            this.rect2.x+=6; this.rect2.width=image.width;
        }

        this.rect2.y+=(this.rect2.height-image.height)/2; this.rect2.height=image.height;
        canvas.drawImage( this.rect2, image );
    }

    // ---

    widget.contentRect.add( 0, this.skin.DockWidget.HeaderHeight, 0, -this.skin.DockWidget.HeaderHeight, widget.contentRect );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.DockWidget.BackColor );
};

// --- DropDownMenu

VG.UI.VisualGraphicsStyle.prototype.drawDropDownMenu=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );
    widget.contentRect.set( widget.rect );

    // --- Border

    if ( widget.hasFocusState ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin2px, widget.contentRect, this.skin.DropDownMenu.FocusBorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleCorners, widget.contentRect, this.skin.DropDownMenu.FocusBorderColor );

        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.DropDownMenu.BorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
    } else
    {
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        if ( widget.hasHoverState ) canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.DropDownMenu.HoverBorderColor );
        else canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.DropDownMenu.BorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
    }

    // --- Background

    if ( widget.popup || widget.mouseIsDown ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, widget.contentRect, this.skin.DropDownMenu.BackGradColor2, this.skin.DropDownMenu.BackGradColor1 );
    } else
    if ( widget.hasHoverState ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, widget.contentRect, this.skin.DropDownMenu.HoverBackGradColor1, this.skin.DropDownMenu.HoverBackGradColor2 );
    } else
    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, widget.contentRect, this.skin.DropDownMenu.BackGradColor1, this.skin.DropDownMenu.BackGradColor2 );

    // --- Separator / Triangle

    this.rect1.copy( widget.contentRect );
    this.rect1.x+=this.rect1.width-16; this.rect1.width=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.DropDownMenu.SepColor1 );
    this.rect1.x+=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.DropDownMenu.SepColor2 );

    // --- Triangle

    this.rect1.copy( widget.contentRect );
    this.rect1.x+=this.rect1.width - 12; this.rect1.y+=6;
    this.rect1.width=9; this.rect1.height=6;
    canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, this.rect1.round(), this.skin.DropDownMenu.TextColor );

    // --- List

    canvas.pushFont( this.skin.DropDownMenu.Font );

    this.rect1.copy( widget.rect );
    if ( widget.popup )
    {
        var itemHeight=canvas.getLineHeight() + 2;
        var popupHeight=widget.items.length * itemHeight + widget.items.length + 1;
        this.rect2.set( this.rect1.x, this.rect1.bottom(), this.rect1.width, popupHeight );

        // --- Check if Menu is beneath or above the button depending on workspace height

        widget.menuDown=!widget.menuIsUp;
        if ( ( popupHeight + widget.rect.bottom() ) > VG.context.workspace.rect.bottom() )
            widget.menuDown=false;

        if ( widget.menuDown ) this.rect2.set( this.rect1.x, this.rect1.bottom(), this.rect1.width, popupHeight );
        else this.rect2.set( this.rect1.x, this.rect1.y - popupHeight, this.rect1.width, popupHeight );

        // ---

        if ( canvas.twoD )
            canvas.clearGLRect( this.rect2 );

        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, this.skin.DropDownMenu.ItemBorderColor );
        widget.popupRect.copy( this.rect2 );

        this.rect2.height=itemHeight;
        this.rect2.shrink( 1, 0, this.rect2 );

        var y=this.rect2.y+1;

        for( var i=0; i < widget.items.length; ++i )
        {
            this.rect1.set( this.rect2 );
            this.rect1.y=y;

            if ( i === widget.index )
            {
                canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, this.rect1, this.skin.DropDownMenu.FocusBorderColor );
                this.rect1.shrink( 1, 1, this.rect1 );
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.DropDownMenu.ItemSelectedBackColor );

                this.rect1.shrink( 7, 0, this.rect1 );
                canvas.drawTextRect( widget.items[i], this.rect1, this.skin.DropDownMenu.ItemSelectedTextColor, 0, 1 );
            } else {
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.DropDownMenu.ItemBackColor );

                this.rect1.shrink( 7, 0, this.rect1 );
                canvas.drawTextRect( widget.items[i], this.rect1, this.skin.DropDownMenu.ItemTextColor, 0, 1 );
            }

            y+=itemHeight + 1;
        }

        widget.itemHeight=itemHeight + 1;
    }

    // --- Main Text

    this.rect1.copy( widget.contentRect );
    this.rect1.x+=7; this.rect1.width-=7 + 16 +1;

    if ( widget.index !== -1 )
        canvas.drawTextRect( widget.items[widget.index], this.rect1, this.skin.DropDownMenu.TextColor, 0, 1 );

    canvas.popFont();

    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- Frame

VG.UI.VisualGraphicsStyle.prototype.drawFrame=function( widget, canvas )
{
    widget.contentRect.set( widget.rect );

    if ( widget.frameType === VG.UI.Frame.Type.Box )
    {
        var color;

        if ( widget.hasFocusState ) color=this.skin.Widget.FocusColor;
        else color=this.skin.TextEdit.BorderColor1;
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, widget.rect, color );

        widget.contentRect.shrink( 1, 1, this.contentRect );
    }
};

// --- IconWidget

VG.UI.VisualGraphicsStyle.prototype.drawIconWidget=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );
    widget.contentRect.set( widget.rect );

    // --- Border

    if ( widget.hasFocusState ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin2px, widget.contentRect, this.skin.IconWidget.FocusBorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleCorners, widget.contentRect, this.skin.IconWidget.FocusBorderColor );

        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.IconWidget.BorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
    } else
    {
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        if ( widget.hasHoverState ) canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.IconWidget.HoverBorderColor );
        else canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.IconWidget.BorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
    }

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.IconWidget.BackColor );

    // ---

    if ( !widget.controller ) { if ( widget.disabled ) canvas.setAlpha( 1 ); return; }

    if ( widget.toolLayout.length > 0 ) widget.contentRect.height-=this.skin.IconWidget.ToolLayoutHeight;

    widget.contentRect.x+=this.skin.IconWidget.Margin.left;
    widget.contentRect.y+=this.skin.IconWidget.Margin.top;
    widget.contentRect.width-=2*this.skin.IconWidget.Margin.right;
    widget.contentRect.height-=2*this.skin.IconWidget.Margin.bottom;

    canvas.pushClipRect( widget.contentRect );

    if ( !widget.verified || canvas.hasBeenResized )
        widget.verifyScrollbar();

    // ---

    this.rect2.copy( widget.contentRect );
    var paintRect=this.rect2;
    paintRect.width=widget._itemSize.width;

    canvas.pushFont( this.skin.IconWidget.Font );

    paintRect.y=widget.contentRect.y - widget.offset;

    for ( var r=0; r < widget.rows; ++r )
    {
        var x=paintRect.x;

        for ( var i=0; i < widget.itemsPerRow; ++i )
        {
            var itemIndex=widget.itemsPerRow * r + i;
            if ( itemIndex >= widget.controller.count() ) break;

            var item=widget.controller.at( itemIndex );
            if ( !item.visible ) continue;

            var isSelected=widget.controller.isSelected( item );

            // ---

            if ( paintRect.y + widget._itemSize.height >= widget.contentRect.y )
            {
                this.rect1.copy( paintRect );
                this.rect1.height=91;

                if ( !isSelected ) {
                    // canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, this.rect1, this.skin.IconWidget.ItemBackColor );
                    // canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1.shrink( 15, 15, this.rect1 ), this.skin.IconWidget.ItemBackColor );
                    // this.rect1.shrink( 1, 1, this.rect1 );

                    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.IconWidget.ItemBackColor );
                    // canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1.shrink( 15, 15, this.rect1 ), this.skin.IconWidget.ItemBackColor );
                    this.rect1.shrink( 10 + 8, 10 + 8, this.rect1 );
                } else {
                    // canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, this.rect1, this.skin.IconWidget.ItemSelectedBorderColor );
                    //canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, this.rect1.shrink( 15, 15, this.rect1 ), this.skin.IconWidget.ItemSelectedBackColor );
                    // canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1.shrink( 1, 1, this.rect1 ), this.skin.IconWidget.ItemSelectedBackColor );


                    canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, this.rect1, this.skin.IconWidget.ItemSelectedBorderColor );
                    //canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, this.rect1.shrink( 15, 15, this.rect1 ), this.skin.IconWidget.ItemSelectedBackColor );
                    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1.shrink( 1, 1, this.rect1 ), this.skin.IconWidget.ItemSelectedBackColor );
                    this.rect1.shrink( 9 + 8, 9 + 8, this.rect1 );
                }

                if ( widget.paintItemCallback ) widget.paintItemCallback( canvas, item, this.rect1, isSelected );
                else {

                }

                this.rect1.copy( paintRect ); this.rect1.y+=97; //this.rect1.height;
                canvas.drawTextRect( item.text, this.rect1, this.skin.IconWidget.TextColor, 1, 0 );
            }
            paintRect.x+=widget._itemSize.width + widget.spacing.width;
        }

        paintRect.x=x;
        paintRect.y+=widget._itemSize.height +  widget.spacing.height;
        if ( paintRect.y > widget.contentRect.bottom() ) break;
    }

    canvas.popFont();

    if ( widget.needsVScrollbar ) {
        widget.vScrollbar.rect=VG.Core.Rect( widget.contentRect.right() - this.skin.ScrollBar.Size,
            widget.contentRect.y, this.skin.ScrollBar.Size, widget.contentRect.height );

        // this.totalItemHeight == Total height of all Items in the list widget including spacing
        // visibleHeight == Total height of all currently visible items
        // this.contentRect.height == Height of the available area for the list items

        widget.vScrollbar.setScrollBarContentSize( widget.totalItemHeight, widget.contentRect.height );
        widget.vScrollbar.paintWidget( canvas );
    }

    canvas.popClipRect();

    // --- Draw Tools

    if ( widget.toolLayout.length > 0 ) {
        this.rect1.copy( widget.rect ); this.rect1.shrink( 2, 2, this.rect1 );
        this.rect1.y+=this.rect1.height - this.skin.IconWidget.ToolLayoutHeight;
        this.rect2.copy( this.rect1 );
        this.rect1.height=1;//this.skin.IconWidget.ToolLayoutHeight;

        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.IconWidget.ToolTopBorderColor );

        this.rect1.y+=1; this.rect1.height=this.skin.IconWidget.ToolLayoutHeight-2;
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect1, this.skin.IconWidget.ToolBackGradColor1, this.skin.IconWidget.ToolBackGradColor2 );

        this.rect1.y+=this.rect1.height; this.rect1.height=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.IconWidget.ToolBottomBorderColor );

        this.rect2.height=this.skin.IconWidget.ToolLayoutHeight;
        this.rect2.shrink( 1, 1, this.rect2 );
        widget.toolLayout.rect.copy( this.rect2 );

        widget.toolLayout.layout( canvas );
    }

    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- ListWidget

VG.UI.VisualGraphicsStyle.prototype.drawListWidget=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );
    widget.contentRect.set( widget.rect );

    // --- Border

    if ( widget.hasFocusState ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin2px, widget.contentRect, this.skin.ListWidget.FocusBorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleCorners, widget.contentRect, this.skin.ListWidget.FocusBorderColor );

        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.ListWidget.BorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
    } else
    {
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        if ( widget.hasHoverState ) canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.ListWidget.HoverBorderColor );
        else canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.ListWidget.BorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
    }

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.ListWidget.BackColor );

    // ---

    if ( !widget.controller ) { if ( widget.disabled ) canvas.setAlpha( 1 ); return; }

    if ( widget.toolLayout.length > 0 ) widget.contentRect.height-=this.skin.ListWidget.ToolLayoutHeight;

    widget.contentRect.x+=this.skin.ListWidget.Margin.left;
    widget.contentRect.y+=this.skin.ListWidget.Margin.top;
    widget.contentRect.width-=2*this.skin.ListWidget.Margin.right;
    widget.contentRect.height-=2*this.skin.ListWidget.Margin.bottom;

    canvas.pushClipRect( widget.contentRect );

    if ( !widget.verified || canvas.hasBeenResized )
        widget.verifyScrollbar();

    // ---

    this.rect2.copy( widget.contentRect );
    var paintRect=this.rect2;
    paintRect.height=widget.itemHeight;

    if ( widget.needsVScrollbar ) paintRect.width-=this.skin.ScrollBar.Size;

    canvas.pushFont( this.skin.ListWidget.Font );

    paintRect.y=widget.contentRect.y - widget.offset;

    widget.childWidgets=[];
    for ( var i=0; i < widget.controller.count(); ++i ) {
        var item=widget.controller.at( i );
        if ( !item.visible ) continue;

        var isSelected=widget.controller.isSelected( item );

        // --- Insert Potential Child Widgets of Items

        if ( item.childWidgets ) {
            for ( var c=0; c < item.childWidgets.length; ++c ) {
                widget.childWidgets.push( item.childWidgets[c] );
            }
        }

        // ---

        if ( paintRect.y + widget.itemHeight >= widget.contentRect.y )
        {
            this.rect1.copy( paintRect );
            if ( !isSelected ) {
                canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, this.rect1, this.skin.ListWidget.ItemBackColor );
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1.shrink( 1, 1, this.rect1 ), this.skin.ListWidget.ItemBackColor );
            } else {
                canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, this.rect1, this.skin.ListWidget.ItemSelectedBorderColor );
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1.shrink( 1, 1, this.rect1 ), this.skin.ListWidget.ItemSelectedBackColor );
            }

            if ( !widget.paintItemCallback ) {
                this.rect1.copy( paintRect ); this.rect1.x+=8; this.rect1.width-=8;
                canvas.drawTextRect( item.text, this.rect1, this.skin.ListWidget.TextColor, 0, 1 );
            } else widget.paintItemCallback( canvas, item, paintRect, isSelected );
        }

        paintRect.y+=widget.itemHeight + widget.spacing;
        if ( paintRect.y > widget.contentRect.bottom() ) break;
    }

    canvas.popFont();

    if ( widget.needsVScrollbar ) {
        widget.vScrollbar.rect=VG.Core.Rect( widget.contentRect.right() - this.skin.ScrollBar.Size,
            widget.contentRect.y, this.skin.ScrollBar.Size, widget.contentRect.height );

        // this.totalItemHeight == Total height of all Items in the list widget including spacing
        // visibleHeight == Total height of all currently visible items
        // this.contentRect.height == Height of the available area for the list items

        widget.vScrollbar.setScrollBarContentSize( widget.totalItemHeight, widget.contentRect.height );
        widget.vScrollbar.paintWidget( canvas );
    }

    canvas.popClipRect();

    // --- Draw Tools

    if ( widget.toolLayout.length > 0 ) {
        this.rect1.copy( widget.rect ); this.rect1.shrink( 2, 2, this.rect1 );
        this.rect1.y+=this.rect1.height - this.skin.ListWidget.ToolLayoutHeight;
        this.rect2.copy( this.rect1 );
        this.rect1.height=1;//this.skin.ListWidget.ToolLayoutHeight;

        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.ListWidget.ToolTopBorderColor );

        this.rect1.y+=1; this.rect1.height=this.skin.ListWidget.ToolLayoutHeight-2;
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect1, this.skin.ListWidget.ToolBackGradColor1, this.skin.ListWidget.ToolBackGradColor2 );

        this.rect1.y+=this.rect1.height; this.rect1.height=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.ListWidget.ToolBottomBorderColor );

        this.rect2.height=this.skin.ListWidget.ToolLayoutHeight;
        this.rect2.shrink( 1, 1, this.rect2 );
        widget.toolLayout.rect.copy( this.rect2 );

        widget.toolLayout.layout( canvas );
    }

    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- ScrollBar

VG.UI.VisualGraphicsStyle.prototype.drawMenu=function( widget, canvas )
{
    canvas.pushFont( this.skin.Menu.Font );

    widget.contentRect.x=widget.rect.x;
    widget.contentRect.y=widget.parent.rect.bottom() + 1;

    widget.contentRect.setSize( widget.calcSize( canvas ) );

    canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, widget.contentRect, this.skin.Menu.BorderColor );
    widget.contentRect.shrink( 1, 1, widget.contentRect );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.Menu.BackColor );

    var itemHeight=canvas.getLineHeight() + 7;

    var rect=widget.contentRect;
    var y=widget.contentRect.y;

    for( var i=0; i < widget.items.length; ++i )
    {
        var item=widget.items[i];

        if ( !item.isSeparator ) {
            var itemRect=VG.Core.Rect( rect.x, y, rect.width, itemHeight ).round();

            if ( item.disabled ) {
                canvas.drawTextRect( item.text, itemRect.add( 10, 0, -10, 0, this.rect2), this.skin.Menu.DisabledTextColor, 0, 1 );
            } else
            if ( item === widget.selected )  {
                canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, itemRect, this.skin.Menu.HighlightedBorderColor );
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect.shrink(1, 1, this.rect2), this.skin.Menu.HighlightedBackColor );
                canvas.drawTextRect( item.text, itemRect.add( 10, 0, -10, 0, this.rect2 ), this.skin.Menu.HighlightedTextColor, 0, 1 );
            } else {
                canvas.drawTextRect( item.text, itemRect.add( 10, 0, -10, 0, this.rect2), this.skin.Menu.TextColor, 0, 1 );
            }

            if ( item.checkable ) {
                var iconName="checkmark";

                if ( item.checked ) iconName+="_checked";
                iconName+=".png";

                var image=VG.Utils.getImageByName( iconName );
                if ( image ) canvas.drawImage( VG.Core.Point( itemRect.right() - image.width - 10, itemRect.y + (itemRect.height-image.height)/2), image );
            }

            if ( item.shortcut ) {
                canvas.pushFont( this.skin.Menu.ShortcutFont );

                var textColor=this.skin.Menu.TextColor;
                if ( item.disabled ) textColor=this.skin.Menu.DisabledTextColor;
                var shortCutSize=canvas.getTextSize( item.shortcut.text );
                canvas.drawTextRect( item.shortcut.text, VG.Core.Rect( itemRect.right() - shortCutSize.width - 10, itemRect.y, shortCutSize.width, itemRect.height ), textColor, 0, 1 );

                canvas.popFont();
            }

            item._rect=itemRect;
            y+=itemHeight;
        } else {
            var sepRect=VG.Core.Rect( rect.x+1, y, rect.width-2, 1 ).round();
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, sepRect, this.skin.Menu.SeparatorColor );

            y++;
        }
    }

    this.itemHeight=itemHeight;

    canvas.popFont();
};

// --- MenuBar

VG.UI.VisualGraphicsStyle.prototype.drawMenuBar=function( widget, canvas )
{
    widget.contentRect.set( widget.rect );

    widget.contentRect.height=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.MenuBar.TopBorderColor );
    widget.contentRect.y+=widget.rect.height-1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.MenuBar.BottomBorderColor );

    widget.rect.shrink( 0, 1, widget.contentRect );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.MenuBar.BackColor );

    canvas.pushFont( this.skin.MenuBar.Font );

    var rect=this.rect1; widget.rect.shrink( 0, this.skin.MenuBar.BorderSize, this.rect1 );// this.rect1.set( widget.rect );
    var size=this.rect2;

    for( var i=0; i < widget.items.length; ++i )
    {
        var item=widget.items[i];

        rect.x+=12;
        rect.width=canvas.getTextSize( item.text, size ).width + 2 * 12;

        if ( item === widget.active ) {
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect, this.skin.MenuBar.SelectedBackColor );
            canvas.drawTextRect( item.text, rect, this.skin.MenuBar.SelectedTextColor, 1, 1 );
        } else {
            canvas.drawTextRect( item.text, rect, this.skin.MenuBar.TextColor, 1, 1 );
        }

        item.rect.set( rect );
        rect.x+=size.width+12;
    }

    canvas.popFont();
};


// --- ScrollBar

VG.UI.VisualGraphicsStyle.prototype.drawScrollBar=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );

    if ( VG.context.twoDOnTop ) {
        canvas.ctx.clearRect( widget.contentRect.x, widget.contentRect.y, widget.contentRect.width, widget.contentRect.height );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleGL, widget.contentRect, this.skin.ScrollBar.BackColor );
    } else {
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.ScrollBar.BackColor );
    }

    if ( widget.direction === VG.UI.ScrollBar.Direction.Vertical )
    {
        if ( widget.contentRect.height <= 10 ) return;

        // --- Vertical

        this.rect1.copy( widget.rect ); this.rect1.width=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.ScrollBar.BorderColor );

        seg1ImageName="scrollbar_vtop";
        seg2ImageName="scrollbar_vmiddle";
        seg3ImageName="scrollbar_vbottom";

        if (  VG.context.workspace.mouseTrackerWidget === widget ) {
            seg1ImageName+="_selected"; seg2ImageName+="_selected"; seg3ImageName+="_selected";
        } else
        if ( !VG.context.workspace.mouseTrackerWidget && widget.handleRect.contains( VG.context.workspace.mousePos ) ) {
            seg1ImageName+="_hover"; seg2ImageName+="_hover"; seg3ImageName+="_hover";
        }

        if ( !this.skin.ScrollBar[seg1ImageName] )
            this.skin.ScrollBar[seg1ImageName]=VG.context.imagePool.getImageByName( seg1ImageName + ".png" );
        if ( !this.skin.ScrollBar[seg2ImageName] )
            this.skin.ScrollBar[seg2ImageName]=VG.context.imagePool.getImageByName( seg2ImageName + ".png" );
        if ( !this.skin.ScrollBar[seg3ImageName] )
            this.skin.ScrollBar[seg3ImageName]=VG.context.imagePool.getImageByName( seg3ImageName + ".png" );

        // ---

        this.rect2.copy( widget.handleRect ); this.rect2.round();
        this.rect2.x+=2; this.rect2.width-=3;

        if ( this.rect2.height >= 10 ) {
            if ( this.skin.ScrollBar[seg1ImageName] ) canvas.drawImage( this.rect2, this.skin.ScrollBar[seg1ImageName] );

            this.rect2.y+=5; this.rect2.height-=10;
            if ( this.skin.ScrollBar[seg2ImageName] ) canvas.drawTiledImage( this.rect2, this.skin.ScrollBar[seg2ImageName], false, true );

            this.rect2.y+=this.rect2.height; this.rect2.height=5;
            if ( this.skin.ScrollBar[seg3ImageName] ) canvas.drawImage( this.rect2, this.skin.ScrollBar[seg3ImageName] );
        } else if ( this.skin.ScrollBar[seg2ImageName] ) canvas.drawTiledImage( this.rect2, this.skin.ScrollBar[seg2ImageName], false, true );
    } else
    if ( widget.direction === VG.UI.ScrollBar.Direction.Horizontal )
    {
        if ( widget.contentRect.width <= 10 ) return;

        // --- Horizontal

        this.rect1.copy( widget.rect ); this.rect1.height=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.ScrollBar.BorderColor );

        seg1ImageName="scrollbar_hleft";
        seg2ImageName="scrollbar_hmiddle";
        seg3ImageName="scrollbar_hright";

        if (  VG.context.workspace.mouseTrackerWidget === widget ) {
            seg1ImageName+="_selected"; seg2ImageName+="_selected"; seg3ImageName+="_selected";
        } else
        if ( !VG.context.workspace.mouseTrackerWidget && widget.handleRect.contains( VG.context.workspace.mousePos ) ) {
            seg1ImageName+="_hover"; seg2ImageName+="_hover"; seg3ImageName+="_hover";
        }

        if ( !this.skin.ScrollBar[seg1ImageName] )
            this.skin.ScrollBar[seg1ImageName]=VG.context.imagePool.getImageByName( seg1ImageName + ".png" );
        if ( !this.skin.ScrollBar[seg2ImageName] )
            this.skin.ScrollBar[seg2ImageName]=VG.context.imagePool.getImageByName( seg2ImageName + ".png" );
        if ( !this.skin.ScrollBar[seg3ImageName] )
            this.skin.ScrollBar[seg3ImageName]=VG.context.imagePool.getImageByName( seg3ImageName + ".png" );

        // ---

        this.rect2.copy( widget.handleRect ); this.rect2.round();
        this.rect2.y+=2; this.rect2.height-=3;

        if ( this.rect2.width >= 10 ) {

            if ( this.skin.ScrollBar[seg1ImageName] ) canvas.drawImage( this.rect2, this.skin.ScrollBar[seg1ImageName] );

            this.rect2.x+=5; this.rect2.width-=10;
            if ( this.skin.ScrollBar[seg2ImageName] ) canvas.drawTiledImage( this.rect2, this.skin.ScrollBar[seg2ImageName], true, false );

            this.rect2.x+=this.rect2.width; this.rect2.width=5;
            if ( this.skin.ScrollBar[seg3ImageName] ) canvas.drawImage( this.rect2, this.skin.ScrollBar[seg3ImageName] );
        } else if ( this.skin.ScrollBar[seg2ImageName] ) canvas.drawTiledImage( this.rect2, this.skin.ScrollBar[seg2ImageName], true, false );
    }

    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- SectionBar

VG.UI.VisualGraphicsStyle.prototype.drawSectionBar=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );
    widget.contentRect.set( widget.rect );

    // --- Draw Header

    this.rect1.set( widget.contentRect ); this.rect1.x+=3; this.rect1.width-=1; this.rect1.height=this.skin.SectionBar.HeaderHeight;
    canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, this.rect1, this.skin.SectionBar.HeaderBorderColor );
    this.rect1.shrink( 1, 1, this.rect1 );
    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect1, this.skin.SectionBar.HeaderBackGradColor1, this.skin.SectionBar.HeaderBackGradColor2 );

    this.rect2.set( this.rect1 );
    canvas.pushFont( this.skin.SectionBar.HeaderFont );
    this.rect2.add( 30, 0, -30, 0, this.rect2 );
    canvas.drawTextRect( widget.text, this.rect2, this.skin.SectionBar.HeaderTextColor, 0, 1 );
    canvas.popFont();

    var imageName="darrow_";
    if ( widget.rightIndicator ) imageName+="right.png";
    else imageName+="left.png";

    var image=VG.context.imagePool.getImageByName( imageName );

    if ( image ) {
        this.rect2.set( this.rect1 );

        if ( widget.rightIndicator ) {
            this.rect2.x+=this.rect2.width - 7 - image.width; this.rect2.width=image.width;
        } else {
            this.rect2.x+=6; this.rect2.width=image.width;
        }

        this.rect2.y+=(this.rect2.height-image.height)/2; this.rect2.height=image.height;
        canvas.drawImage( this.rect2, image );
    }

    // ---

    this.rect1.set( widget.contentRect ); this.rect1.width=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.SectionBar.BackColor );
    this.rect1.x+=1; this.rect1.width=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.SectionBar.BorderColor );
    this.rect1.x+=1; this.rect1.width=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.SectionBar.BackColor );

    widget.contentRect.add( 3, this.skin.SectionBar.HeaderHeight, -3, -this.skin.SectionBar.HeaderHeight, widget.contentRect );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.SectionBar.BackColor );

    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- SectionBarButton

VG.UI.VisualGraphicsStyle.prototype.drawSectionBarButton=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );
    widget.contentRect.set( widget.rect );

    canvas.pushFont( this.skin.SectionBarButton.Font );

    this.rect1.copy( widget.rect );

    if ( widget.stripWidget.activeButton === widget )
    {
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin2px, this.rect1, this.skin.SectionBarButton.SelectedBorderColor );
        this.rect1.shrink( 1, 1, this.rect1 );

        this.rect2.copy( this.rect1 );
        this.rect2.height/=2;
        this.rect2.height = Math.round( this.rect2.height );
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect2, this.skin.SectionBarButton.SelectedBackGradColor1, this.skin.SectionBarButton.SelectedBackGradColor2 );
        this.rect2.y+=this.rect2.height;
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect2, this.skin.SectionBarButton.SelectedBackGradColor2, this.skin.SectionBarButton.SelectedBackGradColor1 );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleCorners, this.rect1, this.skin.SectionBarButton.SelectedBorderColor );

        if ( widget.textArray )
        {
            this.rect1.y-=8;
            canvas.drawTextRect( widget.textArray[0], this.rect1, this.skin.SectionBarButton.SelectedTextColor, 1, 1 );
            this.rect1.y+=16;
            canvas.drawTextRect( widget.textArray[1], this.rect1, this.skin.SectionBarButton.SelectedTextColor, 1, 1 );
        } else
            canvas.drawTextRect( widget.text, this.rect1, this.skin.SectionBarButton.SelectedTextColor, 1, 1 );
    } else
    if ( !VG.context.workspace.mouseTrackerWidget && widget.rect.contains( VG.context.workspace.mousePos ) )
    {
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin2px, this.rect1, this.skin.SectionBarButton.HoverBorderColor );
        this.rect1.shrink( 1, 1, this.rect1 );

        this.rect2.copy( this.rect1 );
        this.rect2.height/=2;
        this.rect2.height = Math.round( this.rect2.height );
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect2, this.skin.SectionBarButton.HoverBackGradColor1, this.skin.SectionBarButton.HoverBackGradColor2 );
        this.rect2.y+=this.rect2.height;
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect2, this.skin.SectionBarButton.HoverBackGradColor2, this.skin.SectionBarButton.HoverBackGradColor1 );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleCorners, this.rect1, this.skin.SectionBarButton.HoverBorderColor );

        if ( widget.textArray )
        {
            this.rect1.y-=8;
            canvas.drawTextRect( widget.textArray[0], this.rect1, this.skin.SectionBarButton.TextColor, 1, 1 );
            this.rect1.y+=16;
            canvas.drawTextRect( widget.textArray[1], this.rect1, this.skin.SectionBarButton.TextColor, 1, 1 );
        } else
            canvas.drawTextRect( widget.text, this.rect1, this.skin.SectionBarButton.TextColor, 1, 1 );
    } else {
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin2px, this.rect1, this.skin.SectionBarButton.BorderColor );
        this.rect1.shrink( 1, 1, this.rect1 );

        this.rect2.copy( this.rect1 );
        this.rect2.height/=2;
        this.rect2.height = Math.round( this.rect2.height );
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect2, this.skin.SectionBarButton.BackGradColor1, this.skin.SectionBarButton.BackGradColor2 );
        this.rect2.y+=this.rect2.height;
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect2, this.skin.SectionBarButton.BackGradColor2, this.skin.SectionBarButton.BackGradColor1 );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleCorners, this.rect1, this.skin.SectionBarButton.BorderColor );

        if ( widget.textArray )
        {
            this.rect1.y-=8;
            canvas.drawTextRect( widget.textArray[0], this.rect1, this.skin.SectionBarButton.TextColor, 1, 1 );
            this.rect1.y+=16;
            canvas.drawTextRect( widget.textArray[1], this.rect1, this.skin.SectionBarButton.TextColor, 1, 1 );
        } else
            canvas.drawTextRect( widget.text, this.rect1, this.skin.SectionBarButton.TextColor, 1, 1 );
    }

    canvas.popFont();
    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- SectionBarSwitch

VG.UI.VisualGraphicsStyle.prototype.drawSectionBarSwitch=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );
    widget.contentRect.set( widget.rect );

    var style=this;
    function drawButton( rect, selected, text )
    {
        var borderColor=style.skin.SectionToolBarButton.BorderColor;
        var backColor;

        if ( selected ) {
            borderColor=style.skin.SectionToolBarButton.BorderSelectedColor;
            backColor=style.skin.SectionToolBarButton.BackSelectedColor;
        }
        else
        if ( !VG.context.workspace.mouseTrackerWidget && rect.contains( VG.context.workspace.mousePos ) ) {
            borderColor=style.skin.SectionToolBarButton.BorderHoverColor;
            backColor=style.skin.SectionToolBarButton.BackHoverColor;
        }

        if ( backColor ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect, backColor );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, rect, borderColor );

        canvas.pushFont( style.skin.SectionBarSwitch.Font );
        canvas.drawTextRect( text, rect, style.skin.SectionBarSwitch.TextColor, 1, 1 );
        canvas.popFont();
    }

    var width=32;

    this.rect1.copy( widget.rect );
    this.rect1.width=width;
    widget.leftRect.copy( this.rect1 );

    drawButton( this.rect1, widget.left, widget.text1 );

    this.rect1.copy( widget.rect );
    this.rect1.x=this.rect1.right() - width;
    this.rect1.width=width;
    widget.rightRect.copy( this.rect1 );

    drawButton( this.rect1, !widget.left, widget.text2 );

    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- SectionToolBar

VG.UI.VisualGraphicsStyle.prototype.drawSectionToolBar=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.rect, this.skin.SectionToolBar.BorderColor1 );
    widget.contentRect.set( widget.rect );
    widget.contentRect.add( 0, 0, -4, 0, widget.contentRect );

    this.rect1.set( widget.rect );
    this.rect1.x+=this.rect1.width-2; this.rect1.width=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.SectionToolBar.BorderColor2 );

    var that=this;
    function drawSectionHeader( rect, layout ) {
        that.rect2.copy( rect );
        that.rect2.height=1;

        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, that.rect2, that.skin.SectionToolBar.HeaderTopBorderColor );

        that.rect2.y+=1;
        that.rect2.height=19;

        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, that.rect2, that.skin.SectionToolBar.HeaderGradColor1,
            that.skin.SectionToolBar.HeaderGradColor2 );
        canvas.pushFont( that.skin.SectionToolBar.HeaderFont );
        canvas.drawTextRect( layout.text, that.rect2, that.skin.SectionToolBar.HeaderTextColor, 1, 1 );
        canvas.popFont();

        that.rect2.y+=19;
        that.rect2.height=1;

        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, that.rect2, that.skin.SectionToolBar.HeaderBottomBorderColor1 );
        that.rect2.y+=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, that.rect2, that.skin.SectionToolBar.HeaderBottomBorderColor2 );

        rect.y+=24; rect.height-=24;
    }

    // ---

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.SectionToolBar.BackColor );

    var yOffset=0;
    for ( var i=0; i < widget.layout.length; ++i )
    {
        this.rect1.set( widget.contentRect );
        this.rect1.y+=yOffset; this.rect1.height-=yOffset;

        var layout=widget.layout.childAt( i );

        //VG.log( "here " +i, this.rect1.toString() );

        drawSectionHeader( this.rect1, layout );

        layout.rect.copy( this.rect1 );
        layout.layout( canvas );

        var layoutHeight=layout.length * this.skin.SectionToolBarButton.Size.height + 4;
        if ( layout.length ) layoutHeight+=layout.length-1;

        yOffset+=24 + layoutHeight;
    }

    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- SectionBarButton

VG.UI.VisualGraphicsStyle.prototype.drawSectionToolBarButton=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );
    widget.contentRect.set( widget.rect );

    this.rect1.copy( widget.rect );

    var borderColor=this.skin.SectionToolBarButton.BorderColor;
    var backColor;

    if ( widget.sectionBarWidget.activeButton === widget ) {
        borderColor=this.skin.SectionToolBarButton.BorderSelectedColor;
        backColor=this.skin.SectionToolBarButton.BackSelectedColor;
    }
    else
    if ( !VG.context.workspace.mouseTrackerWidget && widget.rect.contains( VG.context.workspace.mousePos ) )
    {
        if ( !widget.disabled ) {
            borderColor=this.skin.SectionToolBarButton.BorderHoverColor;
            backColor=this.skin.SectionToolBarButton.BackHoverColor;
        }
    }

    if ( backColor ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, backColor );
    canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, this.rect1, borderColor );

    if ( widget.image )
    {
        let image = widget.image;
        if ( image && image.isValid() ) {

            this.rect2.copy( this.rect1 );

            this.rect2.x+=(this.rect2.width - image.width)/2;
            this.rect2.y+=(this.rect2.height - image.height)/2;
            canvas.drawImage( this.rect2, image );
        }
    } else
    if ( widget.iconName )
    {
        var imageName=widget.iconName;
        var image=VG.context.imagePool.getImageByName( imageName );

        if ( image && image.isValid() ) {

            this.rect2.copy( this.rect1 );

            this.rect2.x+=(this.rect2.width - image.width)/2;
            this.rect2.y+=(this.rect2.height - image.height)/2;
            canvas.drawImage( this.rect2, image );
        }
    } else
    if ( widget.svgName )
    {
        var svg=VG.Utils.getSVGByName( widget.svgName );

        this.rect1.shrink( 8, 8, this.rect1 ); // 2, 2
        svgGroup=svg.getGroupByName( widget.svgGroupName );
        canvas.drawSVG( svg, svgGroup, this.rect1, this.skin.Widget.TextColor );
    }
    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- ShiftWidget

VG.UI.VisualGraphicsStyle.prototype.drawShiftWidget=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );
    widget.contentRect.set( widget.rect );
    widget.contentRect.height=widget.itemHeight;

    if ( !widget.popup )
    {
        // --- Background

        this.rect1.set( widget.contentRect );
        this.rect1.shrink( 1, 0, this.rect1 );

        if ( widget.mouseIsDown )
        {
            this.rect1.height=1;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.SnapperWidgetItem.SelectedTopBorderColor );
            this.rect1.y+=widget.contentRect.height-1;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.SnapperWidgetItem.SelectedBottomBorderColor );

            this.rect1.copy( widget.contentRect );
            this.rect1.shrink( 0, 1, this.rect1 );
            canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect1, this.skin.SnapperWidgetItem.SelectedBackGradColor1, this.skin.SnapperWidgetItem.SelectedBackGradColor2 );
        } else
        if ( !widget.hasHoverState )
        {
            this.rect1.height=1;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.SnapperWidgetItem.TopBorderColor );
            this.rect1.y+=widget.contentRect.height-1;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.SnapperWidgetItem.BottomBorderColor );

            this.rect1.copy( widget.contentRect );
            this.rect1.shrink( 0, 1, this.rect1 );
            canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect1, this.skin.SnapperWidgetItem.BackGradColor1, this.skin.SnapperWidgetItem.BackGradColor2 );
        } else {
            this.rect1.height=1;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.SnapperWidgetItem.HoverTopBorderColor );
            this.rect1.y+=widget.contentRect.height-1;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.SnapperWidgetItem.HoverBottomBorderColor );

            this.rect1.copy( widget.contentRect );
            this.rect1.shrink( 0, 1, this.rect1 );
            canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect1, this.skin.SnapperWidgetItem.HoverBackGradColor1, this.skin.SnapperWidgetItem.HoverBackGradColor2 );
        }


        // --- Arrows

        this.rect2.copy( this.rect1 );

        this.rect2.x+=10; this.rect2.y+=7;
        this.rect2.width=10; this.rect2.height=15;
        canvas.draw2DShape( VG.Canvas.Shape2D.ArrowLeft, this.rect2, this.skin.SnapperWidgetItem.TextColor );

        this.rect2.copy( this.rect1 );

        this.rect2.x+=this.rect2.width - 20; this.rect2.y+=7;
        this.rect2.width=10; this.rect2.height=15;
        canvas.draw2DShape( VG.Canvas.Shape2D.ArrowRight, this.rect2, this.skin.SnapperWidgetItem.TextColor );

        // --- Text

        canvas.pushFont( this.skin.SnapperWidgetItem.Font );

        if ( widget.index !== -1 )
            canvas.drawTextRect( widget.childs[widget.index].text, this.rect1, this.skin.SnapperWidgetItem.TextColor, 1, 1 );

        canvas.popFont();
    } else
    if ( widget.popup )
    {
        this.rect1.set( widget.contentRect );

        widget.itemsDown=widget.childs.length - widget.index - 1;
        if ( widget.itemsDown > widget.maxDown ) widget.itemsDown=widget.maxDown;

        widget.itemsUp=widget.index;
        if ( widget.itemsUp > widget.maxUp ) widget.itemsUp=widget.maxUp;

        canvas.pushFont( this.skin.SnapperWidgetItem.Font );

        // --- Draw Down

        var popupHeight=(widget.itemsDown+1+widget.itemsUp) * widget.itemHeight + widget.childs.length;
        this.rect2.set( this.rect1.x, this.rect1.y - widget.itemsUp * widget.itemHeight, this.rect1.width, popupHeight );

        // ---

        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, this.rect2, this.skin.Window.BorderColor2 );
        this.rect2.shrink( 1, 1, this.rect2 );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, this.skin.Window.BackColor );
        widget.popupRect.copy( this.rect2 );

        this.rect2.height=widget.itemHeight;

        // --- Draw Down
        y=this.rect2.y + widget.itemsUp * widget.itemHeight;
        for( i=0; i <= widget.itemsDown; ++i )
        {
            itemIndex=widget.index + i;
            itemIndex=itemIndex % widget.childs.length;

            this.rect1.set( this.rect2 );
            this.rect1.y=y;

            if ( itemIndex === widget.highlightedIndex )
            {
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.DropDownMenu.ItemSelectedBackColor );
                canvas.drawTextRect( widget.childs[itemIndex].text, this.rect1, this.skin.DropDownMenu.ItemSelectedTextColor, 1, 1 );
            } else {
                canvas.drawTextRect( widget.childs[itemIndex].text, this.rect1, this.skin.Window.HeaderTextColor, 1, 1 );
            }

            y+=widget.itemHeight;
        }

        // --- Draw Up
        y=this.rect2.y;
        for( i=0; i < widget.itemsUp; ++i )
        {
            itemIndex=widget.index - widget.itemsUp + i;

            this.rect1.set( this.rect2 );
            this.rect1.y=y;

            if ( itemIndex === widget.highlightedIndex )
            {
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.DropDownMenu.ItemSelectedBackColor );
                canvas.drawTextRect(  widget.childs[itemIndex].text, this.rect1, this.skin.DropDownMenu.ItemSelectedTextColor, 1, 1 );
            } else {
                canvas.drawTextRect( widget.childs[itemIndex].text, this.rect1, this.skin.Window.HeaderTextColor, 1, 1 );
            }

            y+=widget.itemHeight;
        }

        canvas.popFont();
    }

    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- Slider

VG.UI.VisualGraphicsStyle.prototype.drawSlider=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );
    widget.sliderRect.set( widget.contentRect );

    let leftSpace=Math.ceil( this.skin.Slider.HandleSize / 2 );
    widget.sliderRect.x+=leftSpace;
    widget.sliderRect.width-=leftSpace;
    widget.sliderRect.y=Math.floor( widget.sliderRect.y + (widget.sliderRect.height - this.skin.Slider.BarHeight)/2 );
    widget.sliderRect.height=1;

    let textColor=this.skin.Widget.TextColor;

    let valueText;

    if ( ( widget.step % 1 ) === 0 ) valueText=widget.value.toString();
    else valueText=widget.value.toFixed( 2 );

    let valueTextSize;

    if ( !widget.editable )
        valueTextSize=canvas.getTextSize( valueText );
    else {

        canvas.pushFont( widget.edit.font );
        valueTextSize=canvas.getTextSize( widget.edit.maxString );
        canvas.popFont();

        valueTextSize.width+=16;
        if ( widget.min < 0 ) valueTextSize.width+=6;

        if ( widget.edit.minimumSize.width > valueTextSize.width ) valueTextSize.width=widget.edit.minimumSize.width;
    }

    valueTextSize.width+=10;
    widget.sliderRect.width-=valueTextSize.width;

    let colorObject=this.skin.Slider.BarColors;
    if ( widget.hasHoverState || widget.hasFocusState ) colorObject=this.skin.Slider.FocusHoverBarColors;

    widget.sliderRect.x+=1; widget.sliderRect.width-=2; widget.sliderRect.y+=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.sliderRect, colorObject.Color1 );
    widget.sliderRect.x-=1; widget.sliderRect.width+=2; widget.sliderRect.y+=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.sliderRect, colorObject.Color2 );
    widget.sliderRect.x+=1; widget.sliderRect.width-=1; widget.sliderRect.y+=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.sliderRect, colorObject.Color3 );
    widget.sliderRect.width-=1; widget.sliderRect.y+=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.sliderRect, colorObject.Color4 );
    widget.sliderRect.x-=1; widget.sliderRect.width+=2;

    if ( !widget.editable )
        canvas.drawTextRect( valueText, VG.Core.Rect( widget.sliderRect.right(), widget.contentRect.y, valueTextSize.width, widget.contentRect.height ), textColor, 2, 1 );
    else {
        widget.edit.rect.set( widget.sliderRect.right()+10, widget.contentRect.y, valueTextSize.width-10, widget.contentRect.height );
        widget.edit.paintWidget( canvas );
    }

    // --- Draw the handle

    let offset;

    if ( !widget.halfWidthValue )
    {
        // --- Normal Mode

        distance=widget.max - widget.min;
        perPixel=widget.sliderRect.width / distance;
        valueOffset=widget.value - widget.min;

        offset=valueOffset * perPixel;
    } else
    {
        // --- A value is predefined at the middle of the slider

        if ( widget.value <= widget.halfWidthValue )
        {

            distance=widget.halfWidthValue - widget.min;
            perPixel=widget.sliderRect.width / 2 / distance;
            valueOffset=widget.value - widget.min;

            offset=valueOffset * perPixel;
        } else
        {
            distance=widget.max - widget.halfWidthValue;
            perPixel=widget.sliderRect.width / 2 / distance;
            valueOffset=widget.value - widget.halfWidthValue;

            offset=widget.sliderRect.width / 2 + valueOffset * perPixel;
        }
    }

    widget.sliderHandleRect.x=widget.sliderRect.x + offset - leftSpace;
    widget.sliderHandleRect.y=widget.contentRect.y + (widget.contentRect.height - this.skin.Slider.HandleSize)/2;
    widget.sliderHandleRect.width=this.skin.Slider.HandleSize;
    widget.sliderHandleRect.height=this.skin.Slider.HandleSize;

    let imageName="slider";
    //if ( widget.hasHoverState ) imageName+="_hover";
    if ( widget.hasFocusState ) imageName+="_focus";
    imageName+=".png";

    let image=VG.context.imagePool.getImageByName( imageName );

    if ( image ) canvas.drawImage( widget.sliderHandleRect, image );
    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- Round Slider

VG.UI.VisualGraphicsStyle.prototype.drawRoundSlider=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );
    widget.sliderRect.set( widget.contentRect );

    let skin=this.skin.RoundSlider;

    let leftSpace=Math.ceil( skin.HandleSize / 2 );
    widget.sliderRect.x+=leftSpace;
    widget.sliderRect.width-=leftSpace;
    widget.sliderRect.y=Math.floor( widget.sliderRect.y + (widget.sliderRect.height - skin.BarHeight)/2 );
    widget.sliderRect.height=1;

    let textColor=this.skin.Widget.TextColor;

    let valueText;
    let valueTextSize;

    if ( !widget.noValue )
    {
        if ( ( widget.step % 1 ) === 0 ) valueText=widget.value.toString();
        else valueText=widget.value.toFixed( 2 );


        if ( !widget.editable )
            valueTextSize=canvas.getTextSize( valueText );
        else {

            canvas.pushFont( widget.edit.font );
            valueTextSize=canvas.getTextSize( widget.edit.maxString );
            canvas.popFont();

            valueTextSize.width+=16;
            if ( widget.min < 0 ) valueTextSize.width+=6;

            if ( widget.edit.minimumSize.width > valueTextSize.width ) valueTextSize.width=widget.edit.minimumSize.width;
        }

        valueTextSize.width+=10;
        widget.sliderRect.width-=valueTextSize.width;
    }

    if ( !widget.noValue )
    {
        if ( !widget.editable )
            canvas.drawTextRect( valueText, VG.Core.Rect( widget.sliderRect.right(), widget.contentRect.y, valueTextSize.width, widget.contentRect.height ).round(), textColor, 2, 1 );
        else {
            widget.edit.rect.set( Math.ceil( widget.sliderRect.right()+10 ), widget.contentRect.y, Math.ceil( valueTextSize.width-10 ), widget.contentRect.height );
            widget.edit.paintWidget( canvas );
        }
    }

    // --- Draw the handle

    let offset;

    if ( !widget.halfWidthValue )
    {
        // --- Normal Mode

        distance=widget.max - widget.min;
        perPixel=widget.sliderRect.width / distance;
        valueOffset=widget.value - widget.min;

        offset=valueOffset * perPixel;
    } else
    {
        // --- A value is predefined at the middle of the slider

        if ( widget.value <= widget.halfWidthValue )
        {

            distance=widget.halfWidthValue - widget.min;
            perPixel=widget.sliderRect.width / 2 / distance;
            valueOffset=widget.value - widget.min;

            offset=valueOffset * perPixel;
        } else
        {
            distance=widget.max - widget.halfWidthValue;
            perPixel=widget.sliderRect.width / 2 / distance;
            valueOffset=widget.value - widget.halfWidthValue;

            offset=widget.sliderRect.width / 2 + valueOffset * perPixel;
        }
    }

    let leftColors=skin.LeftTrackColors, rightColors=skin.RightTrackColors;
    // if ( widget.hasHoverState || widget.hasFocusState ) colorObject=this.skin.Slider.FocusHoverBarColors;

    this.rect1.copy( widget.sliderRect );
    this.rect1.x+=1; this.rect1.width=offset; this.rect1.y+=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, leftColors.Color1 );
    this.rect1.x+=offset; this.rect1.width=widget.sliderRect.width - offset - 2;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, rightColors.Color1 );

    this.rect1.x=widget.sliderRect.x; this.rect1.width=offset; this.rect1.y+=1; this.rect1.height=2;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, leftColors.Color3 );
    this.rect1.x+=offset; this.rect1.width=widget.sliderRect.width - offset;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, rightColors.Color3 );

    this.rect1.x=widget.sliderRect.x + 1; this.rect1.width=offset; this.rect1.height=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, leftColors.Color2 );
    this.rect1.x+=offset; this.rect1.width=widget.sliderRect.width - offset - 2;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, rightColors.Color2 );

    widget.sliderHandleRect.x=widget.sliderRect.x + offset - leftSpace;
    widget.sliderHandleRect.y=widget.contentRect.y + (widget.contentRect.height - skin.HandleSize)/2;
    widget.sliderHandleRect.width=skin.HandleSize;
    widget.sliderHandleRect.height=skin.HandleSize;

    if ( widget.hasFocusState )
        canvas.draw2DShape( VG.Canvas.Shape2D.Circle, widget.sliderHandleRect, skin.SelectedOuterKnobColor );
    else canvas.draw2DShape( VG.Canvas.Shape2D.Circle, widget.sliderHandleRect, skin.OuterKnobColor );

    widget.sliderHandleRect.shrink( 2, 2, this.rect1 );
    canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.rect1, skin.KnobColor );

    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- VG.UI.SplitLayout --- SplitHandle

VG.UI.VisualGraphicsStyle.prototype.drawSnapperWidgetItem=function( widget, canvas )
{
    // --- Background

    this.rect1.copy( widget.rect );
    this.rect1.shrink( 1, 0, this.rect1 );

    if ( widget.mouseIsDown )
    {
        this.rect1.height=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.SnapperWidgetItem.SelectedTopBorderColor );
        this.rect1.y+=widget.rect.height-1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.SnapperWidgetItem.SelectedBottomBorderColor );

        this.rect1.copy( widget.rect );
        this.rect1.shrink( 0, 1, this.rect1 );
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect1, this.skin.SnapperWidgetItem.SelectedBackGradColor1, this.skin.SnapperWidgetItem.SelectedBackGradColor2 );
    } else
    if ( !widget.hasHoverState )
    {
        this.rect1.height=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.SnapperWidgetItem.TopBorderColor );
        this.rect1.y+=widget.rect.height-1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.SnapperWidgetItem.BottomBorderColor );

        this.rect1.copy( widget.rect );
        this.rect1.shrink( 0, 1, this.rect1 );
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect1, this.skin.SnapperWidgetItem.BackGradColor1, this.skin.SnapperWidgetItem.BackGradColor2 );
    } else {
        this.rect1.height=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.SnapperWidgetItem.HoverTopBorderColor );
        this.rect1.y+=widget.rect.height-1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.SnapperWidgetItem.HoverBottomBorderColor );

        this.rect1.copy( widget.rect );
        this.rect1.shrink( 0, 1, this.rect1 );
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect1, this.skin.SnapperWidgetItem.HoverBackGradColor1, this.skin.SnapperWidgetItem.HoverBackGradColor2 );
    }

    // --- Arrow

    this.rect2.copy( this.rect1 );

    if ( widget.open ) {
        this.rect2.x+=6; this.rect2.y+=7;
        this.rect2.width=10; this.rect2.height=5;
        canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, this.rect2, this.skin.SnapperWidgetItem.TextColor );
    } else {
        this.rect2.x+=9; this.rect2.y+=5;
        this.rect2.width=5; this.rect2.height=10;
        canvas.draw2DShape( VG.Canvas.Shape2D.ArrowRight, this.rect2, this.skin.SnapperWidgetItem.TextColor );
    }

    // --- Enabler

    if ( widget.enablerCB )
    {
        widget.enablerCB.rect.copy( this.rect1 );
        widget.enablerCB.rect.x+=(this.rect1.width - widget.enablerCB.minimumSize.width) - 10;
        widget.enablerCB.rect.y+=(this.rect1.height - widget.enablerCB.minimumSize.height)/2;
        widget.enablerCB.rect.width=widget.enablerCB.minimumSize.width;
        widget.enablerCB.rect.height=widget.enablerCB.minimumSize.height;
        widget.enablerCB.paintWidget( canvas );
    }

    // --- Text

    this.rect1.x+=30; this.rect1.width-=30;
    this.rect1.height-=2;

    canvas.pushFont( this.skin.SnapperWidgetItem.Font );
    canvas.drawTextRect( widget.text, this.rect1, this.skin.SnapperWidgetItem.TextColor, 0, 1 );
    canvas.popFont();
};

// --- VG.UI.SplitLayout --- SplitHandle

VG.UI.VisualGraphicsStyle.prototype.drawSplitHandle=function( canvas, layout, pos, itemRect, childRect, dragging, hover )
{
    itemRect[layout.primaryCoord]=pos + childRect[layout.primarySize];
    itemRect[layout.secondaryCoord]=layout.margin[layout.secondaryLesserMargin] + layout.rect[layout.secondaryCoord];
    itemRect[layout.primarySize]=this.skin.SplitLayout.Size;
    itemRect[layout.secondarySize]=layout.rect[layout.secondarySize] - layout.margin[layout.secondaryLesserMargin] - layout.margin[layout.secondaryGreaterMargin];

    this.rect1.copy( itemRect );

    var backColor, borderColor;

    if ( dragging ) {
        backColor=this.skin.SplitLayout.DragBackColor; borderColor=this.skin.SplitLayout.DragBorderColor;
    } else
    if ( hover ) {
        backColor=this.skin.SplitLayout.HoverBackColor; borderColor=this.skin.SplitLayout.HoverBorderColor;
    } else {
        backColor=this.skin.SplitLayout.BackColor; borderColor=this.skin.SplitLayout.BorderColor;
    }

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect, backColor );

    if ( layout.vertical )
    {
        var lowerLine=this.rect1.y + this.rect1.height-1;
        this.rect1.height=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, borderColor );
        this.rect1.y=lowerLine;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, borderColor );
    } else
    {
        var rightLine=this.rect1.x + this.rect1.width-1;
        this.rect1.width=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, borderColor );
        this.rect1.x=rightLine;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, borderColor );
    }
};

// --- StatusBar

VG.UI.VisualGraphicsStyle.prototype.drawStatusBar=function( widget, canvas )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.rect, this.skin.StatusBar.BorderColor );

    this.rect1.set( widget.rect ); this.rect1.y+=1; this.rect1.height-=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.StatusBar.BackColor );
};

// --- TabWidgetHeader

VG.UI.VisualGraphicsStyle.prototype.drawTabWidgetHeader=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );

    this.rect1.copy( widget.rect );

    if ( widget.small )
    {
        // --- Left Border

        var skin=this.skin.TabWidgetSmallHeader;

        this.rect1.width=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, skin.LeftBorderColor );

        // --- Universal Bottom Border

        this.rect1.width=widget.rect.width;
        this.rect1.y+=skin.Height+2; this.rect1.height=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, skin.TabBorderColor );

        // --- Tabs

        this.rect2.copy( widget.rect );
        this.rect2.x+=1; this.rect2.height=23;
        this.rect2.y+=2;

        canvas.pushFont( skin.Font );

        for ( var i=0; i < widget.items.length; ++i )
        {
            var item=widget.items[i];
            this.rect2.width=canvas.getTextSize( item.text, this.rect4 ).width + 30;
            item.rect.copy( this.rect2 );

            canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, this.rect2, skin.TabBorderColor );

            this.rect3.copy( this.rect2 );
            this.rect3.shrink( 1, 1, this.rect3 );

            if ( item.object === widget.layout.current )
            {
                canvas.draw2DShape( VG.Canvas.Shape2D.RectangleCorners, this.rect3, skin.SelectedEdgeBorderColor );
                canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, this.rect3, skin.SelectedTopBorderColor );

                this.rect3.y+=1;
                canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect3, skin.SelectedSideBorderColor1, skin.SelectedSideBorderColor2 );
                this.rect3.height+=2;
                this.rect3.y-=1;

                this.rect3.shrink( 1, 1, this.rect3 );
                canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect3, skin.SelectedBackGradientColor1, skin.SelectedBackGradientColor2 );
            } else
            if ( !VG.context.workspace.mouseTrackerWidget && this.rect2.contains( VG.context.workspace.mousePos ) ) {
                canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect3, skin.HoverBackGradientColor1, skin.HoverBackGradientColor2 );
            } else {
                canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect3, skin.BackGradientColor1, skin.BackGradientColor2 );
            }

            canvas.drawTextRect( item.text, this.rect2, skin.TextColor, 1, 1 );

            this.rect2.x+=this.rect2.width + 2;
        }

        canvas.popFont();

        // ---

        widget.contentRect.set( widget.rect );
        widget.contentRect.add( 0, skin.Height+2, 0, -skin.Height-2, widget.contentRect );
    } else
    {
        // --- Left Border

        this.rect1.width=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.TabWidgetHeader.LeftBorderColor );

        // --- Universal Bottom Border

        this.rect1.width=widget.rect.width;
        this.rect1.y+=this.skin.TabWidgetHeader.Height - 5; this.rect1.height=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.TabWidgetHeader.TabBorderColor );
        this.rect1.y+=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.TabWidgetHeader.BottomBorderColor1 );
        this.rect1.y+=1; this.rect1.height=3;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.TabWidgetHeader.BottomBorderColor2 );

        // --- Tabs

        this.rect2.copy( widget.rect );
        this.rect2.x+=1; this.rect2.height=28;

        canvas.pushFont( this.skin.TabWidgetHeader.Font );

        for ( let i=0; i < widget.items.length; ++i )
        {
            let item=widget.items[i];
            this.rect2.width=canvas.getTextSize( item.text, this.rect4 ).width + 70;
            item.rect.copy( this.rect2 );

            canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, this.rect2, this.skin.TabWidgetHeader.TabBorderColor );

            this.rect3.copy( this.rect2 );
            this.rect3.shrink( 1, 1, this.rect3 );

            if ( item.object === widget.layout.current )
            {
                canvas.draw2DShape( VG.Canvas.Shape2D.RectangleCorners, this.rect3, this.skin.TabWidgetHeader.SelectedEdgeBorderColor );
                canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, this.rect3, this.skin.TabWidgetHeader.SelectedTopBorderColor );

                this.rect3.y+=1;
                canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect3, this.skin.TabWidgetHeader.SelectedSideBorderColor1, this.skin.TabWidgetHeader.SelectedSideBorderColor2 );
                this.rect3.height+=3;
                this.rect3.y-=1;

                this.rect3.shrink( 1, 1, this.rect3 );
                canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect3, this.skin.TabWidgetHeader.SelectedBackGradientColor1, this.skin.TabWidgetHeader.SelectedBackGradientColor2 );
            } else
            if ( !VG.context.workspace.mouseTrackerWidget && this.rect2.contains( VG.context.workspace.mousePos ) ) {
                canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect3, this.skin.TabWidgetHeader.HoverBackGradientColor1, this.skin.TabWidgetHeader.HoverBackGradientColor2 );
            } else {
                canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect3, this.skin.TabWidgetHeader.BackGradientColor1, this.skin.TabWidgetHeader.BackGradientColor2 );
            }

            canvas.drawTextRect( item.text, this.rect2, this.skin.TabWidgetHeader.TextColor, 1, 1 );

            this.rect2.x+=this.rect2.width + 4;
        }

        canvas.popFont();

        // ---

        widget.contentRect.set( widget.rect );
        widget.contentRect.add( 0, this.skin.TabWidgetHeader.Height, 0, -this.skin.TabWidgetHeader.Height, widget.contentRect );
    }

    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- TextEdit

VG.UI.VisualGraphicsStyle.prototype.drawTextEdit=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );
    widget.contentRect.set( widget.rect );

    if ( widget.dragging && widget.selectionIsValid )
        widget.autoScroll();

    if ( !widget.rect.equals( widget.previousRect ) ) widget.verified=false;

    widget.contentRect.set( widget.rect );
    if ( widget.hasFocusState ) {
        widget.contentRect.shrink( 3, 3, this.rect1 );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.TextEdit.FocusBackgroundColor );


        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin2px, widget.contentRect, this.skin.TextEdit.FocusBorderColor1 );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleCorners, widget.contentRect, this.skin.TextEdit.FocusBorderColor1 );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.TextEdit.FocusBorderColor2 );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleCorners, widget.contentRect, this.skin.TextEdit.FocusBorderColor2 );

        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.TextEdit.FocusBorderColor3 );

        widget.contentRect.shrink( 2, 2, widget.contentRect );
    } else
    {
        widget.contentRect.shrink( 3, 3, this.rect1 );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.TextEdit.BackgroundColor );

        widget.contentRect.shrink( 1, 1, widget.contentRect );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.TextEdit.BorderColor1 );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, widget.contentRect, this.skin.TextEdit.BorderColor2 );

        widget.contentRect.shrink( 1, 1, widget.contentRect );
    }

    if ( !widget.textLines ) return;

    widget.font=VG.UI.stylePool.current.skin.TextEdit.Font;
    canvas.pushFont(widget.font);

    canvas.pushClipRect( widget.contentRect );
    widget.contentRect=widget.contentRect.add( 4, 2, -8, -4 );

    if ( !widget.verified || canvas.hasBeenResized )
        widget.verifyScrollbar();

    if ( widget.needsVScrollbar )
        widget.contentRect.width-=VG.UI.stylePool.current.skin.ScrollBar.Size;

    if ( widget.needsHScrollbar )
        widget.contentRect.height-=VG.UI.stylePool.current.skin.ScrollBar.Size;

    // ---

    var textColor=this.skin.TextEdit.TextColor;

    var paintRect=VG.Core.Rect();
    paintRect.x=widget.contentRect.x - widget.textOffset.x;
    paintRect.y=widget.contentRect.y - widget.textOffset.y;
    paintRect.width=widget.maxTextLineSize.width;
    paintRect.height=widget.maxTextLineSize.height;

    for ( var i=0; i < widget.textLines; ++i ) {

        if ( paintRect.y + widget.itemHeight >= widget.contentRect.y || paintRect.y < widget.contentRect.bottom() ) {

            var text=widget.textArray[i];

            if ( widget.selectionIsValid && widget.hasFocusState )
                widget.drawSelectionForLine( canvas, i, paintRect, text, this.skin.TextEdit.FocusBorderColor2 );
            else if ( widget.selectionIsValid )
                widget.drawSelectionForLine( canvas, i, paintRect, text, this.skin.TextEdit.BorderColor2 );


            canvas.drawTextRect( text, paintRect, textColor, widget.hAlignment, 1 );

            paintRect.y+=widget.itemHeight;
        }

        if ( paintRect.y > widget.contentRect.bottom() ) break;
    }

    if ( widget.needsVScrollbar ) {

        widget.setVScrollbarDimensions( canvas );
        widget.vScrollbar.paintWidget( canvas );
    }

    if ( widget.needsHScrollbar ) {

        widget.setHScrollbarDimensions( canvas );
        widget.hScrollbar.paintWidget( canvas );
    }

    if ( !widget.readOnly ) widget.blink( canvas );
    widget.previousRect.set( widget.rect );

    canvas.popFont();
    canvas.popClipRect();

    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- TextLineEdit

VG.UI.VisualGraphicsStyle.prototype.drawTextLineEdit=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );

    // --- Border

    widget.contentRect.set( widget.rect );
    if ( widget.hasFocusState ) {
        widget.contentRect.shrink( 2, 2, this.rect1 );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.TextLineEdit.FocusBackgroundColor );

        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin2px, widget.contentRect, this.skin.TextLineEdit.FocusBorderColor1 );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleCorners, widget.contentRect, this.skin.TextLineEdit.FocusBorderColor1 );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.TextLineEdit.FocusBorderColor2 );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleCorners, widget.contentRect, this.skin.TextLineEdit.FocusBorderColor2 );

        widget.contentRect.shrink( 1, 0, this.rect1 );
        this.rect1.height=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.TextLineEdit.FocusBorderColor3 );

        widget.contentRect.shrink( 0, 1, this.rect1 );
        this.rect1.width=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.TextLineEdit.FocusBorderColor3 );

        widget.contentRect.shrink( 1, 1, widget.contentRect );
    } else
    {
        widget.contentRect.shrink( 3, 3, this.rect1 );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.TextLineEdit.BackgroundColor );

        widget.contentRect.shrink( 1, 1, widget.contentRect );

        if ( widget.customBorderColor ) canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, widget.customBorderColor );
        else canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.TextLineEdit.BorderColor1 );
        //canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.TextLineEdit.BorderColor1 );
        widget.contentRect.shrink( 1, 1, widget.contentRect );

        //if ( widget.customBorderColor ) canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, widget.contentRect, widget.customBorderColor );
        //else
            canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, widget.contentRect, this.skin.TextLineEdit.BorderColor2 );

        widget.contentRect.shrink( 1, 1, widget.contentRect );
    }

    // ---

    widget.contentRect.shrink( 5, 0, widget.contentRect );

    var textLine;

    widget.font.setFont( this.skin.TextLineEdit.Font );
    canvas.pushFont(widget.font);

    if ( !widget.textLines || ( widget.textArray && !widget.textArray[0].length ) && !widget.hasFocusState )
    {
        if ( widget.defaultText ) {
            canvas.drawTextRect( widget.defaultText, widget.contentRect, this.skin.TextLineEdit.DefaultTextColor, 0, 1 );
        }
        canvas.popFont();
        if ( widget.disabled ) canvas.setAlpha( 1 );
        return;
    } else textLine=widget.textArray[0];

    var textColor=this.skin.TextLineEdit.TextColor;

    widget.textOffset.x=0;
    if ( textLine !== undefined ) {

        var size=VG.Core.Size();
        var offset=0;
        var text=textLine.slice( offset );
        canvas.getTextSize( text, size );

        while ( ( (size.width /*+ 3 */) > widget.contentRect.width ) && text.length )
        {
            // --- Text is too long for the contentRect, cut of chars at the front until it fits.

            if ( offset >= widget.cursorPosition.x ) break;

            ++offset;
            text=textLine.slice( offset );
            canvas.getTextSize( text, size );
        }


        if ( widget.selectionIsValid && widget.hasFocusState )
            widget.drawSelectionForLine( canvas, 0, widget.contentRect, text, this.skin.TextLineEdit.FocusBorderColor2 );
        else if ( widget.selectionIsValid )
            widget.drawSelectionForLine( canvas, 0, widget.contentRect, text, this.skin.TextLineEdit.BorderColor2 );

        if ( !widget.password )
            canvas.drawTextRect( text, widget.contentRect, textColor, 0, 1 );
        else
        {
            canvas.pushClipRect( widget.contentRect );

            var circleSize=10;
            var rect=VG.Core.Rect( widget.contentRect );
            rect.y=rect.y + ( widget.contentRect.height - circleSize ) /2;
            rect.width=circleSize; rect.height=circleSize;

            for ( var i=0; i < text.length; ++i )
            {
                canvas.draw2DShape( VG.Canvas.Shape2D.Circle, rect, textColor );
                rect.x+=circleSize + 2;
            }

            canvas.popClipRect();
        }
    }

    widget.blink( canvas, widget.contentRect.y+1, widget.contentRect.height-2 );
    canvas.popFont();
    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- TitleBar

VG.UI.VisualGraphicsStyle.prototype.drawTitleBar=function( canvas, rect, title )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, rect, this.skin.TitleBar.BorderColor );

    this.rect4.copy( rect );
    this.rect4.shrink( 1, 1, this.rect4 );

    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect4, this.skin.TitleBar.BackGradColor1, this.skin.TitleBar.BackGradColor2 );

    this.rect4.x+=4;
    canvas.pushFont( this.skin.TitleBar.Font );
    canvas.drawTextRect( title, this.rect4, this.skin.TitleBar.TextColor, 0, 1 );
    canvas.popFont();
};

// --- TitleBar

VG.UI.VisualGraphicsStyle.prototype.drawToolSettings = function( widget, canvas )
{
    if ( canvas.twoD )
        canvas.clearGLRect( widget.contentRect );

    if ( widget.hasHoverState ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.ToolSettings.HoverBorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.ToolSettings.HoverBackColor );
    } else if ( widget.open ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.ToolSettings.OpenBorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.ToolSettings.OpenBackColor );
    } else {
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.ToolSettings.BorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.ToolSettings.BackColor );
    }

    if ( widget.label ) {
        widget.label.rect.copy( widget.rect );
        widget.label.paintWidget( canvas );
    }

    if ( widget.open )
    {
        this.rect1.x = widget.rect.x;
        this.rect1.y = widget.parent.rect.bottom();
        this.rect1.width = widget.options.width || 435;
        this.rect1.height = widget.options.height || 512;

        if ( this.rect1.bottom() > VG.context.workspace.rect.height ) {
            // --- If not enough vertical space, check if widget is in toolbar (< 100 ) and if yes truncate its height, otherwise
            // move the widget up.
            if ( this.rect1.y < 100 ) this.rect1.height = VG.context.workspace.rect.height - this.rect1.y - 20;
            else {
                // --- If widget has header, just move it up, as it has its own close symbol
                if ( !widget.options.noHeader ) this.rect1.y -= VG.context.workspace.rect.height - this.rect1.y;
                else // Otherwise align it on top of the opening symbol
                this.rect1.y = widget.parent.rect.y - this.rect1.height;// - widget.contentRect.height;
            }
        }

        if ( widget.options.left || this.rect1.right() > VG.context.workspace.rect.width )
            this.rect1.x -= this.rect1.width - widget.rect.width;

        widget.popupRect.copy( this.rect1 );
        widget.widget.rect.copy( this.rect1 );

        if ( canvas.twoD )
            canvas.clearGLRect( this.rect1 );

        // --- Background
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, this.rect1, this.skin.ToolSettings.ContentBorderColor );
        this.rect1.shrink( 1, 1, this.rect1 );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.ToolSettings.ContentBackColor );
        this.rect1.shrink( 1, 1, this.rect1 );

        if ( !widget.options.noHeader ) {

            if ( widget.options.text ) {
                this.rect2.copy( this.rect1 );
                this.rect2.y += 23;
                this.rect2.x = this.rect1.x + 6;

                canvas.pushFont( this.skin.ToolSettings.HeaderFont );
                canvas.drawTextRect( widget.options.text, this.rect2, this.skin.Widget.TextColor, 0, 0 );
                canvas.popFont();
            }

            // --- Close Button

            this.rect2.x=this.rect1.right() - 10 - 37;
            this.rect2.y=this.rect1.y + 10;
            this.rect2.width=this.rect2.height=37;

            widget.closeButtonRect.copy( this.rect2 );

            if ( this.rect2.contains( VG.context.workspace.mousePos ) ) {
                canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, this.rect2, this.skin.ToolSettings.HoverBorderColor );
                this.rect2.shrink( 1, 1, this.rect2 );
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, this.skin.ToolSettings.HoverBackColor );
            } else {
                canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, this.rect2, this.skin.ToolSettings.BorderColor );
                this.rect2.shrink( 1, 1, this.rect2 );
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, this.skin.ToolSettings.BackColor );
            }

            var svg=VG.Utils.getSVGByName( "glyphs.svg" );
            if ( svg ) {
                this.rect2.shrink( 7, 7, this.rect2 );

                svgGroup=svg.getGroupByName( "Close" );
                canvas.drawSVG( svg, svgGroup, this.rect2, this.skin.Widget.TextColor );
            }

            // ---

            this.rect1.y+=46;
            this.rect1.height-=46;
        }

        if ( widget.widget.layout ) {
            widget.widget.layout.rect.copy( this.rect1 );
            widget.widget.layout.layout( canvas );
        }
    }
};

// --- ToolBar

VG.UI.VisualGraphicsStyle.prototype.drawToolBar=function( widget, canvas )
{
    this.rect1.copy( widget.rect ); this.rect1.height=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.ToolBar.TopBorderColor );
    this.rect1.y+=widget.rect.height-1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.ToolBar.BottomBorderColor );

    widget.contentRect.copy( widget.rect );
    widget.contentRect.shrink( 0, 1, widget.contentRect );
    //canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, widget.contentRect, this.skin.ToolBar.BackGradColor1, this.skin.ToolBar.BackGradColor2 );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.ToolBar.BackGradColor );
};

// --- ToolBarButton

VG.UI.VisualGraphicsStyle.prototype.drawToolBarButton=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );
    widget.contentRect.copy( widget.rect );

    // --- Border / Background

    if ( widget.mouseIsDown && !widget.disabled || widget.checked ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.ToolBarButton.ClickedBorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect);
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.ToolBarButton.ClickedBackColor );
    } else
    if ( widget.hasHoverState ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.ToolBarButton.HoverBorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect);
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.ToolBarButton.HoverBackColor );
    } else {
        if ( widget.parent && !widget.parent.decorated )
        {
            canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.ToolBarButton.BorderColor );
            widget.contentRect.shrink( 1, 1, widget.contentRect);
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.ToolBarButton.BackColor );
        }
    }

    canvas.pushClipRect( widget.contentRect );

    if ( widget.svgName || widget.svg ) {
        // --- SVG
        if ( !widget.svg )
            widget.svg=VG.Utils.getSVGByName( widget.svgName );
        if ( widget.svg )
        {
            svgGroup=widget.svg.getGroupByName( widget.svgGroupName );
            widget.rect.shrink( 3, 3, this.rect4 );
            canvas.drawSVG( widget.svg, svgGroup, this.rect4, this.skin.ToolBarButton.TextColor );
        }
    } else
    if ( widget.icon || widget.iconName ) {
        // --- Icon
        if ( !widget.icon ) widget.icon=VG.context.imagePool.getImageByName( widget.iconName );
        if ( widget.icon && widget.icon.isValid() )
        {
            let x=Math.round( widget.contentRect.x + (widget.contentRect.width - widget.icon.width)/2 );
            let y=Math.round( widget.contentRect.y + (widget.contentRect.height - widget.icon.height)/2);

            canvas.drawImage( { x : x, y : y }, widget.icon );
        }
    }  else {
        // --- Text
        canvas.pushFont( this.skin.ToolBarButton.Font );
        canvas.drawTextRect( widget.text, widget.contentRect, this.skin.ToolBarButton.TextColor, 1, 1 );
        canvas.popFont();
    }

    canvas.popClipRect();

    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- ToolButton

VG.UI.VisualGraphicsStyle.prototype.drawToolButton=function( widget, canvas )
{
    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );
    widget.contentRect.copy( widget.rect );

    // --- Border / Background

    if ( widget.mouseIsDown && !widget.disabled || widget.checked ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.ToolButton.ClickedBorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect);
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.ToolButton.ClickedBackColor );
    } else
    if ( widget.hasHoverState ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.ToolButton.HoverBorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect);
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.ToolButton.HoverBackColor );
    } else {
        if ( widget.parent && !widget.parent.decorated )
        {
            canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.ToolButton.BorderColor );
            widget.contentRect.shrink( 1, 1, widget.contentRect);
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.ToolButton.BackColor );
        }
    }

    canvas.pushClipRect( widget.contentRect );

    if ( widget.svgName || widget.svg ) {
        // --- SVG
        if ( !widget.svg ) widget.svg=VG.Utils.getSVGByName( widget.svgName );
        if ( widget.svg )
        {
            svgGroup=widget.svg.getGroupByName( widget.svgGroupName );
            widget.rect.shrink( this.skin.ToolButton.Margin.width, this.skin.ToolButton.Margin.height, this.rect4 );
            canvas.drawSVG( widget.svg, svgGroup, this.rect4, this.skin.ToolButton.Color );
        }
    } else
    if ( widget.icon || widget.iconName ) {
        // --- Icon
        if ( !widget.icon ) widget.icon=VG.context.imagePool.getImageByName( widget.iconName );
        if ( widget.icon && widget.icon.isValid() )
        {
            var x=Math.round( widget.contentRect.x + (widget.contentRect.width - widget.icon.width)/2 );
            var y=Math.round( widget.contentRect.y + (widget.contentRect.height - widget.icon.height)/2 );

            canvas.drawImage( VG.Core.Point( x, y ), widget.icon );
        }
    }

    canvas.popClipRect();

    if ( widget.disabled ) canvas.setAlpha( 1 );
};


// --- ToolSeparator

VG.UI.VisualGraphicsStyle.prototype.drawToolSeparator=function( widget, canvas )
{
    this.rect1.copy( widget.rect );
    this.rect1.y+=(widget.rect.height - this.skin.ToolBar.Separator.Size.height)/2;
    this.rect1.height=this.skin.ToolBar.Separator.Size.height; this.rect1.width=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.ToolBar.Separator.Color1 );
    this.rect1.x+=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.ToolBar.Separator.Color2 );
};

// --- ListWidget

VG.UI.VisualGraphicsStyle.prototype.drawTreeWidget=function( widget, canvas )
{
    var itemHeight=widget.itemHeight;

    // --- drawItemChildren

    function drawItemChildren( style, paintRect, item, selBackgroundRect )
    {
        if ( item.children && item.open )
        {
            var oldXOffset=paintRect.x;
            var oldWidth=paintRect.width;

            paintRect.x+=2*style.skin.TreeWidget.ChildIndent;
            paintRect.width-=2*style.skin.TreeWidget.ChildIndent;

            // --- Draw all childs

            for ( var i=0; i < item.children.length; ++i )
            {
                var child=item.children[i];

                ++widget._itemsCount;

                if ( 1 )//paintRect.y + this.itemHeight < ( this.rect.y+this.rect.height-2 ) )
                {
                    if ( 1 )//this._itemsCount >= this.offset )
                    {
                        widget.items.push( VG.UI.TreeWidgetItem( child, paintRect ) );
                        drawItem( style, child, widget.controller.isSelected( child ), paintRect, selBackgroundRect );

                        paintRect.y+=itemHeight + widget.spacing;
                    }

                    if ( child.children && child.open )
                        drawItemChildren( style, paintRect, child, selBackgroundRect );
                }
            }

            paintRect.x=oldXOffset;
            paintRect.width=oldWidth;
        }
    }

    // ---  drawItem

    function drawItem( style, item, isSelected, rect, contentRect, indentTop )
    {
        // --- Create the properly indented rectangle and set it to rect4

        style.rect3.copy( rect );

        if ( item.children )
        {
            style.rect3.add( style.skin.TreeWidget.ChildIndent, 0, -style.skin.TreeWidget.ChildIndent, 0, style.rect3 );

            if ( item.open ) {
                style.rect4.x=rect.x + 5; style.rect4.width=11;
                style.rect4.y=rect.y + Math.floor( (itemHeight-2)/2); style.rect4.height=2;
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, style.rect4, style.skin.TreeWidget.ChildControlColor );
            } else {
                style.rect4.x=rect.x + 5; style.rect4.width=10;
                style.rect4.y=rect.y + Math.floor( (itemHeight-2)/2); style.rect4.height=2;
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, style.rect4, style.skin.TreeWidget.ChildControlColor );

                style.rect4.x=rect.x + 9; style.rect4.width=2;
                style.rect4.y=rect.y + Math.floor( (itemHeight-10)/2); style.rect4.height=10;
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, style.rect4, style.skin.TreeWidget.ChildControlColor );
            }
        } else {
            if ( indentTop ) style.rect3.add( style.skin.TreeWidget.ChildIndent, 0, -style.skin.TreeWidget.ChildIndent, 0, style.rect3 );
        }

        if ( !isSelected ) {
            canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, style.rect3, style.skin.TreeWidget.ItemBackColor );
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, style.rect3.shrink( 1, 1, style.rect3 ), style.skin.TreeWidget.ItemBackColor );
        } else {
            canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, style.rect3, style.skin.TreeWidget.ItemSelectedBorderColor );
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, style.rect3.shrink( 1, 1, style.rect3 ), style.skin.TreeWidget.ItemSelectedBackColor );
        }

        // --- Insert Potential Child Widgets of Items
        if ( item.childWidgets ) {
            for ( var c=0; c < item.childWidgets.length; ++c ) {
                widget.childWidgets.push( item.childWidgets[c] );
            }
        }
        // ---

        if ( widget.paintItemCallback ) {
            widget.paintItemCallback( canvas, item, style.rect3, isSelected );
        } else
        {
            if ( !widget.columns.length ) {
                style.rect3.x+=7; style.rect3.width-=7;
                canvas.drawTextRect( item.text, style.rect3, style.skin.TreeWidget.TextColor, 0, 1 );
            } else
            {
                let offset = 0;
                for ( let i = 0; i < widget.columns.length; ++i )
                {
                    let column = widget.columns[i];

                    if ( offset > rect.width )
                        break;

                    let width = Math.floor( rect.width *  column.width / 100 );

                    if ( offset + width > rect.width )
                        width -= (offset + width) - rect.width;

                    style.rect3.x = rect.x + offset + 7;
                    style.rect3.width = width - 7;

                    canvas.drawTextRect( item[column.itemName], style.rect3, style.skin.TreeWidget.TextColor, i === 0 ? 0 : 1, 1 );
                    offset += width;
                }
            }
        }
    }

    // ---

    if ( widget.disabled ) canvas.setAlpha( this.skin.Widget.DisabledAlpha );
    widget.contentRect.set( widget.rect );

    // --- Header

    let headerHeight = this.skin.TreeWidget.Header.Height;
    if ( widget.columns.length ) {

        this.rect3.copy( widget.rect );
        this.rect3.height = headerHeight;

        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect3, this.skin.TreeWidget.Header.BorderColor );
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect3.shrink(1,1), this.skin.TreeWidget.Header.BackColor1, this.skin.TreeWidget.Header.BackColor2 );

        widget.contentRect.y += headerHeight;
        widget.contentRect.height -= headerHeight;
    }

    // --- Border

    if ( widget.hasFocusState ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin2px, widget.contentRect, this.skin.TreeWidget.FocusBorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleCorners, widget.contentRect, this.skin.TreeWidget.FocusBorderColor );

        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.TreeWidget.BorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
    } else
    {
        widget.contentRect.shrink( 1, 1, widget.contentRect );
        if ( widget.hasHoverState ) canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.TreeWidget.HoverBorderColor );
        else canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, widget.contentRect, this.skin.TreeWidget.BorderColor );
        widget.contentRect.shrink( 1, 1, widget.contentRect );
    }

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, widget.contentRect, this.skin.TreeWidget.BackColor );

    // ---

    // if ( !widget.controller || !widget.controller.length ) return;
    if ( !widget.controller ) return;

    if ( widget.toolLayout.length > 0 ) widget.contentRect.height-=this.skin.ListWidget.ToolLayoutHeight;

    canvas.pushClipRect( widget.contentRect );

    widget.contentRect.x+=this.skin.ListWidget.Margin.left;
    widget.contentRect.y+=this.skin.ListWidget.Margin.top;
    widget.contentRect.width-=2*this.skin.ListWidget.Margin.right;
    widget.contentRect.height-=2*this.skin.ListWidget.Margin.bottom;

    if ( !widget.verified || canvas.hasBeenResized )
        widget.verifyScrollbar();

    // ---

    widget.childWidgets=[];

    widget.items=null;
    widget.items=[];
    widget._itemsCount=-1;

    var selBackgroundRect=this.rect1; this.rect1.copy( widget.contentRect );
    if ( widget.needsVScrollbar ) selBackgroundRect.width-=this.skin.ScrollBar.Size;

    // ---

    var paintRect=this.rect2; this.rect2.copy( widget.contentRect );
    paintRect.height=itemHeight;

    if ( widget.needsVScrollbar ) paintRect.width-=this.skin.ScrollBar.Size;

    var oldWidth=paintRect.width;
    paintRect.y=widget.contentRect.y - widget.offset;

    // --- Check if top level items should be indented as there are other items with childs

    var indentTop=false;

    for ( var i=0; i < widget.controller.length; ++i )
    {
        // --- Iterate and Draw the Top Level Items

        item=widget.controller.at( i );
        if ( item.children ) { indentTop=true; break; }
    }

    canvas.pushFont( this.skin.TreeWidget.Font );

    // --- Calc Column Dimensions

    let offset = 0;
    for ( let i = 0; i < widget.columns.length; ++i )
    {
        let column = widget.columns[i];

        if ( offset > paintRect.width )
            break;

        let width = Math.floor( paintRect.width *  column.width / 100 );

        if ( offset + width > paintRect.width )
            width -= (offset + width) - paintRect.width;

        column.pixelOffset = offset;
        column.pixelWidth = width;

        offset += width;
    }

    // ---

    for ( i=0; i < widget.controller.length; ++i )
    {
        // --- Iterate and Draw the Top Level Items

        item=widget.controller.at( i ) ;
        ++widget._itemsCount;

        if ( 1 )//paintRect.y + this.itemHeight <= this.contentRect.bottom() )
        {
            if ( 1 )//this._itemsCount >= this.offset )
            {
                widget.items.push( VG.UI.TreeWidgetItem( item, paintRect ) );
                drawItem( this, item, widget.controller.isSelected( item ), paintRect, selBackgroundRect, indentTop );

                paintRect.y+=itemHeight + widget.spacing;
            }

            if ( item.children && item.open ) drawItemChildren( this, paintRect, item, selBackgroundRect );

            paintRect.x=widget.contentRect.x;
            paintRect.width=oldWidth;
        } else break;
    }

    canvas.popClipRect();

    // --- Columns Separator

    offset = 0;
    for ( let i = 0; i < widget.columns.length; ++i )
    {
        let column = widget.columns[i];

        if ( offset > paintRect.width )
            break;

        let width = column.pixelWidth;

        this.rect3.x = paintRect.x + offset;
        this.rect3.y = widget.rect.y;
        this.rect3.width = width;
        this.rect3.height = headerHeight;

        if ( !column.hAlign ) {
            this.rect3.x += 7;
            this.rect3.width -= 7;
        }

        canvas.drawTextRect( column.name, this.rect3, this.skin.TreeWidget.Header.TextColor, column.hAlign, 1 );

        if ( i > 0 ) {
            this.rect3.x = paintRect.x + offset;
            this.rect3.y = widget.contentRect.y;
            this.rect3.width = 1;
            this.rect3.height = widget.contentRect.height;

            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect3, this.skin.TreeWidget.Header.BorderColor );

            this.rect3.y = widget.rect.y;
            this.rect3.height = headerHeight;

            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect3, this.skin.TreeWidget.Header.BorderColor );
        }
        offset += width;
    }

    canvas.popFont();

    if ( widget.needsVScrollbar ) {
        widget.vScrollbar.rect=VG.Core.Rect( widget.rect.right() - this.skin.ScrollBar.Size - 3, widget.contentRect.y, this.skin.ScrollBar.Size, widget.contentRect.height );

        // this.totalItemHeight == Total height of all Items in the list widget including spacing
        // visibleHeight == Total height of all currently visible items
        // this.contentRect.height == Height of the available area for the list items

        widget.vScrollbar.setScrollBarContentSize( widget.totalItemHeight, widget.contentRect.height );
        widget.vScrollbar.paintWidget( canvas );
    }

    // --- Draw Tools

    if ( widget.toolLayout.length > 0 ) {
        this.rect1.copy( widget.rect ); this.rect1.shrink( 2, 2, this.rect1 );
        this.rect1.y+=this.rect1.height - this.skin.ListWidget.ToolLayoutHeight;
        this.rect2.copy( this.rect1 );
        this.rect1.height=1;//this.skin.ListWidget.ToolLayoutHeight;

        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.ListWidget.ToolTopBorderColor );

        this.rect1.y+=1; this.rect1.height=this.skin.ListWidget.ToolLayoutHeight-2;
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect1, this.skin.ListWidget.ToolBackGradColor1, this.skin.ListWidget.ToolBackGradColor2 );

        this.rect1.y+=this.rect1.height; this.rect1.height=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.ListWidget.ToolBottomBorderColor );

        this.rect2.height=this.skin.ListWidget.ToolLayoutHeight;
        this.rect2.shrink( 1, 1, this.rect2 );
        widget.toolLayout.rect.copy( this.rect2 );

        widget.toolLayout.layout( canvas );
    }

    if ( widget.disabled ) canvas.setAlpha( 1 );
};

// --- drawWindow

VG.UI.VisualGraphicsStyle.prototype.drawWindow=function( widget, canvas )
{
    // --- Draw Frame and Title

    this.rect1.copy( widget.rect );
    canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, this.rect1, this.skin.Window.BorderColor1 );
    this.rect1.y+=this.rect1.height-2; this.rect1.height=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, this.rect1, this.skin.Window.BorderColor1 );

    this.rect1.copy( widget.rect );
    this.rect1.add( 1, 1, -2, -3, this.rect1 );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.Window.BorderColor2 );

    this.rect1.shrink( 1, 1, this.rect1 );
    this.rect2.copy( this.rect1 );

    this.rect1.height=this.skin.Window.HeaderHeight;
    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect1, this.skin.Window.HeaderBackGradColor1, this.skin.Window.HeaderBackGradColor2 );

    this.rect2.add( 0, this.skin.Window.HeaderHeight + 1, 0, -this.skin.Window.HeaderHeight-1, this.rect2 );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, this.skin.Window.BackColor );

    this.rect2.copy( this.rect1 );
    this.rect1.x+=12; this.rect1.width-=12;
    canvas.pushFont( this.skin.Window.HeaderFont );
    canvas.drawTextRect( widget.text, this.rect1, this.skin.Window.HeaderTextColor, 0, 1 );
    canvas.popFont();

    // --- Close Button

    if ( widget.supportsClose )
    {
        this.rect2.x+=this.rect2.width-21; this.rect2.y+=4;
        this.rect2.width=16; this.rect2.height=16;
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, this.rect2, this.skin.Window.HeaderTextColor );
        widget.closeRect.copy( this.rect2 );

        this.rect2.shrink( 1, 1, this.rect2 );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect2, this.skin.Window.HeaderTextColor );

        this.rect2.shrink( 2, 2, this.rect2 );

        var imageName="windowclose";
        if ( widget.closeRect.contains( VG.context.workspace.mousePos ) ) imageName+="_hover";
        imageName+=".png";
        var image=VG.context.imagePool.getImageByName( imageName );
        if ( image ) canvas.drawImage( this.rect2, image );
    }

    // ---

    widget.contentRect.set( widget.rect.x+2, widget.rect.y + this.skin.Window.HeaderHeight + 2, widget.rect.width-2, widget.rect.height - this.skin.Window.HeaderHeight );
};

VG.UI.VisualGraphicsStyle.prototype.drawRoundedWindow=function( widget, canvas )
{
    let rect=widget.rect;

    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, rect, this.skin.RoundedWindow.BorderColor1 );
    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, rect.shrink( 1, 1 ), this.skin.RoundedWindow.BorderColor2 );

    // ctx.fillStyle = this.skin.RoundedWindow.BackColor.toCanvasStyle();
    this.rect1.set( rect.x + 1, rect.y + this.skin.RoundedWindow.HeaderHeight, rect.width - 2, rect.height - this.skin.RoundedWindow.HeaderHeight - this.skin.RoundedWindow.FooterHeight );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.RoundedWindow.BackColor );

    canvas.pushFont( this.skin.Window.HeaderFont );
    this.rect1.set( rect.x + 12, rect.y + 1, rect.width - 2, this.skin.RoundedWindow.HeaderHeight );
    canvas.drawTextRect( widget.text, this.rect1, this.skin.Window.HeaderTextColor, 0, 1 );
    canvas.popFont();

    // --- Header Separator
    this.rect1.set( rect.x + 1, rect.y + this.skin.RoundedWindow.HeaderHeight, rect.width - 2, 1 );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.RoundedWindow.SepColor2 );

    this.rect1.set( rect.x + 1, rect.y + this.skin.RoundedWindow.HeaderHeight + 1, rect.width - 2, 1 );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.RoundedWindow.SepColor1 );

    // --- Footer Separator
    this.rect1.set( rect.x + 1, rect.y + rect.height - this.skin.RoundedWindow.FooterHeight - 1, rect.width - 2, 1 );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.RoundedWindow.SepColor2 );

    this.rect1.set( rect.x + 1, rect.y + rect.height - this.skin.RoundedWindow.FooterHeight, rect.width - 2, 1 );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.RoundedWindow.SepColor1 );

    // --- Close Button

    if ( widget.supportsClose ) {
        // --- Close Button

        this.rect2.x=widget.rect.right() - 10 - 10;
        this.rect2.y=widget.rect.y + 6;
        this.rect2.width=this.rect2.height=11;

        widget.closeRect.copy( this.rect2 );

        var svg=VG.Utils.getSVGByName( "glyphs.svg" );
        if ( svg ) {
            svgGroup=svg.getGroupByName( "Close" );

            let color = this.skin.Widget.TextColor;
            if ( this.rect2.contains( VG.context.workspace.mousePos ) )
                color = this.skin.ToolSettings.HoverBackColor;

            canvas.drawSVG( svg, svgGroup, this.rect2, color );
        }
    }

    // ---

    widget.contentRect.set( widget.rect.x+2, widget.rect.y + this.skin.RoundedWindow.HeaderHeight + 2, widget.rect.width-2, widget.rect.height - this.skin.RoundedWindow.FooterHeight );
};

// ----------------------------- TEMPORARY, HAS TO BE REMOVED

VG.UI.VisualGraphicsStyle.prototype.drawTableWidgetRowBackground=function( canvas, tableWidget, rowRect, layout, selected )
{
    this.rect1.copy( rowRect );
    this.rect1.x+=this.skin.TableWidget.Item.XMargin;
    this.rect1.width-=2*this.skin.TableWidget.Item.XMargin;

    if ( selected ) canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, this.rect1, this.skin.TableWidget.Item.SelectedBorderColor );
    else canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, this.rect1, this.skin.TableWidget.Item.BorderColor );

    this.rect1.x+=1; this.rect1.y+=1;
    this.rect1.width-=2; this.rect1.height-=4;

    if ( selected ) canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect1, this.skin.TableWidget.Item.SelectedGradientColor1, this.skin.TableWidget.Item.SelectedGradientColor2 );
    else canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect1, this.skin.TableWidget.Item.GradientColor1, this.skin.TableWidget.Item.GradientColor2 );

    this.rect1.y+=this.rect1.height; this.rect1.height=2;

    if ( selected ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.TableWidget.Item.SelectedBottomColor );
    else canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.TableWidget.Item.BottomColor );

    // --- Draw Separators

    for ( var i=0; i < layout.children.length; ++i )
    {
        var item=layout.children[i];

        if ( item.rect.width === 1 )
        {
            this.rect1.copy( rowRect );
            this.rect1.x=item.rect.x;
            this.rect1.width=item.rect.width;

            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect1, this.skin.TableWidget.Header.BorderColor );
        }
    }
};

VG.UI.VisualGraphicsStyle.prototype.drawTableWidgetHeaderBackground=function( canvas, rect )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, rect, this.skin.TableWidget.Header.BorderColor );

    this.rect1.copy( rect );
    this.rect1.x+=1; this.rect1.y+=1;
    this.rect1.width-=2; this.rect1.height-=2;

    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.rect1, this.skin.TableWidget.Header.GradientColor1, this.skin.TableWidget.Header.GradientColor2 );
};

VG.UI.VisualGraphicsStyle.prototype.drawTableWidgetSeparator=function( canvas, separator )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( separator.contentRect.x, separator.contentRect.y, 1, separator.contentRect.height ),
        this.skin.TableWidget.Header.SeparatorColor );
};

VG.UI.VisualGraphicsStyle.prototype.drawTableWidgetHeaderSeparator=function( canvas, widget )
{
};

VG.UI.VisualGraphicsStyle.prototype.drawTableWidgetFooterSeparator=function( canvas, widget )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( widget.footerLayout.rect.x, widget.footerLayout.rect.y - this.skin.TableWidget.Footer.SeparatorHeight/2,
        widget.footerLayout.rect.width, 1 ), this.skin.TableWidget.Header.SeparatorColor );
};

// -----------------------------

VG.UI.stylePool.addStyle( new VG.UI.VisualGraphicsStyle() );