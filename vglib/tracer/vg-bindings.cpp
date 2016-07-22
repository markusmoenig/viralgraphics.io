/*
 * Copyright (c) 2014, 2015 Markus Moenig <markusm@visualgraphics.tv> and Contributors
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

#include <emscripten/bind.h>

 #include "vg-algebra.cpp"
 #include "vg-material.cpp"
 #include "vg-objects.cpp"
 #include "vg-tracer.cpp"

using namespace emscripten;

EMSCRIPTEN_BINDINGS(automatic_downcasting) {

    class_<VGVector3>("VGVector3")
    .constructor<double, double, double>()
    .constructor<>()
    .function("set", &VGVector3::set)
    ;

    value_array<VGTracerPixel>("VGTracerPixel")
    .element(&VGTracerPixel::r)
    .element(&VGTracerPixel::g)
    .element(&VGTracerPixel::b)
    .element(&VGTracerPixel::a)
    ;

    class_<VGTracerImage>("VGTracerImage")
    .constructor<int, int, int, uintptr_t>()
    ;    

    class_<VGTracerMaterial>("VGTracerMaterial")
    .constructor<>() 
    .function("setType", &VGTracerMaterial::setType)        
    .function("setColor", &VGTracerMaterial::setColor)        
    .function("setSpecularColor", &VGTracerMaterial::setSpecularColor)        
    .function("setEmissiveColor", &VGTracerMaterial::setEmissiveColor)        
    .function("setIOR", &VGTracerMaterial::setIOR)        
    .function("setSpecularExp", &VGTracerMaterial::setSpecularExp)        
    .function("isLight", &VGTracerMaterial::isLight)
    .function("setTexture", &VGTracerMaterial::setTexture, emscripten::allow_raw_pointers())        
    ;

    class_<VGTracerRay>("VGTracerRay")
    .constructor<VGVector3&, VGVector3&>()
    .constructor<>()    
    .function("setOrigin", &VGTracerRay::setOrigin)    
    .function("setDir", &VGTracerRay::setDir)    
    ;    

    value_array<VGTracerHit>("VGTracerHit")
    .element(&VGTracerHit::dist)
    ;     

    class_<VGTracerObject>("VGTracerObject")
    .constructor<>()
    // .function("intersect", &VGTracerObject::intersect)
    //.function("intersect", &VGTracerObject::intersect)    
    ;

    class_<VGTracerMeshObject>("VGTracerMeshObject")
    .constructor<uintptr_t, unsigned int>()
    .function("intersect", &VGTracerMeshObject::intersect)
    .function("getMaterial", &VGTracerMeshObject::setMaterial, emscripten::allow_raw_pointers())        
    .function("setMaterial", &VGTracerMeshObject::setMaterial, emscripten::allow_raw_pointers())        
    //.function("intersect", &VGTracerMeshObject::intersect )        
    //.property("material", &VGTracerMeshObject::getMaterial, &VGTracerMeshObject::setMaterial, emscripten::allow_raw_pointers())
    ;    

    class_<VGTracerSphereObject>("VGTracerSphereObject")
    .constructor<const VGVector3&, double>()
    .function("setMaterial", &VGTracerSphereObject::setMaterial, emscripten::allow_raw_pointers())            
    ;

    value_array<VGTracerInit>("VGTracerInit")
    .element(&VGTracerInit::width)
    .element(&VGTracerInit::height)
    .element(&VGTracerInit::realWidth)
    .element(&VGTracerInit::realHeight)
    .element(&VGTracerInit::maxDepth)
    .element(&VGTracerInit::fov)
    .element(&VGTracerInit::cameraX)
    .element(&VGTracerInit::cameraY)
    .element(&VGTracerInit::cameraZ)
    .element(&VGTracerInit::trans0)
    .element(&VGTracerInit::trans1)
    .element(&VGTracerInit::trans2)
    .element(&VGTracerInit::trans3)
    .element(&VGTracerInit::trans4)
    .element(&VGTracerInit::trans5)
    .element(&VGTracerInit::trans6)
    .element(&VGTracerInit::trans7)
    .element(&VGTracerInit::trans8)
    .element(&VGTracerInit::trans9)
    .element(&VGTracerInit::trans10)
    .element(&VGTracerInit::trans11)
    ;

    class_<VGTracer>("VGTracer")
    .constructor<>()
    .function("addMeshObject", &VGTracer::addMeshObject )//, emscripten::allow_raw_pointers())
    .function("addSphereObject", &VGTracer::addSphereObject )//, emscripten::allow_raw_pointers())
    .function("addLightObject", &VGTracer::addLightObject )//, emscripten::allow_raw_pointers())
    .function("init", &VGTracer::init, emscripten::allow_raw_pointers())
    .function("trace", &VGTracer::trace, emscripten::allow_raw_pointers())
    .function("start", &VGTracer::start, emscripten::allow_raw_pointers())
    .function("stop", &VGTracer::stop, emscripten::allow_raw_pointers())
    .function("numberOfCores", &VGTracer::numberOfCores)
    // .function("getHitMaterial", &VGTracer::getHitMaterial, emscripten::allow_raw_pointers())
    ;
}