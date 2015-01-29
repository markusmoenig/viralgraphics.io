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
 * You should have received a copy of the GNU General Public License
 * along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

VG.Events = {};
VG.Events.MouseButton={ "Left" : 0, "Right" : 1, "Docs.Enum" : 9000 };
VG.Events.KeyCodes={ "Backspace" : 8, "Tab" : 9, "Enter" : 13, "Shift" : 16, "Ctrl" : 17, "Alt" : 18, "Pause" : 19,
	"CapsLock" : 20, "Esc" : 27,  "Space" : 32, "PageUp" : 33, "PageDow" : 34, "End" : 35, "Home" : 36, "ArrowLeft" : 37, "ArrowUp" : 38,
	 "ArrowRight" : 39,  "ArrowDown" : 40,  "PrintScrn" : 44,  "Insert" : 45,  "Delete" : 46, 
	 "0" : 48, "1" : 49, "2" : 50, "3" : 51, "4" : 52, "5" : 53, "6" : 54, "7" : 55, "8" : 56, "9" : 57, 
	 "A" : 65, "B" : 66, "C" : 67, "D" : 68, "E" : 69, "F" : 70, "G" : 71, "H" : 72, "I" : 73, "J" : 74,
	 "K" : 75, "L" : 76, "M" : 77, "N" : 78, "O" : 79, "P" : 80, "Q" : 81, "R" : 82, "S" : 83, "T" : 84,
	 "U" : 85, "V" : 86, "W" : 87, "X" : 88, "Y" : 89, "Z" : 90,
	 "AppleLeft" : 91, "AppleRight" : 93,
	 "F1" : 112, "F2" : 113, "F3" : 114, "F4" : 115, "F5" : 116, "F6" : 117, "F7" : 118, "F8" : 119, "F9" : 120, "F10" : 121,
	 "F11" : 122, "F11" : 123,
	 "NumLock" : 144, "ScrollLock" : 145
	};

// ----------------------------------------------------------------- VG.Events.MouseMoveEvent

VG.Events.MouseMoveEvent=function()
{
    /**Creates an MouseMoveEvent. Send to the focus Widget on user mouse move.
     */    	
    if (!(this instanceof VG.Events.MouseMoveEvent)) return new VG.Events.MouseMoveEvent();
    
    /** The current mouse position. 
     * @member {VG.Core.Point}
     */

    this.pos=VG.Core.Point();
};

// ----------------------------------------------------------------- VG.Events.MouseDownEvent

VG.Events.MouseDownEvent=function( workspace )
{
    /**Creates an MouseDownEvent. Send to the focus Widget on user initiated mouse button press.
     */    

    if (!(this instanceof VG.Events.MouseDownEvent)) return new VG.Events.MouseDownEvent( workspace );
    
    /** The current mouse position. 
     * @member {VG.Core.Point}
     */
    this.pos=workspace.mousePos;

    /** The mouse button which has been pressed. 
     * @member {VG.Events.MouseButton}
     */    
    this.button=VG.Events.MouseButton.Left;

    /** An array containing all currently pressed keys.
     * @member {VG.Events.MouseButton}
     */     
    this.keysDown=workspace.keysDown;
};

// ----------------------------------------------------------------- VG.Events.MouseUpEvent

VG.Events.MouseUpEvent=function( workspace )
{
    /**Creates an MouseUpEvent. Send to the focus Widget on user initiated mouse button release.
     */    

    if (!(this instanceof VG.Events.MouseUpEvent)) return new VG.Events.MouseUpEvent( workspace );
    
    /** The current mouse position. 
     * @member {VG.Core.Point}
     */
    this.pos=workspace.mousePos;

    /** The mouse button which has been pressed. 
     * @member {VG.Events.MouseButton}
     */    
    this.button=VG.Events.MouseButton.Left;

    /** An array containing all currently pressed keys.
     * @member {VG.Events.MouseButton}
     */     
    this.keysDown=workspace.keysDown;
};