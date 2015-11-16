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

#include "gl.hpp"
#include "jswrapper.hpp"

class Texture 
{
public:
    Texture( JSWrapperObject *imagesObj, bool cube ) : imagesObject( imagesObj )
    {
        /** 2d texture
         *  @constructor 
         *  @param {VG.Core.Image} images - The source images
         *  @param {bool} cube - If true then the image array is treated as cube faces
         *  */

        /* Texture coordinate wrapping
         * @member {enum}*/
        wrapU = 0;//VG.Texture.Wrap.Clamp;

        /* Texture coordinate wrapping
         * @member {enum} */
        wrapV = 0;//VG.Texture.Wrap.Clamp;

        /* If true generates and uses mipmaps
         * @member {bool} */
        mipmaps = false;

        /* Texture filtering VG.Texture.FilterNone, VG.Texture.Filter.Bilinear, 
         * VG.Texture.Filter.Trilinear, VG.Texture.Filter.Anisotropic
         * @member {enum}*/
        filtering = 0;//VG.Texture.Filter.None;

        unsigned int length;
        imagesObject->getArrayLength( &length );

        if ( length > 0 )
        {
            JSWrapperData image0Data;
            imagesObject->getArrayElement( 0, &image0Data );

            JSWrapperData data;
            image0Data.object()->get( "realWidth", &data );
            initialRealWidth = data.toNumber();
            image0Data.object()->get( "realHeight", &data );
            initialRealHeight = data.toNumber();
            image0Data.object()->get( "width", &data );
            initialWidth = data.toNumber();            
            image0Data.object()->get( "height", &data );
            initialHeight = data.toNumber();
        }

        target = cube ? GL_TEXTURE_CUBE_MAP : GL_TEXTURE_2D;

        //if (!images instanceof Array) throw "images is not an array";

        id = 0;
    }

    void bind()
    {
        unsigned int length;
        imagesObject->getArrayLength( &length );

        if ( length > 0 )
        {
            JSWrapperData image0Data;
            imagesObject->getArrayElement( 0, &image0Data );

            JSWrapperData data;
            image0Data.object()->get( "needsUpdate", &data );

            if ( target == GL_TEXTURE_2D && data.toBoolean() )
            {            
                data.setBoolean( false );
                image0Data.object()->set( "needsUpdate", data );
                this->initialRealWidth=0; this->initialRealHeight=0;

                update( 0, 0, -1, -1 );
            }
        }

        glBindTexture( target, id );
		GL_ASSERT();
    }

    void create()
    {
        /** Creates the texture on the gpu */

        //if ( id == 9) throw "Texture already on gpu";

        glGenTextures( /*GL_TEXTURE_2D,*/ 1, &id );

        bind();

#ifndef _WIN32
        if (mipmaps)
        {
            glGenerateMipmap( target );
        }
#endif

        GLuint minFilter = mipmaps ? GL_NEAREST_MIPMAP_NEAREST : GL_NEAREST;
        GLuint magFilter = GL_NEAREST;

        GLuint wrapS = wrapU == /*VG.Texture.Wrap.Clamp*/0 ? GL_CLAMP_TO_EDGE : GL_REPEAT;
        GLuint wrapT = wrapV == /*VG.Texture.Wrap.Clamp*/0 ? GL_CLAMP_TO_EDGE : GL_REPEAT;

        switch ( filtering )
        {
            case 2://VG.Texture.Filter.Bilinear:
                minFilter = mipmaps ? GL_LINEAR_MIPMAP_NEAREST : GL_LINEAR;
                magFilter = GL_LINEAR;
            break;
            case 4://VG.Texture.Filter.Anisotropic: //TODO check for the extension
            case 3://VG.Texture.Filter.Trilinear:
                minFilter = mipmaps ? GL_LINEAR_MIPMAP_LINEAR : GL_LINEAR;
                magFilter = GL_LINEAR;
            break;
        }
    
        glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, minFilter );
        glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, magFilter );
    
        glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, wrapS);
        glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, wrapT);

        JSWrapperData image0Data;
        imagesObject->getArrayElement( 0, &image0Data );

        JSWrapperData data;
        image0Data.object()->get( "realWidth", &data );
        GLint w = data.toNumber();
        initialRealWidth = data.toNumber();
        image0Data.object()->get( "realHeight", &data );
        GLint h = data.toNumber();
        initialRealHeight = data.toNumber();
        image0Data.object()->get( "width", &data );
        initialWidth = data.toNumber();            
        image0Data.object()->get( "height", &data );
        initialHeight = data.toNumber();

        if ( target == GL_TEXTURE_CUBE_MAP )
        {
            GLuint faceOrder[]={
                             GL_TEXTURE_CUBE_MAP_POSITIVE_X,
                             GL_TEXTURE_CUBE_MAP_NEGATIVE_X,
                             GL_TEXTURE_CUBE_MAP_POSITIVE_Y,
                             GL_TEXTURE_CUBE_MAP_NEGATIVE_Y,
                             GL_TEXTURE_CUBE_MAP_POSITIVE_Z,
                             GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
            };

            unsigned int length; imagesObject->getArrayLength( &length );
            for ( unsigned int i=0; i < length; ++i )
            {
                JSWrapperData imageObjectData, imageData;
                imagesObject->getArrayElement( i, &imageObjectData );

                imageObjectData.object()->get( "data", &imageData );
                if ( imageData.object()->isTypedArray() )
                {
                    unsigned int length; uint8_t *ptr;
                    imageData.object()->getAsUint8Array( &ptr, &length );

                    glTexImage2D( faceOrder[i], 0, GL_RGBA, w, h, 0, GL_RGBA, GL_UNSIGNED_BYTE, ptr );
                    GL_ASSERT();
                }
            }
        } else {
            image0Data.object()->get( "data", &data );
            if ( data.object()->isTypedArray() )
            {
                unsigned int length; uint8_t *ptr;
                data.object()->getAsUint8Array( &ptr, &length );

                glTexImage2D( target, 0, GL_RGBA, w, h, 0, GL_RGBA, GL_UNSIGNED_BYTE, ptr );
                GL_ASSERT();
            }
        }

		GL_ASSERT();
    }

    void update( GLint x, GLint y, GLint w, GLint h)
    {
        /** Updates the image pixel data from the internal image, cube textures are not supported
         * 
         *  @param {number} [0] x - The X offset
         *  @param {number} [0] y - The y offset
         *  @param {number} [-1] w - The width, defaults to full width or -1
         *  @param {number} [-1] h - The height, default to full height or -1
         */

        if ( target == GL_TEXTURE_CUBE_MAP) return;

        JSWrapperData image0Data;
        imagesObject->getArrayElement( 0, &image0Data );

        JSWrapperData data;
        image0Data.object()->get( "realWidth", &data );
        GLint imW = data.toNumber();
        image0Data.object()->get( "realHeight", &data );
        GLint imH = data.toNumber();        

        //if the dimmension has changed, recreate the texture from scratch
        if (imW != initialRealWidth || imH != initialRealHeight)
        {
            destroy();
            create();

            return;
        }

        /*if (!x) x = 0;
        if (!y) y = 0;*/
        if (!w) w = imW;
        if (!h) h = imH;

        glBindTexture( target, id );

		GL_ASSERT();

        //gl.texSubImage2D(this.target, 0, x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, image.data);
    }

    void destroy()
    {
        /** Releases the texture from gpu */
        if (id == 0) return;

        glDeleteTextures( 1, &id );
        id = 0;
    }

    void dispose()
    {
        /** Disposes the texture */

        delete imagesObject;
        destroy();
    }

    //VG.Texture.Wrap = { Clamp: 0, Repeat: 1 };
    //VG.Texture.Filter = { None: 0, Linear: 1, Bilinear: 2, Trilinear: 3, Anisotropic: 4 };    

    ~Texture() 
    {
    }

    // ---

    GLuint wrapU;
    GLuint wrapV;
    GLuint mipmaps;
    GLuint filtering;
    bool flipY;

    GLuint id;
    GLuint target;

    GLint initialWidth, initialHeight;
    GLint initialRealWidth, initialRealHeight;

    JSWrapperObject *imagesObject;
};
