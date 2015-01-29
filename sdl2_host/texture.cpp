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
 * You should have received a copy of the GNU General Public License
 * along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

#include <iostream>

#include "texture.hpp"

// --------------------------------------------------------------- Member Functions

bool Texture_create(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    Texture *texture=(Texture *) JS_GetPrivate( &value.toObject() );
    texture->create();
    return true;
}

bool Texture_bind(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    Texture *texture=(Texture *) JS_GetPrivate( &value.toObject() );
    texture->bind();
    return true;
}

bool Texture_update(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    GLint x=0, y=0, width=-1, height=-1;

    if ( argc >= 1 ) x=args[0].toInt32();
    if ( argc >= 2 ) y=args[1].toInt32();
    if ( argc >= 3 ) width=args[2].toInt32();
    if ( argc >= 4 ) height=args[3].toInt32();

    Texture *texture=(Texture *) JS_GetPrivate( &value.toObject() );
    texture->update( x, y, width, height );
    return true;
}

bool Texture_release(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    Texture *texture=(Texture *) JS_GetPrivate( &value.toObject() );
    texture->release();
    return true;
}

bool Texture_dispose(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    Texture *texture=(Texture *) JS_GetPrivate( &value.toObject() );
    texture->dispose();

    //TODO VG.Renderer().removeResource(this);

    return true;
}

// --------------------------------------------------------------- Properties

bool GetTextureProperty( JSContext *cx, Handle<JSObject *> object, Handle<jsid> id, MutableHandle<Value> value )
{
    RootedValue val(cx); JS_IdToValue( cx, id, MutableHandleValue(&val) );
    JSString *propertyString = val.toString(); const char *propertyName=JS_EncodeString(cx, propertyString);    
    //printf("GetShaderProperty: %s\n", propertyName ); 
    
    Texture *texture=(Texture *) JS_GetPrivate( object );

    return true;    
}

bool SetTextureProperty( JSContext *cx, Handle<JSObject *> object, Handle<jsid> id, bool, MutableHandle<Value> value)
{
    RootedValue val(cx); JS_IdToValue( cx, id, MutableHandleValue(&val) );
    JSString *propertyString = val.toString(); const char *propertyName=JS_EncodeString(cx, propertyString);      
    //printf("SetShaderProperty: %s\n", propertyName ); 

    Texture *texture=(Texture *) JS_GetPrivate( object );
  
    return true;
}

static JSFunctionSpec texture_functions[] = {
    JS_FS( "create", Texture_create, 0, 0 ),
    JS_FS( "bind", Texture_bind, 0, 0 ),
    JS_FS( "update", Texture_update, 0, 0 ),
    JS_FS( "release", Texture_release, 0, 0 ),
    JS_FS( "dispose", Texture_dispose, 0, 0 ),

    JS_FS_END
};
  
// --------------------------------------------------------------- 

JSClass TextureClass = 
{ 
    "Texture", JSCLASS_HAS_PRIVATE, JS_PropertyStub, NULL,//JS_PropertyStub,
    JS_PropertyStub, JS_StrictPropertyStub,
    JS_EnumerateStub, JS_ResolveStub, JS_ConvertStub, NULL//JSCustomer :: JSDestructor
};

bool TextureConstructor( JSContext *cx, unsigned argc, jsval *vp )
{
    printf( "Texture Constructor!%d\n", argc );

    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    JSObject *object = JS_NewObjectForConstructor( cx, &TextureClass, args );
    RootedObject obj(cx, object ); RootedValue v(cx, JS::UndefinedValue() );
    JS_DefineFunctions( cx, HandleObject(obj), texture_functions );

    if ( argc >= 1 ) {
        JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

        JSObject *images = &args[0].toObject();
        bool cube=false;

        if ( argc >=2 ) cube=args[1].toBoolean();

        Texture *texture=new Texture( cx, images, cube );// JS_EncodeString(cx, vs), JS_EncodeString(cx, fs) );

        JS_SetPrivate( object, texture );
        args.rval().set( OBJECT_TO_JSVAL( object ) );
    }

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

JSObject *registerTexture( JSContext *cx, JSObject *object )
{
    RootedObject obj(cx, object ); RootedObject parentobj(cx);

    JSObject * newObject=JS_InitClass( cx, HandleObject(obj), HandleObject(parentobj), &TextureClass,  
        TextureConstructor, 0,
        NULL, NULL,
        NULL, NULL);

    return newObject;
}
