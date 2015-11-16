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

#ifndef __JSWRAPPER_V8_HPP
#define __JSWRAPPER_V8_HPP

#include "include/libplatform/libplatform.h"
#include "include/v8.h"

#include "jswrapperdata.hpp"
#include "jswrapperobject_v8.hpp"
#include "jswrapperclass_v8.hpp"

#include <iostream>

 class ArrayBufferAllocator : public v8::ArrayBuffer::Allocator {
 public:
  virtual void* Allocate(size_t length) {
    void* data = AllocateUninitialized(length);
    return data == NULL ? data : memset(data, 0, length);
  }
  virtual void* AllocateUninitialized(size_t length) { return malloc(length); }
  virtual void Free(void* data, size_t) { free(data); }
};

class JSWrapperScope
{

public:

	JSWrapperScope( v8::Isolate *isolate ) : m_handle_scope( isolate ) {}

private:

    v8::HandleScope m_handle_scope;	
};

class JSWrapper
{

public:

	JSWrapper( char *arg );
	~JSWrapper();

public:

	// --- Returns the global object
	JSWrapperObject *globalObject( void );

	// --- Execute a script
	bool execute( const char *string, JSWrapperData *data=NULL, const char *fileName=NULL );

	// --- Run GC
	void gc( void ) { while(! m_isolate->IdleNotification( 100 ) ) {}; }

	bool isValid( void ) { return m_isValid; }

private:

	v8::Platform            *m_platform;
	v8::Isolate             *m_isolate;

	v8::Isolate::Scope      *m_isolate_scope;

    v8::Local<v8::Context>   m_context;
	v8::Context::Scope      *m_context_scope;

	JSWrapperScope          *m_scope;

    ArrayBufferAllocator 	 m_allocator;
    v8::Isolate::CreateParams m_create_params;

	bool 					 m_isValid;
};

void JSWRAPPER_BUILDARGS( JSWrapperArguments *, const v8::FunctionCallbackInfo<v8::Value> * );
void JSWRAPPER_BUILDPROPERTYDATA( JSWrapperData *data, const v8::PropertyCallbackInfo<void>& info, v8::Local<v8::Value> *value );

void JSWRAPPER_FUNC_SETRC( JSWrapperData, const v8::FunctionCallbackInfo<v8::Value> * );
void JSWRAPPER_PROP_SETRC( JSWrapperData, const v8::PropertyCallbackInfo<v8::Value> * );

// --- Function

#define JSWRAPPER_FUNCTION( funcName ) void funcName( const v8::FunctionCallbackInfo<v8::Value>& v8args ) { \
	JSWrapperArguments args; JSWRAPPER_BUILDARGS( &args, &v8args ); JSWrapperObject *thisObject=new JSWrapperObject( v8args.GetIsolate(), v8args.This() ); 
#define JSWRAPPER_FUNCTION_END delete thisObject; }

#define JSWRAPPER_FUNCTION_SETRC( data ) JSWRAPPER_FUNC_SETRC( data, &v8args );
#define JSWRAPPER_FUNCTION_GETCLASS v8::Local<v8::External>::Cast( v8args.Holder()->GetInternalField(0) )->Value(); 
#define JSWRAPPER_FUNCTION_RETURN delete thisObject; return;

// --- Constructor

#define JSWRAPPER_CONSTRUCTOR( constName, constNameText ) void constName( const v8::FunctionCallbackInfo<v8::Value>& v8args ) { \
	JSWrapperArguments args; JSWRAPPER_BUILDARGS( &args, &v8args ); JSWrapperObject *thisObject=new JSWrapperObject( v8args.GetIsolate(), v8args.This() ); 
#define JSWRAPPER_CONSTRUCTOR_END delete thisObject; }

#define JSWRAPPER_CONSTRUCTOR_SETCLASS( ptr ) v8args.This()->SetInternalField( 0, v8::External::New( v8args.GetIsolate(), ptr ) );

// --- Get Property

#define JSWRAPPER_GETPROPERTY( funcName ) void funcName( v8::Local<v8::String> property, const v8::PropertyCallbackInfo<v8::Value>& info ) { 
#define JSWRAPPER_PROPERTY_GETCLASS v8::Local<v8::External>::Cast( info.Holder()->GetInternalField(0) )->Value(); 

#define JSWRAPPER_GETPROPERTY_SETRC( data ) JSWRAPPER_PROP_SETRC( data, &info );

#define JSWRAPPER_GETPROPERTY_END }

// --- Set Property

#define JSWRAPPER_SETPROPERTY( funcName ) void funcName( v8::Local<v8::String> property, v8::Local<v8::Value> value, const v8::PropertyCallbackInfo<void>& info ) { \
	JSWrapperData data; JSWRAPPER_BUILDPROPERTYDATA( &data, info, &value );

#define JSWRAPPER_SETPROPERTY_END }

#endif
