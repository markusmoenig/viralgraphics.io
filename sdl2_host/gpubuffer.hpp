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
#include <vector>

#include "gl.hpp"
#include "jswrapper.hpp"

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

        //data=0;//(char *) malloc( size * stride );
    }

    char *getDataFromDataBuffer( JSWrapperObject *object );

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

    bool isVertexBuffer() const
    {
        return (target == GL_ARRAY_BUFFER);
    }

    void bind()
    {
        /** Binds the buffer */
        if (isVertexBuffer()) {
#ifdef __VG_OPENGL3__
#ifndef WIN32 
			glBindVertexArray( vaid );
#endif
#endif
        }
        glBindBuffer( target, id );
		GL_ASSERT();
    }

    void update( GLuint offset, GLuint count, bool nobind, char *data )
    {
        /** Updates the buffer from ram to vram
         *  @param {number} [0] offset - The buffer offset
         *  @param {number} [size] count - The count or size to update from the offset
         *  @param {bool} [false] nobind - If true then the buffer wont be binded.
         *  */
        if ( id == 0 )
            create(0);
        if (!nobind)
            bind();
        if (!count)
            count = size;
        //On native code, check for offset + cout overflow, or it will crash
        //this does not allocate a new buffer, just a hack for webgl (subarray returns a view)
        //for native opengl would be  glBufferSubData(target, offset, count, dataPtr); in BYTES!
        if ( count >= size )
            glBufferData( target, count * stride, data, usage );
        else
            glBufferSubData( target, offset * stride, count * stride, data );
		GL_ASSERT();
    }

    void create( char *data )
    {
        /** Restores or creates the buffer in the gpu */
        if ( id != 0)
        {
            //throw "Unexpected buffer creation (buffer already create)";
            return;
        }
        
        if (isVertexBuffer()) {
#ifdef __VG_OPENGL3__
#ifndef WIN32 
            glGenVertexArrays( 1, &vaid );
            glBindVertexArray( vaid );
#endif
#endif
        }
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

    // ---
    GLuint id;
    GLuint vaid;
    GLuint usage;
    GLenum target;
    GLuint size;
    GLuint elemType;
    GLuint stride;
    GLuint type;
};
