/*
 * (C) Copyright 2014, 2015 Krishnakanth Mallik <krishnakanthmallikc@gmail.com>.
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

VG.UI.HtmlView=function( html )
{
    /**Creates a new HtmlView widget that can render HTML source text.
    * @constructor
    */

    if ( !(this instanceof VG.UI.HtmlView) ) return new VG.UI.HtmlView( html );

    VG.UI.Widget.call( this );
    this.name="HtmlView";

    this.textGroupArray=[];

    this.supportsScrollbars=true;
    
    this.supportsFocus=true;
    this.minimumSize.width=40;

    this.maxTextLineSize=VG.Core.Size();
    this.textOffset=VG.Core.Point();
    
    this.hAlignment=VG.UI.HAlignment.Left;
    this.vAlignment=VG.UI.VAlignment.Top;

    this.previousRect=VG.Core.Rect();

    this.vScrollbar=0;
    this.needsVScrollbar=false;

    this.childWidgets=[];

    this.verified=false;

    this.linkCallback=null;

    this.readOnly=true;


    this.body={
        "font" : VG.Font.Font( VG.context.style.DefaultFontName, 15 ),
        "bgColor" : VG.context.style.skin.WidgetBackgroundColor,
        "color" : VG.context.style.skin.WidgetTextColor,
        "margin" : VG.Core.Margin( 20, 25, 20, 25 ),
        "spacing" : 10,
        "noframe" : false
    };

    this.h1={
        "font" : VG.Font.Font( VG.context.style.DefaultBoldFontName, 24 ),
        "bgColor" : VG.context.style.skin.WidgetBackgroundColor,
        "color" : VG.context.style.skin.WidgetTextColor,
        "margin" : VG.Core.Margin( 0, 10, 20, 10 )
    };

    this.h2={
        "font" : VG.Font.Font( VG.context.style.DefaultBoldFontName, 22 ),
        "bgColor" : VG.context.style.skin.WidgetBackgroundColor,
        "color" : VG.context.style.skin.WidgetTextColor,
        "margin" : VG.Core.Margin( 0, 10, 20, 10 )
    };

    this.h3={
        "font" : VG.Font.Font( VG.context.style.DefaultBoldFontName, 18 ),
        "bgColor" : VG.context.style.skin.WidgetBackgroundColor,
        "color" : VG.context.style.skin.WidgetTextColor,
        "margin" : VG.Core.Margin( 0, 10, 20, 10 )
    };

    this.h4={
        "font" : VG.Font.Font( VG.context.style.DefaultBoldFontName, 16 ),
        "bgColor" : VG.context.style.skin.WidgetBackgroundColor,
        "color" : VG.context.style.skin.WidgetTextColor,
        "margin" : VG.Core.Margin( 0, 10, 20, 10 )
    };

    this.h5={
        "font" : VG.Font.Font( VG.context.style.DefaultBoldFontName, 12 ),
        "bgColor" : VG.context.style.skin.WidgetBackgroundColor,
        "color" : VG.context.style.skin.WidgetTextColor,
        "margin" : VG.Core.Margin( 0, 10, 20, 10 )
    };

    this.h6={
        "font" : VG.Font.Font( VG.context.style.DefaultBoldFontName, 10 ),
        "bgColor" : VG.context.style.skin.WidgetBackgroundColor,
        "color" : VG.context.style.skin.WidgetTextColor,
        "margin" : VG.Core.Margin( 0, 10, 20, 10 )
    };

    this.ul={
        "font" : VG.Font.Font( VG.context.style.DefaultFontName, 15 ),
        "bgColor" : VG.context.style.skin.WidgetBackgroundColor,
        "color" : VG.context.style.skin.WidgetTextColor,
        "margin" : VG.Core.Margin( 40, 10, 20, 10 ),
        "bulletStart" : 30,
        "bulletSize" : 0.5,
        "textStart" : 10
    };

    this.ol={
        "font" : VG.Font.Font( VG.context.style.DefaultFontName, 15 ),
        "bgColor" : VG.context.style.skin.WidgetBackgroundColor,
        "color" : VG.context.style.skin.WidgetTextColor,
        "margin" : VG.Core.Margin( 40, 10, 20, 10 )
    };

    this.b={
        "font" : VG.Font.Font( VG.context.style.DefaultBoldFontName, 15 ),
        "bgColor" : VG.context.style.skin.WidgetBackgroundColor,
        "color" : VG.context.style.skin.WidgetTextColor
    };

    this.i={
        "font" : VG.Font.Font( VG.context.style.DefaultItalicFontName, 15 ),
        "bgColor" : VG.context.style.skin.WidgetBackgroundColor,
        "color" : VG.context.style.skin.WidgetTextColor
    };

    this.a={
        "font" : VG.Font.Font( VG.context.style.DefaultFontName, 15 ),
        "bgColor" : VG.context.style.skin.WidgetBackgroundColor,
        "color" : VG.context.style.skin.WidgetTextColor,
        "underlineHeight" : 1
    };

    this.br={
        "lineHeight" : 10
    };

    this.p={
        "margin" : VG.Core.Margin( 20, 10, 20, 10 )
    };

    this.font={
        "bgColor" : VG.context.style.skin.WidgetBackgroundColor,
        "override" : false
    };

    this.code={
        "font" : VG.Font.Font( VG.context.style.DefaultFontName, 15 ),
        "margin" : VG.Core.Margin( 20, 10, 20, 10 ),
        "verticalExpanding" : true,
        "maxHeight" : 100
    };

    this.image={
        "margin" : VG.Core.Margin( 20, 10, 20, 10 )
    };

    this.elements={};

    this.elements.body=this.body;
    this.elements.h1=this.h1;
    this.elements.h2=this.h2;
    this.elements.h3=this.h3;
    this.elements.h4=this.h4;
    this.elements.h5=this.h5;
    this.elements.h6=this.h6;
    this.elements.ul=this.ul;
    this.elements.ol=this.ol;
    this.elements.b=this.b;
    this.elements.i=this.i;
    this.elements.a=this.a;
    this.elements.br=this.br;
    this.elements.font=this.font;
    this.elements.p=this.p;
    this.elements.code=this.code;
    this.elements.image=this.image;
        
    if ( arguments.length ) this._html=arguments[0];
    else
    /** The HTML source text.
     * @member {string}
     */
        this._html="";
};

VG.UI.HtmlView.prototype=VG.UI.Widget();

Object.defineProperty( VG.UI.HtmlView.prototype, "html", {
    get: function() {
        // @TODO: Reconstruct the html from formatted text and modifiers.
        return this._html;
    },
    set: function( newHtml ) {

        if ( !newHtml ) newHtml="";
        
        this.resetFormattedText();
        this.parseHtmlText( newHtml );
    }    
});

VG.UI.HtmlView.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.UI.HtmlView.prototype.valueFromModel=function( value )
{
    if ( value === null ) this.html="";
    else this.html=value;
};

VG.UI.HtmlView.prototype.focusIn=function()
{
    
};

VG.UI.HtmlView.prototype.focusOut=function()
{
    
};

VG.UI.HtmlView.prototype.resetFormattedText=function()
{
    this.verified=false;
    this.childWidgets=[];
    this.textGroupArray=[];
    this.numTextLines=0;
    this.numContinueLines=0;
    this.numActualLines=0;

    this.textOffset=VG.Core.Point();
}

VG.UI.HtmlView.prototype.parseHtmlText=function( html )
{
    var openedTags=[];

    this.textGroupArray=[];
    var textGroup;

    var parseTagAndAttribs=function( text )
    {
        //Parse attributes
        var attribs=[];
        tagName=text.split(" ")[0];
        text=text.substring(tagName.length+1, text.length);

        for( var i=0; i < text.length; ++i ) {

            if(text[i] === "=") {

                var attribName=text.substring( 0, i ).trim().toLowerCase();
                text=text.substring( i+1 ).trim();
                text=text.substring( 1 );

                var i1=text.indexOf( "'" );
                var i2=text.indexOf( "\"")
                var valueEnd= i1 < 0 ? i2 : ( i2 < 0 ? i1 : ( i1 < i2 ? i1 : i2 ) );
                
                var attribValue=text.substring( 0, valueEnd );
                text=text.substring( valueEnd+1 ).trim()

                attribs.push( { attrib : attribName, value : attribValue } );

                i=0;
            }
        }

        return { name : tagName, attribs : attribs }
    }

    while(html)
    {
        if( html.indexOf( "</" ) == 0)
        {
            // Tag end
            var index=html.indexOf( ">" );

            if( index < 0 ) 
                throw "html parse error, forgot to end a tag with >?";

            var tag=html.substring( 2, index );
            html=html.substring( index + 1 );

            var tagName=tag.substring( 0, tag.length );

            if( tagName === "li" || tagName === "p" || tagName === "code" && textGroup ) {

                this.textGroupArray.push( textGroup );
                textGroup=null;
            }

            index=-1;
            for( var i=0; i < openedTags.length; ++i ) {

                if( openedTags[i].tag === tagName ) {

                    index = i;
                    break;
                }
            }

            if( index > -1 ) openedTags.splice( index, 1 );
        }
        else if( html.indexOf( "<" ) == 0 )
        {
            // Tag start

            index=html.indexOf(">");
            if( index < 0 ) 
                throw 'html parse error, forgot to end a tag with >?'

            tagAndAttrib=html.substring( 1, index );
            html=html.substring( index + 1 );

            attribs=[];

            if(tagAndAttrib.search( " " ) > 0) {

                var ret=parseTagAndAttribs(tagAndAttrib);
                tagName=ret.name;
                attribs=ret.attribs;
            }
            else
            {
                tagName=tagAndAttrib.substring( 0, tagAndAttrib.length ).trim().toLowerCase();
            }
            if(tagName === "br") 
            {
                if( !textGroup ) textGroup=VG.UI.HtmlView.TextGroup();

                // Handle Line breaks
                var options={ "font" : this.elements.body.font,
                              "color" : this.elements.body.color };

                var formattedText=VG.UI.HtmlView.FormattedText("", options );

                formattedText.addModifier( VG.UI.HtmlView.TextModifiers( "br" ) );

                textGroup.formattedTextArray.push( formattedText );
            }
            else if( tagName === "li" || tagName === "p" || tagName === "code" || tagName === "img" )
            {
                // End current textGroup if exists.
                if( textGroup ) this.textGroupArray.push( textGroup );

                textGroup=VG.UI.HtmlView.TextGroup( VG.UI.HtmlView.TextGroupNames[ tagName ] );

                if( tagName === "img" )
                {
                    for( var i=0; i < attribs.length; ++i )
                    {
                        if( attribs[i].attrib === "src" )
                        {

                            var formattedText=VG.UI.HtmlView.FormattedText( "" );
                            formattedText.image=attribs[i].value;

                            for( var i=0; i < openedTags.length; ++i ) {

                                if( openedTags[i].tag.indexOf("b") < 0 
                                        && openedTags[i].tag.indexOf("i") < 0 )
                                        
                                    formattedText.addModifier( VG.UI.HtmlView.TextModifiers( openedTags[i].tag, openedTags[i].attribs ), this.elements[openedTags[i].tag] );
                            }

                            textGroup.formattedTextArray.push( formattedText );

                            this.textGroupArray.push( textGroup );
                            textGroup=null;

                            break;
                        }
                    }
                    
                }
            } 
            else
                openedTags.push( { tag : tagName, attribs : attribs } );
        }
        else if( html.indexOf("&vg") == 0 )
        {
            if( !textGroup ) textGroup=VG.UI.HtmlView.TextGroup();

            var options={ "font" : VG.Font.Font("Visual Graphics", this.elements.body.font.size),
                          "color" : this.elements.body.color };

            var formattedText=VG.UI.HtmlView.FormattedText("a", options);

            for( var i=0; i < openedTags.length; ++i ) {

                if( openedTags[i].tag.indexOf("b") < 0 
                        && openedTags[i].tag.indexOf("i") < 0 )
                        
                    formattedText.addModifier( VG.UI.HtmlView.TextModifiers( openedTags[i].tag, openedTags[i].attribs ), this.elements[openedTags[i].tag] );
            }

            textGroup.formattedTextArray.push( formattedText );

            html=html.substring(3);
        }
        else
        {
            // Create a text group if it doesnt already exist.
            if( !textGroup ) textGroup=VG.UI.HtmlView.TextGroup();

            index=html.indexOf( "<" );
            indexSpecial=html.indexOf( "&vg" );
            
            if ( index < 0 ) index=indexSpecial;
            if ( indexSpecial > 0 )
                index=indexSpecial < index ? indexSpecial : index;

            
            var text=index < 0 ? html : html.substring( 0, index );
            html=index < 0 ? "" : html.substring( index );

            var options={ "font" : this.elements.body.font,
                          "color" : this.elements.body.color };
            var formattedText=VG.UI.HtmlView.FormattedText(text, options);
            
            // Apply modifiers for all open tags
            for( var i=0; i < openedTags.length; ++i )
                formattedText.addModifier( VG.UI.HtmlView.TextModifiers( openedTags[i].tag, openedTags[i].attribs ), this.elements[ openedTags[i].tag ] );

            textGroup.formattedTextArray.push( formattedText );
        }
    }

    if( openedTags.length > 0 && html.length ) 
        throw 'Html warning: You forgot to close ' +  openedTags.length + ' tags.' + ' In ' + html;
    // push any unfinished text group
    if( textGroup ) this.textGroupArray.push( textGroup );
    
};

VG.UI.HtmlView.prototype.verifyText=function()
{

    this.maxTextLineSize.set(0, 0);

    this.maxTextLineSize.height=VG.context.workspace.canvas.getLineHeight();

    var gIndex=0;
    var aIndex=0;
    var tIndex=0;

    for ( var i=0; i < this.numTextLines; ++i )
    {
        // Wrap around the formattedTextArray to determine the correct indices.
        if( tIndex >= this.textGroupArray[gIndex].formattedTextArray[aIndex].textLines.length ) {

            tIndex=0;
            ++aIndex;

            if( aIndex >= this.textGroupArray[gIndex].numFormattedTexts ) {

                aIndex=0;
                ++gIndex;
            }

            if( gIndex >= this.numTextGroups ) 
                break;
        }

        var currentGroupItem=this.textGroupArray[gIndex];
        var currentArrayItem=currentGroupItem.formattedTextArray[aIndex];

        if( this.textGroupArray[gIndex].groupModifier === "Code" ) {

            var codeTextArray=currentArrayItem.text.split(/\r\n|\r|\n/);
            var rect=VG.Core.Rect();

            VG.context.workspace.canvas.pushFont( currentGroupItem.codeEdit.font );

            // CodeEdits textLineRect only has its height.
            rect.height=this.elements.code.verticalExpanding ? 
                            codeTextArray.length * VG.context.workspace.canvas.getLineHeight() + 10 : 
                            Math.min( this.elements.code.maxHeight, codeTextArray.length * VG.context.workspace.canvas.getLineHeight());

            VG.context.workspace.canvas.popFont( currentGroupItem.codeEdit.font );

            currentArrayItem.textLineRects.push(rect);

            ++tIndex;
            continue;
        }

        if( this.textGroupArray[gIndex].groupModifier === "Image" ) {

            var rect=VG.Core.Rect();
            rect.height=this.textGroupArray[gIndex].image ? this.textGroupArray[gIndex].image.height : 0;
            rect.width=this.textGroupArray[gIndex].image ? this.textGroupArray[gIndex].image.width : 0;

            currentArrayItem.textLineRects.push(rect);

            ++tIndex;
            continue;
        }

        VG.context.workspace.canvas.pushFont( currentArrayItem.font )

        var size=VG.Core.Size();
        var rect=VG.Core.Rect();

        if(currentArrayItem.getModifier("LineBreak") )
            size.height=this.elements.br.lineHeight;
        else
            VG.context.workspace.canvas.getTextSize( currentArrayItem.textLines[tIndex], size );

        VG.context.workspace.canvas.popFont( currentArrayItem.font )
        
        if( size.width > this.maxTextLineSize.width ) this.maxTextLineSize.width=size.width;
        if ( size.height > this.maxTextLineSize.height ) this.maxTextLineSize.height=size.height;

        rect.width=size.width;
        rect.height=size.height;

        if( tIndex === 0 && currentArrayItem.continueLine ) {

            var j=aIndex-1;
            var k=gIndex;
            var items=0;
            var maxHeight=size.height;

            // Look back to see how many textlines are part of the same line.
            // Find the maximum height among them.
            while( 1 ) {

                if( j < 0 ) {

                    --k;
                    if( k < 0 ) break;

                    j=this.textGroupArray[k].numFormattedTexts-1;
                }

                var preSize=this.textGroupArray[k].formattedTextArray[j]
                                .textLineRects[this.textGroupArray[k].formattedTextArray[j].textLineRects.length - 1];

                maxHeight = maxHeight < preSize.height ? preSize.height : maxHeight;

                ++items;

                // If this formatted text was continued from the previous line and has only one textLine go back further.
                if( this.textGroupArray[k].formattedTextArray[j].textLines.length === 1 
                    && this.textGroupArray[k].formattedTextArray[j].continueLine ) --j; 
                else break;
            }

            rect.height = maxHeight;

            // Set all their heights to maxHeight.
            for( ; items >= 1; --items ) {

                if ( j >= this.textGroupArray[k].numFormattedTexts ) {

                    j = 0;
                    ++k;

                    if( k >= this.numTextGroups ) break;
                }
                this.textGroupArray[k].formattedTextArray[j].textLineRects[this.textGroupArray[k].formattedTextArray[j].textLineRects.length - 1].height = maxHeight;
                ++j;
            }
        }

        currentArrayItem.textLineRects.push(rect);

        ++tIndex;

    }

    this.verified=false;    

};

VG.UI.HtmlView.prototype.processHtml=function()
{
    if ( this.verified ) return;

    this.numTextGroups=this.textGroupArray.length;

    var numTextLines=0;
    var nextStart=0;
    var numContinueLines=0;

    var listIndex=1;
    var rectWidth=0;

    var forceNextLine=false;

    for( var j=0; j < this.numTextGroups; ++j ) {

        this.textGroupArray[j].numFormattedTexts = this.textGroupArray[j].formattedTextArray.length;
        this.textGroupArray[j].numContinueLines=0;

        var textGroup=this.textGroupArray[j];
        textGroup.numTextLines=0;

        if( textGroup.groupModifier === "Code" || textGroup.groupModifier === "Image" )
        {
            // Html formatting is not allowed inside code.
            if(textGroup.numFormattedTexts > 1) throw 'Html Error, Html Formatting is not allowed inside code tags or image tags.';

            textGroup.formattedTextArray[0].textLines.push(textGroup.formattedTextArray[0].text)

            if( textGroup.groupModifier === "Code" )
            {
                textGroup.codeEdit = VG.UI.CodeEdit( textGroup.formattedTextArray[0].text );
                textGroup.codeEdit.font=this.code.font;

                this.childWidgets.push(textGroup.codeEdit);
            }
            else if( textGroup.groupModifier === "Image" )
            {
                textGroup.image = VG.Utils.getImageByName(textGroup.formattedTextArray[0].image);
            }

            textGroup.numTextLines=textGroup.formattedTextArray[0].textLines.length;
            numTextLines+=textGroup.numTextLines;

            continue;
        }

        for( var i=0; i < textGroup.numFormattedTexts; ++i ) {

            var font=this.elements.body.font;
            var fontModifier=textGroup.formattedTextArray[i].getModifier( "Font" );
            if( fontModifier ) {

                if( fontModifier.size )
                    textGroup.formattedTextArray[i].setSize( fontModifier.size );

                if( fontModifier.color )
                    textGroup.formattedTextArray[i].color = fontModifier.color;

                if( this.elements.font.override && fontModifier.fontName )
                    textGroup.formattedTextArray[i].font = VG.Font.Font( fontModifier.fontName, textGroup.formattedTextArray[i].size );
            }

            var boldModifier=textGroup.formattedTextArray[i].getModifier( "Bold" );
            if( boldModifier )
                textGroup.formattedTextArray[i].font=this.elements.b.font;

            var italicModifier=textGroup.formattedTextArray[i].getModifier( "Italic" );
            if( italicModifier )
                textGroup.formattedTextArray[i].font=this.elements.i.font;

            if( forceNextLine ) nextStart=0;

            rectWidth = this.contentRect.width - ( this.elements.body.margin.left + this.elements.body.margin.right );

            if( textGroup.groupModifier === "Paragraph" )
                rectWidth -= this.elements.p.margin.left + this.elements.p.margin.right;

            // Start of a new text group. Or end of a list.
            if( ( i === 0 ) || (!textGroup.formattedTextArray[i].hasListModifiers() && textGroup.formattedTextArray[i-1].hasListModifiers() ) ) {

                forceNextLine=true;
                nextStart=0;
            }

            // Force next line for headings and line breaks.
            if( textGroup.formattedTextArray[i].hasModifier("LineBreak") || textGroup.formattedTextArray[i].hasHeadings() ) {
                
                forceNextLine=true;
                nextStart=0;
            }

            // Indent lists
            if( textGroup.formattedTextArray[i].hasListModifiers() ) {

                if( i === 0) {

                    // Apply list ordering for ordered lists.
                    if( textGroup.formattedTextArray[i].hasModifier( "OrderedList" ) && textGroup.groupModifier == "ListItem" ) {

                        textGroup.formattedTextArray[i].text=listIndex.toString() + ". " + textGroup.formattedTextArray[i].text;
                        ++listIndex;
                    }

                    forceNextLine=true;
                    nextStart=0;
                }
                
                if( textGroup.formattedTextArray[i].hasModifier("UnorderedList") )
                    rectWidth -= this.elements.ul.margin.left + this.elements.ul.textStart + this.elements.ul.margin.right + (this.elements.ul.bulletSize * font.scale);

                else if( textGroup.formattedTextArray[i].hasModifier("OrderedList") )
                    rectWidth -= this.elements.ol.margin.left + this.elements.ol.margin.right;
            }

            if( textGroup.formattedTextArray[i].hasHeadings() ) {

                var headingModifier=textGroup.formattedTextArray[i].getHeading();

                rectWidth -= this.elements[headingModifier.id].margin.left + this.elements[headingModifier.id].margin.right;

                textGroup.formattedTextArray[i].setSize( this.elements[headingModifier.id].font.size );
            }

            font=textGroup.formattedTextArray[i].font;

            textGroup.formattedTextArray[i].resetTextLines();
            
            VG.context.workspace.canvas.pushFont( textGroup.formattedTextArray[i].font );

            var ret=VG.context.workspace.canvas.wordWrap( textGroup.formattedTextArray[i].text, nextStart, rectWidth, textGroup.formattedTextArray[i].textLines );

            VG.context.workspace.canvas.popFont( textGroup.formattedTextArray[i].font );

            textGroup.formattedTextArray[i].textStartPos=ret.forceStartNewLine || forceNextLine ? 0 : nextStart;
            textGroup.formattedTextArray[i].continueLine=textGroup.formattedTextArray[i].textStartPos === 0 ? false: true;

            // If this is a heading force the next text to the next line.
            if( textGroup.formattedTextArray[i].hasHeadings() ) {

                forceNextLine=true;
                nextStart=0;
            }
            else
                forceNextLine=false;
            
            nextStart=ret.nextStart;

            if( textGroup.formattedTextArray[i].continueLine ) 
                ++textGroup.numContinueLines;

            textGroup.numTextLines+=textGroup.formattedTextArray[i].textLines.length;
        }

        numTextLines+=textGroup.numTextLines;
        numContinueLines+=textGroup.numContinueLines;
    }

    this.numTextLines=numTextLines;
    this.numActualLines=numTextLines - numContinueLines;

    this.verifyText();
};

VG.UI.HtmlView.prototype.verifyScrollbar=function()
{

    this.processHtml();

    // --- Check if we have enough vertical space for all text lines

    this.needsVScrollbar=false;

    // Calculate total item height.
    this.totalItemHeight=0;

    var gIndex=0;
    var aIndex=0;
    var tIndex=0;
    for( var i = 0; i < this.numTextLines; ++i ) {

        // Wrap around the formattedTextArray to determine the correct indices.
        if( tIndex >= this.textGroupArray[gIndex].formattedTextArray[aIndex].textLines.length ) {

            tIndex=0;
            ++aIndex;

            if( aIndex >= this.textGroupArray[gIndex].numFormattedTexts ) {

                aIndex=0;
                ++gIndex;
            }

        }

        if( this.textGroupArray[gIndex].groupModifier === "Code" )
        {
            this.totalItemHeight+=this.textGroupArray[gIndex].formattedTextArray[aIndex].textLineRects[tIndex].height 
                                    + this.elements.code.margin.top + this.elements.code.margin.bottom;

            ++tIndex;
            continue;
        }

        if( this.textGroupArray[gIndex].groupModifier === "Image" )
        {
            if( this.textGroupArray[gIndex].image )
            {
                this.totalItemHeight+=this.textGroupArray[gIndex].image.height
                                        + this.elements.image.margin.top + this.elements.image.margin.bottom;
            }

            ++tIndex
            continue;
        }

        if( aIndex === 0 ) {

            if( this.textGroupArray[gIndex].formattedTextArray[aIndex].hasModifier("OrderedList") 
                && gIndex-1 >= 0 
                && !this.textGroupArray[gIndex-1].formattedTextArray[this.textGroupArray[gIndex-1].numFormattedTexts-1].hasModifier("OrderedList") )

                    this.totalItemHeight+=this.elements.ol.margin.top + this.elements.ol.margin.bottom;

            if( this.textGroupArray[gIndex].formattedTextArray[aIndex].hasModifier("UnorderedList") 
                && gIndex-1 >= 0 
                && !this.textGroupArray[gIndex-1].formattedTextArray[this.textGroupArray[gIndex-1].numFormattedTexts-1].hasModifier("UnorderedList") )
                
                    this.totalItemHeight+=this.elements.ul.margin.top + this.elements.ul.margin.bottom;

            if( tIndex === 0 && this.textGroupArray[gIndex].groupModifier === "Paragraph" )
                this.totalItemHeight+=this.elements.p.margin.top + this.elements.p.margin.bottom;
        }

        if( tIndex+1 >= this.textGroupArray[gIndex].formattedTextArray[aIndex].textLines.length 
            && aIndex+1 < this.textGroupArray[gIndex].numFormattedTexts 
            && this.textGroupArray[gIndex].formattedTextArray[aIndex+1].continueLine) {
            
            ++tIndex;
            continue;
        }

        if( this.textGroupArray[gIndex].formattedTextArray[aIndex].hasHeadings() ) {

            var heading=this.textGroupArray[gIndex].formattedTextArray[aIndex].getHeading();
            this.totalItemHeight+=this.elements[heading.id].margin.top + this.elements[heading.id].margin.bottom;
        }

        this.totalItemHeight+=this.textGroupArray[gIndex].formattedTextArray[aIndex].textLineRects[tIndex].height;
        ++tIndex;
    }

    this.totalItemHeight+=(this.numActualLines-1) * this.elements.body.spacing;
    this.averageItemHeight=this.totalItemHeight/this.numActualLines;

    this.totalItemHeight+=this.elements.body.margin.top + this.elements.body.margin.bottom;
    
    if ( this.supportsScrollbars && this.totalItemHeight > this.contentRect.height )
        this.needsVScrollbar=true;

    if ( this.needsVScrollbar && this.supportsScrollbars && !this.vScrollbar ) {
        this.vScrollbar=VG.UI.Scrollbar( "HtmlView Scrollbar" );
        this.vScrollbar.callbackObject=this;
    } 

    this.verified=true;
};

VG.UI.HtmlView.prototype.paintWidget=function( canvas )
{
    if ( !this.rect.equals( this.previousRect ) ) 
        this.verified=false;

    this.rect.round(); // --- Make sure rect is integer only
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, this.body.bgColor );

    if( !this.elements.body.noframe )
        VG.context.style.drawTextEditBorder( canvas, this );
    else
        this.contentRect=this.rect;

    if ( !this.textGroupArray.length ) return;

    canvas.setClipRect( this.contentRect );
    this.contentRect=this.contentRect.add( 4, 2, -8, -4 );

    if ( !this.verified || canvas.hasBeenResized )
        this.verifyScrollbar();

    if ( this.needsVScrollbar )
        this.contentRect.width-=canvas.style.skin.ScrollbarSize + 2;

    var paintRect=VG.Core.Rect( this.contentRect );
    paintRect.x=this.contentRect.x + this.elements.body.margin.left;
    paintRect.y=this.contentRect.y - this.textOffset.y + this.elements.body.margin.top;
    paintRect.height=this.maxTextLineSize.height;

    this.visibleHeight=0;

    var textColor;
    if ( !this.disabled ) textColor=VG.context.style.skin.HtmlViewTextColor;
    else textColor=VG.context.style.skin.HtmlViewTextColor;

    var tIndex=0;
    var aIndex=0;
    var gIndex=0;
    var numContinueLines=0;  
     
    for ( var i=0; i < this.numTextLines; ++i ) {

        // Wrap around the formattedTextArray to determine the correct indices.
        if( tIndex >= this.textGroupArray[gIndex].formattedTextArray[aIndex].textLines.length ) {
            tIndex=0;
            ++aIndex;

            if( aIndex >= this.textGroupArray[gIndex].numFormattedTexts ) {

                aIndex=0;
                ++gIndex;
            }
        }

        var currentGroupItem=this.textGroupArray[gIndex];
        var currentArrayItem=currentGroupItem.formattedTextArray[aIndex];

        paintRect.x=this.contentRect.x + this.elements.body.margin.left;
        
        /*
         * Apply top and left margins
         */

        if( currentGroupItem.groupModifier === "Paragraph" )
            paintRect.x+=this.elements.p.margin.left;

        var heading=currentArrayItem.getHeading();
        if( heading ) {
            
            paintRect.x+=this.elements[heading.id].margin.left;

            if( i > 0)  paintRect.y+=this.elements[heading.id].margin.top;
        }

        if( currentArrayItem.hasModifier("UnorderedList") ) {

            paintRect.x+=this.elements.ul.margin.left

            if( gIndex-1 >= 0 && aIndex === 0 
                && !this.textGroupArray[gIndex-1].formattedTextArray[this.textGroupArray[[gIndex-1]].numFormattedTexts-1].hasModifier("UnorderedList"))
            paintRect.y+=this.elements.ul.margin.top;    
        }
        

        if( currentArrayItem.hasModifier("OrderedList") ) {

            paintRect.x+=this.elements.ol.margin.left

            if( gIndex-1 >= 0 && aIndex === 0
                && !this.textGroupArray[gIndex-1].formattedTextArray[this.textGroupArray[[gIndex-1]].numFormattedTexts-1].hasModifier("OrderedList") )
            paintRect.y+=this.elements.ol.margin.top;
        }

        if( tIndex ===0 && aIndex === 0 && currentGroupItem.groupModifier === "Paragraph" )
                paintRect.y+=this.elements.p.margin.top;


        /*
         * Embedded CodeEdit
         */
        if( currentGroupItem.groupModifier === "Code" && currentGroupItem.codeEdit ) {

            paintRect.x+=this.elements.code.margin.left;
            paintRect.y+=this.elements.code.margin.top;
        }

        if( currentGroupItem.groupModifier === "Image" && currentGroupItem.image ) {

            paintRect.x+=this.elements.image.margin.left;
            paintRect.y+=this.elements.image.margin.top;
        }
        
        paintRect.height=currentArrayItem.textLineRects[tIndex].height;

        if ( paintRect.y + paintRect.height >= this.contentRect.y || paintRect.y < this.contentRect.bottom() ) {
            
            if(currentGroupItem.groupModifier === "Code" && currentGroupItem.codeEdit ) {

                var codeRect=VG.Core.Rect( paintRect );

                codeRect.width-=codeRect.x - this.contentRect.x + this.elements.code.margin.right;

                currentGroupItem.codeEdit.rect.set(codeRect);
                currentGroupItem.codeEdit.paintWidget(canvas);

                paintRect.y+=paintRect.height + this.elements.code.margin.bottom;

                canvas.setClipRect( this.contentRect );
                ++tIndex;
                continue;
            }

            if ( currentGroupItem.groupModifier === "Image" ) {

                if( currentGroupItem.image )
                {
                    var maxImgWidth=this.contentRect.width - this.elements.body.margin.right
                                        - this.elements.body.margin.left - this.elements.image.margin.left 
                                        - this.elements.image.margin.right;

                    var imgWidth=Math.min( maxImgWidth, currentGroupItem.image.width );
                    currentArrayItem.textLineRects[0].width=imgWidth;

                    // Centre image
                    var imgX=this.contentRect.width / 2 - ( imgWidth / 2 );

                    canvas.drawImage( VG.Core.Point( imgX, paintRect.y), currentGroupItem.image, VG.Core.Size( imgWidth, currentGroupItem.image.height ));

                    paintRect.y+=paintRect.height + this.elements.image.margin.bottom;

                    ++tIndex;
                    continue;
                }
            }

            // Make sure the next formatted text starts immediately
            // Adjust paintRect.x accordingly.
            if( tIndex == 0 ) 
                paintRect.x+=currentArrayItem.textStartPos;
            
            var text=currentArrayItem.textLines[tIndex];

            // If the first line of the next formatted text should continue in the previous line
            // move the paintRect back and draw it.
            if ( tIndex === 0 && currentArrayItem.continueLine ) {
                paintRect.y-=( paintRect.height + this.elements.body.spacing );
                this.visibleHeight-=paintRect.height + this.elements.body.spacing;
            }

            //var fontModifier=currentArrayItem.getModifier("Font");
            var textColor=VG.context.style.skin.HtmlViewTextColor;
            var bgColor=VG.context.style.skin.WidgetBackgroundColor;
            var font=this.elements.body.font;

            font=currentArrayItem.font;
            textColor=currentArrayItem.color;
            bgColor=currentArrayItem.bgColor ? currentArrayItem.bgColor : bgColor;

            VG.context.workspace.canvas.pushFont( font );
        
            if( currentGroupItem.groupModifier === "ListItem"
                && currentArrayItem.hasModifier("UnorderedList")
                && aIndex === 0 && tIndex === 0 ) {

                // Draw a circle for the bullet point
                var circleRect = VG.Core.Rect( paintRect.x, 
                    paintRect.y + paintRect.height/2 - this.elements.ul.bulletSize/2 * font.scale, 
                        this.elements.ul.bulletSize * font.scale , this.elements.ul.bulletSize * font.scale);
                
                canvas.draw2DShape( VG.Canvas.Shape2D.Circle, circleRect,  textColor);
            }

            // Apply offset after bullet symbol for unordered list.
            if( currentArrayItem.hasModifier("UnorderedList") )
                paintRect.x+=this.elements.ul.textStart + this.elements.ul.bulletSize * font.scale;

            if ( currentArrayItem.hasModifier("Link")
                    && currentArrayItem.mouseOver ) {

                var underlineRect = VG.Core.Rect( paintRect.x, 
                    paintRect.y + paintRect.height - canvas.fonts[canvas.fontIndex].triFont.descender, 
                        currentArrayItem.textLineRects[tIndex].width, 
                            this.elements.a.underlineHeight );
            
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, underlineRect,  textColor);
            }
                
            currentArrayItem.textLineRects[tIndex].x = paintRect.x;
            currentArrayItem.textLineRects[tIndex].y = paintRect.y;
            canvas.drawTextRect( text, paintRect , textColor, this.hAlignment, 1);
            
            VG.context.workspace.canvas.popFont( font );

            paintRect.y+=paintRect.height + this.elements.body.spacing;
            this.visibleHeight+=paintRect.height + this.elements.body.spacing;

            ++tIndex;

            /*
             * Apply bottom margins
             */
            if( tIndex >= currentArrayItem.textLines.length ) {

                if( heading )
                    paintRect.y+=this.elements[heading.id].margin.bottom;

                if( currentGroupItem.groupModifier === "Paragraph" 
                    && aIndex+1 >= currentGroupItem.numFormattedTexts )
                        
                    paintRect.y+=this.elements.p.margin.bottom;
                
                if( aIndex+1 >= currentGroupItem.numFormattedTexts
                        || currentGroupItem.groupModifier === "None" ) {

                    if( currentArrayItem.hasModifier("UnorderedList") && gIndex+1 < this.numTextGroups 
                        && !this.textGroupArray[gIndex+1].formattedTextArray[0].hasModifier("UnorderedList") )

                        paintRect.y+=this.elements.ul.margin.bottom;

                    if( currentArrayItem.hasModifier("OrderedList") && gIndex+1 < this.numTextGroups 
                        && !this.textGroupArray[gIndex+1].formattedTextArray[0].hasModifier("OrderedList") )

                        paintRect.y+=this.elements.ol.margin.bottom;
                }
            }
            
        } else break;
    }

    canvas.setClipRect( false );

    if( this.needsVScrollbar ) {

        this.setVScrollbarDimensions( canvas );
        this.vScrollbar.paintWidget( canvas );
    }

    this.previousRect.set( this.rect ); 
};

VG.UI.HtmlView.prototype.vHandleMoved=function( offsetInScrollbarSpace )
{
    this.textOffset.y=offsetInScrollbarSpace * this.vScrollbar.totalSize / this.vScrollbar.visibleSize;
};

VG.UI.HtmlView.prototype.mouseMove=function( event )
{
    if ( this.needsVScrollbar && this.vScrollbar )
    {
        if ( this.vScrollbar.rect.contains( event.pos ) ) {
            this.vScrollbar.mouseMove( event );
            return;
        } else
        {
            if ( this.vScrollbar.visualState === VG.UI.Widget.VisualState.Hover ) {
                this.vScrollbar.visualState=VG.UI.Widget.VisualState.Normal;
                VG.update();
            }
        }
    }

    // Test if the mouse-pointer is inside one of the texts with a link modifier.

    var gIndex=0;
    var aIndex=0;
    var tIndex=0;

    for( var i=0; i < this.numTextLines; ++i ) {

        // Wrap around the formattedTextArray to determine the correct indices.
        if( tIndex >= this.textGroupArray[gIndex].formattedTextArray[aIndex].textLines.length ) {
            tIndex=0;
            ++aIndex;

            if( aIndex >= this.textGroupArray[gIndex].numFormattedTexts ) {

                aIndex=0;
                ++gIndex;
            }
        }

        if( this.textGroupArray[gIndex].formattedTextArray[aIndex].hasModifier("Link") ) {

            if ( this.textGroupArray[gIndex].formattedTextArray[aIndex].textLineRects[tIndex].contains( event.pos ) )  {

                VG.setMouseCursor("pointer");
                this.textGroupArray[gIndex].formattedTextArray[aIndex].mouseOver=true;
                VG.update();
                break;
            }
            else {

                if( this.textGroupArray[gIndex].formattedTextArray[aIndex].mouseOver ) {

                    this.textGroupArray[gIndex].formattedTextArray[aIndex].mouseOver=false;
                    VG.update();
                }
            }
        }

        ++tIndex;
    }

};

VG.UI.HtmlView.prototype.mouseDown=function( event )
{
    // --- Test if the mouse-click is inside one of the scrollbars

    if ( this.needsVScrollbar && this.vScrollbar && this.vScrollbar.rect.contains( event.pos ) ) {
        this.vScrollbar.mouseDown( event );
        return;
    }

    // Test if the mouse-click is inside one of the texts with a link modifier.

    var gIndex=0;
    var aIndex=0;
    var tIndex=0;

    for( var i=0; i < this.numTextLines; ++i ) {

        // Wrap around the formattedTextArray to determine the correct indices.
        if( tIndex >= this.textGroupArray[gIndex].formattedTextArray[aIndex].textLines.length ) {
            tIndex=0;
            ++aIndex;

            if( aIndex >= this.textGroupArray[gIndex].numFormattedTexts ) {

                aIndex=0;
                ++gIndex;
            }
        }

        if( this.textGroupArray[gIndex].formattedTextArray[aIndex].hasModifier("Link") ) {

            if ( this.textGroupArray[gIndex].formattedTextArray[aIndex].textLineRects[tIndex].contains( event.pos ) )  {

                if( this.linkCallback ) {

                    var linkModifier=this.textGroupArray[gIndex].formattedTextArray[aIndex].getModifier("Link");

                    var link=linkModifier.hasAttrib("link") ? linkModifier.link : null;

                    if( link ) {

                        this.linkCallback( link );
                        return;  
                    } 
                }
            }
        }

        ++tIndex;
    }
};

VG.UI.HtmlView.prototype.mouseWheel=function( step )
{
    if ( !this.needsVScrollbar ) return false;

    if ( step > 0 ) 
    {
        this.textOffset.y-=this.averageItemHeight;
        this.vScrollbar.scrollTo( this.textOffset.y );  
    } else 
    {
        this.textOffset.y+=this.averageItemHeight;
        this.vScrollbar.scrollTo( this.textOffset.y );   
    }

    VG.update();    

    return true;
};

VG.UI.HtmlView.prototype.setVScrollbarDimensions=function( canvas )
{
    this.vScrollbar.rect=VG.Core.Rect( this.contentRect.right() + 2, this.contentRect.y, canvas.style.skin.ScrollbarSize, this.contentRect.height );
    
    this.vScrollbar.setScrollbarContentSize( this.totalItemHeight, this.contentRect.height );
};

// ----------------------------------------------------------------- VG.UI.HtmlView.TextGroup
// Groups text based on a common charasteristic

VG.UI.HtmlView.TextGroupNames={

    "None" : "None",
    "li" : "ListItem",
    "p" : "Paragraph",
    "code" : "Code",
    "img" : "Image"
}

VG.UI.HtmlView.TextGroup=function( groupModifier )
{
    if ( !(this instanceof VG.UI.HtmlView.TextGroup) ) return new VG.UI.HtmlView.TextGroup( groupModifier );

    this.formattedTextArray=[];

    this.numFormattedTexts=0;
    this.numTextLines=0;
    this.numContinueLines=0;

    this.groupModifier=VG.UI.HtmlView.TextGroupNames.None;

    if ( arguments.length && arguments[0])
        this.groupModifier=arguments[0];  
}

VG.UI.HtmlView.TextGroup.prototype=VG.UI.HtmlView.TextGroup();

// ----------------------------------------------------------------- VG.UI.HtmlView.FormattedText
// Contains format info for a string.

VG.UI.HtmlView.FormattedText=function( text, options )
{
    if ( !(this instanceof VG.UI.HtmlView.FormattedText) ) return new VG.UI.HtmlView.FormattedText( text, options);

    if ( !options ) options="";

    this.font = options.font ? options.font : VG.context.style.skin.HtmlViewDefaultFont;
    this.size = options.font ? options.font.size : this.font.size;
    this.color = options.color ? options.color : VG.context.style.skin.HtmlViewTextColor;

    this.textModifiers = options.modifiers ? options.modifiers : [];

    this.mouseOver=false;

    this.textLines=[];
    this.textLineRects=[];

    this.textStartPos=0;
    this.continueLine=false;
    this.maxTextLineSize=VG.Core.Size();

    if ( arguments.length ) this.text=arguments[0];
    else this.text="";
};

VG.UI.HtmlView.FormattedText.prototype.setSize=function( size )
{
    this.size = size;
    this.font = VG.Font.Font( this.font.name, this.size );
}

VG.UI.HtmlView.FormattedText.prototype=VG.UI.HtmlView.FormattedText();

VG.UI.HtmlView.FormattedText.prototype.hasModifier=function( name )
{
    for ( var i=0; i < this.textModifiers.length; ++i )
        if ( this.textModifiers[i].name === name ) return true;

    return false;
};

VG.UI.HtmlView.FormattedText.prototype.hasHeadings=function()
{
    for ( var i=0; i < this.textModifiers.length; ++i )
        if ( this.textModifiers[i].name.indexOf("Heading") >= 0 ) return true;

    return false;
}

VG.UI.HtmlView.FormattedText.prototype.hasListModifiers=function()
{
    // Check for unordered, ordered, list item modifiers
    for( var i=0; i < this.textModifiers.length; ++i )
        if( this.textModifiers[i].name.indexOf("List") >= 0 ) return true;
}

VG.UI.HtmlView.FormattedText.prototype.getHeading=function()
{
    for ( var i=0; i < this.textModifiers.length; ++i )
        if ( this.textModifiers[i].name.indexOf("Heading") >= 0 ) return this.textModifiers[i];

    return null;
}

VG.UI.HtmlView.FormattedText.prototype.getModifier=function( name )
{
    for ( var i=0; i < this.textModifiers.length; ++i )
        if ( this.textModifiers[i].name === name ) return this.textModifiers[i];
};

VG.UI.HtmlView.FormattedText.prototype.addModifier=function( modifier, options )
{
    this.textModifiers.push(modifier);

    if( options ) {

        if( this.font.name.indexOf("Visual Graphics") < 0 )
        {
            this.font=options.font ? options.font : this.font;
        }
        else
        {
            var size=options.font ? options.font.size : this.font.size;
            this.font=VG.Font.Font("Visual Graphics", size);
        }

        this.color=options.color ? options.color : this.color;
        this.bgColor=options.bgColor ? options.bgColor : this.bgColor;
    }
};

VG.UI.HtmlView.FormattedText.prototype.resetTextLines=function()
{
    this.textLines=[];
    this.textLineRects=[];
    this.maxTextLineSize=0;
}

// ----------------------------------------------------------------- VG.UI.HtmlView.TextModifiers
// Contains modifier info

VG.UI.HtmlView.ModifierNames={

    "b" : "Bold",
    "i" : "Italic",
    "br" : "LineBreak",
    "font" : "Font",
    "ol" : "OrderedList",
    "ul" : "UnorderedList",
    "h1" : "Heading1",
    "h2" : "Heading2",
    "h3" : "Heading3",
    "h4" : "Heading4",
    "h5" : "Heading5",
    "h6" : "Heading6",
    "a" : "Link"
};

VG.UI.HtmlView.HtmlColors={

    "aqua" : VG.Core.Color( 0, 255, 255 ),
    "black" : VG.Core.Color( 0, 0, 0 ),
    "blue" : VG.Core.Color( 0, 0, 255 ),
    "fuchsia" : VG.Core.Color( 255, 0, 255 ),
    "gray" : VG.Core.Color( 128, 128, 128 ),
    "green" : VG.Core.Color( 0, 128, 0 ),
    "lime" : VG.Core.Color( 0, 255, 0 ),
    "maroon" : VG.Core.Color( 128, 0, 0 ),
    "navy" : VG.Core.Color( 0, 0, 128 ),
    "olive" : VG.Core.Color( 128, 128, 0 ),
    "orange" : VG.Core.Color( 225, 165, 0 ),
    "purple" : VG.Core.Color( 128, 0, 128 ),
    "red" : VG.Core.Color( 255, 0, 0 ),
    "silver" : VG.Core.Color( 192, 192, 192 ),
    "teal" : VG.Core.Color( 0, 128, 128 ),
    "white" : VG.Core.Color( 255, 255, 255 ),
    "yellow" : VG.Core.Color( 255, 255, 0 ),

};

VG.UI.HtmlView.TextModifiers=function( id, attribs )
{
    if ( !(this instanceof VG.UI.HtmlView.TextModifiers) ) return new VG.UI.HtmlView.TextModifiers( id, attribs );

    this.id=id;
    this.name=VG.UI.HtmlView.ModifierNames[id];

    
    if(!attribs) {
        //@TODO: Improve this!
        if ( this.name === "Font" )
        {
            attribs = [];
        }
    }


    if(attribs) this.setAttribs(attribs);
};

VG.UI.HtmlView.TextModifiers.prototype=VG.UI.HtmlView.TextModifiers();

VG.UI.HtmlView.TextModifiers.prototype.setAttribs=function( attribs )
{
    // Font tag
    switch( this.name ) {

        case "Font":

            if( !attribs ) return;

            for ( var i=0; i < attribs.length; ++i ) {

                if( attribs[i].attrib === "color" ) {

                    if( attribs[i].value.indexOf("#") === 0 )
                        this.color=VG.Core.Color( attribs[i].value );
                    else
                        this.color=VG.UI.HtmlView.HtmlColors[ attribs[i].value ];
                }
                if( attribs[i].attrib === "size" ) this.size=parseInt( attribs[i].value );
                if( attribs[i].attrib === "face" ) this.fontName=attribs[i].value;
            }

            break;

        case "Link":

            if( !attribs ) return;

            for( var i=0; i < attribs.length; ++i ) {

                if( attribs[i].attrib === "href" ) this.link=attribs[i].value;
            }
            break;
    }

};

VG.UI.HtmlView.TextModifiers.prototype.hasAttrib=function( attrib )
{
    if ( this.hasOwnProperty( attrib ) ) return true;

    return false;
}