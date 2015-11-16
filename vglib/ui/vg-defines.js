/*
 * Copyright (c) 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>
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

VG.UI = {};

VG.UI.HAlignment={ "Left" : 0, "Centered" : 1, "Right" : 2 };
VG.UI.VAlignment={ "Top" : 0, "Centered" : 1, "Bottom" : 2 };

VG.UI.DataCollectionRole={ "LoadSaveRole" : 1, "UndoRedoRole" : 2, "Docs.Enum" : -1 };
VG.UI.CallbackType={ "New" : 0, "UndoRedo" : 1, "Open" : 2, "Save" : 3, "LoggedStateChanged" : 4, "Docs.Enum" : -1 };

VG.UI.DockWidgetLocation={ "Left" : 0, "Right" : 1, "Floating" : 2, "Docs.Enum" : -1 };

VG.UI.ActionItemRole={ "None" : 0, "New" : 1, "Open" : 2, "Save" : 3, "SaveAs" : 4, "Undo" : 5, "Redo" : 6, "Open_Local" : 7, "Cut" : 8, "Copy" : 9, "Paste" : 10, "Delete" : 11, "SelectAll" : 12, 
	"Login" : 13, "Signup" : 14, "UserTool" : 15, "QuickMenu" : 16, "Docs.Enum" : -1 };

VG.UI.MaxLayoutSize=32768;

VG.UI.TableWidgetItemType={ "Label" : 0, "TextLineEdit" : 1, "PopupButton" : 2 };

VG.UI.FileDialog={ 
	"Image" : 0,
	"Text" : 1,
	"Project" : 2,
	"Binary" : 3,
	"Docs.Enum" : -1
};

// --- Styles

VG.Styles={};
VG.Styles.pool=[];

// --------------------------------------------- VG.Core.StyleSkinPool

VG.UI.StylePool=function()
{  
	if ( !(this instanceof VG.UI.StylePool) ) return new VG.UI.StylePool();
    this.styles=[];
}

// --- addStyle

VG.UI.StylePool.prototype.addStyle=function( style )
{
	this.styles.push( style );

	if ( !this.current ) this.current=style;
};

// --- getImageByName

VG.UI.StylePool.prototype.getStyleByName=function( name )
{
    for( var i=0; i < this.styles.length; ++i ) {
        if ( this.styles[i].name == name )
            return this.styles[i];
    }

    return null;
};

VG.UI.stylePool=new VG.UI.StylePool();

