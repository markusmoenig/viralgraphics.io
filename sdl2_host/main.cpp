/*
 * Copyright (c) 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>, Luis Jimenez <kuko@kvbits.com>.
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

#include <SDL.h>

#include "gl.hpp"
#include <string>

#include <SDL_syswm.h>

#ifdef __VG_WITH_EMBREE
#include "tracer/tracer.h"
#endif

#ifdef __APPLE__
    const char *getPath_cocoa( int type );
    void init_cocoa( void );
#endif

#ifdef _WIN32
    FILE _iob[] = {*stdin, *stdout, *stderr};
    extern "C" FILE * __cdecl __iob_func(void)
    {
        return _iob;
    }
#endif

#include "jshost.hpp"

unsigned int timerCallback(unsigned int interval, void *param);
int SDLKeyCodeToVG( int code );
 
bool g_redraw=true;
int g_width = 1400;
int g_height = 1000;
bool g_quit = false;

std::string g_appName;
std::string g_appVersion;
 
SDL_SysWMinfo g_wmInfo;

std::string vgDir = "./";

int main(int argc, char** argv)
{
	bool rawApp = false;

    char cmdbuffer[256];        
    int rc=0, argOffset=1;

    // --- Setup JS Wrapper

    JSWrapper jsWrapper( argv[0] );
    if ( !jsWrapper.isValid() ) {
        printf("Unable to Initialize JavaScript Wrapper.\n");
        return 1;
    }

    // --- Setup JSHost and the VG Namespace

    const char *vgLibPath=0;
 
#ifdef __APPLE__
    vgLibPath=getPath_cocoa( 0 );
#endif

    if ( vgLibPath )
    {
        vgDir=vgLibPath;
    } else
    if ( argc > 1 ) {
        vgDir = argv[1];
        argOffset=2;
    }
 
    JSHost *jsHost=new JSHost( &jsWrapper, vgDir.c_str() );

    // --- Setup VGLib

    if ( !jsHost->setupVG() ) {
        delete jsHost;

        printf( "Initialization of Visual Graphics Library Failed.\n" );
        return 1;
    } 
 
     // --- Load the app

    std::string appSource = "app.vide";
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
        argOffset=3;
    }

    // --- Run a raw .js script

    if (appSource.find_last_of(".js") != std::string::npos) {
	    rawApp = true;
	    jsWrapper.execute( "VG.App = {};" );
    }
	
	jsHost->addVGLibSourceFile(appSource.c_str(), absolutePath);
	
    // --- Settup SDL2

    SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
    //SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 16); 

	if (SDL_Init(SDL_INIT_VIDEO) != 0) {
		std::cout << "SDL_Init Error: " << SDL_GetError() << std::endl;
		return 1;
	}

    SDL_GL_SetAttribute(SDL_GL_MULTISAMPLEBUFFERS, 1);
    SDL_GL_SetAttribute(SDL_GL_MULTISAMPLESAMPLES, 16);

#ifdef __APPLE__

    #define __VG_OPENGL3__ 1

    SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_CORE);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 3);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 2);

#else

/*
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_ES);  
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 2);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 0);
    
    SDL_GL_SetAttribute(SDL_GL_MULTISAMPLEBUFFERS, 1);
    SDL_GL_SetAttribute(SDL_GL_MULTISAMPLESAMPLES, 16);
*/

#endif

    // --- Composing the Window Title

    g_appName=std::string("Visual Graphics"); g_appVersion="0.0";

    {
        JSWrapperData data;

        jsWrapper.execute( "VG.Utils.decompressFromBase64( VG.App.name );", &data );
        g_appName=data.toString();

        jsWrapper.execute( "VG.Utils.decompressFromBase64( VG.App.version );", &data );        
        g_appVersion=data.toString();
    }

    sprintf( cmdbuffer, "%s v%s", g_appName.c_str(), g_appVersion.c_str() );
    if ( !rawApp )
        printf( "Running Application %s v%s\n", g_appName.c_str(), g_appVersion.c_str() );

    // --- Creating the Window

    SDL_Window *window=SDL_CreateWindow( cmdbuffer, SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, g_width, g_height, SDL_WINDOW_OPENGL|SDL_WINDOW_RESIZABLE | SDL_WINDOW_HIDDEN );
	if (window == nullptr) {
		std::cout << "SDL_CreateWindow Error: " << SDL_GetError() << std::endl;
		SDL_Quit();
		return 1;
	}

    SDL_GLContext glcontext=SDL_GL_CreateContext( window );
	if (glcontext == nullptr) 
	{
		// --- This did not work, try to reduce AA

		SDL_GL_SetAttribute(SDL_GL_MULTISAMPLESAMPLES, 8 );

		glcontext = SDL_GL_CreateContext(window);
		if (glcontext == nullptr)
		{
			// --- Still does not work
			std::cout << "SDL_GL_CreateContext Error: " << SDL_GetError() << std::endl;
			SDL_Quit();
			return 1;
		}
	}    

    SDL_GetWindowWMInfo(window, &g_wmInfo);    
	SDL_VERSION(&g_wmInfo.version);

#ifdef __APPLE__
    init_cocoa();
#endif

    // ---   
 
    printf("----------------------------------------------------------------\n");
    printf("Graphics Successfully Initialized\n");
    printf("OpenGL Info\n");
    printf("    Version: %s\n", glGetString(GL_VERSION));
    printf("     Vendor: %s\n", glGetString(GL_VENDOR));
    printf("   Renderer: %s\n", glGetString(GL_RENDERER));
    printf("    Shading: %s\n", glGetString(GL_SHADING_LANGUAGE_VERSION));
    printf("----------------------------------------------------------------\n");

#ifdef WIN32
    glewExperimental=TRUE;
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
    jsWrapper.execute( cmdbuffer );

    // --- Build the vgMain Call with the arguments

    if ( argc > argOffset ) {
        int arguments=argc - argOffset;

        sprintf( cmdbuffer, "vgMain.call( VG.context, VG.context.workspace, %d, [", arguments );
        for ( int i=argOffset; i < argc; ++i ) {
            strcat( cmdbuffer, "\"" );
            strcat( cmdbuffer, argv[i] );
            if ( i < argc-1 ) strcat( cmdbuffer, "\", " );
        }
        strcat( cmdbuffer, "\"] );\n" );
    } else sprintf( cmdbuffer, "vgMain.call( VG.context, VG.context.workspace, 0, [] );" );

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

    "// --- Add the SVGs of the project to the pool\n"
    "for (var svgName in VG.App.svg ) {\n"
        "var decodedSVG=VG.Utils.decompressFromBase64( VG.App.svg[svgName] );\n"

        "var svg=VG.Core.SVG( svgName, decodedSVG );\n"
        "VG.context.svgPool.addSVG( svg );\n"
    "} \n"
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

    "// --- Activate the right Style / Skin\n"
    "if ( VG.App.styleIndex && VG.App.styleIndex < VG.Styles.pool.length ) {\n"
        "var style=VG.Styles.pool[VG.App.styleIndex];\n"
        "var skin=undefined;\n"

        "if ( VG.App.skinIndex && VG.App.skinIndex < style.skins.length ) {\n"
            "skin=style.skins[VG.App.skinIndex];\n"
        "}\n"

        "VG.context.workspace.switchToStyle( style, skin );\n"
    "}\n";

    unpackAndRunApp+=cmdbuffer;
    jsWrapper.execute( unpackAndRunApp.c_str() );

    // ---

    unsigned int idleCount=0;
    SDL_Event event;

    // --- Show the Window

    JSWrapperData *tickData=new JSWrapperData;
    jsWrapper.execute( "VG.context.workspace.tick( true );", tickData );
    if ( tickData->toBoolean() ) SDL_GL_SwapWindow( window );
    delete tickData;
    SDL_ShowWindow( window );

    // --- Event Loop

    while( !g_quit )
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
                        jsWrapper.execute( cmdbuffer );
                    
                        g_redraw=true;
                    }
                break;
         
                case SDL_KEYDOWN:
                {
                    int keyCode=SDLKeyCodeToVG( event.key.keysym.sym );

                    if ( keyCode != -1 ) {
            	       sprintf( cmdbuffer, "VG.context.workspace.keyDown( %d );", keyCode );
				        jsWrapper.execute( cmdbuffer );
                    }
                }
                break;

                case SDL_KEYUP:
                {
                    int keyCode=SDLKeyCodeToVG( event.key.keysym.sym );

                    if ( keyCode != -1 ) {
                        sprintf( cmdbuffer, "VG.context.workspace.keyUp( %d );", keyCode );
                        jsWrapper.execute( cmdbuffer );
                    }
                }
                break;            
                
                case SDL_TEXTINPUT:
                {
                    JSWrapperData workspaceObject;
                    jsWrapper.execute( "VG.context.workspace", &workspaceObject );

                    JSWrapperData textInputFunc;
                    workspaceObject.object()->get( "textInput", &textInputFunc );

                    JSWrapperArguments args;
                    args.append( std::string( event.text.text ) );
 
                    textInputFunc.object()->call( &args, workspaceObject.object() );
                }
                break;
                 
                case SDL_MOUSEMOTION:
                {
                    sprintf( cmdbuffer, "VG.context.workspace.mouseMove( %d, %d );", event.motion.x, event.motion.y );
				    jsWrapper.execute( cmdbuffer );
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

						  jsWrapper.execute( code );
                        }
                        break;
                        
                        case SDL_BUTTON_RIGHT:
                        {
                    	   jsWrapper.execute( "VG.context.workspace.showContextMenu();" );
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
                    	   jsWrapper.execute( "VG.context.workspace.mouseUp( VG.Events.MouseButton.Left );" );
                        }
                    }
                }
                break;

                case SDL_MOUSEWHEEL:
                {
                    if ( event.wheel.y < 0)
                        jsWrapper.execute( "VG.context.workspace.mouseWheel( -1 );" );
                    else
                        jsWrapper.execute( "VG.context.workspace.mouseWheel( 1 );" );
                }
                break;
         
                case SDL_QUIT:
                    g_quit=true;
                break;
            }
        }

        const char *code;

        if ( g_redraw ) code="VG.context.workspace.tick( true );";
        else code="VG.context.workspace.tick( false );";

        JSWrapperData data;

        jsWrapper.execute( code, &data );
        bool rc=data.toBoolean();
       
        if ( rc ) 
        {
            SDL_GL_SwapWindow(window);
            SDL_Delay( 1 );
        } else {
            //JS_MaybeGC( cx );
            ++idleCount;
            if ( idleCount > 400 ) { 
                // --- Initiate GC
                jsWrapper.gc();
                idleCount=0; 
            }
            SDL_Delay( 10 ); 
        }
 
        g_redraw=false; 
    }    
 
    // --- Cleanup

    SDL_GL_DeleteContext(glcontext);
    SDL_DestroyWindow(window);
    SDL_Quit();	

    delete jsHost;

#ifdef __VG_WITH_EMBREE
    Tracer::cleanUp();
#endif

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
