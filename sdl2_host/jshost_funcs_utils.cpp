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

#include <jsapi.h>
#include <jsfriendapi.h>
#include <nfd.h>
#include "base64.h"
#include "jshost.hpp"

#include "image_loader.hpp"

using namespace JS;

extern JSHost *g_host;

// --- Activates the callback of the menuItem identified by its id.

void activateMenuItem( int menuItemId )
{
    RootedValue* menu=g_host->executeScript( "VG.context.workspace.menubars[0]" );
    RootedObject menubarObject(g_host->cx, &menu->toObject() );

    // --- Get the menu item for the id
    RootedValue menuItem(g_host->cx);    
    RootedValue menuIdValue(g_host->cx); menuIdValue.setInt32( menuItemId );
    //bool ok=Call( g_host->cx, HandleObject(menubarObject), "menuItemById", HandleValueArray( menuIdValue ), MutableHandleValue(&menuItem) );
    bool ok=Call( g_host->cx, HandleObject(menubarObject), "clickMenuItemById", HandleValueArray( menuIdValue ), MutableHandleValue(&menuItem) );

/*
    if (!ok) return;

    RootedObject menuItemObject(g_host->cx, &menuItem.toObject() );

    // --- Get the callback
    //RootedValue id(g_host->cx); 
    //JS_GetProperty( g_host->cx, HandleObject(menuItemObject), "id", MutableHandleValue(&id) );
    //printf( "menu item id %d", id.toInt32() );

    RootedValue callback(g_host->cx); 
    JS_GetProperty( g_host->cx, HandleObject(menuItemObject), "clicked", MutableHandleValue(&callback) );

    // --- Call the callback
    RootedValue rc(g_host->cx); MutableHandleValue rcHandle( &rc );
    JS_CallFunctionValue( g_host->cx, HandleObject(menuItemObject), HandleValue( callback ), HandleValueArray::empty(), rcHandle );*/
}

