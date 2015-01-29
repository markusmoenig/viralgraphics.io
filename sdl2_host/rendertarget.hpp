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
 * You should have received a copy of the GNU General Public License
 * along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

#include <iostream>

#include "gl.hpp"

#include <jsapi.h>
using namespace JS;

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

        autoResize = w == 0 || h == 0;

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

    void release()
    {
        /** Realeses the frame buffer from gpu */
        if (id == 0) return;

        glDeleteFramebuffers(1, &id);
        glDeleteRenderbuffers(1, &rbid);
        glDeleteTextures(1, &texid);

        id = 0;
        rbid = 0;
        texid = 0;
    }

    void dispose()
    {
        /** Disposes the render target */
        release();
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

        release();

        this->w = w;
        this->h = h;

        this->create();
    }

    void setViewport( GLint x, GLint y, GLint width, GLint height )
    {
        /** Sets the drawing viewport for the next draw call and on 
         *  @param {VG.Core.Rect} rect - The rect to be used */

        glViewport( x, y, width, height );
    }

    void setScissor( GLint x, GLint y, GLint width, GLint height )
    {
        /** Sets the scissor for the next draw call and on, it discards pixels outside the rect
         *  @param {VG.Core.Rect} rect - The rect, if null/false then it clears it.*/

        if ( width && height )
        {
            glEnable( GL_SCISSOR_TEST );
            glScissor(x, h - (y+height), width, height);
        }
        else
        {
            //disable scissor
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

        if ( depth != -1 )
        {
            glClearDepthf(depth);
            clearBits |= GL_DEPTH_BUFFER_BIT;
        }


        glClear(clearBits);
    }

    ~RenderTarget() 
    {

    }

    // ---

    GLuint id;
    GLint w;
    GLint h;
    GLuint rbid;
    bool autoResize, main;
    GLuint texid;
};
