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

#ifndef __JSWRAPPER_OBJECT_SM_HPP
#define __JSWRAPPER_OBJECT_SM_HPP

#include <jsapi.h>
#include <jsfriendapi.h>

using namespace JS;

class JSWrapperClass;

class JSWrapperObject
{

public:

	JSWrapperObject( JSContext *, JSObject * );
	JSWrapperObject( JSWrapperObject * );
	~JSWrapperObject();

	// --- Getter/Setter
	bool get( const char *name,  JSWrapperData *data );
	void set( const char *name,  JSWrapperData& data );	

	JS::Value *getSMValue( void ) { return m_rawValue; }

	// --- Function
	bool isFunction( void ) { return JS_ObjectIsFunction( m_cx, &m_rawValue->toObject() ); }
	bool call( JSWrapperArguments *args, JSWrapperObject *object, JSWrapperData *data=NULL  );

	bool registerFunction( const char *funcName, bool (*) (JSContext *cx, unsigned argc, jsval *vp), int minArgs=0 );	

	// --- Classes
	JSWrapperClass *createClass( const char *className, bool (*) (JSContext *cx, unsigned argc, jsval *vp) );

	// ---
	JSWrapperObject *copy( void );

	// --- TypedArrays
	bool isTypedArray( void ) { return JS_IsTypedArrayObject( &m_rawValue->toObject() ); }
	void getAsUint8Array( unsigned char **ptr, unsigned int *length ) { 
		unsigned char *pt; unsigned int len;
		JS_GetObjectAsUint8Array(  &m_rawValue->toObject(), &len, &pt );
		*ptr=pt; *length=len;
	}
	void getAsUint16Array( unsigned short **ptr, unsigned int *length ) { 
		unsigned short *pt; unsigned int len;
		JS_GetObjectAsUint16Array(  &m_rawValue->toObject(), &len, &pt );
		*ptr=pt; *length=len;
	}	
	void getAsUint32Array( unsigned int **ptr, unsigned int *length ) { 
		unsigned int *pt; unsigned int len;
		JS_GetObjectAsUint32Array(  &m_rawValue->toObject(), &len, &pt );
		*ptr=pt; *length=len;
	}		
	void getAsFloat32Array( float **ptr, unsigned int *length ) { 
		float *pt; unsigned int len;
		JS_GetObjectAsFloat32Array(  &m_rawValue->toObject(), &len, &pt );
		*ptr=pt; *length=len;
	}	

	// --- Arrays
	bool isArray( void ) { Rooted<Value> value( m_cx, *m_rawValue ); return JS_IsArrayObject( m_cx, HandleValue( &value ) ); }
	void getArrayLength( unsigned int *length );
	void getArrayElement( unsigned int index, JSWrapperData *data );

	// --- Private
	void *getPrivate( void ) { return JS_GetPrivate( &m_rawValue->toObject() ); }

	// --- Utility
	void fillArgs( AutoValueVector *vector, JSWrapperArguments *args );

private:
	JSContext               *m_cx;
	JS::Value               *m_rawValue;
};

#endif