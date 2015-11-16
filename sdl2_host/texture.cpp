/*
 * Copyright (c) 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>, Luis Jimenez <kuko@kvbits.com>.
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

#include <iostream>

#include "texture.hpp"
#include "jshost.hpp"

extern JSWrapper *g_jsWrapper;

// --------------------------------------------------------------- Member Functions

JSWRAPPER_FUNCTION( Texture_create )

    Texture *texture=(Texture *) JSWRAPPER_FUNCTION_GETCLASS
    texture->create();

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Texture_bind )

    Texture *texture=(Texture *) JSWRAPPER_FUNCTION_GETCLASS
    texture->bind();

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Texture_update )

    Texture *texture=(Texture *) JSWRAPPER_FUNCTION_GETCLASS

    GLint x=0, y=0, width=-1, height=-1;

    if ( args.count() >= 1 ) x=args.at(0).toNumber();
    if ( args.count() >= 2 ) y=args.at(1).toNumber();
    if ( args.count() >= 3 ) width=args.at(2).toNumber();
    if ( args.count() >= 4 ) height=args.at(3).toNumber();

    texture->update( x, y, width, height );

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Texture_destroy )

    Texture *texture=(Texture *) JSWRAPPER_FUNCTION_GETCLASS
    texture->destroy();

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Texture_dispose )

    Texture *texture=(Texture *) JSWRAPPER_FUNCTION_GETCLASS
    texture->dispose();

    // --- VG.Renderer().removeResource(this);

    JSWrapperData rendererObject;
    g_jsWrapper->execute( "VG.Renderer()", &rendererObject );

    JSWrapperArguments arguments;
    arguments.append( thisObject );    

    JSWrapperData addObject;
    rendererObject.object()->get( "removeResource", &addObject );
    addObject.object()->call( &arguments, rendererObject.object() );

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Texture_getRealWidth )

    Texture *texture=(Texture *) JSWRAPPER_FUNCTION_GETCLASS

    JSWrapperData data; data.setNumber( texture->initialRealWidth );
    JSWRAPPER_FUNCTION_SETRC( data )

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Texture_getRealHeight )

    Texture *texture=(Texture *) JSWRAPPER_FUNCTION_GETCLASS

    JSWrapperData data; data.setNumber( texture->initialRealHeight );
    JSWRAPPER_FUNCTION_SETRC( data )

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Texture_getWidth )

    Texture *texture=(Texture *) JSWRAPPER_FUNCTION_GETCLASS

    JSWrapperData data; data.setNumber( texture->initialWidth );
    JSWRAPPER_FUNCTION_SETRC( data )

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Texture_getHeight )

    Texture *texture=(Texture *) JSWRAPPER_FUNCTION_GETCLASS

    JSWrapperData data; data.setNumber( texture->initialHeight );
    JSWRAPPER_FUNCTION_SETRC( data )

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Texture_identifyTexture )
JSWRAPPER_FUNCTION_END
  
// --------------------------------------------------------------- 

JSWRAPPER_CONSTRUCTOR( TextureConstructor, "Texture" )

    if ( args.count() >= 1 ) {
        JSWrapperObject *imagesObject=args.at( 0 ).object()->copy();
        bool cube=false;

        if ( args.count() >=2 ) cube=args.at( 1 ).toBoolean();

        Texture *texture=new Texture( imagesObject, cube );

        JSWRAPPER_CONSTRUCTOR_SETCLASS( texture )
    }

    //VG.Renderer().addResource(this);

    JSWrapperData rendererObject;
    g_jsWrapper->execute( "VG.Renderer()", &rendererObject );

    JSWrapperArguments arguments;
    arguments.append( thisObject );    

    JSWrapperData addObject;
    rendererObject.object()->get( "addResource", &addObject );
    addObject.object()->call( &arguments, rendererObject.object() );    

JSWRAPPER_CONSTRUCTOR_END

JSWrapperClass *registerTexture( JSWrapper * jsWrapper )
{
    JSWrapperData data;
    jsWrapper->globalObject()->get( "VG", &data );

    JSWrapperClass *textureClass=data.object()->createClass( "Texture", TextureConstructor );
    textureClass->registerFunction( "create", Texture_create );
    textureClass->registerFunction( "bind", Texture_bind );
    textureClass->registerFunction( "update", Texture_update );
    textureClass->registerFunction( "destroy", Texture_destroy );
    textureClass->registerFunction( "dispose", Texture_dispose );
    textureClass->registerFunction( "identifyTexture", Texture_identifyTexture );
    textureClass->registerFunction( "getRealWidth", Texture_getRealWidth );
    textureClass->registerFunction( "getRealHeight", Texture_getRealHeight );
    textureClass->registerFunction( "getWidth", Texture_getWidth );
    textureClass->registerFunction( "getHeight", Texture_getHeight );
    textureClass->install();

    return textureClass;
}
