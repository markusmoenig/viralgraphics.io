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

VG.Styles.VisualGraphics=function( dontLoadImages )
{
    this.name="Visual Graphics";
    this.skins=[];

    this.path="visualgraphics";
    this.iconPrefix="vgstyle_";

    if ( !dontLoadImages ) {
        VG.loadStyleImage( "visualgraphics", "logo.png" );
        VG.loadStyleImage( "visualgraphics", "vgstyle_new.png" );
        VG.loadStyleImage( "visualgraphics", "vgstyle_open.png" );
        VG.loadStyleImage( "visualgraphics", "vgstyle_save.png" );
        VG.loadStyleImage( "visualgraphics", "vgstyle_undo.png" );
        VG.loadStyleImage( "visualgraphics", "vgstyle_redo.png" );
        VG.loadStyleImage( "visualgraphics", "vgstyle_checkmark.png" );
        VG.loadStyleImage( "visualgraphics", "vgstyle_menu_checkmark.png" );

        VG.loadStyleImage( "visualgraphics", "vgstyle_window_close_normal.png" );
        VG.loadStyleImage( "visualgraphics", "vgstyle_window_close_hover.png" );
        VG.loadStyleImage( "visualgraphics", "vgstyle_window_close_clicked.png" );

        VG.loadStyleImage( "visualgraphics", "vgstyle_dock_handle_normal.png" );
        VG.loadStyleImage( "visualgraphics", "vgstyle_dock_handle_drag.png" );

        VG.loadStyleImage( "visualgraphics", "vgstyle_status_success.png" );
        VG.loadStyleImage( "visualgraphics", "vgstyle_status_error.png" );
        VG.loadStyleImage( "visualgraphics", "vgstyle_status_warning.png" );
        VG.loadStyleImage( "visualgraphics", "vgstyle_status_question.png" );

        VG.loadStyleImage( "visualgraphics", "vgstyle_scroller_left.png" );
        VG.loadStyleImage( "visualgraphics", "vgstyle_scroller_right.png" );

        VG.loadStyleImage( "visualgraphics", "vgstyle_nodes_bg.jpg" );    
    }
    
    if ( 1 )
    {
        this.DefaultFontName="Open Sans Semibold";
        this.DefaultBoldFontName="Open Sans Bold";
        this.DefaultItalicFontName="Open Sans Semibold Italic";

        this.bluish= {

            "name" : "Bluish",

            "DefaultFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "DefaultBoldFont" : VG.Font.Font( this.DefaultBoldFontName, 15 ),
            "DefaultItalicFont" : VG.Font.Font( this.DefaultItalicFontName, 15 ),
            "LoginFont" : VG.Font.Font( this.DefaultFontName, 16 ),

            Widget : {
                BackgroundColor : VG.Core.Color( 209, 214, 220 ),
                TextColor : VG.Core.Color( 102, 106, 115 ),
                EmbeddedTextColor : VG.Core.Color( 255, 255, 255 ),
                DisabledTextColor : VG.Core.Color( 159, 173, 191 ),  
                SelectionColor : VG.Core.Color( 146, 161, 244 ),
            },

            Window : {
                FocusHeaderColor : VG.Core.Color( 108, 121, 196 ),
                BackgroundColor : VG.Core.Color( 240, 243, 248 ),
                HeaderHeight : 33,
            },

            Dialog : {
                BorderColor : VG.Core.Color( 193, 197, 203 ),
                BackgroundColor : VG.Core.Color( 221, 224, 229 ),

                Header : {
                    Color1 : VG.Core.Color( 233, 233, 233 ),
                    Color2 : VG.Core.Color( 193, 197, 205 ),
                    BorderColor : VG.Core.Color( 193, 197, 203 ),
                    Font : VG.Font.Font( this.DefaultFontName, 15 ),
                },
            },

            DockWidget : {
                BackgroundColor : VG.Core.Color( 217, 220, 225 ),
                Header : {
                    TextColor : VG.Core.Color( 143, 149, 159 ),
                    Font : VG.Font.Font( this.DefaultFontName, 15 ),
                    Height : 32,
                },
                FloatingBackgroundColor : VG.Core.Color( 244, 247, 252 ),
                FloatingBorderColor : VG.Core.Color( 185, 188, 193 ),
                FloatingSelectedBorderColor : VG.Core.Color( 108, 121, 197 ),
            },

            DockStripWidget : {
                Font : VG.Font.Font( this.DefaultFontName, 16 ),
                BorderColor : VG.Core.Color( 80, 83, 92 ),
                HoverColor : VG.Core.Color( 180, 166, 73 ),
                TextColor : VG.Core.Color( 255, 255, 255 ),
                BackgroundColor : VG.Core.Color( 68, 71, 80 ),
                HeaderHeight : 1,

                ButtonMinimumWidth : 55,

                Separator : {
                    Height : 1,
                    Color : VG.Core.Color( 86, 89, 97 ),
                },
            },
            
            Toolbar: {
                BackgroundColor : VG.Core.Color( 75, 78, 87 ),
                Height : 52,
                Margin : VG.Core.Margin( 60, 0, 0, 0 ),
                Logo : {
                    Color : VG.Core.Color( 248, 248, 248 ),
                    BackgroundColor : VG.Core.Color( 131, 146, 236 ),
                    Size : 35,
                },
                Separator : {
                    Color : VG.Core.Color( 70, 73, 82 ),
                    Size : VG.Core.Size( 2, 52 ), 
                },
            },

            ToolButton : {
                Font : VG.Font.Font( this.DefaultFontName, 15 ),
                HoverColor1 : VG.Core.Color( 110, 119, 196 ),
                HoverColor2 : VG.Core.Color( 62, 65, 72 ),
                TextColor : VG.Core.Color( 255, 255, 255 ),
                DisabledTextColor : VG.Core.Color( 98, 101, 108 ),
                MinimumWidth : 70,
                ScaleToParentHeight : true,
            },            

            ToolPanel : {
                Color : VG.Core.Color( 143, 149, 159 ),
                Height : 36,
                Spacing : 0,
                Margin : VG.Core.Margin( 0, 0, 0, 0 ),
                Separator : {
                    Color : VG.Core.Color( 124, 129, 139 ),   
                    Size : VG.Core.Size( 1, 36 ), 
                },                             
            },

            Statusbar : {
                BorderColor : VG.Core.Color( 192, 193, 195 ),
                GradientColor1 : VG.Core.Color( 225, 226, 228 ),
                GradientColor2 : VG.Core.Color( 205, 205, 205 ),
                Height : 30,
            },

            ToolPanelButton : {
                HoverColor : VG.Core.Color( 143, 158, 232 ),
                ClickedColor : VG.Core.Color( 100, 123, 236 ),
                TextColor : VG.Core.Color( 255, 255, 255 ),
                DisabledTextColor : VG.Core.Color( 98, 101, 108 ),
                MinimumWidth : 45,
                ScaleToParentHeight : true,                
            },
            
            NumberEdit : {
                Font : VG.Font.Font( this.DefaultFontName, 15 ),                
            },

            TextEdit : {
                Font : VG.Font.Font( this.DefaultFontName, 15 ),                
                BorderColor : VG.Core.Color( 168, 173, 179 ),
                DisabledBorderColor : VG.Core.Color( 191, 197, 204 ),
                TextColor : VG.Core.Color( 102, 106, 115 ),
                DisabledTextColor : VG.Core.Color( 159, 173, 191 ),  
                FocusTextColor : VG.Core.Color( 102, 106, 115 ),
                EmbeddedTextColor : VG.Core.Color( 255, 255, 255 ),
                DefaultTextColor : VG.Core.Color( 153, 161, 172 ),
                SelectionBackgroundColor : VG.Core.Color( 132, 146, 234 ),
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
                TextColor : VG.Core.Color( 102, 106, 115 ),
                DefaultFont : VG.Font.Font( this.DefaultFontName, 15 ),
                DefaultBoldFont : VG.Font.Font( this.DefaultBoldFontName, 15 ),
                DefaultItalicFont : VG.Font.Font( this.DefaultItalicFontName, 15 ),
            },

            ListWidget : {
                BorderColor : VG.Core.Color( 187, 190, 197 ),
                Margin : VG.Core.Margin( 4, 4, 4, 4 ),

                BigItemHeight : 39,
                BigItemDistance : 6,
                BigItemFont : VG.Font.Font( this.DefaultFontName, 15 ),
                SmallItemHeight : 23,
                SmallItemDistance : 4,
                SmallItemFont : VG.Font.Font( this.DefaultFontName, 13 ),
                ScrollbarXOffset : 2,

                Item : {
                    XOffset : 10,
                    BorderColor : VG.Core.Color( 254, 255, 255 ),
                    TextColor : VG.Core.Color( 105, 109, 120 ),
                    BackgroundColor : VG.Core.Color( 238, 239, 243 ),
                    SelectedBorderColor : VG.Core.Color( 67, 81, 155 ),
                    SelectedTextColor : VG.Core.Color( 255, 255, 255 ),
                    SelectedBackgroundColor : VG.Core.Color( 108, 120, 196 ),
                },
            },

            TreeWidget : {
                BorderColor : VG.Core.Color( 187, 190, 197 ),
                SelectionBorderColor : VG.Core.Color( 146, 161, 244 ),
                ContentBorderSize : VG.Core.Size( 14, 8 ),

                ItemHeightAdder : 4,
                //ItemHeight : 39,//23,            
                ItemDistance : 1,//4,            
                ItemXOffset : 10,

                ItemFont : VG.Font.Font( this.DefaultFontName, 13 ),
                ItemColor : VG.Core.Color( 102, 106, 115 ),
                ArrowColor : VG.Core.Color( 177, 182, 191 ),
                SelectedItemColor : VG.Core.Color( 255, 255, 255 ),
                SelectedItemBackgroundColor : VG.Core.Color( 132, 146, 234 ),
                SeparatorColor : VG.Core.Color( 203, 207, 213 ),
                ArrowSize : VG.Core.Size( 6, 12 ),
                ItemHierarchyOffset : 25,
            },

            Scrollbar : {
                Size : 8,    
                Color : VG.Core.Color( 169, 177, 189 ),    
                ClickedColor : VG.Core.Color( 138, 153, 238 ),    
                HoverColor : VG.Core.Color( 108, 121, 197 ),
            }, 

            Button : {
                Font : VG.Font.Font( this.DefaultFontName, 15 ),
                SmallFont : VG.Font.Font( this.DefaultFontName, 12 ),
                Color : VG.Core.Color( 143, 149, 159 ),
                TextColor : VG.Core.Color( 255, 255, 255 ),
                DisabledColor : VG.Core.Color( 172, 179, 189 ),
                DisabledTextColor : VG.Core.Color( 192, 198, 206 ),
                ClickedColor : VG.Core.Color( 138, 153, 238 ),
                FocusColor : VG.Core.Color( 108, 128, 240 ),
                HoverColor : VG.Core.Color( 108, 121, 197 ),
                CheckedColor : VG.Core.Color( 108, 125, 198 ),
                UncheckedColor : VG.Core.Color( 143, 149, 159 ),
            },

            PopupButton : {
                Font : VG.Font.Font( this.DefaultFontName, 15 ),
                BorderColor : VG.Core.Color( 172, 174, 178 ),
                DisabledBorderColor : VG.Core.Color( 180, 192, 206 ),
                BackgroundColor : VG.Core.Color( 187, 192, 199 ),
                DisabledBackgroundColor : VG.Core.Color( 210, 215, 221 ),
                HighlightedTextColor : VG.Core.Color( 255, 255, 255 ),
                TextColor : VG.Core.Color( 102, 106, 118 ),
                DisabledTextColor : VG.Core.Color( 180, 192, 207 ),
                Embedded : {
                    SelectioBorderColor : VG.Core.Color( 255, 255, 255 ),
                    BackgroundColor : VG.Core.Color( 133, 148, 231 ),
                    BorderColor : VG.Core.Color( 159, 172, 244 ),
                },
            },

            ToolPanelPopupButton : {
                Font : VG.Font.Font( this.DefaultFontName, 15 ),
                HighlightedBackgroundColor : VG.Core.Color( 142, 156, 235 ),
                TextColor : VG.Core.Color( 255, 255, 255 ),
                DisabledTextColor : VG.Core.Color( 180, 192, 207 ),            
                BackgroundColor : VG.Core.Color( 121, 127, 138 ),
            },

            Checkbox : {
                BorderColor : VG.Core.Color( 172, 174, 178 ),
                DisabledBorderColor : VG.Core.Color( 180, 192, 206 ),
                BackgroundColor : VG.Core.Color( 187, 192, 199 ),
                DisabledBackgroundColor : VG.Core.Color( 210, 215, 221 ),
            },   

            SplitLayout : {
                Separator : {
                    Color : VG.Core.Color( 194, 199, 205 ),
                    SelectedColor : VG.Core.Color( 136, 152, 245 ),
                    DecorationColor : VG.Core.Color( 168, 171, 176 ),
                    Size : 2,                    
                },
            },

            ContextMenu : {
                Font : VG.Font.Font( "Roboto Regular", 14 ),
                ShortcutFont : VG.Font.Font( "Roboto Regular", 11 ),            
                BackgroundColor : VG.Core.Color( 121, 127, 137 ),
                HighlightedBackgroundColor : VG.Core.Color( 159, 172, 246 ),
                TextColor : VG.Core.Color( 255, 255, 255 ),
                DisabledTextColor : VG.Core.Color( 135, 142, 153 ),
                HighlightedTextColor : VG.Core.Color( 255, 255, 255 ),
                SeparatorColor : VG.Core.Color( 135, 142, 153 ),
            },

            Menubar : {
                Font : VG.Font.Font( "Roboto Regular", 15 ),
                Height : 26,
                BackgroundColor : VG.Core.Color( 57, 59, 70 ),
                SelectedBackgroundColor : VG.Core.Color( 133, 148, 231 ),
                TextColor : VG.Core.Color( 183, 183, 183 ),
                SelectedTextColor : VG.Core.Color( 255, 255, 255 ),
            },

            Menu : {
                Font : VG.Font.Font( "Roboto Regular", 14 ),
                ShortcutFont : VG.Font.Font( "Roboto Regular", 11 ),
                TopBorderColor : VG.Core.Color( 40, 41, 48 ),
                SeparatorColor : VG.Core.Color( 88, 89, 99 ),
                BackgroundColor : VG.Core.Color( 76, 78, 89 ),
                DisabledTextColor : VG.Core.Color( 135, 142, 153 ),
                HighlightedTextColor : VG.Core.Color( 255, 255, 255 ),
                HighlightedBackgroundColor : VG.Core.Color( 109, 128, 227 ),
                TextColor : VG.Core.Color( 255, 255, 255 ),
            },

            TableWidget : {
                Font : VG.Font.Font( this.DefaultFontName, 15 ),
                TextColor : VG.Core.Color( 143, 149, 159 ),            
                DisabledSeparatorColor : VG.Core.Color( 191, 197, 204 ),                    
                SelectionColor : VG.Core.Color( 133, 148, 232 ),            
                SeparatorWidth : 8,
                ContentMargin : VG.Core.Margin( 10, 12, 10, 6 ),
                RowHeight : 35,

                Header : {
                    Font : VG.Font.Font( this.DefaultFontName, 13 ),
                    SeparatorColor : VG.Core.Color( 168, 173, 179 ),    
                    SeparatorHeight : 16,
                    Height : 20,
                    TextXOffset : 0,
                },
                Footer : {
                    SeparatorHeight : 16,
                    Margin : VG.Core.Margin( 0, 0, 0, 0 ),
                    Height : 28,                    
                },

                Item : {
                    XMargin : 2,                    
                    Spacing : 1,
                },
            },

            TabWidget : {
                Font : VG.Font.Font( this.DefaultFontName, 14 ),
                HeaderHeight : 35,
                TextColor : VG.Core.Color( 255, 255, 255 ),             
                BackgroundColor : VG.Core.Color( 190, 193, 197 ),             
                SelectedBackgroundColor : VG.Core.Color( 145, 158, 235 ),
            },  

            Slider : {
                Color : VG.Core.Color( 196, 197, 199 ),
                SelectionColor : VG.Core.Color( 129, 147, 230 ),
                HandleColor : VG.Core.Color( 108, 125, 216 ),
                FocusColor : VG.Core.Color( 183, 194, 253 ),
                HandleSize : 13,
                FocusSize : 5,
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

    this.skins.push( this.bluish );
    this.skin=this.bluish;
};

VG.Styles.VisualGraphics.prototype.drawSlider=function( canvas, slider )
{
    slider.sliderRect.set( slider.contentRect );
    
    var leftSpace=Math.ceil( this.skin.Slider.HandleSize / 2 );
    slider.sliderRect.x+=leftSpace;
    slider.sliderRect.width-=leftSpace;
    slider.sliderRect.y=slider.sliderRect.y + (slider.sliderRect.height - this.skin.Slider.Height)/2;
    slider.sliderRect.height=this.skin.Slider.Height;

    var color, textColor, handleColor, selectionColor;

    if ( slider.disabled ) {
        color=this.skin.Widget.DisabledTextColor;
        textColor=this.skin.Widget.DisabledTextColor;
        selectionColor=this.skin.Widget.DisabledTextColor;
        handleColor=this.skin.Widget.DisabledTextColor;
    } else { 
        color=this.skin.Slider.Color;
        textColor=this.skin.Widget.TextColor;        
        selectionColor=this.skin.Slider.SelectionColor;
        handleColor=this.skin.Slider.HandleColor;
    }

    var valueTextSize=canvas.getTextSize( slider.max.toString() );
    valueTextSize.width+=10;

    slider.sliderRect.width-=valueTextSize.width;

    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, slider.sliderRect, color );   
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, slider.sliderRect.shrink( 0, 2), color );   

    canvas.drawTextRect( slider.value.toString(), VG.Core.Rect( slider.sliderRect.right(), slider.contentRect.y, valueTextSize.width, slider.contentRect.height ), textColor, 2, 1 );

    // --- Draw the handle

    var distance=slider.max - slider.min;
    var perPixel=slider.sliderRect.width / distance;

    var valueOffset=slider.value - slider.min;
    var offset=valueOffset * perPixel;

    if ( offset >= leftSpace && !slider.disabled )
    {
        // --- Selected selection background left of the handle
        var oldWidth=slider.sliderRect.width;        

        slider.sliderRect.width=offset;
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, slider.sliderRect, selectionColor );   
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, slider.sliderRect.shrink( 0, 2), selectionColor );           

        slider.sliderRect.width=oldWidth;
    }

    slider.sliderHandleRect.x=slider.sliderRect.x + offset - leftSpace;
    slider.sliderHandleRect.y=slider.contentRect.y + (slider.contentRect.height - this.skin.Slider.HandleSize)/2;
    slider.sliderHandleRect.width=this.skin.Slider.HandleSize;
    slider.sliderHandleRect.height=this.skin.Slider.HandleSize;

    canvas.draw2DShape( VG.Canvas.Shape2D.Circle, slider.sliderHandleRect, handleColor );   

    if ( slider.visualState === VG.UI.Widget.VisualState.Focus ) {
        var focusRect=VG.Core.Rect();

        focusRect.x=slider.sliderHandleRect.x + (slider.sliderHandleRect.width - this.skin.Slider.FocusSize ) / 2;
        focusRect.y=slider.sliderHandleRect.y + (slider.sliderHandleRect.height - this.skin.Slider.FocusSize ) / 2;
        focusRect.width=this.skin.Slider.FocusSize;
        focusRect.height=this.skin.Slider.FocusSize;
        canvas.draw2DShape( VG.Canvas.Shape2D.Circle, focusRect, this.skin.Slider.FocusColor );   
    }
};

VG.Styles.VisualGraphics.prototype.drawTabWidgetHeader=function( canvas, widget )
{
    canvas.pushFont( this.skin.TabWidget.Font );

    widget.contentRect.set( widget.rect );
    widget.rect.height=this.skin.TabWidget.HeaderHeight;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( widget.rect ), this.skin.TabWidget.BackgroundColor );

    // ---

    var availableSpacePerItem=widget.rect.width / widget.items.length;

    for ( var i=0; i < widget.items.length; ++i )
    {
        var item=widget.items[i];

        widget.rect.width=availableSpacePerItem;

        if ( item.object === widget.layout.current )
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( widget.rect ), this.skin.TabWidget.SelectedBackgroundColor );    
        canvas.drawTextRect( item.text, widget.rect, this.skin.TabWidget.TextColor, 1, 1 );

        item.x=widget.rect.x;
        item.width=widget.rect.width;

        widget.rect.x+=availableSpacePerItem;
    }

    // ---

    widget.rect.set( widget.contentRect );

    widget.contentRect.y+=this.skin.TabWidget.HeaderHeight;
    widget.contentRect.height-=this.skin.TabWidget.HeaderHeight;

    canvas.popFont();
};

VG.Styles.VisualGraphics.prototype.drawMenubar=function( canvas, menu )
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

VG.Styles.VisualGraphics.prototype.drawMenu=function( canvas, menu )
{
    canvas.pushFont( this.skin.Menu.Font );

    menu.contentRect.x=menu.rect.x;
    menu.contentRect.y=menu.parent.rect.bottom();

    menu.contentRect.setSize( menu.calcSize() );

    var oldHeight=menu.contentRect.height;

    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, menu.contentRect, this.skin.Menu.BackgroundColor ); 
    canvas.draw2DShape( VG.Canvas.Shape2D.DropShadow_NoTop7px, menu.contentRect, VG.Core.Color( 0, 0, 0 ) ); 

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

            if ( item.checkable && item.checked ) {
                var image=VG.context.imagePool.getImageByName( "vgstyle_menu_checkmark.png" );
                if ( image ) {    
                    canvas.drawImage( VG.Core.Point( itemRect.right() - image.width - 10, itemRect.y + (itemRect.height-image.height)/2), image );
                }                
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
            var sepRect=VG.Core.Rect( rect.x, y, rect.width, 1 ).round();
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, sepRect, this.skin.Menu.SeparatorColor ); 

            y++;
        }      
    }

    this.itemHeight=itemHeight;

    canvas.popFont();        
};

VG.Styles.VisualGraphics.prototype.drawContextMenu=function( canvas, menu )
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
                var image=VG.context.imagePool.getImageByName( "vgstyle_menu_checkmark.png" );
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

VG.Styles.VisualGraphics.prototype.drawToolbar=function( canvas, toolbar )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, toolbar.rect, this.skin.Toolbar.BackgroundColor );
};

VG.Styles.VisualGraphics.prototype.drawToolPanel=function( canvas, panel )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( panel.rect.x, panel.rect.y, panel.rect.width, this.skin.ToolPanel.Height ), this.skin.ToolPanel.Color );
};

VG.Styles.VisualGraphics.prototype.drawStatusbar=function( canvas, statusbar )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( 0, statusbar.rect.y, statusbar.rect.width, statusbar.rect.height ), this.skin.Statusbar.BorderColor );
    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, VG.Core.Rect( 0, statusbar.rect.y + 1, statusbar.rect.width, statusbar.rect.height ), 
                        this.skin.Statusbar.GradientColor1, this.skin.Statusbar.GradientColor2 );
};

VG.Styles.VisualGraphics.prototype.drawToolButton=function( canvas, button )
{
    if ( button.visualState === VG.UI.Widget.VisualState.Hover ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, button.contentRect.add( 0, 0, 0, -button.contentRect.height+3 ), this.skin.ToolButton.HoverColor1 );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, button.contentRect.add( 0, 3, 0, -3), this.skin.ToolButton.HoverColor2 );
    }

    if ( !button.iconName )
    {
        canvas.pushFont( this.skin.ToolButton.Font );

        if ( !button.disabled )
            canvas.drawTextRect( button.text, button.contentRect, VG.context.style.skin.ToolButton.TextColor );
        else
            canvas.drawTextRect( button.text, button.contentRect, VG.context.style.skin.ToolButton.DisabledTextColor );         

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
            {
                if ( !button.clickedIcon )
                {
                    button.clickedIcon=VG.Core.Image( button.icon.width, button.icon.height );
                    for ( var h=0; h < button.icon.height; ++h )
                    {
                        for ( var w=0; w < button.icon.width; ++w )
                        {
                            var offset=h * button.icon.modulo + w *4;
                            button.clickedIcon.data[offset]=button.icon.data[offset] * 0.568;
                            button.clickedIcon.data[offset+1]=button.icon.data[offset+1] * 0.619;
                            button.clickedIcon.data[offset+2]=button.icon.data[offset+2] * 0.921;
                            button.clickedIcon.data[offset+3]=button.icon.data[offset+3];
                        }
                    }
                }
                canvas.drawImage( VG.Core.Point( x, y ), button.clickedIcon );
            } else
                canvas.drawImage( VG.Core.Point( x, y ), button.icon );
        }
    }    
};

VG.Styles.VisualGraphics.prototype.drawToolPanelButton=function( canvas, button )
{
    if ( !button.disabled ) {
        if ( button.mouseIsDown ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, button.contentRect, this.skin.ToolPanelButton.ClickedColor );
        else if ( button.visualState === VG.UI.Widget.VisualState.Hover ) {
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, button.contentRect, this.skin.ToolPanelButton.HoverColor );
        }
    }

    if ( !button.iconName )
    {
        if ( !button.disabled )
            canvas.drawTextRect( button.text, button.contentRect, VG.context.style.skin.ToolPanelButton.TextColor );
        else
            canvas.drawTextRect( button.text, button.contentRect, VG.context.style.skin.ToolPanelButton.DisabledTextColor );            
    } else
    {
        if ( !button.icon ) this.icon=VG.Core.imagePool.getImageByName( this.iconName );
        if ( button.icon ) 
        {
            var x=button.contentRect.x + (button.contentRect.width - button.icon.width)/2;
            var y=button.contentRect.y + (button.contentRect.height - button.icon.height)/2;

            if ( button.disabled )
            {
                if ( !button.disabledIcon )
                {
                    button.disabledIcon=VG.Core.Image( button.icon.width, this.icon.height );
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
            {
                if ( !button.clickedIcon )
                {
                    button.clickedIcon=VG.Core.Image( button.icon.width, button.icon.height );
                    for ( var h=0; h < button.icon.height; ++h )
                    {
                        for ( var w=0; w < button.icon.width; ++w )
                        {
                            var offset=h * button.icon.modulo + w *4;
                            this.clickedIcon.data[offset]=button.icon.data[offset] * 0.568;
                            this.clickedIcon.data[offset+1]=button.icon.data[offset+1] * 0.619;
                            this.clickedIcon.data[offset+2]=button.icon.data[offset+2] * 0.921;
                            this.clickedIcon.data[offset+3]=button.icon.data[offset+3];
                        }
                    }
                }
                canvas.drawImage( VG.Core.Point( x, y ), button.clickedIcon );
            } else
                canvas.drawImage( VG.Core.Point( x, y ), button.icon );
        }
    }    
};

VG.Styles.VisualGraphics.prototype.drawToolSeparator=function( canvas, separator )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( separator.contentRect.x, separator.contentRect.y, 2, separator.contentRect.bottom() ), this.skin.Toolbar.Separator.Color );
};

VG.Styles.VisualGraphics.prototype.drawToolPanelSeparator=function( canvas, separator )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( separator.contentRect.x, separator.contentRect.y, 1, separator.contentRect.height ), this.skin.ToolPanel.Separator.Color );
};

VG.Styles.VisualGraphics.prototype.drawDockWidgetHeader=function( canvas, dock, rect)
{
    var xBorderOffset=8;

    canvas.pushFont( this.skin.DockWidget.Header.Font );
    canvas.drawTextRect( dock.text, rect.add( xBorderOffset, 0, -xBorderOffset, 0), this.skin.DockWidget.Header.TextColor, 0, 1 );
    canvas.popFont();

    var lrect=VG.Core.Rect( rect.right() - 15 -xBorderOffset, rect.y + 10, 15, 2 );

    var imageName;

    if ( dock.dragOp ) imageName="vgstyle_dock_handle_drag.png"
    else imageName="vgstyle_dock_handle_normal.png"

    var image=VG.context.imagePool.getImageByName( imageName );
    if ( image ) canvas.drawImage( VG.Core.Point( rect.right() -xBorderOffset - image.width, rect.y + (rect.height-image.height)/2), image );
};

VG.Styles.VisualGraphics.prototype.drawTextEditBorder=function( canvas, edit )
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

VG.Styles.VisualGraphics.prototype.drawGeneralBorder=function( canvas, edit )
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

VG.Styles.VisualGraphics.prototype.drawListWidgetBorder=function( canvas, widget )
{    
    if ( widget.visualState !== VG.UI.Widget.VisualState.Focus )
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, widget.rect, this.skin.ListWidget.BorderColor )
    else
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, widget.rect, this.skin.Widget.SelectionColor );
    
    widget.contentRect=widget.rect.add( 1, 1, -2, -2 );
};

VG.Styles.VisualGraphics.prototype.drawListWidgetItem=function( canvas, item, selected, rect, drawContent )
{
    if ( !selected ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, rect, this.skin.ListWidget.Item.BorderColor )
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect.add( 1, 1, -2, -2), this.skin.ListWidget.Item.BackgroundColor );
        if ( drawContent )
            canvas.drawTextRect( item.text, rect.add( this.skin.ListWidget.Item.XOffset, 0, -this.skin.ListWidget.ItemXOffset - 2, 0), this.skin.ListWidget.Item.TextColor, 0, 1 );
    } else {
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, rect, this.skin.ListWidget.Item.SelectedBorderColor )
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect.add( 1, 1, -2, -2), this.skin.ListWidget.Item.SelectedBackgroundColor );
        if ( drawContent )
            canvas.drawTextRect( item.text, rect.add( this.skin.ListWidget.Item.XOffset, 0, -this.skin.ListWidget.Item.XOffset - 2, 0), this.skin.ListWidget.Item.SelectedTextColor, 0, 1 );
    }
};

VG.Styles.VisualGraphics.prototype.drawScrollbar=function( canvas, scrollBar, adjustAlpha )
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

VG.Styles.VisualGraphics.prototype.drawButton=function( canvas, button )
{
    var buttonRect;

    if ( button.visualState === VG.UI.Widget.VisualState.Focus ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, button.contentRect, this.skin.Button.FocusColor );        
        buttonRect=button.contentRect.add( 2, 2, -4, -4 );
    }  else buttonRect=button.contentRect;

    var color;

    if ( !button.disabled ) {
        if ( !button.mouseIsDown ) {

            if ( button.visualState === VG.UI.Widget.VisualState.Hover ) {
                color=this.skin.Button.HoverColor;
            } else {
                color=this.skin.Button.Color;
            }
            
            if ( button.checkable && button.checked )
                canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, buttonRect, this.skin.Button.CheckedColor );
            else
            if ( button.checkable && !button.checked )
                canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, buttonRect, this.skin.Button.UncheckedColor );
            else
            if ( button.visualState === VG.UI.Widget.VisualState.Focus )
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, buttonRect, color );
            else
                canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, buttonRect, color );
        } else {
            color=this.skin.Button.ClickedColor;

            if ( button.visualState === VG.UI.Widget.VisualState.Hover )
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, buttonRect, color );
            else canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, buttonRect, color );
        }
    } else {
        color=this.skin.Button.DisabledColor;     

        if ( button.visualState === VG.UI.Widget.VisualState.Hover )
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, buttonRect, color );
        else canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, buttonRect, color );
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

VG.Styles.VisualGraphics.prototype.drawFrame=function( canvas, frame )
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

VG.Styles.VisualGraphics.prototype.drawPopupButton=function( canvas, button )
{
    var borderColor;

    canvas.pushFont( this.skin.PopupButton.Font );

    if ( button.embeddedSelection ) borderColor=this.skin.PopupButton.Embedded.SelectioBorderColor;
    else
    if ( button.disabled ) borderColor=this.skin.PopupButton.DisabledBorderColor;
    else {
        if ( button.visualState !== VG.UI.Widget.VisualState.Focus )
            borderColor=this.skin.PopupButton.BorderColor;
        else borderColor=this.skin.Widget.SelectionColor;    
    }

    // -- Draw the top without the lower line as this depends on popup state

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( button.rect.x+1, button.rect.y, button.rect.width-2, 1 ), borderColor );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( button.rect.x, button.rect.y+1, 1, button.rect.height-2 ), borderColor );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( button.rect.right()-1, button.rect.y+1, 1, button.rect.height-2 ), borderColor );

    var pixelColor=VG.Core.Color( borderColor );
    pixelColor.a=0.3;
            
    canvas.addSolidRectangle2D( button.rect.x, button.rect.y, button.rect.x+1, button.rect.y+1, pixelColor );
    canvas.addSolidRectangle2D( button.rect.right()-1, button.rect.y, button.rect.right(), button.rect.y+1, pixelColor );

    // --- Background + Triangle

    if ( button.disabled )
    {
        if ( !button.embedded ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, button.rect.add( 1, 1, -2, -2), this.skin.PopupButton.DisabledBackgroundColor );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( button.rect.right()-25, button.rect.y+1, 1, button.rect.height-1 ), borderColor );
        canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, VG.Core.Rect( button.rect.right()-17, button.rect.y+11, 10, 5 ), this.skin.PopupButton.DisabledTextColor );
    } else
    {
        if ( !button.embedded ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, button.rect.add( 1, 1, -2, -2), this.skin.PopupButton.BackgroundColor );
        else if ( button.embeddedSelection ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, button.rect.add( 1, 1, -2, -2), this.skin.PopupButton.Embedded.BackgroundColor );

        if ( button.embeddedSelection ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( button.rect.right()-25, button.rect.y+1, 1, button.rect.height-1 ), borderColor ); 
        else canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( button.rect.right()-25, button.rect.y+1, 1, button.rect.height-1 ), this.skin.PopupButton.BorderColor );
     
        if ( !button.embeddedSelection && button.embedded )
            canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, VG.Core.Rect( button.rect.right()-17, button.rect.y+11, 10, 5 ), this.skin.PopupButton.TextColor );
        else canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, VG.Core.Rect( button.rect.right()-17, button.rect.y+11, 10, 5 ), this.skin.PopupButton.HighlightedTextColor );
    }

    if ( button.popup === true ) {
        var itemHeight=canvas.getLineHeight() + 7;
        var popupHeight=button.items.length * itemHeight;
        var popupRect=VG.Core.Rect( button.rect.x, button.rect.bottom()-1, button.rect.width, popupHeight ).round();

        //console.log( popupRect.bottom(), VG.context.workspace.rect.height );

        // --- Draw the popup outline
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( popupRect.x+1, popupRect.bottom()-1, popupRect.width-2, 1 ), borderColor );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( popupRect.x, popupRect.y, 1, popupRect.height-1 ), borderColor );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( popupRect.right()-1, popupRect.y, 1, popupRect.height-1 ), borderColor );

        canvas.addSolidRectangle2D( popupRect.x, popupRect.bottom()-1, popupRect.x+1, popupRect.bottom(), pixelColor );
        canvas.addSolidRectangle2D( popupRect.right()-1, popupRect.bottom()-1, popupRect.right(), popupRect.bottom(), pixelColor );

        // --- Draw the background and the separator to the popup area
        if ( !button.embedded ) 
        {
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, popupRect.add( 1, 1, -2, -2 ), this.skin.PopupButton.BackgroundColor );
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( button.rect.x+1, button.rect.y+button.rect.height-1, button.rect.width-2, 1), this.skin.PopupButton.BorderColor );
        } else { 
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, popupRect.add( 1, 1, -2, -2 ), this.skin.PopupButton.Embedded.BackgroundColor );
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( button.rect.x+1, button.rect.y+button.rect.height-1, button.rect.width-2, 1), this.skin.PopupButton.Embedded.SelectioBorderColor );
        }

        // --- Draw the popup text items

        for( var i=0; i < button.items.length; ++i )
        {
            var itemRect=VG.Core.Rect( popupRect.x, popupRect.y + i * itemHeight, popupRect.width, itemHeight );

            var color;

            if ( i === button.index ) color=this.skin.PopupButton.HighlightedTextColor;
            else color=this.skin.PopupButton.TextColor;

            canvas.drawTextRect( button.items[i], itemRect.add( 10, 0, -10, 0), color, 0, 1 );
            
            if ( i < button.items.length - 1 )
            {
                if ( !button.embedded )
                    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( itemRect.x+1, itemRect.bottom()-1, itemRect.width-2, 1 ).round(), this.skin.PopupButton.BorderColor );            
                else canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( itemRect.x+1, itemRect.bottom()-1, itemRect.width-2, 1 ).round(), this.skin.PopupButton.Embedded.BorderColor );            
            }
        }

        button.popupRect=popupRect;
        button.itemHeight=itemHeight;
    } else
    {
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( button.rect.x+1, button.rect.y+button.rect.height-1, button.rect.width-2, 1), borderColor );        

        canvas.addSolidRectangle2D( button.rect.x, button.rect.bottom()-1, button.rect.x+1, button.rect.bottom(), pixelColor );
        canvas.addSolidRectangle2D( button.rect.right()-1, button.rect.bottom()-1, button.rect.right(), button.rect.bottom(), pixelColor );
    }

    if ( button.index !== -1 )
    {
        if ( button.disabled ) canvas.drawTextRect( button.items[button.index], button.contentRect.add( 10, 0, -10, 0), this.skin.PopupButton.DisabledTextColor, 0, 1 );    
        else {
            if ( !button.embeddedSelection && button.embedded ) {
                canvas.drawTextRect( button.items[button.index], button.contentRect.add( 10, 0, -10, 0), this.skin.PopupButton.TextColor, 0, 1 );    
            }
            else canvas.drawTextRect( button.items[button.index], button.contentRect.add( 10, 0, -10, 0), this.skin.PopupButton.HighlightedTextColor, 0, 1 );    
        }
    }
    canvas.popFont();    
};

VG.Styles.VisualGraphics.prototype.drawToolPanelPopupButton=function( canvas, button )
{
    var borderColor;

    canvas.pushFont( this.skin.ToolPanelPopupButton.Font );

    var spacing=1;

    if ( button.popup === true ) {
        var itemHeight=32;//canvas.getLineHeight() + 7;
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
            
            if ( i < button.items.length - 1 )
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( itemRect.x, itemRect.bottom()-1, itemRect.width, 1 ), this.skin.ToolPanel.Color );
        }        
    }

    if ( this.index !== -1 )
    {
        if ( button.disabled ) {
            canvas.drawTextRect( button.items[button.index], button.contentRect.add( 10, 0, -10, 0), this.skin.ToolPanelPopupButton.DisabledTextColor, 0, 1 );    
            canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, VG.Core.Rect( button.rect.right()-20, button.rect.y+14, 12, 6 ), this.skin.ToolPanelPopupButton.DisabledTextColor );
        }
        else  {
            canvas.drawTextRect( button.items[button.index], button.contentRect.add( 10, 0, -10, 0), this.skin.ToolPanelPopupButton.TextColor, 0, 1 );    
            canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, VG.Core.Rect( button.rect.right()-20, button.rect.y+14, 12, 6 ), this.skin.ToolPanelPopupButton.TextColor );
        }
    }
    canvas.popFont();    
};


VG.Styles.VisualGraphics.prototype.drawWindow=function( canvas, window )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( window.rect.x, window.rect.y, window.rect.width, this.skin.Window.HeaderHeight ), this.skin.Window.FocusHeaderColor );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, window.contentRect, this.skin.Window.BackgroundColor );

    var titleTextRect=VG.Core.Rect( window.rect.x+10, window.rect.y, window.rect.width, this.skin.Window.HeaderHeight );
    canvas.drawTextRect( window.text, titleTextRect, VG.Core.Color( 244, 244, 244 ), 0, 1 );    
};

VG.Styles.VisualGraphics.prototype.drawDialog=function( canvas, dialog )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, dialog.rect, this.skin.Dialog.BorderColor );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, dialog.rect.shrink(1,1), this.skin.Dialog.BackgroundColor );

    var titleRect=VG.Core.Rect( dialog.rect.x+1, dialog.rect.y+1, dialog.rect.width-2, this.skin.Window.HeaderHeight-2 );
    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, titleRect, this.skin.Dialog.Header.Color1, this.skin.Dialog.Header.Color2 );

    titleRect.x+=10;
    canvas.drawTextRect( dialog.text, titleRect, this.skin.Widget.TextColor, 0, 1 );  

    titleRect.x=dialog.rect.x+1;
    titleRect.y+=this.skin.Window.HeaderHeight-2;
    titleRect.height=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, titleRect, this.skin.Dialog.Header.BorderColor );

    // --- Dialog Title Buttons

    if ( !dialog.closeImage.isValid() ) {
        var image=VG.context.imagePool.getImageByName( "vgstyle_window_close_normal.png" );
        if ( image ) dialog.closeImage.image=image;
    }

    if ( !dialog.closeImage.hoverImage ) {
        var image=VG.context.imagePool.getImageByName( "vgstyle_window_close_hover.png" );
        if ( image ) dialog.closeImage.hoverImage=image;
    }

    if ( !dialog.closeImage.clickedImage ) {
        var image=VG.context.imagePool.getImageByName( "vgstyle_window_close_clicked.png" );
        if ( image ) dialog.closeImage.clickedImage=image;
    }    

    if ( dialog.closeImage.isValid() ) {
        dialog.closeImage.rect.set( dialog.rect.right() - 12 - dialog.closeImage.image.width, dialog.rect.y + (this.skin.Window.HeaderHeight - dialog.closeImage.image.height)/2, 
            dialog.closeImage.image.width, dialog.closeImage.image.height );
        dialog.closeImage.paintWidget( canvas );
    }

    // ---

    dialog.contentRect.set( dialog.rect.x+1, dialog.rect.y + this.skin.Window.HeaderHeight + 1, dialog.rect.width-1, dialog.rect.height - this.skin.Window.HeaderHeight );  
};

VG.Styles.VisualGraphics.prototype.drawSplitHandle=function( canvas, layout, pos, itemRect, childRect, dragging )
{
    var color;

    if ( dragging == false ) color=this.skin.SplitLayout.Separator.Color;
    else color=this.skin.SplitLayout.Separator.SelectedColor;

    if ( layout.rect[layout.secondarySize] < 40 ) drawDecoration=false;

    if ( dragging ) {
        itemRect[layout.primaryCoord]=pos + childRect[layout.primarySize];
        itemRect[layout.secondaryCoord]=layout.margin[layout.secondaryLesserMargin] + layout.rect[layout.secondaryCoord];
        itemRect[layout.primarySize]=layout.spacing;
        itemRect[layout.secondarySize]=layout.rect[layout.secondarySize] - layout.margin[layout.secondaryLesserMargin] - layout.margin[layout.secondaryGreaterMargin]  
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect, color );

        // --- Left - Right Arrows

        if ( layout.primaryCoord == "x" )
        {/*
            itemRect[layout.primaryCoord]=pos + childRect[layout.primarySize] -2 - 4;
            itemRect[layout.secondaryCoord]=layout.rect[layout.secondaryCoord] + (layout.rect[layout.secondarySize] - 8) / 2;
            itemRect[layout.primarySize]=4;
            itemRect[layout.secondarySize]=8;   
            canvas.draw2DShape( VG.Canvas.Shape2D.ArrowLeft, itemRect, color );

            itemRect[layout.primaryCoord]=pos + childRect[layout.primarySize] + layout.spacing + 1;
            canvas.draw2DShape( VG.Canvas.Shape2D.ArrowRight, itemRect, color );*/
        }
    } else
    {
        itemRect[layout.primaryCoord]=pos + childRect[layout.primarySize];
        itemRect[layout.secondaryCoord]=layout.margin[layout.secondaryLesserMargin] + layout.rect[layout.secondaryCoord];
        itemRect[layout.primarySize]=layout.spacing;
        itemRect[layout.secondarySize]=layout.rect[layout.secondarySize] / 2 - 10 - layout.margin[layout.secondaryLesserMargin];   
        itemRect.round();  
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect, color );

        itemRect[layout.primaryCoord]=pos + childRect[layout.primarySize];
        itemRect[layout.secondaryCoord]=layout.rect[layout.secondaryCoord] + layout.rect[layout.secondarySize] / 2 - 5;
        itemRect[layout.primarySize]=layout.spacing;
        itemRect[layout.secondarySize]=2;     
        itemRect.round();  
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect, this.skin.SplitLayout.Separator.DecorationColor );

        itemRect[layout.secondaryCoord]+=4;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect, this.skin.SplitLayout.Separator.DecorationColor );

        itemRect[layout.secondaryCoord]+=4;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect, this.skin.SplitLayout.Separator.DecorationColor );

        itemRect[layout.primaryCoord]=pos + childRect[layout.primarySize];
        itemRect[layout.secondaryCoord]=layout.rect[layout.secondaryCoord] + layout.rect[layout.secondarySize] / 2 + 10;
        itemRect[layout.primarySize]=layout.spacing;
        itemRect[layout.secondarySize]=layout.rect[layout.secondarySize] - layout.rect[layout.secondarySize] / 2 - 10 - layout.margin[layout.secondaryGreaterMargin];     
        itemRect.round();  
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect, color );
    }
};

VG.Styles.VisualGraphics.prototype.drawCheckbox=function( canvas, box )
{
    var borderColor;

    if ( box.disabled ) borderColor=this.skin.Checkbox.DisabledBorderColor;
    else {
        if ( box.visualState !== VG.UI.Widget.VisualState.Focus )
            borderColor=this.skin.Checkbox.BorderColor;
        else borderColor=this.skin.Widget.SelectionColor;    
    }    

    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, box.contentRect, borderColor );   

    if ( box.disabled ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, box.contentRect.add( 1, 1, -2, -2), this.skin.Checkbox.DisabledBackgroundColor );
    else canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, box.contentRect.add( 1, 1, -2, -2), this.skin.Checkbox.BackgroundColor );

    if ( box.checked )
    {
        var image=VG.context.imagePool.getImageByName( "vgstyle_checkmark.png" );
        if ( image ) {    
            canvas.drawImage( VG.Core.Point( box.rect.x + (box.rect.width-image.width)/2, box.rect.y + (box.rect.height-image.height)/2), image );
        }
    }
};

VG.Styles.VisualGraphics.prototype.drawDockWidget=function( canvas, dock )
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

VG.Styles.VisualGraphics.prototype.drawDockStripWidget=function( canvas, dock )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( dock.rect.x, dock.rect.y, dock.rect.width, this.skin.DockStripWidget.HeaderHeight ), this.skin.DockStripWidget.BorderColor);
};

VG.Styles.VisualGraphics.prototype.drawTreeWidgetBorder=function( canvas, widget )
{    
    if ( widget.noFocusDrawing ) 
    {
        widget.contentRect.set( widget.rect );
        return;
    }

    if ( widget.visualState !== VG.UI.Widget.VisualState.Focus )
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, widget.rect, this.skin.TreeWidget.BorderColor )
    else
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, widget.rect, this.skin.TreeWidget.SelectionBorderColor );

    widget.contentRect=widget.rect.add( 1, 1, -2, -2 );
};

VG.Styles.VisualGraphics.prototype.drawTreeWidgetItem=function( canvas, item, selected, rect, contentRect )
{
    canvas.pushFont( this.skin.TreeWidget.ItemFont );
    var arrowOffset=0;

    // --- Get the Icon if needed

    if ( item.children )
    {
        if ( !item.icon && item.iconName && item.iconName.length ) 
        {
            item.icon=VG.context.imagePool.getImageByName( item.iconName );
            if ( item.icon )
                item.icon=this.multipliedImage( item.icon, 0.52, 0.58, 0.90 );
        }
    } else
    {
        if ( item.iconName && item.iconName.length ) 
        {
            item.icon=VG.context.imagePool.getImageByName( item.iconName );
            if ( item.icon && !selected )
                item.icon=this.multipliedImage( item.icon, 0.52, 0.58, 0.90 );
        }
    }

    // ---

    if ( item.children )
    {
        var arrowColor=this.skin.TreeWidget.ArrowColor;
        var color=this.skin.TreeWidget.ItemColor;
        if ( selected ) 
        {
            canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, VG.Core.Rect( contentRect.x - this.skin.TreeWidget.ContentBorderSize.width + 4, rect.y, 
                contentRect.width + 2*this.skin.TreeWidget.ContentBorderSize.width - 8, rect.height ), this.skin.TreeWidget.SelectedItemBackgroundColor );                    
            color=this.skin.TreeWidget.SelectedItemColor;
            arrowColor=this.skin.TreeWidget.SelectedItemColor;
        }

        if ( !item.open ) {
            var yOffset=rect.y + (rect.height - this.skin.TreeWidget.ArrowSize.height) / 2;
            canvas.draw2DShape( VG.Canvas.Shape2D.ArrowRight, VG.Core.Rect( rect.x + 4, yOffset, this.skin.TreeWidget.ArrowSize.width, this.skin.TreeWidget.ArrowSize.height ), arrowColor );        

            arrowOffset=this.skin.TreeWidget.ArrowSize.height + 8;

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
            canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, VG.Core.Rect( rect.x, yOffset, this.skin.TreeWidget.ArrowSize.height, this.skin.TreeWidget.ArrowSize.width ), arrowColor );        

            arrowOffset=this.skin.TreeWidget.ArrowSize.height + 8;

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
            canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, VG.Core.Rect( contentRect.x - this.skin.TreeWidget.ContentBorderSize.width + 4, rect.y, 
                contentRect.width + 2*this.skin.TreeWidget.ContentBorderSize.width - 8, rect.height ), this.skin.TreeWidget.SelectedItemBackgroundColor );                    

            var offset=0;
            if ( item.icon ) 
            {
                var y=rect.y + (rect.height - item.icon.height)/2;
                canvas.drawImage( VG.Core.Point( rect.x, y ), item.icon );

                offset=item.icon.width + 8;
            }

            canvas.drawTextRect( item.text, rect.add( offset, 0, -offset, 0 ), this.skin.TreeWidget.SelectedItemColor, 0, 1 );  
        } else
        {
            var offset=0;
            if ( item.icon ) 
            {
                var y=rect.y + (rect.height - item.icon.height)/2;
                canvas.drawImage( VG.Core.Point( rect.x, y ), item.icon );

                offset=item.icon.width + 8;
            }

            canvas.drawTextRect( item.text, rect.add( offset, 0, -offset, 0), this.skin.TreeWidget.ItemColor, 0, 1 );  
        }
    }

    canvas.popFont();
};

VG.Styles.VisualGraphics.prototype.drawTableWidgetRowBackground=function( canvas, tableWidget, rowRect, layout, selected )
{
    if ( selected )
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rowRect, canvas.style.skin.TableWidget.SelectionColor );
};

VG.Styles.VisualGraphics.prototype.drawTableWidgetHeaderBackground=function( canvas, rect )
{
};

VG.Styles.VisualGraphics.prototype.drawTableWidgetSeparator=function( canvas, separator )
{
    var color;
    if ( !separator.disabled ) color=this.skin.TableWidget.Header.SeparatorColor;
    else color=this.skin.TableWidget.DisabledSeparatorColor;

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( separator.contentRect.x, separator.contentRect.y, 1, separator.contentRect.height ), color );
};

VG.Styles.VisualGraphics.prototype.drawTableWidgetHeaderSeparator=function( canvas, widget )
{
    var color;
    if ( !widget.disabled ) color=this.skin.TableWidget.Header.SeparatorColor;
    else color=this.skin.TableWidget.DisabledSeparatorColor;

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( widget.headerLayout.rect.x, widget.headerLayout.rect.bottom() + this.skin.TableWidget.Header.SeparatorHeight / 2, 
        widget.headerLayout.rect.width, 1 ), color );
};

VG.Styles.VisualGraphics.prototype.drawTableWidgetFooterSeparator=function( canvas, widget )
{
    var color;
    if ( !widget.disabled ) color=this.skin.TableWidget.Header.SeparatorColor;
    else color=this.skin.TableWidget.DisabledSeparatorColor;

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( widget.footerLayout.rect.x, widget.footerLayout.rect.y - this.skin.TableWidget.Footer.SeparatorHeight/2, 
        widget.footerLayout.rect.width, 1 ), color );
};

VG.Styles.VisualGraphics.prototype.multipliedImage=function( image, rM, gM, bM )
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

var vgStyle=new VG.Styles.VisualGraphics()
VG.Styles.pool.push( vgStyle );
VG.context.style=vgStyle;