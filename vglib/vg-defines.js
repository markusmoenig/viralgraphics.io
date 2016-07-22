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

if ( !VG ) var VG = {};

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