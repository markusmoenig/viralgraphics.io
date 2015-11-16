/*
 * Copyright (c) 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>.
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
#include "jswrapper.hpp"
 
#include "image_loader.hpp"

#include <stdio.h>  /* defines FILENAME_MAX */
#ifdef WIN32
    #include <direct.h>
    #define GetCurrentDir _getcwd
#else
    #include <unistd.h>
    #define GetCurrentDir getcwd
 #endif

// --- 

JSWRAPPER_FUNCTION( setCurrentDir )

    chdir( args.at( 0 ).toString().c_str() );

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( currentDir )

    char cCurrentPath[FILENAME_MAX];

    if (!GetCurrentDir(cCurrentPath, sizeof(cCurrentPath))) {
        JSWRAPPER_FUNCTION_RETURN
    }

    JSWrapperData rc;
    rc.setString( cCurrentPath );
    JSWRAPPER_FUNCTION_SETRC( rc )

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( read )

    // --- Read the file

    FILE* file = fopen( args.at(0).toString().c_str(), "rb");
    if ( !file ) {
        JSWRAPPER_FUNCTION_RETURN
    }

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

    // ---

    JSWrapperData rc; rc.setString( chars );
    JSWRAPPER_FUNCTION_SETRC( rc )

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( readImage )

    // --- Read the file

    FILE* file = fopen( args.at(0).toString().c_str(), "rb");
    if ( !file ) {
        JSWRAPPER_FUNCTION_RETURN     
    }

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

    // ---

    ImageType type=VImage::getTypeFromPath( args.at(0).toString().c_str() );

    // --- Set its data
    std::string base64=base64_encode( (const unsigned char *) chars, size );

    if ( type == IMAGE_TYPE_PNG ) base64.insert( 0, std::string( "data:image/png;base64," ) );
    else
    if ( type == IMAGE_TYPE_JPG ) base64.insert( 0, std::string( "data:image/jpeg;base64," ) );

    JSWrapperData rc; rc.setString( base64 );
    JSWRAPPER_FUNCTION_SETRC( rc )
 
    free( chars );

JSWRAPPER_FUNCTION_END

JSWRAPPER_FUNCTION( write )

    std::string path=args.at(0).toString();
    std::string data=args.at(1).toString();

    int rc=1;

    if ( strncmp( data.c_str(), "data:image/png;base64,", strlen("data:image/png;base64,") ) == 0 )
    {
        size_t out;
        unsigned char *b64Data=base64_decode_bin( data.c_str() + 22, data.length() - 22, &out );

        FILE* file = fopen( path.c_str(), "wb");
        fwrite( b64Data, 1, out, file );
        fclose(file);
        free( b64Data );

        rc=0;
    } else
    {
        FILE* file = fopen( path.c_str(), "w");
        if ( file ) {
            fprintf(file, "%s", data.c_str() );
            fclose(file);
        } else rc=0;
    }

    JSWrapperData rcData; rcData.setNumber( rc );
    JSWRAPPER_FUNCTION_SETRC( rcData )

JSWRAPPER_FUNCTION_END

void registerVGFileFunctions( JSWrapper *jsWrapper )
{
    JSWrapperData vgFileData;
    jsWrapper->execute( "VG.File", &vgFileData );

    vgFileData.object()->registerFunction( "currentDir", currentDir );
    vgFileData.object()->registerFunction( "setCurrentDir", setCurrentDir );
    vgFileData.object()->registerFunction( "read", read );
    vgFileData.object()->registerFunction( "readImage", readImage );
    vgFileData.object()->registerFunction( "write", write );
}

