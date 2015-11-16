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

#include "api/parms.h"
#include "materials/obj.h"
#include "materials/vgmat.h"

#include "material.h"

#ifdef __OUTDATED

/// Normal Material Info
NormalMaterialInfo::NormalMaterialInfo()
{
    emissionColor.r = 0;
    emissionColor.g = 0;
    emissionColor.b = 0;

    ambientColor.r = 0.2;
    ambientColor.g = 0.2;
    ambientColor.b = 0.2;

    diffuseColor.r = 0.8;
    diffuseColor.g = 0.8;
    diffuseColor.b = 0.8;

    specularColor.r = 0;
    specularColor.g = 0;
    specularColor.b = 0;

    specularShininess = 0;
}

void NormalMaterialInfo::readJSMaterial(JSContext* cx, JS::RootedObject& jsMaterial)
{
    RootedValue value(cx);

    {   // Emission
        JS_GetProperty(cx, jsMaterial, "emissionColor", MutableHandleValue(&value));
        RootedObject jsValue(cx, &value.toObject());
        JS_GetProperty(cx, jsValue, "r", MutableHandleValue(&value));
        emissionColor.r = value.toNumber();
        JS_GetProperty(cx, jsValue, "g", MutableHandleValue(&value));
        emissionColor.g = value.toNumber();
        JS_GetProperty(cx, jsValue, "b", MutableHandleValue(&value));
        emissionColor.b = value.toNumber();
    }
    
    {   // Ambient
        JS_GetProperty(cx, jsMaterial, "ambientColor", MutableHandleValue(&value));
        RootedObject jsValue(cx, &value.toObject());
        JS_GetProperty(cx, jsValue, "r", MutableHandleValue(&value));
        ambientColor.r = value.toNumber();
        JS_GetProperty(cx, jsValue, "g", MutableHandleValue(&value));
        ambientColor.g = value.toNumber();
        JS_GetProperty(cx, jsValue, "b", MutableHandleValue(&value));
        ambientColor.b = value.toNumber();
    }

    {   // Diffuse
        JS_GetProperty(cx, jsMaterial, "diffuseColor", MutableHandleValue(&value));
        RootedObject jsValue(cx, &value.toObject());
        JS_GetProperty(cx, jsValue, "r", MutableHandleValue(&value));
        diffuseColor.r = value.toNumber();
        JS_GetProperty(cx, jsValue, "g", MutableHandleValue(&value));
        diffuseColor.g = value.toNumber();
        JS_GetProperty(cx, jsValue, "b", MutableHandleValue(&value));
        diffuseColor.b = value.toNumber();
    }

    {   // Specular
        JS_GetProperty(cx, jsMaterial, "specularColor", MutableHandleValue(&value));
        RootedObject jsValue(cx, &value.toObject());
        JS_GetProperty(cx, jsValue, "r", MutableHandleValue(&value));
        specularColor.r = value.toNumber();
        JS_GetProperty(cx, jsValue, "g", MutableHandleValue(&value));
        specularColor.g = value.toNumber();
        JS_GetProperty(cx, jsValue, "b", MutableHandleValue(&value));
        specularColor.b = value.toNumber();
    }

    JS_GetProperty(cx, jsMaterial, "spotExponent", MutableHandleValue(&value));
    specularShininess = value.toNumber();
}

embree::Material* NormalMaterialInfo::makeMaterial()
{
    embree::Parms parms;
    float r, g, b;

    // diffuse
    r = diffuseColor.r;
    g = diffuseColor.g;
    b = diffuseColor.b;
    
    if (r==0 && g==0 && b==0)
    {   // ambient
        r = ambientColor.r;
        g = ambientColor.g;
        b = ambientColor.b;
    }
    
    if (r==0 && g==0 && b==0)
    {   // emission
        r = emissionColor.r;
        g = emissionColor.g;
        b = emissionColor.b;
    }
    
    parms.add("Kd", embree::Variant(r, g, b));
    
    // specular
    r = specularColor.r;
    g = specularColor.g;
    b = specularColor.b;

    parms.add("Ks", embree::Variant(r, g, b));
    
    // specular shininess
    parms.add("Ns", embree::Variant(specularShininess));

    // embree material
    return new embree::Obj(parms);
}

/// Normal Material
void NormalMaterial::readJSMaterial(JSContext* cx, JS::RootedObject& jsMaterial)
{
    RootedValue value(cx);
    NormalMaterialInfo info;

    // default material
    JS_GetProperty(cx, jsMaterial, "defaultMaterial", MutableHandleValue(&value));
    RootedObject jsDefault(cx, &value.toObject());
    defaultMatInfo.readJSMaterial(cx, jsDefault);
    
    // sub materials
    JS_GetProperty(cx, jsMaterial, "subMaterials", MutableHandleValue(&value));
    RootedObject jsSubs(cx, &value.toObject());
    unsigned int n = 0;
    JS_GetArrayLength(cx, jsSubs, &n);
    for (unsigned int i = 0; i < n; i++) {
        JS_GetElement(cx, jsSubs, i, MutableHandleValue(&value));
        RootedObject jsInfo(cx, &value.toObject());
        
        subMatInfos.push_back(NormalMaterialInfo());
        NormalMaterialInfo& info = subMatInfos[i];
        info.readJSMaterial(cx, jsInfo);
    }
}

void NormalMaterial::makeMaterial(embree::Material*& defaultMaterial, std::vector<embree::Material*>& subMaterials)
{
    defaultMaterial = defaultMatInfo.makeMaterial();
    for (int i = 0; i < subMatInfos.size(); i++) {
        subMaterials.push_back(subMatInfos[i].makeMaterial());
    }
}

#endif

// Static field for mapping between field and string for standard output
std::map<MtlMaterial::Fields, std::string> MtlMaterial::mDataDebug;

/**
 * Default constructor
 */
MtlMaterial::MtlMaterial()
{
}

/**
 * Initializes Mtl material from JS objects
 */
void MtlMaterial::readJSMaterial( JSWrapperObject *material )
{
    JSWrapperData optData, objData, data;

    material->get( "opt", &optData );
    
    // Get name of the material
    optData.object()->get( "name", &data );
    if ( data.isString() ) SetParam( Fields::NAME, data.toString() );

    // Get illumination mode of the material
    optData.object()->get( "illum", &data );
    if ( data.isNumber() ) SetParam(Fields::ILLUMINATION_MODE, (int) data.toNumber() );
    
    // Get ambient color of the material
    optData.object()->get( "Ka", &objData );
    if ( objData.isObject() ) {
        unsigned int n = 0;
        float tmp[4] = {0.0f, 0.0f, 0.0f, 1.0f};
        objData.object()->getArrayLength( &n );
        for (unsigned int i = 0; i < n; i++) {        
            objData.object()->getArrayElement( i, &data );
            if ( data.isNumber() ) tmp[i] = data.toNumber();
        }
        SetParam(Fields::AMBIENT_COLOR, tmp[0], tmp[1], tmp[2], tmp[3]);
    }

    // Get diffuse color of the material
    optData.object()->get( "Kd", &objData );
    if ( objData.isObject() ) {
        unsigned int n = 0;
        float tmp[4] = {0.0f, 0.0f, 0.0f, 1.0f};
        objData.object()->getArrayLength( &n );
        for (unsigned int i = 0; i < n; i++) {        
            objData.object()->getArrayElement( i, &data );
            if ( data.isNumber() ) tmp[i] = data.toNumber();
        }
        SetParam(Fields::DIFFUSE_COLOR, tmp[0], tmp[1], tmp[2], tmp[3]);
    }    

    // Get specular color of the material
    optData.object()->get( "Ks", &objData );
    if ( objData.isObject() ) {
        unsigned int n = 0;
        float tmp[4] = {0.0f, 0.0f, 0.0f, 1.0f};
        objData.object()->getArrayLength( &n );
        for (unsigned int i = 0; i < n; i++) {        
            objData.object()->getArrayElement( i, &data );
            if ( data.isNumber() ) tmp[i] = data.toNumber();
        }
        SetParam(Fields::SPECULAR_COLOR, tmp[0], tmp[1], tmp[2], tmp[3]);
    }
    
    // Get the shininess of the material
    optData.object()->get( "Ns", &data );
    if ( data.isNumber() ) SetParam(Fields::SHININESS, (float) data.toNumber() );
    
    debugOutput();
}

/**
 * Debug output of material into standard output
 */
void MtlMaterial::debugOutput()
{
    // Fill in static array (if not filled)
    if (mDataDebug.size() == 0)
    {
        mDataDebug[DIFFUSE_COLOR] = "Diffuse Color";
        mDataDebug[AMBIENT_COLOR] = "Ambient Color";
        mDataDebug[SPECULAR_COLOR] = "Specular Color";
        mDataDebug[SHININESS] = "Shininess";
        mDataDebug[ILLUMINATION_MODE] = "Illumination";
        mDataDebug[NAME] = "Name";
    }
    
    // Print material fields (only set ones)
    printf("Material (Mtl):\n");
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

/**
 * Make embree material out of this
 * 
 * @todo This function will need to be replaced!
 */
embree::Material* MtlMaterial::makeMaterial()
{
    // Build embree parameters that can be used to instatiation of embree material
    embree::Parms parms;
    
    // Diffuse
    std::map<Fields, Record*>::iterator diffuse = mData.find(DIFFUSE_COLOR);
    if (diffuse != mData.end())
    {
        float* tmp = diffuse->second->GetPtr<float*>();
        parms.add("DIFFUSE_COLOR", embree::Variant(tmp[0], tmp[1], tmp[2]));
    }
    else
    {
        parms.add("DIFFUSE_COLOR", embree::Variant(0, 0, 0));
    }
    
    // Specular
    std::map<Fields, Record*>::iterator specular = mData.find(SPECULAR_COLOR);
    if (specular != mData.end())
    {
        float* tmp = specular->second->GetPtr<float*>();
        parms.add("SPECULAR_COLOR", embree::Variant(tmp[0], tmp[1], tmp[2]));
    }
    else
    {
        parms.add("SPECULAR_COLOR", embree::Variant(0, 0, 0));
    }
    
    // Shininess
    std::map<Fields, Record*>::iterator shininess = mData.find(SHININESS);
    if (shininess != mData.end())
    {
        parms.add("SHININESS", embree::Variant(shininess->second->GetValue<float>()));
    }
    else
    {
        parms.add("SHININESS", embree::Variant(1));
    }
    
    // Shininess
    std::map<Fields, Record*>::iterator illumMode = mData.find(ILLUMINATION_MODE);
    if (illumMode != mData.end())
    {
        parms.add("ILLUMINATION_MODE", embree::Variant(illumMode->second->GetValue<int>()));
    }
    else
    {
        parms.add("ILLUMINATION_MODE", embree::Variant(0));
    }
    
    return new embree::VGMaterial(parms);
}