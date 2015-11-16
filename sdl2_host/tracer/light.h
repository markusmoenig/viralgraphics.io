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

#ifndef __VG_TRACER_LIGHT_INCLUDED
#define __VG_TRACER_LIGHT_INCLUDED


#include "jswrapper.hpp"

#ifdef __OUTDATED

// ambient light for Phong
class AmbientLight
{
    /** Ambient Intensity
     * @member {VG.Core.Color}
     */
    embree::Color color;

public:
    AmbientLight();
    void readJSLight(JSContext* cx, JS::RootedObject& jsLight);
    void makeLights(std::vector<embree::Light*>& lights);
};

// normal light for Phong
class NormalLight
{
    /** Ambient Intensity
     * @member {VG.Core.Color}
     */
    embree::Color ambientColor;
    /** Diffuse Intensity
     * @member {VG.Core.Color}
     */
    embree::Color diffuseColor;
    /** Specular Intensity
     * @member {VG.Core.Color}
     */
    embree::Color specularColor;
    /** Postion(w=1) or Direction(w=0) of light(x,y,z,w)
     * @member {VG.Math.Vector4} - default is the direction to local viewer.
     */
    embree::Vec4f lightPosition;
    /** Spot Direction
     * @member {VG.Math.Vector3}
     */
    embree::Vec3f spotDirection;
    /** Spot Exponent
     * @member {Number}
     */
    float spotExponent;
    /** Spot CutOff : cos(angle)
     * @member {Number}
     */
    float spotCutOff;
    /** Constant Attenuation
     * @member {Number}
     */
    float attenuation0;
    /** Linear Attenuation
     * @member {Number}
     */
    float attenuation1;
    /** Quadratic Attenuation
     * @member {Number}
     */
    float attenuation2;
    
public:
    NormalLight();
    void readJSLight(JSContext* cx, JS::RootedObject& jsLight);
    
    bool isPointLight();
    void makeLights(std::vector<embree::Light*>& lights, embree::AffineSpace3f* mat);
};

#endif

// Lights from Mtl definition
class MtlLight
{
private:
    /**
     * Supported fields for Mtl based light
     */
    enum Fields
    {
        AMBIENT_COLOR,
        DIFFUSE_COLOR,
        SPECULAR_COLOR,
        CONSTANT_ATT,
        LINEAR_ATT,
        QUADRATIC_ATT,
        POSITION,
        SPOT_COS,
        SPOT_EXP,
        SPOT_DIR,
        NAME,
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
        void* mValue;       // Actual data (value)
        Type mType;     // Data type
        
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
    MtlLight();
    
    /**
    * Debug output of light into standard output
    */
    void debugOutput();
    
    void readJSLight( JSWrapperObject * );
    void makeLights(std::vector<embree::Light*>& lights);
};

#endif