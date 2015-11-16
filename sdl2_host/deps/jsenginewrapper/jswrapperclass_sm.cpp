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

#include "jswrapper_sm.hpp"

// ------------------------------------------------------- JSWrapperObject

JSWrapperClass::JSWrapperClass(  JSContext * cx, std::string className, JSWrapperObject *parentObj, bool (*constructor) (JSContext *cx, unsigned argc, jsval *vp) ) 
    :  m_cx( cx ), m_name( className ), m_parentObject( parentObj ), m_constructor( constructor )
{
    m_jsClass=new JSClass();
    m_jsClass->name=m_name.c_str();
    m_jsClass->flags=JSCLASS_HAS_PRIVATE;
    m_jsClass->addProperty=0;
    m_jsClass->delProperty=0;
    m_jsClass->getProperty=0;
    m_jsClass->setProperty=0;
    m_jsClass->enumerate=0;
    m_jsClass->resolve=0;
    m_jsClass->convert=0;
    m_jsClass->finalize=0;
}

JSWrapperClass::~JSWrapperClass()
{
    delete m_jsClass;
}

void JSWrapperClass::install( void )
{
    __g_classMap.insert( std::pair<std::string, JSWrapperClass *>( m_name, this ) );

    RootedObject parent( m_cx, &m_parentObject->getSMValue()->toObject() ); RootedObject parentProto( m_cx );

    JSObject * newObject=JS_InitClass( m_cx, HandleObject(parent), HandleObject(parentProto), m_jsClass,  
        m_constructor, 0,
        NULL, NULL,
        NULL, NULL);
}

JSObject *JSWrapperClass::instantiate( JS::CallArgs *args )
{
    JSObject *object = JS_NewObjectForConstructor( m_cx, m_jsClass, *args );
    RootedObject obj( m_cx, object ); RootedValue v( m_cx, JS::UndefinedValue() );

    for (std::map<std::string,bool (*) (JSContext *cx, unsigned argc, jsval *vp)>::iterator it = m_funcs.begin(); it != m_funcs.end(); it++)
    {
        JS_DefineFunction( m_cx, HandleObject(obj), it->first.c_str(), it->second, 0, 0);
    }

    args->rval().set( OBJECT_TO_JSVAL( object ) );

    for ( int i=0; i < m_properties.size(); ++i )
    {
        JS_DefineProperty( m_cx, HandleObject(obj), m_properties[i].c_str(), HandleValue(&v), JSPROP_SHARED, (JSNative) m_getProperties[i], (JSNative) m_setProperties[i] );
    }

    return object;
}

void JSWrapperClass::registerFunction( std::string name, bool (*func) (JSContext *cx, unsigned argc, jsval *vp) )
{
    m_funcs.insert( std::pair<std::string,bool (*) (JSContext *cx, unsigned argc, jsval *vp)>( name, func ) );
}
void JSWrapperClass::registerProperty( std::string name, bool (*get) (JSContext *cx, unsigned argc, jsval *vp), bool (*set) (JSContext *cx, unsigned argc, jsval *vp) )
{
    m_properties.push_back( name );
    m_getProperties.push_back( get );
    m_setProperties.push_back( set );
}