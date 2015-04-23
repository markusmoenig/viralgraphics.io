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
#include "gpubuffer.hpp"

std::vector<int> GPUBuffer::enabledAttribs;

void GPUBuffer::enableAttrib(int index)
{
    enabledAttribs.push_back(index);
    glEnableVertexAttribArray(index);
}

void GPUBuffer::purgeAttribs()
{ 
    for (size_t i = 0; i < enabledAttribs.size(); i++)
    {
        int index = enabledAttribs[i];

        if (index == 0) continue;

        glDisableVertexAttribArray(index);
    } 

    enabledAttribs.clear();
}




// --------------------------------------------------------------- Member Functions

bool GPUBuffer_getSize(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    GPUBuffer *buffer=(GPUBuffer *) JS_GetPrivate( &value.toObject() );
     args.rval().set( INT_TO_JSVAL( buffer->getSize() ) );
    return true;
}

bool GPUBuffer_getStride(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    GPUBuffer *buffer=(GPUBuffer *) JS_GetPrivate( &value.toObject() );
     args.rval().set( INT_TO_JSVAL( buffer->getStride() ) );
    return true;
}

bool GPUBuffer_create(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    GPUBuffer *buffer=(GPUBuffer *) JS_GetPrivate( &value.toObject() );
    buffer->create();
    return true;
}

bool GPUBuffer_setBuffer(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    if ( argc == 2 )
    {
        GPUBuffer *buffer=(GPUBuffer *) JS_GetPrivate( &value.toObject() );

        GLuint offset; JS::ToUint32( cx, args[0], &offset );
        buffer->setBuffer( offset, args[1].toNumber() );
    }
    return true;
}

bool GPUBuffer_getBuffer(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    if ( argc == 1 )
    {
        GPUBuffer *buffer=(GPUBuffer *) JS_GetPrivate( &value.toObject() );

        GLuint offset; JS::ToUint32( cx, args[0], &offset );

        buffer->setBuffer( offset, args[1].toNumber() );

        switch ( buffer->type )
        {
            case 0://VG.Type.Float:
            {
                GLfloat *buf=(GLfloat*) buffer->data;
                args.rval().set( JS_NumberValue( buf[offset] ) );
                break;
            }
            case 1://VG.Type.Uint8:
            {
                args.rval().set( INT_TO_JSVAL( buffer->data[offset] ) );
                break;
            }
            case 2://VG.Type.Uint16:
            {
                GLushort *buf=(GLushort*)buffer->data;
                args.rval().set( INT_TO_JSVAL( buf[offset] ) );
                break;
            }
        }
        
    }

    return true;
}

bool GPUBuffer_bind(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    GPUBuffer *buffer=(GPUBuffer *) JS_GetPrivate( &value.toObject() );
    buffer->bind();
    return true;
}

bool GPUBuffer_update(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    GLuint offset=0, count=0;
    bool nobind=false;

    if ( argc >= 1 ) JS::ToUint32( cx, args[0], &offset );
    if ( argc >= 2 ) JS::ToUint32( cx, args[1], &count );
    if ( argc >= 3 ) nobind=args[2].toBoolean();

    GPUBuffer *buffer=(GPUBuffer *) JS_GetPrivate( &value.toObject() );
    buffer->update( offset, count, nobind );
    return true;
}

bool GPUBuffer_release(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    GPUBuffer *buffer=(GPUBuffer *) JS_GetPrivate( &value.toObject() );
    buffer->release();
    return true;
}

bool GPUBuffer_dispose(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    GPUBuffer *buffer=(GPUBuffer *) JS_GetPrivate( &value.toObject() );
    buffer->dispose();

    //TODO VG.Renderer().removeResource(this);
    
    return true;
}

bool GPUBuffer_vertexAttrib(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    if ( argc == 5 )
    {
        GPUBuffer *buffer=(GPUBuffer *) JS_GetPrivate( &value.toObject() );

        GLuint index, size, stride, offset;
        bool norm=args[2].toBoolean();

        JS::ToUint32( cx, args[0], &index );
        JS::ToUint32( cx, args[1], &size );
        JS::ToUint32( cx, args[3], &stride );
        JS::ToUint32( cx, args[4], &offset );

        buffer->vertexAttrib( index, size, norm, stride, offset );
    }
    return true;
}

bool GPUBuffer_draw(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    if ( argc >= 3 )
    {
        GPUBuffer *buffer=(GPUBuffer *) JS_GetPrivate( &value.toObject() );

        GLint primType=args[0].toInt32();
        GLuint offset, count;
        bool nobind=false;
        if ( argc >= 4 ) nobind=args[3].toBoolean();

        JS::ToUint32( cx, args[1], &offset );
        JS::ToUint32( cx, args[2], &count );

        buffer->draw( primType, offset, count, nobind );
    }
    return true;
}

bool GPUBuffer_drawIndexed(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    if ( argc >= 4 )
    {
        GPUBuffer *buffer=(GPUBuffer *) JS_GetPrivate( &value.toObject() );

        GLint primType=args[0].toInt32(), offset=args[1].toInt32(), count=args[2].toInt32();
        //GLint indexType=args[3].toInt32();

        bool nobind=false;
        if ( argc >= 5 ) nobind=args[4].toBoolean();
        // TODO 4
        buffer->drawIndexed( primType, offset, count, 0, nobind );
    }
    return true;
}

// --------------------------------------------------------------- Properties

bool GetGPUBufferProperty( JSContext *cx, Handle<JSObject *> object, Handle<jsid> id, MutableHandle<Value> value )
{
    RootedValue val(cx); JS_IdToValue( cx, id, MutableHandleValue(&val) );
    JSString *propertyString = val.toString(); const char *propertyName=JS_EncodeString(cx, propertyString);    
    printf("GPUBufferProperty: %s\n", propertyName ); 
    
    GPUBuffer *buffer=(GPUBuffer *) JS_GetPrivate( object );

    if ( !strcmp( propertyName, "usage" ) ) {
        value.set( INT_TO_JSVAL( buffer->usage ) );
    }
    if ( !strcmp( propertyName, "target" ) ) {
        value.set( INT_TO_JSVAL( buffer->target ) );
    }
    if ( !strcmp( propertyName, "size" ) ) {
        value.set( INT_TO_JSVAL( buffer->size ) );
    }
    if ( !strcmp( propertyName, "elemType" ) ) {
        value.set( INT_TO_JSVAL( buffer->elemType ) );
    }
    if ( !strcmp( propertyName, "stride" ) ) {
        value.set( INT_TO_JSVAL( buffer->stride ) );
    }
    if ( !strcmp( propertyName, "type" ) ) {
        value.set( INT_TO_JSVAL( buffer->type ) );
    }

    return true;    
}

bool SetGPUBufferProperty( JSContext *cx, Handle<JSObject *> object, Handle<jsid> id, bool, MutableHandle<Value> value)
{
    RootedValue val(cx); JS_IdToValue( cx, id, MutableHandleValue(&val) );
    JSString *propertyString = val.toString(); const char *propertyName=JS_EncodeString(cx, propertyString);    
    printf("SetGPUBufferProperty: %s\n", propertyName ); 

    GPUBuffer *buffer=(GPUBuffer *) JS_GetPrivate( object );

    if ( !strcmp( propertyName, "usage" ) ) {
        JS::ToUint32( cx, val, &buffer->usage );
    }
    if ( !strcmp( propertyName, "target" ) ) {
        JS::ToUint32( cx, value, &buffer->target );
    }
    if ( !strcmp( propertyName, "size" ) ) {
        JS::ToUint32( cx, value, &buffer->size );
    }
    if ( !strcmp( propertyName, "elemType" ) ) {
        JS::ToUint32( cx, value, &buffer->elemType );
    }
    if ( !strcmp( propertyName, "stride" ) ) {
        JS::ToUint32( cx, value, &buffer->stride );
    }
    if ( !strcmp( propertyName, "type" ) ) {
        JS::ToUint32( cx, value, &buffer->type );
    }

    return true;
}

static JSFunctionSpec gpubuffer_functions[] = {
    JS_FS( "getSize", GPUBuffer_getSize, 0, 0 ),
    JS_FS( "getStride", GPUBuffer_getStride, 0, 0 ),
    JS_FS( "create", GPUBuffer_create, 0, 0 ),
    JS_FS( "setBuffer", GPUBuffer_setBuffer, 0, 0 ),
    JS_FS( "getBuffer", GPUBuffer_getBuffer, 0, 0 ),
    JS_FS( "bind", GPUBuffer_bind, 0, 0 ),
    JS_FS( "update", GPUBuffer_update, 0, 0 ),
    JS_FS( "release", GPUBuffer_release, 0, 0 ),
    JS_FS( "dispose", GPUBuffer_dispose, 0, 0 ),
    JS_FS( "vertexAttrib", GPUBuffer_vertexAttrib, 0, 0 ),
    JS_FS( "draw", GPUBuffer_draw, 0, 0 ),
    JS_FS( "drawIndexed", GPUBuffer_drawIndexed, 0, 0 ),

    JS_FS_END
};
 
// --------------------------------------------------------------- 

JSClass GPUBufferClass = 
{ 
    "GPUBuffer", JSCLASS_HAS_PRIVATE, JS_PropertyStub, NULL,
    JS_PropertyStub, JS_StrictPropertyStub,
    JS_EnumerateStub, JS_ResolveStub, JS_ConvertStub, NULL
};

bool GPUBufferConstructor( JSContext *cx, unsigned argc, jsval *vp )
{
    //printf( "GPUBuffer Constructor!%d\n", argc );

    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    JSObject *object = JS_NewObjectForConstructor( cx, &GPUBufferClass, args );
    RootedObject obj(cx, object ); RootedValue v(cx, JS::UndefinedValue() );
    JS_DefineFunctions( cx, HandleObject(obj), gpubuffer_functions );

    JS_DefineProperty( cx, HandleObject(obj), "usage", HandleValue(&v), JSPROP_SHARED, (JSPropertyOp) GetGPUBufferProperty, (JSStrictPropertyOp) SetGPUBufferProperty );
    JS_DefineProperty( cx, HandleObject(obj), "target", HandleValue(&v), JSPROP_SHARED, (JSPropertyOp) GetGPUBufferProperty, (JSStrictPropertyOp) SetGPUBufferProperty );
    JS_DefineProperty( cx, HandleObject(obj), "size", HandleValue(&v), JSPROP_SHARED, (JSPropertyOp) GetGPUBufferProperty, (JSStrictPropertyOp) SetGPUBufferProperty );
    JS_DefineProperty( cx, HandleObject(obj), "elemType", HandleValue(&v), JSPROP_SHARED, (JSPropertyOp) GetGPUBufferProperty, (JSStrictPropertyOp) SetGPUBufferProperty );
    JS_DefineProperty( cx, HandleObject(obj), "stride", HandleValue(&v), JSPROP_SHARED, (JSPropertyOp) GetGPUBufferProperty, (JSStrictPropertyOp) SetGPUBufferProperty );
    JS_DefineProperty( cx, HandleObject(obj), "type", HandleValue(&v), JSPROP_SHARED, (JSPropertyOp) GetGPUBufferProperty, (JSStrictPropertyOp) SetGPUBufferProperty );

    if ( argc >= 3 ) {
        JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

        int type=args[0].toInt32();
        GLuint size; JS::ToUint32( cx, args[1], &size );
        int dynamic=args[2].toInt32();

        bool isIndexBuffer=false;
        if ( argc >= 4 ) isIndexBuffer=args[3].toBoolean();

        GPUBuffer *buffer = new GPUBuffer( type, size, dynamic, isIndexBuffer );

        JS_SetPrivate( object, buffer );
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

JSObject *registerGPUBuffer( JSContext *cx, JSObject *object )
{
    RootedObject obj(cx, object ); RootedObject parentobj(cx);

    JSObject * newObject=JS_InitClass( cx, HandleObject(obj), HandleObject(parentobj), &GPUBufferClass,  
        GPUBufferConstructor, 0,
        NULL, NULL,
        NULL, NULL);

    return newObject;    
}
