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

VG.Utils.loadAppImage=function( imageName ) 
{
    VG.sendBackendRequest( "/images/" + VG.AppSettings.name + "/" + imageName, {}, function( response ) {

        var data=JSON.parse( response );

        var image=new VG.Core.Image();
        image.name=data.name;

        VG.decompressImageData( data.content, image );
        VG.Core.imagePool.addImage( image );    
        VG.update();

    }.bind( this ), "GET" );    
}

VG.Utils.parseOBJ=function(text)
{
    var mesh = { v: [], vn: [], f: [], vt: [] };

    var lines = text.split("\n");
    for (var i = 0; i< lines.length; i++)
    {
        var line = lines[i].split(" ");
        var ln = line.length;

        if (ln == 0) continue;

        var id = line[0];

        switch (id)
        {
        case "v":

            if (ln < 4) throw "invalid vertex position";

            mesh.v.push({x: line[1], y: line[2], z: line[3]});

            break;
        case "vn":

            if (ln < 4) throw "invalid normal";

            mesh.vn.push({x: line[1], y: line[2], z: line[3]});

            break;
        case "vt":

            if (ln < 3) throw "invalid uv";

            mesh.vt.push({u: line[1], v: line[2]});

            break;
        case "f":

            if (ln != 4) throw "only triangles supported";
           
            var i0 = line[1].split("/");
            var i1 = line[2].split("/");
            var i2 = line[3].split("/");

            mesh.f.push([
                {v: i0[0], vt: i0[1], vn: i0[2]}, 
                {v: i1[0], vt: i1[1], vn: i1[2]}, 
                {v: i2[0], vt: i2[1], vn: i2[2]}, 
            ]);

            break;
        }
    } 

    return mesh;
}

VG.Utils.bytesToSize = function(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

VG.Utils.numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

VG.Utils.getImageByName=function( name )
{
    for( var i=0; i < VG.context.imagePool.images.length; ++i ) {
        if ( VG.context.imagePool.images[i].name == name )
            return VG.context.imagePool.images[i];
    }
    return null;
};

VG.Utils.getTextByName=function( name, split )
{
    if ( VG.App.texts[name] )
    {
        var text=VG.Utils.decompressFromBase64( VG.App.texts[name] );
        if ( !split ) return text;
        else return text.split( ":::" );
    }

    return null;
};

VG.Utils.addDefaultFileMenu=function( menubar )
{
    var fileMenu=menubar.addMenu( "File" );
    VG.context.workspace.addMenuItemRole( fileMenu, VG.UI.ActionItemRole.New );
    fileMenu.addSeparator();
    VG.context.workspace.addMenuItemRole( fileMenu, VG.UI.ActionItemRole.Open );

    if ( VG.getHostProperty( VG.HostProperty.Platform ) === VG.HostProperty.PlatformWeb )
    {
        VG.context.workspace.addMenuItemRole( fileMenu, VG.UI.ActionItemRole.Open_Local );
    }

    fileMenu.addSeparator();
    VG.context.workspace.addMenuItemRole( fileMenu, VG.UI.ActionItemRole.Save );
    VG.context.workspace.addMenuItemRole( fileMenu, VG.UI.ActionItemRole.SaveAs );

    return fileMenu;
};

VG.Utils.addDefaultEditMenu=function( menubar )
{
    var editMenu=menubar.addMenu( "Edit" );
    VG.context.workspace.addMenuItemRole( editMenu, VG.UI.ActionItemRole.Undo );
    VG.context.workspace.addMenuItemRole( editMenu, VG.UI.ActionItemRole.Redo );
    editMenu.addSeparator();
    VG.context.workspace.addMenuItemRole( editMenu, VG.UI.ActionItemRole.Cut );
    VG.context.workspace.addMenuItemRole( editMenu, VG.UI.ActionItemRole.Copy );
    VG.context.workspace.addMenuItemRole( editMenu, VG.UI.ActionItemRole.Paste );
    VG.context.workspace.addMenuItemRole( editMenu, VG.UI.ActionItemRole.Delete );
    editMenu.addSeparator();
    VG.context.workspace.addMenuItemRole( editMenu, VG.UI.ActionItemRole.SelectAll );

    return editMenu;
};

VG.Utils.addDefaultViewMenu=function( menubar )
{
    var viewMenu=menubar.addMenu( "View" );

    for( var i=0; i < VG.context.style.skins.length; ++i ) {
        var skin=VG.context.style.skins[i];

        var menuItem=new VG.UI.MenuItem( skin.name + " Skin", null, function() {
            VG.context.style.skin=this.skin;
            VG.update();
        } );

        menuItem.skin=skin;

        if ( skin === VG.context.style.skin )
            menuItem.checked=menuItem.checkable=true;

        for ( var ex=0; ex < viewMenu.items.length; ++ex )
            menuItem.addExclusions( viewMenu.items[ex] );

        viewMenu.addMenuItem( menuItem );
    }

    return viewMenu;
};

VG.Utils.dumpObject=function( object )
{
    VG.log( JSON.stringify( object, null, 4) );
};

VG.Utils.scheduleRedrawInMs=function( ms )
{
    VG.context.workspace.redrawList.push( Date.now() + ms );
};

VG.Utils.ensureRedrawWithinMs=function( ms )
{
    var redrawList=VG.context.workspace.redrawList;
    var time=Date.now();

    for( var i=0; i < redrawList.length; ++i ) 
    {            
        if ( ( redrawList[i] + 1000.0/60.0 ) >= time && redrawList[i] < ( time + ms ) )
            return;
    }
    redrawList.push( time + ms - 1000.0/60.0 );    
};

VG.Utils.fileNameFromPath=function( path )
{
    return path.replace(/^.*(\\|\/|\:)/, '' );
};