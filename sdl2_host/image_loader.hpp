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

#ifndef __VG_IMAGE_LOADER_INCLUDED
#define __VG_IMAGE_LOADER_INCLUDED

#include <stdint.h>
#include <assert.h>


/** The original type, aka compressed form */
enum ImageType
{
    IMAGE_TYPE_INVALID = 0,
    IMAGE_TYPE_PNG,
    IMAGE_TYPE_JPG
};


//TODO add color depth, is it available on web, higher than 8bits?
class VImage
{ 
public:

    uint32_t width;
    uint32_t height;

    ImageType type;

    /** if true then auto allocates the data */
    bool allocate;

    uint8_t* data;

    inline void alloc()
    {
        assert(data == nullptr);
        assert(width > 0 && height > 0);
        data = new uint8_t[4 * width * height];
    }

    inline VImage()
    {
        data = nullptr;
        allocate = true;
    }


    /** deletes the allocated data */
    inline void free()
    {
        assert(allocate == true);
        assert(data != nullptr);
        delete [] data;
        data = nullptr;
    }

    inline bool isLoaded()
    {
        return (data != nullptr && width > 0 && height > 0);
    }


    /** Loads an image into a 8bit RBBA format packed in 32bit elements */
    static bool loadFromFile(const char* path, VImage& out);

    static ImageType getTypeFromPath(const char* path);

    /** Takes a buffer with encoded data decompresses it into a VImage */
    static bool decompress(ImageType type, const uint8_t* data, uint32_t size, VImage& out); 

};



#endif
