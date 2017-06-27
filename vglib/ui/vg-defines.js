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

/**
 * Contains all UI related classes.
 * @namespace
 */

VG.UI = {};

/**
 * Horizontal alignment options.
 * @enum {number}
 * @type {number}
 */

VG.UI.HAlignment={ /** Left aligned */ "Left" : 0, /** Centered */ "Centered" : 1, /** Right aligned */ "Right" : 2 };

/**
 * Vertical alignment options.
 * @enum
 * @type {number}
 */

VG.UI.VAlignment={ /** Top aligned */ "Top" : 0, /** Centered */ "Centered" : 1, /** Bottom aligned */ "Bottom" : 2 };

VG.UI.DataCollectionRole={ "LoadSaveRole" : 1, "UndoRedoRole" : 2 };

/**
 * The different callback types which can be registered via {@link VG.UI.Workspace.registerCallback} and get called when the specified action is triggered
 * inside the Visual Graphics model.
 * @enum
 */
VG.UI.CallbackType={ /** @type {callback} Called when a New operation is triggered by the user. */ "New" : 0,
	/**  @type {callback} Called when an Undo/Redo operation is triggered by the user. A single argument is passed to the callback with the undo/redo path. Only needed if the app needs some special UI updates for certain paths. */"UndoRedo" : 1,
	/**  @type {callback} Called when the user selects open. This overrides the default Model behavior. Data to read into the app state is passed to the callback. */"Open" : 2,
	/**  @type {callback} Called when the user selects save. This overrides the default Model behavior. Data to save needs to be returned by this callback. */ "Save" : 3,
	/**  @type {callback} Called when the user logged state changes, i.e. logged in / logged out. Read out the arguments for details. */ "LoggedStateChanged" : 4,
	/**  @type {callback} Called before a new operation, gives the application to confirm cancel. The callback has a function pointer as argument which the app should call to confirm the new operation. */ "ConfirmNew" : 5,
	/**  @type {callback} Called when the application gains or looses focus. The function parameter will be true if the app gains focus and false if the application looses focus. */ "FocusChanged" : 6,
	/**  @type {callback} Called when a new window (not widget) is about to be displayed and allows for the given windows rectangle to be adjusted. */ "PlaceWindow" : 7
	 };

VG.UI.DockWidgetLocation={ "Left" : 0, "Right" : 1, "Floating" : 2 };

VG.UI.ActionItemRole={ "None" : 0, "New" : 1, "Open" : 2, "Save" : 3, "SaveAs" : 4, "Undo" : 5, "Redo" : 6, "Open_Local" : 7, "Cut" : 8, "Copy" : 9, "Paste" : 10, "Delete" : 11, "SelectAll" : 12,
	"Login" : 13, "Signup" : 14, "UserTool" : 15, "QuickMenu" : 16, "SkinCycyle" : 17 };

/** Maximum size for layours */

VG.UI.MaxLayoutSize=32768;

VG.UI.TableWidgetItemType={ "Label" : 0, "TextLineEdit" : 1, "PopupButton" : 2 };

VG.UI.FileDialog={
	"Image" : 0,
	"Text" : 1,
	"Project" : 2,
	"Binary" : 3
};

// --- Styles

VG.Styles={};
VG.Styles.pool=[];

// --------------------------------------------- VG.Core.StyleSkinPool

VG.UI.StylePool=function()
{
	if ( !(this instanceof VG.UI.StylePool) ) return new VG.UI.StylePool();
    this.styles=[];
};

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

