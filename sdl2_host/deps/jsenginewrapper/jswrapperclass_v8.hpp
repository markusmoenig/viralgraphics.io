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

#ifndef __JSWRAPPER_CLASS_V8_HPP
#define __JSWRAPPER_CLASS_V8_HPP

#include "include/libplatform/libplatform.h"
#include "include/v8.h"

class JSWrapperClass
{

public:

	JSWrapperClass(  v8::Isolate *, std::string, JSWrapperObject *, void (*) ( const v8::FunctionCallbackInfo<v8::Value>& args ) );
	~JSWrapperClass();

	void install( void );
	void registerFunction( std::string name, void (*) ( const v8::FunctionCallbackInfo<v8::Value>& args ) );
	void registerProperty( std::string name, void (*) ( v8::Local<v8::String> property, const v8::PropertyCallbackInfo<v8::Value>& info ), 
		void (*) ( v8::Local<v8::String> property, v8::Local<v8::Value> value, const v8::PropertyCallbackInfo<void>& info ) );

private:
	
	v8::Isolate             *m_isolate;
	std::string              m_name;
	JSWrapperObject         *m_parentObject;

	void (*m_constructor) ( const v8::FunctionCallbackInfo<v8::Value>& args );

	v8::Handle<v8::FunctionTemplate> m_constructorTemplate;
	v8::Handle<v8::ObjectTemplate>   m_constructorInstanceTemplate;
};

#endif