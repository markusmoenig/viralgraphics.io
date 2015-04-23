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
        this.text+="SHIFT+";

    if ( this.modifier === VG.Events.KeyCodes.AppleLeft )
        this.text+="CMD";
    else
    if ( this.modifier === VG.Events.KeyCodes.Ctrl )
        this.text+="CTRL";    
    else
    if ( this.modifier === VG.Events.KeyCodes.Alt )
        this.text+="ALT";     

    this.text+="+" + this.key;
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
            if ( VG.context.workspace.operatingSystem === VG.HostProperty.OSMac && VG.context.workspace.platform === VG.HostProperty.PlatformWeb ) {
                item.key="Z";
                item.modifier=VG.Events.KeyCodes.Alt;
            } else
            if ( VG.context.workspace.operatingSystem === VG.HostProperty.OSMac && VG.context.workspace.platform === VG.HostProperty.PlatformDesktop ) {
                item.key="Z";
                item.modifier=VG.Events.KeyCodes.AppleLeft;
            }            
        }
        break;

        case VG.Shortcut.Defaults.Redo:
        {
            if ( VG.context.workspace.operatingSystem === VG.HostProperty.OSMac && VG.context.workspace.platform === VG.HostProperty.PlatformWeb ) {
                item.key="Z";
                item.modifier=VG.Events.KeyCodes.Alt;
                item.modifierOptional=VG.Events.KeyCodes.Shift;
            } else
            if ( VG.context.workspace.operatingSystem === VG.HostProperty.OSMac && VG.context.workspace.platform === VG.HostProperty.PlatformDesktop ) {
                item.key="Z";
                item.modifier=VG.Events.KeyCodes.AppleLeft;
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

VG.Shortcut.Manager.prototype.verifyMenu=function( text, keysDown, menu )
{
    this.duplicateFromHost=false;

    for ( var mi=0; mi < menu.items.length; ++mi )
    {
        var menuItem=menu.items[mi];

        if ( menu.externalClickItem === menuItem && ( Date.now() - menu.externalClickTime ) < 200 ) 
        {
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