/*
 * Copyright (c) 2015-2016 Markus Moenig <markusm@visualgraphics.tv>
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

VG.UI.VisualGraphicsGraySkin=function()
{
    this.name="Gray";
    this.path="desktop_gray";

    this.Widget={
        Font : VG.Font.Font( "Open Sans Semibold", 13 ),

    	BackgroundColor : VG.Core.Color( 139, 139, 139 ),
        TextColor : VG.Core.Color( 244, 244, 244 ),
        DisabledTextColor : VG.Core.Color( 122, 122, 122 ),
        FocusColor : VG.Core.Color( 129, 197, 242 ),

        DisabledAlpha : 0.5,
    };

    this.Label={
        Font : VG.Font.Font( "Open Sans Semibold", 13 ),
    };

    this.Button={

        Font : VG.Font.Font( "Open Sans Semibold", 13 ),
        SmallFont : VG.Font.Font( "Open Sans Semibold", 12 ),
        TextColor : VG.Core.Color( 255, 255, 255 ),

        FocusBorderColor1 : VG.Core.Color( 126, 197, 243 ),
        FocusBorderColor2 : VG.Core.Color( 128, 128, 128 ),
        FocusBorderCheckedColor2 : VG.Core.Color( 165, 165, 165 ),

        BorderColor : VG.Core.Color( 158, 158, 158 ),
        BackGradColor1 : VG.Core.Color( 185, 185, 185 ),
        BackGradColor2 : VG.Core.Color( 171, 171, 171 ),

        HoverBackGradColor1 : VG.Core.Color( 150, 150, 150 ),
        HoverBackGradColor2 : VG.Core.Color( 140, 140, 140 ),

        CheckedBackGradColor1 : VG.Core.Color( 180, 180, 180 ),
        CheckedBackGradColor2 : VG.Core.Color( 194, 194, 194 ),
    };

    this.ButtonGroup={

        Font : VG.Font.Font( "Roboto Regular", 14 ),
        TextColor : VG.Core.Color( 244, 244, 244 ),

        NormalBorderColor : VG.Core.Color( 135, 135, 135 ),
        NormalBackColor : VG.Core.Color( 154, 154, 154 ),

        HoverBorderColor : VG.Core.Color( 224, 224, 224 ),
        HoverBackColor : VG.Core.Color( 196, 196, 196 ),

        PressedBorderColor : VG.Core.Color( 255, 255, 255 ),
        PressedBackColor : VG.Core.Color( 186, 186, 186 ),
    };

    this.CodeEdit={
        Font : VG.Font.Font( "Open Sans Semibold", 13.5 ),
        TopBorderColor : VG.Core.Color( 63, 75, 78 ),
        HeaderColor : VG.Core.Color( 63, 75, 78 ),
        HeaderTextColor : VG.Core.Color( 130, 151, 155 ),
        BackgroundColor : VG.Core.Color( 40, 48, 50 ),
        SelectionBackgroundColor : VG.Core.Color( 255, 255, 255, 120 ),
        SearchBackgroundColor : VG.Core.Color( 215, 206, 175 ),
        TextColor : VG.Core.Color( 240, 240, 240 ),
    };

    this.ContextMenu={
        Font : VG.Font.Font( "Roboto Regular", 14 ),

        TextColor : VG.Core.Color(),
        HighlightedTextColor : VG.Core.Color(),
        DisabledTextColor : VG.Core.Color( 128, 128, 128 ),

        BorderColor : VG.Core.Color( 204, 204, 204 ),
        BackColor : VG.Core.Color( 232, 232, 232 ),
        HighlightedBackColor : VG.Core.Color( 168, 211, 245 ),
        SeparatorColor : VG.Core.Color( 160, 160, 160 ),
    };

    this.DecoratedToolBar={
        Height : 44,//66,
        Spacing : 18,

        LogoColor : VG.Core.Color( 255, 255, 255 ),

        TopBorderColor : VG.Core.Color( 220, 220, 220 ),
        //TopBorderColor1 : VG.Core.Color( 171, 171, 171 ),
        //TopBorderColor2 : VG.Core.Color( 214, 214, 214 ),
        BottomBorderColor : VG.Core.Color( 114, 114, 114 ),

        BackGradColor1 : VG.Core.Color( 197, 197, 197 ),
        BackGradColor2 : VG.Core.Color( 167, 167, 167 ),

        Separator : {
            Color1 : VG.Core.Color( 136, 136, 136 ),
            Color2 : VG.Core.Color( 197, 197, 197 ),
            Size : VG.Core.Size( 2, 24 ),
        },
    };

    this.DecoratedQuickMenu={

        ButtonBackgroundColor : VG.Core.Color( 120, 120, 120 ),
        ButtonBackgroundHoverColor : VG.Core.Color( 157, 157, 157 ),
        ButtonBackgroundSelectedColor : VG.Core.Color( 111, 107, 107 ),

        StripeColor : VG.Core.Color( 55, 55, 55 ),

        HoverColor : VG.Core.Color( 255, 255, 255 ),
        Color : VG.Core.Color( 126, 126, 124 ),
        BorderColor : VG.Core.Color( 255, 255, 255 ),
        SubMenuBorderColor : VG.Core.Color( 182, 182, 182 ),
        BackgroundColor : VG.Core.Color( 88, 88, 88 ),
        ContentMargin : VG.Core.Margin( 0, 0, 0, 0 ),

        Size : VG.Core.Size( 74, 58 ),

        UsesCloseButton : false,

        Items : {

            BackGradSelectionColor1 : VG.Core.Color( 117, 117, 117 ),
            BackGradSelectionColor2 : VG.Core.Color( 85, 85, 85 ),

            Size : VG.Core.Size( 306, 42 ),
            TextColor : VG.Core.Color( 255, 255, 255 ),
            DisabledTextColor : VG.Core.Color( 128, 128, 128 ),
            Font : VG.Font.Font( "Open Sans Semibold", 14 ),
        }
    };

    this.DockWidget={

        BackColor : VG.Core.Color( 147, 147, 147 ),
        FloatingBorderColor : VG.Core.Color( 126, 197, 243 ),

        HeaderHeight : 21,
        HeaderFont : VG.Font.Font( "Open Sans Bold", 12 ),
        HeaderBorderColor : VG.Core.Color( 102, 102, 102 ),
        HeaderBackGradColor1 : VG.Core.Color( 125, 125, 125 ),
        HeaderBackGradColor2 : VG.Core.Color( 114, 114, 114 ),

        HeaderTextColor : VG.Core.Color( 255, 255, 255 ),
    };

    this.DropDownMenu={

        Font : VG.Font.Font( "Open Sans Semibold", 13 ),

        TextColor : VG.Core.Color( 255, 255, 255 ),

        FocusBorderColor : VG.Core.Color( 126, 197, 243 ),
        BorderColor : VG.Core.Color( 213, 213, 213 ),
        HoverBorderColor : VG.Core.Color( 220, 220, 220 ),

        BackGradColor1 : VG.Core.Color( 193, 193, 193 ),
        BackGradColor2 : VG.Core.Color( 171, 171, 171 ),

        HoverBackGradColor1 : VG.Core.Color( 202, 202, 202 ),
        HoverBackGradColor2 : VG.Core.Color( 186, 186, 186 ),

        SepColor1 : VG.Core.Color( 213, 213, 213 ),
        SepColor2 : VG.Core.Color( 164, 164, 164 ),

        ItemBorderColor : VG.Core.Color( 239, 239, 239 ),
        ItemBackColor : VG.Core.Color( 194, 194, 194 ),
        ItemSelectedBackColor : VG.Core.Color( 168, 211, 245 ),
        ItemTextColor : VG.Core.Color( 255, 255, 255 ),
        ItemSelectedTextColor : VG.Core.Color( 85, 85, 85 ),
    };

    this.HtmlWidget={

        h1 : {
            Font : VG.Font.Font( "Open Sans Bold", 26 ),
            Color : VG.Core.Color( 244, 244, 244 ),

            Margin : VG.Core.Margin( 10, 10, 20, 10 ),
            ResetLayout : true,
            LineFeed : true,
            Spacing : 2,
        },
        h2 : {
            Font : VG.Font.Font( "Open Sans Bold", 18 ),
            Color : VG.Core.Color( "#e452ef" ),

            Margin : VG.Core.Margin( 10, 5, 10, 5 ),
            ResetLayout : true,
            LineFeed : true,
            Spacing : 2,
        },
        h4 : {
            Font : VG.Font.Font( "Open Sans Bold", 13 ),
            Color : VG.Core.Color( 204, 204, 204 ),

            Margin : VG.Core.Margin( 10, 10, 10, 10 ),
            ResetLayout : true,
            LineFeed : true,
            Spacing : 2,
        },
        p : {
            Font : VG.Font.Font( "Open Sans Semibold", 13 ),
            Color : VG.Core.Color( 244, 244, 244 ),

            Margin : VG.Core.Margin( 10, 5, 10, 5 ),
            ResetLayout : true,
            LineFeed : true,
            Spacing : 2,
        },
        svg : {
            Color : VG.Core.Color( 244, 244, 244 ),
            Margin : VG.Core.Margin( 0, 0, 0, 0 ),
        },
        img : {
            Margin : VG.Core.Margin( 10, 10, 10, 10 ),
            LineFeed : true,
        },
        b : {
            Font : VG.Font.Font( "Open Sans Bold", 13 ),
            Color : VG.Core.Color( 244, 244, 244 ),

            Margin : VG.Core.Margin( 0, 0, 0, 0 ),
        },
        i : {
            Font : VG.Font.Font( "Open Sans Semibold Italic", 13 ),
            Color : VG.Core.Color( 244, 244, 244 ),

            Margin : VG.Core.Margin( 0, 0, 0, 0 ),
        },
        a : {
            Font : VG.Font.Font( "Open Sans Semibold", 13 ),
            Color : VG.Core.Color( 126, 197, 243 ),
            Link : true,

            Margin : VG.Core.Margin( 0, 0, 0, 0 ),
        },
        ul : {
            Margin : VG.Core.Margin( 30, 0, 5, 5 ),
            ResetLayout : true,
            LineFeed : true,
        },
        li : {
            Font : VG.Font.Font( "Open Sans Semibold", 13 ),
            Color : VG.Core.Color( 244, 244, 244 ),

            Margin : VG.Core.Margin( 5, 5, 5, 5 ),
            LineFeed : true,
        },
        br : {
            Margin : VG.Core.Margin( 0, 15, 0, 0 ),
            LineFeed : true,
        }
    };

    this.HtmlView={
        FontName : "Open Sans Semibold",
        BoldFontName : "Open Sans Bold",
        ItalicFontName : "Open Sans Semibold Italic",
    };

    this.IconWidget={

        Font : VG.Font.Font( "Open Sans Semibold", 13 ),

        TextColor : VG.Core.Color( 203, 203, 203 ),

        FocusBorderColor : VG.Core.Color( 126, 197, 243 ),
        BorderColor : VG.Core.Color( 213, 213, 213 ),
        HoverBorderColor : VG.Core.Color( 220, 220, 220 ),

        BackColor : VG.Core.Color( 120, 120, 120 ),

        Spacing : VG.Core.Size( 5, 5 ),
        Margin : VG.Core.Margin( 5, 5, 5, 5 ),

        ItemBackColor : VG.Core.Color( 192, 192, 192 ),
        ItemSelectedBorderColor : VG.Core.Color( 126, 197, 243 ),
        ItemSelectedBackColor : VG.Core.Color( 168, 211, 245 ),

        ItemCustomContentBorderColor : VG.Core.Color( 139, 139, 139 ),

        ToolLayoutHeight : 28,
        ToolTopBorderColor : VG.Core.Color( 194, 194, 194 ),
        ToolBottomBorderColor : VG.Core.Color( 111, 111, 111 ),
        ToolBackGradColor1 : VG.Core.Color( 174, 174, 174 ),
        ToolBackGradColor2 : VG.Core.Color( 131, 131, 131 ),
    };

    this.ListWidget={

        Font : VG.Font.Font( "Open Sans Semibold", 13 ),

        TextColor : VG.Core.Color( 85, 81, 85 ),

        FocusBorderColor : VG.Core.Color( 126, 197, 243 ),
        BorderColor : VG.Core.Color( 213, 213, 213 ),
        HoverBorderColor : VG.Core.Color( 220, 220, 220 ),

        BackColor : VG.Core.Color( 120, 120, 120 ),

        Spacing : 2,
        Margin : VG.Core.Margin( 2, 2, 2, 2 ),

        ItemBackColor : VG.Core.Color( 192, 192, 192 ),
        ItemSelectedBorderColor : VG.Core.Color( 126, 197, 243 ),
        ItemSelectedBackColor : VG.Core.Color( 168, 211, 245 ),

        ItemCustomContentBorderColor : VG.Core.Color( 139, 139, 139 ),

        ToolLayoutHeight : 28,
        ToolTopBorderColor : VG.Core.Color( 194, 194, 194 ),
        ToolBottomBorderColor : VG.Core.Color( 111, 111, 111 ),
        ToolBackGradColor1 : VG.Core.Color( 174, 174, 174 ),
        ToolBackGradColor2 : VG.Core.Color( 131, 131, 131 ),
    };

    this.Menu={
        Font : VG.Font.Font( "Open Sans Semibold", 13 ),
        ShortcutFont : VG.Font.Font( "Open Sans Semibold", 13 ),
        BorderColor : VG.Core.Color( 239, 239, 239 ),
        SeparatorColor : VG.Core.Color( 224, 224, 224 ),
        BackColor : VG.Core.Color( 194, 194, 194 ),
        DisabledTextColor : VG.Core.Color( 128, 128, 128 ),
        HighlightedTextColor : VG.Core.Color( 85, 85, 85 ),
        HighlightedBackColor : VG.Core.Color( 168, 211, 245 ),
        HighlightedBorderColor : VG.Core.Color( 126, 197, 243 ),
        TextColor : VG.Core.Color( 255, 255, 255 ),
    };

    this.MenuBar={
        Font : VG.Font.Font( "Open Sans Semibold", 13 ),
        Height : 21,
        BorderSize : 0,

        TopBorderColor : VG.Core.Color( 172, 172, 172 ),
        BottomBorderColor : VG.Core.Color( 172, 172, 172 ),

        BackColor : VG.Core.Color( 172, 172, 172 ),
        SelectedBackColor : VG.Core.Color( 61, 61, 61 ),
        TextColor : VG.Core.Color( 255, 255, 255 ),
        SelectedTextColor : VG.Core.Color( 255, 255, 255 ),
    };

    this.Nodes={

        Font : VG.Font.Font( "Open Sans Semibold", 12 ),

        BackColor : VG.Core.Color( 128, 128, 128 ),
        BackLineColor : VG.Core.Color( 74, 74, 74 ),
        GridSize : 45,

        BorderColor : VG.Core.Color( 244, 244, 244 ),
        TopColor : VG.Core.Color( 65, 65, 65 ),
        SeparatorColor : VG.Core.Color.Black,
        BodyColor : VG.Core.Color( 192, 192, 192 ),

        TitleTextColor : VG.Core.Color( 195, 195, 195 ),
        TerminalTextColor : VG.Core.Color( 76, 76, 76 ),

        TextureTerminalColor : VG.Core.Color( 0, 95, 185),//49, 136, 40 ),
        MaterialTerminalColor : VG.Core.Color( 190, 171, 0 ),
        VectorTerminalColor : VG.Core.Color(),//0, 95, 185 ),
        FloatTerminalColor : VG.Core.Color( 95, 54, 136 ),
    };

    this.ScrollBar={
        Size : 14,
        BorderColor : VG.Core.Color( 119, 119, 119 ),
        BackColor : VG.Core.Color( 139, 139, 139 ),
    };

    this.SectionBar={

        BackColor : VG.Core.Color( 163, 163, 163 ),
        BorderColor : VG.Core.Color( 133, 133, 133 ),

        HeaderHeight : 21,
        HeaderFont : VG.Font.Font( "Open Sans Bold", 12 ),
        HeaderBorderColor : VG.Core.Color( 102, 102, 102 ),
        HeaderBackGradColor1 : VG.Core.Color( 125, 125, 125 ),
        HeaderBackGradColor2 : VG.Core.Color( 114, 114, 114 ),

        HeaderTextColor : VG.Core.Color( 255, 255, 255 ),

        Separator : {
            Height : 2,
            Color1 : VG.Core.Color( 136, 136, 136 ),
            Color2 : VG.Core.Color( 197, 197, 197 ),
        }
    };

    this.SectionBarButton={

        Font : VG.Font.Font( "Open Sans Bold", 12 ),

        Size : VG.Core.Size( 81, 47 ),

        BorderColor : VG.Core.Color( 94, 94, 94 ),
        BackGradColor1 : VG.Core.Color( 80, 80, 80 ),
        BackGradColor2 : VG.Core.Color( 72, 72, 72 ),

        HoverBorderColor : VG.Core.Color( 107, 107, 107 ),
        HoverBackGradColor1 : VG.Core.Color( 94, 94, 94 ),
        HoverBackGradColor2 : VG.Core.Color( 86, 86, 86 ),

        SelectedBorderColor : VG.Core.Color( 242, 242, 242 ),
        SelectedBackGradColor1 : VG.Core.Color( 242, 242, 242 ),
        SelectedBackGradColor2 : VG.Core.Color( 242, 242, 242 ),
        SelectedTextColor : VG.Core.Color( 96, 96, 96 ),

        TextColor : VG.Core.Color( 255, 255, 255 ),
    };

    this.SectionBarSwitch={

        Font : VG.Font.Font( "Open Sans Bold", 12 ),

        Size : VG.Core.Size( 81, 32 ),

        TextColor : VG.Core.Color( 255, 255, 255 ),
    };

    this.SectionToolBar={

        BackColor : VG.Core.Color( 163, 163, 163 ),
        BorderColor1 : VG.Core.Color( 126, 126, 126 ),
        BorderColor2 : VG.Core.Color( 160, 160, 160 ),

        HeaderTopBorderColor : VG.Core.Color( 194, 194, 194 ),
        HeaderGradColor1 : VG.Core.Color( 174, 174, 174 ),
        HeaderGradColor2 : VG.Core.Color( 139, 139, 139 ),
        HeaderBottomBorderColor1 : VG.Core.Color( 132, 132, 132 ),
        HeaderBottomBorderColor2 : VG.Core.Color( 111, 111, 111 ),

        HeaderFont : VG.Font.Font( "Open Sans Bold", 12 ),
        HeaderTextColor : VG.Core.Color( 255, 255, 255 ),

        Separator : {
            Height : 2,
            Color1 : VG.Core.Color( 136, 136, 136 ),
            Color2 : VG.Core.Color( 197, 197, 197 ),
        }
    };

    this.SectionToolBarButton={

        Size : VG.Core.Size( 46, 43 ),

        BorderColor : VG.Core.Color( 135, 135, 135 ),
        BorderHoverColor : VG.Core.Color( 224, 224, 224 ),
        BorderSelectedColor : VG.Core.Color( 255, 255, 255 ),

        BackHoverColor : VG.Core.Color( 196, 196, 196 ),
        BackSelectedColor : VG.Core.Color( 186, 186, 186 ),
    };

    this.Slider={

        FocusHoverBarColors : {
        	Color1 : VG.Core.Color( 219, 219, 219 ),
            Color2 : VG.Core.Color( 190, 190, 190 ),
        	Color3 : VG.Core.Color( 218, 218, 218 ),
            Color4 : VG.Core.Color( 235, 235, 235 ),
        },

        BarColors : {
        	Color1 : VG.Core.Color( 187, 187, 187 ),
            Color2 : VG.Core.Color( 170, 170, 170 ),
        	Color3 : VG.Core.Color( 186, 186, 186 ),
            Color4 : VG.Core.Color( 197, 197, 197 ),
        },

    	HandleSize : 13,
    	BarHeight : 4
    };

    this.RoundSlider={

        FocusHoverBarColors : {
            Color1 : VG.Core.Color( 219, 219, 219 ),
            Color2 : VG.Core.Color( 190, 190, 190 ),
            Color3 : VG.Core.Color( 218, 218, 218 ),
        },

        LeftTrackColors : {
            Color1 : VG.Core.Color( 130, 130, 130 ),
            Color2 : VG.Core.Color( 139, 139, 139 ),
            Color3 : VG.Core.Color( 175, 175, 175 ),
        },

        RightTrackColors : {
            Color1 : VG.Core.Color( 75, 75, 75 ),
            Color2 : VG.Core.Color( 90, 90, 90 ),
            Color3 : VG.Core.Color( 149, 149, 149 ),
        },

        HandleSize : 14,
        BarHeight : 3,

        KnobColor : VG.Core.Color( 221, 221, 221 ),
        OuterKnobColor : VG.Core.Color( 221, 221, 221, 128 ),
        SelectedOuterKnobColor : VG.Core.Color( 126, 197, 243 )
    };

    this.SnapperWidgetItem={

        Font : VG.Font.Font( "Open Sans Semibold", 13 ),
        TextColor : VG.Core.Color( 255, 255, 255 ),

        Height : 22,

        TopBorderColor : VG.Core.Color( 194, 194, 194 ),
        BottomBorderColor : VG.Core.Color( 111, 111, 111 ),
        BackGradColor1 : VG.Core.Color( 174, 174, 174 ),
        BackGradColor2 : VG.Core.Color( 132, 132, 132 ),

        HoverTopBorderColor : VG.Core.Color( 202, 202, 202 ),
        HoverBottomBorderColor : VG.Core.Color( 130, 130, 130 ),
        HoverBackGradColor1 : VG.Core.Color( 184, 184, 184 ),
        HoverBackGradColor2 : VG.Core.Color( 148, 148, 148 ),

        SelectedTopBorderColor : VG.Core.Color( 169, 169, 169 ),
        SelectedBottomBorderColor : VG.Core.Color( 97, 97, 97 ),
        SelectedBackGradColor1 : VG.Core.Color( 151, 151, 151 ),
        SelectedBackGradColor2 : VG.Core.Color( 116, 116, 116 ),
    };

    this.SplitLayout={

        Size : 7,

        BackColor : VG.Core.Color( 133, 133, 133 ),
        BorderColor : VG.Core.Color( 160, 160, 160 ),

        DragBackColor : VG.Core.Color( 132, 132, 132 ),
        DragBorderColor : VG.Core.Color( 239, 239, 239 ),

        HoverBackColor : VG.Core.Color( 185, 185, 185 ),
        HoverBorderColor : VG.Core.Color( 239, 239, 239 ),
    };

    this.StatusBar={

        BorderColor : VG.Core.Color( 132, 132, 132 ),
        BackColor : VG.Core.Color( 147, 147, 147 ),
        Height : 20,
    };

    this.TabWidgetHeader={

        Font : VG.Font.Font( "Open Sans Semibold", 14 ),
        TextColor : VG.Core.Color( 244, 244, 244 ),
        Height : 32,

        SelectedEdgeBorderColor : VG.Core.Color( 171, 171, 171 ),
        SelectedTopBorderColor : VG.Core.Color( 184, 184, 184 ),
        SelectedSideBorderColor1 : VG.Core.Color( 179, 179, 179 ),
        SelectedSideBorderColor2 : VG.Core.Color( 165, 161, 161 ),

        SelectedBackGradientColor1 : VG.Core.Color( 186, 186, 186 ),
        SelectedBackGradientColor2 : VG.Core.Color( 178, 178, 178 ),

        HoverBackGradientColor1 : VG.Core.Color( 156, 156, 156 ),
        HoverBackGradientColor2 : VG.Core.Color( 139, 139, 139 ),

        BackGradientColor1 : VG.Core.Color( 165, 165, 165 ),
        BackGradientColor2 : VG.Core.Color( 149, 149, 149 ),

        LeftBorderColor : VG.Core.Color( 183, 183, 183 ),
        TabBorderColor : VG.Core.Color( 214, 214, 214 ),
        BottomBorderColor1 : VG.Core.Color( 153, 153, 153 ),
        BottomBorderColor2 : VG.Core.Color( 178, 178, 178 ),
    };


    this.TabWidgetSmallHeader={

        Font : VG.Font.Font( "Open Sans Semibold", 12 ),
        TextColor : VG.Core.Color( 244, 244, 244 ),
        Height : 22,

        SelectedEdgeBorderColor : VG.Core.Color( 171, 171, 171 ),
        SelectedTopBorderColor : VG.Core.Color( 184, 184, 184 ),
        SelectedSideBorderColor1 : VG.Core.Color( 179, 179, 179 ),
        SelectedSideBorderColor2 : VG.Core.Color( 165, 161, 161 ),

        SelectedBackGradientColor1 : VG.Core.Color( 186, 186, 186 ),
        SelectedBackGradientColor2 : VG.Core.Color( 178, 178, 178 ),

        HoverBackGradientColor1 : VG.Core.Color( 156, 156, 156 ),
        HoverBackGradientColor2 : VG.Core.Color( 139, 139, 139 ),

        BackGradientColor1 : VG.Core.Color( 165, 165, 165 ),
        BackGradientColor2 : VG.Core.Color( 149, 149, 149 ),

        LeftBorderColor : VG.Core.Color( 183, 183, 183 ),
        TabBorderColor : VG.Core.Color( 214, 214, 214 ),
        BottomBorderColor1 : VG.Core.Color( 153, 153, 153 ),
        BottomBorderColor2 : VG.Core.Color( 178, 178, 178 ),
    };

    this.TextEdit={

        Font : VG.Font.Font( "Roboto Regular", 14 ),

        TextColor : VG.Core.Color( 242, 242, 242 ),
        DefaultTextColor : VG.Core.Color( 71, 71, 71 ),

        FocusBorderColor1 : VG.Core.Color( 168, 211, 245 ),
        FocusBorderColor2 : VG.Core.Color( 126, 197, 243 ),
        FocusBorderColor3 : VG.Core.Color( 119, 119, 119 ),
        FocusBackgroundColor : VG.Core.Color( 139, 139, 139 ),

        BackgroundColor : VG.Core.Color( 164, 164, 164 ),
        BorderColor1 : VG.Core.Color( 209, 209, 209 ),
        BorderColor2 : VG.Core.Color( 149, 149, 149 ),
    };

    this.TextLineEdit={

    	Font : VG.Font.Font( "Roboto Regular", 14 ),

    	TextColor : VG.Core.Color( 242, 242, 242 ),
        DefaultTextColor : VG.Core.Color( 71, 71, 71 ),

    	FocusBorderColor1 : VG.Core.Color( 168, 211, 245 ),
    	FocusBorderColor2 : VG.Core.Color( 126, 197, 243 ),
    	FocusBorderColor3 : VG.Core.Color( 147, 147, 147 ),
    	FocusBackgroundColor : VG.Core.Color( 139, 139, 139 ),

    	BackgroundColor : VG.Core.Color( 164, 164, 164 ),
    	BorderColor1 : VG.Core.Color( 209, 209, 209 ),
    	BorderColor2 : VG.Core.Color( 149, 149, 149 ),
    };

    this.TitleBar={

        Height : 20,
        Font : VG.Font.Font( "Open Sans Semibold", 12.5 ),
        TextColor : VG.Core.Color( 255, 255, 255 ),

        BorderColor : VG.Core.Color( 102, 102, 102 ),

        BackGradColor1 : VG.Core.Color( 125, 125, 125 ),
        BackGradColor2 : VG.Core.Color( 114, 114, 114 ),
    };

    this.ToolBar={
        Height : 33,

        TopBorderColor : VG.Core.Color( 102, 102, 102 ),
        BottomBorderColor : VG.Core.Color( 160, 160, 160 ),

        BackGradColor : VG.Core.Color( 120, 120, 120 ),

        Separator : {
            Color1 : VG.Core.Color( 102, 102, 102 ),
            Color2 : VG.Core.Color( 148, 148, 148 ),
            Size : VG.Core.Size( 2, 28 ),
        },

        IconSize : VG.Core.Size( 32, 27 ),
    };

    this.ToolBarButton={

        Font : VG.Font.Font( "Roboto Regular", 14 ),
        TextColor : VG.Core.Color( 255, 255, 255 ),

        BorderColor : VG.Core.Color( 158, 158, 158 ),
        BackColor : VG.Core.Color( 163, 163, 163 ),

        HoverBorderColor : VG.Core.Color( 224, 224, 224 ),
        HoverBackColor : VG.Core.Color( 163, 163, 163 ),

        ClickedBorderColor : VG.Core.Color( 255, 255, 255 ),
        ClickedBackColor : VG.Core.Color( 186, 186, 186 ),

        TextMargin : VG.Core.Size( 10, 0 ),
        IconSize : VG.Core.Size( 24, 24 ),

        MinimumWidth : 45,
    };

    this.ToolButton={

        Color : VG.Core.Color( 255, 255, 255 ),

        BorderColor : VG.Core.Color( 158, 158, 158 ),
        BackColor : VG.Core.Color( 163, 163, 163 ),

        HoverBorderColor : VG.Core.Color( 224, 224, 224 ),
        HoverBackColor : VG.Core.Color( 163, 163, 163 ),

        ClickedBorderColor : VG.Core.Color( 255, 255, 255 ),
        ClickedBackColor : VG.Core.Color( 186, 186, 186 ),

        Size : VG.Core.Size( 46, 43 ),
        Margin : VG.Core.Size( 3, 3 ),

        MinimumWidth : 45,
    };

    this.ToolSettings={

        HeaderFont : VG.Font.Font( "Open Sans Bold", 13 ),

        BackColor : VG.Core.Color( 123, 123, 123 ),
        BorderColor : VG.Core.Color( 108, 108, 108 ),

        HoverBackColor : VG.Core.Color( 157, 157, 157 ),
        HoverBorderColor : VG.Core.Color( 179, 179, 179 ),

        OpenBorderColor : VG.Core.Color( 204, 204, 204 ),
        OpenBackColor : VG.Core.Color( 149, 149, 149 ),

        ContentBorderColor : VG.Core.Color( 146, 146, 146 ),
        ContentBackColor : VG.Core.Color( 116, 116, 116 ),

        Size : VG.Core.Size( 21, 20 ),
    };

    this.ToolTip={

        TitleFont : VG.Font.Font( "Open Sans Bold", 14 ),
        Font : VG.Font.Font( "Open Sans Semibold", 13 ),

        BorderColor : VG.Core.Color( 181, 181, 181 ),
        BackColor : VG.Core.Color( 123, 123, 123 ),
        TextColor : VG.Core.Color( 255, 255, 255 ),

        BorderSize : VG.Core.Size( 11, 15 ),
    };

    this.TreeWidget={

        Header : {
            Height : 22,
            BorderColor : VG.Core.Color( 82, 82, 82 ),
            BackColor1 : VG.Core.Color( 134, 134, 134 ),
            BackColor2 : VG.Core.Color( 118, 118, 118 ),
            TextColor : VG.Core.Color( 236, 239, 243 ),
        },

        Font : VG.Font.Font( "Open Sans Semibold", 13 ),

        TextColor : VG.Core.Color( 85, 81, 85 ),

        FocusBorderColor : VG.Core.Color( 126, 197, 243 ),
        BorderColor : VG.Core.Color( 213, 213, 213 ),
        HoverBorderColor : VG.Core.Color( 220, 220, 220 ),

        BackColor : VG.Core.Color( 120, 120, 120 ),

        Spacing : 3,
        Margin : VG.Core.Margin( 2, 2, 2, 2 ),

        UseTriangles: false,
        HasBorder: true,

        ItemOutline: true,
        ItemBackColor : VG.Core.Color( 192, 192, 192 ),
        ItemSelectedBorderColor : VG.Core.Color( 126, 197, 243 ),
        ItemSelectedBackColor : VG.Core.Color( 168, 211, 245 ),

        ToolLayoutHeight : 28,

        ToolTopBorderColor : VG.Core.Color( 191, 191, 191 ),
        ToolBottomBorderColor : VG.Core.Color( 111, 111, 111 ),
        ToolBackGradColor1 : VG.Core.Color( 148, 148, 148 ),
        ToolBackGradColor2 : VG.Core.Color( 142, 142, 142 ),

        ChildIndent : 20,
        ChildControlColor : VG.Core.Color( 227, 227, 227 ),
    };

    this.Window={
        HeaderHeight : 25,

        HeaderFont : VG.Font.Font( "Open Sans Semibold", 14 ),
        HeaderTextColor : VG.Core.Color( 255, 255, 255 ),

        BackColor : VG.Core.Color( 120, 120, 120 ),

        BorderColor1 : VG.Core.Color( 179, 179, 179 ),
        BorderColor2 : VG.Core.Color( 239, 239, 239 ),

        HeaderBackGradColor1 : VG.Core.Color( 219, 219, 219 ),
        HeaderBackGradColor2 : VG.Core.Color( 198, 198, 198 ),
    };

    this.RoundedWindow={
        HeaderHeight : 20,
        FooterHeight : 15,

        HeaderFont : VG.Font.Font( "Open Sans Semibold", 14 ),
        HeaderTextColor : VG.Core.Color( 255, 255, 255 ),

        BackColor : VG.Core.Color( 116, 116, 116 ),

        BorderColor1 : VG.Core.Color( 182, 182, 182 ),
        BorderColor2 : VG.Core.Color( 130, 130, 130 ),

        SepColor1 : VG.Core.Color( 148, 148, 148 ),
        SepColor2 : VG.Core.Color( 102, 102, 102 ),
    };

    // --- TEMPORARY, TABLEWIDGET HAS TO BE REMOVED

    this.TableWidget = {
                Font : VG.Font.Font( "Roboto Regular", 14 ),
                TextColor : VG.Core.Color( 244, 244, 244 ),
                DisabledSeparatorColor : VG.Core.Color( 48, 48, 48 ),
                SelectionColor : VG.Core.Color(  44, 55, 71 ),
                SeparatorWidth : 1,
                ContentMargin : VG.Core.Margin( 0, 0, 0, 6 ),
                RowHeight : 28,

                Header : {
                    Font : VG.Font.Font( "Roboto Regular", 13 ),
                    SeparatorHeight : 3,
                    SeparatorColor : VG.Core.Color( 117, 117, 117 ),
                    Height : 23,
                    BorderColor : VG.Core.Color( 117, 117, 117 ),
                    GradientColor1 : VG.Core.Color( 169, 169, 169 ),
                    GradientColor2 : VG.Core.Color( 148, 148, 148 ),
                    TextXOffset : 10,
                },
                Footer : {
                    SeparatorHeight : 16,
                    Margin : VG.Core.Margin( 10, 0, 0, 0 ),
                    Height : 24,
                },

                Item : {

                    BorderColor : VG.Core.Color( 216, 216, 216 ),
                    SelectedBorderColor : VG.Core.Color( 186, 223, 248 ),

                    GradientColor1 : VG.Core.Color( 183, 183, 183 ),
                    GradientColor2 : VG.Core.Color( 186, 186, 186 ),
                    BottomColor : VG.Core.Color( 186, 186, 186 ),

                    SelectedGradientColor1 : VG.Core.Color( 128, 196, 242 ),
                    SelectedGradientColor2 : VG.Core.Color( 132, 198, 241 ),
                    SelectedBottomColor : VG.Core.Color( 132, 198, 241 ),

                    XMargin : 2,
                    Spacing : 2,
                },
            };


    // ---
};

VG.UI.VisualGraphicsGraySkin.prototype.activate=function()
{
	this.prefix=this.style.prefix + "gray_";

	let path=this.style.path + "/" + this.path;

    // --- ScrollBar

    VG.loadStyleImage( path, this.prefix + "scrollbar_vtop.png" );
    VG.loadStyleImage( path, this.prefix + "scrollbar_vmiddle.png" );
    VG.loadStyleImage( path, this.prefix + "scrollbar_vbottom.png" );

    VG.loadStyleImage( path, this.prefix + "scrollbar_vtop_selected.png" );
    VG.loadStyleImage( path, this.prefix + "scrollbar_vmiddle_selected.png" );
    VG.loadStyleImage( path, this.prefix + "scrollbar_vbottom_selected.png" );

    VG.loadStyleImage( path, this.prefix + "scrollbar_vtop_hover.png" );
    VG.loadStyleImage( path, this.prefix + "scrollbar_vmiddle_hover.png" );
    VG.loadStyleImage( path, this.prefix + "scrollbar_vbottom_hover.png" );

    VG.loadStyleImage( path, this.prefix + "scrollbar_hleft.png" );
    VG.loadStyleImage( path, this.prefix + "scrollbar_hmiddle.png" );
    VG.loadStyleImage( path, this.prefix + "scrollbar_hright.png" );

    VG.loadStyleImage( path, this.prefix + "scrollbar_hleft_selected.png" );
    VG.loadStyleImage( path, this.prefix + "scrollbar_hmiddle_selected.png" );
    VG.loadStyleImage( path, this.prefix + "scrollbar_hright_selected.png" );

    VG.loadStyleImage( path, this.prefix + "scrollbar_hleft_hover.png" );
    VG.loadStyleImage( path, this.prefix + "scrollbar_hmiddle_hover.png" );
    VG.loadStyleImage( path, this.prefix + "scrollbar_hright_hover.png" );

    // --- Switch

    VG.loadStyleImage( path, this.prefix + "darrow_left.png" );
    VG.loadStyleImage( path, this.prefix + "darrow_right.png" );

	// --- CheckBox

	VG.loadStyleImage( path, this.prefix + "checkbox_focus.png" );
	VG.loadStyleImage( path, this.prefix + "checkbox_focus_checked.png" );

	VG.loadStyleImage( path, this.prefix + "checkbox_hover.png" );
	VG.loadStyleImage( path, this.prefix + "checkbox_hover_checked.png" );

	VG.loadStyleImage( path, this.prefix + "checkbox.png" );
	VG.loadStyleImage( path, this.prefix + "checkbox_checked.png" );

	// --- Slider

	// VG.loadStyleImage( path, this.prefix + "slider_focus.png" );
	// VG.loadStyleImage( path, this.prefix + "slider_hover.png" );
	// VG.loadStyleImage( path, this.prefix + "slider.png" );

    // --- Main bar icons

    VG.Shaders = { fs : [] };
    VG.Shaders.fs[ this.prefix + "undo.svg" ] = `<?xml version="1.0" encoding="utf-8"?>
    <!-- Generator: Adobe Illustrator 15.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg version="1.1" id="Ebene_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
    <path fill-rule="evenodd" clip-rule="evenodd" fill="#E4E4E4" d="M16.081,12.62c-2.344-2.344-6.142-2.344-8.485,0l3.182,3.182
        l-7.071,0.001V8.731l2.475,2.475c3.125-3.124,8.182-3.115,11.306,0.009c0.78,0.781,1.774,1.658,2.091,2.091l-1.405,1.405
        C17.808,14.369,16.851,13.389,16.081,12.62z"/>
    <g opacity="0.1">
        <path d="M3.706,8.731l2.475,2.475c1.56-1.56,3.602-2.338,5.644-2.338c2.048,0,4.097,0.783,5.662,2.348
            c0.78,0.781,1.774,1.658,2.091,2.091l-1.405,1.405c-0.364-0.342-1.321-1.322-2.091-2.091c-1.172-1.172-2.707-1.758-4.243-1.758
            s-3.071,0.586-4.243,1.758l3.182,3.182l-7.071,0.001V8.731 M2.706,6.317v2.414v7.072v1h1l7.071-0.001h2.414l-1.707-1.707
            L9.08,12.69c0.811-0.539,1.763-0.828,2.758-0.828c1.335,0,2.591,0.52,3.536,1.465c0.276,0.275,0.575,0.578,0.863,0.868
            c0.525,0.53,1.012,1.021,1.25,1.245l0.707,0.662l0.685-0.685l1.405-1.405l0.605-0.605l-0.505-0.692
            c-0.26-0.354-0.767-0.838-1.354-1.398c-0.28-0.266-0.571-0.543-0.837-0.81c-1.703-1.703-3.965-2.641-6.369-2.641
            c-2.062,0-4.019,0.691-5.605,1.963L4.413,8.024L2.706,6.317L2.706,6.317z"/>
    </g>
    </svg>`;

    VG.Shaders.fs[ this.prefix + "redo.svg" ] = `<?xml version="1.0" encoding="utf-8"?>
    <!-- Generator: Adobe Illustrator 15.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg version="1.1" id="Ebene_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
    <path fill-rule="evenodd" clip-rule="evenodd" fill="#E4E4E4" d="M5.111,14.711l-1.405-1.405c0.316-0.433,1.311-1.31,2.091-2.091
        c3.124-3.124,8.181-3.133,11.306-0.009l2.475-2.475v7.072l-7.071-0.001l3.182-3.182c-2.344-2.344-6.142-2.344-8.485,0
        C6.433,13.389,5.476,14.369,5.111,14.711z"/>
    <g opacity="0.1">
        <path d="M19.577,8.731v7.072l-7.071-0.001l3.182-3.182c-1.172-1.172-2.707-1.758-4.243-1.758c-1.535,0-3.071,0.586-4.243,1.758
            c-0.77,0.769-1.727,1.749-2.091,2.091l-1.405-1.405c0.316-0.433,1.311-1.31,2.091-2.091C7.361,9.65,9.41,8.867,11.458,8.867
            c2.042,0,4.083,0.779,5.644,2.338L19.577,8.731 M20.577,6.317L18.87,8.024L17.063,9.83c-1.587-1.272-3.543-1.963-5.605-1.963
            c-2.404,0-4.666,0.938-6.369,2.641c-0.266,0.266-0.557,0.543-0.837,0.81c-0.587,0.56-1.095,1.043-1.354,1.398l-0.506,0.692
            l0.606,0.605l1.405,1.405l0.685,0.685l0.706-0.662c0.238-0.224,0.725-0.715,1.25-1.245c0.288-0.29,0.587-0.593,0.863-0.867
            c0.945-0.946,2.201-1.466,3.536-1.466c0.996,0,1.947,0.289,2.758,0.828l-2.404,2.404l-1.707,1.707h2.414l7.071,0.001h1v-1V8.731
            V6.317L20.577,6.317z"/>
    </g>
    </svg>`;

    VG.Shaders.fs[ this.prefix + "new.svg" ] = `<?xml version="1.0" encoding="utf-8"?>
    <!-- Generator: Adobe Illustrator 15.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg version="1.1" id="Ebene_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
    <polygon fill-rule="evenodd" clip-rule="evenodd" fill="#E4E4E4" points="21,10.999 14.42,10.999 19.073,6.345 17.655,4.928
        13.002,9.581 13.002,3 10.997,3 10.997,9.58 6.345,4.928 4.927,6.345 9.58,10.999 3,10.999 3,13.002 9.58,13.002 4.927,17.656
        6.345,19.073 10.997,14.421 10.997,21 13.002,21 13.002,14.42 17.655,19.073 19.073,17.656 14.42,13.002 21,13.002 "/>
    <g opacity="0.1">
        <path d="M13.002,3v6.581l4.653-4.653l1.418,1.417l-4.653,4.654H21v2.003h-6.58l4.653,4.654l-1.418,1.417l-4.653-4.653V21h-2.005
            v-6.579l-4.652,4.652l-1.418-1.417l4.653-4.654H3v-2.003h6.58L4.927,6.345l1.418-1.417l4.652,4.652V3H13.002 M14.002,2h-1h-2.005
            h-1v1v4.166L7.052,4.221L6.345,3.514L5.638,4.22L4.22,5.637L3.512,6.344L4.22,7.052l2.946,2.947H3H2v1v2.003v1h1h4.166L4.22,16.949
            l-0.708,0.707l0.708,0.707l1.418,1.417l0.707,0.707l0.707-0.707l2.945-2.945V21v1h1h2.005h1v-1v-4.166l2.946,2.946l0.707,0.707
            l0.707-0.707l1.418-1.417l0.707-0.707l-0.707-0.707l-2.946-2.947H21h1v-1v-2.003v-1h-1h-4.166l2.946-2.947l0.707-0.708L19.78,5.637
            L18.362,4.22l-0.707-0.707l-0.707,0.707l-2.946,2.946V3V2L14.002,2z"/>
    </g>
    </svg>`;

    VG.Shaders.fs[ this.prefix + "open.svg" ] = `<?xml version="1.0" encoding="utf-8"?>
    <!-- Generator: Adobe Illustrator 15.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg version="1.1" id="Ebene_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
    <g>
        <polygon fill="#DFDFDF" points="13.016,15.977 17,15.977 12,20.977 7,15.977 11.016,15.977 11.016,10.708 13.016,10.708 	"/>
        <polygon fill="#DFDFDF" points="18,10.999 16,10.999 16,4.999 8,4.999 8,10.999 6,10.999 6,2.999 6.984,2.999 8,2.999 16,2.999
            17,2.999 18,2.999 	"/>
        <g opacity="0.1">
            <path d="M13.016,10.708v5.271H17l-5,5l-5-5h4.016v-5.271H13.016 M14.016,9.708h-1h-2h-1v1v4.271H7H4.586l1.707,1.707l5,5
                L12,22.393l0.707-0.707l5-5l1.707-1.707H17h-2.984v-4.271V9.708L14.016,9.708z"/>
        </g>
        <g opacity="0.1">
            <path d="M18,2.999v8h-2v-6H8v6H6v-8h0.984H8h8h1H18 M19,1.999h-1h-1h-1H8H6.984H6H5v1v8v1h1h2h1v-1v-5h6v5v1h1h2h1v-1v-8V1.999
                L19,1.999z"/>
        </g>
    </g>
    </svg>`;

    VG.Shaders.fs[ this.prefix + "save.svg" ] = `<?xml version="1.0" encoding="utf-8"?>
    <!-- Generator: Adobe Illustrator 15.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg version="1.1" id="Ebene_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
    <g>
        <polygon fill="#DFDFDF" points="13.016,8.008 17,8.008 12,3.008 7,8.008 11.016,8.008 11.016,13.279 13.016,13.279 	"/>
        <polygon fill="#DFDFDF" points="18,12.988 16,12.988 16,18.988 8,18.988 8,12.988 6,12.988 6,20.988 6.984,20.988 8,20.988
            16,20.988 17,20.988 18,20.988 	"/>
        <g opacity="0.1">
            <path d="M12,3.008l5,5h-3.984v5.271h-2V8.008H7L12,3.008 M12,1.594l-0.707,0.707l-5,5L4.586,9.008H7h3.016v4.271v1h1h2h1v-1V9.008
                H17h2.414l-1.707-1.707l-5-5L12,1.594L12,1.594z"/>
        </g>
        <g opacity="0.1">
            <path d="M18,12.988v8h-1h-1H8H6.984H6v-8h2v6h8v-6H18 M19,11.988h-1h-2h-1v1v5H9v-5v-1H8H6H5v1v8v1h1h0.984H8h8h1h1h1v-1v-8
                V11.988L19,11.988z"/>
        </g>
    </g>
    </svg>`;

    VG.Shaders.fs[ this.prefix + "saveas.svg" ] = `<?xml version="1.0" encoding="utf-8"?>
    <!-- Generator: Adobe Illustrator 15.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg version="1.1" id="Ebene_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
    <g>
        <g>
            <polygon fill="#DFDFDF" points="12.962,7.986 16.946,7.986 11.946,2.986 6.946,7.986 10.962,7.986 10.962,13.256 12.962,13.256
                "/>
            <polygon fill="#DFDFDF" points="17.946,12.965 15.946,12.965 15.946,18.965 7.946,18.965 7.946,12.965 5.946,12.965 5.946,20.965
                6.931,20.965 7.946,20.965 15.946,20.965 16.946,20.965 17.946,20.965 		"/>
            <g opacity="0.1">
                <path d="M11.946,2.986l5,5h-3.984v5.271h-2V7.986H6.946L11.946,2.986 M11.946,1.572l-0.707,0.707l-5,5L4.532,8.986h2.414h3.016
                    v4.271v1h1h2h1v-1V8.986h2.984h2.414l-1.707-1.707l-5-5L11.946,1.572L11.946,1.572z"/>
            </g>
            <g opacity="0.1">
                <path d="M17.946,12.965v8h-1h-1h-8H6.931H5.946v-8h2v6h8v-6H17.946 M18.946,11.965h-1h-2h-1v1v5h-6v-5v-1h-1h-2h-1v1v8v1h1h0.984
                    h1.016h8h1h1h1v-1v-8V11.965L18.946,11.965z"/>
            </g>
        </g>
        <rect x="14.903" y="3" fill="#DFDFDF" width="7" height="1"/>
        <rect x="17.942" fill="#DFDFDF" width="1" height="7"/>
    </g>
    </svg>`;

    VG.Shaders.fs[ this.prefix + "user.svg" ] = `<?xml version="1.0" encoding="utf-8"?>
    <!-- Generator: Adobe Illustrator 15.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg version="1.1" id="Ebene_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
    <path fill="#E4E4E4" d="M16.527,11.564c-0.939,1.524-2.608,2.55-4.527,2.55c-1.916,0-3.585-1.025-4.523-2.55
        c-1.919,1.401-3.178,3.648-3.178,6.205c0,4.253,15.403,4.253,15.403,0C19.702,15.213,18.443,12.966,16.527,11.564z"/>
    <path fill="#E4E4E4" d="M12,2.013c-2.486,0-4.511,2.024-4.511,4.511c0,0.862,0.257,1.659,0.676,2.345
        c0.795,1.295,2.211,2.166,3.835,2.166c1.628,0,3.041-0.871,3.835-2.166c0.423-0.686,0.676-1.482,0.676-2.345
        C16.511,4.037,14.489,2.013,12,2.013z"/>
    <g opacity="0.1">
        <path d="M16.527,11.564c1.916,1.401,3.175,3.648,3.175,6.205c0,2.126-3.851,3.189-7.702,3.189s-7.702-1.063-7.702-3.189
            c0-2.557,1.259-4.804,3.178-6.205c0.938,1.524,2.607,2.55,4.523,2.55C13.919,14.114,15.588,13.089,16.527,11.564 M16.244,10.118
            l-0.568,0.922c-0.8,1.299-2.175,2.074-3.676,2.074c-1.5,0-2.873-0.775-3.672-2.074l-0.567-0.921l-0.874,0.638
            c-2.28,1.665-3.588,4.222-3.588,7.013c0,3.093,4.688,4.189,8.702,4.189s8.702-1.097,8.702-4.189c0-2.79-1.307-5.346-3.584-7.012
            L16.244,10.118L16.244,10.118z"/>
    </g>
    <g opacity="0.1">
        <path d="M12,2.013c2.489,0,4.511,2.024,4.511,4.511c0,0.862-0.253,1.659-0.676,2.345c-0.794,1.295-2.207,2.166-3.835,2.166
            c-1.624,0-3.04-0.871-3.835-2.166C7.746,8.183,7.489,7.386,7.489,6.523C7.489,4.037,9.514,2.013,12,2.013 M12,1.013
            c-3.039,0-5.511,2.472-5.511,5.511c0,0.995,0.284,1.986,0.822,2.866c1.017,1.657,2.77,2.645,4.688,2.645
            c1.92,0,3.673-0.988,4.688-2.644c0.538-0.872,0.823-1.864,0.823-2.867C17.511,3.485,15.039,1.013,12,1.013L12,1.013z"/>
    </g>
    </svg>`;

    VG.Shaders.fs[ this.prefix + "login.svg" ] = `<?xml version="1.0" encoding="utf-8"?>
    <!-- Generator: Adobe Illustrator 15.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg version="1.1" id="Ebene_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
    <polygon fill-rule="evenodd" clip-rule="evenodd" fill="#E4E4E4" points="10.962,10.985 10.962,7 15.962,12 10.962,17
        10.962,12.985 3.006,13.012 3.006,11.011 "/>
    <polygon fill-rule="evenodd" clip-rule="evenodd" fill="#E4E4E4" points="11.009,2.996 11.009,4.996 20.023,4.996 20.023,19.004
        11.009,19.004 11.009,21.004 22.023,21.004 22.023,20.02 22.023,19.004 22.023,4.996 22.023,3.996 22.023,2.996 "/>
    <g opacity="0.1">
        <path d="M10.962,7l5,5l-5,5v-4.015l-7.956,0.027v-2l7.956-0.026V7 M9.962,4.586V7v2.988l-6.959,0.023l-0.997,0.003v0.997v2v1.003
            l1.003-0.003l6.953-0.023V17v2.414l1.707-1.707l5-5L17.376,12l-0.707-0.707l-5-5L9.962,4.586L9.962,4.586z"/>
    </g>
    <g opacity="0.1">
        <path d="M22.023,2.996v1v1v14.008v1.016v0.984H11.009v-2h9.015V4.996h-9.015v-2H22.023 M23.023,1.996h-1H11.009h-1v1v2v1h1h8.015
            v12.008h-8.015h-1v1v2v1h1h11.015h1v-1V20.02v-1.016V4.996v-1v-1V1.996L23.023,1.996z"/>
    </g>
    </svg>`;

    VG.Shaders.fs[ this.prefix + "logout.svg" ] = `<?xml version="1.0" encoding="utf-8"?>
    <!-- Generator: Adobe Illustrator 15.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg version="1.1" id="Ebene_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
    <polygon fill-rule="evenodd" clip-rule="evenodd" fill="#E4E4E4" points="7.982,10.958 7.982,6.974 2.982,11.974 7.982,16.974
        7.982,12.958 15.938,12.984 15.938,10.984 "/>
    <polygon fill-rule="evenodd" clip-rule="evenodd" fill="#E4E4E4" points="10.984,2.969 10.984,4.969 19.999,4.969 19.999,18.978
        10.984,18.978 10.984,20.978 21.999,20.978 21.999,19.993 21.999,18.978 21.999,4.969 21.999,3.969 21.999,2.969 "/>
    <g opacity="0.1">
        <path d="M7.982,6.974v3.984l7.956,0.026v2l-7.956-0.026v4.016l-5-5L7.982,6.974 M8.982,4.56L7.275,6.267l-5,5l-0.707,0.707
            l0.707,0.707l5,5l1.707,1.707v-2.414v-3.013l6.953,0.023l1.003,0.003v-1.003v-2V9.988l-0.997-0.003L8.982,9.961V6.974V4.56
            L8.982,4.56z"/>
    </g>
    <g opacity="0.1">
        <path d="M21.999,2.969v1v1v14.008v1.016v0.984H10.984v-2h9.015V4.969h-9.015v-2H21.999 M22.999,1.969h-1H10.984h-1v1v2v1h1h8.015
            v12.008h-8.015h-1v1v2v1h1h11.015h1v-1v-0.984v-1.016V4.969v-1v-1V1.969L22.999,1.969z"/>
    </g>
    </svg>`;

    VG.Shaders.fs[ this.prefix + "quickmenu.svg" ] = `<?xml version="1.0" encoding="utf-8"?>
    <!-- Generator: Adobe Illustrator 15.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg version="1.1" id="Ebene_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
    <rect x="3" y="11" fill-rule="evenodd" clip-rule="evenodd" fill="#E4E4E4" width="18" height="2"/>
    <rect x="3" y="5" fill-rule="evenodd" clip-rule="evenodd" fill="#E4E4E4" width="18" height="2"/>
    <rect x="3" y="17" fill-rule="evenodd" clip-rule="evenodd" fill="#E4E4E4" width="18" height="2"/>
    <g opacity="0.1">
        <path d="M21,11v2H3v-2H21 M22,10h-1H3H2v1v2v1h1h18h1v-1v-2V10L22,10z"/>
    </g>
    <g opacity="0.1">
        <path d="M21,5v2H3V5H21 M22,4h-1H3H2v1v2v1h1h18h1V7V5V4L22,4z"/>
    </g>
    <g opacity="0.1">
        <path d="M21,17v2H3v-2H21 M22,16h-1H3H2v1v2v1h1h18h1v-1v-2V16L22,16z"/>
    </g>
    </svg>`;

    VG.Shaders.fs[ this.prefix + "skin.svg" ] = `<?xml version="1.0" encoding="utf-8"?>
    <!-- Generator: Adobe Illustrator 15.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg version="1.1" id="Ebene_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
    <g>
        <g>
            <path fill="#DFDFDF" d="M-346.25,103.518l2.588-2.588c-0.002-0.053-0.004-0.104-0.004-0.156c0-2.025,1.641-3.666,3.666-3.666
                c0.053,0,0.104,0.002,0.156,0.004l1.292-1.293c-0.44-0.07-0.896-0.109-1.367-0.109c-5.495,0-8.97,5.09-8.97,5.09
                S-347.939,102.189-346.25,103.518z"/>
            <path fill="#DFDFDF" d="M-336.04,96.592l3.021-3.02l-1.144-1.145l-14,14.002l1.143,1.143l2.769-2.77
                c1.239,0.635,2.696,1.088,4.333,1.088c5.494,0,8.807-5.092,8.807-5.092S-332.907,98.049-336.04,96.592z M-340,104.438
                c-1.068,0-2.029-0.457-2.7-1.188l1.669-1.668c0.284,0.275,0.672,0.445,1.098,0.445c0.875,0,1.583-0.711,1.583-1.586
                c0-0.426-0.168-0.812-0.441-1.098l1.27-1.271c0.73,0.67,1.188,1.631,1.188,2.699C-336.334,102.797-337.977,104.438-340,104.438z"
                />
        </g>
    </g>
    <g opacity="0.1">
        <g>
            <g>
                <path d="M-339.91,95.709c0.473,0,0.926,0.04,1.367,0.109l-1.292,1.293c-0.052-0.002-0.103-0.004-0.156-0.004
                    c-2.025,0-3.666,1.641-3.666,3.666c0,0.053,0.002,0.104,0.004,0.156l-2.588,2.588c-1.689-1.328-2.639-2.718-2.639-2.718
                    S-345.405,95.709-339.91,95.709 M-339.91,94.709c-5.955,0-9.642,5.301-9.796,5.527l-0.385,0.564l0.385,0.562
                    c0.042,0.062,1.058,1.533,2.847,2.939l0.698,0.549l0.627-0.628l2.588-2.588l0.309-0.31l-0.016-0.436l-0.004-0.119
                    c0-1.471,1.196-2.666,2.666-2.666l0.116,0.002l0.437,0.018l0.312-0.309l1.292-1.293l1.391-1.392l-1.942-0.304
                    C-338.909,94.749-339.405,94.709-339.91,94.709L-339.91,94.709z"/>
            </g>
            <g>
                <path d="M-334.153,92.429l1.143,1.144l-3.021,3.02c3.135,1.457,4.928,4.208,4.928,4.208s-3.312,5.091-8.806,5.091
                    c-1.637,0-3.093-0.453-4.333-1.088l-2.769,2.77l-1.143-1.143L-334.153,92.429 M-339.924,102.027c-0.426,0-0.814-0.17-1.098-0.443
                    l-1.669,1.668c0.67,0.729,1.632,1.186,2.7,1.186c2.023,0,3.666-1.64,3.666-3.664c0-1.067-0.457-2.029-1.188-2.699l-1.271,1.271
                    c0.274,0.285,0.442,0.672,0.442,1.098C-338.341,101.318-339.049,102.027-339.924,102.027 M-334.153,91.014l-0.707,0.708
                    l-14.001,14.001l-0.708,0.707l0.708,0.707l1.143,1.143l0.707,0.707l0.707-0.707l2.271-2.271c1.345,0.586,2.729,0.883,4.124,0.883
                    c5.967,0,9.497-5.318,9.645-5.546l0.355-0.545l-0.355-0.546c-0.069-0.105-1.523-2.307-4.11-3.903l2.072-2.071l0.707-0.707
                    l-0.707-0.707l-1.144-1.144L-334.153,91.014L-334.153,91.014z M-339.924,103.027c1.41,0,2.56-1.137,2.583-2.541
                    c0.01,0.095,0.016,0.189,0.016,0.287c0,1.469-1.195,2.664-2.666,2.664c-0.423,0-0.828-0.097-1.192-0.279l0.311-0.311
                    C-340.574,102.966-340.253,103.027-339.924,103.027L-339.924,103.027z"/>
            </g>
        </g>
    </g>
    <g>
        <g>
            <path fill="#DFDFDF" d="M5.75,15.518l2.588-2.588c-0.002-0.053-0.004-0.104-0.004-0.156c0-2.025,1.641-3.666,3.666-3.666
                c0.053,0,0.104,0.002,0.156,0.004l1.292-1.293c-0.439-0.07-0.895-0.109-1.366-0.109c-5.495,0-8.97,5.09-8.97,5.09
                S4.061,14.189,5.75,15.518z"/>
            <path fill="#DFDFDF" d="M15.961,8.592l3.02-3.02l-1.143-1.145L3.837,18.43l1.143,1.143l2.769-2.77
                c1.239,0.635,2.696,1.088,4.333,1.088c5.494,0,8.807-5.092,8.807-5.092S19.094,10.049,15.961,8.592z M12,16.438
                c-1.068,0-2.029-0.457-2.7-1.188l1.669-1.668c0.284,0.275,0.672,0.445,1.098,0.445c0.875,0,1.583-0.711,1.583-1.586
                c0-0.426-0.168-0.812-0.441-1.098l1.27-1.271c0.73,0.67,1.188,1.631,1.188,2.699C15.666,14.797,14.023,16.438,12,16.438z"/>
        </g>
    </g>
    <g opacity="0.1">
        <g>
            <g>
                <path d="M12.09,7.709c0.473,0,0.926,0.04,1.367,0.109l-1.292,1.293c-0.052-0.002-0.103-0.004-0.156-0.004
                    c-2.025,0-3.666,1.641-3.666,3.666c0,0.053,0.002,0.104,0.004,0.156l-2.588,2.588C4.07,14.189,3.12,12.8,3.12,12.8
                    S6.595,7.709,12.09,7.709 M12.09,6.709c-5.955,0-9.642,5.301-9.796,5.527l-0.385,0.564l0.385,0.562
                    c0.042,0.062,1.058,1.533,2.847,2.939l0.698,0.549l0.627-0.628l2.588-2.588l0.309-0.31l-0.016-0.436l-0.004-0.119
                    c0-1.471,1.196-2.666,2.666-2.666l0.116,0.002l0.437,0.018l0.312-0.309l1.292-1.293l1.391-1.392l-1.942-0.304
                    C13.091,6.749,12.595,6.709,12.09,6.709L12.09,6.709z"/>
            </g>
            <g>
                <path d="M17.847,4.429l1.143,1.144l-3.021,3.02c3.135,1.457,4.928,4.208,4.928,4.208s-3.312,5.091-8.806,5.091
                    c-1.637,0-3.093-0.453-4.333-1.088l-2.769,2.77L3.844,18.43L17.847,4.429 M12.076,14.027c-0.426,0-0.814-0.17-1.098-0.443
                    l-1.669,1.668c0.67,0.729,1.632,1.186,2.7,1.186c2.023,0,3.666-1.64,3.666-3.664c0-1.067-0.457-2.029-1.188-2.699l-1.271,1.271
                    c0.274,0.285,0.442,0.672,0.442,1.098C13.659,13.318,12.951,14.027,12.076,14.027 M17.847,3.014L17.14,3.722L3.138,17.723
                    L2.43,18.43l0.708,0.707l1.143,1.143l0.707,0.707l0.707-0.707l2.271-2.271c1.345,0.586,2.729,0.883,4.124,0.883
                    c5.967,0,9.497-5.318,9.645-5.546l0.355-0.545l-0.355-0.546c-0.069-0.105-1.523-2.307-4.11-3.903l2.072-2.071l0.707-0.707
                    l-0.707-0.707l-1.144-1.144L17.847,3.014L17.847,3.014z M12.076,15.027c1.41,0,2.56-1.137,2.583-2.541
                    c0.01,0.095,0.016,0.189,0.016,0.287c0,1.469-1.195,2.664-2.666,2.664c-0.423,0-0.828-0.097-1.192-0.279l0.311-0.311
                    C11.426,14.966,11.747,15.027,12.076,15.027L12.076,15.027z"/>
            </g>
        </g>
    </g>
    </svg>`;

    let glyphData = `<?xml version="1.0" encoding="utf-8"?>
    <!-- Generator: Adobe Illustrator 15.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg version="1.1" id="Ebene_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         width="841.89px" height="595.28px" viewBox="0 0 841.89 595.28" enable-background="new 0 0 841.89 595.28" xml:space="preserve">

    <g id="New">
    <path d="M483.021,216.496l-8.699-0.016l6.181-6.158c0.485-0.484,0.487-1.27,0.003-1.755
        c-0.483-0.484-1.269-0.487-1.755-0.003l-6.055,6.032l-0.016-8.44c-0.002-0.685-0.556-1.239-1.24-1.239c-0.001,0-0.002,0-0.002,0
        c-0.686,0.002-1.24,0.559-1.238,1.244l0.016,8.521l-6.087-6.063c-0.486-0.484-1.271-0.482-1.755,0.002
        c-0.483,0.486-0.482,1.271,0.003,1.756l6.117,6.093l-3.29-0.006l-5.35,0.034c-0.686,0.004-1.238,0.562-1.233,1.248
        c0.005,0.683,0.56,1.232,1.24,1.232c0.003,0,0.006,0,0.009,0l5.34-0.033l3.118,0.006l-2.198,2.189l-3.76,3.807
        c-0.481,0.487-0.477,1.272,0.012,1.754c0.241,0.239,0.557,0.358,0.871,0.358c0.32,0,0.64-0.123,0.883-0.369l3.752-3.8l2.34-2.33
        l0.006,3.397l-0.033,5.351c-0.005,0.686,0.547,1.244,1.232,1.249c0.002,0,0.005,0,0.008,0c0.682,0,1.235-0.551,1.24-1.233
        l0.033-5.361l-0.006-3.295l2.277,2.269l3.76,3.807c0.242,0.247,0.562,0.369,0.882,0.369c0.314,0,0.63-0.119,0.872-0.358
        c0.487-0.481,0.492-1.266,0.012-1.754l-3.768-3.814l-2.231-2.224l8.505,0.016c0.001,0,0.001,0,0.002,0
        c0.685,0,1.239-0.554,1.24-1.238C484.261,217.054,483.707,216.497,483.021,216.496z"/>
    </g>
    <g id="Open">
    <path fill="#FFFFFF" d="M247.809,212.147c-0.481-0.488-1.267-0.493-1.755-0.013l-2.549,2.514l-3.18,3.168l-2.877,2.913l-2.884-2.92
        l-3.177-3.166l-2.544-2.509c-0.487-0.48-1.273-0.476-1.754,0.013c-0.481,0.487-0.476,1.272,0.012,1.754l2.54,2.505l3.166,3.153
        l3.76,3.808c0.001,0.002,0.004,0.003,0.006,0.005c0.002,0.001,0.003,0.004,0.005,0.005c0.031,0.031,0.066,0.055,0.1,0.081
        c0.03,0.024,0.059,0.052,0.09,0.073c0.04,0.026,0.083,0.045,0.124,0.065c0.031,0.016,0.06,0.035,0.091,0.048
        c0.048,0.02,0.1,0.031,0.15,0.045c0.027,0.007,0.053,0.018,0.08,0.023c0.078,0.015,0.158,0.022,0.237,0.022
        c0.08,0,0.159-0.008,0.237-0.022c0.022-0.004,0.044-0.015,0.067-0.02c0.055-0.014,0.11-0.028,0.163-0.049
        c0.027-0.012,0.052-0.028,0.078-0.041c0.046-0.023,0.093-0.044,0.137-0.073c0.03-0.02,0.057-0.046,0.085-0.068
        c0.035-0.028,0.071-0.053,0.104-0.085c0.002-0.001,0.003-0.004,0.005-0.005c0.002-0.002,0.004-0.003,0.006-0.005l3.752-3.801
        l3.168-3.156l2.544-2.509C248.284,213.42,248.289,212.635,247.809,212.147z"/>
    </g>
    <g id="Save">
    <path d="M292.107,219.069l-3.166-3.152l-3.759-3.808c-0.002-0.002-0.004-0.003-0.007-0.006
        c-0.001-0.001-0.002-0.003-0.004-0.005c-0.027-0.026-0.057-0.045-0.086-0.069c-0.034-0.028-0.067-0.06-0.104-0.084
        c-0.034-0.022-0.07-0.038-0.105-0.056c-0.037-0.02-0.072-0.042-0.109-0.058c-0.038-0.016-0.078-0.023-0.117-0.035
        c-0.038-0.011-0.074-0.025-0.113-0.033c-0.039-0.007-0.08-0.008-0.12-0.012c-0.039-0.004-0.078-0.011-0.117-0.011
        s-0.078,0.007-0.117,0.011c-0.04,0.004-0.08,0.005-0.12,0.012c-0.039,0.008-0.076,0.022-0.114,0.033
        c-0.039,0.012-0.078,0.021-0.116,0.035c-0.038,0.016-0.074,0.038-0.11,0.058c-0.036,0.019-0.072,0.034-0.105,0.056
        c-0.037,0.024-0.069,0.056-0.104,0.084c-0.028,0.023-0.059,0.043-0.086,0.069c-0.002,0.002-0.003,0.004-0.005,0.005
        c-0.001,0.003-0.004,0.004-0.006,0.006l-3.753,3.801l-3.168,3.155l-2.544,2.509c-0.488,0.481-0.493,1.267-0.013,1.755
        c0.243,0.247,0.563,0.37,0.883,0.37c0.314,0,0.629-0.119,0.872-0.357l2.549-2.514l3.18-3.168l2.877-2.914l2.884,2.922l3.177,3.165
        l2.544,2.509c0.242,0.238,0.557,0.357,0.871,0.357c0.32,0,0.641-0.123,0.883-0.37c0.481-0.488,0.476-1.273-0.012-1.755
        L292.107,219.069z"/>
    </g>
    <g id="SaveAs">
        <path d="M335.081,219.541l-3.166-3.152l-3.76-3.808c-0.002-0.002-0.004-0.003-0.006-0.006
            c-0.002-0.001-0.003-0.003-0.005-0.005c-0.026-0.027-0.058-0.046-0.087-0.07c-0.033-0.027-0.066-0.059-0.103-0.083
            c-0.034-0.022-0.072-0.038-0.108-0.058c-0.035-0.019-0.07-0.04-0.106-0.056c-0.039-0.016-0.079-0.024-0.119-0.035
            c-0.036-0.011-0.073-0.025-0.11-0.033c-0.041-0.007-0.08-0.008-0.121-0.012c-0.039-0.004-0.077-0.011-0.117-0.011
            c-0.039,0-0.077,0.007-0.116,0.011c-0.04,0.004-0.08,0.005-0.12,0.012c-0.038,0.008-0.074,0.022-0.113,0.033
            c-0.039,0.012-0.078,0.02-0.115,0.035c-0.039,0.016-0.074,0.038-0.109,0.058c-0.036,0.018-0.072,0.033-0.107,0.056
            c-0.036,0.024-0.068,0.056-0.103,0.083c-0.028,0.024-0.06,0.044-0.087,0.07c-0.002,0.002-0.003,0.004-0.004,0.005
            c-0.002,0.003-0.005,0.004-0.007,0.006l-3.753,3.801l-3.168,3.156l-2.544,2.509c-0.488,0.48-0.493,1.266-0.013,1.754
            c0.242,0.247,0.562,0.37,0.883,0.37c0.315,0,0.63-0.119,0.872-0.358l2.548-2.513l3.18-3.168l2.877-2.914l2.885,2.922l3.177,3.165
            l2.546,2.509c0.241,0.238,0.556,0.357,0.87,0.357c0.321,0,0.641-0.123,0.884-0.37c0.48-0.488,0.475-1.273-0.013-1.755
            L335.081,219.541z"/>
        <path d="M347.519,205.823l-2.893-0.019l-2.122,0.004l0.01-4.98c0.002-0.686-0.553-1.242-1.238-1.243h-0.002
            c-0.685,0-1.24,0.554-1.241,1.238l-0.009,4.989l-4.991,0.01c-0.685,0.002-1.239,0.558-1.237,1.243
            c0.001,0.684,0.556,1.238,1.24,1.238c0.001,0,0.002,0,0.002,0l4.981-0.01l-0.005,2.133l0.019,2.882
            c0.005,0.683,0.56,1.233,1.24,1.233c0.003,0,0.005,0,0.009,0c0.684-0.005,1.236-0.564,1.232-1.249l-0.019-2.872l0.004-2.131
            l2.121-0.005l2.882,0.019c0.004,0,0.006,0,0.009,0c0.681,0,1.236-0.551,1.241-1.232
            C348.756,206.386,348.204,205.826,347.519,205.823z"/>
    </g>
    <g id="Undo">
    <path fill="#FFFFFF" d="M388.607,216.497H370.93l1.666-1.644l3.16-3.174c0.483-0.485,0.481-1.27-0.004-1.754
        c-0.485-0.483-1.271-0.482-1.754,0.003l-3.153,3.166l-3.807,3.76c-0.01,0.01-0.017,0.02-0.025,0.029
        c-0.039,0.041-0.076,0.086-0.109,0.134c-0.014,0.018-0.026,0.035-0.038,0.053c-0.035,0.056-0.067,0.114-0.094,0.177
        c-0.004,0.006-0.008,0.012-0.01,0.019l0,0c-0.028,0.067-0.048,0.138-0.062,0.206c-0.005,0.021-0.008,0.043-0.011,0.064
        c-0.009,0.052-0.015,0.104-0.016,0.154c-0.002,0.023-0.002,0.046-0.002,0.068c0.002,0.059,0.006,0.115,0.016,0.173
        c0.002,0.015,0.002,0.029,0.005,0.043c0.015,0.069,0.034,0.138,0.06,0.204c0.009,0.02,0.017,0.038,0.026,0.059
        c0.021,0.048,0.045,0.095,0.073,0.141c0.012,0.021,0.024,0.04,0.038,0.061c0.035,0.052,0.075,0.1,0.118,0.146
        c0.008,0.008,0.012,0.017,0.02,0.023c0.001,0.002,0.004,0.003,0.006,0.005c0.001,0.002,0.003,0.004,0.006,0.007l3.8,3.753
        l3.16,3.172c0.242,0.243,0.561,0.365,0.879,0.365c0.316,0,0.633-0.121,0.875-0.362c0.485-0.482,0.487-1.269,0.004-1.754l-3.168-3.18
        l-1.658-1.637h16.436v4.343c0,0.685,0.556,1.24,1.241,1.24c0.685,0,1.24-0.556,1.24-1.24v-5.583
        C389.847,217.053,389.292,216.497,388.607,216.497z"/>
    </g>
    <g id="Redo">
    <path d="M436.466,278.245c-0.002-0.051-0.008-0.103-0.017-0.154c-0.003-0.021-0.006-0.043-0.011-0.064
        c-0.015-0.068-0.034-0.139-0.062-0.206l0,0c-0.003-0.007-0.008-0.013-0.01-0.019c-0.027-0.062-0.06-0.121-0.095-0.177
        c-0.012-0.018-0.024-0.035-0.038-0.053c-0.033-0.048-0.07-0.093-0.109-0.134c-0.009-0.01-0.015-0.02-0.024-0.029l-3.8-3.752
        l-3.161-3.174c-0.483-0.485-1.269-0.486-1.754-0.003c-0.485,0.484-0.486,1.269-0.004,1.754l3.168,3.181l1.657,1.637h-17.675
        c-0.686,0-1.241,0.556-1.241,1.24v5.583c0,0.685,0.556,1.24,1.241,1.24s1.241-0.556,1.241-1.24v-4.343h16.434l-1.664,1.644
        l-3.161,3.173c-0.482,0.485-0.481,1.271,0.004,1.754c0.242,0.241,0.559,0.362,0.875,0.362c0.318,0,0.637-0.122,0.879-0.365
        l3.153-3.166l3.808-3.759c0.002-0.003,0.004-0.005,0.005-0.007c0.003-0.002,0.005-0.003,0.006-0.005
        c0.008-0.007,0.012-0.016,0.02-0.023c0.044-0.047,0.083-0.095,0.118-0.146c0.014-0.021,0.026-0.04,0.038-0.061
        c0.028-0.046,0.053-0.093,0.074-0.141c0.008-0.021,0.018-0.039,0.025-0.059c0.025-0.066,0.046-0.135,0.06-0.204
        c0.003-0.014,0.003-0.028,0.006-0.043c0.009-0.058,0.014-0.114,0.015-0.173C436.467,278.291,436.467,278.269,436.466,278.245z"/>
    </g>
    <g id="User">
        <path fill="#070707" d="M30.925,30.529H1.076l-0.001-0.956c-0.001-1.021,0.055-4.455,0.844-5.728
            c2.457-3.99,5.327-5.975,8.581-5.975c0.216,0,0.378-0.04,0.435-0.108c0.052-0.062,0.09-0.202,0.093-0.393
            c-2.402-1.668-3.875-4.479-3.875-7.451c0-3.422,1.979-6.601,5.042-8.098c0.841-0.475,1.708-0.757,2.531-0.816
            c0.414-0.067,0.789-0.104,1.142-0.116c0.739,0.009,0.916,0.031,1.209,0.084l0.101,0.018c0.863,0.062,1.794,0.352,2.626,0.819
            c3.031,1.479,5.021,4.642,5.021,8.031c0,2.976-1.435,5.698-3.862,7.373c0.005,0.129,0.031,0.21,0.058,0.242
            c0.029,0.035,0.166,0.102,0.476,0.102c4.769,0,7.545,4.575,8.457,6.079l0.129,0.208c0.789,1.272,0.847,4.707,0.845,5.729
            L30.925,30.529z M3.005,28.615h25.99c-0.058-1.609-0.253-3.297-0.542-3.762l-0.136-0.225c-0.856-1.41-3.131-5.157-6.822-5.157
            c-1.066,0-1.648-0.432-1.948-0.794c-0.451-0.543-0.601-1.301-0.433-2.19l0.077-0.416l0.36-0.222
            c2.104-1.293,3.358-3.54,3.358-6.008c0-2.663-1.568-5.15-3.996-6.336c-0.651-0.364-1.313-0.57-1.91-0.607L16.73,2.856
            c-0.169-0.031-0.246-0.045-0.846-0.054c-0.238,0.008-0.545,0.041-0.894,0.099l-0.098,0.011c-0.548,0.033-1.156,0.236-1.81,0.603
            c-2.459,1.204-4.017,3.708-4.017,6.404c0,2.476,1.292,4.809,3.37,6.087l0.362,0.223l0.078,0.419c0.1,0.542,0.172,1.567-0.471,2.34
            c-0.303,0.364-0.879,0.798-1.906,0.798c-3.834,0-6.144,3.752-6.903,4.986l-0.051,0.082C3.257,25.319,3.062,27.007,3.005,28.615z"/>
    </g>
    <g id="Close"><path d="M17.5,82.5c1,1,2.4,1.6,3.8,1.6s2.7-0.5,3.8-1.6l25-25l25,25c1,1,2.4,1.6,3.8,1.6s2.7-0.5,3.8-1.6c2.1-2.1,2.1-5.5,0-7.5  l-25-25l25-25c2.1-2.1,2.1-5.5,0-7.5c-2.1-2.1-5.4-2.1-7.5,0l-25,25l-25-25c-2.1-2.1-5.4-2.1-7.5,0c-2.1,2.1-2.1,5.5,0,7.5l25,25  l-25,25C15.4,77.1,15.4,80.4,17.5,82.5z"></path>
    </g>
    <g id="SignUp">
        <path d="M561.808,202.808v7.235h2.482v-4.754h5.91v24.896h-5.91v-4.809h-2.482v7.29h19.555v-29.859H561.808z
             M578.882,230.186h-6.199v-24.896h6.199V230.186z"/>
        <path d="M557.845,208.185c-0.451-0.517-1.234-0.569-1.75-0.118s-0.568,1.234-0.117,1.751l5.525,6.322h-12.23
            c-0.686,0-1.24,0.555-1.24,1.24s0.555,1.24,1.24,1.24h12.422l-5.703,6.308c-0.461,0.508-0.42,1.293,0.088,1.752
            c0.236,0.215,0.535,0.32,0.832,0.32c0.338,0,0.676-0.138,0.92-0.408l8.189-9.056L557.845,208.185z"/>
    </g>
    <g id="quickmenu">
        <path d="M560.792,295.034h-20.034c-0.573,0-1.037,0.465-1.037,1.037c0,0.574,0.464,1.038,1.037,1.038h20.034
            c0.573,0,1.038-0.464,1.038-1.038C561.83,295.499,561.365,295.034,560.792,295.034z"/>
        <path d="M560.792,301.684h-20.034c-0.573,0-1.037,0.465-1.037,1.037c0,0.574,0.464,1.038,1.037,1.038h20.034
            c0.573,0,1.038-0.464,1.038-1.038C561.83,302.148,561.365,301.684,560.792,301.684z"/>
        <path d="M540.758,290.492h20.034c0.573,0,1.038-0.464,1.038-1.036c0-0.574-0.465-1.038-1.038-1.038h-20.034
            c-0.573,0-1.037,0.464-1.037,1.038C539.721,290.028,540.185,290.492,540.758,290.492z"/>
    </g>
    <g id="exit">
        <rect x="14.535" y="144.625" width="43.85" height="43.759"/>
        <path fill="#FFFFFF" d="M40.924,169.773l-3.307-3.295l6.609-6.583c0.32-0.319,0.321-0.836,0.002-1.156
            c-0.318-0.319-0.836-0.32-1.155-0.002l-6.613,6.589l-6.614-6.589c-0.32-0.318-0.836-0.317-1.156,0.002
            c-0.318,0.32-0.317,0.837,0.002,1.156l6.609,6.583l-3.311,3.3l-3.302,3.344c-0.317,0.321-0.314,0.838,0.007,1.155
            c0.159,0.157,0.367,0.236,0.574,0.236c0.211,0,0.422-0.081,0.582-0.244l3.298-3.338l3.311-3.3l3.307,3.295l3.302,3.343
            c0.16,0.163,0.371,0.244,0.581,0.244c0.208,0,0.415-0.079,0.575-0.236c0.321-0.317,0.324-0.834,0.007-1.155L40.924,169.773z"/>
    </g>
    <g id="SkinCycle">
        <path d="M91.551,252.728l46.195-46.195c-0.04-0.924-0.07-1.848-0.07-2.783c0-36.135,29.295-65.428,65.431-65.428
            c0.932,0,1.856,0.031,2.78,0.07l23.075-23.075c-7.849-1.231-15.979-1.944-24.416-1.944c-98.082,0-160.104,90.87-160.104,90.87
            S61.399,229.041,91.551,252.728z"/>
        <path d="M273.794,129.123l53.917-53.917L307.315,54.81L57.398,304.727l20.396,20.396l49.424-49.424
            c22.126,11.328,48.111,19.413,77.328,19.413c98.081,0,157.219-90.869,157.219-90.869S329.742,155.123,273.794,129.123z
            M203.106,269.177c-19.069,0-36.226-8.164-48.185-21.182l29.777-29.777c5.088,4.899,11.987,7.925,19.604,7.925
            c15.621,0,28.287-12.666,28.287-28.287c0-7.617-3.026-14.517-7.925-19.604l22.684-22.683
            c13.018,11.956,21.185,29.112,21.185,48.181C268.534,239.89,239.241,269.177,203.106,269.177z"/>
    </g>
    </svg>`;

    VG.Core.SVG( this.prefix + "glyphs.svg", glyphData, 20 );

    // --- Window Close

    VG.loadStyleImage( path, this.prefix + "windowclose.png" );
    VG.loadStyleImage( path, this.prefix + "windowclose_hover.png" );

    // --- Menu Checkmark

    VG.loadStyleImage( path, this.prefix + "checkmark.png" );
    VG.loadStyleImage( path, this.prefix + "checkmark_checked.png" );

    // --- Status

    VG.loadStyleImage( path, this.prefix + "status_error.png" );
    VG.loadStyleImage( path, this.prefix + "status_question.png" );
    VG.loadStyleImage( path, this.prefix + "status_success.png" );
    VG.loadStyleImage( path, this.prefix + "status_warning.png" );

    VG.loadStyleImage( path, "vg_logo.png" );
    VG.loadStyleImage( path, "vg_text_logo.png" );
    VG.loadStyleImage( path, "vg_powered_bd.png" );
};

VG.UI.stylePool.getStyleByName( "Visual Graphics" ).addSkin( new VG.UI.VisualGraphicsGraySkin() );