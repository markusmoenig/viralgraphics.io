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

VG.Styles.VisualGraphics=function( desktopStyle )
{
    this.name="Visual Graphics";
    this.skins=[];

    VG.Styles.pool.push( this );

    VG.loadStyleImage( "visualgraphics", "logo.png" );
    VG.loadStyleImage( "visualgraphics", "new.png" );
    VG.loadStyleImage( "visualgraphics", "open.png" );
    VG.loadStyleImage( "visualgraphics", "save.png" );
    VG.loadStyleImage( "visualgraphics", "undo.png" );
    VG.loadStyleImage( "visualgraphics", "redo.png" );
    VG.loadStyleImage( "visualgraphics", "checkmark.png" );
    VG.loadStyleImage( "visualgraphics", "menu_checkmark.png" );

    VG.loadStyleImage( "visualgraphics", "window_close_normal.png" );
    VG.loadStyleImage( "visualgraphics", "window_close_hover.png" );
    VG.loadStyleImage( "visualgraphics", "window_close_clicked.png" );

    VG.loadStyleImage( "visualgraphics", "dock_handle_normal.png" );
    VG.loadStyleImage( "visualgraphics", "dock_handle_drag.png" );

    VG.loadStyleImage( "visualgraphics", "status_success.png" );
    VG.loadStyleImage( "visualgraphics", "status_error.png" );
    VG.loadStyleImage( "visualgraphics", "status_warning.png" );
    VG.loadStyleImage( "visualgraphics", "status_question.png" );

    VG.loadStyleImage( "visualgraphics", "scroller_left.png" );
    VG.loadStyleImage( "visualgraphics", "scroller_right.png" );

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

            "WidgetBackgroundColor" : VG.Core.Color( 209, 214, 220 ),
            "WidgetTextColor" : VG.Core.Color( 102, 106, 115 ),
            "WidgetEmbeddedTextColor" : VG.Core.Color( 255, 255, 255 ),
            "WidgetDisabledTextColor" : VG.Core.Color( 159, 173, 191 ),
            "WidgetSelectionColor" : VG.Core.Color( 146, 161, 244 ),

            "WindowFocusHeaderColor" : VG.Core.Color( 108, 121, 196 ),
            "WindowBackgroundColor" : VG.Core.Color( 240, 243, 248 ),
            "WindowHeaderHeight" : 33,

            "WindowFocusHeaderColor" : VG.Core.Color( 108, 121, 196 ),
            "DialogBorderColor" : VG.Core.Color( 193, 197, 203 ),
            "DialogBackgroundColor" : VG.Core.Color( 221, 224, 229 ),
            //"DialogBackgroundColor" : VG.Core.Color( "#40475c" ),
            "DialogTitleColor1" : VG.Core.Color( 233, 233, 233 ),
            "DialogTitleColor2" : VG.Core.Color( 193, 197, 205 ),
            "DialogTitleBorderColor" : VG.Core.Color( 193, 197, 203 ),

            "DockWidgetBackgroundColor" : VG.Core.Color( 217, 220, 225 ),
            "DockWidgetHeaderTextColor" : VG.Core.Color( 143, 149, 159 ),
            "DockWidgetHeaderFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "DockWidgetHeaderHeight" : 32,

            "DockWidgetFloatingBackgroundColor" : VG.Core.Color( 244, 247, 252 ),
            "DockWidgetFloatingBorderColor" : VG.Core.Color( 185, 188, 193 ),
            "DockWidgetFloatingSelectedBorderColor" : VG.Core.Color( 108, 121, 197 ),

            "DockStripWidgetFont" : VG.Font.Font( this.DefaultFontName, 16 ),
            "DockStripWidgetBorderColor" : VG.Core.Color( 80, 83, 92 ),
            "DockStripWidgetHoverColor" : VG.Core.Color( 180, 166, 73 ),
            "DockStripWidgetTextColor" : VG.Core.Color( 255, 255, 255 ),
            "DockStripWidgetBackgroundColor" : VG.Core.Color( 68, 71, 80 ),
            "DockStripWidgetHeaderHeight" : 1,

            "DockStripWidgetButtonMinimumWidth" : 55,

            "DockStripWidgetSeparatorHeight" : 1,
            "DockStripWidgetSeparatorColor" : VG.Core.Color( 86, 89, 97 ),
            
            "ToolbarColor" : VG.Core.Color( 75, 78, 87 ),
            "ToolbarHeight" : 52,
            "ToolbarLeftMargin" : 60,
            "ToolbarLogoColor" : VG.Core.Color( 248, 248, 248 ),
            "ToolbarLogoBackgroundColor" : VG.Core.Color( 131, 146, 236 ),
            "ToolbarLogoSize" : 35,

            "ToolPanelColor" : VG.Core.Color( 143, 149, 159 ),
            "ToolPanelHeight" : 36,

            "StatusbarBorderColor" : VG.Core.Color( 192, 193, 195 ),
            "StatusbarColor1" : VG.Core.Color( 225, 226, 228 ),
            "StatusbarColor2" : VG.Core.Color( 205, 205, 205 ),
            "StatusbarHeight" : 30,

            "ToolButtonFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "ToolButtonHoverColor1" : VG.Core.Color( 110, 119, 196 ),
            "ToolButtonHoverColor2" : VG.Core.Color( 62, 65, 72 ),
            "ToolButtonTextColor" : VG.Core.Color( 255, 255, 255 ),
            "ToolButtonDisabledTextColor" : VG.Core.Color( 98, 101, 108 ),
            "ToolButtonMinimumWidth" : 70,
            "ToolSeparatorColor" : VG.Core.Color( 70, 73, 82 ),

            "ToolPanelButtonHoverColor" : VG.Core.Color( 143, 158, 232 ),
            "ToolPanelButtonClickedColor" : VG.Core.Color( 100, 123, 236 ),
            "ToolPanelButtonTextColor" : VG.Core.Color( 255, 255, 255 ),
            "ToolPanelButtonDisabledTextColor" : VG.Core.Color( 98, 101, 108 ),
            "ToolPanelButtonMinimumWidth" : 45,
            "ToolPanelSeparatorColor" : VG.Core.Color( 124, 129, 139 ),            
            
            "TextEditBorderColor" : VG.Core.Color( 168, 173, 179 ),
            "TextEditDisabledBorderColor" : VG.Core.Color( 191, 197, 204 ),
            "TextEditTextColor" : VG.Core.Color( 102, 106, 115 ),
            "TextEditEmbeddedTextColor" : VG.Core.Color( 255, 255, 255 ),
            "TextEditDefaultTextColor" : VG.Core.Color( 153, 161, 172 ),
            "TextEditSelectionBackgroundColor" : VG.Core.Color( 132, 146, 234 ),

            "CodeEditFont" : VG.Font.Font( this.DefaultFontName, 13 ),
            "CodeEditTopBorderColor" : VG.Core.Color( 59, 65, 86 ),
            "CodeEditHeaderColor" : VG.Core.Color( 59, 65, 86 ),
            "CodeEditHeaderTextColor" : VG.Core.Color( 106, 114, 144 ),
            "CodeEditBackgroundColor" : VG.Core.Color( 64, 70, 93 ),
            "CodeEditSelectionBackgroundColor" : VG.Core.Color( 255, 255, 255, 120 ),
            "CodeEditSearchBackgroundColor" : VG.Core.Color( 215, 206, 175 ),
            "CodeEditTextColor" : VG.Core.Color( 240, 240, 240 ),
            //"CodeEditTextColor" : VG.Core.Color( 156, 165, 230 ),

            "HtmlViewTextColor" : VG.Core.Color( 102, 106, 115 ),
            "HtmlViewDefaultFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "HtmlViewDefaultBoldFont" : VG.Font.Font( this.DefaultBoldFontName, 15 ),
            "HtmlViewDefaultItalicFont" : VG.Font.Font( this.DefaultItalicFontName, 15 ),

            "ListWidgetBorderColor" : VG.Core.Color( 187, 190, 197 ),

            "ListWidgetBigItemHeight" : 39,
            "ListWidgetBigItemDistance" : 6,
            "ListWidgetBigItemFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "ListWidgetSmallItemHeight" : 23,
            "ListWidgetSmallItemDistance" : 4,
            "ListWidgetSmallItemFont" : VG.Font.Font( this.DefaultFontName, 13 ),
            "ListWidgetItemXOffset" : 10,     

            "ListWidgetItemBorderColor" : VG.Core.Color( 254, 255, 255 ),
            "ListWidgetItemTextColor" : VG.Core.Color( 105, 109, 120 ),
            "ListWidgetItemBackgroundColor" : VG.Core.Color( 238, 239, 243 ),
            "ListWidgetItemSelectedBorderColor" : VG.Core.Color( 67, 81, 155 ),
            "ListWidgetItemSelectedTextColor" : VG.Core.Color( 255, 255, 255 ),
            "ListWidgetItemSelectedBackgroundColor" : VG.Core.Color( 108, 120, 196 ),

            "TreeWidgetBorderColor" : VG.Core.Color( 187, 190, 197 ),
            "TreeWidgetSelectionBorderColor" : VG.Core.Color( 146, 161, 244 ),
            "TreeWidgetContentBorderSize" : VG.Core.Size( 14, 8 ),
            "TreeWidgetItemHeight" : 39,//23,            
            "TreeWidgetItemDistance" : 1,//4,            
            "TreeWidgetItemXOffset" : 10,

            "TreeWidgetItemFont" : VG.Font.Font( this.DefaultFontName, 13 ),
            "TreeWidgetItemColor" : VG.Core.Color( 102, 106, 115 ),
            "TreeWidgetArrowColor" : VG.Core.Color( 177, 182, 191 ),
            "TreeWidgetSelectedItemColor" : VG.Core.Color( 255, 255, 255 ),
            "TreeWidgetSelectedItemBackgroundColor" : VG.Core.Color( 132, 146, 234 ),
            "TreeWidgetSeparatorColor" : VG.Core.Color( 203, 207, 213 ),
            "TreeWidgetArrowSize" : VG.Core.Size( 6, 12 ),
            "TreeWidgetItemHierarchyOffset" : 25,

            "ScrollbarSize" : 8,    
            "ScrollbarColor" : VG.Core.Color( 169, 177, 189 ),    
            "ScrollbarClickedColor" : VG.Core.Color( 138, 153, 238 ),    
            "ScrollbarHoverColor" : VG.Core.Color( 108, 121, 197 ),    

            "ButtonFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "ButtonSmallFont" : VG.Font.Font( this.DefaultFontName, 12 ),
            "ButtonColor" : VG.Core.Color( 143, 149, 159 ),
            "ButtonTextColor" : VG.Core.Color( 255, 255, 255 ),
            "ButtonDisabledColor" : VG.Core.Color( 172, 179, 189 ),
            "ButtonDisabledTextColor" : VG.Core.Color( 192, 198, 206 ),
            "ButtonClickedColor" : VG.Core.Color( 138, 153, 238 ),
            "ButtonFocusColor" : VG.Core.Color( 108, 128, 240 ),
            "ButtonHoverColor" : VG.Core.Color( 108, 121, 197 ),
            "ButtonCheckedColor" : VG.Core.Color( 108, 125, 198 ),
            "ButtonUncheckedColor" : VG.Core.Color( 143, 149, 159 ),

            "PopupButtonFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "PopupButtonBorderColor" : VG.Core.Color( 172, 174, 178 ),
            "PopupButtonDisabledBorderColor" : VG.Core.Color( 180, 192, 206 ),
            "PopupButtonBackgroundColor" : VG.Core.Color( 187, 192, 199 ),
            "PopupButtonDisabledBackgroundColor" : VG.Core.Color( 210, 215, 221 ),
            "PopupButtonHighlightedTextColor" : VG.Core.Color( 255, 255, 255 ),
            "PopupButtonTextColor" : VG.Core.Color( 102, 106, 118 ),
            "PopupButtonDisabledTextColor" : VG.Core.Color( 180, 192, 207 ),
            "PopupButtonEmbeddedSelectioBorderColor" : VG.Core.Color( 255, 255, 255 ),
            "PopupButtonEmbeddedBackgroundColor" : VG.Core.Color( 133, 148, 231 ),
            "PopupButtonEmbeddedBorderColor" : VG.Core.Color( 159, 172, 244 ),

            "ToolPanelPopupButtonFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "ToolPanelPopupButtonHighlightedBackgroundColor" : VG.Core.Color( 142, 156, 235 ),
            "ToolPanelPopupButtonTextColor" : VG.Core.Color( 255, 255, 255 ),
            "ToolPanelPopupButtonDisabledTextColor" : VG.Core.Color( 180, 192, 207 ),            
            "ToolPanelPopupButtonBackgroundColor" : VG.Core.Color( 121, 127, 138 ),

            "CheckboxBorderColor" : VG.Core.Color( 172, 174, 178 ),
            "CheckboxDisabledBorderColor" : VG.Core.Color( 180, 192, 206 ),
            "CheckboxBackgroundColor" : VG.Core.Color( 187, 192, 199 ),
            "CheckboxDisabledBackgroundColor" : VG.Core.Color( 210, 215, 221 ),       

            "LayoutSeparatorColor" : VG.Core.Color( 194, 199, 205 ),
            "LayoutSeparatorSelectedColor" : VG.Core.Color( 136, 152, 245 ),
            "LayoutSeparatorDecorationColor" : VG.Core.Color( 168, 171, 176 ),

            "ContextMenuFont" : VG.Font.Font( "Roboto Regular", 14 ),
            "ContextMenuShortcutFont" : VG.Font.Font( "Roboto Regular", 11 ),            
            "ContextMenuBackgroundColor" : VG.Core.Color( 121, 127, 137 ),
            "ContextMenuHighlightedBackgroundColor" : VG.Core.Color( 159, 172, 246 ),
            "ContextMenuTextColor" : VG.Core.Color( 255, 255, 255 ),
            "ContextMenuDisabledTextColor" : VG.Core.Color( 135, 142, 153 ),
            "ContextMenuHighlightedTextColor" : VG.Core.Color( 255, 255, 255 ),
            "ContextMenuSeparatorColor" : VG.Core.Color( 135, 142, 153 ),

            "MenubarFont" : VG.Font.Font( "Roboto Regular", 15 ),
            "MenubarHeight" : 26,
            "MenubarBackgroundColor" : VG.Core.Color( 57, 59, 70 ),
            "MenubarSelectedBackgroundColor" : VG.Core.Color( 133, 148, 231 ),
            "MenubarTextColor" : VG.Core.Color( 183, 183, 183 ),
            "MenubarSelectedTextColor" : VG.Core.Color( 255, 255, 255 ),

            "MenuFont" : VG.Font.Font( "Roboto Regular", 14 ),
            "MenuShortcutFont" : VG.Font.Font( "Roboto Regular", 11 ),
            "MenuTopBorderColor" : VG.Core.Color( 40, 41, 48 ),
            "MenuSeparatorColor" : VG.Core.Color( 88, 89, 99 ),
            "MenuBackgroundColor" : VG.Core.Color( 76, 78, 89 ),
            "MenuDisabledTextColor" : VG.Core.Color( 135, 142, 153 ),
            "MenuHighlightedTextColor" : VG.Core.Color( 255, 255, 255 ),
            "MenuHighlightedBackgroundColor" : VG.Core.Color( 109, 128, 227 ),
            "MenuTextColor" : VG.Core.Color( 255, 255, 255 ),            

            "TableWidgetFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "TableWidgetHeaderFont" : VG.Font.Font( this.DefaultFontName, 13 ),
            "TableWidgetTextColor" : VG.Core.Color( 143, 149, 159 ),            
            "TableWidgetSeparatorColor" : VG.Core.Color( 168, 173, 179 ),    
            "TableWidgetDisabledSeparatorColor" : VG.Core.Color( 191, 197, 204 ),                    
            "TableWidgetSelectionColor" : VG.Core.Color( 133, 148, 232 ),            
            "TableWidgetSeparatorWidth" : 8,
            "TableWidgetContentMargin" : VG.Core.Margin( 10, 12, 10, 6 ),
            "TableWidgetHeaderSeparatorHeight" : 16,
            "TableWidgetFooterSeparatorHeight" : 16,
            "TableWidgetRowHeight" : 35,

            "TabWidgetFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "TabWidgetHeaderHeight" : 35,
            "TabWidgetTextColor" : VG.Core.Color( 255, 255, 255 ),             
            "TabWidgetBackgroundColor" : VG.Core.Color( 190, 193, 197 ),             
            "TabWidgetSelectedBackgroundColor" : VG.Core.Color( 145, 158, 235 ),     

            "SliderColor" : VG.Core.Color( 196, 197, 199 ),
            "SliderSelectionColor" : VG.Core.Color( 129, 147, 230 ),
            "SliderHandleColor" : VG.Core.Color( 108, 125, 216 ),
            "SliderFocusColor" : VG.Core.Color( 183, 194, 253 ),
            "SliderHandleSize" : 13,
            "SliderFocusSize" : 5,
            "SliderHeight" : 3,

            "ScrollerTextItemHeaderFont" : VG.Font.Font( this.DefaultBoldFontName, 36 ),
            "ScrollerTextItemContentFont" : VG.Font.Font( this.DefaultFontName, 17 ),
            "ScrollerImageItemHeaderFont" : VG.Font.Font( this.DefaultBoldFontName, 36 ),
            "ScrollerBackgroundColor" : VG.Core.Color( 255, 255, 255 ),
            "ScrollerHeaderTextColor" : VG.Core.Color( 82, 93, 124 ),

            NewsScroller : {
                "Margin" : VG.Core.Margin( 120, 0, 120, 0),
                "BackgroundColor" : VG.Core.Color( 255, 255, 255 ),
                Header : {
                    "Font" : VG.Font.Font( this.DefaultBoldFontName, 30 ),
                    "TextColor" : VG.Core.Color( "556088" ),
                    "Height" : 77,
                    "SeparatorColor" : VG.Core.Color( "#ebeaea" ),
                },
                Body : {
                    Item : {
                        Header : {
                            "Font" : VG.Font.Font( this.DefaultFontName, 20 ),
                            "TextColor" : VG.Core.Color( "#5a5c65" ),
                        },
                        Body: {
                            "Font" : VG.Font.Font( "Roboto Regular", 14 ),
                            "TextColor" : VG.Core.Color( "#898989" ),
                        },  
                        Date: {
                            "Font" : VG.Font.Font( "Roboto Regular", 12 ),
                            "TextColor" : VG.Core.Color( "#e57f56" ),
                        },
                        Footer: {
                            "Font" : VG.Font.Font( "Roboto Regular", 14 ),
                            "ActiveTextColor" : VG.Core.Color( "#e57f56" ),
                            "TextColor" : VG.Core.Color( "#666666" ),
                        },                                                                      
                        "ImageSize" : VG.Core.Size( 93, 85 ),
                    },
                    "Margin" : VG.Core.Margin( 0, 33, 0, 142 ),
                    "Spacing" : 40,
                }
            }
        };

      this.nightcall= {

            "name" : "Night Call (WiP)",

            "DefaultFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "DefaultBoldFont" : VG.Font.Font( this.DefaultBoldFontName, 15 ),
            "DefaultItalicFont" : VG.Font.Font( this.DefaultItalicFontName, 15 ),
            "LoginFont" : VG.Font.Font( this.DefaultFontName, 16 ),

            "WidgetBackgroundColor" : VG.Core.Color( 26, 34, 44 ),
            "WidgetTextColor" : VG.Core.Color( 130, 135, 149 ),
            "WidgetEmbeddedTextColor" : VG.Core.Color( 255, 255, 255 ),
            "WidgetDisabledTextColor" : VG.Core.Color( 102, 106, 118 ),
            "WidgetSelectionColor" : VG.Core.Color( 28, 130, 167 ),

            "WindowFocusHeaderColor" : VG.Core.Color( 108, 121, 196 ),
            "WindowBackgroundColor" : VG.Core.Color( 240, 243, 248 ),
            "WindowHeaderHeight" : 33,

            "WindowFocusHeaderColor" : VG.Core.Color( 108, 121, 196 ),
            "DialogBorderColor" : VG.Core.Color( 193, 197, 203 ),
            "DialogBackgroundColor" : VG.Core.Color( 221, 224, 229 ),
            "DialogTitleColor1" : VG.Core.Color( 233, 233, 233 ),
            "DialogTitleColor2" : VG.Core.Color( 193, 197, 205 ),
            "DialogTitleBorderColor" : VG.Core.Color( 193, 197, 203 ),

            "DockWidgetBackgroundColor" : VG.Core.Color( 46, 53, 61 ),
            "DockWidgetHeaderTextColor" : VG.Core.Color( 143, 149, 159 ),
            "DockWidgetHeaderFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "DockWidgetHeaderHeight" : 32,

            "DockWidgetFloatingBackgroundColor" : VG.Core.Color( 244, 247, 252 ),
            "DockWidgetFloatingBorderColor" : VG.Core.Color( 185, 188, 193 ),
            "DockWidgetFloatingSelectedBorderColor" : VG.Core.Color( 108, 121, 197 ),

            "DockStripWidgetFont" : VG.Font.Font( this.DefaultFontName, 16 ),
            "DockStripWidgetBorderColor" : VG.Core.Color( 80, 83, 92 ),
            "DockStripWidgetHoverColor" : VG.Core.Color( 180, 166, 73 ),
            "DockStripWidgetTextColor" : VG.Core.Color( 255, 255, 255 ),
            "DockStripWidgetBackgroundColor" : VG.Core.Color( 68, 71, 80 ),
            "DockStripWidgetHeaderHeight" : 1,

            "DockStripWidgetButtonMinimumWidth" : 55,

            "DockStripWidgetSeparatorHeight" : 1,
            "DockStripWidgetSeparatorColor" : VG.Core.Color( 86, 89, 97 ),
            
            "ToolbarColor" : VG.Core.Color( 44, 54, 63 ),
            "ToolbarHeight" : 52,
            "ToolbarLeftMargin" : 60,
            "ToolbarLogoColor" : VG.Core.Color(),
            "ToolbarLogoSize" : 35,

            "ToolPanelColor" : VG.Core.Color( 143, 149, 159 ),
            "ToolPanelHeight" : 36,

            "StatusbarBorderColor" : VG.Core.Color( 192, 193, 195 ),
            "StatusbarColor1" : VG.Core.Color( 225, 226, 228 ),
            "StatusbarColor2" : VG.Core.Color( 205, 205, 205 ),
            "StatusbarHeight" : 30,

            "ToolButtonFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "ToolButtonHoverColor1" : VG.Core.Color( 110, 119, 196 ),
            "ToolButtonHoverColor2" : VG.Core.Color( 62, 65, 72 ),
            "ToolButtonTextColor" : VG.Core.Color( 255, 255, 255 ),
            "ToolButtonDisabledTextColor" : VG.Core.Color( 98, 101, 108 ),
            "ToolButtonMinimumWidth" : 70,
            "ToolSeparatorColor" : VG.Core.Color( 70, 73, 82 ),

            "ToolPanelButtonHoverColor" : VG.Core.Color( 143, 158, 232 ),
            "ToolPanelButtonClickedColor" : VG.Core.Color( 100, 123, 236 ),
            "ToolPanelButtonTextColor" : VG.Core.Color( 255, 255, 255 ),
            "ToolPanelButtonDisabledTextColor" : VG.Core.Color( 98, 101, 108 ),
            "ToolPanelButtonMinimumWidth" : 45,
            "ToolPanelSeparatorColor" : VG.Core.Color( 124, 129, 139 ),            
            
            "TextEditBorderColor" : VG.Core.Color( 54, 65, 78 ),
            "TextEditDisabledBorderColor" : VG.Core.Color( 46, 54, 64 ),
            "TextEditTextColor" : VG.Core.Color( 99, 106, 116 ),
            "TextEditEmbeddedTextColor" : VG.Core.Color( 255, 255, 255 ),
            "TextEditDefaultTextColor" : VG.Core.Color( 153, 161, 172 ),
            "TextEditSelectionBackgroundColor" : VG.Core.Color( 132, 146, 234 ),

            "CodeEditFont" : VG.Font.Font( this.DefaultFontName, 13 ),
            "CodeEditTopBorderColor" : VG.Core.Color( 59, 65, 86 ),
            "CodeEditHeaderColor" : VG.Core.Color( 59, 65, 86 ),
            "CodeEditHeaderTextColor" : VG.Core.Color( 106, 114, 144 ),
            "CodeEditBackgroundColor" : VG.Core.Color( 64, 70, 93 ),
            "CodeEditSelectionBackgroundColor" : VG.Core.Color( 255, 255, 255, 120 ),
            "CodeEditSearchBackgroundColor" : VG.Core.Color( 215, 206, 175 ),
            "CodeEditTextColor" : VG.Core.Color( 240, 240, 240 ),
            //"CodeEditTextColor" : VG.Core.Color( 156, 165, 230 ),

            "HtmlViewTextColor" : VG.Core.Color( 102, 106, 115 ),
            "HtmlViewDefaultFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "HtmlViewDefaultBoldFont" : VG.Font.Font( this.DefaultBoldFontName, 15 ),
            "HtmlViewDefaultItalicFont" : VG.Font.Font( this.DefaultItalicFontName, 15 ),

            "ListWidgetBorderColor" : VG.Core.Color( 56, 65, 72 ),

            "ListWidgetBigItemHeight" : 39,
            "ListWidgetBigItemDistance" : 6,
            "ListWidgetBigItemFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "ListWidgetSmallItemHeight" : 23,
            "ListWidgetSmallItemDistance" : 4,
            "ListWidgetSmallItemFont" : VG.Font.Font( this.DefaultFontName, 13 ),
            "ListWidgetItemXOffset" : 10,     

            "ListWidgetItemBorderColor" : VG.Core.Color( 254, 255, 255 ),
            "ListWidgetItemTextColor" : VG.Core.Color( 105, 109, 120 ),
            "ListWidgetItemBackgroundColor" : VG.Core.Color( 238, 239, 243 ),
            "ListWidgetItemSelectedBorderColor" : VG.Core.Color( 67, 81, 155 ),
            "ListWidgetItemSelectedTextColor" : VG.Core.Color( 255, 255, 255 ),
            "ListWidgetItemSelectedBackgroundColor" : VG.Core.Color( 108, 120, 196 ),

            "TreeWidgetBorderColor" : VG.Core.Color( 187, 190, 197 ),
            "TreeWidgetContentBorderSize" : VG.Core.Size( 14, 8 ),
            "TreeWidgetItemHeight" : 39,//23,            
            "TreeWidgetItemDistance" : 1,//4,            
            "TreeWidgetItemXOffset" : 10,

            "TreeWidgetItemFont" : VG.Font.Font( this.DefaultFontName, 13 ),
            "TreeWidgetItemColor" : VG.Core.Color( 102, 106, 115 ),
            "TreeWidgetArrowColor" : VG.Core.Color( 177, 182, 191 ),
            "TreeWidgetSelectedItemColor" : VG.Core.Color( 255, 255, 255 ),
            "TreeWidgetSelectedItemBackgroundColor" : VG.Core.Color( 132, 146, 234 ),
            "TreeWidgetSeparatorColor" : VG.Core.Color( 203, 207, 213 ),
            "TreeWidgetArrowSize" : VG.Core.Size( 6, 12 ),
            "TreeWidgetItemHierarchyOffset" : 25,

            "ScrollbarSize" : 8,    
            "ScrollbarColor" : VG.Core.Color( 169, 177, 189 ),    
            "ScrollbarClickedColor" : VG.Core.Color( 138, 153, 238 ),    
            "ScrollbarHoverColor" : VG.Core.Color( 108, 121, 197 ),    

            "ButtonFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "ButtonSmallFont" : VG.Font.Font( this.DefaultFontName, 12 ),
            "ButtonColor" : VG.Core.Color( 143, 149, 159 ),
            "ButtonTextColor" : VG.Core.Color( 255, 255, 255 ),
            "ButtonDisabledColor" : VG.Core.Color( 172, 179, 189 ),
            "ButtonDisabledTextColor" : VG.Core.Color( 192, 198, 206 ),
            "ButtonClickedColor" : VG.Core.Color( 138, 153, 238 ),
            "ButtonFocusColor" : VG.Core.Color( 108, 128, 240 ),
            "ButtonHoverColor" : VG.Core.Color( 108, 121, 197 ),
            "ButtonCheckedColor" : VG.Core.Color( 108, 125, 198 ),
            "ButtonUncheckedColor" : VG.Core.Color( 143, 149, 159 ),

            "PopupButtonFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "PopupButtonBorderColor" : VG.Core.Color( 82, 92, 102 ),
            "PopupButtonDisabledBorderColor" : VG.Core.Color( 41, 49, 60 ),
            "PopupButtonBackgroundColor" : VG.Core.Color( 40, 50, 61 ),
            "PopupButtonDisabledBackgroundColor" : VG.Core.Color( 42, 54, 68 ),
            "PopupButtonHighlightedTextColor" : VG.Core.Color( 255, 255, 255 ),
            "PopupButtonTextColor" : VG.Core.Color( 102, 106, 118 ),
            "PopupButtonDisabledTextColor" : VG.Core.Color( 180, 192, 207 ),
            "PopupButtonEmbeddedSelectioBorderColor" : VG.Core.Color( 255, 255, 255 ),
            "PopupButtonEmbeddedBackgroundColor" : VG.Core.Color( 133, 148, 231 ),
            "PopupButtonEmbeddedBorderColor" : VG.Core.Color( 159, 172, 244 ),

            "ToolPanelPopupButtonFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "ToolPanelPopupButtonHighlightedBackgroundColor" : VG.Core.Color( 142, 156, 235 ),
            "ToolPanelPopupButtonTextColor" : VG.Core.Color( 255, 255, 255 ),
            "ToolPanelPopupButtonDisabledTextColor" : VG.Core.Color( 180, 192, 207 ),            
            "ToolPanelPopupButtonBackgroundColor" : VG.Core.Color( 121, 127, 138 ),

            "CheckboxBorderColor" : VG.Core.Color( 54, 65, 78 ),
            "CheckboxDisabledBorderColor" : VG.Core.Color( 46, 54, 64 ),
            "CheckboxBackgroundColor" : VG.Core.Color( 26, 34, 44 ),
            "CheckboxDisabledBackgroundColor" : VG.Core.Color( 26, 34, 44 ),       

            "LayoutSeparatorColor" : VG.Core.Color( 52, 63, 74 ),
            "LayoutSeparatorSelectedColor" : VG.Core.Color( 79, 130, 148 ),
            "LayoutSeparatorDecorationColor" : VG.Core.Color( 72, 86, 100 ),

            "ContextMenuFont" : VG.Font.Font( "Roboto Regular", 14 ),
            "ContextMenuShortcutFont" : VG.Font.Font( "Roboto Regular", 11 ),
            "ContextMenuBackgroundColor" : VG.Core.Color( 121, 127, 137 ),
            "ContextMenuHighlightedBackgroundColor" : VG.Core.Color( 159, 172, 246 ),
            "ContextMenuTextColor" : VG.Core.Color( 255, 255, 255 ),
            "ContextMenuDisabledTextColor" : VG.Core.Color( 135, 142, 153 ),
            "ContextMenuHighlightedTextColor" : VG.Core.Color( 255, 255, 255 ),
            "ContextMenuSeparatorColor" : VG.Core.Color( 135, 142, 153 ),

            "MenubarFont" : VG.Font.Font( "Roboto Regular", 15 ),
            "MenubarHeight" : 26,
            "MenubarBackgroundColor" : VG.Core.Color( 53, 63, 72 ),
            "MenubarSelectedBackgroundColor" : VG.Core.Color( 133, 148, 231 ),
            "MenubarTextColor" : VG.Core.Color( 183, 183, 183 ),
            "MenubarSelectedTextColor" : VG.Core.Color( 255, 255, 255 ),

            "MenuFont" : VG.Font.Font( "Roboto Regular", 14 ),
            "MenuShortcutFont" : VG.Font.Font( "Roboto Regular", 11 ),
            "MenuTopBorderColor" : VG.Core.Color( 40, 41, 48 ),
            "MenuSeparatorColor" : VG.Core.Color( 88, 89, 99 ),
            "MenuBackgroundColor" : VG.Core.Color( 76, 78, 89 ),
            "MenuDisabledTextColor" : VG.Core.Color( 135, 142, 153 ),
            "MenuHighlightedTextColor" : VG.Core.Color( 255, 255, 255 ),
            "MenuHighlightedBackgroundColor" : VG.Core.Color( 109, 128, 227 ),
            "MenuTextColor" : VG.Core.Color( 255, 255, 255 ), 

            "TableWidgetFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "TableWidgetHeaderFont" : VG.Font.Font( this.DefaultFontName, 13 ),
            "TableWidgetTextColor" : VG.Core.Color( 143, 149, 159 ),            
            "TableWidgetSeparatorColor" : VG.Core.Color( 168, 173, 179 ),    
            "TableWidgetDisabledSeparatorColor" : VG.Core.Color( 191, 197, 204 ),                    
            "TableWidgetSelectionColor" : VG.Core.Color( 133, 148, 232 ),            
            "TableWidgetSeparatorWidth" : 8,
            "TableWidgetContentMargin" : VG.Core.Margin( 10, 12, 10, 6 ),
            "TableWidgetHeaderSeparatorHeight" : 16,
            "TableWidgetFooterSeparatorHeight" : 16,
            "TableWidgetRowHeight" : 35,

            "TabWidgetFont" : VG.Font.Font( this.DefaultFontName, 15 ),
            "TabWidgetHeaderHeight" : 35,
            "TabWidgetTextColor" : VG.Core.Color( 255, 255, 255 ),             
            "TabWidgetBackgroundColor" : VG.Core.Color( 190, 193, 197 ),             
            "TabWidgetSelectedBackgroundColor" : VG.Core.Color( 145, 158, 235 ),     

            "SliderColor" : VG.Core.Color( 196, 197, 199 ),
            "SliderSelectionColor" : VG.Core.Color( 129, 147, 230 ),
            "SliderHandleColor" : VG.Core.Color( 108, 125, 216 ),
            "SliderFocusColor" : VG.Core.Color( 183, 194, 253 ),
            "SliderHandleSize" : 13,
            "SliderFocusSize" : 5,
            "SliderHeight" : 3,

            "ScrollerTextItemHeaderFont" : VG.Font.Font( this.DefaultBoldFontName, 36 ),
            "ScrollerTextItemContentFont" : VG.Font.Font( this.DefaultFontName, 17 ),
            "ScrollerImageItemHeaderFont" : VG.Font.Font( this.DefaultBoldFontName, 36 ),
            "ScrollerBackgroundColor" : VG.Core.Color( 255, 255, 255 ),
            "ScrollerHeaderTextColor" : VG.Core.Color( 82, 93, 124 )            
        };

    }

    this.skins.push( this.bluish );
    this.skins.push( this.nightcall );
    this.skin=this.bluish;
};

VG.Styles.VisualGraphics.prototype.drawSlider=function( canvas, slider )
{
    slider.sliderRect.set( slider.contentRect );
    
    var leftSpace=Math.ceil( this.skin.SliderHandleSize / 2 );
    slider.sliderRect.x+=leftSpace;
    slider.sliderRect.width-=leftSpace;
    slider.sliderRect.y=slider.sliderRect.y + (slider.sliderRect.height - this.skin.SliderHeight)/2;
    slider.sliderRect.height=this.skin.SliderHeight;

    var color, textColor, handleColor, selectionColor;

    if ( slider.disabled ) {
        color=this.skin.WidgetDisabledTextColor;
        textColor=this.skin.WidgetDisabledTextColor;
        selectionColor=this.skin.WidgetDisabledTextColor;
        handleColor=this.skin.WidgetDisabledTextColor;
    } else { 
        color=this.skin.SliderColor;
        textColor=this.skin.WidgetTextColor;        
        selectionColor=this.skin.SliderSelectionColor;
        handleColor=this.skin.SliderHandleColor;
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
    slider.sliderHandleRect.y=slider.contentRect.y + (slider.contentRect.height - this.skin.SliderHandleSize)/2;
    slider.sliderHandleRect.width=this.skin.SliderHandleSize;
    slider.sliderHandleRect.height=this.skin.SliderHandleSize;

    canvas.draw2DShape( VG.Canvas.Shape2D.Circle, slider.sliderHandleRect, handleColor );   

    if ( slider.visualState === VG.UI.Widget.VisualState.Focus ) {
        var focusRect=VG.Core.Rect();

        focusRect.x=slider.sliderHandleRect.x + (slider.sliderHandleRect.width - this.skin.SliderFocusSize ) / 2;
        focusRect.y=slider.sliderHandleRect.y + (slider.sliderHandleRect.height - this.skin.SliderFocusSize ) / 2;
        focusRect.width=this.skin.SliderFocusSize;
        focusRect.height=this.skin.SliderFocusSize;
        canvas.draw2DShape( VG.Canvas.Shape2D.Circle, focusRect, this.skin.SliderFocusColor );   
    }
};

VG.Styles.VisualGraphics.prototype.drawTabWidgetHeader=function( canvas, widget )
{
    canvas.pushFont( this.skin.TabWidgetFont );

    widget.contentRect.set( widget.rect );
    widget.rect.height=this.skin.TabWidgetHeaderHeight;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( widget.rect ), this.skin.TabWidgetBackgroundColor );

    // ---

    var availableSpacePerItem=widget.rect.width / widget.items.length;

    for ( var i=0; i < widget.items.length; ++i )
    {
        var item=widget.items[i];

        widget.rect.width=availableSpacePerItem;

        if ( item.object === widget.layout.current )
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( widget.rect ), this.skin.TabWidgetSelectedBackgroundColor );    
        canvas.drawTextRect( item.text, widget.rect, this.skin.TabWidgetTextColor, 1, 1 );

        item.x=widget.rect.x;
        item.width=widget.rect.width;

        widget.rect.x+=availableSpacePerItem;
    }

    // ---

    widget.rect.set( widget.contentRect );

    widget.contentRect.y+=this.skin.TabWidgetHeaderHeight;
    widget.contentRect.height-=this.skin.TabWidgetHeaderHeight;

    //canvas.drawTextRect( dock.text, rect.add( xBorderOffset, 0, -xBorderOffset, 0), this.skin.DockWidgetHeaderTextColor, 0, 1 );
    canvas.popFont();
};

VG.Styles.VisualGraphics.prototype.drawMenubar=function( canvas, menu )
{
    menu.contentRect.set( menu.rect );    
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, menu.contentRect, this.skin.MenubarBackgroundColor );  

    canvas.pushFont( this.skin.MenubarFont );

    var rect=new VG.Core.Rect( menu.rect );
    var size=new VG.Core.Size();

    for( var i=0; i < menu.items.length; ++i )
    {
        var item=menu.items[i];

        rect.x+=12;
        rect.width=canvas.getTextSize( item.text, size ).width + 2 * 12;

        if ( item === menu.active ) {
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect, this.skin.MenubarSelectedBackgroundColor );              
            canvas.drawTextRect( item.text, rect, this.skin.MenubarSelectedTextColor, 1, 1 );
        } else {
            canvas.drawTextRect( item.text, rect, this.skin.MenubarTextColor, 1, 1 );
        }

        item.rect.set( rect );
        rect.x+=size.width+12;
    }

    canvas.popFont();
};

VG.Styles.VisualGraphics.prototype.drawMenu=function( canvas, menu )
{
    canvas.pushFont( this.skin.MenuFont );

    menu.contentRect.x=menu.rect.x;
    menu.contentRect.y=menu.parent.rect.bottom();

    menu.contentRect.setSize( menu.calcSize() );

    var oldHeight=menu.contentRect.height;

    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, menu.contentRect, this.skin.MenuBackgroundColor ); 
    canvas.draw2DShape( VG.Canvas.Shape2D.DropShadow_NoTop7px, menu.contentRect, VG.Core.Color( 0, 0, 0 ) ); 

    menu.contentRect.height=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, menu.contentRect, this.skin.MenuTopBorderColor ); 
    menu.contentRect.y+=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, menu.contentRect, this.skin.MenuBackgroundColor ); 

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
                canvas.drawTextRect( item.text, itemRect.add( 10, 0, -10, 0), this.skin.MenuDisabledTextColor, 0, 1 );                
            } else
            if ( item === menu.selected )  {
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect, this.skin.MenuHighlightedBackgroundColor ); 
                canvas.drawTextRect( item.text, itemRect.add( 10, 0, -10, 0), this.skin.ContextMenuHighlightedTextColor, 0, 1 );
            } else {
                canvas.drawTextRect( item.text, itemRect.add( 10, 0, -10, 0), this.skin.MenuTextColor, 0, 1 );
            }

            if ( item.checkable && item.checked ) {
                var image=VG.context.imagePool.getImageByName( "menu_checkmark.png" );
                if ( image ) {    
                    canvas.drawImage( VG.Core.Point( itemRect.right() - image.width - 10, itemRect.y + (itemRect.height-image.height)/2), image );
                }                
            }

            if ( item.shortcut ) {
                canvas.pushFont( this.skin.MenuShortcutFont );

                var textColor=this.skin.MenuTextColor;
                if ( item.disabled ) textColor=this.skin.MenuDisabledTextColor;
                var shortCutSize=canvas.getTextSize( item.shortcut.text );
                canvas.drawTextRect( item.shortcut.text, VG.Core.Rect( itemRect.right() - shortCutSize.width - 10, itemRect.y, shortCutSize.width, itemRect.height ), textColor, 0, 1 );                             

                canvas.popFont();
            }          

            item._rect=itemRect;
            y+=itemHeight;
        } else {
            var sepRect=VG.Core.Rect( rect.x, y, rect.width, 1 ).round();
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, sepRect, this.skin.MenuSeparatorColor ); 

            y++;
        }      
    }

    this.itemHeight=itemHeight;

    canvas.popFont();        
};

VG.Styles.VisualGraphics.prototype.drawContextMenu=function( canvas, menu )
{
    canvas.pushFont( this.skin.ContextMenuFont );

    menu.contentRect.set( menu.rect.shrink(1,1) );

    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, menu.rect, this.skin.ContextMenuBackgroundColor ); 
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, menu.contentRect, this.skin.ContextMenuBackgroundColor ); 

    var itemHeight=canvas.getLineHeight() + 7;

    var rect=menu.contentRect;
    var y=menu.contentRect.y;

    for( var i=0; i < menu.items.length; ++i )
    {
        var item=menu.items[i];

        if ( !item.isSeparator ) {
            var itemRect=VG.Core.Rect( rect.x, y, rect.width, itemHeight ).round();

            if ( item.disabled ) {
                canvas.drawTextRect( item.text, itemRect.add( 10, 0, -10, 0), this.skin.ContextMenuDisabledTextColor, 0, 1 );                
            } else
            if ( item === menu.selected )  {
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect, this.skin.ContextMenuHighlightedBackgroundColor ); 
                canvas.drawTextRect( item.text, itemRect.add( 10, 0, -10, 0), this.skin.ContextMenuHighlightedTextColor, 0, 1 );
            } else {
                canvas.drawTextRect( item.text, itemRect.add( 10, 0, -10, 0), this.skin.ContextMenuTextColor, 0, 1 );
            }

            if ( item.checkable && item.checked ) {
                var image=VG.context.imagePool.getImageByName( "menu_checkmark.png" );
                if ( image ) {    
                    canvas.drawImage( VG.Core.Point( itemRect.right() - image.width - 10, itemRect.y + (itemRect.height-image.height)/2), image );
                }                
            }

            if ( item.shortcut ) {
                canvas.pushFont( this.skin.ContextMenuShortcutFont );

                var textColor=this.skin.ContextMenuTextColor;
                if ( item.disabled ) textColor=this.skin.ContextMenuDisabledTextColor;
                var shortCutSize=canvas.getTextSize( item.shortcut.text );
                canvas.drawTextRect( item.shortcut.text, VG.Core.Rect( itemRect.right() - shortCutSize.width - 10, itemRect.y, shortCutSize.width, itemRect.height ), textColor, 0, 1 );
                canvas.popFont();
            }                

            item._rect=itemRect;
            y+=itemHeight;            
        } else {
            var sepRect=VG.Core.Rect( rect.x, y, rect.width, 1 ).round();
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, sepRect, this.skin.ContextMenuSeparatorColor ); 

            y++;
        }      
    }

    this.itemHeight=itemHeight;

    canvas.popFont();        
};

VG.Styles.VisualGraphics.prototype.drawToolbar=function( canvas, toolbar )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, toolbar.rect, this.skin.ToolbarColor );
};

VG.Styles.VisualGraphics.prototype.drawToolPanel=function( canvas, panel )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( panel.rect.x, panel.rect.y, panel.rect.width, this.skin.ToolPanelHeight ), this.skin.ToolPanelColor );
};

VG.Styles.VisualGraphics.prototype.drawStatusbar=function( canvas, statusbar )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( 0, statusbar.rect.y, statusbar.rect.width, statusbar.rect.height ), this.skin.StatusbarBorderColor );
    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, VG.Core.Rect( 0, statusbar.rect.y + 1, statusbar.rect.width, statusbar.rect.height ), 
                        this.skin.StatusbarColor1, this.skin.StatusbarColor2 );    
};

VG.Styles.VisualGraphics.prototype.drawToolButton=function( canvas, button )
{
    if ( button.visualState === VG.UI.Widget.VisualState.Hover ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, button.contentRect.add( 0, 0, 0, -button.contentRect.height+3 ), this.skin.ToolButtonHoverColor1 );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, button.contentRect.add( 0, 3, 0, -3), this.skin.ToolButtonHoverColor2 );
    }

    if ( !button.iconName )
    {
        canvas.pushFont( this.skin.ToolButtonFont );

        if ( !button.disabled )
            canvas.drawTextRect( button.text, button.contentRect, VG.context.style.skin.ToolButtonTextColor );
        else
            canvas.drawTextRect( button.text, button.contentRect, VG.context.style.skin.ToolButtonDisabledTextColor );         

        canvas.popFont();
    } else
    {
        if ( !button.icon ) button.icon=VG.context.imagePool.getImageByName( button.iconName );
        if ( button.icon ) 
        {
            var x=button.contentRect.x + (button.contentRect.width - button.icon.width)/2;
            var y=button.contentRect.y + (button.contentRect.height - button.icon.height)/2;

            if ( button.disabled )
            {
                if ( !button.disabledIcon )
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
    if ( button.disabled ) return;
    if ( button.mouseIsDown ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, button.contentRect, this.skin.ToolPanelButtonClickedColor );
    else if ( button.visualState === VG.UI.Widget.VisualState.Hover ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, button.contentRect, this.skin.ToolPanelButtonHoverColor );
    }
};

VG.Styles.VisualGraphics.prototype.drawToolSeparator=function( canvas, separator )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( separator.contentRect.x, separator.contentRect.y, 2, separator.contentRect.bottom() ), this.skin.ToolSeparatorColor );
};

VG.Styles.VisualGraphics.prototype.drawToolPanelSeparator=function( canvas, separator )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( separator.contentRect.x, separator.contentRect.y, 1, separator.contentRect.height ), this.skin.ToolPanelSeparatorColor );
};

VG.Styles.VisualGraphics.prototype.drawDockWidgetHeader=function( canvas, dock, rect)
{
    var xBorderOffset=8;

    canvas.pushFont( this.skin.DockWidgetHeaderFont );
    canvas.drawTextRect( dock.text, rect.add( xBorderOffset, 0, -xBorderOffset, 0), this.skin.DockWidgetHeaderTextColor, 0, 1 );
    canvas.popFont();

    var lrect=VG.Core.Rect( rect.right() - 15 -xBorderOffset, rect.y + 10, 15, 2 );

    var imageName;

    if ( dock.dragOp ) imageName="dock_handle_drag.png"
    else imageName="dock_handle_normal.png"

    var image=VG.context.imagePool.getImageByName( imageName );
    if ( image ) canvas.drawImage( VG.Core.Point( rect.right() -xBorderOffset - image.width, rect.y + (rect.height-image.height)/2), image );
    
/*
    var color;

    if ( dock.dragOp ) color=this.skin.WidgetSelectionColor;
    else color=this.skin.DockWidgetHeaderTextColor;

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, lrect, color );
    lrect.y+=5;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, lrect, color );
    lrect.y+=5;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, lrect, color );*/
};

VG.Styles.VisualGraphics.prototype.drawTextEditBorder=function( canvas, edit )
{
    if ( !edit.embedded )
    {
        if ( edit.disabled ) canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, edit.rect, this.skin.TextEditDisabledBorderColor );
        else
        {
            if ( edit.visualState === VG.UI.Widget.VisualState.Focus ) {
                canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, edit.rect, this.skin.WidgetSelectionColor );
            } else {
                canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, edit.rect, this.skin.TextEditBorderColor )        
            }
        }
        edit.contentRect=edit.rect.shrink( 1, 1 );
    } else edit.contentRect.set( edit.rect );
};

VG.Styles.VisualGraphics.prototype.drawListWidgetBorder=function( canvas, widget )
{    
    if ( widget.visualState !== VG.UI.Widget.VisualState.Focus )
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, widget.rect, this.skin.ListWidgetBorderColor )
    else
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, widget.rect, this.skin.WidgetSelectionColor );
    
    widget.contentRect=widget.rect.add( 1, 1, -2, -2 );
};

VG.Styles.VisualGraphics.prototype.drawListWidgetItem=function( canvas, item, selected, rect )
{
    if ( !selected ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, rect, this.skin.ListWidgetItemBorderColor )
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect.add( 1, 1, -2, -2), this.skin.ListWidgetItemBackgroundColor );
        canvas.drawTextRect( item.text, rect.add( this.skin.ListWidgetItemXOffset, 0, -this.skin.ListWidgetItemXOffset - 2, 0), this.skin.ListWidgetItemTextColor, 0, 1 );
    } else {
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, rect, this.skin.ListWidgetItemSelectedBorderColor )
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect.add( 1, 1, -2, -2), this.skin.ListWidgetItemSelectedBackgroundColor );
        canvas.drawTextRect( item.text, rect.add( this.skin.ListWidgetItemXOffset, 0, -this.skin.ListWidgetItemXOffset - 2, 0), this.skin.ListWidgetItemSelectedTextColor, 0, 1 );
    }
};

VG.Styles.VisualGraphics.prototype.drawScrollbar=function( canvas, scrollBar, adjustAlpha )
{
    var color;

    if (  VG.context.workspace.mouseTrackerWidget === scrollBar )
        color=this.skin.ScrollbarClickedColor;
    else 
    if ( scrollBar.visualState === VG.UI.Widget.VisualState.Hover )
        color=this.skin.ScrollbarHoverColor;
    else
    {
        if ( adjustAlpha ) canvas.setAlpha( 0.3 ); 
        color=this.skin.ScrollbarColor;
    }

    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, scrollBar.handleRect, color );
    if ( adjustAlpha ) canvas.setAlpha( 1.0 ); 
};

VG.Styles.VisualGraphics.prototype.drawButton=function( canvas, button )
{
    var buttonRect;

    if ( button.visualState === VG.UI.Widget.VisualState.Focus ) {
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, button.contentRect, this.skin.ButtonFocusColor );        
        buttonRect=button.contentRect.add( 2, 2, -4, -4 );
    }  else buttonRect=button.contentRect;

    var color;

    if ( !button.disabled ) {
        if ( !button.mouseIsDown ) {

            if ( button.visualState === VG.UI.Widget.VisualState.Hover ) {
                color=this.skin.ButtonHoverColor;
            } else {
                color=this.skin.ButtonColor;
            }
            
            if ( button.checkable && button.checked )
                canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, buttonRect, this.skin.ButtonCheckedColor );
            else
            if ( button.checkable && !button.checked )
                canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, buttonRect, this.skin.ButtonUncheckedColor );
            else
            if ( button.visualState === VG.UI.Widget.VisualState.Focus )
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, buttonRect, color );
            else
                canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, buttonRect, color );
        } else {
            color=this.skin.ButtonClickedColor;

            if ( button.visualState === VG.UI.Widget.VisualState.Hover )
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, buttonRect, color );
            else canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, buttonRect, color );
        }
    } else {
        color=this.skin.ButtonDisabledColor;     

        if ( button.visualState === VG.UI.Widget.VisualState.Hover )
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, buttonRect, color );
        else canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, buttonRect, color );
    }

    if ( button.big ) canvas.pushFont( this.skin.ButtonFont );
    else canvas.pushFont( this.skin.ButtonSmallFont );

    if ( !button.iconName ) {
        if ( !button.disabled )
            canvas.drawTextRect( button.text, button.contentRect, this.skin.ButtonTextColor );    
        else
            canvas.drawTextRect( button.text, button.contentRect, this.skin.ButtonDisabledTextColor );    
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

        if ( frame.visualState === VG.UI.Widget.VisualState.Focus ) color=this.skin.WidgetSelectionColor;
        else color=this.skin.TextEditBorderColor;
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, frame.rect, color );

        frame.contentRect=frame.contentRect.shrink( 1, 1 );
    }
};

VG.Styles.VisualGraphics.prototype.drawPopupButton=function( canvas, button )
{
    var borderColor;

    canvas.pushFont( this.skin.PopupButtonFont );

    if ( button.embeddedSelection ) borderColor=this.skin.PopupButtonEmbeddedSelectioBorderColor;
    else
    if ( button.disabled ) borderColor=this.skin.PopupButtonDisabledBorderColor;
    else {
        if ( button.visualState !== VG.UI.Widget.VisualState.Focus )
            borderColor=this.skin.PopupButtonBorderColor;
        else borderColor=this.skin.WidgetSelectionColor;    
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
        if ( !button.embedded ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, button.rect.add( 1, 1, -2, -2), this.skin.PopupButtonDisabledBackgroundColor );
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( button.rect.right()-25, button.rect.y+1, 1, button.rect.height-1 ), borderColor );
        canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, VG.Core.Rect( button.rect.right()-17, button.rect.y+11, 10, 5 ), this.skin.PopupButtonDisabledTextColor );
    } else
    {
        if ( !button.embedded ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, button.rect.add( 1, 1, -2, -2), this.skin.PopupButtonBackgroundColor );
        else if ( button.embeddedSelection ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, button.rect.add( 1, 1, -2, -2), this.skin.PopupButtonEmbeddedBackgroundColor );

        if ( button.embeddedSelection ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( button.rect.right()-25, button.rect.y+1, 1, button.rect.height-1 ), borderColor ); 
        else canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( button.rect.right()-25, button.rect.y+1, 1, button.rect.height-1 ), this.skin.PopupButtonBorderColor );
     
        if ( !button.embeddedSelection && button.embedded )
            canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, VG.Core.Rect( button.rect.right()-17, button.rect.y+11, 10, 5 ), this.skin.PopupButtonTextColor );
        else canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, VG.Core.Rect( button.rect.right()-17, button.rect.y+11, 10, 5 ), this.skin.PopupButtonHighlightedTextColor );
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
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, popupRect.add( 1, 1, -2, -2 ), this.skin.PopupButtonBackgroundColor );
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( button.rect.x+1, button.rect.y+button.rect.height-1, button.rect.width-2, 1), this.skin.PopupButtonBorderColor );
        } else { 
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, popupRect.add( 1, 1, -2, -2 ), this.skin.PopupButtonEmbeddedBackgroundColor );
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( button.rect.x+1, button.rect.y+button.rect.height-1, button.rect.width-2, 1), this.skin.PopupButtonEmbeddedSelectioBorderColor );
        }

        // --- Draw the popup text items

        for( var i=0; i < button.items.length; ++i )
        {
            var itemRect=VG.Core.Rect( popupRect.x, popupRect.y + i * itemHeight, popupRect.width, itemHeight );

            var color;

            if ( i === button.index ) color=this.skin.PopupButtonHighlightedTextColor;
            else color=this.skin.PopupButtonTextColor;

            canvas.drawTextRect( button.items[i], itemRect.add( 10, 0, -10, 0), color, 0, 1 );
            
            if ( i < button.items.length - 1 )
            {
                if ( !button.embedded )
                    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( itemRect.x+1, itemRect.bottom()-1, itemRect.width-2, 1 ).round(), this.skin.PopupButtonBorderColor );            
                else canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( itemRect.x+1, itemRect.bottom()-1, itemRect.width-2, 1 ).round(), this.skin.PopupButtonEmbeddedBorderColor );            
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
        if ( button.disabled ) canvas.drawTextRect( button.items[button.index], button.contentRect.add( 10, 0, -10, 0), this.skin.PopupButtonDisabledTextColor, 0, 1 );    
        else {
            if ( !button.embeddedSelection && button.embedded ) {
                canvas.drawTextRect( button.items[button.index], button.contentRect.add( 10, 0, -10, 0), this.skin.PopupButtonTextColor, 0, 1 );    
            }
            else canvas.drawTextRect( button.items[button.index], button.contentRect.add( 10, 0, -10, 0), this.skin.PopupButtonHighlightedTextColor, 0, 1 );    
        }
    }
    canvas.popFont();    
};

VG.Styles.VisualGraphics.prototype.drawToolPanelPopupButton=function( canvas, button )
{
    var borderColor;

    canvas.pushFont( this.skin.ToolPanelPopupButtonFont );

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

        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, popupRect, this.skin.ToolPanelPopupButtonBackgroundColor );

        button.popupRect=popupRect;
        button.itemHeight=itemHeight;

        // --- Draw the popup text items

        for( var i=0; i < button.items.length; ++i )
        {
            var itemRect=VG.Core.Rect( popupRect.x, popupRect.y + i * itemHeight, popupRect.width, itemHeight );

            var color;

            if ( i === button.index ) 
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect, this.skin.ToolPanelPopupButtonHighlightedBackgroundColor );

            canvas.drawTextRect( button.items[i], itemRect.add( 10, 0, -10, 0), this.skin.ToolPanelPopupButtonTextColor, 0, 1 );
            
            if ( i < button.items.length - 1 )
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( itemRect.x, itemRect.bottom()-1, itemRect.width, 1 ), this.skin.ToolPanelColor );
        }        
    }

    if ( this.index !== -1 )
    {
        if ( button.disabled ) {
            canvas.drawTextRect( button.items[button.index], button.contentRect.add( 10, 0, -10, 0), this.skin.ToolPanelPopupButtonDisabledTextColor, 0, 1 );    
            canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, VG.Core.Rect( button.rect.right()-20, button.rect.y+14, 12, 6 ), this.skin.ToolPanelPopupButtonDisabledTextColor );
        }
        else  {
            canvas.drawTextRect( button.items[button.index], button.contentRect.add( 10, 0, -10, 0), this.skin.ToolPanelPopupButtonTextColor, 0, 1 );    
            canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, VG.Core.Rect( button.rect.right()-20, button.rect.y+14, 12, 6 ), this.skin.ToolPanelPopupButtonTextColor );
        }
    }
    canvas.popFont();    
};


VG.Styles.VisualGraphics.prototype.drawWindow=function( canvas, window )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( window.rect.x, window.rect.y, window.rect.width, this.skin.WindowHeaderHeight ), this.skin.WindowFocusHeaderColor );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, window.contentRect, this.skin.WindowBackgroundColor );

    var titleTextRect=VG.Core.Rect( window.rect.x+10, window.rect.y, window.rect.width, this.skin.WindowHeaderHeight );
    canvas.drawTextRect( window.text, titleTextRect, VG.Core.Color( 244, 244, 244 ), 0, 1 );    
};

VG.Styles.VisualGraphics.prototype.drawDialog=function( canvas, dialog )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, dialog.rect, this.skin.DialogBorderColor );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, dialog.rect.shrink(1,1), this.skin.DialogBackgroundColor );

    var titleRect=VG.Core.Rect( dialog.rect.x+1, dialog.rect.y+1, dialog.rect.width-2, this.skin.WindowHeaderHeight-2 );
    canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, titleRect, this.skin.DialogTitleColor1, this.skin.DialogTitleColor2 );

    titleRect.x+=10;
    canvas.drawTextRect( dialog.text, titleRect, this.skin.WidgetTextColor, 0, 1 );  

    titleRect.x=dialog.rect.x+1;
    titleRect.y+=this.skin.WindowHeaderHeight-2;
    titleRect.height=1;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, titleRect, this.skin.DialogTitleBorderColor );

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
        dialog.closeImage.rect.set( dialog.rect.right() - 12 - dialog.closeImage.image.width, dialog.rect.y + (this.skin.WindowHeaderHeight - dialog.closeImage.image.height)/2, 
            dialog.closeImage.image.width, dialog.closeImage.image.height );
        dialog.closeImage.paintWidget( canvas );
    }

    // ---

    dialog.contentRect.set( dialog.rect.x+1, dialog.rect.y + this.skin.WindowHeaderHeight + 1, dialog.rect.width-1, dialog.rect.height - this.skin.WindowHeaderHeight );  
};

VG.Styles.VisualGraphics.prototype.drawSplitHandle=function( canvas, layout, pos, itemRect, childRect, dragging )
{
    var color;

    if ( dragging == false ) color=this.skin.LayoutSeparatorColor;
    else color=this.skin.LayoutSeparatorSelectedColor;

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
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect, this.skin.LayoutSeparatorDecorationColor );

        itemRect[layout.secondaryCoord]+=4;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect, this.skin.LayoutSeparatorDecorationColor );

        itemRect[layout.secondaryCoord]+=4;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, itemRect, this.skin.LayoutSeparatorDecorationColor );

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

    if ( box.disabled ) borderColor=this.skin.CheckboxDisabledBorderColor;
    else {
        if ( box.visualState !== VG.UI.Widget.VisualState.Focus )
            borderColor=this.skin.CheckboxBorderColor;
        else borderColor=this.skin.WidgetSelectionColor;    
    }    

    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, box.contentRect, borderColor );   

    if ( box.disabled ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, box.contentRect.add( 1, 1, -2, -2), this.skin.CheckboxDisabledBackgroundColor );
    else canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, box.contentRect.add( 1, 1, -2, -2), this.skin.CheckboxBackgroundColor );

    if ( box.checked )
    {
        var image=VG.context.imagePool.getImageByName( "checkmark.png" );
        if ( image ) {    
            canvas.drawImage( VG.Core.Point( box.rect.x + (box.rect.width-image.width)/2, box.rect.y + (box.rect.height-image.height)/2), image );
        }
    }
};

VG.Styles.VisualGraphics.prototype.drawDockWidget=function( canvas, dock )
{
    if ( dock.location < VG.UI.DockWidgetLocation.Floating ) 
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, dock.rect, this.skin.DockWidgetBackgroundColor );
    else
    {
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, dock.rect, this.skin.DockWidgetFloatingBackgroundColor );        

        if ( dock.visualState === VG.UI.Widget.VisualState.Focus )
            canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, dock.rect, this.skin.DockWidgetFloatingSelectedBorderColor );
        else canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, dock.rect, this.skin.DockWidgetFloatingBorderColor );  
    }

    this.drawDockWidgetHeader( canvas, dock, VG.Core.Rect( dock.rect.x, dock.rect.y, dock.rect.width, this.skin.DockWidgetHeaderHeight ) );
    dock.contentRect.set( dock.rect.add( 0, this.skin.DockWidgetHeaderHeight, 0, -this.skin.DockWidgetHeaderHeight ) );    
};

VG.Styles.VisualGraphics.prototype.drawDockStripWidget=function( canvas, dock )
{
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( dock.rect.x, dock.rect.y, dock.rect.width, this.skin.DockStripWidgetHeaderHeight ), this.skin.DockStripWidgetBorderColor);
};

VG.Styles.VisualGraphics.prototype.drawTreeWidgetBorder=function( canvas, widget )
{    
    if ( widget.noFocusDrawing ) 
    {
        widget.contentRect.set( widget.rect );
        return;
    }

    if ( widget.visualState !== VG.UI.Widget.VisualState.Focus )
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, widget.rect, this.skin.TreeWidgetBorderColor )
    else
        canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangleOutline1px, widget.rect, this.skin.TreeWidgetSelectionBorderColor );

    widget.contentRect=widget.rect.add( 1, 1, -2, -2 );
};

VG.Styles.VisualGraphics.prototype.drawTreeWidgetItem=function( canvas, item, selected, rect, contentRect )
{
    canvas.pushFont( this.skin.TreeWidgetItemFont );
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
        var arrowColor=this.skin.TreeWidgetArrowColor;
        var color=this.skin.TreeWidgetItemColor;
        if ( selected ) 
        {
            canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, VG.Core.Rect( contentRect.x - this.skin.TreeWidgetContentBorderSize.width + 4, rect.y, 
                contentRect.width + 2*this.skin.TreeWidgetContentBorderSize.width - 8, rect.height ), this.skin.TreeWidgetSelectedItemBackgroundColor );                    
            color=this.skin.TreeWidgetSelectedItemColor;
            arrowColor=this.skin.TreeWidgetSelectedItemColor;
        }

        if ( !item.open ) {
            var yOffset=rect.y + (rect.height - this.skin.TreeWidgetArrowSize.height) / 2;
            canvas.draw2DShape( VG.Canvas.Shape2D.ArrowRight, VG.Core.Rect( rect.x + 4, yOffset, this.skin.TreeWidgetArrowSize.width, this.skin.TreeWidgetArrowSize.height ), arrowColor );        

            arrowOffset=this.skin.TreeWidgetArrowSize.height + 8;

            if ( item.icon ) 
            {
                var y=rect.y + (rect.height - item.icon.height)/2;
                canvas.drawImage( VG.Core.Point( rect.x + arrowOffset, y ), item.icon );

                arrowOffset+=item.icon.width + 8;
            }

            canvas.drawTextRect( item.text, rect.add( arrowOffset, 0, -arrowOffset, 0), color, 0, 1 );        
        } else
        {
            var yOffset=rect.y + (rect.height - this.skin.TreeWidgetArrowSize.width) / 2;
            canvas.draw2DShape( VG.Canvas.Shape2D.FlippedTriangle, VG.Core.Rect( rect.x, yOffset, this.skin.TreeWidgetArrowSize.height, this.skin.TreeWidgetArrowSize.width ), arrowColor );        

            arrowOffset=this.skin.TreeWidgetArrowSize.height + 8;

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
            canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, VG.Core.Rect( contentRect.x - this.skin.TreeWidgetContentBorderSize.width + 4, rect.y, 
                contentRect.width + 2*this.skin.TreeWidgetContentBorderSize.width - 8, rect.height ), this.skin.TreeWidgetSelectedItemBackgroundColor );                    

            var offset=0;
            if ( item.icon ) 
            {
                var y=rect.y + (rect.height - item.icon.height)/2;
                canvas.drawImage( VG.Core.Point( rect.x, y ), item.icon );

                offset=item.icon.width + 8;
            }

            canvas.drawTextRect( item.text, rect.add( offset, 0, -offset, 0 ), this.skin.TreeWidgetSelectedItemColor, 0, 1 );  
        } else
        {
            var offset=0;
            if ( item.icon ) 
            {
                var y=rect.y + (rect.height - item.icon.height)/2;
                canvas.drawImage( VG.Core.Point( rect.x, y ), item.icon );

                offset=item.icon.width + 8;
            }

            canvas.drawTextRect( item.text, rect.add( offset, 0, -offset, 0), this.skin.TreeWidgetItemColor, 0, 1 );  
        }
    }

    canvas.popFont();
};

VG.Styles.VisualGraphics.prototype.drawTableWidgetSeparator=function( canvas, separator )
{
    var color;
    if ( !separator.disabled ) color=this.skin.TableWidgetSeparatorColor;
    else color=this.skin.TableWidgetDisabledSeparatorColor;

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( separator.contentRect.x, separator.contentRect.y, 1, separator.contentRect.height ), color );
};

VG.Styles.VisualGraphics.prototype.drawTableWidgetHeaderSeparator=function( canvas, widget )
{
    var color;
    if ( !widget.disabled ) color=this.skin.TableWidgetSeparatorColor;
    else color=this.skin.TableWidgetDisabledSeparatorColor;

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( widget.headerLayout.rect.x, widget.headerLayout.rect.bottom() + this.skin.TableWidgetHeaderSeparatorHeight / 2, 
        widget.headerLayout.rect.width, 1 ), color );
};

VG.Styles.VisualGraphics.prototype.drawTableWidgetFooterSeparator=function( canvas, widget )
{
    var color;
    if ( !widget.disabled ) color=this.skin.TableWidgetSeparatorColor;
    else color=this.skin.TableWidgetDisabledSeparatorColor;

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( widget.footerLayout.rect.x, widget.footerLayout.rect.y - this.skin.TableWidgetFooterSeparatorHeight/2, 
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

VG.context.style=new VG.Styles.VisualGraphics();

