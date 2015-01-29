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

#include <jsapi.h>
#include <jsfriendapi.h>

#include "image_loader.hpp"



using namespace JS;

// --

extern bool g_redraw;
extern std::string vgDir;

bool print(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    if ( argc == 1 )
    {
        JSString *string = args[0].toString();
        printf( "%s\n", JS_EncodeString( cx, string ) );
    }

    return true;
}

bool loadStyleImage(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    static char path[1024];

    JSString *style = args[0].toString();
    JSString *name = args[1].toString();

    strcpy( path, vgDir.c_str() );//"/Users/markusm/Documents/VisualGraphics/vglib/ui/styles/" );
    strcat( path, "vglib/ui/styles/" );
    strcat( path, JS_EncodeString( cx, style ) );
    strcat( path, "/icons/" );
    strcat( path, JS_EncodeString( cx, name ) );

	printf( "%s\n", path );

    VImage image;
    
    if (VImage::loadFromFile(path, image))
    {
        // --- Create a new image
        sprintf( path, "VG.Core.Image( %d, %d );", image.width, image.height );

        Value th=JS_ComputeThis( cx, vp ); RootedObject thisObj(cx, &th.toObject() );
        RootedValue imageValue(cx);  MutableHandleValue imageHandle( &imageValue );
        bool ok = JS_EvaluateScript( cx, HandleObject(thisObj), path, strlen(path), "unknown", 1, imageHandle );    

        // --- Set its name
        RootedValue imageNameValue(cx); imageNameValue.setString( name );//JS_NewStringCopyN( cx, name, strlen(name) ) );
        RootedObject imageObject(cx, &imageValue.toObject() );
        JS_SetProperty( cx, HandleObject(imageObject), "name", MutableHandleValue(&imageNameValue) );

        // --- Copy the image data
        RootedValue data(cx); 
        JS_GetProperty( cx, HandleObject(imageObject), "data", MutableHandleValue(&data) );
        ok=JS_IsTypedArrayObject(&data.toObject() );
        if ( ok ) {
            unsigned int length; uint8_t *ptr;
            JS_GetObjectAsUint8Array( &data.toObject(), &length, &ptr );

            RootedValue moduloValue(cx); JS_GetProperty( cx, HandleObject(imageObject), "modulo", MutableHandleValue(&moduloValue) );
            unsigned int modulo=moduloValue.toInt32();

            for (int h = 0; h < image.height; h++)
            {
                uint8_t* sptr = (uint8_t*) (image.data + h * (4 * image.width));
                uint8_t* dptr = (uint8_t*) (ptr + h*modulo);
        
                for (int w = 0; w < image.width; w++)
                {
                    *dptr++=*(sptr+0);
                    *dptr++=*(sptr+1);
                    *dptr++=*(sptr+2);
                    *dptr++=*(sptr+3);
                    sptr+=4;
                }
            }

        }

        // --- Add the image to the pool

        Value imagePoolValue; RootedValue imagePoolRootValue( cx, imagePoolValue );
        ok = JS_EvaluateScript( cx, HandleObject(thisObj), "VG.context.imagePool", strlen("VG.context.imagePool"), "unknown", 1, MutableHandleValue( &imagePoolRootValue ) );

        RootedValue rc(cx); MutableHandleValue rcHandle( &rc );
        RootedObject rootedImagePoolObject(cx, &imagePoolRootValue.toObject() );
        Call( cx, HandleObject(rootedImagePoolObject), "addImage", HandleValueArray( imageValue ), rcHandle );

        image.free();            
    }

    return true;
}

bool decompressImageData(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    printf( "decompressImageData not implemented!\n" );    
    return true;    
}

bool getHostProperty(JSContext *cx, unsigned argc, jsval *vp)
{
    printf( "getHostProperty not implemented!\n" );
    return true;
}

bool setHostProperty(JSContext *cx, unsigned argc, jsval *vp)
{
    printf( "setHostProperty not implemented!\n" );
    return true;
}

bool sendBackendRequest(JSContext *cx, unsigned argc, jsval *vp)
{
    printf( "sendBackendRequest not implemented!\n" );
    return true;
}

bool setMouseCursor(JSContext *cx, unsigned argc, jsval *vp)
{
    //printf( "setMouseCursor not implemented!\n" );
    return true;
}

bool hostUpdate(JSContext *cx, unsigned argc, jsval *vp)
{
    g_redraw=true;
    return true;
}

static JSFunctionSpec vg_global_functions[] = {
    JS_FS("loadStyleImage", loadStyleImage, 0, 0),
    JS_FS("decompressImageData", decompressImageData, 0, 0),
    JS_FS("getHostProperty", getHostProperty, 0, 0),
    JS_FS("setHostProperty", setHostProperty, 0, 0),
    JS_FS("sendBackendRequest", sendBackendRequest, 0, 0),
    JS_FS("setMouseCursor", setMouseCursor, 0, 0),
    JS_FS("hostUpdate", hostUpdate, 0, 0),
    JS_FS("print", print, 0, 0),

    JS_FS_END
};

void registerVGFunctions( JSContext *cx, JSObject *vgObject )
{
    RootedObject obj(cx, vgObject );
  
    if ( !JS_DefineFunctions( cx, HandleObject(obj), vg_global_functions ) )
        JS_ReportError( cx, "Error Registering Global VG Functions!" );
}
