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

#ifndef __JSWRAPPER_DATA_SM_HPP
#define __JSWRAPPER_DATA_SM_HPP

#include <vector>
#include <string>

class JSWrapperObject;

class JSWrapperData
{
public:

    enum Type
    {
    	Undefined = 0,
    	Null,
    	Number,
    	Boolean,
    	String,
    	Object
	};

  	JSWrapperData( const JSWrapperData& data )
  	{ 
  		m_object=0;
	    *this=data;
  	}	

  	JSWrapperData& operator=( const JSWrapperData& data );

	JSWrapperData( void )
	{
		m_object=0;
		clean();
	}

	JSWrapperData( Type type )
	{
		m_object=0;
		clean();
		m_type=type;
	}	

    Type type( void ) { return m_type; }
    JSWrapperObject *object( void ) { return m_object; }

   	void setUndefined( void )
   	{
   		clean();
   		m_type=Undefined;
   	}

   	void setNull( void )
   	{
   		clean();
   		m_type=Null;
   	}   	

   	void setBoolean( const bool& value )
   	{
   		clean();   		
   		m_type=Boolean;
   		m_bool=value;
   	}

   	void setNumber( const double& value )
   	{
   		clean();   		
   		m_type=Number;
   		m_number=value;
   	}

   	void setString( const char *value )
   	{
   		clean();   		
   		m_type=String;
   		m_string=std::string( value );
   	}

   	void setString( const std::string& value )
   	{
   		clean();   		
   		m_type=String;
   		m_string=value;
   	}   	

   	void setObject( JSWrapperObject *object );

   	double toNumber( void )
   	{
   		if ( m_type == Number ) return m_number;
   		else
   		{
            // --- Do intellegent conversion in the future
            return m_number;
   		}
   	}

   	bool toBoolean( void )
   	{
   		if ( m_type == Boolean ) return m_bool;
   		else
   		{
            // --- Do intellegent conversion in the future
            return m_bool;   			
   		}
   	}

   	std::string toString( void )
   	{
   		if ( m_type == String ) return m_string;
   		else
   		{
            // --- Do intellegent conversion in the future
            return m_string;
   		}
   	}

    bool isNumber( void ) { return m_type == Number; }
    bool isString( void ) { return m_type == String; }
    bool isObject( void ) { return m_type == Object; }
    bool isBoolean( void ) { return m_type == Boolean; }
    bool isUndefined( void ) { return m_type == Undefined; }
    bool isNull( void ) { return m_type == Null; }

   	void clean();

	~JSWrapperData()
	{
		clean();
	}
        
private:

    Type                     m_type;

	bool                     m_bool;
	double                   m_number;
	std::string              m_string;
	JSWrapperObject         *m_object;
};

class JSWrapperArguments
{
public:

	JSWrapperArguments( void ) {}

    JSWrapperData& operator[] (int i) {
        return m_args[i];
    }

	JSWrapperData& at( int index )
	{
		return m_args.at( index );
	}

    int count( void )
    {
        return m_args.size();
    }

	void append( void )
	{
		JSWrapperData data;		
		m_args.push_back( data );
	}

	void append( JSWrapperData::Type type )
	{
		JSWrapperData data( type );		
		m_args.push_back( data );
	}	

	void append( double value )
	{
		JSWrapperData data; data.setNumber( value );
		m_args.push_back( data );
	}

	void append( const std::string& value )
	{
		JSWrapperData data; data.setString( value );		
		m_args.push_back( data );
	}	

	void append( bool value )
	{
		JSWrapperData data; data.setBoolean( value );		
		m_args.push_back( data );
	}

	void append( JSWrapperObject *object );

private:

	std::vector<JSWrapperData> m_args;
};

#endif
