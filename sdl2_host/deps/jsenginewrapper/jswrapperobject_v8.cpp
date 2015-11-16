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
#include "jswrapper_v8.hpp"

using namespace v8;

// ------------------------------------------------------- JSWrapperObject

JSWrapperObject::JSWrapperObject( Isolate *isolate, Local<Object> obj ) : m_isolate( isolate ), m_obj( isolate, obj )
{
}

JSWrapperObject::JSWrapperObject( JSWrapperObject *object ) : m_isolate( object->m_isolate ), m_obj( object->m_isolate, object->m_obj.Get( m_isolate ) )
{
}

JSWrapperObject *JSWrapperObject::copy( void )
{
    JSWrapperObject *object=new JSWrapperObject( this );
    return object;
}

// --- Getter/Setter

bool JSWrapperObject::get( const char *name, JSWrapperData *data )
{
    HandleScope handle_scope( m_isolate );

    Local<String> nameValue = String::NewFromUtf8( m_isolate, name, NewStringType::kNormal ).ToLocalChecked();
    Local<Value> result=m_obj.Get( m_isolate )->Get( nameValue );

    if ( data )
    {
        if ( result->IsNumber() )
            data->setNumber( result->ToNumber()->Value() );
        else
        if ( result->IsString() )
        {
            String::Utf8Value utf8( result );
            data->setString( *utf8 );
        } else
        if ( result->IsBoolean() )
            data->setBoolean( result->ToBoolean()->Value() );
        else                
        if ( result->IsObject() )
            data->setObject( new JSWrapperObject( m_isolate, result->ToObject() ) );
        else
        if ( result->IsNull() )
            data->setNull();
        else data->setUndefined();
    }

    return true;
}

void JSWrapperObject::set( const char *name, JSWrapperData& data )
{
    Local<String> nameValue = String::NewFromUtf8( m_isolate, name, NewStringType::kNormal ).ToLocalChecked();

    if ( data.type() == JSWrapperData::Number )
    {
        Local<Value> value=Number::New( m_isolate, data.toNumber() );
        m_obj.Get( m_isolate )->Set( nameValue, value );
    } else
    if ( data.type() == JSWrapperData::String )
    {
        Local<String> value = String::NewFromUtf8( m_isolate, data.toString().c_str(), NewStringType::kNormal ).ToLocalChecked();
        m_obj.Get( m_isolate )->Set( nameValue, value );        
    } else
    if ( data.type() == JSWrapperData::Boolean )
    {
        Local<Value> value=Boolean::New( m_isolate, data.toBoolean() );
        m_obj.Get( m_isolate )->Set( nameValue, value );
    } else
    if ( data.type() == JSWrapperData::Object )
    {
        m_obj.Get( m_isolate )->Set( nameValue, data.object()->m_obj.Get( m_isolate ) );
    } else
    if ( data.type() == JSWrapperData::Null )
    {
        m_obj.Get( m_isolate )->Set( nameValue, v8::Null( m_isolate ) );        
    } else m_obj.Get( m_isolate )->Set( nameValue, v8::Undefined( m_isolate ) );
}

// --- Call Function

bool JSWrapperObject::call( JSWrapperArguments *args, JSWrapperObject *object, JSWrapperData *data )
{
    int argc = 0; std::vector<Local<Value>> argv;    
    if ( args ) {
        argc=args->count();
        fillArgs( &argv, args );
    }

    Local<Value> result=m_obj.Get( m_isolate )->CallAsFunction( object->m_obj.Get( m_isolate ), argc, &argv[0] );

    if ( data )
    {
        if ( result->IsNumber() )
            data->setNumber( result->ToNumber()->Value() );
        else
        if ( result->IsString() )
        {
            String::Utf8Value utf8( result );
            data->setString( *utf8 );
        } else
        if ( result->IsBoolean() )
            data->setBoolean( result->ToBoolean()->Value() );
        else                
        if ( result->IsObject() )
            data->setObject( new JSWrapperObject( m_isolate, result->ToObject() ) );
        else
        if ( result->IsNull() )
            data->setNull();
        else data->setUndefined();
    }

    return true;    
}

// --- Register Function

bool JSWrapperObject::registerFunction( const char *funcName, void (*func) ( const FunctionCallbackInfo<Value>& args ) )
{
    m_obj.Get( m_isolate )->Set( String::NewFromUtf8( m_isolate, funcName ), FunctionTemplate::New( m_isolate, func )->GetFunction() );
    return true;
}

// --- Classes

JSWrapperClass *JSWrapperObject::createClass( const char *className, void (*constructor) ( const FunctionCallbackInfo<Value>& args ) )
{
    JSWrapperClass *wrapperClass=new JSWrapperClass( m_isolate, className, this, constructor );

    return wrapperClass;
}

// --- Arrays

void JSWrapperObject::getArrayLength( unsigned int *length )
{
    int len = m_obj.Get( m_isolate )->Get( String::NewFromUtf8( m_isolate, "length") )->ToObject()->Int32Value();
    *length=len;
}

void JSWrapperObject::getArrayElement( unsigned int index, JSWrapperData *data )
{
    Local<Value> result=m_obj.Get( m_isolate )->Get( index );

    if ( data )
    {
        if ( result->IsNumber() )
            data->setNumber( result->ToNumber()->Value() );
        else
        if ( result->IsString() )
        {
            String::Utf8Value utf8( result );
            data->setString( *utf8 );
        } else
        if ( result->IsBoolean() )
            data->setBoolean( result->ToBoolean()->Value() );
        else                
        if ( result->IsObject() )
            data->setObject( new JSWrapperObject( m_isolate, result->ToObject() ) );
        else
        if ( result->IsNull() )
            data->setNull();
        else data->setUndefined();
    }    
}

void JSWrapperObject::getAsFloat32Array( float **ptr, unsigned int *length )
{
    float *pt; unsigned int len; 

    Local<Value> value=m_obj.Get( m_isolate );

    Local<Float32Array> myarr = m_obj.Get( m_isolate ).As<Float32Array>();
    len=myarr->Length();
    pt=(float *) ( (char *) myarr->Buffer()->GetContents().Data() +  myarr->ByteOffset() );

    *length=len;
    *ptr=pt;
}

void JSWrapperObject::getAsUint8Array( unsigned char **ptr, unsigned int *length )
{
    unsigned char *pt; unsigned int len; 

    Local<Value> value=m_obj.Get( m_isolate );

    Local<Uint8Array> myarr = m_obj.Get( m_isolate ).As<Uint8Array>();
    
    len=myarr->Length();
    pt=(unsigned char *) myarr->Buffer()->GetContents().Data() + myarr->ByteOffset();
 
    *length=len;
    *ptr=pt;
}

void JSWrapperObject::getAsUint16Array( unsigned short **ptr, unsigned int *length )
{
    unsigned short *pt; unsigned int len; 

    Local<Value> value=m_obj.Get( m_isolate );

    Local<Uint16Array> myarr = m_obj.Get( m_isolate ).As<Uint16Array>();
    
    len=myarr->Length();
    pt=(unsigned short *) myarr->Buffer()->GetContents().Data();
 
    *length=len;
    *ptr=pt;
}

void JSWrapperObject::getAsUint32Array( unsigned int **ptr, unsigned int *length )
{
    unsigned int *pt; unsigned int len; 

    Local<Value> value=m_obj.Get( m_isolate );

    Local<Uint32Array> myarr = m_obj.Get( m_isolate ).As<Uint32Array>();
    
    len=myarr->Length();

    //ArrayBuffer::Contents float_c=pt=myarr->Buffer()->GetContents();
    pt=(unsigned int *) myarr->Buffer()->GetContents().Data();
 
    *length=len;
    *ptr=pt;
}    

// --- Fill Arguments

void JSWrapperObject::fillArgs( std::vector<Local<Value>> *vector, JSWrapperArguments *args )
{
    for( int i=0; i < args->count(); ++i )
    {
        JSWrapperData data=args->at( i );

        switch( data.type() )
        {
            case JSWrapperData::Number:
                vector->push_back( v8::Number::New( m_isolate, data.toNumber() ) );
            break;

            case JSWrapperData::String:
            {
                Local<String> valueString = String::NewFromUtf8( m_isolate, data.toString().c_str(), NewStringType::kNormal ).ToLocalChecked();
                vector->push_back( valueString );
            }
            break;            

            case JSWrapperData::Boolean:
                vector->push_back( v8::Boolean::New( m_isolate, data.toBoolean() ) );
            break;   

            case JSWrapperData::Object:
                vector->push_back( data.object()->m_obj.Get( m_isolate ) );
            break;

            case JSWrapperData::Null:
                vector->push_back( v8::Null( m_isolate ) );
            break;    

            case JSWrapperData::Undefined:
                vector->push_back( v8::Undefined( m_isolate ) );
            break;               
        }
    }
}

JSWrapperObject::~JSWrapperObject()
{
}
