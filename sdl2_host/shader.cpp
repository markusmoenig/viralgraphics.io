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

#include "shader.hpp"

// --------------------------------------------------------------- Member Functions

bool Shader_create(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    Shader *shader=(Shader *) JS_GetPrivate( &value.toObject() );
    shader->create();
    return true;
}

bool Shader_bind(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    Shader *shader=(Shader *) JS_GetPrivate( &value.toObject() );
    shader->bind();
    return true;
}

bool Shader_release(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    Shader *shader=(Shader *) JS_GetPrivate( &value.toObject() );
    shader->release();
    return true;
}

bool Shader_dispose(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    Shader *shader=(Shader *) JS_GetPrivate( &value.toObject() );
    shader->dispose();

    //TODO VG.Renderer().removeResource(this);
    
    return true;
}

bool Shader_getUniform( JSContext *cx, unsigned argc, jsval *vp )
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    if ( argc == 1 && args[0].isString() ) {
        Shader *shader=(Shader *) JS_GetPrivate( &value.toObject() );
        JSString *name = args[0].toString();
        GLuint uniform=shader->getUniform( JS_EncodeString(cx, name) );

        args.rval().set( UINT_TO_JSVAL( uniform ) );
    }
    return true;
}

bool Shader_getAttrib( JSContext *cx, unsigned argc, jsval *vp )
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    if ( argc == 1 && args[0].isString() ) {
        Shader *shader=(Shader *) JS_GetPrivate( &value.toObject() );
        JSString *name = args[0].toString();
        GLuint attribute=shader->getAttrib( JS_EncodeString(cx, name) );

        args.rval().set( UINT_TO_JSVAL( attribute ) );
    }
    return true;
}

bool Shader_setFloat( JSContext *cx, unsigned argc, jsval *vp )
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    if ( argc == 2 ) {
        Shader *shader=(Shader *) JS_GetPrivate( &value.toObject() );        
        GLint id=-1;

        if ( args[0].isString() ) {
            JSString *name = args[0].toString();
            id=shader->getUniform( JS_EncodeString(cx, name) );
        } else
        if ( args[0].isNumber() ) {
            id=args[0].toInt32();
        }

        if ( id != -1 && args[1].isObject() )
        {
            GLfloat values[4];

            unsigned int length; RootedObject rootedObject(cx, &args[1].toObject() );
            JS_GetArrayLength( cx, HandleObject( rootedObject ), &length );

            RootedValue val(cx);
            for(int i = 0; i < length; i++)
            {
                JS_GetElement( cx, HandleObject( rootedObject ), i, MutableHandleValue(&val) );
                values[i]=val.toNumber();
            }
            shader->setFloat( id, length, values );
        } else
        if ( id != -1 && args[1].isNumber() )
        {
            float v=args[1].toNumber();
            shader->setFloat( id, 1, &v );
        }
    }
    return true;
}

bool Shader_setTexture( JSContext *cx, unsigned argc, jsval *vp )
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    if ( argc == 3 ) {
        Shader *shader=(Shader *) JS_GetPrivate( &value.toObject() );        
        GLint id=-1;

        if ( args[0].isString() ) {
            JSString *name = args[0].toString();
            id=shader->getUniform( JS_EncodeString(cx, name) );
        } else
        if ( args[0].isNumber() ) {
            id=args[0].toInt32();
        }

        if ( id != -1 && args[1].isObject() )
        {
            shader->setTexture( id, &args[1].toObject(), args[2].toInt32() );
        }
    }

    return true;
}

bool Shader_setColor( JSContext *cx, unsigned argc, jsval *vp )
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    if ( argc == 2 ) {
        Shader *shader=(Shader *) JS_GetPrivate( &value.toObject() );        
        GLint id=-1;

        if ( args[0].isString() ) {
            JSString *name = args[0].toString();
            id=shader->getUniform( JS_EncodeString(cx, name) );
        } else
        if ( args[0].isNumber() ) {
            id=args[0].toInt32();
        }

        if ( id != -1 && args[1].isObject() )
        {
            RootedObject object(cx, &args[1].toObject() );
            RootedValue red(cx), green(cx), blue(cx), alpha(cx);

            JS_GetProperty( cx, HandleObject(object), "r", MutableHandleValue(&red) );
            JS_GetProperty( cx, HandleObject(object), "g", MutableHandleValue(&green) );
            JS_GetProperty( cx, HandleObject(object), "b", MutableHandleValue(&blue) );
            JS_GetProperty( cx, HandleObject(object), "a", MutableHandleValue(&alpha) );

            shader->setColor( id, red.toNumber(), green.toNumber(), blue.toNumber(), alpha.toNumber() );
        }
    }
    return true;    
}

bool Shader_setColor3( JSContext *cx, unsigned argc, jsval *vp )
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    if ( argc == 2 ) {
        Shader *shader=(Shader *) JS_GetPrivate( &value.toObject() );        
        GLint id=-1;

        if ( args[0].isString() ) {
            JSString *name = args[0].toString();
            id=shader->getUniform( JS_EncodeString(cx, name) );
        } else
        if ( args[0].isNumber() ) {
            id=args[0].toInt32();
        }

        if ( id != -1 && args[1].isObject() )
        {
            RootedObject object(cx, &args[1].toObject() );
            RootedValue red(cx), green(cx), blue(cx);

            JS_GetProperty( cx, HandleObject(object), "r", MutableHandleValue(&red) );
            JS_GetProperty( cx, HandleObject(object), "g", MutableHandleValue(&green) );
            JS_GetProperty( cx, HandleObject(object), "b", MutableHandleValue(&blue) );

            shader->setColor3( id, red.toNumber(), green.toNumber(), blue.toNumber() );
        }
    }
    return true;    
}

bool Shader_setInt( JSContext *cx, unsigned argc, jsval *vp )
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    if ( argc == 2 ) {
        Shader *shader=(Shader *) JS_GetPrivate( &value.toObject() );        
        GLint id=-1;

        if ( args[0].isString() ) {
            JSString *name = args[0].toString();
            id=shader->getUniform( JS_EncodeString(cx, name) );
        } else
        if ( args[0].isNumber() ) {
            id=args[0].toInt32();
        }

        if ( id != -1 && args[1].isObject() )
        {
            GLuint values[4];

            unsigned int length; RootedObject rootedObject(cx, &args[1].toObject() );
            JS_GetArrayLength( cx, HandleObject( rootedObject ), &length );

            RootedValue val(cx);
            for(int i = 0; i < length; i++)
            {
                JS_GetElement( cx, HandleObject( rootedObject ), i, MutableHandleValue(&val) );
                values[i]=val.toInt32();
            }
            shader->setInt( id, length, values );
        } else
        if ( id != -1 && args[1].isNumber() )
        {
            unsigned int v;
            JS::ToUint32( cx, args[1], &v );
            shader->setInt( id, 1, &v );
        }
    }
    return true;
}

bool Shader_setMatrix( JSContext *cx, unsigned argc, jsval *vp )
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp ); Value value=args.computeThis( cx );

    bool transpose=false;
    if ( argc == 3 ) args[2].toBoolean();

    if ( argc >= 2 ) {
        Shader *shader=(Shader *) JS_GetPrivate( &value.toObject() );        
        GLint id=-1;

        if ( args[0].isString() ) {
            JSString *name = args[0].toString();
            id=shader->getUniform( JS_EncodeString(cx, name) );
        } else
        if ( args[0].isNumber() ) {
            id=args[0].toInt32();
        }

        if ( id != -1 && args[1].isObject() )
        {
            GLfloat values[16];

            unsigned int length; RootedObject rootedObject(cx, &args[1].toObject() );
            JS_GetArrayLength( cx, HandleObject( rootedObject ), &length );

            RootedValue val(cx);
            for(int i = 0; i < length; i++)
            {
                JS_GetElement( cx, HandleObject( rootedObject ), i, MutableHandleValue(&val) );
                values[i]=val.toNumber();
            }
            shader->setMatrix( id, length, values, transpose );
        } 
    }
    return true;
}

// --------------------------------------------------------------- Properties

bool GetShaderProperty( JSContext *cx, Handle<JSObject *> object, Handle<jsid> id, MutableHandle<Value> value )
{
    RootedValue val(cx); JS_IdToValue( cx, id, MutableHandleValue(&val) );
    JSString *propertyString = val.toString(); const char *propertyName=JS_EncodeString(cx, propertyString);    
    //printf("GetShaderProperty: %s\n", propertyName ); 
    
    Shader *shader=(Shader *) JS_GetPrivate( object );

    if ( !strcmp( propertyName, "blendType" ) ) {
        value.set( INT_TO_JSVAL( shader->blendType ) );
    } else   
    if ( !strcmp( propertyName, "depthWrite" ) ) {
        value.set( BOOLEAN_TO_JSVAL( shader->depthWrite ) );
    } else
    if ( !strcmp( propertyName, "depthTest" ) ) {
        value.set( BOOLEAN_TO_JSVAL( shader->depthTest ) );
    } else
    if ( !strcmp( propertyName, "culling" ) ) {
        value.set( BOOLEAN_TO_JSVAL( shader->culling ) );
    }  
    return true;    
}

bool SetShaderProperty( JSContext *cx, Handle<JSObject *> object, Handle<jsid> id, bool, MutableHandle<Value> value)
{
    RootedValue val(cx); JS_IdToValue( cx, id, MutableHandleValue(&val) );
    JSString *propertyString = val.toString(); const char *propertyName=JS_EncodeString(cx, propertyString);    
    //printf("SetShaderProperty: %s\n", propertyName ); 

    Shader *shader=(Shader *) JS_GetPrivate( object );

    if ( !strcmp( propertyName, "blendType" ) ) {
        shader->blendType=value.toInt32();
    } else
    if ( !strcmp( propertyName, "depthWrite" ) ) {
        shader->depthWrite=value.toBoolean();
    } else
    if ( !strcmp( propertyName, "depthTest" ) ) {
        shader->depthTest=value.toBoolean();
    } else
    if ( !strcmp( propertyName, "culling" ) ) {
        shader->culling=value.toBoolean();
    }    
    return true;
}

static JSFunctionSpec shader_functions[] = {
    JS_FS( "create", Shader_create, 0, 0 ),
    JS_FS( "bind", Shader_bind, 0, 0 ),
    JS_FS( "release", Shader_release, 0, 0 ),
    JS_FS( "dispose", Shader_dispose, 0, 0 ),
    JS_FS( "getUniform", Shader_getUniform, 0, 0 ),
    JS_FS( "getAttrib", Shader_getAttrib, 0, 0 ),
    JS_FS( "setFloat", Shader_setFloat, 0, 0 ),
    JS_FS( "setTexture", Shader_setTexture, 0, 0 ),
    JS_FS( "setColor", Shader_setColor, 0, 0 ),
    JS_FS( "setColor3", Shader_setColor3, 0, 0 ),
    JS_FS( "setInt", Shader_setInt, 0, 0 ),
    JS_FS( "setMatrix", Shader_setMatrix, 0, 0 ),

    JS_FS_END
};
 
// --------------------------------------------------------------- 

JSClass ShaderClass = 
{ 
    "Shader", JSCLASS_HAS_PRIVATE, JS_PropertyStub, NULL,
    JS_PropertyStub, JS_StrictPropertyStub,
    JS_EnumerateStub, JS_ResolveStub, JS_ConvertStub, NULL
};

bool ShaderConstructor( JSContext *cx, unsigned argc, jsval *vp )
{
    //printf( "Shader Constructor!%d\n", argc );

    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    JSObject *object = JS_NewObjectForConstructor( cx, &ShaderClass, args );
    RootedObject obj(cx, object ); RootedValue v(cx, JS::UndefinedValue() );
    JS_DefineFunctions( cx, HandleObject(obj), shader_functions );
    JS_DefineProperty( cx, HandleObject(obj), "blendType", HandleValue(&v), JSPROP_SHARED, (JSPropertyOp) GetShaderProperty, (JSStrictPropertyOp) SetShaderProperty );
    JS_DefineProperty( cx, HandleObject(obj), "depthWrite", HandleValue(&v), JSPROP_SHARED, (JSPropertyOp) GetShaderProperty, (JSStrictPropertyOp) SetShaderProperty );
    JS_DefineProperty( cx, HandleObject(obj), "depthTest", HandleValue(&v), JSPROP_SHARED, (JSPropertyOp) GetShaderProperty, (JSStrictPropertyOp) SetShaderProperty );
    JS_DefineProperty( cx, HandleObject(obj), "culling", HandleValue(&v), JSPROP_SHARED, (JSPropertyOp) GetShaderProperty, (JSStrictPropertyOp) SetShaderProperty );

    if ( argc == 2 ) {
        JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

        JSString *vs = args[0].toString();
        JSString *fs = args[1].toString();

        Shader *shader=new Shader( cx, JS_EncodeString(cx, vs), JS_EncodeString(cx, fs) );

        JS_SetPrivate( object, shader );
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

JSObject *registerShader( JSContext *cx, JSObject *object )
{
    RootedObject obj(cx, object ); RootedObject parentobj(cx);

    JSObject * newObject=JS_InitClass( cx, HandleObject(obj), HandleObject(parentobj), &ShaderClass,  
        ShaderConstructor, 0,
        NULL, NULL,
        NULL, NULL);

    return newObject;
}
