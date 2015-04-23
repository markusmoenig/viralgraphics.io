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

#include <jsapi.h>
#include <inttypes.h>
#include "common/math/affinespace.h"

/** Reads a javascript matrix4x4 into an embree AffineSpace3f */
embree::AffineSpace3f readJSMatrix4(JSContext* cx, JS::RootedObject& jsNode);
