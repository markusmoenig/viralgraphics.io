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

VG.UI = {};

VG.UI.HAlignment={ "Left" : 0, "Centered" : 1, "Right" : 2 };
VG.UI.VAlignment={ "Top" : 0, "Centered" : 1, "Bottom" : 2 };

VG.UI.DataCollectionRole={ "LoadSaveRole" : 1, "UndoRedoRole" : 2, "Docs.Enum" : -1 };
VG.UI.CallbackType={ "New" : 0, "UndoRedo" : 1, "Open" : 2, "Save" : 3, "LoggedStateChanged" : 4, "Docs.Enum" : -1 };

VG.UI.DockWidgetLocation={ "Left" : 0, "Right" : 1, "Floating" : 2, "Docs.Enum" : -1 };

VG.UI.ActionItemRole={ "None" : 0, "New" : 1, "Open" : 2, "Save" : 3, "SaveAs" : 4, "Undo" : 5, "Redo" : 6, "Open_Local" : 7, "Cut" : 8, "Copy" : 9, "Paste" : 10, "Delete" : 11, "SelectAll" : 12, "Docs.Enum" : -1 };

VG.UI.MaxLayoutSize=32768;

VG.UI.TableWidgetItemType={ "Label" : 0, "TextLineEdit" : 1, "PopupButton" : 2 };

VG.UI.FileDialog={ 
	"Image" : 0,
	"Text" : 1,
	"Project" : 2,
	"Docs.Enum" : -1
};

// --- Styles

VG.Styles={};
VG.Styles.pool=[];
