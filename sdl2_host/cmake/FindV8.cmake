# - Find V8
# Find the native V8 headers and libraries.
#
#  V8_INCLUDE_DIR -  where to find V8.h, etc.
#  V8_LIBRARIES    - List of libraries when using V8.
#  V8_FOUND        - True if V8 found.

GET_FILENAME_COMPONENT(module_file_path ${CMAKE_CURRENT_LIST_FILE} PATH )

# Look for the header file.
FIND_PATH( V8_INCLUDE_DIR NAMES v8.h
           PATHS /usr/local/include
                 $ENV{H3D_EXTERNAL_ROOT}/include  
                 $ENV{H3D_ROOT}/../External/include  
                 ../../External/include
                 ${module_file_path}/../../../External/include
           DOC "Path in which the file v8.h is located." )
MARK_AS_ADVANCED(V8_INCLUDE_DIR)

# Look for the library.
# Does this work on UNIX systems? (LINUX)
FIND_LIBRARY( V8_LIBRARY NAMES v8
              PATHS $ENV{H3D_EXTERNAL_ROOT}/lib
                    $ENV{H3D_ROOT}/../External/lib
                    ../../External/lib
                    ${module_file_path}/../../../External/lib
              DOC "Path to v8 library." )
MARK_AS_ADVANCED(V8_LIBRARY)

# Copy the results to the output variables.
IF(V8_INCLUDE_DIR AND V8_LIBRARY)
  SET(V8_FOUND 1)
  SET(V8_LIBRARIES ${V8_LIBRARY})
  SET(V8_INCLUDE_DIR ${V8_INCLUDE_DIR})
ELSE(V8_INCLUDE_DIR AND V8_LIBRARY)
  SET(V8_FOUND 0)
  SET(V8_LIBRARIES)
  SET(V8_INCLUDE_DIR)
ENDIF(V8_INCLUDE_DIR AND V8_LIBRARY)

# Report the results.
IF(NOT V8_FOUND)
  SET(V8_DIR_MESSAGE
    "V8 was not found. Make sure V8_LIBRARY and V8_INCLUDE_DIR are set.")
  IF(V8_FIND_REQUIRED)
    MESSAGE(FATAL_ERROR "${V8_DIR_MESSAGE}")
  ELSEIF(NOT V8_FIND_QUIETLY)
    MESSAGE(STATUS "${V8_DIR_MESSAGE}")
  ENDIF(V8_FIND_REQUIRED)
ENDIF(NOT V8_FOUND)
Hide details
Change log
r2 by gers...@goosemoose.com on Aug 16, 2010   Diff
First commit
Go to:  
Older revisions
All revisions of this file
File info
Size: 1669 bytes, 50 lines
View raw file
