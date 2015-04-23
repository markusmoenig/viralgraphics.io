/*
 * (C) Copyright 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>, Luis Jimenez <kuko@kvbits.com>.
 *
 * This file is part of Visual Graphics.
 *
 * Visual Graphics is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Visual Graphics is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

#include <iostream>

#include "gl.hpp"

#include <jsapi.h>
using namespace JS;


#include <vector>



class GPUBuffer 
{
private:
    
    static std::vector<int> enabledAttribs;

public:

    static void enableAttrib(int index);
    static void purgeAttribs();

    GPUBuffer( int type, GLuint size, int dynamic, bool isIndexBuffer ) 
    {
        /** Creates a new buffer
         *  @constructor
         *  @param {enum} type - The buffer type: VG.Type.Float, VG.Type.Uint8, VG.Type.Uint16
         *  @param {number} size - The buffer size (not in bytes!)
         *  @param {enum} dynamic - Usage hint for the driver
         *  @param {bool} isIndexBuffer - True is this is an index (ELEMENT_ARRAY) buffer 
         *  */

        id = 0; //On context lost, this must be set to zero/null
        usage = dynamic ? GL_DYNAMIC_DRAW : GL_STATIC_DRAW;

        target = isIndexBuffer ? GL_ELEMENT_ARRAY_BUFFER : GL_ARRAY_BUFFER;

        /* The internal data in native code must be in bytes so it should allocated like this:
         * int stride = (value from a type switch) ie case TYPE_FLOAT: stride = sizeof(float);
         * char* pData = new char[stride * size);
         * */

        data=0;
        stride=0;
        this->size=size;
        this->type=type;
    
        //TODO add more type cases (this are enough for common and advanced usages)
        switch ( type )
        {
            case 0://VG.Type.Float:
                elemType=GL_FLOAT;
                stride=sizeof(GLfloat);
                break;
            case 1://VG.Type.Uint8:
                elemType=GL_UNSIGNED_BYTE;
                stride=sizeof(GLubyte);
            break;
            case 2://VG.Type.Uint16:
                elemType=GL_UNSIGNED_SHORT;
                stride=sizeof(GLushort);
            break;
            case 3://VG.Type.Uint32:
                elemType=GL_UNSIGNED_INT;
                stride=sizeof(GLuint);
            break;
        }

        data=(char *) malloc( size * stride );
    }

    GLuint getSize( void ) 
    {
        return size;
    }

    GLuint getStride( void ) 
    {
        return stride;
    }

    ~GPUBuffer() 
    {
    }

    void setBuffer( GLuint index, float value )
    {
        /** Sets the buffer data by index
         *  @param {number} index - The index in the buffer, must be < size
         *  @param {*} */

        switch ( type )
        {
            case 0://VG.Type.Float:
            {
                GLfloat *buf=(GLfloat*) data;
                buf[index]=value;
                break;
            }
            case 1://VG.Type.Uint8:
                data[index]=(GLint) value;
            break;
            case 2://VG.Type.Uint16:
            {
                GLushort *buf=(GLushort*)data;
                buf[index]=(GLint) value;
                break;
            }
        }
    }

    void bind()
    {
        /** Binds the buffer */
#ifdef __VG_OPENGL3__
        glBindVertexArray( vaid );
#endif
        glBindBuffer( target, id );
		GL_ASSERT();
    }

    void update( GLuint offset, GLuint count, bool nobind )
    {
        /** Updates the buffer from ram to vram
         *  @param {number} [0] offset - The buffer offset
         *  @param {number} [size] count - The count or size to update from the offset
         *  @param {bool} [false] nobind - If true then the buffer wont be binded.
         *  */

        if ( id == 0 ) create();

        //if (!offset)
        //{
        //    offset = 0;
        //}

        if (!nobind)
        {
            bind();
        }

        if (!count)
        {
            count = size;
        }

        //On native code, check for offset + cout overflow, or it will crash
    
        //this does not allocate a new buffer, just a hack for webgl (subarray returns a view)
        //for native opengl would be  glBufferSubData(target, offset, count, dataPtr); in BYTES!
    
        if ( count >= size )
        {
            glBufferData( target, count * stride, data, usage );
        }
        else
        {
            glBufferSubData( target, offset * stride, count * stride, data );
        }
		GL_ASSERT();
    }

    void create()
    {
        /** Restores or creates the buffer in the gpu */

        if ( id != 0)
        {
            //throw "Unexpected buffer creation (buffer already create)";
            return;
        }

#ifdef __VG_OPENGL3__
        glGenVertexArrays( 1, &vaid );
        glBindVertexArray( vaid );
#endif

        glGenBuffers( 1, &id );

        bind();
        glBufferData( target, size * stride, data, usage );
        GL_ASSERT();
    }    

    void destroy()
    {
        /** Releases the buffer from GPU, it can be send again with buffer.create */
        if ( id == 0) return;

        glDeleteBuffers( 1, &id );
        id=0;
    }

    void dispose()
    {
        /** Disposes this object and becomes invalid for further use */

        destroy();
    }    


    void vertexAttrib( GLuint index, GLuint size, bool norm, GLuint stride, GLuint offset )
    {
        /** Pointers a buffer to a vertex attribute 
         *  @param {number} index - The attribute index
         *  @param {number} size - Element size ie 2 floats 
         *  @param {bool} norm - if true then the value it's normalized regardless 
         *  @param {number} stride - Vertex stride in bytes 
         *  @param {number} offset - Vertex offset */

        enableAttrib(index);
		
        //odd OpenGL behavior, it doesn't need to be a "real" pointer.
        size_t ptrOffset=offset;
        glVertexAttribPointer( index, size, elemType, norm, stride, (const void*) ptrOffset );
        GL_ASSERT();
    } 

    void draw( GLint primType, GLuint offset, GLuint count, bool nobind )
    {
        /** Draws primitives
         *  @param {enum} primType - Primitive type VG.Primitive.Triangles, VG.Primitive.Lines VG.Primitive.TriangleStip VG.Primitive.LineStrip 
         *  @param {number} offset - The offset or start index 
         *  @param {number} count - The count from the offset on 
         *  @param {bool} nobind - If true the buffer wont be binded
         *  */

        if (!nobind)
        {
            bind();
        }

        GLenum mode = GL_TRIANGLES;

        switch (primType)
        {
            case 1: mode = GL_LINES; break;
            case 3: mode = GL_LINE_STRIP; break;
            case 2: mode = GL_TRIANGLE_STRIP; break;
        }

        glDrawArrays(mode, offset, count);

        GL_ASSERT();
        purgeAttribs(); 
    }

    void drawIndexed( GLint primType, GLuint offset, GLuint count, GPUBuffer *indexBuffer, bool nobind )
    {
        /** Draws indexed primitives
         *  @param {enum} primType - Primitive type VG.Primitive.Triangles, VG.Primitive.Lines VG.Primitive.TriangleStip VG.Primitive.LineStrip 
         *  @param {number} offset - The index offset or start index 
         *  @param {number} count - The index count from the offset on
         *  @param {enum} indexType - The index type: VG.Type.Uint8 or VG.Type.Uint16 
         *  @param {VG.GPUBuffer} indexBuffer - The index buffer
         *  @param {bool} nobind - If true no buffer will be binded including the index buffer
         *  */

        int mode = GL_TRIANGLES;

        if (!nobind)
        {
            bind();
            indexBuffer->bind();
        }

        switch (primType)
        {
            case 1: mode = GL_LINES; break;
            case 3: mode = GL_LINE_STRIP; break;
            case 2: mode = GL_TRIANGLE_STRIP; break;
        }
    
        size_t ptrOffset=offset;
        glDrawElements( mode, count, indexBuffer->elemType, (const void*)ptrOffset );
        GL_ASSERT();
        purgeAttribs(); 
    }

    // ---

    GLuint id;
    GLuint vaid;
    GLuint usage;
    GLenum target;
    GLuint size;
    GLuint elemType;
    GLuint stride;
    GLuint type;

    char *data;
};
