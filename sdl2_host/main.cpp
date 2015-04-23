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

#include <SDL.h>

#include "gl.hpp"
#include <string>

#include <SDL_syswm.h>

#include "jshost.hpp"
#include "jsfriendapi.h"


#ifdef __VG_WITH_EMBREE
#include "tracer/tracer.h"
#endif


#ifdef __APPLE__
    const char *getPath_cocoa( int type );
    void init_cocoa( void );
#endif

/* The class of the global object. */
static JSClass globalClass = {
    "global",
    JSCLASS_GLOBAL_FLAGS,
    JS_PropertyStub,
    JS_DeletePropertyStub,
    JS_PropertyStub,
    JS_StrictPropertyStub,
    JS_EnumerateStub,
    JS_ResolveStub,
    JS_ConvertStub,
    nullptr, nullptr, nullptr, nullptr,
    JS_GlobalObjectTraceHook
};

// The error reporter callback.
void reportError(JSContext *cx, const char *message, JSErrorReport *report) {
     fprintf(stderr, "%s:%u:%s\n",
             report->filename ? report->filename : "[no filename]",
             (unsigned int) report->lineno,
             message);
}
 
unsigned int timerCallback(unsigned int interval, void *param);
int SDLKeyCodeToVG( int code );
 
bool g_redraw=true;
int g_width = 1400;
int g_height = 1000;
 
const char *g_appNameChars=0;
const char *g_appVersionChars=0;
 
SDL_SysWMinfo g_wmInfo;

std::string vgDir = "./";

int main(int argc, char** argv)
{
	bool rawApp = false;

    char cmdbuffer[256];        
    int rc=0;

    // --- Initialize SpiderMonkey

    if (!JS_Init()) return 1;

    JSRuntime *rt = JS_NewRuntime(8L * 1024 * 1024 * 10, JS_USE_HELPER_THREADS );
    if (!rt) return 1;

    JSContext *cx = JS_NewContext(rt, 8192);
    if (!cx) return 1;

    JS_SetErrorReporter(cx, reportError);

    JSAutoRequest ar(cx);

    RootedObject global(cx );
    global = JS_NewGlobalObject(cx, &globalClass, nullptr, JS::DontFireOnNewGlobalHook);    
    if (!global) return 1;

    JSAutoCompartment ac(cx, global);    
    JS_InitStandardClasses(cx, global);

    //JSCompartment *compartment = js::GetContextCompartment( cx );
    //if(compartment != NULL) JS_SetVersionForCompartment( compartment, JSVERSION_LATEST );

    // --- Setup JSHost and the VG Namespace

    const char *vgLibPath=0;

#ifdef __APPLE__
    vgLibPath=getPath_cocoa( 0 );
#endif

    if ( vgLibPath )
    {
        vgDir=vgLibPath;
    } else
    if ( argc > 1 )
    {
        vgDir = argv[1];
    }
 
    JSHost *jsHost=new JSHost( cx, &global, vgDir.c_str() );

    // --- Setup VGLib

    if ( !jsHost->setupVG() ) {
        delete jsHost;

        //JS_DestroyContext(cx);
        JS_DestroyRuntime(rt);
        JS_ShutDown();

        //SDL_GL_DeleteContext(glcontext);
        //SDL_DestroyWindow(window);
        //SDL_Quit(); 
    } 
 
     // --- Load the app

    std::string appSource = "apps/view3d.js";

    const char *projectPath=0;

#ifdef __APPLE__
    projectPath=getPath_cocoa( 1 );
#endif

    bool absolutePath=false;

    if ( projectPath )
    {
        appSource = projectPath;
        absolutePath=true;
    } else
    if (argc > 2) {
        appSource = argv[2];
    }

    //only allow to run js apps in debug builds
//#ifdef _DEBUG
    if (appSource.find_last_of(".js") != std::string::npos)
    {
	    rawApp = true;
	    std::cout << "Running raw .js app" << std::endl;
    }
//#endif

	//clear any error up to this point
	

    if (rawApp)
    {
	    const char* dummyAppSource = "VG.App = {};";
	    jsHost->executeScript(dummyAppSource);
    }
	
	jsHost->addVGLibSourceFile(appSource.c_str(), absolutePath);
	
    // --- Settup SDL2

    SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
    SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 16); 

	if (SDL_Init(SDL_INIT_VIDEO) != 0) {
		std::cout << "SDL_Init Error: " << SDL_GetError() << std::endl;
		return 1;
	}

#ifdef __VG_OPENGL3__

    //Windows and OSX
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_CORE);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 3);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 2);

    SDL_GL_SetAttribute(SDL_GL_MULTISAMPLEBUFFERS, 1);
    SDL_GL_SetAttribute(SDL_GL_MULTISAMPLESAMPLES, 16);

#else

    SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_ES);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 2);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 0);
    
    SDL_GL_SetAttribute(SDL_GL_MULTISAMPLEBUFFERS, 1);
    SDL_GL_SetAttribute(SDL_GL_MULTISAMPLESAMPLES, 8);

#endif

    // --- Composing the Window Title

    RootedValue *value=jsHost->executeScript( "VG.Utils.decompressFromBase64( VG.App.name );" );
    JSString *name = value->toString();
    g_appNameChars=JS_EncodeString( cx, name );

    value=jsHost->executeScript( "VG.Utils.decompressFromBase64( VG.App.version );" );
    JSString *version = value->toString();
    g_appVersionChars=JS_EncodeString( cx, version );  

    sprintf( cmdbuffer, "%s v%s", g_appNameChars, g_appVersionChars );

    // --- Creating the Window

    SDL_Window *window=SDL_CreateWindow( cmdbuffer, SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, g_width, g_height, SDL_WINDOW_OPENGL|SDL_WINDOW_RESIZABLE | SDL_WINDOW_HIDDEN );
	if (window == nullptr) {
		std::cout << "SDL_CreateWindow Error: " << SDL_GetError() << std::endl;
		SDL_Quit();
		return 1;
	}

    SDL_GLContext glcontext=SDL_GL_CreateContext(window);
	if (glcontext == nullptr) {
		std::cout << "SDL_GL_CreateContext Error: " << SDL_GetError() << std::endl;
		SDL_Quit();
		return 1;
	}    

    SDL_GetWindowWMInfo(window, &g_wmInfo);    
	SDL_VERSION(&g_wmInfo.version);

#ifdef __APPLE__
    init_cocoa();
#endif

    // ---

    //glClearColor( 0, 0, 0, 0 );
    //glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);	    
 
    printf("----------------------------------------------------------------\n");
    printf("Graphics Successfully Initialized\n");
    printf("OpenGL Info\n");
    printf("    Version: %s\n", glGetString(GL_VERSION));
    printf("     Vendor: %s\n", glGetString(GL_VENDOR));
    printf("   Renderer: %s\n", glGetString(GL_RENDERER));
    printf("    Shading: %s\n", glGetString(GL_SHADING_LANGUAGE_VERSION));
    printf("----------------------------------------------------------------\n");

#ifdef _WIN32
    if (glewInit() != GLEW_OK)
    {
		std::cout << "GLEW failed to initialize" << std::endl;
		SDL_Quit();
        return 1;
    }
#endif
 
	//clear any gl error
	while (glGetError() != GL_NO_ERROR) {}

    sprintf( cmdbuffer, "VG.context.workspace=VG.UI.Workspace(); VG.context.workspace.resize( %d, %d );", g_width, g_height );
    jsHost->executeScript( cmdbuffer );

    // --- Unpack the content of the VIDE Project and execute vgMain

    std::string unpackAndRunApp=""
    "// --- Add the images of the project to the image pool\n"
        "for (var imageName in VG.App.images )  {\n"
            "var image=new VG.Core.Image();\n"
            "image.name=imageName;\n"

            "VG.decompressImageData( VG.App.images[imageName], image );\n"
            "VG.context.imagePool.addImage( image );\n"
        "}\n"
    "// --- Eval the sources of the App stored in the VG.App Namespace\n"
    "for (var sourceName in VG.App.sources )  {\n"
        "var decodedSource=VG.Utils.decompressFromBase64( VG.App.sources[sourceName] );\n"
        "eval( decodedSource );\n"

        "try {\n"
            "eval( decodedSource );\n"
        "} catch ( e ) {\n"
            "success=false;\n"
            "VG.print( e.message.toString() );\n"
        "}\n"
    "}\n"
    
    "// --- Load the Fonts of the project\n"
    "for (var fontName in VG.App.fonts )\n"
    "{\n"
        "var decodedFont=VG.Utils.decompressFromBase64( VG.App.fonts[fontName] );\n"

        "try {\n"
            "eval( decodedFont );\n"
        "} catch ( e ) {\n"
            "success=false;\n"
            "VG.print( e.message.toString() );\n"
        "}\n"
    "}\n"
    "VG.fontManager.addFonts();\n"
    "vgMain.call( VG.context, VG.context.workspace, 0, [] );";

    jsHost->executeScript( unpackAndRunApp.c_str() );

    // --- Show the Window
    value=jsHost->executeScript( "VG.context.workspace.tick( true );" );                
    if ( value && value->toBoolean() ) SDL_GL_SwapWindow( window );
    SDL_ShowWindow( window );

    // --- Event Loop
    
    bool quit = false;
    SDL_Event event;

    while( !quit )
    {
        //JS_MaybeGC( cx );

        while (SDL_PollEvent(&event)) 
        {
            switch( event.type )
            {
                case SDL_WINDOWEVENT:
                    if( event.window.event == SDL_WINDOWEVENT_RESIZED )
                    {
                        g_width=event.window.data1; g_height=event.window.data2;
                    
                        sprintf( cmdbuffer, "VG.context.workspace.resize( %d, %d );", g_width, g_height );
					   jsHost->executeScript( cmdbuffer );
                    
                        g_redraw=true;
                    }
                break;
         
                case SDL_KEYDOWN:
                {
                    int keyCode=SDLKeyCodeToVG( event.key.keysym.sym );

                    if ( keyCode != -1 ) {
            	       sprintf( cmdbuffer, "VG.context.workspace.keyDown( %d );", keyCode );
				        jsHost->executeScript( cmdbuffer );
                    }
                }
                break;

                case SDL_KEYUP:
                {
                    int keyCode=SDLKeyCodeToVG( event.key.keysym.sym );

                    if ( keyCode != -1 ) {
                        sprintf( cmdbuffer, "VG.context.workspace.keyUp( %d );", keyCode );
                        jsHost->executeScript( cmdbuffer );
                    }
                }
                break;            
                
                case SDL_TEXTINPUT:
                {
                    RootedValue *workspace=jsHost->executeScript( "VG.context.workspace" );
                    RootedObject workspaceObject( cx, &workspace->toObject() );

                    JSString *input = JS_NewStringCopyN( cx, event.text.text, strlen(event.text.text));

                    RootedValue rc( cx );    
                    RootedValue inputValue( cx ); inputValue.setString( input );

                    bool ok=Call( cx, HandleObject( workspaceObject ), "textInput", HandleValueArray( inputValue ), MutableHandleValue( &rc ) ); 
                }
                break;
                
                case SDL_MOUSEMOTION:
                {
            	   sprintf( cmdbuffer, "VG.context.workspace.mouseMove( %d, %d );", event.motion.x, event.motion.y );
				    jsHost->executeScript( cmdbuffer );
                }
                break;
               
                case SDL_MOUSEBUTTONDOWN:
                {
                    switch (event.button.button)
                    {
                        case SDL_BUTTON_LEFT:
                        {
                            const char *code=0;
                        
                            if ( event.button.clicks != 2 ) code="VG.context.workspace.mouseDown( VG.Events.MouseButton.Left );";
                            else code="VG.context.workspace.mouseDoubleClick();";

						  jsHost->executeScript( code );
                        }
                        break;
                        
                        case SDL_BUTTON_RIGHT:
                        {
                    	   jsHost->executeScript( "VG.context.workspace.showContextMenu();" );
                        }
                        break;
                    }
                }
                break;
            
                case SDL_MOUSEBUTTONUP:
                {
                    switch (event.button.button)
                    {
                        case SDL_BUTTON_LEFT:
                        {
                    	   jsHost->executeScript( "VG.context.workspace.mouseUp( VG.Events.MouseButton.Left );" );
                        }
                    }
                }
                break;

                case SDL_MOUSEWHEEL:
                {
                    if ( event.wheel.y < 0)
                        jsHost->executeScript( "VG.context.workspace.mouseWheel( -1 );" );
                    else
                        jsHost->executeScript( "VG.context.workspace.mouseWheel( 1 );" );
                }
                break;
         
                case SDL_QUIT:
                    quit=true;
                break;
            }
        }

        const char *code;

        if ( g_redraw ) code="VG.context.workspace.tick( true );";
        else code="VG.context.workspace.tick( false );";
                
        Rooted<Value> *rc=jsHost->executeScript( code );
            
        if ( rc && rc->toBoolean() ) 
        {
            SDL_GL_SwapWindow(window);
            SDL_Delay( 1 );
        } else SDL_Delay( 10 );

        g_redraw=false; 
    }    

    JS_free( cx, (void *) g_appNameChars ); JS_free( cx, (void *) g_appVersionChars );

    // --- Cleanup

    SDL_GL_DeleteContext(glcontext);
    SDL_DestroyWindow(window);
    SDL_Quit();	

    //JS_DestroyContext(cx);
    JS_DestroyRuntime(rt);
    JS_ShutDown();

#ifdef __VG_WITH_EMBREE
    Tracer::cleanUp();
#endif

	delete jsHost;

    return 0;    
}

int SDLKeyCodeToVG( int code )
{
/*
VG.Events.KeyCodes={ "Backspace" : 8, "Tab" : 9, "Enter" : 13, "Shift" : 16, "Ctrl" : 17, "Alt" : 18, "Pause" : 19,
    "CapsLock" : 20, "Esc" : 27,  "Space" : 32, "PageUp" : 33, "PageDow" : 34, "End" : 35, "Home" : 36, "ArrowLeft" : 37, "ArrowUp" : 38,
     "ArrowRight" : 39,  "ArrowDown" : 40,  "PrintScrn" : 44,  "Insert" : 45,  "Delete" : 46, 
     "0" : 48, "1" : 49, "2" : 50, "3" : 51, "4" : 52, "5" : 53, "6" : 54, "7" : 55, "8" : 56, "9" : 57, 
     "A" : 65, "B" : 66, "C" : 67, "D" : 68, "E" : 69, "F" : 70, "G" : 71, "H" : 72, "I" : 73, "J" : 74,
     "K" : 75, "L" : 76, "M" : 77, "N" : 78, "O" : 79, "P" : 80, "Q" : 81, "R" : 82, "S" : 83, "T" : 84,
     "U" : 85, "V" : 86, "W" : 87, "X" : 88, "Y" : 89, "Z" : 90,
     "AppleLeft" : 91, "AppleRight" : 93,
     "F1" : 112, "F2" : 113, "F3" : 114, "F4" : 115, "F5" : 116, "F6" : 117, "F7" : 118, "F8" : 119, "F9" : 120, "F10" : 121,
     "F11" : 122, "F11" : 123,
     "NumLock" : 144, "ScrollLock" : 145
    };*/

    int keyCode=-1;

    //printf( "code=%d\n", code );

    if ( code <= 127 && code != 39 ) return code;
                
    if ( code == 1073741906 ) keyCode=38; // Arrow Up
    if ( code == 1073741905 ) keyCode=40; // Arrow Down
    if ( code == 1073741904 ) keyCode=37; // Arrow Left
    if ( code == 1073741903 ) keyCode=39; // Arrow Right

    if ( code == 1073742048 ) keyCode=17; // Control
    if ( code == 1073742049 ) keyCode=16; // Shift
    if ( code == 1073742050 ) keyCode=18; // Alt
    if ( code == 1073742051 ) keyCode=91; // Apple Left

    return keyCode;
}
