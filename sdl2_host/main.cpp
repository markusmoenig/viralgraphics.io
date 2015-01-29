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

#include <iostream>

#include <SDL.h>

#include "gl.hpp"
#include <string>

#include <SDL_syswm.h>

#include "jshost.hpp"
#include "jsfriendapi.h"

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

bool g_redraw=true;
std::string vgDir = "./";

int main(int argc, char** argv)
{
	int width = 1024, height = 768;
    int rc=0;

    // --- Initialize SpiderMonkey

    if (!JS_Init()) return 1;

    JSRuntime *rt = JS_NewRuntime(8L * 1024 * 1024 * 10, JS_NO_HELPER_THREADS );
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
    
    SDL_Window *window=SDL_CreateWindow( "Visual Graphics Application Framework", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, width, height, SDL_WINDOW_OPENGL|SDL_WINDOW_RESIZABLE);
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

	SDL_SysWMinfo wmInfo;
	SDL_VERSION(&wmInfo.version);

    glClearColor( 0, 0, 0, 0 );
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);	    
 
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

    // --- Setup JSHost and the VG Namespace

    if ( argc > 1 )
    {
        vgDir = argv[1];
    }

    JSHost *jsHost=new JSHost( cx, &global, vgDir.c_str() );

	// --- Setup VGLib

	if ( !jsHost->setupVG() ) {
		delete jsHost;

        JS_DestroyContext(cx);
        JS_DestroyRuntime(rt);
        JS_ShutDown();

        SDL_GL_DeleteContext(glcontext);
        SDL_DestroyWindow(window);
        SDL_Quit(); 
	}

	// --- Setup workspace and execute the app

    std::string appSource = "apps/addressbook.vide";

    if (argc > 2)
    {
        appSource = argv[2];
    }

    jsHost->executeScript( "VG.context.workspace=VG.UI.Workspace(); VG.context.workspace.resize( 1024, 768 );" );
    jsHost->addVGLibSourceFile( appSource.c_str() );

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
    "vgMain.call( VG.context, VG.context.workspace );";

    jsHost->executeScript( unpackAndRunApp.c_str() );
 
    // ---

    SDL_GL_SwapWindow( window );

	// --- Launch the timer
    SDL_AddTimer( 1000.0 / 60.0, timerCallback, 0 );

    // --- Event Loop
    
    char cmdbuffer[256];    
    bool quit = false;
    SDL_Event event;

    while( !quit )
    {
        JS_MaybeGC( cx );        
        SDL_WaitEvent(&event);

        switch( event.type )
        {
            case SDL_WINDOWEVENT:
                if( event.window.event == SDL_WINDOWEVENT_RESIZED )
                {
                    width=event.window.data1; height=event.window.data2;
                    
                    sprintf( cmdbuffer, "VG.context.workspace.resize( %d, %d );", width, height );
					jsHost->executeScript( cmdbuffer );
                    
                    g_redraw=true;
                }
                break;
         
            case SDL_KEYDOWN:
            {
                int keyCode=event.key.keysym.sym;
                
                if ( keyCode == 1073741906 ) keyCode=38; // Arrow Up
                if ( keyCode == 1073741905 ) keyCode=40; // Arrow Down
                if ( keyCode == 1073741904 ) keyCode=37; // Arrow Left
                if ( keyCode == 1073741903 ) keyCode=39; // Arrow Right

            	sprintf( cmdbuffer, "VG.context.workspace.keyDown( %d );", keyCode );
				jsHost->executeScript( cmdbuffer );
            }
            break;
                
            case SDL_TEXTINPUT:
            {
                sprintf( cmdbuffer, "VG.context.workspace.textInput( \"%s\" );", event.text.text );
				jsHost->executeScript( cmdbuffer );
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
                        char *code=0;
                        
                        if ( event.button.clicks == 1 ) code="VG.context.workspace.mouseDown( VG.Events.MouseButton.Left );";
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
                 
            case SDL_USEREVENT:
            {                  
                const char *code;

                if ( g_redraw ) code="VG.context.workspace.tick( true );";
                else code="VG.context.workspace.tick( false );";
                
				Rooted<Value> *rc=jsHost->executeScript( code );
                
                if ( rc && rc->toBoolean() )
             	  SDL_GL_SwapWindow(window);

                g_redraw=false;

            }
            break;
         
            case SDL_QUIT:
                quit=true;
                break;
        }
    }    

    // --- Cleanup

    SDL_GL_DeleteContext(glcontext);
    SDL_DestroyWindow(window);
    SDL_Quit();	

    //JS_DestroyContext(cx);
    JS_DestroyRuntime(rt);
    JS_ShutDown();

	delete jsHost;

    return 0;
}

// --- SDL2 Timer Callback

unsigned int timerCallback(unsigned int interval, void *param)
{
    SDL_Event event;
    SDL_UserEvent userevent;
    
    // ---
    
    userevent.type = SDL_USEREVENT;
    userevent.code = 0;
    userevent.data1 = NULL;
    userevent.data2 = NULL;
    
    event.type = SDL_USEREVENT;
    event.user = userevent;
    
    SDL_PushEvent(&event);
    return(interval);
}
