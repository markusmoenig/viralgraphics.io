/*
 * Copyright (c) 2014-2016 Markus Moenig <markusm@visualgraphics.tv>
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

if ( !VG )

/** @namespace */
 VG = {};

/**
 * Enum for Host Visual Graphics is running on
 * @readonly
 * @enum {number}
 */

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

	"ProjectChangedState" : 20
};

VG.AnimationTick=1000.0 / 60.0;

/** 
 * The context applications are running in. vgMain() of the application is running in this context.
 * @namespace 
 */

VG.context={};

/** Forces a redraw of the UI during the next tick. */

VG.update=function()
{
    if ( VG.context && VG.context.workspace ) VG.context.workspace.needsRedraw=true;
    if ( VG.hostUpdate ) VG.hostUpdate();
};

/** Prints the arguments to the console of the current host. */

VG.log=function()
{
	var string="";

	for( var i=0; i < arguments.length; ++i ) string+=String( arguments[i] ) + " ";

	if ( typeof console == "object" ) console.log( string );
	else if ( VG.print ) VG.print( string );

	if ( VG.globalVIDEInstance ) VG.globalVIDEInstance.addToRuntimeLog( string );
};

/** Prints the error arguments to the console of the current host. */

VG.error=function()
{
	var string="Error: ";

	for( var i=0; i < arguments.length; ++i ) string+=String( arguments[i] ) + " ";

	if ( typeof console == "object" ) console.log( string );
	else if ( VG.print ) VG.print( string );

	if ( VG.globalVIDEInstance ) VG.globalVIDEInstance.addToRuntimeLog( string );	
};