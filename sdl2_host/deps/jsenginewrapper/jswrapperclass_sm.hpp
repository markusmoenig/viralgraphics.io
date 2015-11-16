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

#ifndef __JSWRAPPER_CLASS_SM_HPP
#define __JSWRAPPER_CLASS_SM_HPP

#include <jsapi.h>
#include <jsfriendapi.h>

using namespace JS;

class JSWrapperClass
{

public:

	JSWrapperClass(  JSContext *, std::string, JSWrapperObject *, bool (*) (JSContext *cx, unsigned argc, jsval *vp) );
	~JSWrapperClass();

	void install( void );

	JSObject *instantiate( JS::CallArgs * );

	void registerFunction( std::string name, bool (*) (JSContext *cx, unsigned argc, jsval *vp) );
	void registerProperty( std::string name, bool (*) (JSContext *cx, unsigned argc, jsval *vp), bool (*) (JSContext *cx, unsigned argc, jsval *vp) );

private:
	JSContext               *m_cx;
	std::string              m_name;
	JSWrapperObject         *m_parentObject;
	bool (*m_constructor) (JSContext *cx, unsigned argc, jsval *vp);

	JSClass                 *m_jsClass;
	
	std::map <std::string, bool (*) (JSContext *cx, unsigned argc, jsval *vp)> m_funcs;

	std::vector <std::string> m_properties;
	std::vector <bool (*) (JSContext *cx, unsigned argc, jsval *vp)> m_getProperties;
	std::vector <bool (*) (JSContext *cx, unsigned argc, jsval *vp)> m_setProperties;
};

#endif