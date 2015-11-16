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

#ifndef __JSWRAPPER_OBJECT_V8_HPP
#define __JSWRAPPER_OBJECT_V8_HPP

#include "include/libplatform/libplatform.h"
#include "include/v8.h"

#include <iostream>

class JSWrapperClass;

class JSWrapperObject
{

public:

	JSWrapperObject( v8::Isolate *, v8::Local<v8::Object> );
	JSWrapperObject( JSWrapperObject * );
	~JSWrapperObject();

	// --- Getter/Setter
	bool get( const char *name, JSWrapperData *data=NULL );
	void set( const char *name, JSWrapperData& data );

	// --- Function
	bool isFunction( void ) { return m_obj.Get( m_isolate )->IsCallable(); }
	bool call( JSWrapperArguments *args, JSWrapperObject *object, JSWrapperData *data=NULL );
	bool registerFunction( const char *funcName, void (*) ( const v8::FunctionCallbackInfo<v8::Value>& args ) );

	// --- Classes
	JSWrapperClass *createClass( const char *className, void (*) ( const v8::FunctionCallbackInfo<v8::Value>& args ) );
	
	// ---
	JSWrapperObject *copy( void );

	// --- TypedArrays
	bool isTypedArray( void ) { return m_obj.Get( m_isolate )->IsTypedArray(); }
	void getAsFloat32Array( float **ptr, unsigned int *length );
    void getAsUint8Array( unsigned char **ptr, unsigned int *length );
    void getAsUint16Array( unsigned short **ptr, unsigned int *length );
    void getAsUint32Array( unsigned int **ptr, unsigned int *length );

	// --- Arrays
	bool isArray( void ) { return m_obj.Get( m_isolate )->IsArray(); }
	void getArrayLength( unsigned int *length );
	void getArrayElement( unsigned int index, JSWrapperData *data );

	// --- Private
	void *getPrivate( void ) { return v8::Local<v8::External>::Cast(m_obj.Get( m_isolate)->GetInternalField(0) )->Value(); }

	// --- Utility
	void fillArgs( std::vector<v8::Local<v8::Value>> *vector, JSWrapperArguments *args );	

	v8::Isolate                 *m_isolate;
	v8::UniquePersistent<v8::Object> m_obj;
};

#endif