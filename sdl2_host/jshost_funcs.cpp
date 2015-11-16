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

#include <nfd.h>
#include "base64.h"
#include "jshost.hpp"

#include "image_loader.hpp"
#include "image_saver.hpp"

#include <SDL.h>

extern std::string g_appName, g_appVersion;

extern JSHost *g_host;
extern int g_width, g_height;
extern bool g_quit;

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
    extern void setWindowTitle_cocoa( const char *_title, const char *_filePath, const char *appName, const char *appVersion );    
    extern void setProjectChangedState_cocoa( bool value );
    extern void getKeyWindow( void );
    extern void setKeyWindow( void );
    extern void gotoUrl_cocoa( const char * );
#endif

// --

extern bool g_redraw;
extern std::string vgDir;

JSWrapper *g_jsWrapper;

#include <iostream>

// --- Sample print function. Prints all arguments.

JSWRAPPER_FUNCTION( print )
    // --- JSWrapperArguments args; is already defined

    for ( int i=0; i < args.count(); ++i )
    {
        JSWrapperData data=args.at( i );

        if ( data.type() == JSWrapperData::Undefined )
            std::cout << "Undefined ";
        else
        if ( data.type() == JSWrapperData::Null )
            std::cout << "Null ";
        else            
        if ( data.type() == JSWrapperData::Number )
            std::cout << data.toNumber() << " ";
        else
        if ( data.type() == JSWrapperData::String )
            std::cout << data.toString() << " ";
        else
        if ( data.type() == JSWrapperData::Boolean )
            std::cout << data.toBoolean() << " ";
        else
        if ( data.type() == JSWrapperData::Object )
            std::cout << "[Object object] ";        
    }
 
    std::cout << std::endl;

    JSWrapperData data;
    JSWRAPPER_FUNCTION_SETRC( data )

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( quit )
    g_quit=true;
JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( loadStyleSVG )

    static char path[1024];

    strcpy( path, vgDir.c_str() );//"/Users/markusm/Documents/VisualGraphics/vglib/ui/styles/" );
    strcat( path, "vglib/ui/styles/" );
    strcat( path, args.at(0).toString().c_str() );
    strcat( path, "/svg/" );
    strcat( path, args.at(1).toString().c_str() );

    FILE* file = fopen( path, "rb");
    if ( file )
    {
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

        // --- Create a new SVG

        JSWrapperData coreObject;
        g_jsWrapper->execute( "VG.Core", &coreObject );

        JSWrapperData svgData;
        coreObject.object()->get( "SVG", &svgData );

        JSWrapperArguments arguments;
        arguments.append( args.at(1).toString() );
        arguments.append( std::string( chars ) );

        svgData.object()->call( &arguments, coreObject.object() );
    }

JSWRAPPER_FUNCTION_END

// --- loadStyleImage, load a local (style) image, decompress it and call the callback with the newly created VG.Core.Image

JSWRAPPER_FUNCTION( loadStyleImage )

    static char path[1024];

    strcpy( path, vgDir.c_str() );//"/Users/markusm/Documents/VisualGraphics/vglib/ui/styles/" );
    strcat( path, "vglib/ui/styles/" );
    strcat( path, args.at( 0 ).toString().c_str() );
    strcat( path, "/icons/" );
    strcat( path, args.at( 1 ).toString().c_str() );

    VImage image;
    
    //printf( "%s\n", path );

    if (VImage::loadFromFile(path, image))
    {
        // --- Create a new image
        sprintf( path, "VG.Core.Image( %d, %d );", image.width, image.height );

        JSWrapperData imageData;
        g_jsWrapper->execute( path, &imageData );

        // --- Set the name
        imageData.object()->set( "name", args.at( 1 ) );

        // --- Set the stylePath
        imageData.object()->set( "stylePath", args.at( 0 ) );

        // --- Copy the image data
        JSWrapperData arrayData;
        imageData.object()->get( "data", &arrayData );

        if ( arrayData.object()->isTypedArray() ) 
        {
            unsigned int length; uint8_t *ptr;
            arrayData.object()->getAsUint8Array( &ptr, &length );

            JSWrapperData moduloData;
            imageData.object()->get( "modulo", &moduloData );
            unsigned int modulo=moduloData.toNumber();

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
        JSWrapperData imagePoolData;
        g_jsWrapper->execute( "VG.context.imagePool", &imagePoolData );

        JSWrapperData addImageData;
        imagePoolData.object()->get( "addImage", &addImageData );

        JSWrapperArguments args;
        args.append( imageData.object() );
        addImageData.object()->call( &args, imagePoolData.object() );

        image.free();            
    }

JSWRAPPER_FUNCTION_END

// --- decompressImageData, decompresses the given image data into the given image.

JSWRAPPER_FUNCTION( decompressImageData )

    //g_jsWrapper->gc();
    //g_jsWrapper->gc();

    // --- Arg 0 -> Base64 Data of Image
    std::string b64=args.at( 0 ).toString();
    const char *b64data=b64.c_str();
    // --- Arg 1 -> VG.Core.Image

    JSWrapperObject *imageObject=args.at( 1 ).object()->copy();

    VImage image;

    if ( strncmp( b64data, "data:image/jpeg;base64,", 23 ) == 0 )
    {
        //printf( "is jpeg\n" );

        std::string result=base64_decode( std::string( b64data + 23 ) );
        image.decompress( IMAGE_TYPE_JPG, (const unsigned char *) result.data(), result.length(), image );
    } else
    if ( strncmp( b64data, "data:image/png;base64,", 22 ) == 0 )
    {
        //printf( "is png\n" );

        std::string result=base64_decode( std::string( b64data+22 ) );
        image.decompress( IMAGE_TYPE_PNG, (const unsigned char *) result.data(), result.length(), image );
    } else {
        printf( "decompressImageData::Unknown Image Type!\n" );
        JSWRAPPER_FUNCTION_RETURN
    }

    JSWrapperData data; 

    // --- Set Image Width / Height
    data.setNumber( image.width );
    imageObject->set( "width", data );

    data.setNumber( image.height );
    imageObject->set( "height", data );

    // --- Tell the system that textures based on this image need an update
    data.setBoolean( true );
    imageObject->set( "needsUpdate", data );

    // --- Set the image data
    imageObject->set( "imageData", args.at(0) );

    // --- Allocate the image
    imageObject->get( "alloc", &data );
    data.object()->call( NULL, imageObject );

    // --- Copy the image data
    JSWrapperData arrayData;
    imageObject->get( "data", &arrayData );

    if ( arrayData.object()->isTypedArray() ) 
    {
        unsigned int length; uint8_t *ptr;
        arrayData.object()->getAsUint8Array( &ptr, &length );

        JSWrapperData moduloData;
        imageObject->get( "modulo", &moduloData );
        unsigned int modulo=moduloData.toNumber();

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

    delete imageObject;

JSWRAPPER_FUNCTION_END

// --- CompressIamge, compresses the given Image, PNG Only For Now

JSWRAPPER_FUNCTION( compressImage )

    JSWrapperObject *imageObject=args.at( 0 ).object()->copy();

    JSWrapperData widthData; imageObject->get( "width", &widthData );
    JSWrapperData heightData; imageObject->get( "height", &heightData );
    JSWrapperData realWidthData; imageObject->get( "realWidth", &realWidthData );
    JSWrapperData realHeightData; imageObject->get( "realHeight", &realHeightData );

    unsigned int width=widthData.toNumber(), height=heightData.toNumber(), realWidth=realWidthData.toNumber(), realHeight=realHeightData.toNumber();

    // --- Get the image data
    JSWrapperData arrayData;
    imageObject->get( "data", &arrayData );

    if ( arrayData.object()->isTypedArray() ) 
    {
        unsigned int length; uint8_t *ptr;
        arrayData.object()->getAsUint8Array( &ptr, &length );

        JSWrapperData moduloData;
        imageObject->get( "modulo", &moduloData );
        unsigned int modulo=moduloData.toNumber();
        unsigned int outSize;

        const unsigned char *bytes=compressPNG( ptr, width, height, realWidth, realHeight, modulo, &outSize );

        const char *base64_chars=( std::string("data:image/png;base64," ) + base64_encode( bytes, outSize )).c_str();

        JSWrapperData rc; rc.setString( base64_chars );
        JSWRAPPER_FUNCTION_SETRC( rc )

        delete bytes;
    }

    delete imageObject;

JSWRAPPER_FUNCTION_END

// --- OpenFileDialog, opens a local file through a dialog and sends the content and path to the provided Callback.

JSWRAPPER_FUNCTION( OpenFileDialog )

    int fileType=args.at( 0 ).toNumber();

#ifdef __APPLE__
    getKeyWindow();
#endif

    nfdchar_t *outPath = NULL;
    nfdresult_t result= NFD_OpenDialog( NULL, NULL, &outPath );

#ifdef __APPLE__
    setKeyWindow();
#endif

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

        if ( fileType == 0 )
        {
            // --- Image, returns a new VG.Core.Image Object

            char imageCmd[80];

            ImageType type=VImage::getTypeFromPath( outPath );

             if ( type == IMAGE_TYPE_INVALID ) {
                printf( "VG.OpenFileDialog::Unknown Image Type!\n" );
                delete chars;
                JSWRAPPER_FUNCTION_RETURN
            }

            VImage image;
            image.decompress( type, (const unsigned char *) chars, size, image );

            // --- Create a new image
            sprintf( imageCmd, "VG.Core.Image( %d, %d );", image.width, image.height );

            JSWrapperData imageData;
            g_jsWrapper->execute( imageCmd, &imageData );

            // --- Set the name
            //imageData.object()->set( "name", (std::string) outPath );

            // --- Copy the image data
            JSWrapperData arrayData;
            imageData.object()->get( "data", &arrayData );

            if ( arrayData.object()->isTypedArray() ) 
            {
                unsigned int length; uint8_t *ptr;
                arrayData.object()->getAsUint8Array( &ptr, &length );

                JSWrapperData moduloData;
                imageData.object()->get( "modulo", &moduloData );
                unsigned int modulo=moduloData.toNumber();

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

            // --- Set the imageData

            std::string base64=base64_encode( (const unsigned char *) chars, size );            

            if ( type == IMAGE_TYPE_PNG ) base64.insert( 0, std::string( "data:image/png;base64," ) );
            else
            if ( type == IMAGE_TYPE_JPG ) base64.insert( 0, std::string( "data:image/jpeg;base64," ) );

            JSWrapperData data; data.setString( base64 );
            imageData.object()->set( "imageData", data );

            // --- Call the Callback
            JSWrapperArguments arguments;
            arguments.append( (std::string) outPath );
            arguments.append( imageData.object() );

            args.at( 1 ).object()->call( &arguments, thisObject );              
        }
        else if ( fileType == 3 ) // Binary
        {
            std::string base64_chars=base64_encode( (const unsigned char *) chars, size );

            JSWrapperArguments arguments;
            arguments.append( (std::string) outPath );
            arguments.append( base64_chars );

            args.at( 1 ).object()->call( &arguments, thisObject );
        }
        else
        {
            JSWrapperArguments arguments;
            arguments.append( (std::string) outPath );
            arguments.append( (std::string) chars );

            args.at( 1 ).object()->call( &arguments, thisObject );
        }

        delete chars;
    }

JSWRAPPER_FUNCTION_END

// --- SaveFileDialog, saves a file locally using a native FileDialog.

JSWRAPPER_FUNCTION( SaveFileDialog )

    int fileType=args.at( 0 ).toNumber();

    std::string name=args.at( 1 ).toString();
    std::string data=args.at( 2 ).toString();

    nfdchar_t *outPath = NULL;
    nfdresult_t result = NFD_SaveDialog( NULL, name.c_str(), &outPath );

    if ( result == NFD_OKAY )
    {
        // --- Write the file

        if ( strncmp( data.c_str(), "data:image/png;base64,", strlen("data:image/png;base64,") ) == 0 )
        {
            size_t out;
            unsigned char *b64Data=base64_decode_bin( data.c_str() + 22, strlen( data.c_str() ) -22, &out );

            FILE* file = fopen( outPath, "wb");
            fwrite( b64Data, 1, out, file );
            fclose(file);
            free( b64Data );
        } else {
            FILE* file = fopen( outPath, "w");
            fprintf(file, "%s", data.c_str() );
            fclose(file);
        }
    }

    JSWrapperData rc; 

    if ( outPath ) rc.setString( std::string( outPath ) );
    else rc.setString( "" );

    JSWRAPPER_FUNCTION_SETRC( rc )    

JSWRAPPER_FUNCTION_END

// --- saveFile, saves a file locally using the provided path and content. Returns true on success, false otherwise.

JSWRAPPER_FUNCTION( saveFile )

    std::string path=args.at( 0 ).toString();
    std::string data=args.at( 1 ).toString();

    JSWrapperData rc;

    if ( strncmp( data.c_str(), "data:image/png;base64,", strlen("data:image/png;base64,") ) == 0 )
    {
        size_t out;
        unsigned char *b64Data=base64_decode_bin( data.c_str() + 22, strlen( data.c_str() ) -22, &out );

        FILE* file = fopen( path.c_str(), "wb");
        fwrite( b64Data, 1, out, file );
        fclose(file);
        free( b64Data );

        rc.setBoolean(true);
    } else
    {
        FILE* file = fopen( path.c_str(), "w");
        if ( file ) {
            fprintf(file, "%s", data.c_str() );
            fclose(file);
            rc.setBoolean(true);            
        } else rc.setBoolean(false);
    }

    JSWRAPPER_FUNCTION_SETRC( rc )    

JSWRAPPER_FUNCTION_END

// --- setWindowTitle

JSWRAPPER_FUNCTION( setWindowTitle )

    std::string title=args.at( 0 ).toString();
    std::string path=args.at( 1 ).toString();

#ifdef __APPLE__            
    setWindowTitle_cocoa( title.c_str(), path.c_str(), g_appName.c_str(), g_appVersion.c_str() );
#endif

JSWRAPPER_FUNCTION_END

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

JSWRAPPER_FUNCTION( getHostProperty )

    int property=args.at( 0 ).toNumber();
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
#else
            rc=1;//VG.HostProperty.OSMac;
#endif
        }
        break;
    }

    JSWrapperData data; data.setNumber( rc );
    JSWRAPPER_FUNCTION_SETRC( data )    

JSWRAPPER_FUNCTION_END

// --- setHostProperty

JSWRAPPER_FUNCTION( setHostProperty )

    int property=args.at( 0 ).toNumber();

    if ( property == 20 )    
    {
        int value=args.at( 1 ).toNumber();

#ifdef __APPLE__            
        setProjectChangedState_cocoa( value );
#endif        
    }

JSWRAPPER_FUNCTION_END

// --- sendBackendRequest, sends a JSON data package to the given url, calls the callback with the returned JSON.

JSWRAPPER_FUNCTION( sendBackendRequest )

    std::string url=args.at( 0 ).toString();
    std::string parameters=args.at( 1 ).toString();
    std::string type="POST";

    if ( args.count() >= 4 ) type=args.at( 3 ).toString();

    JSWrapperObject *callbackObject=args.at( 2 ).object()->copy();

    // ---

#ifdef __APPLE__
    sendBackendRequest_cocoa( url.c_str(), parameters.c_str(), type.c_str(), (void *) callbackObject );
#else
    printf( "sendBackendRequest not implemented!\n" );
#endif

JSWRAPPER_FUNCTION_END

void sendBackendRequest_finished( const char *result, void *callbackValuePtr )
{
    //printf( "sendBackendRequest_finished %s\n", result );

    JSWrapperObject *callbackObject=(JSWrapperObject *) callbackValuePtr;

    JSWrapperData contextData;
    g_jsWrapper->execute( "VG.context", &contextData );

    JSWrapperArguments arguments;
    arguments.append( std::string( result ) );

    callbackObject->call( &arguments, contextData.object() );

    delete callbackObject;
}

// --- setMouseCursor, sets the mouse cursor to the specified shape.

JSWRAPPER_FUNCTION( setMouseCursor )

    std::string cursor=args.at( 0 ).toString();

#ifdef __APPLE__
    setMouseCursor_cocoa( cursor.c_str() );
#else
    printf( "setMouseCursor not implemented!\n" );
#endif

JSWRAPPER_FUNCTION_END

// --- clipboardPasteDataForType, returns the Clipboard content for the given Type (right now only "Text" type is supported).

JSWRAPPER_FUNCTION( clipboardPasteDataForType )

    std::string type=args.at( 0 ).toString();
    const char *result = "";

#ifdef __APPLE__
    result=clipboardPasteDataForType_cocoa( type.c_str() );
#else
    printf( "clipboardPasteDataForType not implemented!\n" );
#endif

    JSWrapperData data; data.setString( std::string( result ) );
    JSWRAPPER_FUNCTION_SETRC( data )

JSWRAPPER_FUNCTION_END


// --- copyToClipboard, copies the data of the given type to the native Clipboard (right now only "Text" type is supported).

JSWRAPPER_FUNCTION( copyToClipboard )

    std::string type=args.at( 0 ).toString();
    std::string data=args.at( 1 ).toString();

#ifdef __APPLE__
    copyToClipboard_cocoa( type.c_str(), data.c_str() );
#else
    printf( "copyToClipboard not implemented!\n" );
#endif

JSWRAPPER_FUNCTION_END

// --- addNativeMenu

JSWRAPPER_FUNCTION( addNativeMenu )

    JSWrapperData menuData;
    args.at( 0 ).object()->get( "text", &menuData );

#ifdef __APPLE__
    addNativeMenu_cocoa( menuData.toString().c_str() );
#else
    printf( "addNativeMenu not implemented!\n" );
#endif

JSWRAPPER_FUNCTION_END

// --- addNativeMenuItem

JSWRAPPER_FUNCTION( addNativeMenuItem )

    JSWrapperData menuNameData;
    args.at( 0 ).object()->get( "text", &menuNameData );

    // --- VG.UI.MenuItem
    JSWrapperData menuItemIdData;
    args.at( 1 ).object()->get( "id", &menuItemIdData );
    int id=menuItemIdData.toNumber();

    JSWrapperData menuItemNameData;
    args.at( 1 ).object()->get( "text", &menuItemNameData );

    JSWrapperData menuItemDisabledData;
    args.at( 1 ).object()->get( "disabled", &menuItemDisabledData );

    JSWrapperData menuItemCheckedData;
    args.at( 1 ).object()->get( "checked", &menuItemCheckedData );    

    JSWrapperData menuItemShortcutData;
    args.at( 1 ).object()->get( "shortcut", &menuItemShortcutData );  

    std::string key="";
    int mod1=0, mod2=0;

    if ( menuItemShortcutData.type() == JSWrapperData::Object )
    {
        JSWrapperData keyData;
        menuItemShortcutData.object()->get( "key", &keyData );
        key=keyData.toString();

        JSWrapperData mod1Data;
        menuItemShortcutData.object()->get( "modifier", &mod1Data );
        mod1=mod1Data.toNumber();

        JSWrapperData mod2Data;
        menuItemShortcutData.object()->get( "modifierOptional", &mod2Data );
        mod2=mod2Data.toNumber();
    }

#ifdef __APPLE__
    addNativeMenuItem_cocoa( menuNameData.toString().c_str(), menuItemNameData.toString().c_str(), menuItemIdData.toNumber(), 
        menuItemDisabledData.toBoolean(), menuItemCheckedData.toBoolean(), key.c_str(), mod1, mod2 );
#else
    printf( "addNativeMenuItem not implemented!\n" );
#endif

JSWRAPPER_FUNCTION_END

// --- setNativeMenuItemState

JSWRAPPER_FUNCTION( setNativeMenuItemState )

#ifdef __APPLE__
    setNativeMenuItemState_cocoa( args.at(0).toNumber(), args.at(1).toNumber(), args.at(2).toNumber() );
#else
    printf( "addNativeMenuItem not implemented!\n" );
#endif

JSWRAPPER_FUNCTION_END

// --- hostProjectStarted

JSWRAPPER_FUNCTION( hostProjectStarted )

#ifdef __APPLE__
    hostProjectStarted_cocoa();
#endif

JSWRAPPER_FUNCTION_END

// --- hostProjectEnded

JSWRAPPER_FUNCTION( hostProjectEnded )

#ifdef __APPLE__
    hostProjectEnded_cocoa();
#endif

JSWRAPPER_FUNCTION_END

// --- hostUpdate, forces the host to redraw.

JSWRAPPER_FUNCTION( hostUpdate )

    g_redraw=true;

JSWRAPPER_FUNCTION_END

// --- resizeCanvas, resize the Workspace.

JSWRAPPER_FUNCTION( resizeCanvas )

    char cmdbuffer[80];        
    sprintf( cmdbuffer, "VG.context.workspace.resize( %d, %d );", g_width, g_height );
    g_jsWrapper->execute( cmdbuffer );    

JSWRAPPER_FUNCTION_END

// --- addNativeMenu

JSWRAPPER_FUNCTION( gotoUrl )

#ifdef __APPLE__
    gotoUrl_cocoa( args[0].toString().c_str() );
#else
    printf( "gotoUrl not implemented!\n" );
#endif

JSWRAPPER_FUNCTION_END

void registerVGFunctions( JSWrapper *jsWrapper )
{
    g_jsWrapper=jsWrapper;

    JSWrapperData vgData;
    jsWrapper->execute( "VG", &vgData );

    vgData.object()->registerFunction( "print", print );
    vgData.object()->registerFunction( "loadStyleSVG", loadStyleSVG );
    vgData.object()->registerFunction( "loadStyleImage", loadStyleImage );
    vgData.object()->registerFunction( "decompressImageData", decompressImageData );
    vgData.object()->registerFunction( "compressImage", compressImage );
    vgData.object()->registerFunction( "OpenFileDialog", OpenFileDialog );
    vgData.object()->registerFunction( "SaveFileDialog", SaveFileDialog );
    vgData.object()->registerFunction( "saveFile", saveFile );
    vgData.object()->registerFunction( "getHostProperty", getHostProperty );
    vgData.object()->registerFunction( "setHostProperty", setHostProperty );
    vgData.object()->registerFunction( "sendBackendRequest", sendBackendRequest );
    vgData.object()->registerFunction( "setMouseCursor", setMouseCursor );
    vgData.object()->registerFunction( "clipboardPasteDataForType", clipboardPasteDataForType );
    vgData.object()->registerFunction( "copyToClipboard", copyToClipboard );
    vgData.object()->registerFunction( "addNativeMenu", addNativeMenu );
    vgData.object()->registerFunction( "addNativeMenuItem", addNativeMenuItem );
    vgData.object()->registerFunction( "setNativeMenuItemState", setNativeMenuItemState );
    vgData.object()->registerFunction( "setWindowTitle", setWindowTitle );
    vgData.object()->registerFunction( "hostProjectStarted", hostProjectStarted );
    vgData.object()->registerFunction( "hostProjectEnded", hostProjectEnded );
    vgData.object()->registerFunction( "hostUpdate", hostUpdate );
    vgData.object()->registerFunction( "resizeCanvas", resizeCanvas );
    vgData.object()->registerFunction( "quit", quit );
    vgData.object()->registerFunction( "gotoUrl", gotoUrl );
}
