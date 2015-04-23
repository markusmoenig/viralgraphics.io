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

#include <iostream>

#include "jshost.hpp"

JSHost *g_host=0;

// --- Externals

void registerVGFunctions( JSContext *cx, JSObject *vgObject );

JSObject *registerShader( JSContext *cx, JSObject *vgObject );
JSObject *registerGPUBuffer( JSContext *cx, JSObject *vgObject );
JSObject *registerRenderTarget( JSContext *cx, JSObject *vgObject );
JSObject *registerTexture( JSContext *cx, JSObject *vgObject );

#ifdef __VG_WITH_EMBREE
void registerTracer(JSContext *cx, JSObject *vgRenderObject);
#endif

// ---

JSHost::JSHost( JSContext *cx, RootedObject *global, const char *path ) : rcValue( cx )
{
    this->cx=cx;
    this->global=global;
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

    RootedValue *value=this->executeScript( chars, libSourceFile );
    delete chars;

    return true;
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
    success=addVGLibSourceFile( "vglib/vg-renderer.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/vg-canvas.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/vg-docs.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/vg-events.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/vg-shortcut.js" ); if ( !success ) return false;

    // --- Register Host Functions

    RootedValue* rc=this->executeScript( "VG" );
    JSObject *vgObject=&rc->toObject();

    registerVGFunctions( cx, vgObject );

    // --- Register Host Render functions

    rc = this->executeScript("VG.Render");
    JSObject *vgRenderObject = &rc->toObject();

#ifdef __VG_WITH_EMBREE
    // --- Only register the tracer if we're linking against embree
    registerTracer(cx, vgRenderObject);
#endif


    // ---

    success=addVGLibSourceFile( "vglib/db/vg-db.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/db/vg-folder.js" ); if ( !success ) return false;

    success=addVGLibSourceFile( "vglib/ui/vg-defines.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/styles/visualgraphics/vg-style.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/styles/multimedia/vg-style.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-widgets.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-menu.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-listwidget.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-treewidget.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-textwidgets.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/ui/vg-htmlview.js" ); if ( !success ) return false;
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

    success=addVGLibSourceFile( "vglib/render/vg-material.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/render/vg-pipeline.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/render/vg-scene.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/render/vg-camera.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/render/vg-mesh.js" ); if ( !success ) return false;

    success=addVGLibSourceFile( "vglib/utils/vg-compressor.js" ); if ( !success ) return false;
    success=addVGLibSourceFile( "vglib/utils/vg-utils.js" ); if ( !success ) return false;

    registerShader( cx, vgObject );
    this->executeScript( "VG.Shader.Blend = { None: 0, Alpha: 1 } " );
    registerGPUBuffer( cx, vgObject );
    registerRenderTarget( cx, vgObject );
    registerTexture( cx, vgObject );
    this->executeScript( "VG.Texture.Wrap = { Clamp: 0, Repeat: 1 };" );
    this->executeScript( "VG.Texture.Filter = { None: 0, Linear: 1, Bilinear: 2, Trilinear: 3, Anisotropic: 4 };" );

    return success;
}

Rooted<Value> *JSHost::executeScript( const char *script, const char *fileName )
{
    MutableHandleValue v( &rcValue );

    bool ok = JS_EvaluateScript( cx, *global, script, strlen(script), fileName, 1, v );

    if ( !ok ) return 0;
    return &rcValue;
}
