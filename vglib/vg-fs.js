VG.FS = {};

VG.FS.readDir = function( path )
{
    if ( !VG.context.workspace.isElectron() ) return;

    const ipc = require('electron').ipcRenderer;
    let rc = ipc.sendSync( 'fs-readDir', { path: path } );
    return rc;
};

VG.FS.readFile = function( path, encoding = "utf8" )
{
    if ( !VG.context.workspace.isElectron() ) return;

    if ( encoding === "raw" ) encoding = undefined;

    const ipc = require('electron').ipcRenderer;
    let rc = ipc.sendSync( 'fs-readFile', { path: path, encoding: encoding } );
    return rc;
};

VG.FS.writeFile = function( path, data, encoding = "utf8" )
{
    if ( !VG.context.workspace.isElectron() ) return;

    if ( encoding === "raw" ) encoding = undefined;

    const ipc = require('electron').ipcRenderer;
    ipc.sendSync( 'fs-writeFile', { path: path, data: data, encoding: encoding } );
};

VG.FS.info = function( path )
{
    if ( !VG.context.workspace.isElectron() ) return;

    const ipc = require('electron').ipcRenderer;
    return ipc.sendSync( 'fs-info', { path: path } );
};

VG.FS.exists = function( path )
{
    if ( !VG.context.workspace.isElectron() ) return;

    const ipc = require('electron').ipcRenderer;
    return ipc.sendSync( 'fs-exists', { path: path } );
};

VG.FS.createDir = function( path )
{
    if ( !VG.context.workspace.isElectron() ) return;

    const ipc = require('electron').ipcRenderer;
    return ipc.sendSync( 'fs-createDir', {path: path } );
};

VG.FS.createTempDir = function( prefix = "foo-" )
{
    if ( !VG.context.workspace.isElectron() ) return;

    const ipc = require('electron').ipcRenderer;
    return ipc.sendSync( 'fs-createTempDir', {prefix: prefix } );
};

VG.FS.deleteFile = function( path )
{
    if ( !VG.context.workspace.isElectron() ) return;

    const ipc = require('electron').ipcRenderer;
    return ipc.sendSync( 'fs-deleteFile', {path: path } );
};

VG.FS.deleteDir = function( path )
{
    if ( !VG.context.workspace.isElectron() ) return;

    const ipc = require('electron').ipcRenderer;
    return ipc.sendSync( 'fs-deleteDir', {path: path } );
};

VG.FS.pathInfo = function( path )
{
    if ( !VG.context.workspace.isElectron() ) return;

    const ipc = require('electron').ipcRenderer;
    return ipc.sendSync( 'fs-pathInfo', { path: path } );
};

VG.FS.joinPaths = function( ...args )
{
    if ( !VG.context.workspace.isElectron() ) return;

    const ipc = require('electron').ipcRenderer;
    return ipc.sendSync( 'fs-joinPaths', { args: [...args] } );
};

VG.FS.absolutePath = function( path )
{
    if ( !VG.context.workspace.isElectron() ) return;

    const ipc = require('electron').ipcRenderer;
    return ipc.sendSync( 'fs-absolutePath', { path: path } );
};

VG.FS.fileDialog = function( params, cb )
{
    if ( !VG.context.workspace.isElectron() ) return;

    const ipc = require('electron').ipcRenderer;
    ipc.send( 'fs-file-dialog', params );

    ipc.once( 'fs-file-dialog-result', ( event, files ) => {
        cb( files );
    } );
};

VG.FS.getSpecialPath = function( path )
{
    if ( !VG.context.workspace.isElectron() ) return;

    const ipc = require('electron').ipcRenderer;
    return ipc.sendSync( 'fs-getspecialpath', { path: path } );
};

VG.FS.pathSeparator = function()
{
    if ( !VG.context.workspace.isElectron() ) return;

    const ipc = require('electron').ipcRenderer;
    return ipc.sendSync( 'fs-pathSeparator', {} );
};

VG.FS.relativePath = function( from, to )
{
    if ( !VG.context.workspace.isElectron() ) return;

    const ipc = require('electron').ipcRenderer;
    return ipc.sendSync( 'fs-relativePath', { from: from, to: to } );
};

VG.FS.isAbsolutePath = function( path )
{
    if ( !VG.context.workspace.isElectron() ) return;

    const ipc = require('electron').ipcRenderer;
    return ipc.sendSync( 'fs-isAbsolutePath', { path: path } );
};

VG.FS.rename = function( oldPath, newPath )
{
    if ( !VG.context.workspace.isElectron() ) return;

    const ipc = require('electron').ipcRenderer;
    return ipc.sendSync( 'fs-rename', { old: oldPath, new: newPath } );
};

VG.FS.getMimeType = function( data )
{
    if ( !VG.context.workspace.isElectron() ) return;

    const ipc = require('electron').ipcRenderer;
    return ipc.sendSync( 'fs-getmimetype', { data: data } );
};
