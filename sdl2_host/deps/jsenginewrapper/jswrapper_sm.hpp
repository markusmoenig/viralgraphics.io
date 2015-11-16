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

#ifndef __JSWRAPPER_SM_HPP
#define __JSWRAPPER_SM_HPP

#include <map>
#include <jsapi.h>

using namespace JS;

#include "jswrapperdata.hpp"
#include "jswrapperobject_sm.hpp"
#include "jswrapperclass_sm.hpp"

extern std::map <std::string, JSWrapperClass *> __g_classMap;

class JSWrapper
{
public:

	JSWrapper( char * );
	~JSWrapper();

public:

	// --- Global Object
	JSWrapperObject *globalObject( void );

	// --- Execute
	bool execute( const char *string, JSWrapperData *data=NULL, const char *fileName=NULL );

	// --- Run GC
	void gc( void ) { JS_GC( m_rt );  }

	bool isValid( void ) { return m_isValid; }

private:

	JSRuntime               *m_rt;
	JSContext               *m_cx; 	
	RootedObject            *m_go;
	JSAutoCompartment	    *m_ac;

	bool 					 m_isValid;
};

void JSWRAPPER_BUILDARGS( JSContext *cx, JSWrapperArguments *, int, JS::CallArgs * );
void JSWRAPPER_BUILDPROPERTYDATA( JSContext *cx, JSWrapperData *, JS::CallArgs * );

void JSWRAPPER_SETRC( JSContext *cx, JSWrapperData, JS::CallArgs * );

// --- Function

#define JSWRAPPER_FUNCTION( funcName ) bool funcName(JSContext *cx, unsigned argc, jsval *vp) { JS::CallArgs smargs = JS::CallArgsFromVp( argc, vp );  Value value=smargs.computeThis( cx ); \
	JSWrapperArguments args; JSWRAPPER_BUILDARGS( cx, &args, argc, &smargs ); JSWrapperObject *thisObject=new JSWrapperObject( cx, &value.toObject() );

#define JSWRAPPER_FUNCTION_SETRC( data ) JSWRAPPER_SETRC( cx, data, &smargs );
#define JSWRAPPER_FUNCTION_RETURN if ( thisObject ) delete thisObject; return true;
#define JSWRAPPER_FUNCTION_GETCLASS JS_GetPrivate( &smargs.computeThis( cx ).toObject() );

#define JSWRAPPER_FUNCTION_END if ( thisObject ) delete thisObject; return true; }

// --- Constructor

#define JSWRAPPER_CONSTRUCTOR( constName, constNameText ) bool constName(JSContext *cx, unsigned argc, jsval *vp) { JS::CallArgs smargs = JS::CallArgsFromVp( argc, vp ); \
	JSWrapperArguments args; JSWRAPPER_BUILDARGS( cx, &args, argc, &smargs ); \
	JSWrapperClass *_wrapperClass=__g_classMap.at( std::string( constNameText ) ); \
	JSObject *_instanceObject=0; JSWrapperObject *thisObject=0; \
	if ( _wrapperClass ) { _instanceObject=_wrapperClass->instantiate( &smargs ); thisObject=new JSWrapperObject( cx, _instanceObject ); }

#define JSWRAPPER_CONSTRUCTOR_SETCLASS( ptr ) JS_SetPrivate( _instanceObject, ptr );

#define JSWRAPPER_CONSTRUCTOR_END if ( thisObject ) delete thisObject; return true; }

// --- Get Property

#define JSWRAPPER_GETPROPERTY( funcName ) bool funcName(JSContext *cx, unsigned argc, jsval *vp) { JS::CallArgs smargs = JS::CallArgsFromVp( argc, vp );
#define JSWRAPPER_PROPERTY_GETCLASS JS_GetPrivate( &smargs.computeThis( cx ).toObject() );

#define JSWRAPPER_GETPROPERTY_SETRC( data ) JSWRAPPER_SETRC( cx, data, &smargs );

#define JSWRAPPER_GETPROPERTY_END return true; }

// --- Set Property

#define JSWRAPPER_SETPROPERTY( funcName ) bool funcName(JSContext *cx, unsigned argc, jsval *vp) { JS::CallArgs smargs = JS::CallArgsFromVp( argc, vp ); \
	JSWrapperData data; JSWRAPPER_BUILDPROPERTYDATA( cx, &data, &smargs );

#define JSWRAPPER_SETPROPERTY_END return true; }

#endif