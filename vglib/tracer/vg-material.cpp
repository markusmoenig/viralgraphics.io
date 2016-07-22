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

 // #include <emscripten/bind.h>

// using namespace emscripten;

#ifndef VG_TRACERMATERIAL_CPP
#define VG_TRACERMATERIAL_CPP

#include "vg-algebra.cpp"

enum {ALPHA=3};

class VGColor : public VGVector3 
{
public:

    // --- Constructors

    VGColor()
    {
        n[RED]=0; n[GREEN]=0; n[BLUE]=0; n[ALPHA]=1;
    }

    VGColor( const double r, const double g, const double b )
    {
        n[RED]=r; n[GREEN]=g; n[BLUE]=b; n[ALPHA]=1;
    }    

    inline VGColor(const VGColor& v)
    : VGVector3(v) {}

    inline VGColor& operator = (const VGColor& col) { 
        for ( int i=0; i <= ALPHA; ++i ) n[i]=col.n[i]; return *this; 
    }

    inline VGColor& operator += ( const VGColor& col ) {
        for ( int i=0; i <= ALPHA; ++i ) n[i]+=col.n[i]; return *this; 
    }

    inline VGColor& operator += ( double c ) {
        for ( int i=0; i <= ALPHA; ++i ) n[i]+=c; return *this; 
    }

    // FRIENDS

    friend inline VGColor operator * (const VGColor& a, const VGColor& b) {
        return VGColor(a.n[VX]*b.n[VX], a.n[VY]*b.n[VY], a.n[VZ]*b.n[VZ]);
    }

    friend inline VGColor operator - (const VGColor& a)
    {  return VGColor(-a.n[VX],-a.n[VY],-a.n[VZ]); }

    friend inline VGColor operator + (const VGColor& a, const VGColor& b)
    { return VGColor(a.n[VX]+ b.n[VX], a.n[VY] + b.n[VY], a.n[VZ] + b.n[VZ]); }

    friend inline VGColor operator - (const VGColor& a, const VGColor& b)
    { return VGColor(a.n[VX]-b.n[VX], a.n[VY]-b.n[VY], a.n[VZ]-b.n[VZ]); }

    friend inline VGColor operator * (const VGColor& a, const double d)
    { return VGColor(d*a.n[VX], d*a.n[VY], d*a.n[VZ]); }

    friend inline VGColor operator * (const double d, const VGColor& a)
    { return a*d; }

    friend inline VGColor operator / (const VGColor& a, const double d)
    { double d_inv = 1.0/d; return VGColor(a.n[VX]*d_inv, a.n[VY]*d_inv, a.n[VZ]*d_inv); }

    friend inline VGColor operator / (const VGColor& a, const VGColor& b)
    { return VGColor(a.n[VX] / b.n[VX], a.n[VY] / b.n[VY], a.n[VZ] / b.n[VZ]); }

    friend inline int operator == (const VGColor& a, const VGColor& b)
    { return (a.n[VX] == b.n[VX]) && (a.n[VY] == b.n[VY]) && (a.n[VZ] == b.n[VZ]); }

    friend inline int operator != (const VGColor& a, const VGColor& b)
    { return !(a == b); }

    // inline double& operator [] ( int i) {
        // return n[i];
    // }

    // ---

    VGColor& clamp() {

        n[VX] = MIN(1.0, n[VX]);
        n[VY] = MIN(1.0, n[VY]);
        n[VZ] = MIN(1.0, n[VZ]);

        n[VX] = MAX(0.0, n[VX]);
        n[VY] = MAX(0.0, n[VY]);
        n[VZ] = MAX(0.0, n[VZ]);

        return *this;
    }

    VGColor& normalize()
    {
        double maxcomp = MAX(n[0], MAX(n[1], n[2]));
        n[0] /= maxcomp;
        n[1] /= maxcomp;
        n[2] /= maxcomp;

        return *this;
    }

    void set( const double r, const double g, const double b ) 
    {
        n[RED]=r; n[GREEN]=g; n[BLUE]=b; n[ALPHA]=1;
    }
};

struct VGTracerPixel {
    double r;
    double g;
    double b;
    double a;
};

struct VGTracerSampleOut {
    int x, y;
    double r;
    double g;
    double b;
    double a;
};

class VGTracerImage
{
public:
    VGTracerImage( int width, int height, int modulo, uintptr_t bufAddr ) : width( width ), height( height ), modulo( modulo )
    { 
        data=reinterpret_cast<unsigned char*>(bufAddr);
    } 

    int width, height, modulo;
    unsigned char *data;
};

class VGTracerMaterial
{
public:

    enum Type { Diffuse, Glossy, Mirror, Dielectric, Emissive };

    // CONSTRUCTORS

    VGTracerMaterial()
    {
        type=Diffuse;

        kS=VGColor( 1, 1, 1 );
        pExp=8;
        indexOfRefraction=1.0;
        texture=NULL; ownsTexture=true;
    }

    VGTracerMaterial( const VGTracerMaterial& m )
    {
        type=m.type;
        kD=m.kD; kS=m.kS; kE=m.kE;
        pExp=m.pExp;
        indexOfRefraction=m.indexOfRefraction;
        texture=m.texture;
        ownsTexture=false;
    }

    ~VGTracerMaterial()
    {
        if ( texture && ownsTexture )
            delete texture;
    }

    void setType( int t ) {
        type=(Type) t;
    }    

    void setTexture( VGTracerImage *image ) {
        texture=image;
    }    

    void setColor( const double r, const double g, const double b ) {
        kD.set( r, g, b );
    }

    void setSpecularColor( const double r, const double g, const double b ) {
        kS.set( r, g, b );
    }    

    void setEmissiveColor( const double r, const double g, const double b ) {
        kE.set( r, g, b );
        type=Emissive;
    }    

    void setSpecularExp( double value ) {
        pExp=value;
    }    

    void setIOR( double index ) {
        indexOfRefraction=index;
    }    

    bool isLight( void ) {
        return type == Emissive;
    }      

    Type                               type;

    VGColor                            kD, kS, kE;

    double                             pExp;
    double                             indexOfRefraction;

    VGTracerImage                     *texture;
    bool                               ownsTexture;
};

#endif