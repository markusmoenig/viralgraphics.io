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
static bool decompressPNG(const uint8_t* data, uint32_t size, VImage& out)
{
    png_image img;
    memset(&img, 0, sizeof(png_image));

    img.version = PNG_IMAGE_VERSION;

    if (!png_image_begin_read_from_memory(&img, data, size))
    {
        return false;
    }

    out.width = img.width;
    out.height = img.height;


    if (out.allocate)
    {
        out.alloc();
    }

    assert(out.data != nullptr);

    img.format = PNG_FORMAT_RGBA;
    img.flags = PNG_FORMAT_FLAG_ALPHA | PNG_FORMAT_FLAG_COLOR;
    memset(out.data, 0, 4 * img.width * img.height);

    if (!png_image_finish_read(&img, NULL, out.data, 4 * img.width, NULL))
    {
        if (out.allocate && out.data) out.free();
        return false;
    }

    return true;
}



/** JPG */
static bool decompressJPG(const uint8_t* data, uint32_t size, VImage& out)
{
    struct jpeg_error_mgr jerr;
    jmp_buf setjmpbuff;

    jpeg_decompress_struct cinfo;

    JSAMPARRAY buffer;
    int rowStride;

    cinfo.err = jpeg_std_error(&jerr);

    if (setjmp(setjmpbuff))
    {
        if (out.allocate && out.data) out.free();
        jpeg_destroy_decompress(&cinfo);
        return false;
    }

    jpeg_create_decompress(&cinfo);

    jpeg_mem_src(&cinfo, (uint8_t*)data, size);

    jpeg_read_header(&cinfo, TRUE);


    jpeg_start_decompress(&cinfo);

    rowStride = cinfo.output_width * cinfo.output_components; 
    buffer = (*cinfo.mem->alloc_sarray)((j_common_ptr) &cinfo, JPOOL_IMAGE, rowStride, 1);

    out.width = cinfo.output_width;
    out.height = cinfo.output_height;

    if (out.allocate)
    {
        out.alloc();
    }

    assert(out.data != nullptr);





    while (cinfo.output_scanline < cinfo.output_height)
    {
        size_t y = cinfo.output_scanline;

        jpeg_read_scanlines(&cinfo, buffer, 1);

        uint8_t* dp = (uint8_t*)(out.data + y * (4 * out.width));
        uint8_t* sp = (uint8_t*)buffer[0];

        for (int w = 0; w < out.width; w++)
        {
            *dp++ = *(sp + 0);
            *dp++ = *(sp + 1);
            *dp++ = *(sp + 2);
            *dp++ = 255;

            sp += cinfo.output_components;
        }
    }


    jpeg_finish_decompress(&cinfo);
    jpeg_destroy_decompress(&cinfo);

    return true;
}


ImageType VImage::getTypeFromPath(const char* path)
{
    string pathStr = path;

    size_t dOffset = pathStr.find_last_of('.');

    if (dOffset != string::npos)
    {
        string ext = pathStr.substr(dOffset + 1, pathStr.size());

        if (ext == "png")
        {
            return IMAGE_TYPE_PNG;
        }
        else
        if (ext == "jpg" || ext == "jpge")
        {
            return IMAGE_TYPE_JPG;
        }
    }

    //invalid or not supported
    return IMAGE_TYPE_INVALID;
}

bool VImage::decompress(ImageType type, const uint8_t* data, uint32_t size, VImage& out)
{

    switch (type)
    {
    case IMAGE_TYPE_PNG: return decompressPNG(data, size, out); break;
    case IMAGE_TYPE_JPG: return decompressJPG(data, size, out); break;
    default:
        assert(false && "Image type has no decompress implementation");
        break;
    }
    
    return false;
}

bool VImage::loadFromFile(const char* path, VImage& out)
{
    out.type = getTypeFromPath(path);
    
    if (out.type == IMAGE_TYPE_INVALID)
    {
        return false;
    }

    std::ifstream file(path, std::ios::binary);

    if (!file.is_open()) return false;

    file.seekg(0, std::ios::end);
    std::streamsize size = file.tellg();

    file.seekg(0, std::ios::beg);

    std::vector<char> buffer(size);

    if (!file.read(buffer.data(), size))
    {
        return false;
    }

    return VImage::decompress(out.type, (uint8_t*)&buffer[0], (uint32_t)size, out);;
}



