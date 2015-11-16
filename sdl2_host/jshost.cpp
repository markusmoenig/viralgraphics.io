/*
 * Copyright (c) 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>
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

#include <iostream>

#include "jshost.hpp"

JSHost *g_host=0;

// --- Externals

void registerVGFunctions( JSWrapper *wrapper );
void registerVGFileFunctions( JSWrapper *wrapper );

JSWrapperClass *registerShader( JSWrapper * );
JSWrapperClass *registerGPUBuffer( JSWrapper * );
JSWrapperClass *registerRenderTarget( JSWrapper *);
JSWrapperClass *registerTexture( JSWrapper * );

#ifdef __VG_WITH_EMBREE
void registerTracer( JSWrapper * );
#endif

// ---

JSHost::JSHost( JSWrapper *jsWrapper, const char *path ) : m_jsWrapper( jsWrapper )
{
    this->vgPath=path;  
    g_host=this; 
}

JSHost::~JSHost()
{
}

bool JSHost::addVGLibSourceFile( const char *libSourceFile, bool absolutePath )
{
    static char path[1024];

    if ( !absolutePath ) strcpy( path, vgPath );
    else path[0]=0;

    strcat( path, libSourceFile );

    // --- Read the file

    FILE* file = fopen( path, "rb" );
    if (file == NULL)
    {
        printf("JSHost::addVGLibSourceFile - File %s not found\n", path);
        return false;
    }

    fseek(file, 0, SEEK_END);
    int size = ftell(file);
    rewind(file);

    char* chars = new char[size + 1];
    chars[size] = '\0';
    for (int i = 0; i < size;) 
    {
        int read = static_cast<int>(fread(&chars[i], 1, size - i, file));
        i += read;
    }
    fclose(file);

    // ---

    bool rc=m_jsWrapper->execute( chars, NULL, libSourceFile );
    delete chars;

    return rc;
}

bool JSHost::setupVG( void )
{
    bool success=false;
    success=addVGLibSourceFile( "vglib/utils/typeface-0.15.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "fonts/open_sans/open_sans_semibold.typeface.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "fonts/open_sans/open_sans_semibold_italic.typeface.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "fonts/open_sans/open_sans_bold.typeface.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "fonts/roboto/roboto_regular.typeface.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "fonts/visualgraphics_regular.typeface.js" ); if ( !success ) return false;

    success=addVGLibSourceFile( "vglib/vg-defines.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/vg-core.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/vg-math.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/vg-data.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/vg-undo.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/vg-controller.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/vg-font.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/vg-sax.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/vg-svg.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/vg-renderer.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/vg-canvas.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/vg-docs.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/vg-events.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/vg-shortcut.js" ); if ( !success ) return false;

    // --- Register Host Functions

    registerVGFunctions( m_jsWrapper );

#ifdef __VG_WITH_EMBREE
    // --- Register Host Render functions
    registerTracer( m_jsWrapper );
#endif

    // ---

    success=addVGLibSourceFile( "vglib/db/vg-db.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/db/vg-folder.js" ); if ( !success ) return false;

    success=addVGLibSourceFile( "vglib/utils/vg-compressor.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/utils/vg-utils.js" ); if ( !success ) return false;

    success=addVGLibSourceFile( "vglib/ui/vg-defines.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/styles/visualgraphics/vg-desktop.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/styles/visualgraphics/desktop_gray/vg-skin.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-widgets.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-menu.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-listwidget.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-treewidget.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-textwidgets.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-htmlview.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-numericalwidgets.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-toolbar.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-toolpanel.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-layout.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-tablewidget.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-window.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-dockwidget.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-workspace.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-workspace_dialogs.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-scroller.js" ); if ( !success ) return false;

    success=addVGLibSourceFile( "vglib/nodes/vg-controller.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/nodes/vg-parameter.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/nodes/vg-terminal.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/nodes/vg-node.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/nodes/vg-nodes.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/nodes/vg-material.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/nodes/vg-graph.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/nodes/vg-parameteredit.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/nodes/vg-graphedit.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/nodes/vg-materialwidget.js" ); if ( !success ) return false;

    success=addVGLibSourceFile( "vglib/render/vg-material.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/render/vg-pipeline.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/render/vg-scene.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/render/vg-camera.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/render/vg-mesh.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/render/vg-light.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/render/vg-import.js" ); if ( !success ) return false;

    registerShader( m_jsWrapper );
    m_jsWrapper->execute( "VG.Shader.Blend = { None: 0, Alpha: 1 } " );
    registerGPUBuffer( m_jsWrapper );
    registerRenderTarget( m_jsWrapper );
    registerTexture( m_jsWrapper );
    m_jsWrapper->execute( "VG.Texture.Wrap = { Clamp: 0, Repeat: 1 };" );
    m_jsWrapper->execute( "VG.Texture.Filter = { None: 0, Linear: 1, Bilinear: 2, Trilinear: 3, Anisotropic: 4 };" );

    // --- Register VG.File which is only available on Desktop Implementations

    m_jsWrapper->execute( "VG.File={};" );
    registerVGFileFunctions( m_jsWrapper );

    return success;
}
