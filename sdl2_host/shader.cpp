/*
 * Copyright (c) 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>, Luis Jimenez <kuko@kvbits.com>.
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

#include "shader.hpp"
#include "jshost.hpp"

extern JSWrapper *g_jsWrapper;

// --------------------------------------------------------------- Member Functions

JSWRAPPER_FUNCTION( Shader_create )

    Shader *shader=(Shader *) JSWRAPPER_FUNCTION_GETCLASS
    shader->create();

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Shader_bind )

    Shader *shader=(Shader *) JSWRAPPER_FUNCTION_GETCLASS
    shader->bind();

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Shader_destroy )

    Shader *shader=(Shader *) JSWRAPPER_FUNCTION_GETCLASS
    shader->destroy();

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Shader_dispose )

    Shader *shader=(Shader *) JSWRAPPER_FUNCTION_GETCLASS
    shader->dispose();

    // --- VG.Renderer().removeResource(this);

    JSWrapperData rendererObject;
    g_jsWrapper->execute( "VG.Renderer()", &rendererObject );

    JSWrapperArguments arguments;
    arguments.append( thisObject );    

    JSWrapperData addObject;
    rendererObject.object()->get( "removeResource", &addObject );
    addObject.object()->call( &arguments, rendererObject.object() );

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Shader_getUniform )

    Shader *shader=(Shader *) JSWRAPPER_FUNCTION_GETCLASS

    if ( args.count() == 1 && args[0].isString() ) {
        GLuint uniform=shader->getUniform( args[0].toString().c_str() );

        JSWrapperData data; data.setNumber( uniform );
        JSWRAPPER_FUNCTION_SETRC( data )
    }

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Shader_getAttrib )

    Shader *shader=(Shader *) JSWRAPPER_FUNCTION_GETCLASS

    if ( args.count() == 1 && args[0].isString() ) {

        GLint attribute=shader->getAttrib( args[0].toString().c_str() );

        JSWrapperData data; data.setNumber( attribute );
        JSWRAPPER_FUNCTION_SETRC( data )
    } 

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Shader_setFloat )

    Shader *shader=(Shader *) JSWRAPPER_FUNCTION_GETCLASS

    if ( args.count() == 2 ) {
        GLint id=-1;

        if ( args[0].isString() ) {
            id=shader->getUniform( args[0].toString().c_str() );
        } else
        if ( args[0].isNumber() ) {
            id=args[0].toNumber();
        }

        if ( id != -1 && args[1].isObject() )
        {
            GLfloat values[4];

            unsigned int length; 
            args[1].object()->getArrayLength( &length );

            JSWrapperData data;
            for(int i = 0; i < length; i++)
            {
                args[1].object()->getArrayElement( i, &data );
                values[i]=data.toNumber();
            }
            shader->setFloat( id, length, values );
        } else
        if ( id != -1 && args[1].isNumber() )
        {
            float v=args[1].toNumber();
            shader->setFloat( id, 1, &v );
        }
    }

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Shader_setFloatArray )

    Shader *shader=(Shader *) JSWRAPPER_FUNCTION_GETCLASS

    if ( args.count() == 2 ) {
        GLint id=-1;

        if ( args[0].isString() ) {
            id=shader->getUniform( args[0].toString().c_str() );
        } else
        if ( args[0].isNumber() ) {
            id=args[0].toNumber();
        }

        if ( id != -1 && args[1].isObject() )
        {
            unsigned int length; 
            args[1].object()->getArrayLength( &length );

            GLfloat* values = (GLfloat*) malloc( length * sizeof(GLfloat) );

            JSWrapperData data;
            for(int i = 0; i < length; i++)
            {
                args[1].object()->getArrayElement( i, &data );
                values[i]=data.toNumber();
            }

            shader->setFloatArray( id, length, values );
        }
    }

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Shader_setTexture )

    Shader *shader=(Shader *) JSWRAPPER_FUNCTION_GETCLASS

    if ( args.count() == 3 ) {
        GLint id=-1;

        if ( args[0].isString() ) {
            id=shader->getUniform( args[0].toString().c_str() );
        } else
        if ( args[0].isNumber() ) {
            id=args[0].toNumber();
        }

        if ( id != -1 && args[1].isObject() )
        {
            JSWrapperObject *object=args[1].object()->copy();
            shader->setTexture( id, object, args[2].toNumber() );
            delete object;
        }
    }

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Shader_setColor )

    Shader *shader=(Shader *) JSWRAPPER_FUNCTION_GETCLASS

    if ( args.count() == 2 ) {
        GLint id=-1;

        if ( args[0].isString() ) {
            id=shader->getUniform( args[0].toString().c_str() );
        } else
        if ( args[0].isNumber() ) {
            id=args[0].toNumber();
        }

        if ( id != -1 && args[1].isObject() )
        {
            float r, g, b, a;

            JSWrapperData data;
            args[1].object()->get("r", &data);
            r=data.toNumber();
            args[1].object()->get("g", &data);
            g=data.toNumber();
            args[1].object()->get("b", &data);
            b=data.toNumber();
            args[1].object()->get("a", &data);
            a=data.toNumber();            

            shader->setColor( id, r, g, b, a );
        }
    }

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Shader_setColor3 )

    Shader *shader=(Shader *) JSWRAPPER_FUNCTION_GETCLASS

    if ( args.count() == 2 ) {
        GLint id=-1;

        if ( args[0].isString() ) {
            id=shader->getUniform( args[0].toString().c_str() );
        } else
        if ( args[0].isNumber() ) {
            id=args[0].toNumber();
        }

        if ( id != -1 && args[1].isObject() )
        {
            float r, g, b;

            JSWrapperData data;
            args[1].object()->get("r", &data);
            r=data.toNumber();
            args[1].object()->get("g", &data);
            g=data.toNumber();
            args[1].object()->get("b", &data);
            b=data.toNumber();   

            shader->setColor3( id, r, g, b );
        }
    }

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Shader_setInt )

    Shader *shader=(Shader *) JSWRAPPER_FUNCTION_GETCLASS

    if ( args.count() == 2 ) {
        GLint id=-1;

        if ( args[0].isString() ) {
            id=shader->getUniform( args[0].toString().c_str() );
        } else
        if ( args[0].isNumber() ) {
            id=args[0].toNumber();
        }

        if ( id != -1 && args[1].isObject() )
        {
            GLuint values[4];

            unsigned int length; 
            args[1].object()->getArrayLength( &length );

            JSWrapperData data;
            for(int i = 0; i < length; i++)
            {
                args[1].object()->getArrayElement( i, &data );
                values[i]=data.toNumber();
            }
            shader->setInt( id, length, values );
        } else
        if ( id != -1 && args[1].isNumber() )
        {
            unsigned int v=(unsigned int) args[1].toNumber();
            shader->setInt( id, 1, &v );
        }
    }

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Shader_setBool )

    Shader *shader=(Shader *) JSWRAPPER_FUNCTION_GETCLASS

    if ( args.count() == 2 ) {
        GLint id=-1;

        if ( args[0].isString() ) {
            id=shader->getUniform( args[0].toString().c_str() );
        } else
        if ( args[0].isNumber() ) {
            id=args[0].toNumber();
        }

        if ( id != -1 && args[1].isBoolean() )
        {
            bool v = args[1].toBoolean();
            shader->setBool( id, v );
        }
    }

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( Shader_setMatrix )

    Shader *shader=(Shader *) JSWRAPPER_FUNCTION_GETCLASS

    bool transpose=false;
    if ( args.count() == 3 ) args[2].toBoolean();

    if ( args.count() >= 2 ) {
        GLint id=-1;

        if ( args[0].isString() ) {
            id=shader->getUniform( args[0].toString().c_str() );
        } else
        if ( args[0].isNumber() ) {
            id=args[0].toNumber();
        }

        if ( id != -1 && args[1].isObject() )
        {
            float *values; unsigned int length;
            args[1].object()->getAsFloat32Array( &values, &length );

            shader->setMatrix( id, length, values, transpose );
        } 
    }

JSWRAPPER_FUNCTION_END

// --------------------------------------------------------------- Getters

JSWRAPPER_GETPROPERTY( GetShaderProperty_blendType )

    Shader *shader=(Shader *) JSWRAPPER_PROPERTY_GETCLASS

    JSWrapperData data; data.setNumber( shader->blendType );
    JSWRAPPER_GETPROPERTY_SETRC( data )

JSWRAPPER_GETPROPERTY_END

JSWRAPPER_GETPROPERTY( GetShaderProperty_depthWrite )

    Shader *shader=(Shader *) JSWRAPPER_PROPERTY_GETCLASS

    JSWrapperData data; data.setBoolean( shader->depthWrite );
    JSWRAPPER_GETPROPERTY_SETRC( data )

JSWRAPPER_GETPROPERTY_END

JSWRAPPER_GETPROPERTY( GetShaderProperty_depthTest )

    Shader *shader=(Shader *) JSWRAPPER_PROPERTY_GETCLASS

    JSWrapperData data; data.setBoolean( shader->depthTest );
    JSWRAPPER_GETPROPERTY_SETRC( data )

JSWRAPPER_GETPROPERTY_END

JSWRAPPER_GETPROPERTY( GetShaderProperty_culling )

    Shader *shader=(Shader *) JSWRAPPER_PROPERTY_GETCLASS

    JSWrapperData data; data.setBoolean( shader->culling );
    JSWRAPPER_GETPROPERTY_SETRC( data )

JSWRAPPER_GETPROPERTY_END

// --------------------------------------------------------------- Setters

JSWRAPPER_SETPROPERTY( SetShaderProperty_blendType )

    Shader *shader=(Shader *) JSWRAPPER_PROPERTY_GETCLASS
    shader->blendType=data.toNumber();

JSWRAPPER_SETPROPERTY_END

JSWRAPPER_SETPROPERTY( SetShaderProperty_depthWrite )

    Shader *shader=(Shader *) JSWRAPPER_PROPERTY_GETCLASS
    shader->depthWrite=data.toBoolean();

JSWRAPPER_SETPROPERTY_END

JSWRAPPER_SETPROPERTY( SetShaderProperty_depthTest )

    Shader *shader=(Shader *) JSWRAPPER_PROPERTY_GETCLASS
    shader->depthTest=data.toBoolean();

JSWRAPPER_SETPROPERTY_END

JSWRAPPER_SETPROPERTY( SetShaderProperty_culling )

    Shader *shader=(Shader *) JSWRAPPER_PROPERTY_GETCLASS
    shader->culling=data.toBoolean();

JSWRAPPER_SETPROPERTY_END

// --------------------------------------------------------------- 

JSWRAPPER_CONSTRUCTOR( ShaderConstructor, "Shader" )

    if ( args.count() == 2 ) {
        Shader *shader=new Shader( args.at(0).toString(), args.at(1).toString() );

        JSWRAPPER_CONSTRUCTOR_SETCLASS( shader )
    }

    //VG.Renderer().addResource(this);

    JSWrapperData rendererObject;
    g_jsWrapper->execute( "VG.Renderer()", &rendererObject );

    JSWrapperArguments arguments;
    arguments.append( thisObject );    

    JSWrapperData addObject;
    rendererObject.object()->get( "addResource", &addObject );
    addObject.object()->call( &arguments, rendererObject.object() );    

JSWRAPPER_CONSTRUCTOR_END

JSWrapperClass *registerShader( JSWrapper *jsWrapper )
{
    JSWrapperData data;
    jsWrapper->globalObject()->get( "VG", &data );
 
    JSWrapperClass *shaderClass=data.object()->createClass( "Shader", ShaderConstructor );
    shaderClass->registerFunction( "create", Shader_create );
    shaderClass->registerFunction( "bind", Shader_bind );
    shaderClass->registerFunction( "destroy", Shader_destroy );
    shaderClass->registerFunction( "dispose", Shader_dispose );
    shaderClass->registerFunction( "getUniform", Shader_getUniform );
    shaderClass->registerFunction( "getAttrib", Shader_getAttrib );
    shaderClass->registerFunction( "setFloat", Shader_setFloat );
    shaderClass->registerFunction( "setFloatArray", Shader_setFloatArray );
    shaderClass->registerFunction( "setTexture", Shader_setTexture );
    shaderClass->registerFunction( "setColor", Shader_setColor );
    shaderClass->registerFunction( "setColor3", Shader_setColor3 );
    shaderClass->registerFunction( "setInt", Shader_setInt );
    shaderClass->registerFunction( "setBool", Shader_setBool );
    shaderClass->registerFunction( "setMatrix", Shader_setMatrix );

    shaderClass->registerProperty( "blendType", GetShaderProperty_blendType, SetShaderProperty_blendType );
    shaderClass->registerProperty( "depthWrite", GetShaderProperty_depthWrite, SetShaderProperty_depthWrite );
    shaderClass->registerProperty( "depthTest", GetShaderProperty_depthTest, SetShaderProperty_depthTest );
    shaderClass->registerProperty( "culling", GetShaderProperty_culling, SetShaderProperty_culling );

    shaderClass->install();

    return shaderClass;
}
