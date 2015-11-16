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

#include <vector>

#include "common/math/vec4.h"
#include "common/math/vec3.h"
#include "lights/ambientlight.h"
#include "lights/pointlight.h"

#include "light.h"

#ifdef __OUTDATED

/// ambient light for Phong
AmbientLight::AmbientLight()
{
    color.r = 0.2;
    color.g = 0.2;
    color.b = 0.2;
}

void AmbientLight::readJSLight(JSContext* cx, JS::RootedObject& jsLight)
{
    RootedValue value(cx);
    
    // Ambient Intensity
    JS_GetProperty(cx, jsLight, "color", MutableHandleValue(&value));
    RootedObject jsValue(cx, &value.toObject());
    JS_GetProperty(cx, jsValue, "r", MutableHandleValue(&value));
    color.r = value.toNumber();
    JS_GetProperty(cx, jsValue, "g", MutableHandleValue(&value));
    color.g = value.toNumber();
    JS_GetProperty(cx, jsValue, "b", MutableHandleValue(&value));
    color.b = value.toNumber();
}

void AmbientLight::makeLights(std::vector<embree::Light*>& lights)
{
    embree::Light* light = nullptr;
    embree::Parms lightParms;

    lightParms.add("L", embree::Variant(color.r, color.g, color.b));
    light = new embree::AmbientLight(lightParms);
    lights.push_back(light);
}

/// normal light for Phong
NormalLight::NormalLight()
{
    ambientColor.r = 0;
    ambientColor.g = 0;
    ambientColor.b = 0;

    diffuseColor.r = 1;
    diffuseColor.g = 1;
    diffuseColor.b = 1;

    specularColor.r = 1;
    specularColor.g = 1;
    specularColor.b = 1;
    
    lightPosition.x = 0;
    lightPosition.y = 0;
    lightPosition.z = 1;
    lightPosition.w = 0;
    
    spotDirection.x = 0;
    spotDirection.y = 0;
    spotDirection.z = 0;
    
    spotExponent = 0;
    spotCutOff = -1; // setSpotCutOffDegree(180);

    attenuation0 = 1;
    attenuation1 = 0;
    attenuation2 = 0;
}

void NormalLight::readJSLight(JSContext* cx, JS::RootedObject& jsLight)
{
    RootedValue value(cx);

    {   // Ambient Intensity
        JS_GetProperty(cx, jsLight, "ambientColor", MutableHandleValue(&value));
        RootedObject jsValue(cx, &value.toObject());
        JS_GetProperty(cx, jsValue, "r", MutableHandleValue(&value));
        ambientColor.r = value.toNumber();
        JS_GetProperty(cx, jsValue, "g", MutableHandleValue(&value));
        ambientColor.g = value.toNumber();
        JS_GetProperty(cx, jsValue, "b", MutableHandleValue(&value));
        ambientColor.b = value.toNumber();
    }

    {   // Diffuse Intensity
        JS_GetProperty(cx, jsLight, "diffuseColor", MutableHandleValue(&value));
        RootedObject jsValue(cx, &value.toObject());
        JS_GetProperty(cx, jsValue, "r", MutableHandleValue(&value));
        diffuseColor.r = value.toNumber();
        JS_GetProperty(cx, jsValue, "g", MutableHandleValue(&value));
        diffuseColor.g = value.toNumber();
        JS_GetProperty(cx, jsValue, "b", MutableHandleValue(&value));
        diffuseColor.b = value.toNumber();
    }

    {   // Specular Intensity
        JS_GetProperty(cx, jsLight, "specularColor", MutableHandleValue(&value));
        RootedObject jsValue(cx, &value.toObject());
        JS_GetProperty(cx, jsValue, "r", MutableHandleValue(&value));
        specularColor.r = value.toNumber();
        JS_GetProperty(cx, jsValue, "g", MutableHandleValue(&value));
        specularColor.g = value.toNumber();
        JS_GetProperty(cx, jsValue, "b", MutableHandleValue(&value));
        specularColor.b = value.toNumber();
    }

    {   // Postion(w=1) or Direction(w=0) of light(x,y,z,w)
        JS_GetProperty(cx, jsLight, "lightPosition", MutableHandleValue(&value));
        RootedObject jsValue(cx, &value.toObject());
        JS_GetProperty(cx, jsValue, "x", MutableHandleValue(&value));
        lightPosition.x = value.toNumber();
        JS_GetProperty(cx, jsValue, "y", MutableHandleValue(&value));
        lightPosition.y = value.toNumber();
        JS_GetProperty(cx, jsValue, "z", MutableHandleValue(&value));
        lightPosition.z = value.toNumber();
        JS_GetProperty(cx, jsValue, "w", MutableHandleValue(&value));
        lightPosition.w = value.toNumber();
    }

    {   // Spot Direction
        JS_GetProperty(cx, jsLight, "spotDirection", MutableHandleValue(&value));
        RootedObject jsValue(cx, &value.toObject());
        JS_GetProperty(cx, jsValue, "x", MutableHandleValue(&value));
        spotDirection.x = value.toNumber();
        JS_GetProperty(cx, jsValue, "y", MutableHandleValue(&value));
        spotDirection.y = value.toNumber();
        JS_GetProperty(cx, jsValue, "z", MutableHandleValue(&value));
        spotDirection.z = value.toNumber();
    }
    
    JS_GetProperty(cx, jsLight, "spotExponent", MutableHandleValue(&value));
    spotExponent = value.toNumber();
    JS_GetProperty(cx, jsLight, "spotCutOff", MutableHandleValue(&value));
    spotCutOff = value.toNumber();

    JS_GetProperty(cx, jsLight, "attenuation0", MutableHandleValue(&value));
    attenuation0 = value.toNumber();
    JS_GetProperty(cx, jsLight, "attenuation1", MutableHandleValue(&value));
    attenuation1 = value.toNumber();
    JS_GetProperty(cx, jsLight, "attenuation2", MutableHandleValue(&value));
    attenuation2 = value.toNumber();
}

bool NormalLight::isPointLight()
{
    return lightPosition.w != 0 && spotCutOff <= 0;
}

void NormalLight::makeLights(std::vector<embree::Light*>& lights, embree::AffineSpace3f* mat)
{
    embree::Light* light = nullptr;
    embree::Parms lightParms;
    
    if (isPointLight())
    {
        float r, g, b;
        float baseColor = 30.f;

        // position
        if (mat == NULL)
        {
            lightParms.add("P", embree::Variant(lightPosition.x, lightPosition.y, lightPosition.z));
        }
        else
        {
            embree::Vec3fa pos = embree::xfmPoint(*mat, embree::Vec3fa(lightPosition.x, lightPosition.y, lightPosition.z));
            lightParms.add("P", embree::Variant(pos.x, pos.y, pos.z));
        }


        // diffuse
        r = diffuseColor.r * baseColor;
        g = diffuseColor.g * baseColor;
        b = diffuseColor.b * baseColor;
        lightParms.add("I", embree::Variant(r, g, b));
        light = new embree::PointLight(lightParms);
        lights.push_back(light);
        
        // specular
        r = specularColor.r * baseColor;
        g = specularColor.g * baseColor;
        b = specularColor.b * baseColor;
        lightParms.add("I", embree::Variant(r, g, b));
        light = new embree::PointLight(lightParms);
        lights.push_back(light);
    }
}

#endif

// Static field for mapping between field and string for standard output
std::map<MtlLight::Fields, std::string> MtlLight::mDataDebug;

MtlLight::MtlLight()
{
}

void MtlLight::readJSLight( JSWrapperObject *lightObject )
{
    // Temporary value holder
    JSWrapperData data;
    //RootedValue value(cx);
    
    //JS_GetProperty(cx, jsLight, "", MutableHandleValue(&value));
    //RootedObject lightObject(cx, &value.toObject());
    if (1)//!value.isNull())
    {        

#ifdef NOT_YET_PORTED_AS_UNUSED

        // Get position of light
        //JS_GetProperty(cx, jsLight, "position", MutableHandleValue(&value));
        /*
        RootedObject position(cx, &value.toObject());
        if (value.isObject())
        {
            // --- Light has Position, this is an VG.Math.Vector4, i.e. an object with x, y, z, w values

            float x=0, y=0, z=0, w=0;
            JS_GetProperty(cx, position, "x", MutableHandleValue(&value));
            x=value.toNumber();
            JS_GetProperty(cx, position, "y", MutableHandleValue(&value));
            y=value.toNumber();
            JS_GetProperty(cx, position, "z", MutableHandleValue(&value));
            z=value.toNumber();
            JS_GetProperty(cx, position, "w", MutableHandleValue(&value));
            w=value.toNumber();

            SetParam(Fields::POSITION, x, y, z, w );         
        }*/
        // Get color of light
        JS_GetProperty(cx, jsLight, "color", MutableHandleValue(&value));
        RootedObject color(cx, &value.toObject());
        if (value.isObject())
        {
            // --- Light has color

            // --- Ambient

            JS_GetProperty(cx, color, "ambient", MutableHandleValue(&value));
            RootedObject ambient(cx, &value.toObject());
            if (value.isObject())
            {
                float r, g, b, a;
                JS_GetProperty(cx, ambient, "r", MutableHandleValue(&value));
                r=value.toNumber();
                JS_GetProperty(cx, ambient, "g", MutableHandleValue(&value));
                g=value.toNumber();
                JS_GetProperty(cx, ambient, "b", MutableHandleValue(&value));
                b=value.toNumber();
                JS_GetProperty(cx, ambient, "a", MutableHandleValue(&value));
                a=value.toNumber();

                SetParam(Fields::AMBIENT_COLOR, r, g, b, a);                
            }

            // --- Diffuse

            JS_GetProperty(cx, color, "diffuse", MutableHandleValue(&value));
            RootedObject diffuse(cx, &value.toObject());
            if (value.isObject())
            {
                float r, g, b, a;
                JS_GetProperty(cx, diffuse, "r", MutableHandleValue(&value));
                r=value.toNumber();
                JS_GetProperty(cx, diffuse, "g", MutableHandleValue(&value));
                g=value.toNumber();
                JS_GetProperty(cx, diffuse, "b", MutableHandleValue(&value));
                b=value.toNumber();
                JS_GetProperty(cx, diffuse, "a", MutableHandleValue(&value));
                a=value.toNumber();

                SetParam(Fields::DIFFUSE_COLOR, r, g, b, a);                
            }     

            // --- Specular

            JS_GetProperty(cx, color, "specular", MutableHandleValue(&value));
            RootedObject specular(cx, &value.toObject());
            if (value.isObject())
            {
                float r, g, b, a;
                JS_GetProperty(cx, specular, "r", MutableHandleValue(&value));
                r=value.toNumber();
                JS_GetProperty(cx, specular, "g", MutableHandleValue(&value));
                g=value.toNumber();
                JS_GetProperty(cx, specular, "b", MutableHandleValue(&value));
                b=value.toNumber();
                JS_GetProperty(cx, specular, "a", MutableHandleValue(&value));
                a=value.toNumber();

                SetParam(Fields::SPECULAR_COLOR, r, g, b, a);                
            }                        
        }        

        // Get attenuation of light
        JS_GetProperty(cx, jsLight, "attenuation", MutableHandleValue(&value));
        RootedObject attenuation(cx, &value.toObject());
        if (value.isObject())
        {
            // --- Light has attenuation

            float constant=0, linear, quadratic;
            JS_GetProperty(cx, attenuation, "constant", MutableHandleValue(&value));
            constant=value.toNumber();
            JS_GetProperty(cx, attenuation, "linear", MutableHandleValue(&value));
            linear=value.toNumber();
            JS_GetProperty(cx, attenuation, "quadratic", MutableHandleValue(&value));
            quadratic=value.toNumber();

            SetParam(Fields::CONSTANT_ATT, constant );
            SetParam(Fields::LINEAR_ATT, linear );
            SetParam(Fields::QUADRATIC_ATT, quadratic );
        }

        // Get opt from light structure
        /*JS_GetProperty(cx, l0, "opt", MutableHandleValue(&value));
        RootedObject opt(cx, &value.toObject());
        
        JS_GetProperty(cx, opt, "color", MutableHandleValue(&value));
        RootedObject color(cx, &value.toObject());
        if (!value.isNull())
        {
            // Get ambient color of the material
            JS_GetProperty(cx, color, "diffuse", MutableHandleValue(&value));
            RootedObject diffuse(cx, &value.toObject());
            if (value.isObject())
            {
                uint n = 0;
                float tmp[4] = {0.0f, 0.0f, 0.0f, 1.0f};
                JS_GetArrayLength(cx, diffuse, &n);
                for (uint i = 0; i < n; i++)
                {        
                    JS_GetElement(cx, diffuse, i, MutableHandleValue(&value));
                    RootedObject arr(cx, &value.toObject());
                    if (!value.isNull())
                        tmp[i] = value.toNumber();
                }
                SetParam(Fields::DIFFUSE_COLOR, tmp[0], tmp[1], tmp[2], tmp[3]);
                printf("Diffuse Color = (%f, %f, %f)\n");
            }
        }  */      
#endif
    }
    
    debugOutput();
}


/**
 * Debug output of light into standard output
 */
void MtlLight::debugOutput()
{
    // Fill in static array (if not filled)
    if (mDataDebug.size() == 0)
    {
        mDataDebug[DIFFUSE_COLOR] = "Diffuse Color";
        mDataDebug[AMBIENT_COLOR] = "Ambient Color";
        mDataDebug[SPECULAR_COLOR] = "Specular Color";
        mDataDebug[CONSTANT_ATT] = "Constant Attenuation";
        mDataDebug[LINEAR_ATT] = "Linear Attenuation";
        mDataDebug[QUADRATIC_ATT] = "Quadratic Attenuation";
        mDataDebug[POSITION] = "Position";
        mDataDebug[SPOT_COS] = "Spot Cosine";
        mDataDebug[SPOT_EXP] = "Spot Exponent";
        mDataDebug[SPOT_DIR] = "Spot Direction";
        mDataDebug[NAME] = "Name";
    }
    
    // Print material fields (only set ones)
    printf("Light (Mtl):\n");
    for (std::map<Fields, Record*>::iterator it = mData.begin(); it != mData.end(); it++)
    {
        const Fields& id = it->first;
        const std::string& name = mDataDebug[id];
        
        Record* rec = it->second;
        switch(rec->GetType())
        {
        case Record::VALUE_INT:
            printf("\t%s: %d\n", name.c_str(), rec->GetValue<int>());
            break;
            
        case Record::VALUE_FLOAT:
            printf("\t%s: %f\n", name.c_str(), rec->GetValue<float>());
            break;
            
        case Record::VALUE_STRING:
            printf("\t%s: %s\n", name.c_str(), rec->GetValue<std::string>().c_str());
            break;
            
        case Record::VALUE_COLOR:
            {
                float* tmp = rec->GetPtr<float*>();
                printf("\t%s: [%f %f %f %f]\n", name.c_str(), tmp[0], tmp[1], tmp[2], tmp[3]);
            }
            break;
            
        default:
            break;
        }
    }
    printf("\n");
}

void MtlLight::makeLights(std::vector<embree::Light*>& lights)
{
    // --- Temporary solution

    for (std::map<Fields, Record*>::iterator it = mData.begin(); it != mData.end(); it++)
    {
        const Fields& id = it->first;
        const std::string& name = mDataDebug[id];
        
        Record* rec = it->second;
        switch(rec->GetType())
        {
        case Record::VALUE_INT:
            break;
            
        case Record::VALUE_FLOAT:
            break;
            
        case Record::VALUE_STRING:
            break;
            
        case Record::VALUE_COLOR:
            {
                float* tmp = rec->GetPtr<float*>();

                if ( !strcmp( name.c_str(), "Position" ) )
                {
                    // --- Temporary solution, just do a point light when light has position

                    embree::Light* light = nullptr;
                    embree::Parms lightParms;
                    //lightParms.add("P", embree::Variant(0.0f, 9.0f, 0.0f));
                    lightParms.add("P", embree::Variant(tmp[0], tmp[1], tmp[2]));
                    lightParms.add("I", embree::Variant(1.0f, 1.0f, 1.0f));
                    light = new embree::PointLight(lightParms);
                    lights.push_back(light);
                }
            }
            break;
            
        default:
            break;
        }
    }

    /*embree::Light* light = nullptr;
    embree::Parms lightParms;
    
    if (isPointLight())
    {
        float r, g, b;
        float baseColor = 30.f;

        // position
        if (mat == NULL)
        {
            lightParms.add("P", embree::Variant(lightPosition.x, lightPosition.y, lightPosition.z));
        }
        else
        {
            embree::Vec3fa pos = embree::xfmPoint(*mat, embree::Vec3fa(lightPosition.x, lightPosition.y, lightPosition.z));
            lightParms.add("P", embree::Variant(pos.x, pos.y, pos.z));
        }


        // diffuse
        r = diffuseColor.r * baseColor;
        g = diffuseColor.g * baseColor;
        b = diffuseColor.b * baseColor;
        lightParms.add("I", embree::Variant(r, g, b));
        light = new embree::PointLight(lightParms);
        lights.push_back(light);
        
        // specular
        r = specularColor.r * baseColor;
        g = specularColor.g * baseColor;
        b = specularColor.b * baseColor;
        lightParms.add("I", embree::Variant(r, g, b));
        light = new embree::PointLight(lightParms);
        lights.push_back(light);
    }*/
    /*
    embree::Light* light = nullptr;
    embree::Parms lightParms;
    lightParms.add("P", embree::Variant(0.0f, 9.0f, 0.0f));
    lightParms.add("I", embree::Variant(1.0f, 1.0f, 1.0f));
    light = new embree::PointLight(lightParms);
    lights.push_back(light);*/
}