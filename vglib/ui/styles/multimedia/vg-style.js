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

VG.Styles.Multimedia=function( desktopStyle )
{
    this.name="Multimedia";
    this.skins=[];

    this.iconPrefix="mmstyle_";
    this.path="multimedia";

    this.workRect1=VG.Core.Rect();
    this.workRect2=VG.Core.Rect();

    VG.loadStyleImage( this.path, "mmstyle_new.png" );
    VG.loadStyleImage( this.path, "mmstyle_open.png" );
    VG.loadStyleImage( this.path, "mmstyle_save.png" );
    VG.loadStyleImage( this.path, "mmstyle_undo.png" );
    VG.loadStyleImage( this.path, "mmstyle_redo.png" );

    VG.loadStyleImage( this.path, "mmstyle_checkbox.png" );
    VG.loadStyleImage( this.path, "mmstyle_checkbox_selected.png" );
    VG.loadStyleImage( this.path, "mmstyle_checkbox_checked.png" );
    VG.loadStyleImage( this.path, "mmstyle_checkbox_checked_selected.png" );

    VG.loadStyleImage( this.path, "mmstyle_checkmark_checked_highlighted.png" );
    VG.loadStyleImage( this.path, "mmstyle_checkmark_checked.png" );
    VG.loadStyleImage( this.path, "mmstyle_checkmark.png" );
    VG.loadStyleImage( this.path, "mmstyle_checkmark_highlighted.png" );

    VG.loadStyleImage( this.path, "mmstyle_slider.png" );
    VG.loadStyleImage( this.path, "mmstyle_slider_hover.png" );
    VG.loadStyleImage( this.path, "mmstyle_slider_selected.png" );

    VG.loadStyleImage( this.path, "mmstyle_double_arrow_right.png" );

    VG.loadStyleImage( this.path, "mmstyle_tree_plus.png" );
    VG.loadStyleImage( this.path, "mmstyle_tree_minus.png" );

    VG.loadStyleImage( this.path, "mmstyle_nodes_bg.jpg" );    

    if ( 1 )
    {
        this.DefaultFontName="Roboto Regular";
        this.DefaultBoldFontName="Open Sans Bold";
        this.DefaultItalicFontName="Open Sans Semibold Italic";

        this.black= {

            "name" : "Black",

            "DefaultFont" : VG.Font.Font( this.DefaultFontName, 14 ),
            "DefaultBoldFont" : VG.Font.Font( this.DefaultBoldFontName, 14 ),
            "DefaultItalicFont" : VG.Font.Font( this.DefaultItalicFontName, 14 ),
            "LoginFont" : VG.Font.Font( this.DefaultFontName, 16 ),

            Widget : {
                BackgroundColor : VG.Core.Color( 32, 32, 32 ),
                TextColor : VG.Core.Color( 126, 126, 124 ),
                EmbeddedTextColor : VG.Core.Color( 101, 123, 170 ),
                DisabledTextColor : VG.Core.Color( 67, 67, 67 ),  
                SelectionColor : VG.Core.Color( 72, 87, 117 ),
            },

            Window : {
                FocusHeaderColor : VG.Core.Color( 57, 57, 57 ),
                BackgroundColor : VG.Core.Color( 29, 29, 29 ),
                HeaderHeight : 26,
            },

            Dialog : {
                BorderColor : VG.Core.Color( 77, 77, 77 ),
                BackgroundColor : VG.Core.Color( 29, 29, 29 ),

                Header : {
                    Color1 : VG.Core.Color( 62, 62, 62 ),
                    Color2 : VG.Core.Color( 48, 48, 48 ),
                    BorderColor : VG.Core.Color( 77, 77, 77 ),
                    Font : VG.Font.Font( this.DefaultFontName, 13 ),                    
                }
            },

            DockWidget : {
                BackgroundColor : VG.Core.Color( 32, 32, 32 ),
                BorderColor : VG.Core.Color( 7, 7, 7 ),

                Header : {
                    TextColor : VG.Core.Color( 126, 126, 124 ),
                    Font : VG.Font.Font( this.DefaultFontName, 13 ),
                    Height : 22,
                    GradientColor1 : VG.Core.Color( 42, 42, 42 ),
                    GradientColor2 : VG.Core.Color( 23, 23, 23 ),
                },

                FloatingBackgroundColor : VG.Core.Color( 32, 32, 32 ),
                FloatingBorderColor : VG.Core.Color( 73, 73, 73 ),
                FloatingSelectedBorderColor : VG.Core.Color( 72, 87, 117 ),
            },

            DockStripWidget : {
                Font : VG.Font.Font( this.DefaultFontName, 16 ),
                BorderColor : VG.Core.Color( 30, 30, 30 ),
                HoverColor : VG.Core.Color( 180, 166, 73 ),
                TextColor : VG.Core.Color( 255, 255, 255 ),
                BackgroundColor : VG.Core.Color( 32, 32, 32 ),
                HeaderHeight : 1,

                ButtonMinimumWidth : 55,

                Separator : {
                    Color1 : VG.Core.Color( 30, 30, 30 ),
                    Color2 : VG.Core.Color( 61, 61, 61 ),
                    Height : 2
                },
            },
            
            Toolbar: {
                TopBorderColor : VG.Core.Color( 21, 21, 22 ),
                BottomBorderColor1 : VG.Core.Color( 33, 33, 33 ),
                BottomBorderColor2 : VG.Core.Color( 4, 4, 4 ),
                GradientColor1 : VG.Core.Color( 70, 70, 70 ),
                GradientColor2 : VG.Core.Color( 39, 39, 39 ),
                Height : 43,
                Margin : VG.Core.Margin( 60, 0, 0, 0 ),
                Logo : {
                    Color : VG.Core.Color( 248, 248, 248 ),
                    BackgroundColor : VG.Core.Color( 131, 146, 236, 60 ),
                    Size : 30,
                },
                Separator : {
                    Color1 : VG.Core.Color( 30, 30, 30 ),
                    Color2 : VG.Core.Color( 61, 61, 61 ),
                    Size : VG.Core.Size( 2, 21 ), 
                },                
            },

            ToolButton : {
                Font : VG.Font.Font( this.DefaultFontName, 14 ),
                HoverColor : VG.Core.Color( 80, 80, 80 ),
                HoverBorderColor : VG.Core.Color( 94, 94, 94 ),
                TextColor : VG.Core.Color( 126, 126, 124 ),
                DisabledTextColor : VG.Core.Color( 67, 67, 67 ),
                MinimumWidth : 45,
                ScaleToParentHeight : false,
            },

            ToolPanel : {
                BorderColor1 : VG.Core.Color( 10, 10, 10 ),
                BorderColor2 : VG.Core.Color( 51, 51, 51 ),
                GradientColor1 : VG.Core.Color( 34, 34, 34 ),
                GradientColor2 : VG.Core.Color( 16, 16, 16 ),
                SeparatorColor : VG.Core.Color( 124, 129, 139 ),

                Height : 28,
                Spacing : 2,
                Margin : VG.Core.Margin( 4, 0, 4, 0 ),

                Separator : {
                    Color1 : VG.Core.Color( 30, 30, 30 ),
                    Color2 : VG.Core.Color( 61, 61, 61 ),
                    Size : VG.Core.Size( 2, 18 ), 
                },                  
            },

            Statusbar : {
                BorderColor : VG.Core.Color( 43, 43, 43 ),
                GradientColor1 : VG.Core.Color( 18, 18, 18 ),
                GradientColor2 : VG.Core.Color( 18, 18, 18 ),
                Height : 20,
            },

            ToolPanelButton : {
                HoverColor : VG.Core.Color( 143, 158, 232 ),
                ClickedColor : VG.Core.Color( 100, 123, 236 ),
                MinimumWidth : 28,
                ScaleToParentHeight : false,
                TextColor : VG.Core.Color( 126, 126, 124 ),
                DisabledTextColor : VG.Core.Color( 67, 67, 67 ),                 
            },           
            
            NumberEdit : {
                Font : VG.Font.Font( this.DefaultFontName, 14 ),
            },

            TextEdit : {
                Font : VG.Font.Font( "Roboto Regular", 14 ),                
                BorderColor : VG.Core.Color( 46, 46, 46 ),
                DisabledBorderColor : VG.Core.Color( 39, 39, 39 ),
                TextColor : VG.Core.Color( 97, 97, 97 ),
                DisabledTextColor : VG.Core.Color( 48, 48, 48 ),
                FocusTextColor : VG.Core.Color( 101, 123, 171 ),
                EmbeddedTextColor : VG.Core.Color( 101, 123, 170 ),
                DefaultTextColor : VG.Core.Color( 71, 71, 71 ),
                SelectionBackgroundColor : VG.Core.Color( 132, 146, 234 ),
                BackgroundColor : VG.Core.Color( 20, 20, 20 ),
                DisabledBackgroundColor : VG.Core.Color( 24, 24, 24 ),
                SelectedBackgroundColor : VG.Core.Color( 42, 50, 63 ),
            },

            CodeEdit : {
                Font : VG.Font.Font( this.DefaultFontName, 13 ),
                TopBorderColor : VG.Core.Color( 59, 65, 86 ),
                HeaderColor : VG.Core.Color( 59, 65, 86 ),
                HeaderTextColor : VG.Core.Color( 106, 114, 144 ),
                BackgroundColor : VG.Core.Color( 64, 70, 93 ),
                SelectionBackgroundColor : VG.Core.Color( 255, 255, 255, 120 ),
                SearchBackgroundColor : VG.Core.Color( 215, 206, 175 ),
                TextColor : VG.Core.Color( 240, 240, 240 ),
            },

            HtmlView : {
                TextColor : VG.Core.Color( 126, 126, 124 ),
                DefaultFont : VG.Font.Font( this.DefaultFontName, 14 ),
                DefaultBoldFont : VG.Font.Font( this.DefaultBoldFontName, 14 ),
                DefaultItalicFont : VG.Font.Font( this.DefaultItalicFontName, 14 ),
            },

            ListWidget : {
                BorderColor : VG.Core.Color( 0, 0, 0, 0 ),
                Margin : VG.Core.Margin( 2, 2, 2, 2 ),

                BigItemHeight : 39,
                BigItemDistance : 2,
                BigItemFont : VG.Font.Font( this.DefaultFontName, 14 ),
                SmallItemHeight : 23,
                SmallItemDistance : 1,
                SmallItemFont : VG.Font.Font( this.DefaultFontName, 13 ),
                ScrollbarXOffset : 1,

                Item : {
                    XOffset : 10,
                    BorderColor : VG.Core.Color( 47, 47, 47 ),
                    //TextColor : VG.Core.Color( 98, 98, 98 ),
                    TextColor : VG.Core.Color( 126, 126, 124 ),

                    BackgroundColor : VG.Core.Color( 41, 41, 41 ),
                    SelectedBorderColor : VG.Core.Color( 70, 85, 114 ),
                    SelectedTextColor : VG.Core.Color( 101, 123, 170 ),
                    SelectedBackgroundColor : VG.Core.Color( 44, 55, 71 ),
                },
            },

            TreeWidget : {
                BorderColor : VG.Core.Color( 46, 46, 46 ),
                SelectionBorderColor : VG.Core.Color( 72, 87, 117 ),
                ContentBorderSize : VG.Core.Size( 3, 3 ),
                
                ItemHeightAdder : 8,                
                //ItemHeight : 39,//23,            
                ItemDistance : 3,//4,            
                ItemXOffset : 10,

                ItemFont : VG.Font.Font( this.DefaultFontName, 13 ),
                ItemColor : VG.Core.Color( 97, 97, 97 ),
                ArrowColor : VG.Core.Color( 159, 159, 159 ),
                SelectedItemColor : VG.Core.Color( 101, 123, 171 ),
                SelectedItemBackgroundColor : VG.Core.Color( 132, 146, 234 ),
                SeparatorColor : VG.Core.Color( 203, 207, 213 ),
                ArrowSize : VG.Core.Size( 6, 12 ),
                ItemHierarchyOffset : 25,
            },

            Scrollbar : {
                Size : 10,    
                Color : VG.Core.Color( 57, 57, 57 ),    
                ClickedColor : VG.Core.Color( 80, 80, 80 ),    
                HoverColor : VG.Core.Color( 80, 80, 80 ),
            },

            Button : {
                Font : VG.Font.Font( this.DefaultFontName, 14 ),
                SmallFont : VG.Font.Font( this.DefaultFontName, 12 ),
                TextColor : VG.Core.Color( 126, 126, 126 ),
                DisabledTextColor : VG.Core.Color( 67, 67, 67 ),
                BorderColor : VG.Core.Color( 65, 65, 65 ),

                GradientColor1 : VG.Core.Color( 48, 48, 48 ),
                GradientColor2 : VG.Core.Color( 32, 32, 32 ),

                CheckedGradientColor1 : VG.Core.Color( 94, 94, 94 ),
                CheckedGradientColor2 : VG.Core.Color( 70, 70, 70 ),
            },

            PopupButton : {
                Font : VG.Font.Font( this.DefaultFontName, 14 ),
                BorderColor1 : VG.Core.Color( 44, 44, 44 ),
                BorderColor2 : VG.Core.Color( 16, 16, 16 ),

                GradientColor1 : VG.Core.Color( 42, 42, 42 ),
                GradientColor2 : VG.Core.Color( 24, 24, 24 ),
                ArrowColor : VG.Core.Color( 144, 144, 144 ),
            },

            ToolPanelPopupButton : {
                Font : VG.Font.Font( this.DefaultFontName, 14 ),
                HighlightedBackgroundColor : VG.Core.Color( 79, 97, 132 ),
                TextPanelColor : VG.Core.Color( 126, 126, 124 ),
                TextColor : VG.Core.Color(),
                HighlightedTextColor : VG.Core.Color( 255, 255, 255 ),                
                DisabledTextColor : VG.Core.Color( 135, 142, 153 ),
                BackgroundColor : VG.Core.Color( 192, 192, 192 ),
            },

            Checkbox : {
                BorderColor : VG.Core.Color( 172, 174, 178 ),
                DisabledBorderColor : VG.Core.Color( 180, 192, 206 ),
                BackgroundColor : VG.Core.Color( 187, 192, 199 ),
                DisabledBackgroundColor : VG.Core.Color( 210, 215, 221 ),
            },

            SplitLayout : {
                Separator : {
                    Color : VG.Core.Color( 50, 50, 50 ),
                    BorderColor : VG.Core.Color( 66, 66, 66 ),
                    Size : 6,
                },
            },

            ContextMenu : {
                Font : VG.Font.Font( "Roboto Regular", 14 ),
                ShortcutFont : VG.Font.Font( "Roboto Regular", 11 ),            
                BackgroundColor : VG.Core.Color( 192, 192, 192 ),
                HighlightedBackgroundColor : VG.Core.Color( 79, 97, 132 ),
                TextColor : VG.Core.Color(),
                DisabledTextColor : VG.Core.Color( 135, 142, 153 ),
                HighlightedTextColor : VG.Core.Color( 255, 255, 255 ),
                SeparatorColor : VG.Core.Color(),
            },

            Menubar : {
                Font : VG.Font.Font( "Roboto Regular", 14 ),
                Height : 26,
                BackgroundColor : VG.Core.Color( 39, 39, 39 ),
                SelectedBackgroundColor : VG.Core.Color( 54, 54, 54 ),
                TextColor : VG.Core.Color( 126, 126, 124 ),
                SelectedTextColor : VG.Core.Color( 255, 255, 255 ),
            },

            Menu : {
                Font : VG.Font.Font( "Roboto Regular", 14 ),
                ShortcutFont : VG.Font.Font( "Roboto Regular", 11 ),
                TopBorderColor : VG.Core.Color( 40, 41, 48 ),
                BorderColor : VG.Core.Color( 118, 118, 118 ),
                SeparatorColor : VG.Core.Color(),
                BackgroundColor : VG.Core.Color( 192, 192, 192 ),
                DisabledTextColor : VG.Core.Color( 135, 142, 153 ),
                HighlightedTextColor : VG.Core.Color( 255, 255, 255 ),
                HighlightedBackgroundColor : VG.Core.Color( 79, 97, 132 ),
                TextColor : VG.Core.Color(),
            },          

            TableWidget : {
                Font : VG.Font.Font( this.DefaultFontName, 14 ),
                TextColor : VG.Core.Color( 97, 97, 97 ),            
                DisabledSeparatorColor : VG.Core.Color( 48, 48, 48 ),  
                SelectionColor : VG.Core.Color(  44, 55, 71 ),            
                SeparatorWidth : 1,
                ContentMargin : VG.Core.Margin( 0, 0, 0, 6 ),
                RowHeight : 28,

                Header : {
                    Font : VG.Font.Font( this.DefaultFontName, 13 ),
                    SeparatorHeight : 3,
                    SeparatorColor : VG.Core.Color( 7, 7, 7 ),    
                    Height : 23,
                    BorderColor : VG.Core.Color( 7, 7, 7 ),
                    GradientColor1 : VG.Core.Color( 43, 43, 43 ),
                    GradientColor2 : VG.Core.Color( 23, 23, 23 ),
                    TextXOffset : 10,                    
                },
                Footer : {
                    SeparatorHeight : 16,
                    Margin : VG.Core.Margin( 10, 0, 0, 0 ),
                    Height : 24,                    
                },

                Item : {
                    
                    BorderColor : VG.Core.Color( 47, 47, 47 ),  
                    SelectedBorderColor : VG.Core.Color( 57, 69, 89 ),

                    GradientColor1 : VG.Core.Color( 42, 42, 42 ),
                    GradientColor2 : VG.Core.Color( 40, 40, 40 ), 
                    BottomColor : VG.Core.Color( 42, 42, 42 ),

                    SelectedGradientColor1 : VG.Core.Color( 50, 60, 77 ),
                    SelectedGradientColor2 : VG.Core.Color( 46, 55, 70 ), 
                    SelectedBottomColor : VG.Core.Color( 50, 60, 77 ),
/*
                    BorderColor : VG.Core.Color( 63, 63, 63 ),  
                    SelectedBorderColor : VG.Core.Color( 68, 83, 108 ),

                    GradientColor1 : VG.Core.Color( 55, 55, 55 ),
                    GradientColor2 : VG.Core.Color( 51, 51, 51 ), 
                    BottomColor : VG.Core.Color( 55, 55, 55 ),

                    SelectedGradientColor1 : VG.Core.Color( 58, 71, 93 ),
                    SelectedGradientColor2 : VG.Core.Color( 52, 64, 84 ), 
                    SelectedBottomColor : VG.Core.Color( 58, 71, 93 ),*/

                    XMargin : 2,
                    Spacing : 2,
                },                
            },

            TabWidget : {
                Font : VG.Font.Font( this.DefaultFontName, 14 ),
                HeaderHeight : 33,

                BackgroundBorderColor : VG.Core.Color( 9, 9, 9 ),
                BackgroundGradientColor1 : VG.Core.Color( 22, 22, 22 ),
                BackgroundGradientColor2 : VG.Core.Color( 29, 29, 29 ),

                SelectedShapeBorderColor1 : VG.Core.Color( 81, 81, 81 ),
                SelectedShapeBorderColor2 : VG.Core.Color( 58, 58, 58 ),

                SelectedShapeGradientColor1 : VG.Core.Color( 62, 62, 62 ),
                SelectedShapeGradientColor2 : VG.Core.Color( 47, 47, 47 ),

                ShapeGradientColor1 : VG.Core.Color( 33, 33, 33 ),
                ShapeGradientColor2 : VG.Core.Color( 16, 16, 16 ),

                ShapeBorderColor1 : VG.Core.Color( 51, 51, 51 ),

                BottomBorderColor : VG.Core.Color( 85, 85, 85 ),
                BottomColor : VG.Core.Color( 47, 47, 47 ),

                TextColor : VG.Core.Color( 68, 68, 68 ),             
                SelectedTextColor : VG.Core.Color( 126, 124, 123 ),

                BackgroundColor : VG.Core.Color( 190, 193, 197 ),             
                SelectedBackgroundColor : VG.Core.Color( 145, 158, 235 ),
            },

            Slider : {
                Bar : {
                    Color1 : VG.Core.Color( 36, 36, 36 ),
                    Color2 : VG.Core.Color( 65, 65, 65 ),
                    Color3 : VG.Core.Color( 16, 16, 16 ),
                },
                HandleSize : 13,
                Height : 3,
            },

            Scroller : {
                TextItemHeaderFont : VG.Font.Font( this.DefaultBoldFontName, 36 ),
                TextItemContentFont : VG.Font.Font( this.DefaultFontName, 17 ),
                ImageItemHeaderFont : VG.Font.Font( this.DefaultBoldFontName, 36 ),
                BackgroundColor : VG.Core.Color( 255, 255, 255 ),
                HeaderTextColor : VG.Core.Color( 82, 93, 124 ),
            },

            NewsScroller : {
                Margin : VG.Core.Margin( 120, 0, 120, 0),
                BackgroundColor : VG.Core.Color( 255, 255, 255 ),
                Header : {
                    Font : VG.Font.Font( this.DefaultBoldFontName, 30 ),
                    TextColor : VG.Core.Color( "556088" ),
                    Height : 77,
                    SeparatorColor : VG.Core.Color( "#ebeaea" ),
                },
                Body : {
                    Item : {
                        Header : {
                            Font : VG.Font.Font( this.DefaultFontName, 20 ),
                            TextColor : VG.Core.Color( "#5a5c65" ),
                        },
                        Body: {
                            Font : VG.Font.Font( "Roboto Regular", 14 ),
                            TextColor : VG.Core.Color( "#898989" ),
                        },  
                        Date: {
                            Font : VG.Font.Font( "Roboto Regular", 12 ),
                            TextColor : VG.Core.Color( "#e57f56" ),
                        },
                        Footer: {
                            Font : VG.Font.Font( "Roboto Regular", 14 ),
                            ActiveTextColor : VG.Core.Color( "#e57f56" ),
                            TextColor : VG.Core.Color( "#666666" ),
                        },                                                                      
                        ImageSize : VG.Core.Size( 93, 85 ),
                    },
                    Margin : VG.Core.Margin( 0, 33, 0, 142 ),
                    Spacing : 40,
                }
            }
        };
    }

    this.skins.push( this.black );
    this.skin=this.black;
};

VG.Styles.Multimedia.prototype.drawSlider=function( canvas, slider )
{
    slider.sliderRect.set( slider.contentRect );
    
    var leftSpace=Math.ceil( this.skin.Slider.HandleSize / 2 );
    slider.sliderRect.x+=leftSpace;
    slider.sliderRect.width-=leftSpace;
    slider.sliderRect.y=Math.floor( slider.sliderRect.y + (slider.sliderRect.height - this.skin.Slider.Height)/2 ) + 2;
    slider.sliderRect.height=1;

    var textColor;

    if ( slider.disabled ) textColor=this.skin.Widget.DisabledTextColor;
    else  textColor=this.skin.Widget.TextColor;

    var valueTextSize=canvas.getTextSize( slider.max.toString() );
    valueTextSize.width+=10;

    slider.sliderRect.width-=valueTextSize.width;

    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, slider.sliderRect, this.skin.Slider.Bar.Color1 );
    slider.sliderRect.y+=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, slider.sliderRect, this.skin.Slider.Bar.Color2 );
    slider.sliderRect.y+=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, slider.sliderRect, this.skin.Slider.Bar.Color3 );

    canvas.drawTextRect( slider.value.toString(), VG.Core.Rect( slider.sliderRect.right(), slider.contentRect.y, valueTextSize.width, slider.contentRect.height ), textColor, 2, 1 );

    // --- Draw the handle

    var distance=slider.max - slider.min;
    var perPixel=slider.sliderRect.width / distance;

    var valueOffset=slider.value - slider.min;
    var offset=valueOffset * perPixel;

    slider.sliderHandleRect.x=slider.sliderRect.x + offset - leftSpace;
    slider.sliderHandleRect.y=slider.contentRect.y + (slider.contentRect.height - this.skin.Slider.HandleSize)/2;
    slider.sliderHandleRect.width=this.skin.Slider.HandleSize;
    slider.sliderHandleRect.height=this.skin.Slider.HandleSize;

    var imageName="mmstyle_slider";
    if ( slider.visualState === VG.UI.Widget.VisualState.Hover ) imageName+="_hover";
    else
    if ( slider.visualState === VG.UI.Widget.VisualState.Focus ) imageName+="_selected";
    imageName+=".png";

    var image=VG.Utils.getImageByName( imageName );
    if ( image ) canvas.drawImage( slider.sliderHandleRect.pos(), image );
};

VG.Styles.Multimedia.prototype.drawTabWidgetHeader=function( canvas, widget )
{
    canvas.pushFont( this.skin.TabWidget.Font );

    widget.contentRect.set( widget.rect );
    this.workRect1.set( widget.rect );

    // --- Background

    this.workRect1.height=this.skin.TabWidget.HeaderHeight;

    canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, this.workRect1, this.skin.TabWidget.BackgroundBorderColor );

    this.workRect1.x+=1; this.workRect1.y+=1;
    this.workRect1.width-=2; this.workRect1.height=6;

    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.workRect1, this.skin.TabWidget.BackgroundGradientColor1, this.skin.TabWidget.BackgroundGradientColor2 );

    this.workRect1.y=widget.rect.y + 7;
    this.workRect1.height=this.skin.TabWidget.HeaderHeight - 7 - 5;

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.TabWidget.BackgroundGradientColor2 );

    // --- Shapes

    this.workRect1.set( widget.rect );
    this.workRect1.x+=1; this.workRect1.y+=1;
    this.workRect1.height=28;

    var size=VG.Core.Size();
    var selectedItem=null;

    for ( var i=0; i < widget.items.length; ++i )
    {
        var item=widget.items[i];
        var textWidth=canvas.getTextSize( item.text, size ).width + 25 + 34;
        var shapeWidth=textWidth;

        this.workRect1.width=shapeWidth;
        item.rect.copy( this.workRect1 );

        item.x=item.rect.x;
        item.width=item.rect.width;

        if ( item.object === widget.layout.current )
        {
            selectedItem=item;

            canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, this.workRect1, this.skin.TabWidget.SelectedShapeBorderColor1 );

            this.workRect2.set( this.workRect1 );
            this.workRect2.x+=1; this.workRect2.y+=1;
            this.workRect2.width-=2;

            canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, this.workRect2, this.skin.TabWidget.SelectedShapeBorderColor2 );  

            this.workRect2.x+=1; this.workRect2.y+=1;
            this.workRect2.width-=2; this.workRect2.height=25;

            canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.workRect2, this.skin.TabWidget.SelectedShapeGradientColor1, this.skin.TabWidget.SelectedShapeGradientColor2 );

            canvas.drawTextRect( item.text, this.workRect1.add( 25, 0, -50, 0), this.skin.TabWidget.SelectedTextColor, 0, 1 );
        } else
        {
            canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, this.workRect1, this.skin.TabWidget.ShapeBorderColor1 );  

            this.workRect2.set( this.workRect1 );
            this.workRect2.x+=1; this.workRect2.y+=1;
            this.workRect2.width-=2;

            canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.workRect2, this.skin.TabWidget.ShapeGradientColor1, this.skin.TabWidget.ShapeGradientColor2 );

            canvas.drawTextRect( item.text, this.workRect1.add( 25, 0, -50, 0), this.skin.TabWidget.TextColor, 0, 1 );
        }

        this.workRect1.x+=shapeWidth + 3;
    }

    this.workRect1.copy( widget.rect );
    this.workRect1.x+=2; this.workRect1.y+=28;
    this.workRect1.width-=3; this.workRect1.height=5;

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.TabWidget.BottomColor );

    if ( selectedItem && selectedItem === widget.items[0] )
    {
        this.workRect1.x=widget.rect.x + 1; this.workRect1.y=widget.rect.y + 1;
        this.workRect1.width=1; this.workRect1.height=32;

        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.TabWidget.SelectedShapeBorderColor1 );

        // --- First Tab is Selected

        this.workRect1.copy( widget.items[0].rect );

        this.workRect1.x+=this.workRect1.width-1; this.workRect1.y+=27;
        this.workRect1.width=widget.rect.width - widget.items[0].rect.width-1; this.workRect1.height=1;

        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.TabWidget.BottomBorderColor );
    } else
    if ( selectedItem )    
    {
        // --- Left line
        this.workRect1.copy( selectedItem.rect );

        this.workRect1.x=widget.rect.x + 2; this.workRect1.y+=27;
        this.workRect1.width=selectedItem.rect.x - widget.rect.x - 1; this.workRect1.height=1;

        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.TabWidget.BottomBorderColor );

        // --- Right line
        this.workRect1.copy( selectedItem.rect );

        this.workRect1.x+=this.workRect1.width-1; this.workRect1.y+=27;
        this.workRect1.width=widget.rect.width - selectedItem.rect.width-1; this.workRect1.height=1;

        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.TabWidget.BottomBorderColor );
    }

    widget.contentRect.y+=this.skin.TabWidget.HeaderHeight;
    widget.contentRect.height-=this.skin.TabWidget.HeaderHeight;

    canvas.popFont();
};

VG.Styles.Multimedia.prototype.drawMenubar=function( canvas, menu )
{
    menu.contentRect.set( menu.rect );    
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, menu.contentRect, this.skin.Menubar.BackgroundColor );  

    canvas.pushFont( this.skin.Menubar.Font );

    var rect=new VG.Core.Rect( menu.rect );
    var size=new VG.Core.Size();

    for( var i=0; i < menu.items.length; ++i )
    {
        var item=menu.items[i];

        rect.x+=12;
        rect.width=canvas.getTextSize( item.text, size ).width + 2 * 12;

        if ( item === menu.active ) {
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect, this.skin.Menubar.SelectedBackgroundColor );              
            canvas.drawTextRect( item.text, rect, this.skin.Menubar.SelectedTextColor, 1, 1 );
        } else {
            canvas.drawTextRect( item.text, rect, this.skin.Menubar.TextColor, 1, 1 );
        }

        item.rect.set( rect );
        rect.x+=size.width+12;
    }

    canvas.popFont();
};

VG.Styles.Multimedia.prototype.drawMenu=function( canvas, menu )
{
    canvas.pushFont( this.skin.Menu.Font );

    menu.contentRect.x=menu.rect.x;
    menu.contentRect.y=menu.parent.rect.bottom();

    menu.contentRect.setSize( menu.calcSize() );

    var oldHeight=menu.contentRect.height;

    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, menu.contentRect, this.skin.Menu.BackgroundColor ); 
    canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, menu.contentRect, this.skin.Menu.BorderColor ); 

    //canvas.draw2DShape( VG.Canvas.Shape2D.DropShadow_NoTop7px, menu.contentRect, VG.Core.Color( 0, 0, 0 ) ); 

    menu.contentRect.height=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, menu.contentRect, this.skin.Menu.TopBorderColor ); 
    menu.contentRect.y+=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, menu.contentRect, this.skin.Menu.BackgroundColor ); 

    menu.contentRect.height=oldHeight;;

    var itemHeight=canvas.getLineHeight() + 7;

    var rect=menu.contentRect;
    var y=menu.contentRect.y;

    for( var i=0; i < menu.items.length; ++i )
    {
        var item=menu.items[i];

        if ( !item.isSeparator ) {
            var itemRect=VG.Core.Rect( rect.x, y, rect.width, itemHeight ).round();

            if ( item.disabled ) {
                canvas.drawTextRect( item.text, itemRect.add( 10, 0, -10, 0), this.skin.Menu.DisabledTextColor, 0, 1 );                
            } else
            if ( item === menu.selected )  {
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect, this.skin.Menu.HighlightedBackgroundColor ); 
                canvas.drawTextRect( item.text, itemRect.add( 10, 0, -10, 0), this.skin.ContextMenu.HighlightedTextColor, 0, 1 );
            } else {
                canvas.drawTextRect( item.text, itemRect.add( 10, 0, -10, 0), this.skin.Menu.TextColor, 0, 1 );
            }

            if ( item.checkable ) {
                var iconName="mmstyle_checkmark";

                if ( item.checked ) iconName+="_checked";
                if ( item === menu.selected ) iconName+="_highlighted";
                iconName+=".png";

                var image=VG.context.imagePool.getImageByName( iconName );
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

VG.Styles.Multimedia.prototype.drawContextMenu=function( canvas, menu )
{
    canvas.pushFont( this.skin.ContextMenu.Font );

    menu.contentRect.set( menu.rect.shrink(1,1) );

    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, menu.rect, this.skin.ContextMenu.BackgroundColor ); 
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, menu.contentRect, this.skin.ContextMenu.BackgroundColor ); 

    var itemHeight=canvas.getLineHeight() + 7;

    var rect=menu.contentRect;
    var y=menu.contentRect.y;

    for( var i=0; i < menu.items.length; ++i )
    {
        var item=menu.items[i];

        if ( !item.isSeparator ) {
            var itemRect=VG.Core.Rect( rect.x, y, rect.width, itemHeight ).round();

            if ( item.disabled ) {
                canvas.drawTextRect( item.text, itemRect.add( 10, 0, -10, 0), this.skin.ContextMenu.DisabledTextColor, 0, 1 );                
            } else
            if ( item === menu.selected )  {
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect, this.skin.ContextMenu.HighlightedBackgroundColor ); 
                canvas.drawTextRect( item.text, itemRect.add( 10, 0, -10, 0), this.skin.ContextMenu.HighlightedTextColor, 0, 1 );
            } else {
                canvas.drawTextRect( item.text, itemRect.add( 10, 0, -10, 0), this.skin.ContextMenu.TextColor, 0, 1 );
            }

            if ( item.checkable && item.checked ) {
                var image=VG.context.imagePool.getImageByName( "menu_checkmark.png" );
                if ( image ) {    
                    canvas.drawImage( VG.Core.Point( itemRect.right() - image.width - 10, itemRect.y + (itemRect.height-image.height)/2), image );
                }                
            }

            if ( item.shortcut ) {
                canvas.pushFont( this.skin.ContextMenu.ShortcutFont );

                var textColor=this.skin.ContextMenu.TextColor;
                if ( item.disabled ) textColor=this.skin.ContextMenu.DisabledTextColor;
                var shortCutSize=canvas.getTextSize( item.shortcut.text );
                canvas.drawTextRect( item.shortcut.text, VG.Core.Rect( itemRect.right() - shortCutSize.width - 10, itemRect.y, shortCutSize.width, itemRect.height ), textColor, 0, 1 );
                canvas.popFont();
            }                

            item._rect=itemRect;
            y+=itemHeight;            
        } else {
            var sepRect=VG.Core.Rect( rect.x, y, rect.width, 1 ).round();
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, sepRect, this.skin.ContextMenu.SeparatorColor ); 

            y++;
        }      
    }

    this.itemHeight=itemHeight;

    canvas.popFont();        
};

VG.Styles.Multimedia.prototype.drawToolbar=function( canvas, toolbar )
{
    this.workRect1.copy( toolbar.rect ); this.workRect1.height=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.Toolbar.TopBorderColor );

    this.workRect1.y+=1; this.workRect1.height=Math.floor( toolbar.rect.height / 2 );
    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.workRect1, this.skin.Toolbar.GradientColor1, this.skin.Toolbar.GradientColor2 );   

    this.workRect1.y+=this.workRect1.height;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.Toolbar.GradientColor2 );

    this.workRect1.y=toolbar.rect.y + toolbar.rect.height - 2; this.workRect1.height=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.Toolbar.BottomBorderColor1 );
    this.workRect1.y+=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.Toolbar.BottomBorderColor2 );
};

VG.Styles.Multimedia.prototype.drawToolPanel=function( canvas, panel )
{
    this.workRect1.copy( panel.rect ); this.workRect1.height=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.ToolPanel.BorderColor1 );
    this.workRect1.y+=1;    
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.ToolPanel.BorderColor2 );

    this.workRect1.y+=1; this.workRect1.height=this.skin.ToolPanel.Height-2;
    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.workRect1, this.skin.ToolPanel.GradientColor1, this.skin.ToolPanel.GradientColor2 );   
};

VG.Styles.Multimedia.prototype.drawStatusbar=function( canvas, statusbar )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( 0, statusbar.rect.y, statusbar.rect.width, statusbar.rect.height ), this.skin.Statusbar.BorderColor );
    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, VG.Core.Rect( 0, statusbar.rect.y + 1, statusbar.rect.width, statusbar.rect.height ), 
                        this.skin.Statusbar.GradientColor1, this.skin.Statusbar.GradientColor2 );    
};

VG.Styles.Multimedia.prototype.drawToolButton=function( canvas, button )
{
    if ( button.visualState === VG.UI.Widget.VisualState.Hover ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, button.contentRect, this.skin.ToolButton.HoverBorderColor );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, button.contentRect.shrink( 1, 1 ), this.skin.ToolButton.HoverColor );
    }

    if ( !button.iconName )
    {
        canvas.pushFont( this.skin.ToolButton.Font );

        if ( button.disabled )
            canvas.drawTextRect( button.text, button.contentRect, VG.context.style.skin.ToolButton.DisabledTextColor );
        else
        {
            if ( button.mouseIsDown )
            {
                this.workRect1.copy( button.contentRect );
                this.workRect1.x+=1; this.workRect1.y+=1;
                canvas.drawTextRect( button.text, this.workRect1, VG.context.style.skin.ToolButton.TextColor );
            } else canvas.drawTextRect( button.text, button.contentRect, VG.context.style.skin.ToolButton.TextColor );
        }
        canvas.popFont();
    } else
    {
        if ( !button.icon || ( button.icon.stylePath !== VG.context.style.path ) ) button.icon=VG.context.imagePool.getImageByName( button.iconName );
        if ( button.icon ) 
        {
            var x=button.contentRect.x + (button.contentRect.width - button.icon.width)/2;
            var y=button.contentRect.y + (button.contentRect.height - button.icon.height)/2;

            if ( button.disabled )
            {
                if ( !button.disabledIcon || ( button.disabledIcon.stylePath !== VG.context.style.path ) )
                {
                    button.disabledIcon=VG.Core.Image( button.icon.width, button.icon.height );
                    for ( var h=0; h < button.icon.height; ++h )
                    {
                        for ( var w=0; w < button.icon.width; ++w )
                        {
                            var offset=h * button.icon.modulo + w *4;
                            button.disabledIcon.data[offset]=button.icon.data[offset] * 0.513;
                            button.disabledIcon.data[offset+1]=button.icon.data[offset+1] * 0.521;
                            button.disabledIcon.data[offset+2]=button.icon.data[offset+2] * 0.545;
                            button.disabledIcon.data[offset+3]=button.icon.data[offset+3];
                        }
                    }
                }
                canvas.drawImage( VG.Core.Point( x, y ), button.disabledIcon );
            } else 
            if ( button.mouseIsDown )
                canvas.drawImage( VG.Core.Point( x + 1, y + 1 ), button.icon );
            else canvas.drawImage( VG.Core.Point( x, y ), button.icon );
        }
    }    
};

VG.Styles.Multimedia.prototype.drawToolPanelButton=function( canvas, button )
{
    /*
    if ( button.disabled ) return;
    if ( button.mouseIsDown ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, button.contentRect, this.skin.ToolPanelButton.ClickedColor );
    else if ( button.visualState === VG.UI.Widget.VisualState.Hover ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, button.contentRect, this.skin.ToolPanelButton.HoverColor );
    }*/
    this.drawToolButton( canvas, button );
};

VG.Styles.Multimedia.prototype.drawToolSeparator=function( canvas, separator )
{
    this.workRect1.copy( separator.contentRect );
    this.workRect1.width=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.Toolbar.Separator.Color1 );
    this.workRect1.x+=1;    
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.Toolbar.Separator.Color2 );
};

VG.Styles.Multimedia.prototype.drawToolPanelSeparator=function( canvas, separator )
{
    this.workRect1.copy( separator.contentRect );
    this.workRect1.width=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.ToolPanel.Separator.Color1 );
    this.workRect1.x+=1;    
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.ToolPanel.Separator.Color2 );    
};

VG.Styles.Multimedia.prototype.drawDockWidgetHeader=function( canvas, dock, rect)
{
    var xBorderOffset=13;

    if ( dock.location < VG.UI.DockWidgetLocation.Floating )
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, rect, this.skin.DockWidget.BorderColor );

    this.workRect1.copy( rect );

    this.workRect1.y+=1; this.workRect1.x+=1; this.workRect1.height-=2; this.workRect1.width-=2;
    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.workRect1, this.skin.DockWidget.Header.GradientColor1, this.skin.DockWidget.Header.GradientColor2 );
    this.workRect1.y=rect.y+rect.height-2; this.workRect1.height=1; //this.workRect1.x-=1; this.workRect1.width+=2;    
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.DockWidget.BorderColor );

    var imageName="mmstyle_double_arrow_right.png";
    var image=VG.context.imagePool.getImageByName( imageName );    
    if ( image ) { canvas.drawImage( VG.Core.Point( rect.x + 13, rect.y + (rect.height-image.height)/2), image ); xBorderOffset+=image.width + 12; }

    canvas.pushFont( this.skin.DockWidget.Header.Font );
    canvas.drawTextRect( dock.text, rect.add( xBorderOffset, 0, -xBorderOffset, 0), this.skin.DockWidget.Header.TextColor, 0, 1 );
    canvas.popFont();
};

VG.Styles.Multimedia.prototype.drawDockWidget=function( canvas, dock )
{
    if ( dock.location < VG.UI.DockWidgetLocation.Floating ) 
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, dock.rect, this.skin.DockWidget.BackgroundColor );
    else
    {
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, dock.rect, this.skin.DockWidget.FloatingBackgroundColor );        

        if ( dock.visualState === VG.UI.Widget.VisualState.Focus )
            canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, dock.rect, this.skin.DockWidget.FloatingSelectedBorderColor );
        else canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, dock.rect, this.skin.DockWidget.FloatingBorderColor );  
    }

    this.drawDockWidgetHeader( canvas, dock, VG.Core.Rect( dock.rect.x, dock.rect.y, dock.rect.width, this.skin.DockWidget.Header.Height ) );
    dock.contentRect.set( dock.rect.add( 0, this.skin.DockWidget.Header.Height, 0, -this.skin.DockWidget.Header.Height ) );    
};

VG.Styles.Multimedia.prototype.drawTextEditBorder=function( canvas, edit )
{
    this.workRect1.copy( edit.rect );
    this.workRect1.x+=1; this.workRect1.y+=1; this.workRect1.width-=2; this.workRect1.height-=2;

    if ( !edit.embedded )
    {
        if ( edit.disabled )
        {
            canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, this.workRect1, this.skin.TextEdit.DisabledBorderColor );
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1.shrink(1,1), this.skin.TextEdit.DisabledBackgroundColor );
        } else
        {
            if ( edit.visualState === VG.UI.Widget.VisualState.Focus )
            {
                canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, edit.rect, this.skin.Widget.SelectionColor );
                canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, this.workRect1, this.skin.TextEdit.BorderColor );
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1.shrink(1,1), this.skin.TextEdit.SelectedBackgroundColor );
            } else
            {   
                canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, this.workRect1, this.skin.TextEdit.BorderColor );
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1.shrink(1,1), this.skin.TextEdit.BackgroundColor );
            }
        }
        edit.contentRect=edit.rect.shrink( 2, 2 );
    } else edit.contentRect.set( edit.rect );
};

VG.Styles.Multimedia.prototype.drawGeneralBorder=function( canvas, edit )
{
    if ( !edit.embedded )
    {
        if ( edit.disabled ) canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, edit.rect, this.skin.TextEdit.DisabledBorderColor );
        else
        {
            if ( edit.visualState === VG.UI.Widget.VisualState.Focus ) {
                canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, edit.rect, this.skin.Widget.SelectionColor );
            } else {
                canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, edit.rect, this.skin.TextEdit.BorderColor )        
            }
        }
        edit.contentRect=edit.rect.shrink( 1, 1 );
    } else edit.contentRect.set( edit.rect );
};

VG.Styles.Multimedia.prototype.drawListWidgetBorder=function( canvas, widget )
{    
    if ( widget.visualState !== VG.UI.Widget.VisualState.Focus )
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, widget.rect, this.skin.ListWidget.BorderColor )
    else canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, widget.rect, this.skin.Widget.SelectionColor );
    
    widget.contentRect.set( widget.rect );
};

VG.Styles.Multimedia.prototype.drawListWidgetItem=function( canvas, item, selected, rect, drawContent )
{
    if ( !selected ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, rect, this.skin.ListWidget.Item.BorderColor )
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect.add( 1, 1, -2, -2), this.skin.ListWidget.Item.BackgroundColor );
        if ( drawContent )
            canvas.drawTextRect( item.text, rect.add( this.skin.ListWidget.Item.XOffset, 0, -this.skin.ListWidget.Item.XOffset - 2, 0), this.skin.ListWidget.Item.TextColor, 0, 1 );
    } else {
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, rect, this.skin.ListWidget.Item.SelectedBorderColor )
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect.add( 1, 1, -2, -2), this.skin.ListWidget.Item.SelectedBackgroundColor );
        if ( drawContent )
            canvas.drawTextRect( item.text, rect.add( this.skin.ListWidget.Item.XOffset, 0, -this.skin.ListWidget.Item.XOffset - 2, 0), this.skin.ListWidget.Item.SelectedTextColor, 0, 1 );
    }
};

VG.Styles.Multimedia.prototype.drawScrollbar=function( canvas, scrollBar, adjustAlpha )
{
    var color;

    if (  VG.context.workspace.mouseTrackerWidget === scrollBar )
        color=this.skin.Scrollbar.ClickedColor;
    else 
    if ( scrollBar.visualState === VG.UI.Widget.VisualState.Hover )
        color=this.skin.Scrollbar.HoverColor;
    else
    {
        if ( adjustAlpha ) canvas.setAlpha( 0.3 ); 
        color=this.skin.Scrollbar.Color;
    }

    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, scrollBar.handleRect, color );
    if ( adjustAlpha ) canvas.setAlpha( 1.0 ); 
};

VG.Styles.Multimedia.prototype.drawButton=function( canvas, button )
{
    var buttonRect;

    this.workRect1.copy( button.rect );
    this.workRect1.x+=1; this.workRect1.y+=1; this.workRect1.width-=2; this.workRect1.height-=2;

    if ( button.visualState === VG.UI.Widget.VisualState.Focus )
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, button.rect, this.skin.Widget.SelectionColor );

    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, this.workRect1, this.skin.Button.BorderColor );
    buttonRect=button.rect.shrink( 2, 2 );

    var color;

    if ( !button.disabled ) {
        if ( !button.mouseIsDown ) 
        {    
            if ( button.checkable && button.checked )
            {
                canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, buttonRect, this.skin.Button.CheckedGradientColor2, this.skin.Button.CheckedGradientColor1 );
            } else
            if ( button.checkable && !button.checked )
            {
                canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, buttonRect, this.skin.Button.CheckedGradientColor1, this.skin.Button.CheckedGradientColor2 );
            } else
            {
                canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, buttonRect, this.skin.Button.GradientColor1, this.skin.Button.GradientColor2 );
            }
        } else {
            canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, buttonRect, this.skin.Button.GradientColor2, this.skin.Button.GradientColor1 );
        }
    } else {
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, buttonRect, this.skin.Button.GradientColor1, this.skin.Button.GradientColor2 );
    }

    if ( button.big ) canvas.pushFont( this.skin.Button.Font );
    else canvas.pushFont( this.skin.Button.SmallFont );

    if ( !button.iconName ) {
        if ( !button.disabled )
            canvas.drawTextRect( button.text, button.contentRect, this.skin.Button.TextColor );    
        else
            canvas.drawTextRect( button.text, button.contentRect, this.skin.Button.DisabledTextColor );    
    } else
    {
        if ( !button.icon ) button.icon=VG.Utils.getImageByName( button.iconName );

        if ( button.icon )
            canvas.drawImage( VG.Core.Point( button.rect.x + (button.rect.width-button.icon.width)/2, button.rect.y + (button.rect.height-button.icon.height)/2), button.icon );                
    }
    canvas.popFont();
};

VG.Styles.Multimedia.prototype.drawFrame=function( canvas, frame )
{
    frame.contentRect.set( frame.rect );
    
    if ( frame.frameType === VG.UI.Frame.Type.Box ) 
    {    
        var color

        if ( frame.visualState === VG.UI.Widget.VisualState.Focus ) color=this.skin.Widget.SelectionColor;
        else color=this.skin.TextEdit.BorderColor;
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, frame.rect, color );

        frame.contentRect=frame.contentRect.shrink( 1, 1 );
    }
};

VG.Styles.Multimedia.prototype.drawPopupButton=function( canvas, button )
{
    canvas.pushFont( this.skin.PopupButton.Font );

    this.workRect1.copy( button.rect );
    this.workRect1.x+=1; this.workRect1.y+=1; this.workRect1.width-=2; this.workRect1.height-=2;

    if ( button.visualState === VG.UI.Widget.VisualState.Focus && !button.popup ) 
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, button.rect, this.skin.Widget.SelectionColor );

    this.workRect2.copy( this.workRect1 );

    // --- Frame

    this.workRect2.x+=1; this.workRect2.width-=2; this.workRect2.height=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect2, this.skin.PopupButton.BorderColor1 );

    this.workRect2.height=this.workRect1.height;

    if ( button.popup === true )
        canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.workRect2, this.skin.PopupButton.GradientColor2, this.skin.PopupButton.GradientColor1 );
    else canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.workRect2, this.skin.PopupButton.GradientColor1, this.skin.PopupButton.GradientColor2 );

    this.workRect2.y+=this.workRect1.height-1; this.workRect2.height=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect2, this.skin.PopupButton.BorderColor2 );

    // --- Verticals

    this.workRect2.copy( this.workRect1 );

    this.workRect2.y+=1; this.workRect2.height-=2; this.workRect2.width=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect2, this.skin.PopupButton.BorderColor2 );

    this.workRect2.x+=this.workRect1.width-1; this.workRect2.width=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect2, this.skin.PopupButton.BorderColor1 );

    this.workRect2.x-=17; this.workRect2.width=1; this.workRect2.y+=1; this.workRect2.height-=2;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect2, this.skin.PopupButton.BorderColor1 );

    this.workRect2.x+=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect2, this.skin.PopupButton.BorderColor2 );

    // --- Triangle

    this.workRect2.x=this.workRect1.x + this.workRect1.width - 15 + 3; this.workRect2.y=this.workRect1.y + (this.workRect1.height-5)/2; 
    this.workRect2.width=8; this.workRect2.height=5;

    if ( !button.disabled )
        canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, this.workRect2.round(), this.skin.PopupButton.ArrowColor );
    else canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, this.workRect2.round(), this.skin.Widget.DisabledTextColor );

    if ( button.popup === true ) {
        var itemHeight=canvas.getLineHeight() + 7;
        var popupHeight=button.items.length * itemHeight; 
        var popupRect=VG.Core.Rect( this.workRect1.x+1, this.workRect1.bottom()-1, this.workRect1.width-2, popupHeight ).round();

        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( popupRect.x, popupRect.bottom()-1, popupRect.width, 1 ), this.skin.Menu.BorderColor );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( popupRect.x, popupRect.y+1, 1, popupRect.height-1 ), this.skin.Menu.BorderColor );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( popupRect.right()-1, popupRect.y+1, 1, popupRect.height-1 ), this.skin.Menu.BorderColor );

        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, popupRect.shrink(1,1), this.skin.Menu.BackgroundColor );

        for( var i=0; i < button.items.length; ++i )
        {
            var itemRect=VG.Core.Rect( popupRect.x, popupRect.y + i * itemHeight, popupRect.width, itemHeight );

            var color;

            if ( i === button.index ) color=this.skin.Menu.HighlightedTextColor;
            else color=this.skin.Menu.TextColor;

            canvas.drawTextRect( button.items[i], itemRect.add( 10, 0, -10, 0), color, 0, 1 );
            
            if ( i < button.items.length - 1 )
            {
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( itemRect.x+1, itemRect.bottom()-1, itemRect.width-2, 1 ).round(), this.skin.Menu.BorderColor );
            }
        }

        button.popupRect=popupRect;
        button.itemHeight=itemHeight;
    }

    // --- Main Text

    if ( button.index !== -1 ) {
        this.workRect1.x+=15; this.workRect1.width-=18 + 15;
        if ( button.disabled ) canvas.drawTextRect( button.items[button.index], this.workRect1, this.skin.Widget.DisabledTextColor, 0, 1 );    
        else canvas.drawTextRect( button.items[button.index], this.workRect1, this.skin.Widget.TextColor, 0, 1 );
    }

    canvas.popFont();    
};

VG.Styles.Multimedia.prototype.drawToolPanelPopupButton=function( canvas, button )
{
    var borderColor;

    canvas.pushFont( this.skin.ToolPanelPopupButton.Font );

    var spacing=0;

    if ( button.popup === true ) {
        var itemHeight=canvas.getLineHeight() + 7;
        var popupHeight=button.items.length * itemHeight + (button.items.length-1) * spacing;
        var popupRect;

        button.menuDown=true;

        if ( ( popupHeight + button.rect.bottom() ) > VG.context.workspace.rect.height )
            button.menuDown=false;

        if ( button.menuDown ) popupRect=VG.Core.Rect( button.rect.x, button.rect.bottom()-1, button.rect.width, popupHeight );
        else popupRect=VG.Core.Rect( button.rect.x, button.rect.y - popupHeight, button.rect.width, popupHeight );            

        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, popupRect, this.skin.ToolPanelPopupButton.BackgroundColor );

        button.popupRect=popupRect;
        button.itemHeight=itemHeight;

        // --- Draw the popup text items

        for( var i=0; i < button.items.length; ++i )
        {
            var itemRect=VG.Core.Rect( popupRect.x, popupRect.y + i * itemHeight, popupRect.width, itemHeight );

            var color;

            if ( i === button.index ) 
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect, this.skin.ToolPanelPopupButton.HighlightedBackgroundColor );

            canvas.drawTextRect( button.items[i], itemRect.add( 10, 0, -10, 0), this.skin.ToolPanelPopupButton.TextColor, 0, 1 );
            
            //if ( i < button.items.length - 1 )
            //    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( itemRect.x, itemRect.bottom()-1, itemRect.width, 1 ), this.skin.Menu.SeparatorColor );
        }        
    }

    if ( this.index !== -1 )
    {
        if ( button.disabled ) {
            canvas.drawTextRect( button.items[button.index], button.contentRect.add( 10, 0, -10, 0), this.skin.ToolPanelPopupButton.DisabledTextPanelColor, 0, 1 );    
            canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, VG.Core.Rect( button.rect.right()-20, button.rect.y+12, 12, 6 ), this.skin.ToolPanelPopupButton.DisabledTextPanelColor );
        }
        else  {
            canvas.drawTextRect( button.items[button.index], button.contentRect.add( 10, 0, -10, 0), this.skin.ToolPanelPopupButton.TextPanelColor, 0, 1 );    
            canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, VG.Core.Rect( button.rect.right()-20, button.rect.y+12, 12, 6 ), this.skin.ToolPanelPopupButton.TextPanelColor );
        }
    }
    canvas.popFont();    
};


VG.Styles.Multimedia.prototype.drawWindow=function( canvas, window )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( window.rect.x, window.rect.y, window.rect.width, this.skin.Window.HeaderHeight ), this.skin.Window.FocusHeaderColor );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, window.contentRect, this.skin.Window.BackgroundColor );

    var titleTextRect=VG.Core.Rect( window.rect.x+10, window.rect.y, window.rect.width, this.skin.Window.HeaderHeight );
    canvas.drawTextRect( window.text, titleTextRect, VG.Core.Color( 244, 244, 244 ), 0, 1 );    
};

VG.Styles.Multimedia.prototype.drawDialog=function( canvas, dialog )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, dialog.rect, this.skin.Dialog.BorderColor );
    canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, dialog.rect.shrink(1,1), this.skin.Dialog.BorderColor );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, dialog.rect.shrink(2,2), this.skin.Dialog.BackgroundColor );

    var titleRect=VG.Core.Rect( dialog.rect.x+2, dialog.rect.y+2, dialog.rect.width-4, this.skin.Window.HeaderHeight-4 );
    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, titleRect, this.skin.Dialog.Header.Color1, this.skin.Dialog.Header.Color2 );

    titleRect.x+=10;

    canvas.pushFont( this.skin.Dialog.Header.Font );
    canvas.drawTextRect( dialog.text, titleRect, this.skin.Widget.TextColor, 0, 1 );  
    canvas.popFont();

    titleRect.x=dialog.rect.x+2;
    titleRect.y+=this.skin.Window.HeaderHeight-4;
    titleRect.height=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, titleRect, this.skin.Dialog.Header.BorderColor );

    // --- Dialog Title Buttons

    if ( !dialog.closeImage.isValid() ) {
        var image=VG.context.imagePool.getImageByName( "window_close_normal.png" );
        if ( image ) dialog.closeImage.image=image;
    }

    if ( !dialog.closeImage.hoverImage ) {
        var image=VG.context.imagePool.getImageByName( "window_close_hover.png" );
        if ( image ) dialog.closeImage.hoverImage=image;
    }

    if ( !dialog.closeImage.clickedImage ) {
        var image=VG.context.imagePool.getImageByName( "window_close_clicked.png" );
        if ( image ) dialog.closeImage.clickedImage=image;
    }    

    if ( dialog.closeImage.isValid() ) {
        dialog.closeImage.rect.set( dialog.rect.right() - 12 - dialog.closeImage.image.width, dialog.rect.y + (this.skin.Window.HeaderHeight - dialog.closeImage.image.height)/2, 
            dialog.closeImage.image.width, dialog.closeImage.image.height );
        dialog.closeImage.paintWidget( canvas );
    }

    // ---

    dialog.contentRect.set( dialog.rect.x+2, dialog.rect.y + this.skin.Window.HeaderHeight + 2, dialog.rect.width-2, dialog.rect.height - this.skin.Window.HeaderHeight );  
};

VG.Styles.Multimedia.prototype.drawSplitHandle=function( canvas, layout, pos, itemRect, childRect, dragging )
{
    itemRect[layout.primaryCoord]=pos + childRect[layout.primarySize];
    itemRect[layout.secondaryCoord]=layout.margin[layout.secondaryLesserMargin] + layout.rect[layout.secondaryCoord];
    itemRect[layout.primarySize]=this.skin.SplitLayout.Separator.Size;
    itemRect[layout.secondarySize]=layout.rect[layout.secondarySize] - layout.margin[layout.secondaryLesserMargin] - layout.margin[layout.secondaryGreaterMargin]  
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect, this.skin.SplitLayout.Separator.Color );

    this.workRect1.copy( itemRect );

    if ( layout.vertical )
    {
        var lowerLine=this.workRect1.y + this.workRect1.height-1;
        this.workRect1.height=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.SplitLayout.Separator.BorderColor );
        this.workRect1.y=lowerLine;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.SplitLayout.Separator.BorderColor );
    } else
    {
        var rightLine=this.workRect1.x + this.workRect1.width-1;
        this.workRect1.width=1;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.SplitLayout.Separator.BorderColor );
        this.workRect1.x=rightLine;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.SplitLayout.Separator.BorderColor );        
    }
};

VG.Styles.Multimedia.prototype.drawCheckbox=function( canvas, box )
{
    var imageName="mmstyle_checkbox";

    if ( box.checked ) imageName+="_checked";
    if ( box.visualState === VG.UI.Widget.VisualState.Focus ) imageName+="_selected";

    imageName+=".png";

    var image=VG.context.imagePool.getImageByName( imageName );

    if ( image )
        canvas.drawImage( VG.Core.Point( box.rect.x + (box.rect.width-image.width)/2, box.rect.y + (box.rect.height-image.height)/2), image );
};

VG.Styles.Multimedia.prototype.drawDockStripWidget=function( canvas, dock )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( dock.rect.x, dock.rect.y, dock.rect.width, this.skin.DockStripWidget.HeaderHeight ), this.skin.DockStripWidget.BorderColor);
};

VG.Styles.Multimedia.prototype.drawTreeWidgetBorder=function( canvas, widget )
{
    if ( widget.visualState !== VG.UI.Widget.VisualState.Focus )
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, widget.rect, this.skin.TreeWidget.BorderColor )
    else
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, widget.rect, this.skin.TreeWidget.SelectionBorderColor );

    widget.contentRect=widget.rect.add( 1, 1, -2, -2 );
};

VG.Styles.Multimedia.prototype.drawTreeItemBackground=function( canvas, rect, selected )
{
    this.workRect1.copy( rect );

    if ( selected ) canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, this.workRect1, this.skin.TableWidget.Item.SelectedBorderColor );
    else canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, this.workRect1, this.skin.TableWidget.Item.BorderColor );

    this.workRect1.x+=1; this.workRect1.y+=1;
    this.workRect1.width-=2; this.workRect1.height-=4;

    if ( selected ) canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.workRect1, this.skin.TableWidget.Item.SelectedGradientColor1, this.skin.TableWidget.Item.SelectedGradientColor2 );
    else canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.workRect1, this.skin.TableWidget.Item.GradientColor1, this.skin.TableWidget.Item.GradientColor2 );

    this.workRect1.y+=this.workRect1.height; this.workRect1.height=2;

    if ( selected ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.TableWidget.Item.SelectedBottomColor );
    else canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.TableWidget.Item.BottomColor );
};

VG.Styles.Multimedia.prototype.drawTreeWidgetItem=function( canvas, item, selected, rect, contentRect )
{
    canvas.pushFont( this.skin.TreeWidget.ItemFont );
    var arrowOffset=0;

    var plusImage=VG.context.imagePool.getImageByName( "mmstyle_tree_plus.png" );
    var minusImage=VG.context.imagePool.getImageByName( "mmstyle_tree_minus.png" );

    // --- Get the Icon if needed

    if ( item.children )
    {
        if ( /*!item.icon &&*/ item.iconName && item.iconName.length ) 
        {
            item.icon=VG.context.imagePool.getImageByName( item.iconName );
            if ( item.icon && selected )
                item.icon=this.multipliedImage( item.icon, 0.40, 0.48, 0.67 );
            else if ( item.icon && !selected )
                item.icon=this.multipliedImage( item.icon, 0.38, 0.38, 0.38 );                
        }
    } else
    {
        if ( item.iconName && item.iconName.length ) 
        {
            item.icon=VG.context.imagePool.getImageByName( item.iconName );
            if ( item.icon && selected )
                item.icon=this.multipliedImage( item.icon, 0.40, 0.48, 0.67 );
            else if ( item.icon && !selected )
                item.icon=this.multipliedImage( item.icon, 0.38, 0.38, 0.38 );             
        }
    }

    // ---

    if ( item.children )
    {
        var arrowColor=this.skin.TreeWidget.ArrowColor;
        var color=this.skin.TreeWidget.ItemColor;
        
        if ( selected ) 
            color=this.skin.TreeWidget.SelectedItemColor;

        if ( !item.open ) {
            var yOffset=rect.y + (rect.height - this.skin.TreeWidget.ArrowSize.height) / 2;
            //canvas.draw2DShape( VG.Canvas.Shape2D.ArrowRight, VG.Core.Rect( rect.x + 4, yOffset, this.skin.TreeWidget.ArrowSize.width, this.skin.TreeWidget.ArrowSize.height ), arrowColor );
            if ( plusImage ) canvas.drawImage( VG.Core.Point( rect.x, yOffset), plusImage );

            arrowOffset=this.skin.TreeWidget.ArrowSize.height + 4;

            this.workRect2.set( rect.x + arrowOffset, rect.y, contentRect.width - (rect.x - contentRect.x) - arrowOffset, rect.height );
            this.drawTreeItemBackground( canvas, this.workRect2, selected );
            arrowOffset+=4;

            if ( item.icon ) 
            {
                var y=rect.y + (rect.height - item.icon.height)/2;
                canvas.drawImage( VG.Core.Point( rect.x + arrowOffset, y ), item.icon );

                arrowOffset+=item.icon.width + 8;
            }

            canvas.drawTextRect( item.text, rect.add( arrowOffset, 0, -arrowOffset, 0), color, 0, 1 );        
        } else
        {
            var yOffset=rect.y + (rect.height - this.skin.TreeWidget.ArrowSize.width) / 2;
            //canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, VG.Core.Rect( rect.x, yOffset, this.skin.TreeWidget.ArrowSize.height, this.skin.TreeWidget.ArrowSize.width ), arrowColor );        
            if ( minusImage ) canvas.drawImage( VG.Core.Point( rect.x, yOffset-4), minusImage );

            arrowOffset=this.skin.TreeWidget.ArrowSize.height + 4;

            this.workRect2.set( rect.x + arrowOffset, rect.y, contentRect.width - (rect.x - contentRect.x) - arrowOffset, rect.height );
            this.drawTreeItemBackground( canvas, this.workRect2, selected );
            arrowOffset+=4;

            if ( item.icon ) 
            {
                var y=rect.y + (rect.height - item.icon.height)/2;
                canvas.drawImage( VG.Core.Point( rect.x + arrowOffset, y ), item.icon );

                arrowOffset+=item.icon.width + 8;
            }
            canvas.drawTextRect( item.text, rect.add( arrowOffset, 0, -arrowOffset, 0), color, 0, 1 );  
        }
    } else
    {
        if ( selected ) 
        {
            //canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, VG.Core.Rect( contentRect.x - this.skin.TreeWidget.ContentBorderSize.width + 4, rect.y, 
            //    contentRect.width + 2*this.skin.TreeWidget.ContentBorderSize.width - 8, rect.height ), this.skin.TreeWidget.SelectedItemBackgroundColor );                    

            this.workRect2.set( rect.x, rect.y, contentRect.width - (rect.x - contentRect.x), rect.height );
            this.drawTreeItemBackground( canvas, this.workRect2, selected );

            var offset=4;
            if ( item.icon ) 
            {
                var y=rect.y + (rect.height - item.icon.height)/2;
                canvas.drawImage( VG.Core.Point( rect.x + offset, y ), item.icon );

                offset+=item.icon.width + 8;
            }

            canvas.drawTextRect( item.text, rect.add( offset, 0, -offset, 0 ), this.skin.TreeWidget.SelectedItemColor, 0, 1 );  
        } else
        {
            this.workRect2.set( rect.x, rect.y, contentRect.width - (rect.x - contentRect.x), rect.height );
            this.drawTreeItemBackground( canvas, this.workRect2, selected );

            var offset=4;
            if ( item.icon ) 
            {
                var y=rect.y + (rect.height - item.icon.height)/2;
                canvas.drawImage( VG.Core.Point( rect.x + offset, y ), item.icon );

                offset+=item.icon.width + 8;
            }

            canvas.drawTextRect( item.text, rect.add( offset, 0, -offset, 0), this.skin.TreeWidget.ItemColor, 0, 1 );  
        }
    }

    canvas.popFont();
};

VG.Styles.Multimedia.prototype.drawTableWidgetRowBackground=function( canvas, tableWidget, rowRect, layout, selected )
{
    this.workRect1.copy( rowRect );
    this.workRect1.x+=this.skin.TableWidget.Item.XMargin;
    this.workRect1.width-=2*this.skin.TableWidget.Item.XMargin;

    if ( selected ) canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, this.workRect1, this.skin.TableWidget.Item.SelectedBorderColor );
    else canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, this.workRect1, this.skin.TableWidget.Item.BorderColor );

    this.workRect1.x+=1; this.workRect1.y+=1;
    this.workRect1.width-=2; this.workRect1.height-=4;

    if ( selected ) canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.workRect1, this.skin.TableWidget.Item.SelectedGradientColor1, this.skin.TableWidget.Item.SelectedGradientColor2 );
    else canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.workRect1, this.skin.TableWidget.Item.GradientColor1, this.skin.TableWidget.Item.GradientColor2 );

    this.workRect1.y+=this.workRect1.height; this.workRect1.height=2;

    if ( selected ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.TableWidget.Item.SelectedBottomColor );
    else canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.TableWidget.Item.BottomColor );

    // --- Draw Separators

    for ( var i=0; i < layout.children.length; ++i )
    {
        var item=layout.children[i];

        if ( item.rect.width === 1 )
        {
            this.workRect1.copy( rowRect );
            this.workRect1.x=item.rect.x;
            this.workRect1.width=item.rect.width;

            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.skin.TableWidget.Header.BorderColor );
        }
    }
};

VG.Styles.Multimedia.prototype.drawTableWidgetHeaderBackground=function( canvas, rect )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, rect, this.skin.TableWidget.Header.BorderColor );

    this.workRect1.copy( rect );
    this.workRect1.x+=1; this.workRect1.y+=1;
    this.workRect1.width-=2; this.workRect1.height-=2;

    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.workRect1, this.skin.TableWidget.Header.GradientColor1, this.skin.TableWidget.Header.GradientColor2 );    
};

VG.Styles.Multimedia.prototype.drawTableWidgetSeparator=function( canvas, separator )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( separator.contentRect.x, separator.contentRect.y, 1, separator.contentRect.height ), 
        this.skin.TableWidget.Header.SeparatorColor );    
};

VG.Styles.Multimedia.prototype.drawTableWidgetHeaderSeparator=function( canvas, widget )
{    
};

VG.Styles.Multimedia.prototype.drawTableWidgetFooterSeparator=function( canvas, widget )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( widget.footerLayout.rect.x, widget.footerLayout.rect.y - this.skin.TableWidget.Footer.SeparatorHeight/2, 
        widget.footerLayout.rect.width, 1 ), this.skin.TableWidget.Header.SeparatorColor );
};

VG.Styles.Multimedia.prototype.multipliedImage=function( image, rM, gM, bM )
{
    var newImage=VG.Core.Image( image.width, image.height );
    for ( var h=0; h < image.height; ++h )
    {
        for ( var w=0; w < image.width; ++w )
        {
            var offset=h * image.modulo + w *4;
            newImage.data[offset]=image.data[offset] * rM;
            newImage.data[offset+1]=image.data[offset+1] * gM;
            newImage.data[offset+2]=image.data[offset+2] * bM;
            newImage.data[offset+3]=image.data[offset+3];
        }
    }
    return newImage;
};

VG.Styles.pool.push( new VG.Styles.Multimedia() );