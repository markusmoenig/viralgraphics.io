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

VG.Shortcut = {};

VG.Shortcut.Item=function( key, modifier, modifierOptional )
{
    /** Represents a keyboard shortcut sequence
     **/

    if ( !(this instanceof VG.Shortcut.Item ) ) return new VG.Shortcut.Item( key, modifier, modifierOptional );

     this.key=key;
     this.modifier=modifier;
     this.modifierOptional=modifierOptional;

     this.createText();
};

VG.Shortcut.Item.prototype.createText=function()
{
    this.text="";

    if ( !this.key ) return;

    if ( this.modifierOptional === VG.Events.KeyCodes.Shift )
        this.text+="Shift+";

    if ( this.modifier === VG.Events.KeyCodes.AppleLeft )
        this.text+="Cmd";
    else
    if ( this.modifier === VG.Events.KeyCodes.Ctrl )
        this.text+="Ctrl";
    else
    if ( this.modifier === VG.Events.KeyCodes.Alt )
        this.text+="Alt";
    else
    if ( this.modifier === VG.Events.KeyCodes.Shift )
        this.text+="Shift";

    if ( this.text.length ) this.text+="+";
    this.text+=this.key;
};

VG.Shortcut.Manager=function()
{
    /** Manages key sequences mostly used in menu shortcuts. Creates default menu shortcuts for the underlying operating system (like New / Copy / Paste etc).
     **/

    if ( !(this instanceof VG.Shortcut.Manager ) ) return new VG.Shortcut.Manager();
};

VG.Shortcut.Defaults={ "Cut" : 0, "Copy" : 1, "Paste" : 2, "SelectAll" : 3, "InsertText" : 4, "InsertEncodedText" : 5, "Undo" : 6, "Redo" : 7, "Open" : 8, "SaveAs" : 9 };

VG.Shortcut.Manager.prototype.createDefault=function( def )
{
    var item=new VG.Shortcut.Item();

    switch( def )
    {
        case VG.Shortcut.Defaults.Open:
        {
            if ( VG.context.workspace.operatingSystem === VG.HostProperty.OSMac && VG.context.workspace.platform === VG.HostProperty.PlatformDesktop ) {
                item.key="O";
                item.modifier=VG.Events.KeyCodes.AppleLeft;
            }
        }
        break;

        case VG.Shortcut.Defaults.Save:
        {
            if ( VG.context.workspace.operatingSystem === VG.HostProperty.OSMac && VG.context.workspace.platform === VG.HostProperty.PlatformDesktop ) {
                item.key="S";
                item.modifier=VG.Events.KeyCodes.AppleLeft;
            }
        }
        break;

        case VG.Shortcut.Defaults.SaveAs:
        {
            if ( VG.context.workspace.operatingSystem === VG.HostProperty.OSMac && VG.context.workspace.platform === VG.HostProperty.PlatformDesktop ) {
                item.key="S";
                item.modifier=VG.Events.KeyCodes.AppleLeft;
                item.modifierOptional=VG.Events.KeyCodes.Shift;
            }
        }
        break;

        case VG.Shortcut.Defaults.Undo:
        {
            if ( VG.context.workspace.operatingSystem === VG.HostProperty.OSMac  ) {
                item.key="Z";
                item.modifier=VG.Events.KeyCodes.AppleLeft;
            } else {
                item.key="Z";
                item.modifier=VG.Events.KeyCodes.Ctrl;
            }
        }
        break;

        case VG.Shortcut.Defaults.Redo:
        {
            if ( VG.context.workspace.operatingSystem === VG.HostProperty.OSMac ) {
                item.key="Z";
                item.modifier=VG.Events.KeyCodes.AppleLeft;
                item.modifierOptional=VG.Events.KeyCodes.Shift;
            } else {
                item.key="Z";
                item.modifier=VG.Events.KeyCodes.Ctrl;
                item.modifierOptional=VG.Events.KeyCodes.Shift;
            }
        }
        break;

        case VG.Shortcut.Defaults.Cut:
        {
            if ( VG.context.workspace.operatingSystem === VG.HostProperty.OSMac ) {
                item.key="X";
                item.modifier=VG.Events.KeyCodes.AppleLeft;
            }
        }
        break;

        case VG.Shortcut.Defaults.Copy:
        {
            if ( VG.context.workspace.operatingSystem === VG.HostProperty.OSMac ) {
                item.key="C";
                item.modifier=VG.Events.KeyCodes.AppleLeft;
            }
        }
        break;

        case VG.Shortcut.Defaults.Paste:
        {
            if ( VG.context.workspace.operatingSystem === VG.HostProperty.OSMac ) {
                item.key="V";
                item.modifier=VG.Events.KeyCodes.AppleLeft;
            }
        }
        break;

        case VG.Shortcut.Defaults.SelectAll:
        {
            item.key="A";
            item.modifier=VG.Events.KeyCodes.Alt;
        }
        break;

        case VG.Shortcut.Defaults.InsertText:
        {
            item.key="I";
            item.modifier=VG.Events.KeyCodes.Alt;
        }
        break;

        case VG.Shortcut.Defaults.InsertEncodedText:
        {
            item.key="E";
            item.modifier=VG.Events.KeyCodes.Alt;
        }
        break;
    }

    item.createText();

    return item;
};

VG.Shortcut.Manager.prototype.verifyMenubar=function( text, keysDown, menubar )
{
    for( var m=0; m < menubar.items.length; ++m )
    {
        var menu=menubar.items[m];
        if ( this.verifyMenu( text, keysDown, menu ) ) return true;
    }

    return false;
};

VG.Shortcut.Manager.prototype.verifyToolBar=function( text, keysDown, toolbar )
{
    for( let m=0; m < toolbar.layout.children.length; ++m )
    {
        let object = toolbar.layout.children[m];

        // if ( object.shortcut )
            // console.log( text, keysDown, object.shortcut );

        if ( object && object.shortcut && this.verifyShortcut( text, keysDown, object.shortcut ) )
        {
            if ( !object.disabled ) object.clicked();
            return true;
        }
    }

    return false;
};

VG.Shortcut.Manager.prototype.verifyMenu=function( text, keysDown, menu )
{
    this.duplicateFromHost=false;

    for ( var mi=0; mi < menu.items.length; ++mi )
    {
        var menuItem=menu.items[mi];

        if ( menu.externalClickItem === menuItem )//&& ( Date.now() - menu.externalClickTime ) < 500 )
        {
            menu.externalClickItem=null;
            this.duplicateFromHost=true;
            return true;
        }

        if ( menuItem.shortcut && !menuItem.disabled )
        {
            if ( this.verifyShortcut( text, keysDown, menuItem.shortcut ) )
            {
                if ( menuItem.clicked ) menuItem.clicked();
                return true;
            }
        }
    }
    return false;
};

VG.Shortcut.Manager.prototype.verifyShortcut=function( text, keysDown, shortcut )
{
    if ( text.toUpperCase() === shortcut.key && !shortcut.modifier ) return true;

    if ( text.toUpperCase() === shortcut.key && keysDown.indexOf( shortcut.modifier ) !== -1 )
    {
        if ( !shortcut.modifierOptional || ( shortcut.modifierOptional && keysDown.indexOf( shortcut.modifierOptional ) !== -1 ) )
        {
            // --- If Shift is pressed and no optional modifier selected ignore this event
            if ( !shortcut.modifierOptional && keysDown.indexOf( VG.Events.KeyCodes.Shift ) !== -1 ) return false;

            return true;
        }
    }

    return false;
};