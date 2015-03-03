/*
 * (C) Copyright 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>, Luis Jimenez <kuko@kvbits.com>.
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

#include <iostream>

#include "rendertarget.hpp"

// --------------------------------------------------------------- Member Functions

bool RenderTarget_create(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    RenderTarget *target=(RenderTarget *) JS_GetPrivate( &value.toObject() );
    target->create();
    return true;
}

bool RenderTarget_release(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    RenderTarget *target=(RenderTarget *) JS_GetPrivate( &value.toObject() );
    target->release();
    return true;
}

bool RenderTarget_dispose(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    RenderTarget *target=(RenderTarget *) JS_GetPrivate( &value.toObject() );
    target->dispose();

    //TODO VG.Renderer().removeResource(this);
    
    return true;
}

bool RenderTarget_unbind(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    RenderTarget *target=(RenderTarget *) JS_GetPrivate( &value.toObject() );
    target->unbind();
    return true;
}

bool RenderTarget_bind(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    RenderTarget *target=(RenderTarget *) JS_GetPrivate( &value.toObject() );
    target->bind();
    return true;
}

bool RenderTarget_bindAsTexture(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    RenderTarget *target=(RenderTarget *) JS_GetPrivate( &value.toObject() );
    target->bindAsTexture();
    return true;
}

bool RenderTarget_resize(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    if ( argc == 2 )
    {
        RenderTarget *target=(RenderTarget *) JS_GetPrivate( &value.toObject() );
        target->resize( args[0].toInt32(), args[1].toInt32() );
    }
    return true;
}

bool RenderTarget_setViewport(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    if ( argc == 1 && args[0].isObject() )
    {
        RenderTarget *target=(RenderTarget *) JS_GetPrivate( &value.toObject() );
        RootedObject object(cx, &args[0].toObject() );
        RootedValue x(cx), y(cx), width(cx), height(cx);

        JS_GetProperty( cx, HandleObject(object), "x", MutableHandleValue(&x) );
        JS_GetProperty( cx, HandleObject(object), "y", MutableHandleValue(&y) );
        JS_GetProperty( cx, HandleObject(object), "width", MutableHandleValue(&width) );
        JS_GetProperty( cx, HandleObject(object), "height", MutableHandleValue(&height) );   

        //printf( "setViewport %d, %d\n", width, height );

        target->setViewport( x.toInt32(), y.toInt32(), width.toInt32(), height.toInt32() );     
    }
    return true;
}

bool RenderTarget_setScissor(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );
    RenderTarget *target=(RenderTarget *) JS_GetPrivate( &value.toObject() );

    if ( argc == 1 && args[0].isObject() )
    {
        RootedObject object(cx, &args[0].toObject() );
        RootedValue x(cx), y(cx), width(cx), height(cx);

        JS_GetProperty( cx, HandleObject(object), "x", MutableHandleValue(&x) );
        JS_GetProperty( cx, HandleObject(object), "y", MutableHandleValue(&y) );
        JS_GetProperty( cx, HandleObject(object), "width", MutableHandleValue(&width) );
        JS_GetProperty( cx, HandleObject(object), "height", MutableHandleValue(&height) );   

        target->setScissor( x.toInt32(), y.toInt32(), width.toInt32(), height.toInt32() );     
    } else target->setScissor( 0, 0, 0, 0 );  

    return true;
}

bool RenderTarget_clear(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );
    RenderTarget *target=(RenderTarget *) JS_GetPrivate( &value.toObject() );

    GLfloat r = -1;
    GLfloat g = -1;
    GLfloat b = -1;
    GLfloat a = -1;

    GLint depth=-1;

    if ( argc >= 1 && args[0].isObject() )
    {
        RootedObject object(cx, &args[0].toObject() );
        RootedValue red(cx), green(cx), blue(cx), alpha(cx);

        JS_GetProperty( cx, HandleObject(object), "r", MutableHandleValue(&red) );
        JS_GetProperty( cx, HandleObject(object), "g", MutableHandleValue(&green) );
        JS_GetProperty( cx, HandleObject(object), "b", MutableHandleValue(&blue) );
        JS_GetProperty( cx, HandleObject(object), "a", MutableHandleValue(&alpha) );

        r=red.toNumber(); g=green.toNumber(); b=blue.toNumber(); a=alpha.toNumber();
    }

    if ( argc >= 2 ) depth=args[1].toInt32();

    target->clear( r, g, b, a, depth );

    return true;
}

// --------------------------------------------------------------- Properties

bool GetRenderTargetProperty( JSContext *cx, Handle<JSObject *> object, Handle<jsid> id, MutableHandle<Value> value )
{
    RootedValue val(cx); JS_IdToValue( cx, id, MutableHandleValue(&val) );
    JSString *propertyString = val.toString(); const char *propertyName=JS_EncodeString(cx, propertyString);   
    //printf("GetRenderTargetProperty: %s\n", propertyName ); 
    
    RenderTarget *target=(RenderTarget *) JS_GetPrivate( object );

    if ( !strcmp( propertyName, "w" ) ) {
        value.set( INT_TO_JSVAL( target->w ) );
    } else   
    if ( !strcmp( propertyName, "h" ) ) {
        value.set( INT_TO_JSVAL( target->h ) );
    } else
    if ( !strcmp( propertyName, "autoResize" ) ) {
        value.set( BOOLEAN_TO_JSVAL( target->autoResize ) );
    } else
    if ( !strcmp( propertyName, "main" ) ) {
        value.set( BOOLEAN_TO_JSVAL( target->main ) );
    }  

    return true;    
}

bool SetRenderTargetProperty( JSContext *cx, Handle<JSObject *> object, Handle<jsid> id, bool, MutableHandle<Value> value)
{
    RootedValue val(cx); JS_IdToValue( cx, id, MutableHandleValue(&val) );
    JSString *propertyString = val.toString(); const char *propertyName=JS_EncodeString(cx, propertyString);    
    //printf("SetRenderTargetProperty: %s\n", propertyName ); 

    RenderTarget *target=(RenderTarget *) JS_GetPrivate( object );

    if ( !strcmp( propertyName, "w" ) ) {
        target->w=value.toInt32();
    } else
    if ( !strcmp( propertyName, "h" ) ) {
        target->h=value.toInt32();
    } else
    if ( !strcmp( propertyName, "autoResize" ) ) {
        target->autoResize=value.toBoolean();
    } else
    if ( !strcmp( propertyName, "main" ) ) {
        target->main=value.toBoolean();
    }

    return true;
}

static JSFunctionSpec rendertarget_functions[] = {
    JS_FS( "create", RenderTarget_create, 0, 0 ),
    JS_FS( "release", RenderTarget_release, 0, 0 ),
    JS_FS( "dispose", RenderTarget_dispose, 0, 0 ),
    JS_FS( "unbind", RenderTarget_unbind, 0, 0 ),
    JS_FS( "bind", RenderTarget_bind, 0, 0 ),
    JS_FS( "bindAsTexture", RenderTarget_bindAsTexture, 0, 0 ),
    JS_FS( "resize", RenderTarget_resize, 0, 0 ),
    JS_FS( "setViewport", RenderTarget_setViewport, 0, 0 ),
    JS_FS( "setScissor", RenderTarget_setScissor, 0, 0 ),
    JS_FS( "clear", RenderTarget_clear, 0, 0 ),

    JS_FS_END
};
 
// --------------------------------------------------------------- 

JSClass RenderTargetClass = 
{ 
    "RenderTarget", JSCLASS_HAS_PRIVATE, JS_PropertyStub, NULL,
    JS_PropertyStub, JS_StrictPropertyStub,
    JS_EnumerateStub, JS_ResolveStub, JS_ConvertStub, NULL
};

bool RenderTargetConstructor( JSContext *cx, unsigned argc, jsval *vp )
{
    //printf( "RenderTarget Constructor!%d\n", argc );

    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    JSObject *object = JS_NewObjectForConstructor( cx, &RenderTargetClass, args );
    RootedObject obj(cx, object ); RootedValue v(cx, JS::UndefinedValue() );
    JS_DefineFunctions( cx, HandleObject(obj), rendertarget_functions );
    JS_DefineProperty( cx, HandleObject(obj), "w", HandleValue(&v), JSPROP_SHARED, (JSPropertyOp) GetRenderTargetProperty, (JSStrictPropertyOp) SetRenderTargetProperty );
    JS_DefineProperty( cx, HandleObject(obj), "h", HandleValue(&v), JSPROP_SHARED, (JSPropertyOp) GetRenderTargetProperty, (JSStrictPropertyOp) SetRenderTargetProperty );
    JS_DefineProperty( cx, HandleObject(obj), "autoResize", HandleValue(&v), JSPROP_SHARED, (JSPropertyOp) GetRenderTargetProperty, (JSStrictPropertyOp) SetRenderTargetProperty );
    JS_DefineProperty( cx, HandleObject(obj), "main", HandleValue(&v), JSPROP_SHARED, (JSPropertyOp) GetRenderTargetProperty, (JSStrictPropertyOp) SetRenderTargetProperty );

    GLint w=0;
    GLint h=0;
    bool main=false;

    if ( argc >= 1 ) w=args[0].toInt32();
    if ( argc >= 2 ) h=args[1].toInt32();
    if ( argc >= 3 ) main=args[2].toBoolean();

    RenderTarget *target = new RenderTarget( w, h, main );

    JS_SetPrivate( object, target );
    args.rval().set( OBJECT_TO_JSVAL( object ) );

    //VG.Renderer().addResource(this);

    RootedValue rendererRC(cx); RootedObject global( cx,JS_GetGlobalForObject( cx, object ) );
    bool ok = JS_EvaluateScript( cx, HandleObject( global ), "VG.Renderer()", strlen("VG.Renderer()"), "unknown", 1, MutableHandleValue(&rendererRC) );    
    if ( ok )
    {
        RootedValue objectValue( cx, OBJECT_TO_JSVAL(object) );
        RootedObject renderer(cx, &rendererRC.toObject() ); MutableHandleValue handleValue( &rendererRC );
        ok=Call( cx, HandleObject(renderer), "addResource", HandleValueArray( objectValue ), handleValue );
    }

    return true;
}

JSObject *registerRenderTarget( JSContext *cx, JSObject *object )
{
    RootedObject obj(cx, object ); RootedObject parentobj(cx);

    JSObject * newObject=JS_InitClass( cx, HandleObject(obj), HandleObject(parentobj), &RenderTargetClass,  
        RenderTargetConstructor, 0,
        NULL, NULL,
        NULL, NULL);

    return newObject;
}
