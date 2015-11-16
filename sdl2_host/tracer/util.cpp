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

#include "util.h"
#include "../jshost.hpp"

using namespace embree;

static AffineSpace3f arrayToAffineSpace3f(float* m)
{
    //also converts to left handed cordinate system
    Vector3f vx(-m[0],  m[1],  m[2]);
    Vector3f vy( m[4],  m[5],  m[6]);
    Vector3f vz( m[8],  m[9], -m[10]);
    Vector3f vw(-m[12], m[13], m[14]);

    return AffineSpace3f(LinearSpace3f(vx, vy, vz), vw);
}

embree::AffineSpace3f readJSMatrix4( JSWrapperObject *nodeObject )
{
    JSWrapperData data, transFormFuncData, elementsData;
    nodeObject->get( "getTransform", &transFormFuncData );

    transFormFuncData.object()->call( NULL, nodeObject, &data );

    assert( data.isObject() );

    data.object()->get( "elements", &elementsData );

    uint32_t length = 0;
    float* pElements = nullptr;
    elementsData.object()->getAsFloat32Array( &pElements, &length );
    assert(length == 16);

    return arrayToAffineSpace3f( pElements );
}