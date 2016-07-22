/****************************************************************
*																*
* C++ Vector and Matrix Algebra routines						*
* Author: Jean-Francois DOUE									*
* Version 3.1 --- October 1993									*
*																*
****************************************************************/
//
//	From "Graphics Gems IV / Edited by Paul S. Heckbert
//	Academic Press, 1994, ISBN 0-12-336156-9
//	"You are free to use and modify this code in any way
//	you like." (p. xv)
//
//	Modified by J. Nagle, March 1997
//	-	All functions are inline.
//	-	All functions are const-correct.
//	-	All checking is via the standard "assert" macro.
//	-	Stream I/O is disabled for portability, but can be
//		re-enabled by defining ALGEBRA3IOSTREAMS.
//
#ifndef ALGEBRA3H
#define ALGEBRA3H

#include <stdlib.h>
#include <assert.h>
#include <math.h>

// this line defines a new type: pointer to a function which returns a
// double and takes as argument a double
typedef double (*V_FCT_PTR)(double);

// min-max macros
#define MIN(A,B) ((A) < (B) ? (A) : (B))
#define MAX(A,B) ((A) > (B) ? (A) : (B))

#undef min					// allow as function names
#undef max

#define ALGEBRA3IOSTREAMS
#include <iostream>
using namespace std;

// error handling macro
#define ALGEBRA_ERROR(E) { assert(false); }

class VGVector2;
class VGVector3;
class VGVector4;
class VGMatrix3;
class VGMatrix4;

enum {VX, VY, VZ, VW};		    // axes
enum {PA, PB, PC, PD};		    // planes
enum {RED, GREEN, BLUE};	    // colors
enum {KA, KD, KS, ES};		    // phong coefficients
//
//	PI
//

#ifdef VISUAL_STUDIO
const double M_PI = (double) 3.14159265358979323846;		// per CRC handbook, 14th. ed.
const double M_PI_2 = (M_PI/2.0);				// PI/2
#endif
const double M2_PI = (M_PI*2.0);				// PI*2

/****************************************************************
*																*
*			    2D Vector										*
*																*
****************************************************************/

class VGVector2
{
protected:

 double n[2];

public:

// Constructors

VGVector2();
VGVector2(const double x, const double y);
VGVector2(const double d);
VGVector2(const VGVector2& v);				// copy constructor
VGVector2(const VGVector3& v);				// cast v3 to v2
VGVector2(const VGVector3& v, int dropAxis);	// cast v3 to v2

// Assignment operators

VGVector2& operator	= ( const VGVector2& v );	// assignment of a VGVector2
VGVector2& operator += ( const VGVector2& v );	// incrementation by a VGVector2
VGVector2& operator -= ( const VGVector2& v );	// decrementation by a VGVector2
VGVector2& operator *= ( const double d );	// multiplication by a constant
VGVector2& operator /= ( const double d );	// division by a constant
double& operator [] ( int i);			// indexing
double operator [] ( int i) const;// read-only indexing

// special functions

double length() const;			// length of a VGVector2
double length2() const;			// squared length of a VGVector2
VGVector2& normalize() ;				// normalize a VGVector2 in place
VGVector2& apply(V_FCT_PTR fct);		// apply a func. to each component

// friends

friend VGVector2 operator - (const VGVector2& v);						// -v1
friend VGVector2 operator + (const VGVector2& a, const VGVector2& b);	    // v1 + v2
friend VGVector2 operator - (const VGVector2& a, const VGVector2& b);	    // v1 - v2
friend VGVector2 operator * (const VGVector2& a, const double d);	    // v1 * 3.0
friend VGVector2 operator * (const double d, const VGVector2& a);	    // 3.0 * v1
friend VGVector2 operator * (const VGMatrix3& a, const VGVector2& v);	    // M . v
friend VGVector2 operator * (const VGVector2& v, const VGMatrix3& a);		// v . M
friend double operator * (const VGVector2& a, const VGVector2& b);    // dot product
friend VGVector2 operator / (const VGVector2& a, const double d);	    // v1 / 3.0
friend VGVector3 operator ^ (const VGVector2& a, const VGVector2& b);	    // cross product
friend int operator == (const VGVector2& a, const VGVector2& b);	    // v1 == v2 ?
friend int operator != (const VGVector2& a, const VGVector2& b);	    // v1 != v2 ?

#ifdef ALGEBRA3IOSTREAMS
friend ostream& operator << (ostream& s, const VGVector2& v);	// output to stream
friend istream& operator >> (istream& s, VGVector2& v);	    // input from strm.
#endif // ALGEBRA3IOSTREAMS

friend void swap(VGVector2& a, VGVector2& b);						// swap v1 & v2
friend VGVector2 min(const VGVector2& a, const VGVector2& b);		    // min(v1, v2)
friend VGVector2 max(const VGVector2& a, const VGVector2& b);		    // max(v1, v2)
friend VGVector2 prod(const VGVector2& a, const VGVector2& b);		    // term by term *

// necessary friend declarations

friend class VGVector3;
};

/****************************************************************
*																*
*			    3D Vector										*
*																*
****************************************************************/

class VGVector3
{
protected:

 double n[4];

public:

// Constructors

VGVector3();
VGVector3(const double x, const double y, const double z);
VGVector3(const double d);
VGVector3(const VGVector3& v);					// copy constructor
VGVector3(const VGVector2& v);					// cast v2 to v3
VGVector3(const VGVector2& v, double d);		    // cast v2 to v3
VGVector3(const VGVector4& v);					// cast v4 to v3
VGVector3(const VGVector4& v, int dropAxis);	    // cast v4 to v3

    // JS BRIDGE

    void set( double x, double y, double z ) { n[VX]=x; n[VY]=y; n[VZ]=z; }

    // UTILS

    void min( const VGVector3& v ) {
        if ( n[VX] > v.n[VX] ) n[VX] = v.n[VX];
        if ( n[VY] > v.n[VY] ) n[VY] = v.n[VY];
        if ( n[VZ] > v.n[VZ] ) n[VZ] = v.n[VZ];    
    }

    void max( const VGVector3& v ) {
        if ( n[VX] < v.n[VX] ) n[VX] = v.n[VX];
        if ( n[VY] < v.n[VY] ) n[VY] = v.n[VY];
        if ( n[VZ] < v.n[VZ] ) n[VZ] = v.n[VZ];    
    }  

// Assignment operators

VGVector3& operator	= ( const VGVector3& v );	    // assignment of a VGVector3
VGVector3& operator += ( const VGVector3& v );	    // incrementation by a VGVector3
VGVector3& operator -= ( const VGVector3& v );	    // decrementation by a VGVector3
VGVector3& operator *= ( const double d );	    // multiplication by a constant
VGVector3& operator /= ( const double d );	    // division by a constant
double& operator [] ( int i);				// indexing
double operator[] (int i) const;			// read-only indexing

// special functions

double length() const;				// length of a VGVector3
double length2() const;				// squared length of a VGVector3
VGVector3& normalize();					// normalize a VGVector3 in place
VGVector3& apply(V_FCT_PTR fct);		    // apply a func. to each component

// friends

friend VGVector3 operator - (const VGVector3& v);						// -v1
friend VGVector3 operator + (const VGVector3& a, const VGVector3& b);	    // v1 + v2
friend VGVector3 operator - (const VGVector3& a, const VGVector3& b);	    // v1 - v2
friend VGVector3 operator * (const VGVector3& a, const double d);	    // v1 * 3.0
friend VGVector3 operator * (const double d, const VGVector3& a);	    // 3.0 * v1
friend VGVector3 operator * (const VGMatrix4& a, const VGVector3& v);	    // M . v
friend VGVector3 operator * (const VGVector3& v, const VGMatrix4& a);		// v . M
friend double operator * (const VGVector3& a, const VGVector3& b);    // dot product
friend VGVector3 operator / (const VGVector3& a, const double d);	    // v1 / 3.0
friend VGVector3 operator ^ (const VGVector3& a, const VGVector3& b);	    // cross product
friend int operator == (const VGVector3& a, const VGVector3& b);	    // v1 == v2 ?
friend int operator != (const VGVector3& a, const VGVector3& b);	    // v1 != v2 ?

#ifdef ALGEBRA3IOSTREAMS
friend ostream& operator << (ostream& s, const VGVector3& v);	   // output to stream
friend istream& operator >> (istream& s, VGVector3& v);	    // input from strm.
#endif // ALGEBRA3IOSTREAMS

friend void swap(VGVector3& a, VGVector3& b);						// swap v1 & v2
friend VGVector3 min(const VGVector3& a, const VGVector3& b);		    // min(v1, v2)
friend VGVector3 max(const VGVector3& a, const VGVector3& b);		    // max(v1, v2)
friend VGVector3 prod(const VGVector3& a, const VGVector3& b);		    // term by term *

// necessary friend declarations

friend class VGVector2;
friend class VGVector4;
friend class VGMatrix3;
friend VGVector2 operator * (const VGMatrix3& a, const VGVector2& v);	// linear transform
friend VGVector3 operator * (const VGMatrix3& a, const VGVector3& v);
friend VGMatrix3 operator * (const VGMatrix3& a, const VGMatrix3& b);	// matrix 3 product
};

/****************************************************************
*																*
*			    4D Vector										*
*																*
****************************************************************/

class VGVector4
{
protected:

 double n[4];

public:

// Constructors

VGVector4();
VGVector4(const double x, const double y, const double z, const double w);
VGVector4(const double d);
VGVector4(const VGVector4& v);			    // copy constructor
VGVector4(const VGVector3& v);			    // cast VGVector3 to VGVector4
VGVector4(const VGVector3& v, const double d);	    // cast VGVector3 to VGVector4

// Assignment operators

VGVector4& operator	= ( const VGVector4& v );	    // assignment of a VGVector4
VGVector4& operator += ( const VGVector4& v );	    // incrementation by a VGVector4
VGVector4& operator -= ( const VGVector4& v );	    // decrementation by a VGVector4
VGVector4& operator *= ( const double d );	    // multiplication by a constant
VGVector4& operator /= ( const double d );	    // division by a constant
double& operator [] ( int i);				// indexing
double operator[] (int i) const;			// read-only indexing

// special functions

double length() const;			// length of a VGVector4
double length2() const;			// squared length of a VGVector4
VGVector4& normalize();			    // normalize a VGVector4 in place
VGVector4& apply(V_FCT_PTR fct);		// apply a func. to each component

// friends

friend VGVector4 operator - (const VGVector4& v);						// -v1
friend VGVector4 operator + (const VGVector4& a, const VGVector4& b);	    // v1 + v2
friend VGVector4 operator - (const VGVector4& a, const VGVector4& b);	    // v1 - v2
friend VGVector4 operator * (const VGVector4& a, const double d);	    // v1 * 3.0
friend VGVector4 operator * (const double d, const VGVector4& a);	    // 3.0 * v1
friend VGVector4 operator * (const VGMatrix4& a, const VGVector4& v);	    // M . v
friend VGVector4 operator * (const VGVector4& v, const VGMatrix4& a);	    // v . M
friend double operator * (const VGVector4& a, const VGVector4& b);    // dot product
friend VGVector4 operator / (const VGVector4& a, const double d);	    // v1 / 3.0
friend int operator == (const VGVector4& a, const VGVector4& b);	    // v1 == v2 ?
friend int operator != (const VGVector4& a, const VGVector4& b);	    // v1 != v2 ?

#ifdef ALGEBRA3IOSTREAMS
friend ostream& operator << (ostream& s, const VGVector4& v);	// output to stream
friend istream& operator >> (istream& s, VGVector4& v);	    // input from strm.
#endif //  ALGEBRA3IOSTREAMS

friend void swap(VGVector4& a, VGVector4& b);						// swap v1 & v2
friend VGVector4 min(const VGVector4& a, const VGVector4& b);		    // min(v1, v2)
friend VGVector4 max(const VGVector4& a, const VGVector4& b);		    // max(v1, v2)
friend VGVector4 prod(const VGVector4& a, const VGVector4& b);		    // term by term *

// necessary friend declarations

friend class VGVector3;
friend class VGMatrix4;
friend VGVector3 operator * (const VGMatrix4& a, const VGVector3& v);	// linear transform
friend VGMatrix4 operator * (const VGMatrix4& a, const VGMatrix4& b);	// matrix 4 product
};

/****************************************************************
*																*
*			   3x3 Matrix										*
*																*
****************************************************************/

class VGMatrix3
{
protected:

 VGVector3 v[3];

public:

// Constructors

VGMatrix3();
VGMatrix3(const VGVector3& v0, const VGVector3& v1, const VGVector3& v2);
VGMatrix3(const double d);
VGMatrix3(const VGMatrix3& m);

// Assignment operators

VGMatrix3& operator	= ( const VGMatrix3& m );	    // assignment of a VGMatrix3
VGMatrix3& operator += ( const VGMatrix3& m );	    // incrementation by a VGMatrix3
VGMatrix3& operator -= ( const VGMatrix3& m );	    // decrementation by a VGMatrix3
VGMatrix3& operator *= ( const double d );	    // multiplication by a constant
VGMatrix3& operator /= ( const double d );	    // division by a constant
VGVector3& operator [] ( int i);					// indexing
const VGVector3& operator [] ( int i) const;		// read-only indexing

// special functions

VGMatrix3 transpose() const;			    // transpose
VGMatrix3 inverse() const;				// inverse
VGMatrix3& apply(V_FCT_PTR fct);		    // apply a func. to each element
double determinant();               // for matrix [row][col]
double determinantCol();            // for matrix [col][row]

// friends

friend VGMatrix3 operator - (const VGMatrix3& a);						// -m1
friend VGMatrix3 operator + (const VGMatrix3& a, const VGMatrix3& b);	    // m1 + m2
friend VGMatrix3 operator - (const VGMatrix3& a, const VGMatrix3& b);	    // m1 - m2
friend VGMatrix3 operator * (const VGMatrix3& a, const VGMatrix3& b);		// m1 * m2
friend VGMatrix3 operator * (const VGMatrix3& a, const double d);	    // m1 * 3.0
friend VGMatrix3 operator * (const double d, const VGMatrix3& a);	    // 3.0 * m1
friend VGMatrix3 operator / (const VGMatrix3& a, const double d);	    // m1 / 3.0
friend int operator == (const VGMatrix3& a, const VGMatrix3& b);	    // m1 == m2 ?
friend int operator != (const VGMatrix3& a, const VGMatrix3& b);	    // m1 != m2 ?

#ifdef ALGEBRA3IOSTREAMS
friend ostream& operator << (ostream& s, const VGMatrix3& m);	// output to stream
friend istream& operator >> (istream& s, VGMatrix3& m);	    // input from strm.
#endif //  ALGEBRA3IOSTREAMS

friend void swap(VGMatrix3& a, VGMatrix3& b);			    // swap m1 & m2

// necessary friend declarations

friend VGVector3 operator * (const VGMatrix3& a, const VGVector3& v);	    // linear transform
friend VGVector2 operator * (const VGMatrix3& a, const VGVector2& v);	    // linear transform
};

/****************************************************************
*																*
*			   4x4 Matrix										*
*																*
****************************************************************/

class VGMatrix4
{
protected:

 VGVector4 v[4];

public:

// Constructors

VGMatrix4();
VGMatrix4(const VGVector4& v0, const VGVector4& v1, const VGVector4& v2, const VGVector4& v3);
VGMatrix4(const double d);
VGMatrix4(const VGMatrix4& m);

// Assignment operators

VGMatrix4& operator	= ( const VGMatrix4& m );	    // assignment of a VGMatrix4
VGMatrix4& operator += ( const VGMatrix4& m );	    // incrementation by a VGMatrix4
VGMatrix4& operator -= ( const VGMatrix4& m );	    // decrementation by a VGMatrix4
VGMatrix4& operator *= ( const double d );	    // multiplication by a constant
VGMatrix4& operator /= ( const double d );	    // division by a constant
VGVector4& operator [] ( int i);					// indexing
const VGVector4& operator [] ( int i) const;		// read-only indexing

// special functions

VGMatrix4 transpose() const;						// transpose
VGMatrix4 inverse() const;						// inverse
VGMatrix4& apply(V_FCT_PTR fct);					// apply a func. to each element

// friends

friend VGMatrix4 operator - (const VGMatrix4& a);						// -m1
friend VGMatrix4 operator + (const VGMatrix4& a, const VGMatrix4& b);	    // m1 + m2
friend VGMatrix4 operator - (const VGMatrix4& a, const VGMatrix4& b);	    // m1 - m2
friend VGMatrix4 operator * (const VGMatrix4& a, const VGMatrix4& b);		// m1 * m2
friend VGMatrix4 operator * (const VGMatrix4& a, const double d);	    // m1 * 4.0
friend VGMatrix4 operator * (const double d, const VGMatrix4& a);	    // 4.0 * m1
friend VGMatrix4 operator / (const VGMatrix4& a, const double d);	    // m1 / 3.0
friend int operator == (const VGMatrix4& a, const VGMatrix4& b);	    // m1 == m2 ?
friend int operator != (const VGMatrix4& a, const VGMatrix4& b);	    // m1 != m2 ?

#ifdef ALGEBRA3IOSTREAMS
friend ostream& operator << (ostream& s, const VGMatrix4& m);	// output to stream
friend istream& operator >> (istream& s, VGMatrix4& m);			// input from strm.
#endif //  ALGEBRA3IOSTREAMS

friend void swap(VGMatrix4& a, VGMatrix4& b);							// swap m1 & m2

// necessary friend declarations

friend VGVector4 operator * (const VGMatrix4& a, const VGVector4& v);	    // linear transform
friend VGVector3 operator * (const VGMatrix4& a, const VGVector3& v);	    // linear transform
};

/****************************************************************
*																*
*	       2D functions and 3D functions						*
*																*
****************************************************************/

VGMatrix3 identity2D();								// identity 2D
VGMatrix3 translation2D(const VGVector2& v);				// translation 2D
VGMatrix3 rotation2D(const VGVector2& Center, const double angleDeg);	// rotation 2D
VGMatrix3 scaling2D(const VGVector2& scaleVector);		// scaling 2D
VGMatrix4 identity3D();								// identity 3D
VGMatrix4 translation3D(const VGVector3& v);				// translation 3D
VGMatrix4 rotation3D(VGVector3 Axis, const double angleDeg);// rotation 3D
VGMatrix4 scaling3D(const VGVector3& scaleVector);		// scaling 3D
VGMatrix4 perspective3D(const double d);			    // perspective 3D

//
//	Implementation
//

/****************************************************************
*																*
*		    VGVector2 Member functions								*
*																*
****************************************************************/

// CONSTRUCTORS

inline VGVector2::VGVector2() {}

inline VGVector2::VGVector2(const double x, const double y)
{ n[VX] = x; n[VY] = y; }

inline VGVector2::VGVector2(const double d)
{ n[VX] = n[VY] = d; }

inline VGVector2::VGVector2(const VGVector2& v)
{ n[VX] = v.n[VX]; n[VY] = v.n[VY]; }

inline VGVector2::VGVector2(const VGVector3& v) // it is up to caller to avoid divide-by-zero
{ n[VX] = v.n[VX]/v.n[VZ]; n[VY] = v.n[VY]/v.n[VZ]; };

inline VGVector2::VGVector2(const VGVector3& v, int dropAxis) {
    switch (dropAxis) {
	case VX: n[VX] = v.n[VY]; n[VY] = v.n[VZ]; break;
	case VY: n[VX] = v.n[VX]; n[VY] = v.n[VZ]; break;
	default: n[VX] = v.n[VX]; n[VY] = v.n[VY]; break;
    }
}


// ASSIGNMENT OPERATORS

inline VGVector2& VGVector2::operator = (const VGVector2& v)
{ n[VX] = v.n[VX]; n[VY] = v.n[VY]; return *this; }

inline VGVector2& VGVector2::operator += ( const VGVector2& v )
{ n[VX] += v.n[VX]; n[VY] += v.n[VY]; return *this; }

inline VGVector2& VGVector2::operator -= ( const VGVector2& v )
{ n[VX] -= v.n[VX]; n[VY] -= v.n[VY]; return *this; }

inline VGVector2& VGVector2::operator *= ( const double d )
{ n[VX] *= d; n[VY] *= d; return *this; }

inline VGVector2& VGVector2::operator /= ( const double d )
{ double d_inv = 1./d; n[VX] *= d_inv; n[VY] *= d_inv; return *this; }

inline double& VGVector2::operator [] ( int i) {
    assert(!(i < VX || i > VY));		// subscript check
    return n[i];
}

inline double VGVector2::operator [] ( int i) const {
    assert(!(i < VX || i > VY));
    return n[i];
}


// SPECIAL FUNCTIONS

inline double VGVector2::length() const
{ return sqrt(length2()); }

inline double VGVector2::length2() const
{ return n[VX]*n[VX] + n[VY]*n[VY]; }

inline VGVector2& VGVector2::normalize() // it is up to caller to avoid divide-by-zero
{ *this /= length(); return *this; }

inline VGVector2& VGVector2::apply(V_FCT_PTR fct)
{ n[VX] = (*fct)(n[VX]); n[VY] = (*fct)(n[VY]); return *this; }


// FRIENDS

inline VGVector2 operator - (const VGVector2& a)
{ return VGVector2(-a.n[VX],-a.n[VY]); }

inline VGVector2 operator + (const VGVector2& a, const VGVector2& b)
{ return VGVector2(a.n[VX]+ b.n[VX], a.n[VY] + b.n[VY]); }

inline VGVector2 operator - (const VGVector2& a, const VGVector2& b)
{ return VGVector2(a.n[VX]-b.n[VX], a.n[VY]-b.n[VY]); }

inline VGVector2 operator * (const VGVector2& a, const double d)
{ return VGVector2(d*a.n[VX], d*a.n[VY]); }

inline VGVector2 operator * (const double d, const VGVector2& a)
{ return a*d; }

inline VGVector2 operator * (const VGMatrix3& a, const VGVector2& v) {
    VGVector3 av;

    av.n[VX] = a.v[0].n[VX]*v.n[VX] + a.v[0].n[VY]*v.n[VY] + a.v[0].n[VZ];
    av.n[VY] = a.v[1].n[VX]*v.n[VX] + a.v[1].n[VY]*v.n[VY] + a.v[1].n[VZ];
    av.n[VZ] = a.v[2].n[VX]*v.n[VX] + a.v[2].n[VY]*v.n[VY] + a.v[2].n[VZ];
    return av;
}

inline VGVector2 operator * (const VGVector2& v, const VGMatrix3& a)
{ return a.transpose() * v; }

inline double operator * (const VGVector2& a, const VGVector2& b)
{ return (a.n[VX]*b.n[VX] + a.n[VY]*b.n[VY]); }

inline VGVector2 operator / (const VGVector2& a, const double d)
{ double d_inv = 1./d; return VGVector2(a.n[VX]*d_inv, a.n[VY]*d_inv); }

inline VGVector3 operator ^ (const VGVector2& a, const VGVector2& b)
{ return VGVector3(0.0, 0.0, a.n[VX] * b.n[VY] - b.n[VX] * a.n[VY]); }

inline int operator == (const VGVector2& a, const VGVector2& b)
{ return (a.n[VX] == b.n[VX]) && (a.n[VY] == b.n[VY]); }

inline int operator != (const VGVector2& a, const VGVector2& b)
{ return !(a == b); }

#ifdef ALGEBRA3IOSTREAMS
inline ostream& operator << (ostream& s, const VGVector2& v)
{ return s << "| " << v.n[VX] << ' ' << v.n[VY] << " |"; }
inline istream& operator >> (istream& s, VGVector2& v) {
    VGVector2	v_tmp;
    char	c = ' ';

    while (isspace(c))
	s >> c;
    // The vectors can be formatted either as x y or | x y |
    if (c == '|') {
	s >> v_tmp[VX] >> v_tmp[VY];
	while (s >> c && isspace(c)) ;
	if (c != '|')
	    s.setstate(ios::badbit);
	}
    else {
	s.putback(c);
	s >> v_tmp[VX] >> v_tmp[VY];
	}
    if (s)
	v = v_tmp;
    return s;
}
#endif // ALGEBRA3IOSTREAMS

inline void swap(VGVector2& a, VGVector2& b)
{ VGVector2 tmp(a); a = b; b = tmp; }

inline VGVector2 min(const VGVector2& a, const VGVector2& b)
{ return VGVector2(MIN(a.n[VX], b.n[VX]), MIN(a.n[VY], b.n[VY])); }

inline VGVector2 max(const VGVector2& a, const VGVector2& b)
{ return VGVector2(MAX(a.n[VX], b.n[VX]), MAX(a.n[VY], b.n[VY])); }

inline VGVector2 prod(const VGVector2& a, const VGVector2& b)
{ return VGVector2(a.n[VX] * b.n[VX], a.n[VY] * b.n[VY]); }

/****************************************************************
*																*
*		    VGVector3 Member functions								*
*																*
****************************************************************/

// CONSTRUCTORS

inline VGVector3::VGVector3() {}

inline VGVector3::VGVector3(const double x, const double y, const double z)
{ n[VX] = x; n[VY] = y; n[VZ] = z; }

inline VGVector3::VGVector3(const double d)
{ n[VX] = n[VY] = n[VZ] = d; }

inline VGVector3::VGVector3(const VGVector3& v)
{ n[VX] = v.n[VX]; n[VY] = v.n[VY]; n[VZ] = v.n[VZ]; }

inline VGVector3::VGVector3(const VGVector2& v)
{ n[VX] = v.n[VX]; n[VY] = v.n[VY]; n[VZ] = 1.0; }

inline VGVector3::VGVector3(const VGVector2& v, double d)
{ n[VX] = v.n[VX]; n[VY] = v.n[VY]; n[VZ] = d; }

inline VGVector3::VGVector3(const VGVector4& v) // it is up to caller to avoid divide-by-zero
{ n[VX] = v.n[VX] / v.n[VW]; n[VY] = v.n[VY] / v.n[VW];
  n[VZ] = v.n[VZ] / v.n[VW]; }

inline VGVector3::VGVector3(const VGVector4& v, int dropAxis) {
    switch (dropAxis) {
	case VX: n[VX] = v.n[VY]; n[VY] = v.n[VZ]; n[VZ] = v.n[VW]; break;
	case VY: n[VX] = v.n[VX]; n[VY] = v.n[VZ]; n[VZ] = v.n[VW]; break;
	case VZ: n[VX] = v.n[VX]; n[VY] = v.n[VY]; n[VZ] = v.n[VW]; break;
	default: n[VX] = v.n[VX]; n[VY] = v.n[VY]; n[VZ] = v.n[VZ]; break;
    }
}


// ASSIGNMENT OPERATORS

inline VGVector3& VGVector3::operator = (const VGVector3& v)
{ n[VX] = v.n[VX]; n[VY] = v.n[VY]; n[VZ] = v.n[VZ]; return *this; }

inline VGVector3& VGVector3::operator += ( const VGVector3& v )
{ n[VX] += v.n[VX]; n[VY] += v.n[VY]; n[VZ] += v.n[VZ]; return *this; }

inline VGVector3& VGVector3::operator -= ( const VGVector3& v )
{ n[VX] -= v.n[VX]; n[VY] -= v.n[VY]; n[VZ] -= v.n[VZ]; return *this; }

inline VGVector3& VGVector3::operator *= ( const double d )
{ n[VX] *= d; n[VY] *= d; n[VZ] *= d; return *this; }

inline VGVector3& VGVector3::operator /= ( const double d )
{ double d_inv = 1./d; n[VX] *= d_inv; n[VY] *= d_inv; n[VZ] *= d_inv;
  return *this; }

inline double& VGVector3::operator [] ( int i) {
    assert(! (i < VX || i > VZ));
    return n[i];
}

inline double VGVector3::operator [] ( int i) const {
    assert(! (i < VX || i > VZ));
    return n[i];
}


// SPECIAL FUNCTIONS

inline double VGVector3::length() const
{  return sqrt(length2()); }

inline double VGVector3::length2() const
{  return n[VX]*n[VX] + n[VY]*n[VY] + n[VZ]*n[VZ]; }

inline VGVector3& VGVector3::normalize() // it is up to caller to avoid divide-by-zero
{ *this /= length(); return *this; }

inline VGVector3& VGVector3::apply(V_FCT_PTR fct)
{ n[VX] = (*fct)(n[VX]); n[VY] = (*fct)(n[VY]); n[VZ] = (*fct)(n[VZ]);
return *this; }


// FRIENDS

inline VGVector3 operator - (const VGVector3& a)
{  return VGVector3(-a.n[VX],-a.n[VY],-a.n[VZ]); }

inline VGVector3 operator + (const VGVector3& a, const VGVector3& b)
{ return VGVector3(a.n[VX]+ b.n[VX], a.n[VY] + b.n[VY], a.n[VZ] + b.n[VZ]); }

inline VGVector3 operator - (const VGVector3& a, const VGVector3& b)
{ return VGVector3(a.n[VX]-b.n[VX], a.n[VY]-b.n[VY], a.n[VZ]-b.n[VZ]); }

inline VGVector3 operator * (const VGVector3& a, const double d)
{ return VGVector3(d*a.n[VX], d*a.n[VY], d*a.n[VZ]); }

inline VGVector3 operator * (const double d, const VGVector3& a)
{ return a*d; }

inline VGVector3 operator * (const VGMatrix3& a, const VGVector3& v) {
#define ROWCOL(i) a.v[i].n[0]*v.n[VX] + a.v[i].n[1]*v.n[VY] \
    + a.v[i].n[2]*v.n[VZ]
    return VGVector3(ROWCOL(0), ROWCOL(1), ROWCOL(2));
#undef ROWCOL // (i)
}

inline VGVector3 operator * (const VGMatrix4& a, const VGVector3& v)
{ return a * VGVector4(v); }

inline VGVector3 operator * (const VGVector3& v, const VGMatrix4& a)
{ return a.transpose() * v; }

inline double operator * (const VGVector3& a, const VGVector3& b)
{ return (a.n[VX]*b.n[VX] + a.n[VY]*b.n[VY] + a.n[VZ]*b.n[VZ]); }

inline VGVector3 operator / (const VGVector3& a, const double d)
{ double d_inv = 1./d; return VGVector3(a.n[VX]*d_inv, a.n[VY]*d_inv,
  a.n[VZ]*d_inv); }

inline VGVector3 operator ^ (const VGVector3& a, const VGVector3& b) {
    return VGVector3(a.n[VY]*b.n[VZ] - a.n[VZ]*b.n[VY],
		a.n[VZ]*b.n[VX] - a.n[VX]*b.n[VZ],
		a.n[VX]*b.n[VY] - a.n[VY]*b.n[VX]);
}

inline int operator == (const VGVector3& a, const VGVector3& b)
{ return (a.n[VX] == b.n[VX]) && (a.n[VY] == b.n[VY]) && (a.n[VZ] == b.n[VZ]);
}

inline int operator != (const VGVector3& a, const VGVector3& b)
{ return !(a == b); }

#ifdef ALGEBRA3IOSTREAMS
inline ostream& operator << (ostream& s, const VGVector3& v)
{ return s << "| " << v.n[VX] << ' ' << v.n[VY] << ' ' << v.n[VZ] << " |"; }

inline istream& operator >> (istream& s, VGVector3& v) {
    VGVector3	v_tmp;
    char	c = ' ';

    while (isspace(c))
	s >> c;
    // The vectors can be formatted either as x y z or | x y z |
    if (c == '|') {
	s >> v_tmp[VX] >> v_tmp[VY] >> v_tmp[VZ];
	while (s >> c && isspace(c)) ;
	if (c != '|')
	    s.setstate(ios::badbit);
	}
    else {
	s.putback(c);
	s >> v_tmp[VX] >> v_tmp[VY] >> v_tmp[VZ];
	}
    if (s)
	v = v_tmp;
    return s;
}
#endif // ALGEBRA3IOSTREAMS

inline void swap(VGVector3& a, VGVector3& b)
{ VGVector3 tmp(a); a = b; b = tmp; }

inline VGVector3 min(const VGVector3& a, const VGVector3& b)
{ return VGVector3(MIN(a.n[VX], b.n[VX]), MIN(a.n[VY], b.n[VY]), MIN(a.n[VZ],
  b.n[VZ])); }

inline VGVector3 max(const VGVector3& a, const VGVector3& b)
{ return VGVector3(MAX(a.n[VX], b.n[VX]), MAX(a.n[VY], b.n[VY]), MAX(a.n[VZ],
  b.n[VZ])); }

inline VGVector3 prod(const VGVector3& a, const VGVector3& b)
{ return VGVector3(a.n[VX] * b.n[VX], a.n[VY] * b.n[VY], a.n[VZ] * b.n[VZ]); }


/****************************************************************
*																*
*		    VGVector4 Member functions								*
*																*
****************************************************************/

// CONSTRUCTORS

inline VGVector4::VGVector4() {}

inline VGVector4::VGVector4(const double x, const double y, const double z, const double w)
{ n[VX] = x; n[VY] = y; n[VZ] = z; n[VW] = w; }

inline VGVector4::VGVector4(const double d)
{  n[VX] = n[VY] = n[VZ] = n[VW] = d; }

inline VGVector4::VGVector4(const VGVector4& v)
{ n[VX] = v.n[VX]; n[VY] = v.n[VY]; n[VZ] = v.n[VZ]; n[VW] = v.n[VW]; }

inline VGVector4::VGVector4(const VGVector3& v)
{ n[VX] = v.n[VX]; n[VY] = v.n[VY]; n[VZ] = v.n[VZ]; n[VW] = 1.0; }

inline VGVector4::VGVector4(const VGVector3& v, const double d)
{ n[VX] = v.n[VX]; n[VY] = v.n[VY]; n[VZ] = v.n[VZ];  n[VW] = d; }


// ASSIGNMENT OPERATORS

inline VGVector4& VGVector4::operator = (const VGVector4& v)
{ n[VX] = v.n[VX]; n[VY] = v.n[VY]; n[VZ] = v.n[VZ]; n[VW] = v.n[VW];
return *this; }

inline VGVector4& VGVector4::operator += ( const VGVector4& v )
{ n[VX] += v.n[VX]; n[VY] += v.n[VY]; n[VZ] += v.n[VZ]; n[VW] += v.n[VW];
return *this; }

inline VGVector4& VGVector4::operator -= ( const VGVector4& v )
{ n[VX] -= v.n[VX]; n[VY] -= v.n[VY]; n[VZ] -= v.n[VZ]; n[VW] -= v.n[VW];
return *this; }

inline VGVector4& VGVector4::operator *= ( const double d )
{ n[VX] *= d; n[VY] *= d; n[VZ] *= d; n[VW] *= d; return *this; }

inline VGVector4& VGVector4::operator /= ( const double d )
{ double d_inv = 1./d; n[VX] *= d_inv; n[VY] *= d_inv; n[VZ] *= d_inv;
  n[VW] *= d_inv; return *this; }

inline double& VGVector4::operator [] ( int i) {
    assert(! (i < VX || i > VW));
    return n[i];
}

inline double VGVector4::operator [] ( int i) const {
    assert(! (i < VX || i > VW));
    return n[i];
}

// SPECIAL FUNCTIONS

inline double VGVector4::length() const
{ return sqrt(length2()); }

inline double VGVector4::length2() const
{ return n[VX]*n[VX] + n[VY]*n[VY] + n[VZ]*n[VZ] + n[VW]*n[VW]; }

inline VGVector4& VGVector4::normalize() // it is up to caller to avoid divide-by-zero
{ *this /= length(); return *this; }

inline VGVector4& VGVector4::apply(V_FCT_PTR fct)
{ n[VX] = (*fct)(n[VX]); n[VY] = (*fct)(n[VY]); n[VZ] = (*fct)(n[VZ]);
n[VW] = (*fct)(n[VW]); return *this; }


// FRIENDS

inline VGVector4 operator - (const VGVector4& a)
{ return VGVector4(-a.n[VX],-a.n[VY],-a.n[VZ],-a.n[VW]); }

inline VGVector4 operator + (const VGVector4& a, const VGVector4& b)
{ return VGVector4(a.n[VX] + b.n[VX], a.n[VY] + b.n[VY], a.n[VZ] + b.n[VZ],
  a.n[VW] + b.n[VW]); }

inline VGVector4 operator - (const VGVector4& a, const VGVector4& b)
{  return VGVector4(a.n[VX] - b.n[VX], a.n[VY] - b.n[VY], a.n[VZ] - b.n[VZ],
   a.n[VW] - b.n[VW]); }

inline VGVector4 operator * (const VGVector4& a, const double d)
{ return VGVector4(d*a.n[VX], d*a.n[VY], d*a.n[VZ], d*a.n[VW] ); }

inline VGVector4 operator * (const double d, const VGVector4& a)
{ return a*d; }

inline VGVector4 operator * (const VGMatrix4& a, const VGVector4& v) {
#define ROWCOL(i) a.v[i].n[0]*v.n[VX] + a.v[i].n[1]*v.n[VY] \
    + a.v[i].n[2]*v.n[VZ] + a.v[i].n[3]*v.n[VW]
    return VGVector4(ROWCOL(0), ROWCOL(1), ROWCOL(2), ROWCOL(3));
#undef ROWCOL // (i)
}

inline VGVector4 operator * (const VGVector4& v, const VGMatrix4& a)
{ return a.transpose() * v; }

inline double operator * (const VGVector4& a, const VGVector4& b)
{ return (a.n[VX]*b.n[VX] + a.n[VY]*b.n[VY] + a.n[VZ]*b.n[VZ] +
  a.n[VW]*b.n[VW]); }

inline VGVector4 operator / (const VGVector4& a, const double d)
{ double d_inv = 1./d; return VGVector4(a.n[VX]*d_inv, a.n[VY]*d_inv, a.n[VZ]*d_inv,
  a.n[VW]*d_inv); }

inline int operator == (const VGVector4& a, const VGVector4& b)
{ return (a.n[VX] == b.n[VX]) && (a.n[VY] == b.n[VY]) && (a.n[VZ] == b.n[VZ])
  && (a.n[VW] == b.n[VW]); }

inline int operator != (const VGVector4& a, const VGVector4& b)
{ return !(a == b); }

#ifdef ALGEBRA3IOSTREAMS
inline ostream& operator << (ostream& s, const VGVector4& v)
{ return s << "| " << v.n[VX] << ' ' << v.n[VY] << ' ' << v.n[VZ] << ' '
  << v.n[VW] << " |"; }

inline istream& operator >> (istream& s, VGVector4& v) {
    VGVector4	v_tmp;
    char	c = ' ';

    while (isspace(c))
	s >> c;
    // The vectors can be formatted either as x y z w or | x y z w |
    if (c == '|') {
	s >> v_tmp[VX] >> v_tmp[VY] >> v_tmp[VZ] >> v_tmp[VW];
	while (s >> c && isspace(c)) ;
	if (c != '|')
	    s.setstate(ios::badbit);
	}
    else {
	s.putback(c);
	s >> v_tmp[VX] >> v_tmp[VY] >> v_tmp[VZ] >> v_tmp[VW];
	}
    if (s)
	v = v_tmp;
    return s;
}
#endif // ALGEBRA3IOSTREAMS

inline void swap(VGVector4& a, VGVector4& b)
{ VGVector4 tmp(a); a = b; b = tmp; }

inline VGVector4 min(const VGVector4& a, const VGVector4& b)
{ return VGVector4(MIN(a.n[VX], b.n[VX]), MIN(a.n[VY], b.n[VY]), MIN(a.n[VZ],
  b.n[VZ]), MIN(a.n[VW], b.n[VW])); }

inline VGVector4 max(const VGVector4& a, const VGVector4& b)
{ return VGVector4(MAX(a.n[VX], b.n[VX]), MAX(a.n[VY], b.n[VY]), MAX(a.n[VZ],
  b.n[VZ]), MAX(a.n[VW], b.n[VW])); }

inline VGVector4 prod(const VGVector4& a, const VGVector4& b)
{ return VGVector4(a.n[VX] * b.n[VX], a.n[VY] * b.n[VY], a.n[VZ] * b.n[VZ],
  a.n[VW] * b.n[VW]); }


/****************************************************************
*																*
*		    VGMatrix3 member functions								*
*																*
****************************************************************/

// CONSTRUCTORS

inline VGMatrix3::VGMatrix3() {}

inline VGMatrix3::VGMatrix3(const VGVector3& v0, const VGVector3& v1, const VGVector3& v2)
{ v[0] = v0; v[1] = v1; v[2] = v2; }

inline VGMatrix3::VGMatrix3(const double d)
{ v[0] = v[1] = v[2] = VGVector3(d); }

inline VGMatrix3::VGMatrix3(const VGMatrix3& m)
{ v[0] = m.v[0]; v[1] = m.v[1]; v[2] = m.v[2]; }


// ASSIGNMENT OPERATORS

inline VGMatrix3& VGMatrix3::operator = ( const VGMatrix3& m )
{ v[0] = m.v[0]; v[1] = m.v[1]; v[2] = m.v[2]; return *this; }

inline VGMatrix3& VGMatrix3::operator += ( const VGMatrix3& m )
{ v[0] += m.v[0]; v[1] += m.v[1]; v[2] += m.v[2]; return *this; }

inline VGMatrix3& VGMatrix3::operator -= ( const VGMatrix3& m )
{ v[0] -= m.v[0]; v[1] -= m.v[1]; v[2] -= m.v[2]; return *this; }

inline VGMatrix3& VGMatrix3::operator *= ( const double d )
{ v[0] *= d; v[1] *= d; v[2] *= d; return *this; }

inline VGMatrix3& VGMatrix3::operator /= ( const double d )
{ v[0] /= d; v[1] /= d; v[2] /= d; return *this; }

inline VGVector3& VGMatrix3::operator [] ( int i) {
    assert(! (i < VX || i > VZ));
    return v[i];
}

inline const VGVector3& VGMatrix3::operator [] ( int i) const {
    assert(!(i < VX || i > VZ));
    return v[i];
}

// SPECIAL FUNCTIONS

inline VGMatrix3 VGMatrix3::transpose() const {
    return VGMatrix3(VGVector3(v[0][0], v[1][0], v[2][0]),
		VGVector3(v[0][1], v[1][1], v[2][1]),
		VGVector3(v[0][2], v[1][2], v[2][2]));
}

inline VGMatrix3 VGMatrix3::inverse()	const    // Gauss-Jordan elimination with partial pivoting
    {
    VGMatrix3 a(*this),	    // As a evolves from original mat into identity
	 b(identity2D());   // b evolves from identity into inverse(a)
    int	 i, j, i1;

    // Loop over cols of a from left to right, eliminating above and below diag
    for (j=0; j<3; j++) {   // Find largest pivot in column j among rows j..2
    i1 = j;		    // Row with largest pivot candidate
    for (i=j+1; i<3; i++)
	if (fabs(a.v[i].n[j]) > fabs(a.v[i1].n[j]))
	    i1 = i;

    // Swap rows i1 and j in a and b to put pivot on diagonal
    swap(a.v[i1], a.v[j]);
    swap(b.v[i1], b.v[j]);

    // Scale row j to have a unit diagonal
    if (a.v[j].n[j]==0.)
	ALGEBRA_ERROR("VGMatrix3::inverse: singular matrix; can't invert\n")
    b.v[j] /= a.v[j].n[j];
    a.v[j] /= a.v[j].n[j];

    // Eliminate off-diagonal elems in col j of a, doing identical ops to b
    for (i=0; i<3; i++)
	if (i!=j) {
	b.v[i] -= a.v[i].n[j]*b.v[j];
	a.v[i] -= a.v[i].n[j]*a.v[j];
	}
    }
    return b;
}

inline VGMatrix3& VGMatrix3::apply(V_FCT_PTR fct) {
    v[VX].apply(fct);
    v[VY].apply(fct);
    v[VZ].apply(fct);
    return *this;
}

inline double VGMatrix3::determinant() {
    double scalarA = v[0][0]*v[1][1]*v[2][2] + v[0][1]*v[1][2]*v[2][0] + v[0][2]*v[1][0]*v[2][1];
    double scalarB = v[2][0]*v[1][1]*v[0][2] + v[2][1]*v[1][2]*v[0][0] + v[2][2]*v[1][0]*v[0][1];
    return scalarA - scalarB;
}

inline double VGMatrix3::determinantCol() {
    return v[0][0] * (v[1][1] * v[2][2] - v[2][1] * v[1][2]) -
           v[1][0] * (v[0][1] * v[2][2] - v[2][1] * v[0][2]) +
           v[2][0] * (v[0][1] * v[1][2] - v[0][2] * v[1][1]);
}

// FRIENDS

inline VGMatrix3 operator - (const VGMatrix3& a)
{ return VGMatrix3(-a.v[0], -a.v[1], -a.v[2]); }

inline VGMatrix3 operator + (const VGMatrix3& a, const VGMatrix3& b)
{ return VGMatrix3(a.v[0] + b.v[0], a.v[1] + b.v[1], a.v[2] + b.v[2]); }

inline VGMatrix3 operator - (const VGMatrix3& a, const VGMatrix3& b)
{ return VGMatrix3(a.v[0] - b.v[0], a.v[1] - b.v[1], a.v[2] - b.v[2]); }

inline VGMatrix3 operator * (const VGMatrix3& a, const VGMatrix3& b) {
    #define ROWCOL(i, j) \
    a.v[i].n[0]*b.v[0][j] + a.v[i].n[1]*b.v[1][j] + a.v[i].n[2]*b.v[2][j]
    return VGMatrix3(VGVector3(ROWCOL(0,0), ROWCOL(0,1), ROWCOL(0,2)),
		VGVector3(ROWCOL(1,0), ROWCOL(1,1), ROWCOL(1,2)),
		VGVector3(ROWCOL(2,0), ROWCOL(2,1), ROWCOL(2,2)));
    #undef ROWCOL // (i, j)
}

inline VGMatrix3 operator * (const VGMatrix3& a, const double d)
{ return VGMatrix3(a.v[0] * d, a.v[1] * d, a.v[2] * d); }

inline VGMatrix3 operator * (const double d, const VGMatrix3& a)
{ return a*d; }

inline VGMatrix3 operator / (const VGMatrix3& a, const double d)
{ return VGMatrix3(a.v[0] / d, a.v[1] / d, a.v[2] / d); }

inline int operator == (const VGMatrix3& a, const VGMatrix3& b)
{ return (a.v[0] == b.v[0]) && (a.v[1] == b.v[1]) && (a.v[2] == b.v[2]); }

inline int operator != (const VGMatrix3& a, const VGMatrix3& b)
{ return !(a == b); }

#ifdef ALGEBRA3IOSTREAMS
inline ostream& operator << (ostream& s, const VGMatrix3& m)
{ return s << m.v[VX] << '\n' << m.v[VY] << '\n' << m.v[VZ]; }

inline istream& operator >> (istream& s, VGMatrix3& m) {
    VGMatrix3    m_tmp;

    s >> m_tmp[VX] >> m_tmp[VY] >> m_tmp[VZ];
    if (s)
	m = m_tmp;
    return s;
}
#endif // ALGEBRA3IOSTREAMS

inline void swap(VGMatrix3& a, VGMatrix3& b)
{ VGMatrix3 tmp(a); a = b; b = tmp; }


/****************************************************************
*																*
*		    VGMatrix4 member functions								*
*																*
****************************************************************/

// CONSTRUCTORS

inline VGMatrix4::VGMatrix4() {}

inline VGMatrix4::VGMatrix4(const VGVector4& v0, const VGVector4& v1, const VGVector4& v2, const VGVector4& v3)
{ v[0] = v0; v[1] = v1; v[2] = v2; v[3] = v3; }

inline VGMatrix4::VGMatrix4(const double d)
{ v[0] = v[1] = v[2] = v[3] = VGVector4(d); }

inline VGMatrix4::VGMatrix4(const VGMatrix4& m)
{ v[0] = m.v[0]; v[1] = m.v[1]; v[2] = m.v[2]; v[3] = m.v[3]; }


// ASSIGNMENT OPERATORS

inline VGMatrix4& VGMatrix4::operator = ( const VGMatrix4& m )
{ v[0] = m.v[0]; v[1] = m.v[1]; v[2] = m.v[2]; v[3] = m.v[3];
return *this; }

inline VGMatrix4& VGMatrix4::operator += ( const VGMatrix4& m )
{ v[0] += m.v[0]; v[1] += m.v[1]; v[2] += m.v[2]; v[3] += m.v[3];
return *this; }

inline VGMatrix4& VGMatrix4::operator -= ( const VGMatrix4& m )
{ v[0] -= m.v[0]; v[1] -= m.v[1]; v[2] -= m.v[2]; v[3] -= m.v[3];
return *this; }

inline VGMatrix4& VGMatrix4::operator *= ( const double d )
{ v[0] *= d; v[1] *= d; v[2] *= d; v[3] *= d; return *this; }

inline VGMatrix4& VGMatrix4::operator /= ( const double d )
{ v[0] /= d; v[1] /= d; v[2] /= d; v[3] /= d; return *this; }

inline VGVector4& VGMatrix4::operator [] ( int i) {
    assert(! (i < VX || i > VW));
    return v[i];
}

inline const VGVector4& VGMatrix4::operator [] ( int i) const {
    assert(! (i < VX || i > VW));
    return v[i];
}

// SPECIAL FUNCTIONS;

inline VGMatrix4 VGMatrix4::transpose() const{
    return VGMatrix4(VGVector4(v[0][0], v[1][0], v[2][0], v[3][0]),
		VGVector4(v[0][1], v[1][1], v[2][1], v[3][1]),
		VGVector4(v[0][2], v[1][2], v[2][2], v[3][2]),
		VGVector4(v[0][3], v[1][3], v[2][3], v[3][3]));
}

inline VGMatrix4 VGMatrix4::inverse()	const    // Gauss-Jordan elimination with partial pivoting
{
    VGMatrix4 a(*this),	    // As a evolves from original mat into identity
	 b(identity3D());   // b evolves from identity into inverse(a)
    int i, j, i1;

    // Loop over cols of a from left to right, eliminating above and below diag
    for (j=0; j<4; j++) {   // Find largest pivot in column j among rows j..3
    i1 = j;		    // Row with largest pivot candidate
    for (i=j+1; i<4; i++)
	if (fabs(a.v[i].n[j]) > fabs(a.v[i1].n[j]))
	i1 = i;

    // Swap rows i1 and j in a and b to put pivot on diagonal
    swap(a.v[i1], a.v[j]);
    swap(b.v[i1], b.v[j]);

    // Scale row j to have a unit diagonal
    if (a.v[j].n[j]==0.)
	ALGEBRA_ERROR("VGMatrix4::inverse: singular matrix; can't invert\n");
    b.v[j] /= a.v[j].n[j];
    a.v[j] /= a.v[j].n[j];

    // Eliminate off-diagonal elems in col j of a, doing identical ops to b
    for (i=0; i<4; i++)
	if (i!=j) {
	b.v[i] -= a.v[i].n[j]*b.v[j];
	a.v[i] -= a.v[i].n[j]*a.v[j];
	}
    }
    return b;
}

inline VGMatrix4& VGMatrix4::apply(V_FCT_PTR fct)
{ v[VX].apply(fct); v[VY].apply(fct); v[VZ].apply(fct); v[VW].apply(fct);
return *this; }


// FRIENDS

inline VGMatrix4 operator - (const VGMatrix4& a)
{ return VGMatrix4(-a.v[0], -a.v[1], -a.v[2], -a.v[3]); }

inline VGMatrix4 operator + (const VGMatrix4& a, const VGMatrix4& b)
{ return VGMatrix4(a.v[0] + b.v[0], a.v[1] + b.v[1], a.v[2] + b.v[2],
  a.v[3] + b.v[3]);
}

inline VGMatrix4 operator - (const VGMatrix4& a, const VGMatrix4& b)
{ return VGMatrix4(a.v[0] - b.v[0], a.v[1] - b.v[1], a.v[2] - b.v[2], a.v[3] - b.v[3]); }

inline VGMatrix4 operator * (const VGMatrix4& a, const VGMatrix4& b) {
    #define ROWCOL(i, j) a.v[i].n[0]*b.v[0][j] + a.v[i].n[1]*b.v[1][j] + \
    a.v[i].n[2]*b.v[2][j] + a.v[i].n[3]*b.v[3][j]
    return VGMatrix4(
    VGVector4(ROWCOL(0,0), ROWCOL(0,1), ROWCOL(0,2), ROWCOL(0,3)),
    VGVector4(ROWCOL(1,0), ROWCOL(1,1), ROWCOL(1,2), ROWCOL(1,3)),
    VGVector4(ROWCOL(2,0), ROWCOL(2,1), ROWCOL(2,2), ROWCOL(2,3)),
    VGVector4(ROWCOL(3,0), ROWCOL(3,1), ROWCOL(3,2), ROWCOL(3,3))
    );
	#undef ROWCOL
}

inline VGMatrix4 operator * (const VGMatrix4& a, const double d)
{ return VGMatrix4(a.v[0] * d, a.v[1] * d, a.v[2] * d, a.v[3] * d); }

inline VGMatrix4 operator * (const double d, const VGMatrix4& a)
{ return a*d; }

inline VGMatrix4 operator / (const VGMatrix4& a, const double d)
{ return VGMatrix4(a.v[0] / d, a.v[1] / d, a.v[2] / d, a.v[3] / d); }

inline int operator == (const VGMatrix4& a, const VGMatrix4& b)
{ return ((a.v[0] == b.v[0]) && (a.v[1] == b.v[1]) && (a.v[2] == b.v[2]) &&
  (a.v[3] == b.v[3])); }

inline int operator != (const VGMatrix4& a, const VGMatrix4& b)
{ return !(a == b); }

#ifdef ALGEBRA3IOSTREAMS
inline ostream& operator << (ostream& s, const VGMatrix4& m)
{ return s << m.v[VX] << '\n' << m.v[VY] << '\n' << m.v[VZ] << '\n' << m.v[VW]; }

inline istream& operator >> (istream& s, VGMatrix4& m)
{
    VGMatrix4    m_tmp;

    s >> m_tmp[VX] >> m_tmp[VY] >> m_tmp[VZ] >> m_tmp[VW];
    if (s)
	m = m_tmp;
    return s;
}
#endif // ALGEBRA3IOSTREAMS

inline void swap(VGMatrix4& a, VGMatrix4& b)
{ VGMatrix4 tmp(a); a = b; b = tmp; }


/****************************************************************
*																*
*	       2D functions and 3D functions						*
*																*
****************************************************************/

inline VGMatrix3 identity2D()
{   return VGMatrix3(VGVector3(1.0, 0.0, 0.0),
		VGVector3(0.0, 1.0, 0.0),
		VGVector3(0.0, 0.0, 1.0)); }

inline VGMatrix3 translation2D(const VGVector2& v)
{   return VGMatrix3(VGVector3(1.0, 0.0, v[VX]),
		VGVector3(0.0, 1.0, v[VY]),
		VGVector3(0.0, 0.0, 1.0)); }

inline VGMatrix3 rotation2D(const VGVector2& Center, const double angleDeg) {
    double  angleRad = angleDeg * M_PI / 180.0,
	    c = cos(angleRad),
	    s = sin(angleRad);

    return VGMatrix3(VGVector3(c, -s, Center[VX] * (1.0-c) + Center[VY] * s),
		VGVector3(s, c, Center[VY] * (1.0-c) - Center[VX] * s),
		VGVector3(0.0, 0.0, 1.0));
}

inline VGMatrix3 scaling2D(const VGVector2& scaleVector)
{   return VGMatrix3(VGVector3(scaleVector[VX], 0.0, 0.0),
		VGVector3(0.0, scaleVector[VY], 0.0),
		VGVector3(0.0, 0.0, 1.0)); }

inline VGMatrix4 identity3D()
{   return VGMatrix4(VGVector4(1.0, 0.0, 0.0, 0.0),
		VGVector4(0.0, 1.0, 0.0, 0.0),
		VGVector4(0.0, 0.0, 1.0, 0.0),
		VGVector4(0.0, 0.0, 0.0, 1.0)); }

inline VGMatrix4 translation3D(const VGVector3& v)
{   return VGMatrix4(VGVector4(1.0, 0.0, 0.0, v[VX]),
		VGVector4(0.0, 1.0, 0.0, v[VY]),
		VGVector4(0.0, 0.0, 1.0, v[VZ]),
		VGVector4(0.0, 0.0, 0.0, 1.0)); }

inline VGMatrix4 rotation3D(VGVector3 Axis, const double angleDeg) {
    double  angleRad = angleDeg * M_PI / 180.0,
	    c = cos(angleRad),
	    s = sin(angleRad),
	    t = 1.0 - c;

    Axis.normalize();
    return VGMatrix4(VGVector4(t * Axis[VX] * Axis[VX] + c,
		     t * Axis[VX] * Axis[VY] - s * Axis[VZ],
		     t * Axis[VX] * Axis[VZ] + s * Axis[VY],
		     0.0),
		VGVector4(t * Axis[VX] * Axis[VY] + s * Axis[VZ],
		     t * Axis[VY] * Axis[VY] + c,
		     t * Axis[VY] * Axis[VZ] - s * Axis[VX],
		     0.0),
		VGVector4(t * Axis[VX] * Axis[VZ] - s * Axis[VY],
		     t * Axis[VY] * Axis[VZ] + s * Axis[VX],
		     t * Axis[VZ] * Axis[VZ] + c,
		     0.0),
		VGVector4(0.0, 0.0, 0.0, 1.0));
}

inline VGMatrix4 scaling3D(const VGVector3& scaleVector)
{   return VGMatrix4(VGVector4(scaleVector[VX], 0.0, 0.0, 0.0),
		VGVector4(0.0, scaleVector[VY], 0.0, 0.0),
		VGVector4(0.0, 0.0, scaleVector[VZ], 0.0),
		VGVector4(0.0, 0.0, 0.0, 1.0)); }

inline VGMatrix4 perspective3D(const double d)
{   return VGMatrix4(VGVector4(1.0, 0.0, 0.0, 0.0),
		VGVector4(0.0, 1.0, 0.0, 0.0),
		VGVector4(0.0, 0.0, 1.0, 0.0),
		VGVector4(0.0, 0.0, 1.0/d, 0.0)); }


#endif // ALGEBRA3H

