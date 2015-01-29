/*
 * (C) Copyright 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>, Luis Jimenez <kuko@kvbits.com>.
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
 * You should have received a copy of the GNU General Public License
 * along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

#include <jsapi.h>

using namespace JS;

class JSHost 
{

public:

	JSHost( JSContext *cx, RootedObject *global, const char *path );
	~JSHost();

	bool addVGLibSourceFile( const char * );
	Rooted<Value>* executeScript( const char *, const char *fileName="unknown" );

	bool setupVG( void );

protected:

private:

	JSContext                *cx; 	
	RootedObject             *global;

	const char               *vgPath;

	RootedValue              rcValue;
};
