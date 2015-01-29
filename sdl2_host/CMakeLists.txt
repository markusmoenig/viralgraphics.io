# Based on http://www.willusher.io/sdl2%20tutorials/2014/03/06/lesson-0-cmake/

cmake_minimum_required(VERSION 2.6)

project(VisualGraphics)

# Addd zlib as subproject

set(ZLIB_DIR "${VisualGraphics_SOURCE_DIR}/deps/zlib")
set(ZLIB_BUILD_DIR "${VisualGraphics_BINARY_DIR}/deps/zlib")
add_subdirectory(${ZLIB_DIR})


include_directories(${ZLIB_DIR} ${ZLIB_BUILD_DIR})

# Add libpng as subproject
set(PNG_STATIC on)
set(PNG_SHARED off)
set(PNG_TESTS off)
set(PNG_DIR "${VisualGraphics_SOURCE_DIR}/deps/libpng")
set(PNG_BUILD_DIR "${VisualGraphics_BINARY_DIR}/deps/libpng")
add_subdirectory(${PNG_DIR})


include_directories(${PNG_DIR} ${PNG_BUILD_DIR})
link_directories("${PNG_BUILD_DIR}/.lib")



# Add libjpg as subproject
set(LIBJPEG_DIR "${VisualGraphics_SOURCE_DIR}/deps/libjpeg")
set(LIBJPEG_BUILD_DIR "${VisualGraphics_BINARY_DIR}/deps/libjpeg")
add_subdirectory(${LIBJPEG_DIR})


include_directories(${LIBJPEG_DIR} ${LIBJPEG_BUILD_DIR})



# Use our modified FindSDL2* modules
set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "${VisualGraphics_SOURCE_DIR}/cmake")
# Set an output directory for our binaries
set(BIN_DIR ${VisualGraphics_SOURCE_DIR}/bin)

# Bump up warning levels appropriately for clang, gcc & msvc
# Also set debug/optimization flags depending on the build type. IDE users choose this when
# selecting the build mode in their IDE
if (${CMAKE_CXX_COMPILER_ID} STREQUAL "GNU" OR ${CMAKE_CXX_COMPILER_ID} STREQUAL "Clang")
    # Too many warnings...
    #set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -pedantic -std=c++11")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")
    set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS} -g")
    set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS} -O2")
elseif (${CMAKE_CXX_COMPILER_ID} STREQUAL "MSVC")
    if (CMAKE_CXX_FLAGS MATCHES "/W[0-4]")
        string(REGEX REPLACE "/W[0-4]" "/W4" CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS}")
    else()
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /W4")
    endif()
endif()

## Sources
 
set ( SOURCES main.cpp image_loader.cpp jshost.cpp jshost_funcs.cpp shader.cpp gpubuffer.cpp rendertarget.cpp texture.cpp )

# So the compiler knows when to re-compile on header change
set ( HEADERS gl.hpp image_loader.hpp jshost.hpp shader.hpp gpubuffer.hpp rendertarget.hpp texture.hpp )




## SDL2

find_package(SDL2 REQUIRED)
include_directories(${SDL2_INCLUDE_DIR})


set( SM_INCLUDE_DIR "${SM_DIR}/dist/include")
include_directories(${SM_INCLUDE_DIR})

set( SM_LIBRARIES "-L${SM_DIR}/dist/lib -ljs_static")




## Apple / Mac OSX specific
if (${APPLE})

    ## OpenGL
    find_package(OpenGL REQUIRED)

    set( SM_LIBRARIES ${SM_LIBRARIES} "libz.dylib" )


elseif(${UNIX})
    
    set( OPENGL_LIBRARIES "-lGLESv2") 
    set( SM_LIBRARIES "${SM_LIBRARIES} -lz -ldl -lpthread")

elseif(${WIN32})



    set( OPENGL_LIBRARIES "opengl32.lib" "${GLEW_DIR}/lib/Release/Win32/glew32.lib" )
    include_directories( "${GLEW_DIR}/include" )

    set( SM_LIBRARIES
         "winmm.lib" 
         "psapi.lib"
         "${MOZILLA-BUILD_DIR}/msys/local/lib/nspr4.lib"
         "${MOZILLA-BUILD_DIR}/msys/local/lib/plc4.lib"
         "${MOZILLA-BUILD_DIR}/msys/local/lib/plds4.lib"
         "${SM_DIR}/dist/lib/mozjs-31.lib")

endif()


###
add_executable( VisualGraphics MACOSX_BUNDLE ${HEADERS} ${SOURCES} )
target_link_libraries( VisualGraphics jpeg_static png16_static zlibstatic ${SDL2_LIBRARY} ${SDL2MAIN_LIBRARY} ${OPENGL_LIBRARIES} ${SM_LIBRARIES} )
