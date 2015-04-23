/*
 * (C) Copyright 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>, Krishnakanth Mallik <krishnakanthmallikc@gmail.com>.
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

VG.Docs={};

VG.Docs.HelpObject=function( name, func, isObject )
{
	if ( isObject ) {
	    this.children=[];
	}

	this.isObject=isObject;
	this.func=func;
	this.html="";

	// ---
	this.text=name;
	this.selectable=true;
	this.parent=null;
};

VG.Docs.Database=function()
{
    if ( !(this instanceof VG.Docs.Database) ) return new VG.Docs.Database();

    function enumHelpObject( )
    {
    	if( arguments.length < 2 ) return;

    	var obj = arguments[0];
    	var objName = arguments[1];

    	var enumText = "/** " + objName + "<ul>";
    	for( var property in obj )
    	{
    		if( property.indexOf( "Docs.Enum" ) < 0 )
    		{
    			enumText += "<li>" + property + " : " + obj[property] + "</li>";
    		}
    	}

    	enumText += "</ul> @enum */";

    	this.addHelpObject( objName, enumText, false );
    }

    var addEnumHelpObject = enumHelpObject.bind( this );

	this.helpObjects=[];

	var exclusions=["dropZone", "context", "WebGL", "Docs"];

	for ( var item in VG ) 
	{
		if( exclusions.indexOf(item) >= 0 )
			continue;

		if ( typeof VG[item] === "function" && exclusions.indexOf( item ) === -1 ) 
		{
			var func=VG[item].toString();			
			this.addHelpObject( "VG." + item, func, item[0] === item[0].toUpperCase() );
		} 
		else if ( typeof VG[item] === "object" ) 
		{
			for (var subItem in VG[item] ) 
			{
				if( subItem.indexOf( "Docs.Enum") === 0 )
				{
					addEnumHelpObject( VG[item] )
				}
				else if ( typeof VG[item][subItem] === "function" ) 
				{
					var func=VG[item][subItem].toString();			
					this.addHelpObject( "VG." + item + "." + subItem, func, subItem[0] === subItem[0].toUpperCase() );
				}
				else if( typeof VG[item][subItem] === "object" )
				{
					for( var subSubItem in VG[item][subItem] )
					{
						if( subSubItem.indexOf( "Docs.Enum" ) === 0 )
						{
							addEnumHelpObject( VG[item][subItem], "VG." + item + "." + subItem )
						}
						else if( typeof VG[item][subItem][subSubItem] === "function" )
						{
							var func=VG[item][subItem].toString();			
							this.addHelpObject( "VG." + item + "." + subItem + "." + subSubItem, func, subItem[0] === subItem[0].toUpperCase() );
						}
					}
				}
			}
		}
	}

	this.helpObjects.sort( function(a, b) {
  		return a.text == b.text ? 0 : +(a.text > b.text) || -1;
	});

	this.elements={};

	this.elements.classDetail={
		"heading" : "h2"
	};

	this.elements.constructor={
		"heading" : "h4"
	};

	this.elements.method={
		"heading" : "h2"
	}

	this.elements.enum={
		"heading" : "h2"
	};

	this.elements.members={
		"heading" : "h4",
		"hexColor" : "#000000"
	};

	this.elements.parameters={
		"heading" : "h4"
	};

	this.elements.returns={
		"heading" : "h4"
	};

	this.elements.links={
		"hexColor" : "#808080"
	};		
};

VG.Docs.Database.prototype.addHelpObject=function( name, func, isObject ) 
{
	//console.log( "addFunction", name, func );

	if ( func.indexOf( "/**" ) !== -1  )
		this.helpObjects.push( new VG.Docs.HelpObject( name, func, isObject ));
};

VG.Docs.Database.prototype.getHelpObject=function( name )
{
	for( var i=0; i < this.helpObjects.length; ++i )
		if(this.helpObjects[i].text === name ) return this.helpObjects[i];

	return null;
}

VG.Docs.Database.prototype.getHtml=function( helpObject, treeController ) 
{
	if ( helpObject.isObject === false )
	{
		// --- Process Function

		if ( helpObject.html === "" ) 
			helpObject.html=this.buildHtml( helpObject.func );
	} else
	if ( helpObject.isObject === true )
	{
		// --- Process Object

		if ( helpObject.html === "" )
		{
			var object=eval( helpObject.text );

			if( object.prototype )
			{
				Object.getOwnPropertyNames( object.prototype ).filter( function( property ) {
					if(typeof object.prototype[property] === 'function')
					{
						//console.log( property );//objectName, property, object.prototype[property] );
							//items.push("VG." + item + "." + property);

						if ( property !== "constructor" && property !== "bind" )
						{
							var childObject=new VG.Docs.HelpObject( property, object.prototype[property].toString(), false );

							if(childObject.func.indexOf( "/**" ) >= 0 ) {

								childObject.parent=helpObject;
								treeController.add( treeController.indexOf( helpObject ), childObject, true );
							}
						}
					}
				});
			}

			helpObject.html=this.buildHtml( helpObject.func );			
		}		
	}	

	return helpObject.html;
};

VG.Docs.Database.prototype.insertLinks=function( html )
{
	var res = html.match(/(VG\.(\w|\.)*)/g);

	if ( res ) {

			// Remove duplicates.
		var objects=[];
		var seen = {};
		for( var i=0; i < res.length; ++i ) {

			if( seen[res[i]] !==  1 ) {

				seen[res[i]]=1;
				objects.push(res[i]);
			}
		}

		for( var i=0; i < objects.length; ++i ) {

			if( this.getHelpObject(objects[i]) ) {

				var pattern = new RegExp(objects[i], 'g');
				html = html.replace( pattern, "<a href=\"" + objects[i] + "\">" + objects[i] + "</a>" );
			}
		}
	}

	return html;
}

VG.Docs.Database.prototype.buildHtml=function( text ) 
{
	//console.log( "buildHtml", text );
	var startIndex=text.indexOf( "/**" );
	var jsdoc=[];

	while( 1 )
	{
		var startIndex=text.indexOf( "/**" );
		text=text.substring( startIndex );

		if ( startIndex < 0 ) break;
		var endIndex=text.indexOf( "*/" );

		var memberIndex = text.indexOf("@member");

		var docText=text.slice( 3, endIndex );
		text=text.slice( endIndex+2 );

		text=text.trim();

		if( memberIndex >= 0 && memberIndex < endIndex )  
		{
			if( text.indexOf( "this." ) === 0 )
			{
				var firstSpace = text.indexOf(" ");
				var firstEquals = text.indexOf("=");

				if( firstSpace >= 0 && firstEquals >= 0 )
				{
					memberEndIndex = Math.min( firstSpace, firstEquals );
				}
				else
				{
					memberEndIndex = firstSpace >= 0 ? firstSpace : firstEquals;
					memberEndIndex = memberEndIndex >= 0 ? memberEndIndex : 5;
				}

				var member=text.substring( 5, memberEndIndex );

				// Strip out leading underscore.
				if( member.indexOf("_") === 0 )
					member = member.substring(1);

				docText = "<font color=" + "\"" + this.elements.members.hexColor + "\"" + ">"
							+ member
							+ "</font>"
							+ " - "  + docText;
			}
		}

		jsdoc.push(docText);
	}

	out=this.jsDoc2Html( jsdoc );
	return out;
};

VG.Docs.Database.prototype.jsDoc2Html=function( jsdoc )
{
	var html="";
	var params=[];
	var members=[];
	var returns="";

	for ( var i=0; i < jsdoc.length; ++i ) {

		jsdoc[i]=jsdoc[i].trim();

		// Strip out '*'s
		jsdoc[i]=jsdoc[i].replace( /\*/g, "" );

		// Strip out excess spaces in between
		jsdoc[i]=jsdoc[i].replace( /\s{2,}/g, " " );

		// Strip out spaces between tags "> <"
		jsdoc[i]=jsdoc[i].replace( />\s</g, "><" );

		// Strip out leading spaces after a <br> tag
		jsdoc[i]=jsdoc[i].replace( /<br>\s/g, "<br>" );

		// Function Desc
		var descEnd=jsdoc[i].indexOf( "@" );
		descEnd = descEnd >= 0 ? descEnd : jsdoc[i].length;
		var desc=jsdoc[i].substring( 0, descEnd );

		jsdoc[i]=jsdoc[i].substring(descEnd);
		
		if( jsdoc[i].indexOf("@constructor") === 0 )
		 	html += "<" + this.elements.classDetail.heading + ">"
		 			+ "Class Detail"
		 			+ "</" + this.elements.classDetail.heading + ">"
		 			+ "<" + this.elements.constructor.heading + ">"
		 			+ "Constructor"
		 			+ "</" + this.elements.constructor.heading + ">"
		 			+ desc;

		else if( jsdoc[i].indexOf("@enum") === 0 )
			html += "<" + this.elements.enum.heading + ">"
					+ "Enum"
					+ "</" + this.elements.enum.heading + ">"
					+ desc;

		else if( jsdoc[i].indexOf("@param") === 0 || jsdoc[i].indexOf("@returns") === 0 || jsdoc[i].indexOf("@") < 0 )
			html += "<" + this.elements.method.heading + ">"
					+ "Method Detail"
					+ "</" + this.elements.method.heading + ">" 
					+ desc;

		while( jsdoc[i] ) {

			if( jsdoc[i].indexOf("@") === 0 ) {

				jsdoc[i] = jsdoc[i].substring( 1 );
				var index = jsdoc[i].indexOf(" ");
				var tag = jsdoc[i].substring( 0, index );

				jsdoc[i] = jsdoc[i].substring( tag.length + 1 );

				var index = jsdoc[i].indexOf("@");
				index = index >= 0 ? index : jsdoc[i].length;

				var tagDetails = jsdoc[i].substring( 0,  index);

				// Add italics and custom font to types.
				tagDetails=tagDetails.replace(/\{(.*?)\}/g, "<font color=\"" 
												+ this.elements.links.hexColor 
												+ "\">{" + "$1" + "}</font>");
				
				switch( tag.toLowerCase() ) {

					case "param":
						params.push(tagDetails);
						break;

					case "returns":
						returns=tagDetails;
						break;

					case "member":
						members.push(tagDetails + " " + desc);
						break;
				}

				jsdoc[i]=jsdoc[i].substring(index);
			}
		}
	}

	if( params.length ) {

		html += "<" + this.elements.parameters.heading + ">" 
				+ "Parameters"
				+ "</" + this.elements.parameters.heading + ">" 
				+ "<ul>";

		for( var j=0; j < params.length; ++j )
			html += "<li>" + params[j] + "</li>";

		html += "</ul>"
	}

	if( members.length ) {

		html += "<" + this.elements.members.heading + ">"
				+ "Members"
				+ "</" + this.elements.members.heading + ">"
				+ "<ul>";

		for( var j=0; j < members.length; ++j )
			html += "<li>" + members[j] + "</li>";

		html += "</ul>";
	}

	if( returns.length ) {

		html += "<" + this.elements.returns.heading + ">"
		+ "Returns"
		+ "</" + this.elements.returns.heading + ">"
		+ "<ul>" 
		+ returns 
		+ "</ul>";
	}

	html = this.insertLinks(html);
	return html;
}
