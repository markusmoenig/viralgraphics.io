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

// --- SM Global Class

static JSClass globalClass = {
    "global",
    JSCLASS_GLOBAL_FLAGS,
    0, 0, 0, 0, 0, 0, 0,
    nullptr, nullptr, nullptr, nullptr,
    JS_GlobalObjectTraceHook
};

// --- SM Error Reporter

void reportError(JSContext *cx, const char *message, JSErrorReport *report) {
     fprintf(stderr, "%s:%u:%s\n", report->filename ? report->filename : "[no filename]",
             (unsigned int) report->lineno,
             message);
}

// --- Global Lookup for Constructor Functions

std::map <std::string, JSWrapperClass *> __g_classMap;

// --- Fills in an JSWrapperArguments from SM Function Arguments

void JSWRAPPER_BUILDARGS( JSContext *cx, JSWrapperArguments *args, int argc, JS::CallArgs *smargs )
{
    for ( int i=0; i < argc; ++i )
    {
        if ( (*smargs)[i].isNumber() )
            args->append( (*smargs)[i].toNumber() );
        else         
        if ( (*smargs)[i].isString() )
        {
            JSString *jsstring = (*smargs)[i].toString();
            const char *stringData=JS_EncodeString( cx, jsstring );

            args->append( std::string( stringData ) );
        } else
        if ( (*smargs)[i].isBoolean() )
            args->append( (*smargs)[i].toBoolean() );
        else
        if ( (*smargs)[i].isObject() )
        {
            JSWrapperObject *object=new JSWrapperObject( cx, &(*smargs)[i].toObject() );
            args->append( object );
            delete object;
        }
        else
        if ( (*smargs)[i].isUndefined() )
            args->append( JSWrapperData::Undefined );     
        else
        if ( (*smargs)[i].isNull() )
            args->append( JSWrapperData::Null );
    }
}

// --- Fills in an JSWrapperData from an SM Property

void JSWRAPPER_BUILDPROPERTYDATA( JSContext *cx, JSWrapperData *data, JS::CallArgs *smargs )
{
    if ( (*smargs)[0].isNumber() )
        data->setNumber( (*smargs)[0].toNumber() );
    else         
    if ( (*smargs)[0].isString() )
    {
        JSString *jsstring = (*smargs)[0].toString();
        const char *stringData=JS_EncodeString( cx, jsstring );

        data->setString( std::string( stringData ) );
    } else
    if ( (*smargs)[0].isBoolean() )
        data->setBoolean( (*smargs)[0].toBoolean() );
    else
    if ( (*smargs)[0].isObject() )
    {
        data->setObject( new JSWrapperObject( cx, &(*smargs)[0].toObject() ) );
    }
    else
    if ( (*smargs)[0].isUndefined() )
        data->setUndefined();
    else
    if ( (*smargs)[0].isNull() )
        data->setNull();
}

// --- Sets the return value for a function

void JSWRAPPER_SETRC( JSContext *cx, JSWrapperData data, JS::CallArgs *args )
{
    if ( data.type() == JSWrapperData::Undefined )
    {
        args->rval().setUndefined();
    } else
    if ( data.type() == JSWrapperData::Null )
    {
        args->rval().setNull();
    } else    
    if ( data.type() == JSWrapperData::Number )
    {
        args->rval().setNumber( data.toNumber() );
    } else
    if ( data.type() == JSWrapperData::String )
    {
        JSString *string = JS_NewStringCopyN( cx, data.toString().c_str(), data.toString().length() );
        args->rval().setString( string );        
    } else
    if ( data.type() == JSWrapperData::Boolean )
    {
        args->rval().setBoolean( data.toBoolean() );
    } else
    if ( data.type() == JSWrapperData::Object )
    {
        args->rval().setObject( data.object()->getSMValue()->toObject() );//*data.object()->m_object );
    }
}

// ------------------------------------------------------- JSWrapper

JSWrapper::JSWrapper( char *arg ) : m_isValid( false )
{
    printf("Initializing SpiderMonkey 38\n");

    if (JS_Init() ) 
    {
        m_rt = JS_NewRuntime( 8L * 1024 * 1024 * 20 );

        if ( m_rt )
        {
            JS::RuntimeOptionsRef(m_rt).setBaseline(true).setIon(true).setAsmJS(true); 

            m_cx = JS_NewContext(m_rt, 8192);

            if ( m_cx ) 
            {
                JS_SetErrorReporter( m_rt, reportError);

                //JSAutoRequest ar(cx);

                m_go=new RootedObject( m_cx );
                *m_go=JS_NewGlobalObject(m_cx, &globalClass, nullptr, JS::FireOnNewGlobalHook);    

                if ( m_go )
                {
                    m_ac=new JSAutoCompartment( m_cx, *m_go );    
                    JS_InitStandardClasses( m_cx, *m_go ) ;

                    m_isValid=true;
                }
            }
        }
    } 
}

JSWrapperObject *JSWrapper::globalObject( void )
{
    JSWrapperObject *object=new JSWrapperObject( m_cx, *m_go );
    return object;
}

bool JSWrapper::execute( const char *script, JSWrapperData *data, const char *fileName )
{
    JS::CompileOptions options( m_cx );
    options.setFile( fileName );

    Rooted<Value> rcValue( m_cx );
    bool ok=JS::Evaluate( m_cx, *m_go, options, script, strlen( script ), &rcValue );

    if ( data )
    {
        if ( rcValue.isString() )
        {
            JSString *jsstring = rcValue.toString();
            const char *stringData=JS_EncodeString( m_cx, jsstring );

            data->setString( stringData );
            JS_free( m_cx, (void *) stringData );
        } else
        if ( rcValue.isNumber() )
        {
            data->setNumber( rcValue.toNumber() );
        } else
        if ( rcValue.isBoolean() )
        {
            data->setBoolean( rcValue.toBoolean() );
        } else
        if ( rcValue.isObject() )
        {
            JSWrapperObject *obj=new JSWrapperObject( m_cx, &rcValue.toObject() );
            data->setObject( obj );
        } else
        if ( rcValue.isNull() )
        {
            data->setNull();
        } else data->setUndefined();
    }

    return ok;
}

JSWrapper::~JSWrapper()
{
    delete m_ac;

    JS_DestroyContext( m_cx );
    JS_DestroyRuntime( m_rt );
    JS_ShutDown();
}