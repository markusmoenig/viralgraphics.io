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
