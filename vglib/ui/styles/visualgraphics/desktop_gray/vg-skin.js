/*
 * Copyright (c) 2015 Markus Moenig <markusm@visualgraphics.tv>
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

    this.CodeEdit={
        Font : VG.Font.Font( "Open Sans Semibold", 13 ),
        TopBorderColor : VG.Core.Color( 63, 75, 78 ),
        HeaderColor : VG.Core.Color( 63, 75, 78 ),
        HeaderTextColor : VG.Core.Color( 130, 151, 155 ),
        BackgroundColor : VG.Core.Color( 40, 48, 50 ),
        SelectionBackgroundColor : VG.Core.Color( 255, 255, 255, 120 ),
        SearchBackgroundColor : VG.Core.Color( 215, 206, 175 ),
        TextColor : VG.Core.Color( 240, 240, 240 ),
    };

    this.ContextMenu={
        Font : VG.Font.Font( "Roboto Regular", 13 ),

        TextColor : VG.Core.Color(),
        DisabledTextColor : VG.Core.Color( 128, 128, 128 ),

        BorderColor : VG.Core.Color( 204, 204, 204 ),
        BackColor : VG.Core.Color( 232, 232, 232 ),
        SelectedBackColor : VG.Core.Color( 168, 211, 245 ),
        SeparatorColor : VG.Core.Color( 160, 160, 160 ),
    };

    this.DecoratedToolBar={
        Height : 44,//66,
        Spacing : 10,

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
            Size : VG.Core.Size( 2, 28 ),
        },
    };

    this.DecoratedQuickMenu={

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

    this.HtmlView={
        FontName : "Open Sans Semibold",
        BoldFontName : "Open Sans Bold",  
        ItalicFontName : "Open Sans Semibold Italic",  
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

        ToolLayoutHeight : 28,
        //ToolTopBorderColor : VG.Core.Color( 194, 194, 194 ),
        //ToolBottomBorderColor : VG.Core.Color( 111, 111, 111 ),
        //ToolBackGradColor1 : VG.Core.Color( 174, 174, 174 ),
        //ToolBackGradColor2 : VG.Core.Color( 131, 131, 131 ),

        ToolTopBorderColor : VG.Core.Color( 191, 191, 191 ),
        ToolBottomBorderColor : VG.Core.Color( 111, 111, 111 ),
        ToolBackGradColor1 : VG.Core.Color( 148, 148, 148 ),
        ToolBackGradColor2 : VG.Core.Color( 142, 142, 142 ),        
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
        BackColor : VG.Core.Color( 172, 172, 172 ),
        SelectedBackColor : VG.Core.Color( 61, 61, 61 ),
        TextColor : VG.Core.Color( 255, 255, 255 ),
        SelectedTextColor : VG.Core.Color( 255, 255, 255 ),
    };    

    this.ScrollBar={
        Size : 14,
        BorderColor : VG.Core.Color( 119, 119, 119 ),
        BackColor : VG.Core.Color( 139, 139, 139 ),        
    };

    this.SectionBar={

        BorderColor : VG.Core.Color( 132, 132, 132 ),
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
        Font : VG.Font.Font( "Open Sans Semibold", 13 ),                
        TextColor : VG.Core.Color( 255, 255, 255 ),

        BorderColor : VG.Core.Color( 102, 102, 102 ),

        BackGradColor1 : VG.Core.Color( 125, 125, 125 ),
        BackGradColor2 : VG.Core.Color( 114, 114, 114 ),
    };

    this.ToolBar={
        //Height : 42,

        //TopBorderColor : VG.Core.Color( 220, 220, 220 ),
        //BottomBorderColor : VG.Core.Color( 89, 89, 89 ),

        //BackGradColor1 : VG.Core.Color( 196, 196, 196 ),
        //BackGradColor2 : VG.Core.Color( 155, 155, 155 ),

        Height : 25,

        TopBorderColor : VG.Core.Color( 102, 102, 102 ),
        BottomBorderColor : VG.Core.Color( 160, 160, 160 ),

        BackGradColor : VG.Core.Color( 120, 120, 120 ),

        Separator : {
            Color1 : VG.Core.Color( 136, 136, 136 ),
            Color2 : VG.Core.Color( 197, 197, 197 ),
            Size : VG.Core.Size( 2, 28 ),
        },        
    };

    this.ToolButton={

        Font : VG.Font.Font( "Roboto Regular", 14 ),
        TextColor : VG.Core.Color( 255, 255, 255 ),

        BorderColor : VG.Core.Color( 158, 158, 158 ),
        BackColor : VG.Core.Color( 163, 163, 163 ),

        HoverBorderColor : VG.Core.Color( 224, 224, 224 ),
        HoverBackColor : VG.Core.Color( 163, 163, 163 ),

        ClickedBorderColor : VG.Core.Color( 255, 255, 255 ),
        ClickedBackColor : VG.Core.Color( 186, 186, 186 ),

        TextMargin : VG.Core.Size( 10, 0 ),

        MinimumWidth : 45,
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

        Font : VG.Font.Font( "Open Sans Semibold", 13 ),

        TextColor : VG.Core.Color( 85, 81, 85 ),

        FocusBorderColor : VG.Core.Color( 126, 197, 243 ),
        BorderColor : VG.Core.Color( 213, 213, 213 ),
        HoverBorderColor : VG.Core.Color( 220, 220, 220 ),

        BackColor : VG.Core.Color( 120, 120, 120 ),

        Spacing : 3,
        Margin : VG.Core.Margin( 2, 2, 2, 2 ),

        ItemBackColor : VG.Core.Color( 192, 192, 192 ),
        ItemSelectedBorderColor : VG.Core.Color( 126, 197, 243 ),
        ItemSelectedBackColor : VG.Core.Color( 168, 211, 245 ),

        ToolLayoutHeight : 32,

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
};

VG.UI.VisualGraphicsGraySkin.prototype.activate=function()
{
	this.prefix=this.style.prefix + "gray_";

	var path=this.style.path + "/" + this.path;

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

	VG.loadStyleImage( path, this.prefix + "slider_focus.png" );
	VG.loadStyleImage( path, this.prefix + "slider_hover.png" );
	VG.loadStyleImage( path, this.prefix + "slider.png" );

    // --- Glyps

    VG.loadStyleSVG( path, this.prefix + "glyphs.svg" );
    VG.loadStyleSVG( path, this.prefix + "vglogo_text.svg" );
    VG.loadStyleSVG( path, this.prefix + "vglogo.svg" );    

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
};

VG.UI.stylePool.getStyleByName( "Visual Graphics" ).addSkin( new VG.UI.VisualGraphicsGraySkin );