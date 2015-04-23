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

var VG = {};

VG.HostProperty={ 
	"Platform" : 0,
	"PlatformWeb" : 1,
	"PlatformDesktop" : 2,
	"PlatformTablet" : 3,
	"PlatformMobile" : 4,

	"OperatingSystem" : 5,
	"OSWindows" : 6,
	"OSMac" : 7,
	"OSUnix" : 8,
	"OSLinux" : 9,

	"DrawMenus" : 12,

	"ProjectChangedState" : 20,

	"Docs.Enum" : 9000
};

VG.AnimationTick=1000.0 / 60.0;

// --- Application Context

VG.context={};

// --- Global Redraw

VG.update=function()
{
    if ( VG.context && VG.context.workspace ) VG.context.workspace.needsRedraw=true;
    if ( VG.hostUpdate ) VG.hostUpdate();
};

// --- Log & Error Functions, these will be overriden by V-IDE

VG.log=function()
{
	/** Prints the arguments on the native console. If V-IDE is running also prints the arguments in V-IDEs Runtime Log.
	**/

	var string="";

	for( var i=0; i < arguments.length; ++i ) string+=String( arguments[i] ) + " ";

	if ( typeof console == "object" ) console.log( string );
	else if ( VG.print ) VG.print( string );

	if ( VG.globalVIDEInstance ) VG.globalVIDEInstance.addToRuntimeLog( string );
};

VG.error=function()
{
	/** Prints the arguments on the console. V-IDE replaces this function and prints the arguments in its Runtime Window.
	**/

	var string="Error: ";

	for( var i=0; i < arguments.length; ++i ) string+=String( arguments[i] ) + " ";

	if ( typeof console == "object" ) console.log( string );
	else if ( VG.print ) VG.print( string );

	if ( VG.globalVIDEInstance ) VG.globalVIDEInstance.addToRuntimeLog( string );	
};