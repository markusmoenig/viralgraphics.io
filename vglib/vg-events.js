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

VG.Events = {};
VG.Events.MouseButton={ "Left" : 0, "Right" : 1, "Docs.Enum" : 9000 };
VG.Events.KeyCodes={ "Backspace" : 8, "Tab" : 9, "Enter" : 13, "Shift" : 16, "Ctrl" : 17, "Alt" : 18, "Pause" : 19,
	"CapsLock" : 20, "Esc" : 27,  "Space" : 32, "PageUp" : 33, "PageDow" : 34, "End" : 35, "Home" : 36, "ArrowLeft" : 37, "ArrowUp" : 38,
	 "ArrowRight" : 39,  "ArrowDown" : 40,  "PrintScrn" : 44,  "Insert" : 45,  "Delete" : 46, 
	 "Zero" : 48, "One" : 49, "Two" : 50, "Three" : 51, "Four" : 52, "Five" : 53, "Six" : 54, "Seven" : 55, "Eight" : 56, "Nine" : 57, 
	 "A" : 65, "B" : 66, "C" : 67, "D" : 68, "E" : 69, "F" : 70, "G" : 71, "H" : 72, "I" : 73, "J" : 74,
	 "K" : 75, "L" : 76, "M" : 77, "N" : 78, "O" : 79, "P" : 80, "Q" : 81, "R" : 82, "S" : 83, "T" : 84,
	 "U" : 85, "V" : 86, "W" : 87, "X" : 88, "Y" : 89, "Z" : 90,
	 "AppleLeft" : 91, "AppleRight" : 93,
	 "F1" : 112, "F2" : 113, "F3" : 114, "F4" : 115, "F5" : 116, "F6" : 117, "F7" : 118, "F8" : 119, "F9" : 120, "F10" : 121,
	 "F11" : 122, "F11" : 123,
	 "NumLock" : 144, "ScrollLock" : 145,
     "Docs.Enum" : 9000
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