/*
 * (C) Copyright 2014-2017 Markus Moenig <markusm@visualgraphics.tv>.
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

VG.DB.createFolder=function( appId, name, description, publicRead, publicWrite, callback )
{
    /**Creates a new Folder for the given application. Folders can contain any kind of data and is the primary way to store data in the Cloud for
     * Visual Graphics applications.
     * @param {string} name - The name of the new folder.
     * @param {string} description - A description of the new folder.
     * @param {boolean} publicRead - True if everybody can read the contents of the folder. If false, only admins or group members of this folder
     * can read from this folder.
     * @param {boolean} publicWrite - True if everybody can write new content for the folder. If false, only admins or group members of this folder
     * can write to this folder.
     * @param {function} Callback - The callback to be called when the operation finishes.
     */

    var folderObject={};

    folderObject.name=name;
    folderObject.description=description;
    folderObject.publicRead=publicRead;
    folderObject.publicWrite=publicWrite;

    folderObject.app=appId;

    VG.sendBackendRequest( "/folder", JSON.stringify( folderObject ), function( responseText ) {
        var response=JSON.parse( responseText );
        console.log( responseText );

        if ( response.status === "ok" ) {

        }

    }, "PUT" );
};

VG.DB.Folder=function( id, callback )
{
    /**Creates a new local Folder Object which can be used to read and write content to the remote Folder.
     * @param {string} id - The id of the Folder in the Database.
     * @param {function} Callback - The callback to be called when the operation finishes. The first argument of the callback
     * will be a pointer to the Folder object.
     * @constructor
     */

    this.id=id;

    if ( callback ) {
        VG.sendBackendRequest( "/folder/" + id, "", function( responseText ) {
            var response=JSON.parse( responseText );

            if ( response.status === "ok" ) {

                this.name=response.folder.name;
                this.description=response.folder.description;
                this.publicRead=response.folder.public.read;
                this.publicWrite=response.folder.public.write;

                this.isVerified=true;
            }

        callback( this );
        }.bind( this ), "GET" );
    }
};

VG.DB.Folder.prototype.getIndex=function( callback )
{
    VG.sendBackendRequest( "/folder/" + this.id + "/content/index", "", function( responseText ) {
        if ( !responseText ) return;
        var response=JSON.parse( responseText );
        if ( callback ) callback( response );
    }.bind( this ), "GET" );
};

VG.DB.Folder.prototype.getAllContent=function( callback )
{
    /**Downloads all content of the Folder.
     * @param {function} Callback - The callback to be called when the operation finishes. The first argument of the callback
     * will contain an array of the content of the folder.
     */
    VG.sendBackendRequest( "/folder/" + this.id + "/content", "", function( responseText ) {
        if ( !responseText ) return;
        var response=JSON.parse( responseText );

        if ( response.status === "ok" ) {
            if ( callback ) callback( response.content );
        }
    }.bind( this ), "GET" );
};

VG.DB.Folder.prototype.getContent=function( id, callback )
{
    /**Downloads all content of the Folder.
     * @param {function} Callback - The callback to be called when the operation finishes. The first argument of the callback
     * will contain an array of the content of the folder.
     */
    VG.sendBackendRequest( "/folder/" + this.id + "/content/" + id, "", function( responseText ) {
        if ( !responseText ) return;
        var response=JSON.parse( responseText );
        if ( response.status === "ok" ) {
            if ( callback ) callback( response.content );
        }
    }.bind( this ), "GET" );
};

VG.DB.Folder.prototype.addContent=function( name, content, callback )
{
    /**Uploads new content to the Folder.
     * @param {string} name - The name of the new content.
     * @param {string} content - The content, has to be JSON.
     * @param {function} Callback - The callback to be called when the operation finishes. The first argument of the callback
     * will be true if the upload succeeded, false otherwise.
     */
    var params={ "name" : name, "data" : content };
    VG.sendBackendRequest( "/folder/" + this.id + "/content", JSON.stringify( params ), function( responseText ) {
        var response=JSON.parse( responseText );

        if ( response.status === "ok" ) {
            if ( callback ) callback( true );
        } else if ( callback ) callback( false );
    }.bind( this ), "PUT" );
};

VG.DB.Folder.prototype.removeContent=function( id, callback )
{
    /**Removes content identified by id from the Folder.
     * @param {number} id - The id of the content.
     * @param {function} Callback - The callback to be called when the operation finishes. The first argument of the callback
     * will be true if the upload succeeded, false otherwise.
     */
    VG.sendBackendRequest( "/folder/" + this.id + "/content/" + id, "", function( responseText ) {
        var response=JSON.parse( responseText );

        if ( response.status === "ok" ) {
            if ( callback ) callback( true );
        } else if ( callback ) callback( false );
    }.bind( this ), "DELETE" );
};
