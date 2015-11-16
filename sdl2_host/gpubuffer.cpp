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
#include "gpubuffer.hpp"
#include "jshost.hpp"

extern JSWrapper *g_jsWrapper;

std::vector<int> GPUBuffer::enabledAttribs;

void GPUBuffer::enableAttrib(int index)
{
	glEnableVertexAttribArray(index);
    enabledAttribs.push_back(index);
}

void GPUBuffer::purgeAttribs()
{
    for (int i = 0; i < enabledAttribs.size(); i++) {
        glDisableVertexAttribArray(enabledAttribs[i]);
        GL_ASSERT();
    }
    enabledAttribs.clear();
}

char *GPUBuffer::getDataFromDataBuffer( JSWrapperObject *object )
{
    // --- Get the Data Buffer

    JSWrapperData dataBuffer;
    object->get("dataBuffer", &dataBuffer);

    JSWrapperData data;
    dataBuffer.object()->get("data", &data);

    unsigned int length; char *dataPtr=0;

    if ( elemType == GL_FLOAT )
    {
        float *ptr;
        data.object()->getAsFloat32Array( &ptr, &length );
        dataPtr=(char *) ptr;        
    } else
    if ( elemType == GL_UNSIGNED_BYTE )    
    {
        uint8_t *ptr;
        data.object()->getAsUint8Array( &ptr, &length );
        dataPtr=(char *) ptr;
    } else
    if ( elemType == GL_UNSIGNED_SHORT )    
    {
        uint16_t *ptr;
        data.object()->getAsUint16Array( &ptr, &length );
        dataPtr=(char *) ptr;
    } else 
    if ( elemType == GL_UNSIGNED_INT )    
    {
        uint32_t *ptr;
        data.object()->getAsUint32Array( &ptr, &length );
        dataPtr=(char *) ptr;
    }  

    return dataPtr;
} 

// --------------------------------------------------------------- Member Functions

JSWRAPPER_FUNCTION( GPUBuffer_getStride )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_FUNCTION_GETCLASS

    JSWrapperData data; data.setNumber( buffer->getStride() );
    JSWRAPPER_FUNCTION_SETRC( data )

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( GPUBuffer_create )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_FUNCTION_GETCLASS

    char *data=buffer->getDataFromDataBuffer( thisObject );

    // ---

    buffer->create( data );

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( GPUBuffer_getDataBuffer )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_FUNCTION_GETCLASS

    JSWrapperData data;
    thisObject->get( "dataBuffer", &data );

    JSWRAPPER_FUNCTION_SETRC( data )

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( GPUBuffer_bind )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_FUNCTION_GETCLASS
    buffer->bind();

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( GPUBuffer_update )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_FUNCTION_GETCLASS

    GLuint offset=0, count=0;
    bool nobind=false;

    if ( args.count() >= 1 ) offset=(GLuint) args[0].toNumber();
    if ( args.count() >= 2 ) count=(GLuint) args[1].toNumber();
    if ( args.count() >= 3 ) nobind=args[2].toBoolean();

    char *data=buffer->getDataFromDataBuffer( thisObject);    
    buffer->update( offset, count, nobind, data );

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( GPUBuffer_destroy )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_FUNCTION_GETCLASS
    buffer->destroy();

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( GPUBuffer_dispose )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_FUNCTION_GETCLASS
    buffer->dispose();

    // --- VG.Renderer().removeResource(this);
    
    JSWrapperData rendererObject;
    g_jsWrapper->execute( "VG.Renderer()", &rendererObject );

    JSWrapperArguments arguments;
    arguments.append( thisObject );    

    JSWrapperData addObject;
    rendererObject.object()->get( "removeResource", &addObject );
    addObject.object()->call( &arguments, rendererObject.object() );

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( GPUBuffer_vertexAttrib )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_FUNCTION_GETCLASS

    if ( args.count() == 5 )
    {
        GLuint index, size, stride, offset;
        bool norm=args[2].toBoolean();

        index=(GLuint) args[0].toNumber();
        size=(GLuint) args[1].toNumber();
        stride=(GLuint) args[3].toNumber();
        offset=(GLuint) args[4].toNumber();

        buffer->vertexAttrib( index, size, norm, stride, offset );
    }

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( GPUBuffer_purgeAttribs )
    GPUBuffer::purgeAttribs();
JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( GPUBuffer_drawBuffer )
    
    if ( args.count() >= 3)
    {        
        GLint primType=args[0].toNumber(), offset=args[1].toNumber(), count=args[2].toNumber();
        
        GLenum mode = GL_TRIANGLES;
        
        switch (primType)
        {
            case 1: mode = GL_LINES; break;
            case 3: mode = GL_LINE_STRIP; break;
            case 2: mode = GL_TRIANGLE_STRIP; break;
        }
        
        bool indexed = false;
        
        if ( args.count() > 3)
            indexed = args[3].toBoolean();
        
        if (indexed) {
            GLint elemType = args[4].toNumber();
            glDrawElements(mode, count, elemType, (const GLvoid*)offset);
        } else {
            glDrawArrays(mode, offset, count);
        }
        GL_ASSERT();
    }

JSWRAPPER_FUNCTION_END

// --------------------------------------------------------------- Getters

JSWRAPPER_GETPROPERTY( GetGPUBufferProperty_usage )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_PROPERTY_GETCLASS

    JSWrapperData data; data.setNumber( buffer->usage );
    JSWRAPPER_GETPROPERTY_SETRC( data )

JSWRAPPER_GETPROPERTY_END

JSWRAPPER_GETPROPERTY( GetGPUBufferProperty_target )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_PROPERTY_GETCLASS

    JSWrapperData data; data.setNumber( buffer->target );
    JSWRAPPER_GETPROPERTY_SETRC( data )

JSWRAPPER_GETPROPERTY_END

JSWRAPPER_GETPROPERTY( GetGPUBufferProperty_size )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_PROPERTY_GETCLASS

    JSWrapperData data; data.setNumber( buffer->size );
    JSWRAPPER_GETPROPERTY_SETRC( data )

JSWRAPPER_GETPROPERTY_END

JSWRAPPER_GETPROPERTY( GetGPUBufferProperty_elemType )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_PROPERTY_GETCLASS

    JSWrapperData data; data.setNumber( buffer->elemType );
    JSWRAPPER_GETPROPERTY_SETRC( data )

JSWRAPPER_GETPROPERTY_END

JSWRAPPER_GETPROPERTY( GetGPUBufferProperty_stride )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_PROPERTY_GETCLASS

    JSWrapperData data; data.setNumber( buffer->stride );
    JSWRAPPER_GETPROPERTY_SETRC( data )

JSWRAPPER_GETPROPERTY_END

JSWRAPPER_GETPROPERTY( GetGPUBufferProperty_type )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_PROPERTY_GETCLASS

    JSWrapperData data; data.setNumber( buffer->type );
    JSWRAPPER_GETPROPERTY_SETRC( data )

JSWRAPPER_GETPROPERTY_END

// --------------------------------------------------------------- Setters

JSWRAPPER_SETPROPERTY( SetGPUBufferProperty_usage )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_PROPERTY_GETCLASS
    buffer->usage=data.toNumber();

JSWRAPPER_SETPROPERTY_END

JSWRAPPER_SETPROPERTY( SetGPUBufferProperty_target )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_PROPERTY_GETCLASS
    buffer->target=data.toNumber();

JSWRAPPER_SETPROPERTY_END

JSWRAPPER_SETPROPERTY( SetGPUBufferProperty_size )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_PROPERTY_GETCLASS
    buffer->size=data.toNumber();

JSWRAPPER_SETPROPERTY_END

JSWRAPPER_SETPROPERTY( SetGPUBufferProperty_elemType )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_PROPERTY_GETCLASS
    buffer->elemType=data.toNumber();

JSWRAPPER_SETPROPERTY_END

JSWRAPPER_SETPROPERTY( SetGPUBufferProperty_stride )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_PROPERTY_GETCLASS
    buffer->stride=data.toNumber();

JSWRAPPER_SETPROPERTY_END

JSWRAPPER_SETPROPERTY( SetGPUBufferProperty_type )

    GPUBuffer *buffer=(GPUBuffer *) JSWRAPPER_PROPERTY_GETCLASS
    buffer->type=data.toNumber();

JSWRAPPER_SETPROPERTY_END

// --------------------------------------------------------------- 

JSWRAPPER_CONSTRUCTOR( GPUBufferConstructor, "GPUBuffer" )

    if ( args.count() >= 3 ) {

        int type=args[0].toNumber();
        GLuint size=(GLuint) args[1].toNumber();
        int dynamic=args[2].toNumber();

        bool isIndexBuffer=false;
        if ( args.count() >= 4 ) isIndexBuffer=args[3].toBoolean();

        GPUBuffer *buffer = new GPUBuffer( type, size, dynamic, isIndexBuffer );

        // --- Allocate Data Buffer on the Script side

        JSWrapperData coreObject;
        g_jsWrapper->execute( "VG.Core", &coreObject );

        JSWrapperData typedData;
        coreObject.object()->get( "TypedArray", &typedData );

        JSWrapperArguments arguments;
        arguments.append( args[0].toNumber() );
        arguments.append( args[1].toNumber() );

        JSWrapperData data;
        typedData.object()->call( &arguments, coreObject.object(), &data );
        thisObject->set( "dataBuffer", data );

        // ---

        JSWRAPPER_CONSTRUCTOR_SETCLASS( buffer )
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

JSWrapperClass *registerGPUBuffer( JSWrapper *jsWrapper )
{
    JSWrapperData data;
    jsWrapper->globalObject()->get( "VG", &data );
 
    JSWrapperClass *gpuBufferClass=data.object()->createClass( "GPUBuffer", GPUBufferConstructor );
    gpuBufferClass->registerFunction( "getStride", GPUBuffer_getStride );
    gpuBufferClass->registerFunction( "create", GPUBuffer_create );
    gpuBufferClass->registerFunction( "getDataBuffer", GPUBuffer_getDataBuffer );
    gpuBufferClass->registerFunction( "bind", GPUBuffer_bind );
    gpuBufferClass->registerFunction( "update", GPUBuffer_update );
    gpuBufferClass->registerFunction( "destroy", GPUBuffer_destroy );
    gpuBufferClass->registerFunction( "dispose", GPUBuffer_dispose );
    gpuBufferClass->registerFunction( "vertexAttrib", GPUBuffer_vertexAttrib );
    gpuBufferClass->registerFunction( "purgeAttribs", GPUBuffer_purgeAttribs );
    gpuBufferClass->registerFunction( "drawBuffer", GPUBuffer_drawBuffer );

    gpuBufferClass->registerProperty( "usage", GetGPUBufferProperty_usage, SetGPUBufferProperty_usage );
    gpuBufferClass->registerProperty( "target", GetGPUBufferProperty_target, SetGPUBufferProperty_target );
    gpuBufferClass->registerProperty( "size", GetGPUBufferProperty_size, SetGPUBufferProperty_size );
    gpuBufferClass->registerProperty( "elemType", GetGPUBufferProperty_elemType, SetGPUBufferProperty_elemType );
    gpuBufferClass->registerProperty( "stride", GetGPUBufferProperty_stride, SetGPUBufferProperty_stride );
    gpuBufferClass->registerProperty( "type", GetGPUBufferProperty_type, SetGPUBufferProperty_type );

    gpuBufferClass->install();

    return gpuBufferClass;
}
