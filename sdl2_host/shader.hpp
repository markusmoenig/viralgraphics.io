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
#include <algorithm>

#include "gl.hpp"

#include "jswrapper.hpp"

class Shader 
{
public:
    Shader(  std::string vertSrc, std::string fragSrc ) 
    {
        /** Creates a new shader from a pair of vertex and fragment sources
         *  @constructor
         *  @param {string} vertSrc - Vertex shader source
         *  @param {string} fragSrc - Fragment/Pixel shader source
         *  */

        /** Enables writing to the depth buffer, default is false 
         *  @member {bool} */
        depthWrite = false;

        /** Enables depth testing, default is false
         *  @member {bool} */
        depthTest = false;

        /** BlendType default is VG.Shader.Blend.None
         *  @member {enum} */
        blendType = 0;//VG.Shader.Blend.None;

        /** BackFace culling, default is false
         *  @member {bool} */
        culling = false;

        //keep a copy of the source
        vsrc = vertSrc;
        fsrc = fragSrc;

        vid = 0;
        fid = 0;

        //program id
        id = 0;
    }

    void create()
    {
        /** Copiles, links and creates the shader program */

        vid=glCreateShader( GL_VERTEX_SHADER );
        fid=glCreateShader( GL_FRAGMENT_SHADER );

		GL_ASSERT();
    
        if ( vid && fid )
        {
            if ( compileShader( vid, vsrc.c_str() ) && compileShader( fid, fsrc.c_str() ) )
            {
                id=glCreateProgram();
            
                glAttachShader( id, vid );
                glAttachShader( id, fid );
            
                glLinkProgram( id );
            
                // Check the link status
                GLint linked;
                glGetProgramiv( id, GL_LINK_STATUS, &linked );
                if(!linked)
                {
                    GLint infoLen = 0;
                    glGetProgramiv( id, GL_INFO_LOG_LENGTH, &infoLen );
                    if ( infoLen > 1 )
                    {
                        char *infoLog=(char*)malloc(sizeof(char) * infoLen );
                        glGetProgramInfoLog( id, infoLen, NULL, infoLog );
                        printf( "Error in Linking the Program: %s\n", infoLog );
                    
                        free( infoLog );
                    }
                }
            } else
            {
                glDeleteShader( vid );
                glDeleteShader( fid );
            }
        }

		GL_ASSERT();
    }

    void destroy()
    {
        /** Releases the shader from gpu */
        if ( id == 0) return;

        glDeleteProgram( id );
        glDeleteShader( vid) ;
        glDeleteShader( fid );

        id = 0;
        vid = 0;
        fid = 0;

		GL_ASSERT();
    }

    void bind()
    {
        /** Binds the shader program */

        glUseProgram(id);


        //TODO create fingerprint or software state checking

        //blend states
        if ( blendType == 0 )//VG.Shader.Blend.None)
        {
            glDisable( GL_BLEND);
        }
        else
        {
            glEnable( GL_BLEND);

            switch ( blendType )
            {
                case 1://VG.Shader.Blend.Alpha:
                    glBlendFunc( GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
                break;
            }
        }

        //depth states
        if ( depthTest )
        {
            glEnable( GL_DEPTH_TEST );
        }
        else
        {
            glDisable( GL_DEPTH_TEST );
        }

        if ( depthWrite )
        {
            glDepthFunc( GL_LESS );
        }
        else
        {
            glDepthFunc( GL_NEVER );
        }


        //culling states
        if (!culling)
        {
            glDisable( GL_CULL_FACE);
        }
        else
        {
            glEnable( GL_CULL_FACE);
            glCullFace( GL_BACK );
        }

		GL_ASSERT();
    } 

    GLuint getUniform( const char *name )
    {
        /** Returns the uniform location/index 
         *  @param {string} name - The uniform name as set in the source
         *  @returns {number}
         *  */

        return glGetUniformLocation(id, name);
    }

    void dispose()
    {
        /** Disposes this object and becomes invalid for further use */

        destroy();
    }

    GLint getAttrib( const char *name)
    {
        /** Queries the attribute location/index
         *  @param {string} name - The attribute name as set in the source
         *  @returns {number}
         *  */

        return glGetAttribLocation(id, name);
    }

    void setFloat( GLuint uid, int length, GLfloat *values )
    {
        switch( std::min( length, 4 ) )
        {
            case 1:
            default:
                glUniform1f( uid, values[0] );
            break;
                
            case 2:
                glUniform2f( uid, values[0], values[1] );
            break;

            case 3:
                glUniform3f( uid, values[0], values[1], values[2] );
            break;
            case 4:
                glUniform4f( uid, values[0], values[1], values[2], values[3] );
            break;
        } 
    }

    void setFloatArray( GLuint uid, int length, GLfloat *values )
    {
        glUniform1fv(uid, length, values);
    }

    void setTexture( GLuint uid, JSWrapperObject *object, GLint slot )
    {
        /** Sets a texture
         *  @param {number | string} uniform - Takes either a location/index or the name
         *  @param {VG.Texture2D | VG.TextureCube | VG.RenderTarget} texture - The texture to set
         *  */

        glActiveTexture( GL_TEXTURE0 + slot );

        // --- The isRenderTarget Check has to be improved (slow)

        JSWrapperData renderTargetCheck;
        object->get( "checkStatusComplete", &renderTargetCheck );

        if ( !renderTargetCheck.isUndefined() )
        {
            JSWrapperData data;
            object->get( "bindAsTexture", &data );

            data.object()->call( NULL, object );
        } else
        {
            //Call( cx, HandleObject(textureObject), "bind", HandleValueArray::empty(), MutableHandleValue(&rc) );

            JSWrapperData data;
            object->get( "bind", &data );

            data.object()->call( NULL, object );
        }
    
        glUniform1i( uid, slot );

        GL_ASSERT();
    }

    void setColor( GLuint uid, float r, float g, float b, float a )
    {
        /** Sets a single VG.Core.Color
         *  @param {number | string} uniform - Takes either a location/index or the name
         *  @param {VG.Core.Color} value - A single color
         *  */

        glUniform4f( uid, r, g, b, a );        
    }

    void setColor3( GLuint uid, float r, float g, float b )
    {
        /** Sets a single vec3/rgb VG.Core.Color
         *  @param {number | string} uniform - Takes either a location/index or the name
         *  @param {VG.Core.Color} value - A single color
         *  */

        glUniform3f( uid, r, g, b );
    }    

    void setInt( GLuint uid, int length, GLuint *values )
    {
        switch( std::min( length, 4 ) )
        {
            case 1:
            default:
                glUniform1i( uid, values[0] );
            break;
                
            case 2:
                glUniform2i( uid, values[0], values[1] );
            break;

            case 3:
                glUniform3i( uid, values[0], values[1], values[2] );
            break;
            case 4:
                glUniform4i( uid, values[0], values[1], values[2], values[3] );
            break;
        } 
    }
    
    void setBool(GLuint uid, bool b)
    {
        glUniform1i(uid, b);
    }

    void setMatrix( GLuint uid, int length, GLfloat *values, bool transpose )
    {
        /** Sets a matrix from a float array, the shader must be binded
         *  @param {number | string} uniform - Takes either a location/index or the name
         *  @param {array} value - A float array (2x2, 3x3 or 4x4)
         *  @param {bool} [false] transpose - If true transposes the matrix
         *  */

        switch( std::min( length, 16 ) )
        {
            case 4:
            default:
                glUniformMatrix2fv( uid, 1, transpose, values );
            break;
            
            case 9:
                glUniformMatrix3fv( uid, 1, transpose, values );
            break;
            
            case 16:
                glUniformMatrix4fv( uid, 1, transpose, values );
            break;
        }
    }

    /** Compiles the given shader source to the given id
     *  @param shaderId - The shader id to use
     *  @param source - The shader source code.
     *  @return true if successfull false otherwise. 
     *  */

    bool compileShader( GLuint shaderId, const char * source )
    {
		GL_ASSERT();
        GLint compiled;
    
        glShaderSource( shaderId, 1, &source, NULL );
        glCompileShader( shaderId );
    
        // Check the compile status
        glGetShaderiv( shaderId, GL_COMPILE_STATUS, &compiled);
        if(!compiled)
        {
            GLint infoLen = 0;
            glGetShaderiv( shaderId, GL_INFO_LOG_LENGTH, &infoLen );
            if ( infoLen > 1 )
            {
                char *infoLog=(char*)malloc(sizeof(char) * infoLen );
                glGetShaderInfoLog( shaderId, infoLen, NULL, infoLog );
                printf( "Error in Shader Creation: %s, %s\n", infoLog, source );
            
                free( infoLog );
            }
            return false;
        }

		GL_ASSERT();
    
        return true;
    }

    ~Shader() 
    {
    }

    // ---

    bool depthWrite;
    bool depthTest;
    bool culling;

    int blendType;

    std::string vsrc, fsrc;

    GLuint vid, fid, id;
};
