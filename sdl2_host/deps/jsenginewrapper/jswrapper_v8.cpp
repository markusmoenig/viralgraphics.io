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

// --- Fills in an JSWrapperArguments from v8 Function Arguments

void JSWRAPPER_BUILDARGS( JSWrapperArguments *args, const FunctionCallbackInfo<Value> *v8args )
{
    for ( int i=0; i < v8args->Length(); i++) 
    {
        v8::HandleScope handle_scope( v8args->GetIsolate() );

        if ( (*v8args)[i]->IsUndefined() )
        {
            args->append();
        } else
        if ( (*v8args)[i]->IsNull() )
        {
            args->append( JSWrapperData::Null );
        } else        
        if ( (*v8args)[i]->IsNumber() )
        {
            args->append( (*v8args)[i]->ToNumber()->Value() );
        } else
        if ( (*v8args)[i]->IsString() )
        {
            String::Utf8Value utf8( (*v8args)[i] );
            args->append( std::string( *utf8 ) );
        } else
        if ( (*v8args)[i]->IsBoolean() )
        {
            args->append( (*v8args)[i]->ToBoolean()->Value() );
        } else
        if ( (*v8args)[i]->IsObject() )
        {
            JSWrapperObject *object=new JSWrapperObject( v8args->GetIsolate(), (*v8args)[i]->ToObject() );
            args->append( object );
            delete object;
        }
    }
}

// --- Fills in an JSWrapperData from a Local<Value>

void JSWRAPPER_BUILDPROPERTYDATA( JSWrapperData *data, const PropertyCallbackInfo<void>& info, Local<Value> *value )
{
    v8::HandleScope handle_scope( info.GetIsolate() );

    if ( (*value)->IsUndefined() )
    {
        data->setUndefined();
    } else
    if ( (*value)->IsNull() )
    {
        data->setNull();
    } else        
    if ( (*value)->IsNumber() )
    {
        data->setNumber( (*value)->ToNumber()->Value() );
    } else
    if ( (*value)->IsString() )
    {
        String::Utf8Value utf8( (*value) );
        data->setString( std::string( *utf8 ) );
    } else
    if ( (*value)->IsBoolean() )
    {
        data->setBoolean( (*value)->ToBoolean()->Value() );
    } else
    if ( (*value)->IsObject() )
    {
        data->setObject( new JSWrapperObject( info.GetIsolate(), (*value)->ToObject() ) );
    }
}

// --- Sets the return value for a function

void JSWRAPPER_FUNC_SETRC( JSWrapperData data, const FunctionCallbackInfo<Value> *args )
{
    if ( data.type() == JSWrapperData::Undefined )
    {
        args->GetReturnValue().Set( v8::Undefined( args->GetIsolate() ) );
    } else
    if ( data.type() == JSWrapperData::Null )
    {
        args->GetReturnValue().Set( v8::Null( args->GetIsolate() ) );
    } else    
    if ( data.type() == JSWrapperData::Number )
    {
        args->GetReturnValue().Set( v8::Number::New( args->GetIsolate(), data.toNumber() ) );
    } else
    if ( data.type() == JSWrapperData::String )
    {
        Local<String> value = String::NewFromUtf8( args->GetIsolate(), data.toString().c_str(), NewStringType::kNormal ).ToLocalChecked();
        args->GetReturnValue().Set( value );
    } else
    if ( data.type() == JSWrapperData::Boolean )
    {
        args->GetReturnValue().Set( v8::Boolean::New( args->GetIsolate(), data.toBoolean() ) );
    } else
    if ( data.type() == JSWrapperData::Object )
    {
        args->GetReturnValue().Set( data.object()->m_obj.Get( args->GetIsolate() ) );
    }
}

// --- Sets the return value for a property

void JSWRAPPER_PROP_SETRC( JSWrapperData data, const PropertyCallbackInfo<Value> *args )
{
    if ( data.type() == JSWrapperData::Undefined )
    {
        args->GetReturnValue().Set( v8::Undefined( args->GetIsolate() ) );
    } else
    if ( data.type() == JSWrapperData::Null )
    {
        args->GetReturnValue().Set( v8::Null( args->GetIsolate() ) );
    } else    
    if ( data.type() == JSWrapperData::Number )
    {
        args->GetReturnValue().Set( v8::Number::New( args->GetIsolate(), data.toNumber() ) );
    } else
    if ( data.type() == JSWrapperData::String )
    {
        Local<String> value = String::NewFromUtf8( args->GetIsolate(), data.toString().c_str(), NewStringType::kNormal ).ToLocalChecked();
        args->GetReturnValue().Set( value );
    } else
    if ( data.type() == JSWrapperData::Boolean )
    {
        args->GetReturnValue().Set( v8::Boolean::New( args->GetIsolate(), data.toBoolean() ) );
    } else
    if ( data.type() == JSWrapperData::Object )
    {
        args->GetReturnValue().Set( data.object()->m_obj.Get( args->GetIsolate() ) );
    }
}

// ------------------------------------------------------- JSWrapper

JSWrapper::JSWrapper( char *arg ) : m_isValid( false )
{
    printf("Initializing V8\n");

    V8::InitializeICU();
    V8::InitializeExternalStartupData( arg );
    m_platform = platform::CreateDefaultPlatform();
    V8::InitializePlatform( m_platform );
    V8::Initialize();

    // Create a new Isolate and make it the current one.
    m_create_params.array_buffer_allocator = &m_allocator;
    m_isolate = Isolate::New( m_create_params );

    m_isolate_scope=new Isolate::Scope( m_isolate );
    m_scope=new JSWrapperScope( m_isolate );

    m_context = Context::New( m_isolate );
    m_context_scope=new Context::Scope( m_context );

    m_isValid=true;
}

JSWrapperObject *JSWrapper::globalObject( void )
{
    JSWrapperObject *object=new JSWrapperObject( m_isolate,  m_context->Global() );
    return object;
}

bool JSWrapper::execute( const char *scr, JSWrapperData *data, const char *fileName )
{
    HandleScope handle_scope( m_isolate );

    Local<String> source = String::NewFromUtf8( m_isolate, scr, NewStringType::kNormal ).ToLocalChecked();

    ScriptOrigin origin( v8::String::NewFromUtf8( m_isolate, fileName ? fileName : "Unknown" ) );
    MaybeLocal<Script> maybeScript = Script::Compile( m_context, source, &origin );

    bool success=false;

    if ( !maybeScript.IsEmpty() )
    {
        Local<Script> script = maybeScript.ToLocalChecked();        
        MaybeLocal<Value> maybeResult = script->Run(m_context);

        if ( !maybeResult.IsEmpty() )
        {
            Local<Value> result = maybeResult.ToLocalChecked();

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

            success=true;
        } 
    }

    return success;
}

JSWrapper::~JSWrapper()
{
    delete m_context_scope;
    delete m_scope;
    delete m_isolate_scope;

    m_isolate->Dispose();

    V8::Dispose();
    V8::ShutdownPlatform();
    delete m_platform;
}