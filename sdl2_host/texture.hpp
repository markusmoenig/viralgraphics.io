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

#include <jsfriendapi.h>

class Texture 
{
public:
    Texture( JSContext *cx, JSObject *images, bool cube )// : images( cx, imgs ) //, heapImages( cx, imgs )
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

        /* if true flippes the Y cordinate
         * @member {bool}*/
        flipY = true;

        RootedObject imagesObject( cx, images );

        unsigned int length;
        JS_GetArrayLength( cx, HandleObject(imagesObject), &length );

        if ( length > 0 )
        {
            RootedValue image0(cx); JS_GetElement( cx, HandleObject(imagesObject), 0, MutableHandleValue(&image0) );
            RootedObject image0Obj(cx, &image0.toObject() );
            RootedValue imageRealWidth(cx); JS_GetProperty( cx, HandleObject( &image0Obj ), "realWidth", MutableHandleValue(&imageRealWidth) );
            RootedValue imageRealHeight(cx); JS_GetProperty( cx, HandleObject( &image0Obj ), "realHeight", MutableHandleValue(&imageRealHeight) );
            initW = imageRealWidth.toInt32();
            initH = imageRealHeight.toInt32();
        }

        target = cube ? GL_TEXTURE_CUBE_MAP : GL_TEXTURE_2D;

        //if (!images instanceof Array) throw "images is not an array";

        this->cx=cx;
        this->images=images;

        heapImages=new Heap<JSObject*>( images );
        AddNamedObjectRoot(cx, heapImages, "Images");

        id = 0;
    }

    void bind()
    {
        RootedObject imagesObject( cx, images );

        unsigned int length;
        JS_GetArrayLength( cx, HandleObject(imagesObject), &length );

        if ( length > 0 )
        {
            RootedValue image0(cx); JS_GetElement( cx, HandleObject(imagesObject), 0, MutableHandleValue(&image0) );
            RootedObject image0Obj(cx, &image0.toObject() );
            RootedValue needsUpdate(cx); JS_GetProperty( cx, HandleObject( &image0Obj ), "needsUpdate", MutableHandleValue(&needsUpdate) );

            if ( target == GL_TEXTURE_2D && needsUpdate.toBoolean() )
            {
                needsUpdate.setBoolean( false );
                JS_SetProperty( cx, HandleObject( &image0Obj ), "needsUpdate", MutableHandleValue(&needsUpdate) );

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

        if ( flipY )
        {
            //??glPixelStorei( GL_UNPACK_FLIP_Y_WEBGL, 1);
        }

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

        RootedObject imagesObject( cx, images );
        RootedValue image0(cx); JS_GetElement( cx, HandleObject(imagesObject), 0, MutableHandleValue(&image0) );
        RootedObject image0Obj(cx, &image0.toObject() );
        RootedValue imageRealWidth(cx); JS_GetProperty( cx, HandleObject( &image0Obj ), "realWidth", MutableHandleValue(&imageRealWidth) );
        RootedValue imageRealHeight(cx); JS_GetProperty( cx, HandleObject( &image0Obj ), "realHeight", MutableHandleValue(&imageRealHeight) );
        GLint w = imageRealWidth.toInt32();
        GLint h = imageRealHeight.toInt32();

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

            //if (this.images.length != 6) throw "unexpected number of faces";

            //for (var i = 0; i < this.images.length; i++)
            {
            //    gl.texImage2D(faceOrder[i], 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.images[i].data); 
            }

        }
        else
        {
            RootedValue data(cx); JS_GetProperty( cx, HandleObject( &image0Obj ), "data", MutableHandleValue(&data) );
            bool ok=JS_IsTypedArrayObject( &data.toObject() );
            if ( ok ) {
                unsigned int length; uint8_t *ptr;
                JS_GetObjectAsUint8Array( &data.toObject(), &length, &ptr );

                glTexImage2D( GL_TEXTURE_2D, 0, GL_RGBA, w, h, 0, GL_RGBA, GL_UNSIGNED_BYTE, ptr );
            }

            GL_ASSERT();
        }
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

        RootedObject imagesObject( cx, images );
        RootedValue image0(cx); JS_GetElement( cx, HandleObject(imagesObject), 0, MutableHandleValue(&image0) );
        RootedObject image0Obj(cx, &image0.toObject() );
        RootedValue imageRealWidth(cx); JS_GetProperty( cx, HandleObject( &image0Obj ), "realWidth", MutableHandleValue(&imageRealWidth) );
        RootedValue imageRealHeight(cx); JS_GetProperty( cx, HandleObject( &image0Obj ), "realHeight", MutableHandleValue(&imageRealHeight) );
        GLint imW = imageRealWidth.toInt32();
        GLint imH = imageRealHeight.toInt32();

        //if the dimmension has changed, recreate the texture from scratch
        if (imW != this->initW || imH != this->initH)
        {
            release();
            create();

            return;
        }

        /*if (!x) x = 0;
        if (!y) y = 0;*/
        if (!w) w = imW;
        if (!h) h = imH;

        glBindTexture( target, id );

        //gl.texSubImage2D(this.target, 0, x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, image.data);
    }

    void release()
    {
        /** Releases the texture from gpu */
        if (id == 0) return;

        glDeleteTextures( 1, &id );
        id = 0;
    }

    void dispose()
    {
        /** Disposes the texture */

        RemoveObjectRoot( cx, heapImages );
        delete heapImages;

        release();
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

    GLint initW, initH;

    JSContext *cx;
    JSObject *images;
    Heap<JSObject *> *heapImages;
};
