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

#include <jsapi.h>
#include <jsfriendapi.h>
#include <nfd.h>
#include "base64.h"
#include "jshost.hpp"

#include "image_loader.hpp"

using namespace JS;

extern JSHost *g_host;
extern int g_width, g_height;

#ifdef __APPLE__
    extern void setMouseCursor_cocoa( const char * );
    extern const char *sendBackendRequest_cocoa( const char *url, const char *parameters, const char *type, void *heap );    
    extern const char *clipboardPasteDataForType_cocoa( const char *type );
    extern void copyToClipboard_cocoa( const char *type, const char *data );
    extern void addNativeMenu_cocoa( const char *name );
    extern void addNativeMenuItem_cocoa( const char *menuName, const char *menuItemName, int menuItemId, bool disabled, bool checked, const char *key, int mod1, int mod2 );
    extern void setNativeMenuItemState_cocoa( int menuItemId, bool disabled, bool checked );
    extern void hostProjectStarted_cocoa();
    extern void hostProjectEnded_cocoa();
    extern void setWindowTitle_cocoa( const char *_title, const char *_filePath );    
    extern void setProjectChangedState_cocoa( bool value );
#endif

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

// --- loadStyleImage, load a local (style) image, decompress it and call the callback with the newly created VG.Core.Image

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

	//printf( "%s\n", path );

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

// --- decompressImageData, decompresses the given image data into the given image.

bool decompressImageData(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    // --- Arg 0 -> Base64 Data of Image
    JSString *jsdata = args[0].toString();
    const char *b64data=JS_EncodeString( cx, jsdata );

    // --- Arg 1 -> VG.Core.Image
    RootedObject imageObject(cx, &args[1].toObject() );

    VImage image;

    if ( strncmp( b64data, "data:image/jpeg;base64,", 23 ) == 0 )
    {
        //printf( "is jpeg\n" );

        std::string result=base64_decode( std::string( b64data+23 ) );
        image.decompress( IMAGE_TYPE_JPG, (const unsigned char *) result.data(), result.length(), image );
    } else
    if ( strncmp( b64data, "data:image/png;base64,", 22 ) == 0 )
    {
        //printf( "is png\n" );

        std::string result=base64_decode( std::string( b64data+22 ) );
        image.decompress( IMAGE_TYPE_PNG, (const unsigned char *) result.data(), result.length(), image );
    } else {
        printf( "decompressImageData::Unknown Image Type!\n" );
        return true;
    }

    // --- Set Image Width / Height
    RootedValue value(cx); value.setNumber( image.width );
    JS_SetProperty( cx, HandleObject(imageObject), "width", MutableHandleValue(&value) );  
    value.setNumber( image.height );
    JS_SetProperty( cx, HandleObject(imageObject), "height", MutableHandleValue(&value) );

    // --- Tell the system that textures based on this image need an update
    value.setBoolean( true );
    JS_SetProperty( cx, HandleObject(imageObject), "needsUpdate", MutableHandleValue(&value) );

    // --- Allocate the image
    RootedValue rc(cx); MutableHandleValue handleValue( &rc );
    Call( cx, HandleObject(imageObject), "alloc", HandleValueArray::empty(), MutableHandleValue(&rc) );   

    // --- Copy the image data
    RootedValue data(cx); 
    JS_GetProperty( cx, HandleObject(imageObject), "data", MutableHandleValue(&data) );
    bool ok=JS_IsTypedArrayObject(&data.toObject() );
    if ( ok ) 
    {
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

    JS_free( cx, (void *) b64data );
    image.free();

    return true;    
}

// --- OpenFileDialog, opens a local file through a dialog and sends the content and path to the provided Callback.

bool OpenFileDialog(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    int fileType=args[0].toInt32();

    nfdchar_t *outPath = NULL;
    nfdresult_t result = NFD_OpenDialog( NULL, NULL, &outPath );

    if ( result == NFD_OKAY )
    {
        //printf( outPath );

        // --- Read the file

        FILE* file = fopen( outPath, "rb");

        fseek(file, 0, SEEK_END);
        int size = ftell(file);
        rewind(file);

        char* chars = new char[size + 1];
        chars[size] = '\0';
        for (int i = 0; i < size;) 
        {
            int read = static_cast<int>(fread(&chars[i], 1, size - i, file));
            i += read;
        }
        fclose(file);

        RootedValue rc(cx); MutableHandleValue rcHandle( &rc );
        Value th=JS_ComputeThis( cx, vp ); RootedObject thisObj(cx, &th.toObject() );

        if ( fileType == 0 )
        {
            // --- Image, returns a new VG.Core.Image Object

            char imageCmd[80];

            ImageType type=VImage::getTypeFromPath( outPath );

             if ( type == IMAGE_TYPE_INVALID ) {
                printf( "VG.OpenFileDialog::Unknown Image Type!\n" );
                delete chars;
                return true;
            }

            VImage image;

            image.decompress( type, (const unsigned char *) chars, size, image );

            // --- Create a new image
            sprintf( imageCmd, "VG.Core.Image( %d, %d );", image.width, image.height );

            Value th=JS_ComputeThis( cx, vp ); RootedObject thisObj(cx, &th.toObject() );
            RootedValue imageValue(cx);  MutableHandleValue imageHandle( &imageValue );
            bool ok = JS_EvaluateScript( cx, HandleObject(thisObj), imageCmd, strlen(imageCmd), "unknown", 1, imageHandle );    

            // --- Set its name
            RootedValue imageNameValue(cx); imageNameValue.setString( JS_NewStringCopyN( cx, outPath, strlen(outPath) ) );
            RootedObject imageObject(cx, &imageValue.toObject() );
            JS_SetProperty( cx, HandleObject(imageObject), "name", MutableHandleValue(&imageNameValue) );

            // --- Set its data
            std::string base64=base64_encode( (const unsigned char *) chars, size );

            if ( type == IMAGE_TYPE_PNG ) base64.insert( 0, std::string( "data:image/png;base64," ) );
            else
            if ( type == IMAGE_TYPE_JPG ) base64.insert( 0, std::string( "data:image/jpeg;base64," ) );

            RootedValue imageDataValue(cx); imageDataValue.setString( JS_NewStringCopyN( cx, base64.c_str(), base64.length() ) );
            JS_SetProperty( cx, HandleObject(imageObject), "imageData", MutableHandleValue(&imageDataValue) );            

            // --- Copy the image data
            RootedValue data(cx); 
            JS_GetProperty( cx, HandleObject(imageObject), "data", MutableHandleValue(&data) );
            ok=JS_IsTypedArrayObject(&data.toObject() );
            if ( ok ) 
            {
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

            image.free();

            // --- Call the Callback

            AutoValueVector vector(cx);
            vector.append( imageValue );

            JS_CallFunctionValue( cx, HandleObject(thisObj), HandleValue( args[1] ), HandleValueArray( vector ), rcHandle );            
        }
        else
        {
            JSString *name = JS_NewStringCopyN(cx, outPath, strlen(outPath));
            RootedValue nameValue(cx); nameValue.setString( name );

            JSString *content = JS_NewStringCopyN(cx, chars, strlen(chars));
            RootedValue contentValue(cx); contentValue.setString( content );            

            AutoValueVector vector(cx);
            vector.append( nameValue );
            vector.append( contentValue );

            JS_CallFunctionValue( cx, HandleObject(thisObj), HandleValue( args[1] ), HandleValueArray( vector ), rcHandle );
        }

        delete chars;
    }

    return true;
}

// --- SaveFileDialog, saves a file locally using a native FileDialog.

bool SaveFileDialog(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    int fileType=args[0].toInt32();

    JSString *jsdata = args[2].toString();
    const char *data=JS_EncodeString( cx, jsdata );

    nfdchar_t *outPath = NULL;
    nfdresult_t result = NFD_SaveDialog( NULL, NULL, &outPath );

    if ( result == NFD_OKAY )
    {
        //printf( outPath );

        // --- Write the file

        FILE* file = fopen( outPath, "w");
        fprintf(file, "%s", data );
        fclose(file);

    }

    JSString *path;

    if ( outPath ) path=JS_NewStringCopyN(cx, outPath, strlen(outPath));
    else path=JS_NewStringCopyN(cx, "", 0 );

    args.rval().setString( path );

    JS_free( cx, (void *) data );

    return true;
}

// --- saveFile, saves a file locally using the provided path and content. Returns true on success, false otherwise.

bool saveFile(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    JSString *jsdata = args[0].toString();
    const char *pathChars=JS_EncodeString( cx, jsdata );

    jsdata = args[1].toString();
    const char *dataChars=JS_EncodeString( cx, jsdata );

    int rc=1;

    FILE* file = fopen( pathChars, "w");
    if ( file ) {
        fprintf(file, "%s", dataChars );
        fclose(file);
    } else rc=0;

    JS_free( cx, (void *) pathChars );
    JS_free( cx, (void *) dataChars );

    args.rval().setInt32( rc );

    return true;
}

// --- setWindowTitle

bool setWindowTitle(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    JSString *title = args[0].toString();
    const char *titleChars=JS_EncodeString( cx, title );

    JSString *path = args[1].toString();
    const char *pathChars=JS_EncodeString( cx, path );

#ifdef __APPLE__            
    setWindowTitle_cocoa( titleChars, pathChars );
#endif

    JS_free( cx, (void *) titleChars );
    JS_free( cx, (void *) pathChars );

    return true;
};

// --- getHostProperty

/*
VG.HostProperty={ 
    "Platform" : 0,
    "PlatformWeb" : 1,
    "PlatformDesktop" : 2,
    "PlatformTablet" : 3,
    "PlatformMobile" : 4,

    "OperatingSystem" : 5,
    "OSWindows" : 6,
    "OSMac" : 7,
    "OSUnix" : 8,
    "OSLinux" : 9,

    "DrawMenus" : 12,

    "ProjectChangedState" : 20
};
*/

bool getHostProperty(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    int property=args[0].toInt32();
    int rc=-1;

    switch ( property )
    {
        case 0 ://VG.HostProperty.Platform :
            rc= 2;//VG.HostProperty.PlatformWeb;
        break;

        case 5://VG.HostProperty.OperatingSystem : 
        {
#ifdef __APPLE__            
            rc=7;//VG.HostProperty.OSMac;
#endif
        }
        break;

        case 12://VG.HostProperty.DrawMenus : 
        {
#ifdef __APPLE__            
            rc=0;//VG.HostProperty.OSMac;
#endif
        }
        break;
    }

    args.rval().setInt32( rc );

    return true;
}

bool setHostProperty(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    int property=args[0].toInt32();

    if ( property == 20 )    
    {
        int value=args[1].toInt32();

#ifdef __APPLE__            
        setProjectChangedState_cocoa( value );
#endif        
    }
    return true;
}

// --- sendBackendRequest, sends a JSON data package to the given url, calls the callback with the returned JSON.

bool sendBackendRequest(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    const char *url=JS_EncodeString( cx, args[0].toString() );
    const char *parameters=JS_EncodeString( cx, args[1].toString() );
    const char *type="POST";

    if ( argc >=4 ) type=JS_EncodeString( cx, args[3].toString() );

    const char *result;

    Heap<JS::Value> *heap=new Heap<JS::Value>( args[2] );
    AddValueRoot(cx, heap );

#ifdef __APPLE__
    result=sendBackendRequest_cocoa( url, parameters, type, (void *) heap );
#else
    printf( "sendBackendRequest not implemented!\n" );
#endif

    JS_free( cx, (void *) url );  JS_free( cx, (void *) parameters );

    return true;
}

void sendBackendRequest_finished( const char *result, void *heap )
{
    //printf( "sendBackendRequest_finished %s\n", result );

    RootedValue* context=g_host->executeScript( "VG.context" );
    RootedObject contextObject(g_host->cx, &context->toObject() );
    
    RootedValue rc(g_host->cx); MutableHandleValue rcHandle( &rc );

    JSString *content = JS_NewStringCopyN(g_host->cx, result, strlen(result));
    RootedValue contentValue(g_host->cx); contentValue.setString( content );

    AutoValueVector vector(g_host->cx);
    vector.append( contentValue );

    Heap<JS::Value> *heapValue=(Heap<JS::Value> *) heap;

    RootedValue callbackObject(g_host->cx, *heapValue );
    JS_CallFunctionValue( g_host->cx, HandleObject(contextObject), HandleValue( &callbackObject ), HandleValueArray( vector ), rcHandle );
    
    RemoveValueRoot( g_host->cx, heapValue );
}

// --- setMouseCursor, sets the mouse cursor to the specified shape.

bool setMouseCursor(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    JSString *string = args[0].toString();
    const char *chars=JS_EncodeString( cx, string );

#ifdef __APPLE__
    setMouseCursor_cocoa( chars );
#else
    printf( "setMouseCursor not implemented!\n" );
#endif

    return true;
}

// --- clipboardPasteDataForType, returns the Clipboard content for the given Type (right now only "Text" type is supported).

bool clipboardPasteDataForType(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    JSString *string = args[0].toString();
    const char *chars=JS_EncodeString( cx, string );

    const char *result = "";

#ifdef __APPLE__
    result=clipboardPasteDataForType_cocoa( chars );
#else
    printf( "clipboardPasteDataForType not implemented!\n" );
#endif

    JSString *resultString = JS_NewStringCopyN(cx, result, strlen(result));
    args.rval().setString( resultString );

    JS_free( cx, (void *) chars );

    return true;
}

// --- copyToClipboard, copies the data of the given type to the native Clipboard (right now only "Text" type is supported).

bool copyToClipboard(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    JSString *string = args[0].toString();
    const char *typeChars=JS_EncodeString( cx, string );

    string=args[1].toString();
    const char *dataChars=JS_EncodeString( cx, string );

#ifdef __APPLE__
    copyToClipboard_cocoa( typeChars, dataChars );
#else
    printf( "copyToClipboard not implemented!\n" );
#endif

    JS_free( cx, (void *) typeChars );
    JS_free( cx, (void *) dataChars );

    return true;
}

// --- addNativeMenu

bool addNativeMenu(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    // --- VG.UI.Menu
    RootedObject menu(cx, &args[0].toObject() );

    RootedValue data(cx); 
    JS_GetProperty( cx, HandleObject(menu), "text", MutableHandleValue(&data) );

    JSString *name = data.toString();
    const char *nameChars=JS_EncodeString( cx, name );

#ifdef __APPLE__
    addNativeMenu_cocoa( nameChars );
#else
    printf( "addNativeMenu not implemented!\n" );
#endif

    JS_free( cx, (void *) nameChars );

    return true;
}

bool addNativeMenuItem(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    // --- VG.UI.Menu
    RootedObject menu(cx, &args[0].toObject() );
    RootedValue menuText(cx); 
    JS_GetProperty( cx, HandleObject(menu), "text", MutableHandleValue(&menuText) );
    JSString *string = menuText.toString();
    const char *menuNameChars=JS_EncodeString( cx, string );

    // --- VG.UI.MenuItem
    RootedObject menuItem(cx, &args[1].toObject() );
    RootedValue value(cx); 
    JS_GetProperty( cx, HandleObject(menuItem), "id", MutableHandleValue(&value) );

    int id=value.toInt32();

    JS_GetProperty( cx, HandleObject(menuItem), "text", MutableHandleValue(&value) );
    string = value.toString();
    const char *menuItemNameChars="";

    if ( id != -1 ) menuItemNameChars=JS_EncodeString( cx, string );

    JS_GetProperty( cx, HandleObject(menuItem), "disabled", MutableHandleValue(&value) );
    bool disabled=value.toInt32();

    JS_GetProperty( cx, HandleObject(menuItem), "checked", MutableHandleValue(&value) );
    bool checked=value.toInt32();    

    JS_GetProperty( cx, HandleObject(menuItem), "shortcut", MutableHandleValue(&value) );
    RootedObject shortcutObject(cx, &value.toObject() );

    const char *keyChars="";
    int mod1=0, mod2=0;

    if ( !value.isUndefined() )
    {
        JS_GetProperty( cx, HandleObject(shortcutObject), "key", MutableHandleValue(&value) );
        string = value.toString();
        keyChars=JS_EncodeString( cx, string );

        JS_GetProperty( cx, HandleObject(shortcutObject), "modifier", MutableHandleValue(&value) );
        mod1=value.toInt32();

        JS_GetProperty( cx, HandleObject(shortcutObject), "modifierOptional", MutableHandleValue(&value) );        
        mod2=value.toInt32();
    }

#ifdef __APPLE__
    addNativeMenuItem_cocoa( menuNameChars, menuItemNameChars, id, disabled, checked, keyChars, mod1, mod2 );
#else
    printf( "addNativeMenuItem not implemented!\n" );
#endif

    return true;
}

bool setNativeMenuItemState(JSContext *cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp( argc, vp );

    int menuItemId=args[0].toInt32();
    int disabled=args[1].toInt32();
    int checked=args[2].toInt32();

#ifdef __APPLE__
    setNativeMenuItemState_cocoa( menuItemId, disabled, checked );
#else
    printf( "addNativeMenuItem not implemented!\n" );
#endif

    return true;
}

// --- hostProjectStarted
bool hostProjectStarted(JSContext *cx, unsigned argc, jsval *vp)
{
#ifdef __APPLE__
    hostProjectStarted_cocoa();
#endif

    return true;
}

// --- hostProjectEnded
bool hostProjectEnded(JSContext *cx, unsigned argc, jsval *vp)
{
#ifdef __APPLE__
    hostProjectEnded_cocoa();
#endif

    return true;
}

// --- hostUpdate, forces the host to redraw.
bool hostUpdate(JSContext *cx, unsigned argc, jsval *vp)
{
    g_redraw=true;
    return true;
}

// --- resizeCanvas, resize the Workspace.
bool resizeCanvas(JSContext *cx, unsigned argc, jsval *vp)
{
    char cmdbuffer[80];        
    sprintf( cmdbuffer, "VG.context.workspace.resize( %d, %d );", g_width, g_height );
    g_host->executeScript( cmdbuffer );    

    return true;
}

// --- VG.xxx Function definitions and registration.

static JSFunctionSpec vg_global_functions[] = {
    JS_FS("loadStyleImage", loadStyleImage, 0, 0),
    JS_FS("decompressImageData", decompressImageData, 0, 0),
    JS_FS("OpenFileDialog", OpenFileDialog, 0, 0),
    JS_FS("SaveFileDialog", SaveFileDialog, 0, 0),
    JS_FS("saveFile", saveFile, 0, 0),
    JS_FS("getHostProperty", getHostProperty, 0, 0),
    JS_FS("setHostProperty", setHostProperty, 0, 0),
    JS_FS("sendBackendRequest", sendBackendRequest, 0, 0),
    JS_FS("setMouseCursor", setMouseCursor, 0, 0),
    JS_FS("clipboardPasteDataForType", clipboardPasteDataForType, 0, 0),
    JS_FS("copyToClipboard", copyToClipboard, 0, 0),
    JS_FS("addNativeMenu", addNativeMenu, 0, 0),
    JS_FS("addNativeMenuItem", addNativeMenuItem, 0, 0),
    JS_FS("setNativeMenuItemState", setNativeMenuItemState, 0, 0),
    JS_FS("setWindowTitle", setWindowTitle, 0, 0),
    JS_FS("hostProjectStarted", hostProjectStarted, 0, 0),
    JS_FS("hostProjectEnded", hostProjectEnded, 0, 0),
    JS_FS("hostUpdate", hostUpdate, 0, 0),
    JS_FS("resizeCanvas", resizeCanvas, 0, 0),
    JS_FS("print", print, 0, 0),

    JS_FS_END
};

void registerVGFunctions( JSContext *cx, JSObject *vgObject )
{
    RootedObject obj(cx, vgObject );
  
    if ( !JS_DefineFunctions( cx, HandleObject(obj), vg_global_functions ) )
        JS_ReportError( cx, "Error Registering Global VG Functions!" );
}
