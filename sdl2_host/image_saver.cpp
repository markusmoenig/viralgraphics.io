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

#include "image_loader.hpp"
#include <string>
#include <cstring>

#include <png.h>
#include <jpeglib.h>
#include <jinclude.h>
#include <jerror.h>
#include <iostream>
#include <fstream>
#include <vector>

using std::string;

/** PNG */
unsigned char *compressPNG( unsigned char *ptr, unsigned int width, unsigned int height, unsigned int realWidth, unsigned int realHeight, unsigned int modulo, unsigned int *outSize )
{
    char temp[] = "/tmp/fileXXXXXX";
    int fd;

#ifndef WIN32
    fd=mkstemp( temp );
#endif

    FILE *fp = fopen(temp, "wb");
    if (!fp) printf("File %s could not be opened for writing\n", temp);

    //printf( "compressPNG:: input image %d, %d, %d, %d, %d\n", width, height, realWidth, realHeight, modulo );

    png_bytep *row_pointers = (png_bytep*) malloc(sizeof(png_bytep) * height);
    for ( int y=0; y<height; y++)
        row_pointers[y] = ptr + modulo * y;//(png_byte*) malloc( modulo );

    png_structp png_ptr = png_create_write_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);

    if (!png_ptr) printf("png_create_write_struct failed\n");
    
    png_infop info_ptr = png_create_info_struct(png_ptr);
    if (!info_ptr) printf("png_create_info_struct failed");

    png_init_io(png_ptr, fp);

    png_set_IHDR(png_ptr, info_ptr, width, height, 8, PNG_COLOR_TYPE_RGBA, PNG_INTERLACE_NONE, PNG_COMPRESSION_TYPE_BASE, PNG_FILTER_TYPE_BASE);
    png_write_info(png_ptr, info_ptr);

    png_write_image(png_ptr, row_pointers);
    png_write_end(png_ptr, NULL);

    free(row_pointers);
    fclose(fp);

    FILE* file = fopen( temp, "rb");

    fseek(file, 0, SEEK_END);
    int size = ftell(file);
    rewind(file);

    unsigned char* chars = (unsigned char *) new char[size + 1];
    chars[size] = '\0';
    for (int i = 0; i < size;) 
    {
        int read = static_cast<int>(fread(&chars[i], 1, size - i, file));
        i += read;
    }
    fclose(file);

    *outSize=size;

    return chars;
}
