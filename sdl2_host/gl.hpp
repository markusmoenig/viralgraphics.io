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
 * You should have received a copy of the GNU Lesser General Public License
 * along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

#ifndef __GL_INCLUDED
#define __GL_INCLUDED

#define GL_GLEXT_PROTOTYPES 1

#ifdef __APPLE__
    #include <OpenGL/gl3.h>
   
    //make sure we explicitly know the usage of opengl3
    #define __VG_OPENGL3__ 1
#elif _WIN32
    
    #define __VG_OPENGL3__ 1
    #include <GL/glew.h>
    

#endif



#include <SDL.h>

#ifdef __VG_OPENGL3__
    #include <SDL_opengl.h>
#else    
    #include <SDL_opengles2.h>
#endif


#include <assert.h>


#define GL_ASSERT() assert(checkGLError(__FILE__, __LINE__))

inline bool checkGLError( char* file, int line )
{
    GLenum glErr = glGetError();

    if ( glErr != GL_NO_ERROR )
    {
        printf("glError in file %s @ line %d: Code = %d\n", file, line, glErr);
        return false;
    }

    return true;
}



#endif
