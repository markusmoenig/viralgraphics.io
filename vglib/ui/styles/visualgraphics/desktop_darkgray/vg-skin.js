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

VG.UI.VisualGraphicsDarkGraySkin=function()
{
    this.name="Dark Gray";
    this.path="desktop_darkgray";

    this.Widget={
        Font : VG.Font.Font( "Open Sans Semibold", 13 ),

    	BackgroundColor : VG.Core.Color( 93, 93, 93 ),
        TextColor : VG.Core.Color( 244, 244, 244 ),
        DisabledTextColor : VG.Core.Color( 122, 122, 122 ),  
        FocusColor : VG.Core.Color( 129, 197, 242 ),

        DisabledAlpha : 0.5,
    };

    this.Button={

        Font : VG.Font.Font( "Open Sans Semibold", 13 ),
        SmallFont : VG.Font.Font( "Open Sans Semibold", 12 ),
        TextColor : VG.Core.Color( 255, 255, 255 ),

        FocusBorderColor1 : VG.Core.Color( 253, 252, 207 ),
        FocusBorderColor2 : VG.Core.Color( 132, 132, 132 ),
        FocusBorderCheckedColor2 : VG.Core.Color( 165, 165, 165 ),

        BorderColor : VG.Core.Color( 126, 126, 126 ),
        BackGradColor1 : VG.Core.Color( 148, 148, 148 ),
        BackGradColor2 : VG.Core.Color( 138, 138, 138 ),

        HoverBackGradColor1 : VG.Core.Color( 120, 120, 120 ),
        HoverBackGradColor2 : VG.Core.Color( 112, 112, 112 ),   

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

    this.Menu={
        Font : VG.Font.Font( "Open Sans Semibold", 13 ),
        ShortcutFont : VG.Font.Font( "Open Sans Semibold", 13 ),
        BorderColor : VG.Core.Color( 130, 130, 130 ),
        SeparatorColor : VG.Core.Color( 102, 102, 102 ),
        BackColor : VG.Core.Color( 149, 149, 149 ),
        DisabledTextColor : VG.Core.Color( 128, 128, 128 ),
        HighlightedTextColor : VG.Core.Color( 85, 85, 85 ),
        HighlightedBackColor : VG.Core.Color( 249, 247, 108 ),
        HighlightedBorderColor : VG.Core.Color( 249, 247, 108 ),
        TextColor : VG.Core.Color( 255, 255, 255 ),
    };


    this.ContextMenu={
        Font : VG.Font.Font( "Roboto Regular", 13 ),

        TextColor : VG.Core.Color( 255, 255, 255 ),
        DisabledTextColor : VG.Core.Color( 128, 128, 128 ),

        BorderColor : VG.Core.Color( 130, 130, 130 ),
        BackColor : VG.Core.Color( 149, 149, 149 ),
        SeparatorColor : VG.Core.Color( 102, 102, 102 ),

        HighlightedBackColor : VG.Core.Color( 249, 247, 108 ),
        HighlightedTextColor : VG.Core.Color( 85, 85, 85 ),
    };

    this.DecoratedToolBar={
        Height : 44,//66,
        Spacing : 10,

        LogoColor : VG.Core.Color( 255, 255, 255 ),

        TopBorderColor : VG.Core.Color( 142, 142, 142 ),
        //TopBorderColor1 : VG.Core.Color( 171, 171, 171 ),
        //TopBorderColor2 : VG.Core.Color( 214, 214, 214 ),
        BottomBorderColor : VG.Core.Color( 81, 81, 81 ),

        BackGradColor1 : VG.Core.Color( 129, 129, 129 ),
        BackGradColor2 : VG.Core.Color( 105, 105, 105 ),    

        Separator : {
            Color1 : VG.Core.Color( 136, 136, 136 ),
            Color2 : VG.Core.Color( 197, 197, 197 ),
            Size : VG.Core.Size( 2, 28 ),
        },
    };

    this.DecoratedQuickMenu={

        HoverColor : VG.Core.Color( 255, 255, 255 ),
        Color : VG.Core.Color( 180, 180, 180 ),         
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

        BackColor : VG.Core.Color( 99, 99, 99 ),
        FloatingBorderColor : VG.Core.Color( 126, 197, 243 ),

        HeaderHeight : 21,
        HeaderFont : VG.Font.Font( "Open Sans Bold", 12 ),
        HeaderBorderColor : VG.Core.Color( 86, 86, 86 ),
        HeaderBackGradColor1 : VG.Core.Color( 105, 105, 105 ),
        HeaderBackGradColor2 : VG.Core.Color( 96, 96, 96 ),

        HeaderTextColor : VG.Core.Color( 255, 255, 255 ),
    };

    this.DropDownMenu={

        Font : VG.Font.Font( "Open Sans Semibold", 13 ),

        TextColor : VG.Core.Color( 255, 255, 255 ),

        FocusBorderColor : VG.Core.Color( 253, 252, 207 ),
        BorderColor : VG.Core.Color( 107, 107, 107 ),
        HoverBorderColor : VG.Core.Color( 122, 122, 122 ),

        BackGradColor1 : VG.Core.Color( 98, 98, 98 ),
        BackGradColor2 : VG.Core.Color( 89, 89, 89 ),

        HoverBackGradColor1 : VG.Core.Color( 113, 113, 113 ),
        HoverBackGradColor2 : VG.Core.Color( 105, 105, 105 ),

        SepColor1 : VG.Core.Color( 122, 122, 122 ),
        SepColor2 : VG.Core.Color( 103, 103, 103 ),

        ItemBorderColor : VG.Core.Color( 153, 153, 153 ),
        ItemBackColor : VG.Core.Color( 124, 124, 124 ),
        ItemSelectedBackColor : VG.Core.Color( 249, 247, 108 ),
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

        FocusBorderColor : VG.Core.Color( 253, 252, 207 ),
        BorderColor : VG.Core.Color( 107, 107, 107 ),
        HoverBorderColor : VG.Core.Color( 122, 122, 122 ),

        BackColor : VG.Core.Color( 82, 82, 82 ),

        Spacing : 2,
        Margin : VG.Core.Margin( 2, 2, 2, 2 ),

        ItemBackColor : VG.Core.Color( 177, 177, 177 ),
        ItemSelectedBorderColor : VG.Core.Color( 253, 252, 207 ),
        ItemSelectedBackColor : VG.Core.Color( 249, 247, 108 ),

        ToolLayoutHeight : 28,

        ToolTopBorderColor : VG.Core.Color( 155, 155, 155 ),
        ToolBottomBorderColor : VG.Core.Color( 89, 89, 89 ),
        ToolBackGradColor1 : VG.Core.Color( 139, 139, 139 ),
        ToolBackGradColor2 : VG.Core.Color( 105, 105, 105 ),        
    };

    this.Menu={
        Font : VG.Font.Font( "Open Sans Semibold", 13 ),
        ShortcutFont : VG.Font.Font( "Open Sans Semibold", 13 ),
        BorderColor : VG.Core.Color( 130, 130, 130 ),
        SeparatorColor : VG.Core.Color( 102, 102, 102 ),
        BackColor : VG.Core.Color( 149, 149, 149 ),
        DisabledTextColor : VG.Core.Color( 128, 128, 128 ),
        HighlightedTextColor : VG.Core.Color( 85, 85, 85 ),
        HighlightedBackColor : VG.Core.Color( 249, 247, 108 ),
        HighlightedBorderColor : VG.Core.Color( 249, 247, 108 ),
        TextColor : VG.Core.Color( 255, 255, 255 ),
    };

    this.MenuBar={
        Font : VG.Font.Font( "Open Sans Semibold", 13 ),
        Height : 21,
        BorderSize : 1,

        TopBorderColor : VG.Core.Color( 180, 180, 180 ),
        BottomBorderColor : VG.Core.Color( 91, 91, 91 ),

        BackColor : VG.Core.Color( 137, 137, 137 ),
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

        BorderColor : VG.Core.Color( 75, 75, 75 ),
        BackColor : VG.Core.Color( 130, 130, 130 ),

        HeaderHeight : 21,
        HeaderFont : VG.Font.Font( "Open Sans Bold", 12 ),
        HeaderBorderColor : VG.Core.Color( 82, 82, 82 ),
        HeaderBackGradColor1 : VG.Core.Color( 100, 100, 100 ),
        HeaderBackGradColor2 : VG.Core.Color( 91, 91, 91 ),

        HeaderTextColor : VG.Core.Color( 255, 255, 255 ),

        Separator : {
            Height : 2,
            Color1 : VG.Core.Color( 109, 109, 109 ),
            Color2 : VG.Core.Color( 158, 158, 158 ),
        }
    };    

    this.SectionBarButton={

        Font : VG.Font.Font( "Open Sans Bold", 12 ),

        Size : VG.Core.Size( 81, 47 ),

        BorderColor : VG.Core.Color( 80, 80, 80 ),
        BackGradColor1 : VG.Core.Color( 80, 80, 80 ),
        BackGradColor2 : VG.Core.Color( 72, 72, 72 ),

        HoverBorderColor : VG.Core.Color( 107, 107, 107 ),
        HoverBackGradColor1 : VG.Core.Color( 94, 94, 94 ),
        HoverBackGradColor2 : VG.Core.Color( 86, 86, 86 ),

        SelectedBorderColor : VG.Core.Color( 245, 245, 245 ),
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

        TopBorderColor : VG.Core.Color( 155, 155, 155 ),
        BottomBorderColor : VG.Core.Color( 89, 89, 89 ),
        BackGradColor1 : VG.Core.Color( 139, 139, 139 ),
        BackGradColor2 : VG.Core.Color( 106, 106, 106 ),

        HoverTopBorderColor : VG.Core.Color( 162, 162, 162 ),
        HoverBottomBorderColor : VG.Core.Color( 104, 104, 104 ),
        HoverBackGradColor1 : VG.Core.Color( 147, 147, 147 ),
        HoverBackGradColor2 : VG.Core.Color( 118, 118, 118 ),

        SelectedTopBorderColor : VG.Core.Color( 135, 135, 135 ),
        SelectedBottomBorderColor : VG.Core.Color( 78, 78, 78 ),
        SelectedBackGradColor1 : VG.Core.Color( 121, 121, 121 ),
        SelectedBackGradColor2 : VG.Core.Color( 93, 93, 93 ),    
    };

    this.SplitLayout={

        Size : 7,

        BackColor : VG.Core.Color( 133, 133, 133 ),
        BorderColor : VG.Core.Color( 160, 160, 160 ),

        DragBackColor : VG.Core.Color( 132, 132, 132 ),
        DragBorderColor : VG.Core.Color( 239, 239, 239 ),     

        HoverBackColor : VG.Core.Color( 148, 148, 148 ),
        HoverBorderColor : VG.Core.Color( 191, 191, 191 ),  
    };    

    this.StatusBar={

        BorderColor : VG.Core.Color( 76, 76, 76 ),
        BackColor : VG.Core.Color( 120, 120, 120 ),
        Height : 20,
    };

    this.TabWidgetHeader={

        Font : VG.Font.Font( "Open Sans Semibold", 14 ),
        TextColor : VG.Core.Color( 244, 244, 244 ),
        Height : 32,

        SelectedEdgeBorderColor : VG.Core.Color( 110, 110, 110 ),
        SelectedTopBorderColor : VG.Core.Color( 118, 118, 118 ),
        SelectedSideBorderColor1 : VG.Core.Color( 114, 114, 114 ),
        SelectedSideBorderColor2 : VG.Core.Color( 103, 103, 103 ),

        SelectedBackGradientColor1 : VG.Core.Color( 119, 119, 119 ),
        SelectedBackGradientColor2 : VG.Core.Color( 114, 114, 114 ),

        HoverBackGradientColor1 : VG.Core.Color( 100, 100, 100 ),
        HoverBackGradientColor2 : VG.Core.Color( 89, 89, 89 ),

        BackGradientColor1 : VG.Core.Color( 106, 106, 106 ),
        BackGradientColor2 : VG.Core.Color( 95, 95, 95 ),

        LeftBorderColor : VG.Core.Color( 117, 117, 117 ),
        TabBorderColor : VG.Core.Color( 137, 137, 137 ),
        BottomBorderColor1 : VG.Core.Color( 98, 98, 98 ),
        BottomBorderColor2 : VG.Core.Color( 114, 114, 114 ),
    };

    this.TextEdit={

        Font : VG.Font.Font( "Roboto Regular", 14 ),                

        TextColor : VG.Core.Color( 242, 242, 242 ),
        DefaultTextColor : VG.Core.Color( 71, 71, 71 ),

        FocusBorderColor1 : VG.Core.Color( 253, 252, 207 ),
        FocusBorderColor2 : VG.Core.Color( 249, 247, 108 ),
        FocusBorderColor3 : VG.Core.Color( 119, 119, 119 ),
        FocusBackgroundColor : VG.Core.Color( 148, 148, 148 ),

        BackgroundColor : VG.Core.Color( 148, 148, 148 ),
        BorderColor1 : VG.Core.Color( 209, 209, 209 ),          
        BorderColor2 : VG.Core.Color( 149, 149, 149 ),   
    };    

    this.TextLineEdit={

    	Font : VG.Font.Font( "Roboto Regular", 14 ),                

    	TextColor : VG.Core.Color( 242, 242, 242 ),
        DefaultTextColor : VG.Core.Color( 71, 71, 71 ),

    	FocusBorderColor1 : VG.Core.Color( 253, 252, 207 ),
    	FocusBorderColor2 : VG.Core.Color( 249, 247, 108 ),
    	FocusBorderColor3 : VG.Core.Color( 148, 148, 148 ),
    	FocusBackgroundColor : VG.Core.Color( 148, 148, 148 ),

    	BackgroundColor : VG.Core.Color( 148, 148, 148 ),
    	BorderColor1 : VG.Core.Color( 209, 209, 209 ),    	 	
    	BorderColor2 : VG.Core.Color( 148, 148, 148 ),   
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

        Height : 26,

        TopBorderColor : VG.Core.Color( 102, 102, 102 ),
        BottomBorderColor : VG.Core.Color( 160, 160, 160 ),

        BackGradColor : VG.Core.Color( 120, 120, 120 ),

        Separator : {
            Color1 : VG.Core.Color( 82, 82, 82 ),
            Color2 : VG.Core.Color( 126, 126, 126 ),
            Size : VG.Core.Size( 2, 22 ),
        },        
    };

    this.ToolButton={

        Font : VG.Font.Font( "Roboto Regular", 14 ),
        TextColor : VG.Core.Color( 255, 255, 255 ),

        BorderColor : VG.Core.Color( 108, 108, 108 ),
        BackColor : VG.Core.Color( 130, 130, 130 ),

        HoverBorderColor : VG.Core.Color( 179, 179, 179 ),
        HoverBackColor : VG.Core.Color( 157, 157, 157 ),

        ClickedBorderColor : VG.Core.Color( 204, 204, 204 ),
        ClickedBackColor : VG.Core.Color( 149, 149, 149 ),

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

        FocusBorderColor : VG.Core.Color( 253, 252, 207 ),
        BorderColor : VG.Core.Color( 107, 107, 107 ),
        HoverBorderColor : VG.Core.Color( 122, 122, 122 ),

        BackColor : VG.Core.Color( 82, 82, 82 ),

        Spacing : 3,
        Margin : VG.Core.Margin( 2, 2, 2, 2 ),

        ItemBackColor : VG.Core.Color( 177, 177, 177 ),
        ItemSelectedBorderColor : VG.Core.Color( 253, 252, 207 ),
        ItemSelectedBackColor : VG.Core.Color( 249, 247, 108 ),

        ToolLayoutHeight : 28,

        ToolTopBorderColor : VG.Core.Color( 155, 155, 155 ),
        ToolBottomBorderColor : VG.Core.Color( 89, 89, 89 ),
        ToolBackGradColor1 : VG.Core.Color( 139, 139, 139 ),
        ToolBackGradColor2 : VG.Core.Color( 105, 105, 105 ),    

        ChildIndent : 20,
        ChildControlColor : VG.Core.Color( 227, 227, 227 ),
    };    

    this.Window={
        HeaderHeight : 25,

        HeaderFont : VG.Font.Font( "Open Sans Semibold", 14 ),
        HeaderTextColor : VG.Core.Color( 255, 255, 255 ),

        BackColor : VG.Core.Color( 82, 82, 82 ),

        BorderColor1 : VG.Core.Color( 147, 147, 147 ),
        BorderColor2 : VG.Core.Color( 197, 197, 197 ),

        HeaderBackGradColor1 : VG.Core.Color( 156, 156, 156 ),
        HeaderBackGradColor2 : VG.Core.Color( 143, 143, 143 ),
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

VG.UI.VisualGraphicsDarkGraySkin.prototype.activate=function()
{
    this.prefix=this.style.prefix + "darkgray_";
    this.fallbackPrefix=this.style.prefix + "gray_";

    var path=this.style.path + "/" + this.path;

    VG.loadStyleImage( path, this.prefix + "checkbox_focus.png" );
    VG.loadStyleImage( path, this.prefix + "checkbox_focus_checked.png" );
/*
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
    */
};

VG.UI.stylePool.getStyleByName( "Visual Graphics" ).addSkin( new VG.UI.VisualGraphicsDarkGraySkin );