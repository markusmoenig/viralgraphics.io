/*
 * (C) Copyright 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>.
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

#include <AppKit/AppKit.h>

#include <SDL.h>
#include <SDL_syswm.h>

extern SDL_SysWMinfo g_wmInfo;
extern const char *g_appNameChars, *g_appVersionChars;

extern void sendBackendRequest_finished( const char *result, void *heap );

extern void activateMenuItem( int menuItemId );

// ----

@interface CocoaHelper : NSObject{

}

-(id)menuItemClicked: (id) sender;

@end

@implementation CocoaHelper

-(id)menuItemClicked: (id) sender
{
    activateMenuItem( [sender tag] );
    return 0;
}

@end

CocoaHelper *cocoaHelper;

// ---- 

void init_cocoa( void )
{
    NSMenu *mainMenu = [[NSApplication sharedApplication] mainMenu];

    cocoaHelper=[[CocoaHelper alloc] init];

    //[mainMenu removeAllItems];
    [mainMenu removeItemAtIndex:1];
    [mainMenu removeItemAtIndex:1];
}

// --- Return the path to the given resources directory

const char *getPath_cocoa( int type )
{
    static char resourcesPath[1024];

    resourcesPath[0]=0;

    NSBundle* myBundle = [NSBundle mainBundle];
    NSString* path=0;

    if ( type == 0 ) {

        // --- Return the resources dir, but only if vglib directory exists.
        path=[myBundle pathForResource:@"vglib" ofType:@""];
        if ( path && [path length] )  path=[NSString stringWithFormat:@"%@/", [myBundle resourcePath]];
    }
    else
    if ( type == 1 ) path=[myBundle pathForResource:@"app" ofType:@"vide"];

    if ( !path || ![path length] ) 
    {
        if ( type == 0 ) printf( "VGLib Directory not found!\n" );
        else printf( "VIDE Application not found!\n" );
        return 0;
    }

    strcpy( resourcesPath, [path UTF8String] );
    return resourcesPath;    
}

NSMenuItem *menuItems[20];

// --- hostProjectStarted_cocoa, VIDE starts a new Project, store the VIDE menu items and clear the menu.

void hostProjectStarted_cocoa()
{
    NSMenu *mainMenu = [[NSApplication sharedApplication] mainMenu];

    int counter=0;

    while ( [mainMenu numberOfItems] > 1 )
    {
        menuItems[counter]=[mainMenu itemAtIndex:1];
        [mainMenu removeItemAtIndex:1];
        ++counter;
    }
    menuItems[counter]=0;
}

// --- hostProjectEnded_cocoa, VIDE stopped running a Project, restore the VIDE menus.

void hostProjectEnded_cocoa()
{
    NSMenu *mainMenu = [[NSApplication sharedApplication] mainMenu];
    //[mainMenu removeAllItems];

    while ( [mainMenu numberOfItems] > 1 )
        [mainMenu removeItemAtIndex:1];

    int counter=0;
    while ( menuItems[counter] )
    {
        [mainMenu addItem:menuItems[counter]];
        ++counter;
    }
}

// --- setMouseCursor_cocoa, sets the mouse cursor to the specified shape.

void setMouseCursor_cocoa( const char *_name )
{
    NSString *name=[NSString stringWithFormat:@"%s", _name];

    if ( [name isEqualToString: @"col-resize"] )
        [[NSCursor resizeLeftRightCursor] set];
    else
    if ( [name isEqualToString: @"row-resize"] )
        [[NSCursor resizeUpDownCursor] set];
    else        
    if ( [name isEqualToString: @"default"] )
        [[NSCursor arrowCursor] set];
}

void setProjectChangedState_cocoa( bool value )
{
    [g_wmInfo.info.cocoa.window setDocumentEdited:value];
};

// --- setWindowTitle_cocoa, sets the title of the OpenGL window.

void setWindowTitle_cocoa( const char *_title, const char *_filePath )
{
    char formattedTitle[200];

    if ( strlen(_title) == 0 ) 
    {
        sprintf( formattedTitle, "%s v%s", g_appNameChars, g_appVersionChars );
    } else
    {
        sprintf( formattedTitle, "%s v%s - %s", g_appNameChars, g_appVersionChars, _title );
    }

    NSString *title=[NSString stringWithFormat:@"%s", formattedTitle];
    NSString *filePath=[NSString stringWithFormat:@"%s", _filePath];

    [g_wmInfo.info.cocoa.window setTitle:title];
    [g_wmInfo.info.cocoa.window setRepresentedFilename:filePath];
}

// --- sendBackendRequest_cocoa, sends a JSON data package to the given url, calls the callback with the returned JSON.

const char *sendBackendRequest_cocoa( const char *url, const char *_parameters, const char *type, void *heap )
{/*
    NSMenu *mainMenu = [[NSApplication sharedApplication] mainMenu];
    NSMenu *appMenu = [[mainMenu itemAtIndex:0] submenu];
    NSMenu *windowMenu = [[mainMenu itemAtIndex:0] submenu];

    [mainMenu removeItemAtIndex:1];

    for (NSMenuItem *item in [appMenu itemArray]) {
        NSLog(@"%@", [item title]);
    }
*/
    NSString *parameters=[NSString stringWithFormat:@"%s", _parameters];

    NSString *urlPath=[NSString stringWithFormat:@"https://visualgraphics.tv%s", url];
    NSURL *nsurl=[NSURL URLWithString:urlPath];
    NSMutableURLRequest *urlRequest = [NSMutableURLRequest requestWithURL:nsurl cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:60.0];
    NSString *methodType=[NSString stringWithFormat:@"%s", type];
        
    [urlRequest setValue:@"application/json;charset=UTF-8" forHTTPHeaderField:@"Content-Type"];
        
    [urlRequest setValue:@"*" forHTTPHeaderField:@"Access-Control-Allow-Origin"];
    [urlRequest setValue:@"Content-Type" forHTTPHeaderField:@"Access-Control-Allow-Headers"];
        
    [urlRequest setHTTPMethod:methodType];
    [urlRequest setHTTPBody:[NSData dataWithBytes:[parameters UTF8String] length:strlen([parameters UTF8String])]];
   
    [NSURLConnection sendAsynchronousRequest:urlRequest
                                             queue:[NSOperationQueue mainQueue]
                                             completionHandler:^(NSURLResponse *response, NSData *data, NSError *error) 
    {
        NSString *string=[[NSString alloc] initWithBytes:[data bytes] length:[data length] encoding: NSUTF8StringEncoding];                              
        //NSLog(@"received data %@", string );
                                   
        if ( string.length > 0 ) 
        {
            //NSArray *array=[[NSArray alloc] initWithObjects:(id)string,nil];
            //[func callWithArguments:array];
            sendBackendRequest_finished( [string UTF8String], heap );
        }
    }];
    return 0;
/*
    NSURLResponse* response;
    NSError* error = nil;        

    NSData* result=[NSURLConnection sendSynchronousRequest:urlRequest returningResponse:&response error:&error];

    NSString *string=[[NSString alloc] initWithBytes:[result bytes] length:[result length] encoding: NSUTF8StringEncoding];                              
    //NSLog(@"received data %@", string );

    return [string UTF8String];*/
};

// --- clipboardPasteDataForType_cocoa, returns the Clipboard content for the given Type (right now only "Text" type is supported).

const char *clipboardPasteDataForType_cocoa( const char *type )
{
    NSString *string=[[NSPasteboard generalPasteboard] stringForType:NSStringPboardType];
    return [string UTF8String];
}

// --- copyToClipboard_cocoa, copies the data of the given type to the native Clipboard (right now only "Text" type is supported).

void copyToClipboard_cocoa( const char *_type, const char *data )
{
    NSString *type=[NSString stringWithFormat:@"%s", _type];

    [[NSPasteboard generalPasteboard] clearContents];

    if ( [type isEqualToString: @"Text"] )
        [[NSPasteboard generalPasteboard] setString:[NSString stringWithFormat:@"%s", data] forType:NSStringPboardType];
}

// --- addNativeMenu

void addNativeMenu_cocoa( const char *_name )
{
    NSString *name=[NSString stringWithFormat:@"%s", _name];

    NSMenu *menu = [[NSMenu alloc] initWithTitle:name];
    [menu setAutoenablesItems:NO];

    NSMenuItem *menuItem = [[NSMenuItem alloc] initWithTitle:name action:NULL keyEquivalent:@""];
    [menuItem setSubmenu: menu]; // was setMenu:

    NSMenu *mainMenu = [[NSApplication sharedApplication] mainMenu];

    [menuItem setEnabled:TRUE];

    [mainMenu addItem:menuItem];
}

// --- addNativeMenuItem

void addNativeMenuItem_cocoa( const char *_menuName, const char *_menuItemName, int menuItemId, bool disabled, bool checked, const char *_key, int mod1, int mod2 )
{
    NSString *menuName=[NSString stringWithFormat:@"%s", _menuName];
    NSString *menuItemName=[NSString stringWithFormat:@"%s", _menuItemName];

    NSMenu *mainMenu = [[NSApplication sharedApplication] mainMenu];

    for ( int i=0; i < [mainMenu numberOfItems]; ++i )
    {
        NSMenuItem *menuItem=[mainMenu itemAtIndex:i];

        if ( [menuItem.title isEqualToString:menuName] ) {

            NSMenu *subMenu=[menuItem submenu];

            if ( menuItemId != -1 )
            {
                NSMenuItem *item = [[NSMenuItem alloc] initWithTitle:menuItemName action:NULL keyEquivalent:@""];

                [item setEnabled:TRUE];

                [item setTarget:cocoaHelper];
                [item setAction:@selector(menuItemClicked:)];
                [item setTag:menuItemId];
                [item setEnabled:!disabled];

                if ( checked ) [item setState:NSOnState];
                else [item setState:NSOffState];

                NSString *key=[NSString stringWithFormat:@"%s", _key];
                if ( [key length] )
                {
                    int mask=0;
                    if ( mod1 == 16 || mod2 == 16 ) mask|=NSShiftKeyMask;
                    if ( mod1 == 91 || mod2 == 91 ) mask|=NSCommandKeyMask;
                    if ( mod1 == 17 || mod2 == 17 ) mask|=NSControlKeyMask;
                    if ( mod1 == 18 || mod2 == 18 ) mask|=NSAlternateKeyMask;

                    [item setKeyEquivalentModifierMask: mask];
                    [item setKeyEquivalent:[key lowercaseString]];                    
                }

                [subMenu addItem:item];
            } else [subMenu addItem:[NSMenuItem separatorItem]];
        }
    }
}

void setNativeMenuItemState_cocoa( int menuItemId, bool disabled, bool checked )
{
    NSMenu *mainMenu = [[NSApplication sharedApplication] mainMenu];

    for ( int i=0; i < [mainMenu numberOfItems]; ++i )
    {
        NSMenuItem *menuItem=[mainMenu itemAtIndex:i];
        NSMenu *submenu=[menuItem submenu];

        for ( int m=0; m < [submenu numberOfItems]; ++m )
        {
            NSMenuItem *menuItem=[submenu itemAtIndex:m];

            if ( [menuItem tag] == menuItemId ) {
                [menuItem setEnabled:!disabled];
            
                if ( checked ) [menuItem setState:NSOnState];
                else [menuItem setState:NSOffState];

                return;
            }
        }
    }
}
