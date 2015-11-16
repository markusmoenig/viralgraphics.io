/*
 * Copyright (c) 2015 Markus Moenig <markusm@visualgraphics.tv>
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

#include "jswrapper.hpp"

JSWrapperData& JSWrapperData::operator=( const JSWrapperData& data )
{
	if ( this == &data ) return (*this);
 
	clean();
	m_type=data.m_type;
    m_number=data.m_number;
    m_string=std::string( data.m_string );
    m_bool=data.m_bool;

    if ( data.m_object ) m_object=new JSWrapperObject( data.m_object );

    return *this;
}

void JSWrapperData::setObject( JSWrapperObject *object )
{
    clean();
    m_type=Object;
    m_object=object;
}

void JSWrapperData::clean( void )
{
    m_string=std::string( "" );
    if ( m_object ) delete m_object;
    m_object=0;
    m_number=0;
    m_bool=false;
    m_type=Undefined;
}
    
void JSWrapperArguments::append( JSWrapperObject *object )
{
    JSWrapperData data; 

    data.setObject( new JSWrapperObject( object ) );
    m_args.push_back( data );
}   