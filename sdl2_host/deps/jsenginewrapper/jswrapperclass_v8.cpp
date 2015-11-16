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

#include "jswrapper_v8.hpp"
using namespace v8;

// ------------------------------------------------------- JSWrapperObject


JSWrapperClass::JSWrapperClass(  Isolate *isolate, std::string className, JSWrapperObject *parentObj, void (*constructor) ( const FunctionCallbackInfo<Value>& args ) ) 
    :  m_isolate( isolate ), m_name( className ), m_parentObject( parentObj ), m_constructor( constructor )
{
    m_constructorTemplate=FunctionTemplate::New( m_isolate, constructor );

    m_constructorInstanceTemplate=m_constructorTemplate->InstanceTemplate();
    m_constructorInstanceTemplate->SetInternalFieldCount( 1 );
}

JSWrapperClass::~JSWrapperClass()
{

}

void JSWrapperClass::install( void )
{
    m_parentObject->m_obj.Get( m_isolate )->Set( String::NewFromUtf8( m_isolate, m_name.c_str() ), m_constructorTemplate->GetFunction() );        
}

void JSWrapperClass::registerFunction( std::string name, void (*func) ( const FunctionCallbackInfo<Value>& args ) )
{
    m_constructorInstanceTemplate->Set( String::NewFromUtf8( m_isolate, name.c_str() ), FunctionTemplate::New( m_isolate, func ) );
}

void JSWrapperClass::registerProperty( std::string name, void (*getFunc) ( Local<String> property, const PropertyCallbackInfo<Value>& info ), 
    void (*setFunc) ( Local<String> property, Local<Value> value, const PropertyCallbackInfo<void>& info ) )
{
    m_constructorInstanceTemplate->SetAccessor( String::NewFromUtf8( m_isolate, name.c_str() ), getFunc, setFunc );
}
