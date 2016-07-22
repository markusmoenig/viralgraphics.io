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

// ----------------------------------------------------------------- VG.Nodes.ParamContainerEdit

VG.Nodes.ParamContainerEdit=function( container )
{   
    if ( !(this instanceof VG.Nodes.ParamContainerEdit ) ) return new VG.Nodes.ParamContainerEdit( container );

    VG.UI.Widget.call( this );
    this.name="ParamContainerEdit";

    this.container=container;

    this.snapperWidget=VG.UI.SnapperWidget();
    this.layout=VG.UI.Layout( this.snapperWidget );
    this.layout.margin.set( 0, 0, 0, 0 );
    this.layout.parent=this;

    for( var i=0; i < this.container.groups.length; ++i )
    {
        var group=this.container.groups[i];
        group.layout=VG.UI.LabelLayout();

        this.snapperWidget.addItem( group.text, group.layout, group.open );

        for( var p=0; p < group.parameters.length; ++p )
        {
            var param=group.parameters[p];

            if ( param instanceof VG.Nodes.ParamNumber )
            {
                param.widget=VG.UI.NumberEdit( param.data[param.name], param.min, param.max, param.precision );
                param.widget.name=param.name;

                param.widget.changed=function( value, contineous, object ) {
                    var param=this.container.getParam( object.name );

                    // --- Send undo packet with old & new value
                    if (  this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange )  {
                        var object={ oldValue: param.data[param.name], newValue: value };
                        this.container.node.graph.nodePropertyWillChange( param, object );
                    }

                    param.data[param.name]=value;

                    // --- Update the graph
                    if (  this.container.node && this.container.node.graph  )
                        this.container.node.graph.update();
                }.bind( this );

                group.layout.addChild( param.text, param.widget );
            } else
            if ( param instanceof VG.Nodes.ParamSlider )
            {
                param.widget=VG.UI.Slider( param.min, param.max, param.step, true, param.precision );
                param.widget.edit.minimumSize.width=55;
                param.widget.value=param.data[param.name];
                param.widget.name=param.name;

                param.widget.changed=function( value, continuous, object ) {

                    var param=this.container.getParam( object.name );

                    // --- Send undo packet with old & new value
                    if ( !continuous && this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange )  {
                        var object={ oldValue: param.widget.startValue, newValue: value };
                        this.container.node.graph.nodePropertyWillChange( param, object );
                    }

                    param.data[param.name]=value;

                    // --- Update the graph
                    if (  this.container.node && this.container.node.graph  )
                        this.container.node.graph.update();
                }.bind( this );

                param.widget.disabled=param.disabled;
                group.layout.addChild( param.text, param.widget );
            } else            
            if ( param instanceof VG.Nodes.ParamBoolean )
            {
                param.widget=VG.UI.CheckBox( param.data[param.name] );
                param.widget.name=param.name;

                param.widget.changed=function( value, object ) {
                    var param=this.container.getParam( object.name );

                    // --- Send undo packet with old & new value
                    if (  this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange )  {
                        var object={ oldValue: param.data[param.name], newValue: value };
                        this.container.node.graph.nodePropertyWillChange( param, object );
                    }

                    param.data[param.name]=value;

                    // --- Update the graph
                    if (  this.container.node && this.container.node.graph  )
                        this.container.node.graph.update();
                }.bind( this );

                group.layout.addChild( param.text, param.widget );
            } else       
            if ( param instanceof VG.Nodes.ParamList )
            {
                param.widget=VG.UI.DropDownMenu();
                param.widget.name=param.name;

                if ( param.list ) {
                    for ( var ii=0; ii < param.list.length; ++ii )
                        param.widget.addItem( param.list[ii] );
                }

                param.widget.index=param.data[param.name];
                if ( param.callback ) param.callback( param.data[param.name] );

                param.widget.changed=function( value, textValue, object ) {
                    var param=this.container.getParam( object.name );

                    // --- Send undo packet with old & new value
                    if (  this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange )  {
                        var object={ oldValue: param.data[param.name], newValue: value };
                        this.container.node.graph.nodePropertyWillChange( param, object );
                    }

                    param.data[param.name]=value;

                    if ( param.callback ) param.callback( value );

                    // --- Update the graph
                    if (  this.container.node && this.container.node.graph  )
                        this.container.node.graph.update();
                }.bind( this );

                group.layout.addChild( param.text, param.widget );
            } else       
            if ( param instanceof VG.Nodes.ParamVector2 )
            {
                param.widget=VG.UI.Vector2Edit( param.data[param.name].x, param.data[param.name].y, param.min, param.max );
                param.widget.name=param.name;

                param.widget.changed=function( value, contineous, object ) {
                    var param=this.container.getParam( object.name );

                    // --- Send undo packet with old & new value
                    if (  this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange )  {
                        var object={ oldValue: { x : param.data[param.name].x, y : param.data[param.name].y }, 
                            newValue: { x: value.x, y : value.y } };
                        this.container.node.graph.nodePropertyWillChange( param, object );
                    }

                    param.data[param.name].x=value.x;
                    param.data[param.name].y=value.y;

                    // --- Update the graph
                    if (  this.container.node && this.container.node.graph  )
                        this.container.node.graph.update();
                }.bind( this );

                group.layout.addChild( param.text, param.widget );
            } else           
            if ( param instanceof VG.Nodes.ParamVector3 )
            {
                param.widget=VG.UI.Vector3Edit( param.data[param.name].x, param.data[param.name].y, param.data[param.name].z, param.min, param.max );
                param.widget.name=param.name;
                param.widget.fixedPrecision=3;
                param.widget.enableXYZMode();
                param.widget.minimumSize.height=30;

                param.widget.changed=function( value, contineous, object ) {
                    var param=this.container.getParam( object.name );

                    // --- Send undo packet with old & new value
                    if (  this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange )  {
                        var object={ oldValue: { x : param.data[param.name].x, y : param.data[param.name].y, z : param.data[param.name].z }, 
                            newValue: { x: value.x, y : value.y, z : value.z } };
                        this.container.node.graph.nodePropertyWillChange( param, object );
                    }

                    param.data[param.name].x=value.x;
                    param.data[param.name].y=value.y;
                    param.data[param.name].z=value.z;

                    // --- Update the graph
                    if (  this.container.node && this.container.node.graph  )
                        this.container.node.graph.update();
                }.bind( this );

                group.layout.addChild( param.text, param.widget );
            } else     
            if ( param instanceof VG.Nodes.ParamVector4 )
            {
                param.widget=VG.UI.Vector4Edit( param.data[param.name].x, param.data[param.name].y, param.data[param.name].z, param.data[param.name].w, param.min, param.max );
                param.widget.name=param.name;

                param.widget.changed=function( value, contineous, object ) {
                    var param=this.container.getParam( object.name );

                    // --- Send undo packet with old & new value
                    if (  this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange )  {
                        var object={ oldValue: { x : param.data[param.name].x, y : param.data[param.name].y, z : param.data[param.name].z, w : param.data[param.name].w },
                            newValue: { x: value.x, y : value.y, z : value.z, w : value.w } };
                        this.container.node.graph.nodePropertyWillChange( param, object );
                    }

                    param.data[param.name].x=value.x;
                    param.data[param.name].y=value.y;
                    param.data[param.name].z=value.z;
                    param.data[param.name].w=value.w;

                    // --- Update the graph
                    if (  this.container.node && this.container.node.graph  )
                        this.container.node.graph.update();
                }.bind( this );

                group.layout.addChild( param.text, param.widget );
            } else              
            if ( param instanceof VG.Nodes.ParamColor )
            {
                param.widget=VG.UI.ColorWheel();

                param.value.setValue( param.data[param.name].r, param.data[param.name].g, param.data[param.name].b,
                    param.data[param.name].a );

                param.widget.color=param.value;
                param.widget.name=param.name;

                param.widget.changed=function( value, continuous, object ) {
                    if ( continuous ) return;

                    var param=this.container.getParam( object.name );

                    // --- Send undo packet with old & new value
                    if (  this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange )  {
                        var object={ oldValue: { r : param.data[param.name].r, g : param.data[param.name].g, b : param.data[param.name].b, a : param.data[param.name].a },
                            newValue: { r: value.r, g : value.g, b : value.b, a : value.a } };
                        this.container.node.graph.nodePropertyWillChange( param, object );
                    }

                    param.data[param.name].r=value.r;
                    param.data[param.name].g=value.g;
                    param.data[param.name].b=value.b;
                    param.data[param.name].a=value.a;

                    if (  this.container.node && this.container.node.graph && this.container.node.graph.update ) 
                        this.container.node.graph.update();               
                }.bind( this );

                group.layout.addChild( param.text, param.widget );
            }  else
            if ( param instanceof VG.Nodes.ParamImage )
            {
                param.widget=VG.UI.ImageSelector( param.data[param.name].imageName );
                //param.widget.color=String( param.value );
                param.widget.name=param.name;

                param.widget.changed=function( image, imageName, object ) {
                    var param=this.container.getParam( object.name );

                    // --- Send undo packet with old & new value
                    if (  this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange )  {
                        var object={ oldValue: { imageData : param.data[param.name].imageData, imageName : param.data[param.name].imageName },
                            newValue: { imageData: image.imageData, imageName : imageName } };
                        this.container.node.graph.nodePropertyWillChange( param, object );
                    }

                    param.data[param.name].imageData=image.imageData;
                    param.data[param.name].imageName=imageName;

                    VG.decompressImageData( image.imageData, param.value, function() {
                        if (  this.container.node && this.container.node.graph && this.container.node.graph.update ) 
                        this.container.node.graph.update();                          
                    }.bind( this ) );

                    if (  this.container.node && this.container.node.graph && this.container.node.graph.update ) 
                        this.container.node.graph.update();                       
                }.bind( this );

                group.layout.addChild( param.text, param.widget );
            }   
        }
    }
};

VG.Nodes.ParamContainerEdit.prototype=VG.UI.Widget();

VG.Nodes.ParamContainerEdit.prototype.paintWidget=function( canvas )
{  
    this.layout.rect.set( this.rect );
    this.layout.layout( canvas );
};

// ----------------------------------------------------------------- VG.UI.ImageSelector

VG.UI.ImageSelector=function( name )
{
    if ( !(this instanceof VG.UI.ImageSelector) ) return new VG.UI.ImageSelector( name );

    VG.UI.Widget.call( this );
    this.name="ImageSelector";
    this.imageName=name;

    this.supportsFocus=true;
    this.minimumSize.width=40;
    
    this.horizontalExpanding=true;
    this.verticalExpanding=false;

    this.label=VG.UI.Label( name );
    this.label.horizontalExpanding=true;
    this.label.frameType=VG.UI.Frame.Type.Box;
    this.label.hAlignment=VG.UI.HAlignment.Left;

    this.button=VG.UI.Button( "Select..." );
    //this.button.big=false;

    this.button.clicked=function() {
        var fileDialog=VG.OpenFileDialog( VG.UI.FileDialog.Image, function( name, image ) {

            this.label.text=VG.Utils.fileNameFromPath( name );
            if ( this.changed ) this.changed( image, this.label.text, this );

        }.bind( this ) );
    }.bind( this );

    this.layout=VG.UI.Layout( this.label, this.button );
    this.layout.margin.set( 0, 0, 0, 0 );
};

VG.UI.ImageSelector.prototype=VG.UI.Widget();

VG.UI.ImageSelector.prototype.calcSize=function( canvas )
{
    return this.label.calcSize( canvas );
};

VG.UI.ImageSelector.prototype.paintWidget=function( canvas )
{
    this.layout.rect.set( this.rect );
    this.layout.layout( canvas );
};
