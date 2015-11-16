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

#ifndef __VG_TRACER_MATERIAL_INCLUDED
#define __VG_TRACER_MATERIAL_INCLUDED

#include "jswrapper.hpp"

#ifdef __OUTDATED
// normal material for Phong lighting
class NormalMaterialInfo
{
    /** Emission Color
     * @member {VG.Core.Color}
     */
    embree::Color emissionColor;
    /** Ambient Color
     * @member {VG.Core.Color}
     */
    embree::Color ambientColor;
    /** Diffuse Color
     * @member {VG.Core.Color}
     */
    embree::Color diffuseColor;
    /** Specular Color
     * @member {VG.Core.Color}
     */
    embree::Color specularColor;
    /** Specular Shininess
     * @member {Number}
     */
    float specularShininess;
    
public:
    NormalMaterialInfo();
    void readJSMaterial(JSContext* cx, JS::RootedObject& jsMaterial);
    embree::Material* makeMaterial();
};

class NormalMaterial
{
    NormalMaterialInfo defaultMatInfo;
    std::vector<NormalMaterialInfo> subMatInfos;
public:
    void readJSMaterial(JSContext* cx, JS::RootedObject& jsMaterial);
    void makeMaterial(embree::Material*& defaultMaterial, std::vector<embree::Material*>& subMaterials);
};

#endif

/**
 * Mtl material class,  providing us bridge between MTL and BRDFs used during the 
 * rendering
 */
class MtlMaterial
{
private:
    /**
     * Supported fields in Mtl material
     * 
     * New material properties will add fields here
     */
    enum Fields
    {
        NAME = 0,		// Material name
        DIFFUSE_COLOR,		// Material diffuse color (4-component vector)
        AMBIENT_COLOR,		// Material ambient color (4-component vector)
        SPECULAR_COLOR,		// Material specular color (4-component vector)
        SHININESS,		// Material shininess (specular exponent)
        ILLUMINATION_MODE,	// Material illumination mode (unused)
        FIELDS_COUNT
    };
    
    /**
     * Record class stays for generic type-value
     * allowing to store either int, float, string or 
     * 4-component float inside the memory field.
     */
    class Record
    {
    public:
        // Value type
        enum Type
        {
            VALUE_INT = 0,
            VALUE_FLOAT,
            VALUE_STRING,
            VALUE_COLOR,
            TYPE_COUNT
        };
        
        private:
        void* mValue;		// Actual data (value)
        Type mType;		// Data type
        
        public:
        // Integer initializer
        Record(int i)
        {
            mType = VALUE_INT;
            mValue = new int(i);
        }
        
        // Float initializer
        Record(float f)
        {
            mType = VALUE_FLOAT;
            mValue = new float(f);
        }
        
        // String initializer
        Record(const std::string& s)
        {
            mType = VALUE_STRING;
            mValue = new std::string(s);
        }
        
        // 4-component float initializer
        Record(float r, float g, float b, float a)
        {
            mType = VALUE_COLOR;
            mValue = new float[4];
            ((float*)mValue)[0] = r;
            ((float*)mValue)[1] = g;
            ((float*)mValue)[2] = b;
            ((float*)mValue)[3] = a;
        }
        
        // Destructor (note it has to remove typed value)
        ~Record()
        {
            switch(mType)
            {
            case VALUE_INT:
            delete (int*)mValue;
            break;
            
            case VALUE_FLOAT:
            delete (int*)mValue;
            break;
            
            case VALUE_STRING:
            delete (std::string*)mValue;
            break;
            
            case VALUE_COLOR:
            delete[] (float*)mValue;
            break;
            
            default:
            break;
            }
        }
        
        // Get value of given type
        template <typename T>
        T GetValue()
        {
            return *(T*)mValue;
        }
        
        // Get pointer to value in given type
        template <typename T>
        T GetPtr()
        {
            return (T)mValue;
        }
        
        // Get value type
        Type GetType()
        {
            return mType;
        }
    };
    
    // Debug data maps our fields to strings used only in text output
    static std::map<Fields, std::string> mDataDebug;
    
    // Actual data are held here - maps material fields to generic record type
    std::map<Fields, Record*> mData;
    
    // Set new integer parameter
    void SetParam(Fields field, int value)
    {
        mData[field] = new Record(value);
    }
    
    // Set new float parameter
    void SetParam(Fields field, float value)
    {
        mData[field] = new Record(value);
    }
    
    // Set new string parameter
    void SetParam(Fields field, const std::string& value)
    {
        mData[field] = new Record(value);
    }
    
    // Set new 4-component vector parameter
    void SetParam(Fields field, float r, float g, float b, float a)
    {
        mData[field] = new Record(r, g, b, a);
    }
    
public:
    /**
     * Default constructor
     */
    MtlMaterial();
    
    /**
     * Initializes Mtl material from JS objects
     */
    void readJSMaterial( JSWrapperObject *material );
    
    /**
     * Debug output of material into standard output
     */
    void debugOutput();
    
    /**
     * Make embree material out of this
     * 
     * @todo This function will need to be replaced!
     */
    embree::Material* makeMaterial();
};


#endif