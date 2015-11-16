/*
 * Copyright (c) 2015 Markus Moenig <markusm@visualgraphics.tv>
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

#include "jswrapper_sm.hpp"

// ------------------------------------------------------- JSWrapperObject

JSWrapperObject::JSWrapperObject( JSContext *cx, JSObject *object ) : m_cx( cx )
{
    m_rawValue=new JS::Value( JS::ObjectValue( *object ) );
    js::AddRawValueRoot( m_cx, m_rawValue, "Protected_JSWrapperObject" );    
}

JSWrapperObject::JSWrapperObject( JSWrapperObject *obj  ) : m_cx( obj->m_cx )
{
    m_rawValue=new JS::Value( *obj->m_rawValue );
    js::AddRawValueRoot( m_cx, m_rawValue, "Protected_JSWrapperObject" );    
}

JSWrapperObject::~JSWrapperObject()
{
    if ( m_rawValue ) {
        js::RemoveRawValueRoot( m_cx, m_rawValue );
        delete m_rawValue;
    }
}

JSWrapperObject *JSWrapperObject::copy( void )
{
    JSWrapperObject *object=new JSWrapperObject( this );
    return object;
}

// --- Getter/Setter

bool JSWrapperObject::get( const char *name, JSWrapperData *data )
{
    RootedObject object( m_cx, &m_rawValue->toObject() );

    Rooted<Value> rcValue( m_cx );
    bool ok=JS_GetProperty( m_cx, HandleObject(object), name, MutableHandleValue(&rcValue) );

    if ( data )
    {
        if ( rcValue.isString() )
        {
            JSString *jsstring = rcValue.toString();
            const char *stringData=JS_EncodeString( m_cx, jsstring );

            data->setString( stringData );
            JS_free( m_cx, (void *) stringData );
        } else
        if ( rcValue.isNumber() )
        {
            data->setNumber( rcValue.toNumber() );
        } else
        if ( rcValue.isBoolean() )
        {
            data->setBoolean( rcValue.toBoolean() );
        } else
        if ( rcValue.isObject() )
        {
            data->setObject( new JSWrapperObject( m_cx, &rcValue.toObject() ) );
        } else
        if ( rcValue.isNull() )
        {
            data->setNull();
        } else data->setUndefined();
    }

    return ok;
}

void JSWrapperObject::set( const char *name,  JSWrapperData& data )
{
    RootedObject object( m_cx, &m_rawValue->toObject() );

    if ( data.type() == JSWrapperData::Number )
    {
        RootedValue value( m_cx ); value.setDouble( data.toNumber() );
        JS_SetProperty( m_cx, HandleObject(object), name, MutableHandleValue(&value) );
    } else
    if ( data.type() == JSWrapperData::String )
    {
        JSString *string = JS_NewStringCopyN( m_cx, data.toString().c_str(), data.toString().length() );
        RootedValue value( m_cx ); value.setString( string );
        JS_SetProperty( m_cx, HandleObject(object), name, MutableHandleValue(&value) );
    } else
    if ( data.type() == JSWrapperData::Boolean )
    {
        RootedValue value( m_cx ); value.setBoolean( data.toBoolean() );
        JS_SetProperty( m_cx, HandleObject(object), name, MutableHandleValue(&value) );        
    } else
    if ( data.type() == JSWrapperData::Object )
    {
        RootedValue value( m_cx ); value.setObject( data.object()->getSMValue()->toObject() );
        JS_SetProperty( m_cx, HandleObject(object), name, MutableHandleValue(&value) );        
    } else if ( data.type() == JSWrapperData::Null )
    {
        RootedValue value( m_cx ); value.setNull();
        JS_SetProperty( m_cx, HandleObject(object), name, MutableHandleValue(&value) );   
    } else
    {
        RootedValue value( m_cx ); value.setUndefined();
        JS_SetProperty( m_cx, HandleObject(object), name, MutableHandleValue(&value) );   
    }
}

// --- call

bool JSWrapperObject::call( JSWrapperArguments *args, JSWrapperObject *object, JSWrapperData *data )
{
    AutoValueVector vector( m_cx );
    if ( args ) fillArgs( &vector, args );

    RootedObject contextObject( m_cx, &object->getSMValue()->toObject() );

    JS::RootedValue fun( m_cx, *m_rawValue );  

    Rooted<Value> rcValue( m_cx );
    bool ok=JS::Call( m_cx, HandleObject( contextObject ), HandleValue( fun ), HandleValueArray( vector ), &rcValue );

    if ( data )
    {
        if ( rcValue.isString() )
        {
            JSString *jsstring = rcValue.toString();
            const char *stringData=JS_EncodeString( m_cx, jsstring );

            data->setString( stringData );
            JS_free( m_cx, (void *) stringData );
        } else
        if ( rcValue.isNumber() )
        {
            data->setNumber( rcValue.toNumber() );
        } else
        if ( rcValue.isBoolean() )
        {
            data->setBoolean( rcValue.toBoolean() );
        } else
        if ( rcValue.isObject() )
        {
            data->setObject( new JSWrapperObject( m_cx, &rcValue.toObject() ) );
        } else
        if ( rcValue.isNull() )
        {
            data->setNull();
        } else data->setUndefined();
    }

    return ok;    
}

// --- Register Function

bool JSWrapperObject::registerFunction( const char *funcName, bool (*func) (JSContext *cx, unsigned argc, jsval *vp), int minArgs )
{
    RootedObject object( m_cx, &m_rawValue->toObject() );

    bool ok = JS_DefineFunction( m_cx, HandleObject(object), funcName, func, minArgs, 0);
    return ok;
}

// --- Classes

JSWrapperClass *JSWrapperObject::createClass( const char *className, bool (*constructor) (JSContext *cx, unsigned argc, jsval *vp) )
{
    JSWrapperClass *wrapperClass=new JSWrapperClass( m_cx, className, this, constructor );

    return wrapperClass;
}

// --- Arrays

void JSWrapperObject::getArrayLength( unsigned int *length ) 
{
    unsigned int len;
    RootedObject object( m_cx, &m_rawValue->toObject() );
    JS_GetArrayLength( m_cx, HandleObject( object ), &len );
    *length=len;
}

void JSWrapperObject::getArrayElement( unsigned int index, JSWrapperData *data ) 
{
    RootedObject object( m_cx, &m_rawValue->toObject() );
    Rooted<Value> rcValue( m_cx );    
    JS_GetElement( m_cx, HandleObject( object ), index, &rcValue );

    if ( data )
    {
        if ( rcValue.isString() )
        {
            JSString *jsstring = rcValue.toString();
            const char *stringData=JS_EncodeString( m_cx, jsstring );

            data->setString( stringData );
            JS_free( m_cx, (void *) stringData );
        } else
        if ( rcValue.isNumber() )
        {
            data->setNumber( rcValue.toNumber() );
        } else
        if ( rcValue.isBoolean() )
        {
            data->setBoolean( rcValue.toBoolean() );
        } else
        if ( rcValue.isObject() )
        {
            data->setObject( new JSWrapperObject( m_cx, &rcValue.toObject() ) );
        } else
        if ( rcValue.isNull() )
        {
            data->setNull();
        } else data->setUndefined();
    }    
}

// --- Fill Arguments

void JSWrapperObject::fillArgs( AutoValueVector *vector, JSWrapperArguments *args )
{
    for( int i=0; i < args->count(); ++i )
    {
        JSWrapperData arg=args->at( i );

        switch( arg.type() )
        {
            case JSWrapperData::Number:
            {
                Rooted<Value> value( m_cx );
                value.setDouble( arg.toNumber() );

                vector->append( value );
            }
            break;

            case JSWrapperData::String:
            {
                JSString *string = JS_NewStringCopyN( m_cx, arg.toString().c_str(), arg.toString().length() );
                RootedValue value( m_cx ); value.setString( string );

                vector->append( value );
            }
            break;            

            case JSWrapperData::Boolean:
            {
                Rooted<Value> value( m_cx );
                value.setBoolean( arg.toBoolean() );

                vector->append( value );
            }
            break;   

            case JSWrapperData::Object:
            {
                Rooted<Value> value( m_cx );
                value.setObject( arg.object()->getSMValue()->toObject() );

                vector->append( value );
            }
            break;

            case JSWrapperData::Null:
            {
                Rooted<Value> value( m_cx );
                value.setNull();

                vector->append( value );
            }
            break; 

            case JSWrapperData::Undefined:
            {
                Rooted<Value> value( m_cx );
                value.setUndefined();

                vector->append( value );
            }
            break;             
        }
    }
}
