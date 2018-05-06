/*
 * Copyright (c) 2014-2017 Markus Moenig <markusm@visualgraphics.tv> and Contributors
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

// ----------------------------------------------------------------- VG.Nodes.ParamContainerEdit

VG.Nodes.ParamContainerEdit=function( container, { tabs = false, noContainer = false, callback, horizontal = false } = {} )
{
    if ( !(this instanceof VG.Nodes.ParamContainerEdit ) ) return new VG.Nodes.ParamContainerEdit( container, { tabs, noContainer, callback } );

    VG.UI.Widget.call( this );
    this.name="ParamContainerEdit";
    this.container=container;

    if ( !tabs ) this.containerWidget=VG.UI.SnapperWidget( { horizontal: horizontal } );
    else {
        this.containerWidget=VG.UI.TabWidget();
        this.containerWidget.small=true;
    }

    this.layout=VG.UI.Layout( this.containerWidget );
    this.layout.margin.set( 0, 0, 0, 0 );
    this.layout.parent=this;

    if ( !container ) return;

    for( let i=0; i < this.container.groups.length; ++i )
    {
        var group=this.container.groups[i];
        if ( !group.visible ) continue;

        group.layout = new VG.UI.LabelLayout();
        if ( group.disabled ) group.layout.disabled = true;

        if ( tabs ) this.containerWidget.addItem( group.text, group.layout );
        else this.containerWidget.addItem( group.text, group.layout, group.open );

        for( let p=0; p < group.parameters.length; ++p )
        {
            let param=group.parameters[p], object;

            if ( param instanceof VG.Nodes.ParamText )
            {
                param.widget=VG.UI.TextLineEdit( param.data[param.name] );
                param.widget.name=param.name;
                param.widget.maximumSize.width = 320;

                param.widget.textChanged=function( value, contineous, object ) {
                    var param=this.container.getParam( object.name );

                    // --- Send undo packet with old & new value
                    if (  this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange )  {
                        object={ oldValue: param.data[param.name], newValue: value };
                        this.container.node.graph.nodePropertyWillChange( param, object );
                    }

                    param.data[param.name]=value;

                    // --- Update the graph
                    if (  this.container.node && this.container.node.graph  )
                        this.container.node.graph.update();
                }.bind( this );

                group.layout.addChild( param.text, param.widget );
            } else
            if ( param instanceof VG.Nodes.ParamHtml )
            {
                param.widget=VG.UI.HtmlWidget();
                param.widget.margin.set( 0, 0.5, 0, 0 );
                param.widget.adjustToHeight = true;
                param.widget.html = param.data[param.name];
                param.widget.supportsAutoFocus = true;
                param.widget.linkCallback=function( link ) {
                    VG.gotoUrl( link );
                };
                param.widget.name=param.name;

                group.layout.addChild( param.text !== "Html" ? param.text : "", param.widget );
            } else
            if ( param instanceof VG.Nodes.ParamNumber )
            {
                param.widget=VG.UI.NumberEdit( param.data[param.name], param.min, param.max, param.precision );
                param.widget.name=param.name;

                param.widget.changed=function( value, contineous, object ) {
                    var param=this.container.getParam( object.name );

                    // --- Send undo packet with old & new value
                    if (  this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange )  {
                        object={ oldValue: param.data[param.name], newValue: value };
                        this.container.node.graph.nodePropertyWillChange( param, object );
                    }

                    param.data[param.name]=value;

                    // --- Update the graph
                    if (  this.container.node && this.container.node.graph  )
                        this.container.node.graph.update();
                    if ( callback ) callback();
                }.bind( this );

                group.layout.addChild( param.text, param.widget );
            } else
            if ( param instanceof VG.Nodes.ParamSlider )
            {
                param.widget=VG.UI.Slider( { min : param.min, max : param.max, step : param.step, editable : true, precision : param.precision } );
                param.widget.halfWidthValue=param.halfWidthValue;
                if ( horizontal ) param.widget.minimumSize.width=260;
                param.widget.edit.minimumSize.width=55;
                param.widget.value=param.data[param.name];
                param.widget.name=param.name;
                param.widget.maximumSize.width = 320;

                param.widget.changed=function( value, continuous, object ) {

                    var autoKey=this.container.node && this.container.node.graph && this.container.node.graph.autoKeying;
                    var param=this.container.getParam( object.name );

                    if ( autoKey )
                    {
                        let frame = this.container.node.graph.time.frames - this.container.node.inTime.frames;
                        let key = this.container.keyFrameAt( param.data, frame );
                        let noUndo = continuous, addKey = true;

                        if ( key === undefined ) noUndo = false;

                        if ( key ) {

                            if ( key[param.name] === value ) addKey=false;
                            else if ( continuous && this.contStartValue === undefined ) {
                                this.contStartValue = key[param.name];
                            }
                        }

                        if ( key && !addKey && !continuous && this.contStartValue !== undefined ) {
                            addKey=true;
                            key[param.name]=this.contStartValue;
                            this.contStartValue=undefined;
                        }

                        if ( addKey )
                            this.container.addKeyFrame( frame, param, value, noUndo );
                    } else {

                        // --- Send undo packet with old & new value
                        if ( !continuous && this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange && !param.customUndo  )  {
                            object={ oldValue: param.widget.startValue, newValue: value };
                            this.container.node.graph.nodePropertyWillChange( param, object );
                        }

                        param.data[param.name]=value;

                        // --- Update the graph
                        if (  this.container.node && this.container.node.graph  )
                            this.container.node.graph.update();
                    }
                    if ( callback ) callback( continuous );
                }.bind( this );

                param.widget.disabled=param.disabled;
                group.layout.addChild( param.text, param.widget );
            } else
            if ( param instanceof VG.Nodes.ParamBoolean )
            {
                param.widget=VG.UI.CheckBox( param.data[param.name] );
                param.widget.name=param.name;

                param.widget.changed=function( value, object ) {

                    var autoKey=this.container.node && this.container.node.graph && this.container.node.graph.autoKeying;
                    var param=this.container.getParam( object.name );

                    if ( autoKey ) this.container.addKeyFrame( this.container.node.graph.time.frames - this.container.node.inTime.frames, param, value );
                    else {
                        // --- Send undo packet with old & new value
                        if (  this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange )  {
                            object={ oldValue: param.data[param.name], newValue: value };
                            this.container.node.graph.nodePropertyWillChange( param, object );
                        }

                        param.data[param.name]=value;

                        // --- Update the graph
                        if (  this.container.node && this.container.node.graph  )
                            this.container.node.graph.update();
                    }
                    if ( callback ) callback();
                }.bind( this );

                param.widget.disabled=param.disabled;
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
                        object={ oldValue: param.data[param.name], newValue: value };
                        this.container.node.graph.nodePropertyWillChange( param, object );
                    }

                    param.data[param.name]=value;

                    if ( param.callback ) param.callback( value );

                    // --- Update the graph
                    if (  this.container.node && this.container.node.graph  )
                        this.container.node.graph.update();

                    if ( callback ) callback();
                }.bind( this );

                group.layout.addChild( param.text, param.widget );
            } else
            if ( param instanceof VG.Nodes.ParamVector2 )
            {
                param.widget=VG.UI.Vector2Edit( param.data[param.name].x, param.data[param.name].y, param.min, param.max );
                param.widget.name=param.name;
                param.widget.maximumSize.width = 320;

                param.widget.changed=function( value, contineous, object ) {
                    var autoKey=this.container.node && this.container.node.graph && this.container.node.graph.autoKeying;
                    var param=this.container.getParam( object.name );

                    if ( autoKey ) this.container.addKeyFrame( this.container.node.graph.time.frames - this.container.node.inTime.frames, param, value );
                    else {

                        // --- Send undo packet with old & new value
                        if (  this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange )  {
                            object={ oldValue: { x : param.data[param.name].x, y : param.data[param.name].y },
                                newValue: { x: value.x, y : value.y } };
                            this.container.node.graph.nodePropertyWillChange( param, object );
                        }

                        param.data[param.name].x=value.x;
                        param.data[param.name].y=value.y;

                        // --- Update the graph
                        if (  this.container.node && this.container.node.graph  )
                            this.container.node.graph.update();
                    }

                    if ( callback ) callback();
                }.bind( this );

                group.layout.addChild( param.text, param.widget );
            } else
            if ( param instanceof VG.Nodes.ParamVector2List )
            {
                param.dc=VG.Data.Collection( "ParamVector2List" );
                param.dc.values = param.data[param.name];
                param.widget = VG.UI.TreeWidget();
                param.widget.name=param.name;
                param.widget.maximumSize.height = 250;

                let controller = param.widget.bind( param.dc, "values" );

                for ( let i = 0; i < param.dc.values.length; ++i ) {
                    let item = param.dc.values[i];
                    item.text = `Point at ${item.x.toFixed(2)}  ${item.y.toFixed(2)}`;
                }

                if ( param.dc.values.length )
                    controller.selected = controller.at( param.index );

                let doUndo = function() {
                }.bind( this );

                let edit = VG.UI.Vector2Edit( 0, 0, param.min, param.max, 2 );
                edit.minimumSize.height = 30;
                edit.changed = function( value ) {
                    let selected = controller.selected;
                    selected.x = value.x;
                    selected.y = value.y;

                    selected.text = `Point at ${selected.x.toFixed(2)}  ${selected.y.toFixed(2)}`;

                    if (  this.container.node && this.container.node.graph  )
                        this.container.node.graph.update();
                    if ( callback ) callback();
                }.bind( this );

                let addButton=VG.UI.ToolBarButton();
                addButton.text="+";
                addButton.toolTip="Add a point.";
                // this.addMaterialButton.disabled=true;
                addButton.clicked=function() {
                    let point = { text : "Point at 0  0", x : 0, y : 0 };
                    controller.add( "", point );
                    controller.selected = point;

                    if (  this.container.node && this.container.node.graph  )
                        this.container.node.graph.update();
                    if ( callback ) callback();
                }.bind( this );

                let removeButton=VG.UI.ToolBarButton();
                removeButton.text="-";
                removeButton.toolTip="Removes the point.";
                removeButton.clicked=function() {
                    let selected = controller.selected;
                    if ( selected ) controller.remove( selected );

                    if (  this.container.node && this.container.node.graph  )
                        this.container.node.graph.update();
                    if ( callback ) callback();
                }.bind( this );

                param.widget.addToolWidget( addButton );
                param.widget.addToolWidget( removeButton );
                param.widget.addToolWidget( VG.UI.LayoutHSeparator() );
                param.widget.addToolWidget( edit );

                param.editWidget = edit;
                param.controller = controller;

                controller.addObserver( "selectionChanged", function() {
                    let selected = controller.selected;
                    edit.set( selected.x, selected.y );
                    removeButton.disabled = controller.length <= 2;//param.minimumPoints;
                    param.index = Number( controller.indexOf( selected ) );
                }.bind( this ) );

                group.layout.addChild( param.text, param.widget );
            } else
            if ( param instanceof VG.Nodes.ParamVector3 )
            {
                param.widget=VG.UI.Vector3Edit( param.data[param.name].x, param.data[param.name].y, param.data[param.name].z, param.min, param.max );
                param.widget.name=param.name;
                param.widget.fixedPrecision=3;
                param.widget.enableXYZMode();
                param.widget.maximumSize.width=320;

                param.widget.changed=function( value, contineous, object ) {
                    var param=this.container.getParam( object.name );

                    // --- Send undo packet with old & new value
                    if (  this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange && !param.customUndo )  {
                        object={ oldValue: { x : param.data[param.name].x, y : param.data[param.name].y, z : param.data[param.name].z },
                            newValue: { x: value.x, y : value.y, z : value.z } };
                        this.container.node.graph.nodePropertyWillChange( param, object );
                    }

                    param.data[param.name].x=value.x;
                    param.data[param.name].y=value.y;
                    param.data[param.name].z=value.z;

                    // --- Update the graph
                    if (  this.container.node && this.container.node.graph  )
                        this.container.node.graph.update();

                    if ( callback ) callback();
                }.bind( this );

                group.layout.addChild( param.text, param.widget );
            } else
            if ( param instanceof VG.Nodes.ParamVector4 )
            {
                param.widget=VG.UI.Vector4Edit( param.data[param.name].x, param.data[param.name].y, param.data[param.name].z, param.data[param.name].w, param.min, param.max );
                param.widget.name=param.name;
                param.widget.fixedPrecision=3;
                param.widget.minimumSize.height=30;

                param.widget.changed=function( value, contineous, object ) {
                    var param=this.container.getParam( object.name );

                    // --- Send undo packet with old & new value
                    if (  this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange )  {
                        object={ oldValue: { x : param.data[param.name].x, y : param.data[param.name].y, z : param.data[param.name].z, w : param.data[param.name].w },
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

                    if ( callback ) callback();
                }.bind( this );

                group.layout.addChild( param.text, param.widget );
            } else
            if ( param instanceof VG.Nodes.ParamColor )
            {
                param.widget=VG.UI.ColorEdit();

                param.value.set( param.data[param.name].r, param.data[param.name].g, param.data[param.name].b,
                    param.data[param.name].a );

                param.widget.color=param.value;
                param.widget.name=param.name;

                param.widget.changed=function( value, continuous, object ) {
                    if ( continuous ) return;

                    var autoKey=this.container.node && this.container.node.graph && this.container.node.graph.autoKeying;
                    var param=this.container.getParam( object.name );

                    if ( autoKey ) this.container.addKeyFrame( this.container.node.graph.time.frames - this.container.node.inTime.frames, param, value );
                    else {
                        // --- Send undo packet with old & new value
                        if (  this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange )  {
                            object={ oldValue: { r : param.data[param.name].r, g : param.data[param.name].g, b : param.data[param.name].b, a : param.data[param.name].a },
                                newValue: { r: value.r, g : value.g, b : value.b, a : value.a } };
                            this.container.node.graph.nodePropertyWillChange( param, object );
                        }

                        param.data[param.name].r=value.r;
                        param.data[param.name].g=value.g;
                        param.data[param.name].b=value.b;
                        param.data[param.name].a=value.a;

                        if (  this.container.node && this.container.node.graph && this.container.node.graph.update )
                            this.container.node.graph.update();

                        VG.update();
                    }
                    if ( callback ) callback();
                }.bind( this );

                group.layout.addChild( param.text, param.widget );
            }  else
            if ( param instanceof VG.Nodes.ParamMaterial )
            {
                param.widget = new VG.UI.MaterialEdit( { alpha: param.alpha } );

                param.value.set( VG.Core.NormalizedColor( param.data[param.name].r, param.data[param.name].g, param.data[param.name].b, param.data[param.name].a ),
                    param.data[param.name].metallic, param.data[param.name].smoothness, param.data[param.name].reflectance );

                param.widget.material=param.value;
                param.widget.name=param.name;

                param.widget.changed=function( value, continuous, object ) {

                    var autoKey=this.container.node && this.container.node.graph && this.container.node.graph.autoKeying;
                    var param=this.container.getParam( object.name );

                    if ( !continuous ) {
                        if ( autoKey ) this.container.addKeyFrame( this.container.node.graph.time.frames - this.container.node.inTime.frames, param, value );
                        else {
                            // --- Send undo packet with old & new value
                            if (  this.container.node && this.container.node.graph && this.container.node.graph.nodePropertyWillChange )  {
                                object={ oldValue: { r : param.data[param.name].r, g : param.data[param.name].g, b : param.data[param.name].b, a : param.data[param.name].a },
                                    newValue: { r: value.r, g : value.g, b : value.b, a : value.a } };
                                this.container.node.graph.nodePropertyWillChange( param, object );
                            }
                        }
                    }

                    param.data[param.name].r=value.color.r;
                    param.data[param.name].g=value.color.g;
                    param.data[param.name].b=value.color.b;
                    param.data[param.name].a=value.color.a;
                    param.data[param.name].metallic=value.metallic;
                    param.data[param.name].smoothness=value.smoothness;
                    param.data[param.name].reflectance=value.reflectance;

                    if (  this.container.node && this.container.node.graph && this.container.node.graph.update )
                        this.container.node.graph.update();

                    VG.update();
                    if ( callback ) callback();
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
                        object={ oldValue: { imageData : param.data[param.name].imageData, imageName : param.data[param.name].imageName },
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
            } else
            if ( param instanceof VG.Nodes.ParamDivider )
            {
                group.layout.addDivider( param.text );
            }

            if ( param && param.widget )
                param.widget.toolTip=param.toolTip;

            if ( param && param.widget && this.container.node && this.container.node.getInput ) {

                var terminal=this.container.node.getInput( param.name );
                if ( terminal && terminal.isConnected() )
                    param.widget.disabled=true;

            }
        }

        if ( noContainer ) {
            this.layout = group.layout;
            break;
        }
    }
};

VG.Nodes.ParamContainerEdit.prototype=VG.UI.Widget();

VG.Nodes.ParamContainerEdit.prototype.resync=function()
{
    for( var i=0; i < this.container.groups.length; ++i )
    {
        var group=this.container.groups[i];

        for( var p=0; p < group.parameters.length; ++p )
        {
            var param=group.parameters[p], object;

            if ( param instanceof VG.Nodes.ParamText )
            {
                if ( param.widget ) {
                    param.widget.text=param.data[param.name];
                }
            } else
            if ( param instanceof VG.Nodes.ParamNumber )
            {
                if ( param.widget ) {
                    param.widget.value=param.data[param.name];
                }
            } else
            if ( param instanceof VG.Nodes.ParamSlider )
            {
                if ( param.widget ) {
                    param.widget.value=param.data[param.name];
                }
            } else
            if ( param instanceof VG.Nodes.ParamBoolean )
            {
                if ( param.widget ) {
                    param.widget.checked=param.data[param.name];
                }
            } else
            if ( param instanceof VG.Nodes.ParamList )
            {
                if ( param.widget ) {
                    param.widget.index=param.data[param.name];
                }
            } else
            if ( param instanceof VG.Nodes.ParamVector2 )
            {
                if ( param.widget ) {
                    param.widget.set( param.data[param.name].x, param.data[param.name].y );
                }
            } else
            if ( param instanceof VG.Nodes.ParamVector2List )
            {
                if ( param.widget ) {
                    for ( let i = 0; i < param.dc.values.length; ++i ) {
                        let item = param.dc.values[i];
                        item.text = `Point at ${item.x.toFixed(2)}  ${item.y.toFixed(2)}`;
                    }
                }
                if ( param.editWidget ) {
                    let selected = param.controller.selected;
                    param.editWidget.set( selected.x, selected.y );
                }
            } else
            if ( param instanceof VG.Nodes.ParamVector3 )
            {
                if ( param.widget ) {
                    param.widget.set( param.data[param.name].x, param.data[param.name].y, param.data[param.name].z );
                }
            } else
            if ( param instanceof VG.Nodes.ParamVector4 )
            {
                if ( param.widget ) {
                    param.widget.set( param.data[param.name].x, param.data[param.name].y, param.data[param.name].z, param.data[param.name].w );
                }
            } else
            if ( param instanceof VG.Nodes.ParamColor )
            {
                if ( param.widget ) {
                    param.value.set( param.data[param.name].r, param.data[param.name].g, param.data[param.name].b,
                        param.data[param.name].a );
                    param.widget.color=param.value;
                }
            }  else
            if ( param instanceof VG.Nodes.ParamMaterial )
            {
                if ( param.widget ) {
                    param.value.set( VG.Core.NormalizedColor( param.data[param.name].r, param.data[param.name].g, param.data[param.name].b, param.data[param.name].a ),
                        param.data[param.name].metallic, param.data[param.name].smoothness, param.data[param.name].reflectance );

                    param.widget.material=param.value;
                }
            }  else
            if ( param instanceof VG.Nodes.ParamImage )
            {
            }

            if ( param && param.widget && this.container.node && this.container.node.getInput ) {

                var terminal=this.container.node.getInput( param.name );
                if ( terminal && terminal.isConnected() )
                    param.widget.disabled=true;

            }
        }
    }
};

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
