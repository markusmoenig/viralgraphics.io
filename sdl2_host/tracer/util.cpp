/*
* (C) Copyright 2014, 2015 Markus Moenig Luis Jimenez <kuko@kvbits.com>.
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

#include "util.h"
#include <jsapi.h>
#include <jsfriendapi.h>
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

embree::AffineSpace3f readJSMatrix4(JSContext* cx, JS::RootedObject& jsNode)
{
    RootedValue tmpValue(cx);

    JS_CallFunctionName(cx, HandleObject(&jsNode), "getTransform", HandleValueArray::empty(), MutableHandleValue(&tmpValue));

    assert(tmpValue.isObject());

    RootedObject jsMatrix(cx, &tmpValue.toObject());

    JS_GetProperty(cx, HandleObject(jsMatrix), "elements", MutableHandleValue(&tmpValue));
    assert(JS_IsFloat32Array(&tmpValue.toObject()));

    uint32_t length = 0;
    float* pElements = nullptr;
    JS_GetObjectAsFloat32Array(&tmpValue.toObject(), &length, &pElements);

    assert(length == 16);

    return arrayToAffineSpace3f(pElements);
}