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
#include "gl.hpp"

class RenderTarget 
{
public:
    RenderTarget( GLint w, GLint h, bool main ) 
    {
        /** A frame buffer that can be binded as a texture, if width or 
         *  height are not provided, it will resize automatically. 
         *  @constructor 
         *  @param {number} w - Width in pixels
         *  @param {number} h - Height in pixels 
         *  @param {bool} main - Determines if this is a main frame bufer
         *  */

        this->w = w ? w : 16;
        this->h = h ? h : 16;

        this->main = main;

        this->imageWidth=0; this->imageHeight=0;

        id = 0;
        rbid = 0;

        if ( main )
        {
            //force autoResize if this is a main frame buffer
            autoResize = true;
        }

        //this holds the texture
        texid = 0;

        //VG.Renderer().addResource(this);
    }

    void create()
    {
        /** Creates the frame buffer in the gpu */
        if ( main ) return;
    
        if ( id != 0 ) return;//throw "RenderTarget already created";
    
        glGenFramebuffers( 1, &id );
    
        glBindFramebuffer( GL_FRAMEBUFFER, id);
    
        glGenTextures( /*GL_TEXTURE_2D,*/ 1, &texid );
    
        //self.texid = glCreateTexture( GL_TEXTURE_2D);
    
        glBindTexture( GL_TEXTURE_2D, texid);
        glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR );
        glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST );
        glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    
        //we dont need to assign any data
        glTexImage2D( GL_TEXTURE_2D, 0, GL_RGBA, w, h, 0, GL_RGBA, GL_UNSIGNED_BYTE, NULL);
    
        //gl.generateMipmap(gl.TEXTURE_2D);
    
        glGenRenderbuffers( 1, &rbid );
    
        glBindRenderbuffer( GL_RENDERBUFFER, rbid );
        //set the depth buffer, standard 16bit for better portability
        glRenderbufferStorage( GL_RENDERBUFFER, GL_DEPTH_COMPONENT16, w, h );
    
        //attach the texture
        glFramebufferTexture2D( GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, texid, 0);
        glFramebufferRenderbuffer( GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, rbid );
    
    
        //make sure to clear to default
        glBindRenderbuffer(GL_RENDERBUFFER, 0 );
        glBindTexture( GL_TEXTURE_2D, 0 );
        glBindFramebuffer( GL_FRAMEBUFFER, 0 );
    }

    void destroy()
    {
        if (id == 0) return;

        glDeleteFramebuffers(1, &id);
        glDeleteRenderbuffers(1, &rbid);
        glDeleteTextures(1, &texid);

        id = 0;
        rbid = 0;
        texid = 0;
    }

    GLint getRealWidth()
    {
        /** Get the real width of the image (power of two).
         * @returns {int}
         */
        return this->w;
    };
    
    GLint getRealHeight()
    {
        /** Get the real height of the image (power of two).
         * @returns {int}
         */
        return this->h;
    };
    
    GLint getWidth()
    {
        /** Get the user specified width of the Image.
         * @returns {int}
         */
        
        return this->imageWidth ? this->imageWidth : this->w;
    };
    
    GLint getHeight()
    {
        /** Get the user specified height of the Image.
         * @returns {int}
         */
        return this->imageHeight ? this->imageHeight : this->h;
    };
    
    void dispose()
    {
        /** Disposes the render target */
        destroy();
        //VG.Renderer().removeResource(this);
    }

    void unbind()
    {
        /** Unbinds the frame buffer, in this case the main frame buffer will be
         *  used for rendering */

        glBindFramebuffer( GL_FRAMEBUFFER, 0);
    }

    void bind()
    {
        /** Binds the frame buffer, unbind must be called aftet drawing to ensure
         *  flush into the main frame buffer */

        if (main)
        {
            //force unbind if any
            unbind();
        }
        else
        {
            glBindFramebuffer( GL_FRAMEBUFFER, id);
        }
    }

    void bindAsTexture()
    {
        /** Binds this frame buffer as a texture */

        if (main) return;//throw "You can't bind a main frame buffer as texture";

        glBindTexture( GL_TEXTURE_2D, texid );
    }

    void resize( GLint w, GLint h)
    {
        /** Resizes the frame buffer, it must not be binded as this recreates
         *  the interal data */

        destroy();

        this->w = w;
        this->h = h;

        this->create();
    }

    void resetSize( GLint w, GLint h )
    {
        /** Resizes the frame buffer, it must not be binded as this recreates
         *  the interal data */

        if ( !id || this->w != w || this->h != h )
            resize( w, h );
        else
        {
            bind();
            clear( -1, -1, -1, -1, 0 );
            unbind();
        }
    }

    void setViewport( GLfloat x, GLfloat y, GLfloat width, GLfloat height )
    {
        /** Sets the drawing viewport for the next draw call and on 
         *  @param {VG.Core.Rect} rect - The rect to be used */

        glViewport( x, h - (y+height), width, height );
    }

    void setScissor( GLfloat x, GLfloat y, GLfloat width, GLfloat height )
    {
        /** Sets the scissor for the next draw call and on, it discards pixels outside the rect
         *  @param {VG.Core.Rect} rect - The rect, if null/false then it clears it.*/
        if ( width > 0 && height > 0 )
        {
            glEnable( GL_SCISSOR_TEST );
            glScissor(x, h - (y+height), width, height);
        }
        else
        {
            if (width < 0 || height < 0) {
                printf("RenderTarget.setScissor(glScissor) gets invalid rect(x, y, width, height) paramters : rect(%f, %f, %f, %f\n", x, y, width, height);
            }
            glDisable( GL_SCISSOR_TEST );
        }
    }

    void clear( GLfloat r, GLfloat g, GLfloat b, GLfloat a, GLfloat depth)
    {
        /** Clears the frame buffer
         *  @param {VG.Core.Color} color  - The color to clear to 
         *  @param {numbeR} depth - If defined then the depth buffer is cleared with this value */

        GLuint clearBits = 0;

        //if ( r != - 1 )
        {
            glClearColor( r, g, b, a);
            clearBits |= GL_COLOR_BUFFER_BIT;
        }

        //if ( depth != -1 )
        {
            glClearDepth(depth);
            clearBits |= GL_DEPTH_BUFFER_BIT;
        }


        glClear(clearBits);
    }

    bool checkStatusComplete()
    {
        //if ( glCheckFramebufferStatus( id ) == GL_FRAMEBUFFER_COMPLETE ) return true;
        //else return false;
        return true;
    }

    ~RenderTarget() 
    {

    }

    // ---

    GLuint id;
    GLint w;
    GLint h;
    GLint imageWidth, imageHeight;
    GLuint rbid;
    bool autoResize, main;
    GLuint texid;
};
