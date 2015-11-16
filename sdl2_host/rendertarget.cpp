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

#include "rendertarget.hpp"
#include "jswrapper.hpp"
#include "jshost.hpp"

extern JSWrapper *g_jsWrapper;

// --------------------------------------------------------------- Member Functions

JSWRAPPER_FUNCTION( RenderTarget_create )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS
    target->create();

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( RenderTarget_destroy )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS
    target->destroy();

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( RenderTarget_dispose )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS
    target->dispose();

    // --- VG.Renderer().removeResource(this);
    
    JSWrapperData rendererObject;
    g_jsWrapper->execute( "VG.Renderer()", &rendererObject );

    JSWrapperArguments arguments;
    arguments.append( thisObject );    

    JSWrapperData addObject;
    rendererObject.object()->get( "removeResource", &addObject );
    addObject.object()->call( &arguments, rendererObject.object() );

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( RenderTarget_unbind )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS
    target->unbind();

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( RenderTarget_bind )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS
    target->bind();

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( RenderTarget_fillPixelBuffer )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS

    if ( args.count() == 2 )
    {
        int x=0, y=0, width=target->getWidth(), height=target->getHeight();

        if ( args[0].isObject() )
        {
            JSWrapperData data;
            args[0].object()->get( "x", &data );
            x=data.toNumber();
            args[0].object()->get( "y", &data );
            y=data.toNumber();            
            args[0].object()->get( "width", &data );
            width=data.toNumber();
            args[0].object()->get( "height", &data );
            height=data.toNumber();
        }
        
        bool ok=args[1].object()->isTypedArray();
        if ( ok ) {
            unsigned int length; uint8_t *ptr;
            args[1].object()->getAsUint8Array( &ptr, &length );
            glReadPixels(x, target->getRealHeight()-(height+y), width, height, GL_RGBA, GL_UNSIGNED_BYTE, ptr );
        }
    }

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( RenderTarget_bindAsTexture )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS
    target->bindAsTexture();

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( RenderTarget_resize )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS

    if ( args.count() == 2 )
        target->resize( args[0].toNumber(), args[1].toNumber() );

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( RenderTarget_setViewport )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS

    if ( args.count() == 1 && args[0].isObject() )
    {
        double x, y, width, height;

        JSWrapperData data;
        args[0].object()->get( "x", &data );
        x=data.toNumber();
        args[0].object()->get( "y", &data );
        y=data.toNumber();            
        args[0].object()->get( "width", &data );
        width=data.toNumber();
        args[0].object()->get( "height", &data );
        height=data.toNumber();

        target->setViewport( x, y, width, height );     
    }

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( RenderTarget_setViewportEx )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS

    if ( args.count() == 4 )
        target->setViewport( args[0].toNumber(), args[1].toNumber(), args[2].toNumber(), args[3].toNumber() );     

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( RenderTarget_setScissor )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS

    if ( args.count() == 1 && args[0].isObject() )
    {
        double x, y, width, height;

        JSWrapperData data;
        args[0].object()->get( "x", &data );
        x=data.toNumber();
        args[0].object()->get( "y", &data );
        y=data.toNumber();            
        args[0].object()->get( "width", &data );
        width=data.toNumber();
        args[0].object()->get( "height", &data );
        height=data.toNumber();

        target->setScissor( x, y, width, height );    
    } else
    {
        target->setScissor( 0, 0, 0, 0 );
    }

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( RenderTarget_clear )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS

    GLfloat r = -1;
    GLfloat g = -1;
    GLfloat b = -1;
    GLfloat a = -1;
    
    GLint depth=1.0;

    if ( args.count() >= 1 && args[0].isObject() ) {
        JSWrapperData data;
        args[0].object()->get("r", &data);
        r=data.toNumber();
        args[0].object()->get("g", &data);
        g=data.toNumber();
        args[0].object()->get("b", &data);
        b=data.toNumber();
        args[0].object()->get("a", &data);
        a=data.toNumber();
    }

    if ( args.count() >= 2 && args[1].isNumber() ) depth=args[1].toNumber();
    target->clear( r, g, b, a, depth );

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( RenderTarget_getRealWidth )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS

    JSWrapperData data; data.setNumber( target->getRealWidth() );
    JSWRAPPER_FUNCTION_SETRC( data )

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( RenderTarget_getRealHeight )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS

    JSWrapperData data; data.setNumber( target->getRealHeight() );
    JSWRAPPER_FUNCTION_SETRC( data )

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( RenderTarget_getWidth )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS

    JSWrapperData data; data.setNumber( target->getWidth() );
    JSWRAPPER_FUNCTION_SETRC( data )

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( RenderTarget_getHeight )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS

    JSWrapperData data; data.setNumber( target->getHeight() );
    JSWRAPPER_FUNCTION_SETRC( data )

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( RenderTarget_resetSize )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS

    if ( args.count() == 2 )
        target->resetSize( args[0].toNumber(), args[1].toNumber() );

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( RenderTarget_checkStatusComplete )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_FUNCTION_GETCLASS
    bool status=target->checkStatusComplete();

    JSWrapperData data; data.setBoolean( status );
    JSWRAPPER_FUNCTION_SETRC( data )

JSWRAPPER_FUNCTION_END

// --------------------------------------------------------------- Getters

JSWRAPPER_GETPROPERTY( GetRenderTargetProperty_w )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_PROPERTY_GETCLASS

    JSWrapperData data; data.setNumber( target->w );
    JSWRAPPER_GETPROPERTY_SETRC( data )

JSWRAPPER_GETPROPERTY_END

JSWRAPPER_GETPROPERTY( GetRenderTargetProperty_h )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_PROPERTY_GETCLASS

    JSWrapperData data; data.setNumber( target->h );
    JSWRAPPER_GETPROPERTY_SETRC( data )

JSWRAPPER_GETPROPERTY_END

JSWRAPPER_GETPROPERTY( GetRenderTargetProperty_autoResize )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_PROPERTY_GETCLASS

    JSWrapperData data; data.setBoolean( target->autoResize );
    JSWRAPPER_GETPROPERTY_SETRC( data )

JSWRAPPER_GETPROPERTY_END

JSWRAPPER_GETPROPERTY( GetRenderTargetProperty_main )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_PROPERTY_GETCLASS

    JSWrapperData data; data.setBoolean( target->main );
    JSWRAPPER_GETPROPERTY_SETRC( data )

JSWRAPPER_GETPROPERTY_END

JSWRAPPER_GETPROPERTY( GetRenderTargetProperty_imageWidth )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_PROPERTY_GETCLASS

    JSWrapperData data; data.setNumber( target->imageWidth );
    JSWRAPPER_GETPROPERTY_SETRC( data )

JSWRAPPER_GETPROPERTY_END

JSWRAPPER_GETPROPERTY( GetRenderTargetProperty_imageHeight )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_PROPERTY_GETCLASS

    JSWrapperData data; data.setNumber( target->imageHeight );
    JSWRAPPER_GETPROPERTY_SETRC( data )

JSWRAPPER_GETPROPERTY_END

// --------------------------------------------------------------- Setters

JSWRAPPER_SETPROPERTY( SetRenderTargetProperty_w )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_PROPERTY_GETCLASS
    target->w=data.toNumber();

JSWRAPPER_SETPROPERTY_END

JSWRAPPER_SETPROPERTY( SetRenderTargetProperty_h )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_PROPERTY_GETCLASS
    target->h=data.toNumber();

JSWRAPPER_SETPROPERTY_END

JSWRAPPER_SETPROPERTY( SetRenderTargetProperty_autoResize )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_PROPERTY_GETCLASS
    target->autoResize=data.toBoolean();

JSWRAPPER_SETPROPERTY_END

JSWRAPPER_SETPROPERTY( SetRenderTargetProperty_main )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_PROPERTY_GETCLASS
    target->main=data.toBoolean();

JSWRAPPER_SETPROPERTY_END

JSWRAPPER_SETPROPERTY( SetRenderTargetProperty_imageWidth )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_PROPERTY_GETCLASS
    target->imageWidth=data.toNumber();

JSWRAPPER_SETPROPERTY_END

JSWRAPPER_SETPROPERTY( SetRenderTargetProperty_imageHeight )

    RenderTarget *target=(RenderTarget *) JSWRAPPER_PROPERTY_GETCLASS
    target->imageHeight=data.toNumber();

JSWRAPPER_SETPROPERTY_END
 
// --------------------------------------------------------------- 

JSWRAPPER_CONSTRUCTOR( RenderTargetConstructor, "RenderTarget" )

    GLint w=0;
    GLint h=0;
    bool main=false;

    if ( args.count() >= 1 ) w=args[0].toNumber();
    if ( args.count() >= 2 ) h=args[1].toNumber();
    if ( args.count() >= 3 ) main=args[2].toBoolean();

    RenderTarget *target = new RenderTarget( w, h, main );

    JSWRAPPER_CONSTRUCTOR_SETCLASS( target )

    //VG.Renderer().addResource(this);

    JSWrapperData rendererObject;
    g_jsWrapper->execute( "VG.Renderer()", &rendererObject );

    JSWrapperArguments arguments;
    arguments.append( thisObject );    

    JSWrapperData addObject;
    rendererObject.object()->get( "addResource", &addObject );
    addObject.object()->call( &arguments, rendererObject.object() );    

JSWRAPPER_CONSTRUCTOR_END

JSWrapperClass *registerRenderTarget( JSWrapper *jsWrapper )
{
    JSWrapperData data;
    jsWrapper->globalObject()->get( "VG", &data );
 
    JSWrapperClass *renderTargetClass=data.object()->createClass( "RenderTarget", RenderTargetConstructor );
    renderTargetClass->registerFunction( "create", RenderTarget_create );
    renderTargetClass->registerFunction( "destroy", RenderTarget_destroy );
    renderTargetClass->registerFunction( "dispose", RenderTarget_dispose );
    renderTargetClass->registerFunction( "unbind", RenderTarget_unbind );
    renderTargetClass->registerFunction( "bind", RenderTarget_bind );
    renderTargetClass->registerFunction( "fillPixelBuffer", RenderTarget_fillPixelBuffer );
    renderTargetClass->registerFunction( "bindAsTexture", RenderTarget_bindAsTexture );
    renderTargetClass->registerFunction( "resize", RenderTarget_resize );
    renderTargetClass->registerFunction( "setViewport", RenderTarget_setViewport );
    renderTargetClass->registerFunction( "setViewportEx", RenderTarget_setViewportEx );
    renderTargetClass->registerFunction( "setScissor", RenderTarget_setScissor );
    renderTargetClass->registerFunction( "clear", RenderTarget_clear );
    renderTargetClass->registerFunction( "getRealWidth", RenderTarget_getRealWidth );
    renderTargetClass->registerFunction( "getRealHeight", RenderTarget_getRealHeight );
    renderTargetClass->registerFunction( "getWidth", RenderTarget_getWidth );
    renderTargetClass->registerFunction( "getHeight", RenderTarget_getHeight );
    renderTargetClass->registerFunction( "resetSize", RenderTarget_resetSize );
    renderTargetClass->registerFunction( "checkStatusComplete", RenderTarget_checkStatusComplete );

    renderTargetClass->registerProperty( "w", GetRenderTargetProperty_w, SetRenderTargetProperty_w );
    renderTargetClass->registerProperty( "h", GetRenderTargetProperty_h, SetRenderTargetProperty_h );
    renderTargetClass->registerProperty( "autoResize", GetRenderTargetProperty_autoResize, SetRenderTargetProperty_autoResize );
    renderTargetClass->registerProperty( "main", GetRenderTargetProperty_main, SetRenderTargetProperty_main );
    renderTargetClass->registerProperty( "imageWidth", GetRenderTargetProperty_imageWidth, SetRenderTargetProperty_imageWidth );
    renderTargetClass->registerProperty( "imageHeight", GetRenderTargetProperty_imageHeight, SetRenderTargetProperty_imageHeight );

    renderTargetClass->install();

    return renderTargetClass;
}
