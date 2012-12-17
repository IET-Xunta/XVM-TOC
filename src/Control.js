/**
 * XVM-TOC: TOC para o Xeovisor ----------------------------------------------
 * Copyright (c) 2012, Xunta de Galicia. All rights reserved. Code licensed
 * under the BSD License: LICENSE.txt file available at the root application
 * directory
 * 
 * @author Instituto Estudos do Territorio, IET
 */

TOC.Control = TOC.Class.extend({

	/**
	 * Property: OpenLayers.Map
	 */
	map : null,

	/**
	 * Property: path to defaults config parameters
	 */
	DEFAULTCONFIG : 'toc/config/',

	/**
	 * 
	 */
	DEFAULTIMAGES : 'toc/images/',

	/**
	 * Property: default tabs
	 */
	DEFAULTTABS : {'tabs': ['layers', 'visibles', 'searches']},

	/**
	 * Property: defaults div id to create TOC
	 */
	div : '#toc',

	/**
	 * Type of the toc. Supported ones are 'accordion' and 'tree'. Defaults to 'accordion' if an unsupported type is provided.
	 */
	DEFAULTTYPE : 'accordion',

    /**
     * Property: layerStates
     * {Array(Object)} Basically a copy of the "state" of the map's layers
     *     the last time the control was drawn. We have this in order to avoid
     *     unnecessarily redrawing the control.
     */
    layerStates: null,

    /**
     * APIProperty: ascending
     * {Boolean} If we want the layers to appear in the tree in the same order
     * 		as they are in the map, or in reverse.
     */
    reverse: false,

    /**
     * Property: baseLayersTree
     * {DynaTree}
     */
    baseLayersTree: null,

    /**
     * Property: overlaysTree
     * {DynaTree}
     */
    overlaysTree: null,

	/**
	 * Method: initializes TOC into XVM.Map
	 * 
	 * @param 
	 */
	initialize : function() {
		XVM.EventBus.addListener(this, 'addMapToTOC', 'mapCompleted');
	},

	/**
	 * Method: addMapToTOC
	 * Adds map to TOC
	 * 
	 * @param XVM.Map
	 */
	addMapToTOC : function(map) {
		this.map = map.OLMap;
		XVM.Reader.readFromFile(
				this.DEFAULTCONFIG + 'toc.options.yaml',
				this.createTOC,
				this);		
	},

	/**
	 * Method: create tabs
	 */
	createTabs : function() {
		var tabs = this.DEFAULTTABS.tabs;
		$(this.div).append($('<ul>'));
		for (var i = 0; i < tabs.length; i++) {
			$(this.div + " ul").append($('<li>').append($('<a href=#' + tabs[i] + '>').text(tabs[i])));
			$(this.div).append($('<div id="' + tabs[i] + '">'));
		}
		$(this.div).dialog()
			.tabs();
	},

	/**
	 * Method: creates TOC
	 */
	createTOC : function(response, context) {
		if (typeof response.type !== 'undefined') {
			context.DEFAULTTYPE = response.type;
		}
		if (typeof response.tabs !== 'undefined') {
			context.DEFAULTTABS.tabs = response.tabs;
		}
		var this_ = context;
		this_.createTabs();
		this_.createVisibleTab();
		this_.addLayersToTOC();
	},

	/**
	 * 
	 */
	createVisibleTab : function() {
		
		var visible_bl = $('<div>').attr('id', 'visible_base_layer')
		.append($('<span class="visible_bs_layer">').text('Capa Base')).
		css('padding', '2px');
		var visibles_ol = $('<div>')
			.attr('id', 'visible_overlay_layer')
			.append($('<span class="visible_ov_layer">').text('Capas'));
		$('#' + this.DEFAULTTABS.tabs[1]).css('list-style' ,'none')
				.append(visible_bl)
				.append(visibles_ol);
		
	},

    /**
     * Method: checkRedraw
     * Checks if the layer state has changed since the last redraw() call.
     *
     * Returns:
     * {Boolean} The layer state changed since the last redraw() call.
     */
    checkRedraw: function() {
        var redraw = false;
        if ( !this.layerStates.length ||
             (this.map.layers.length != this.layerStates.length) ) {
            redraw = true;
        } else {
            for (var i=0, len=this.layerStates.length; i<len; i++) {
                var layerState = this.layerStates[i];
                var layer = this.map.layers[i];
                if ( (layerState.name != layer.name) ||
                     (layerState.inRange != layer.inRange) ||
                     (layerState.id != layer.id) ||
                     ((layerState.visibility != layer.getVisibility()) &&
                             (layer.isBaseLayer ? layer.getVisibility() : true)) ) {
                    redraw = true;
                    break;
                }
            }
        }
        return redraw;
    },

    /**
     * Method: redraw
     * Goes through and takes the current state of the Map and rebuilds the
     *     control to display that state. Groups base layers into a
     *     radio-button group and lists each data layer with a checkbox.
     *
     * Returns:
     * {DOMElement} A reference to the DIV DOMElement containing the control
     */
    redraw: function() {
        //if the state hasn't changed since last redraw, no need
        // to do anything. Just return the existing div.
        if (!this.checkRedraw()) {
            return this.div;
        }

        // Save state -- for checking layer if the map state changed.
        // We save this before redrawing, because in the process of redrawing
        // we will trigger more visibility changes, and we want to not redraw
        // and enter an infinite loop.
        var len = this.map.layers.length;
        this.layerStates = new Array(len);
        for (var i=0; i <len; i++) {
            var layer = this.map.layers[i];
            this.layerStates[i] = {
                'name': layer.name,
                'visibility': layer.isBaseLayer ? layer == this.map.baseLayer : layer.getVisibility(),
                'inRange': layer.inRange,
                'id': layer.id
            };
            this.setVisibleLayer(layer);
        }

        var layers = this.map.layers.slice();
        
    	if (this.DEFAULTTYPE == 'accordion') {
    		var groups = [];
	        for(var i = 0; i < this.map.layers.length; i++) {
	            var layer = this.map.layers[i];
	            var group = layer.group_name;
	            if ($.inArray(group, groups) == -1) {
		            groups.push(group);
	            }
	        }
	        for(var i = 0; i < groups.length; i++) {
	        	if ('#' + groups[i] != null) {
	        		$('#' + groups[i]).empty();
	        	} else {
		            $('#' + this.DEFAULTTABS.tabs[0]).append($('<h3>').text(groups[i]));
		            $('#' + this.DEFAULTTABS.tabs[0]).append($('<div id="' + groups[i] + '">'));
	        	}
	        }

    		for(var i = 0; i < this.map.layers.length; i++) {
	            var layer = this.map.layers[i];
	            var group = layer.group_name;
	            this.addLayerToGroup(group, layer);
	        }
			return;
    	} else if (this.DEFAULTTYPE == 'tree') {
	        if (!this.reverse) { layers.reverse(); }
	
	        var baselayers = [], overlays = [];
	        for (var i=0, len=layers.length; i<len; i++) {
	            var layer = layers[i];
	            if (layer.isBaseLayer) {
	                baselayers.push(layer);
	            } else {
	                overlays.push(layer);
	            }
	        }
	
	        $(this.baseLayersTree).dynatree('destroy');
	        this.baseLayersTree = $(this.baseLayersTree).dynatree({
			  classNames: {
					container: 'dynatree-container-external',
			        focused: 'dynatree-focused-external',
					expander: 'dynatree-expander-external',
					checkbox: 'dynatree-radio'
			  },
	          checkbox: true,
	          selectMode: 1,
	          clickFolderMode: 2,
	          parent: this,
	          children: this.generateBaseLayersTree(baselayers),
	          onSelect: function(select, node) {
	              node.tree.options.parent.updateBaseLayer(node.data._layer);
                  node.tree.options.parent.setVisibleLayer(node.tree.options.parent.map.getLayer(node.data._layer));
	          },
	          cookieId: "dynatree-external-Cb1",
	          idPrefix: "dynatree-external-Cb1-",
	          debugLevel: 0
	        });
	
	        $(this.overlaysTree).dynatree('destroy');
	        this.overlaysTree = $(this.overlaysTree).dynatree({
			  classNames: {
					container: 'dynatree-container-external',
			        focused: 'dynatree-focused-external',
					expander: 'dynatree-expander-external'
			  },
	          checkbox: true,
	          selectMode: 3,
	          clickFolderMode: 2,
	          parent: this,
	          children: this.generateOverlaysTree(overlays),
	          onSelect: function(select, node) {
	              updateNodeLayer = function(node) {
	                  if(node.hasChildren() === false) {
	                      node.tree.options.parent.updateLayerVisibility(node.data._layer, node.isSelected());
	                      node.tree.options.parent.setVisibleLayer(node.tree.options.parent.map.getLayer(node.data._layer));
	                  }
	              };
	              node.visit(updateNodeLayer, true);
	          },
	          cookieId: "dynatree-external-Cb2",
	          idPrefix: "dynatree-external-Cb2-",
	          debugLevel: 0
	        });
    	}

        return this.div;
    },

    generateTreeFromLayers : function(layers, root, base_id, selectableFolders) {

        for(var i=0, len=layers.length; i<len; i++) {
            var layer = layers[i];
            var baseId = base_id + '_';
            var groups;
            if (typeof layer.group_name === 'string') {
                groups = layer.group_name.split('/');
            } else {
                groups = [];
            }
            var currentNode = root;
            for (var n=0, leng=groups.length; n<leng; n++) {
                var group = groups[n];
                if (group == '') {
                    continue;
                }
                baseId += group + '_';
                var children = currentNode.children;
                var found = false;
                for (var m=0, lengt=children.length; m<lengt; m++) {
                    if (children[m].title == group) {
                        found = true;
                        currentNode = children[m];
                        break;
                    }
                }
                if (!found) {
                    var newNode = {title: group, key: baseId,  hideCheckbox: !selectableFolders, expand: true, isFolder: true, icon: false, children: []};
                    currentNode.children.push(newNode);
                    currentNode = newNode;
                }
            }
            currentNode.children.push({title: layer.name, key: baseId + layer.name, _layer: layer.id, icon: false, select: layer.isBaseLayer ? layer == this.map.baseLayer : layer.getVisibility()});
        }

    },

    generateOverlaysTree : function(layers) {

        var baseId = this.id + '_overlays';

        treeChildren = [
                      {title: OpenLayers.i18n('Overlays'), key: baseId,  expand: true, isFolder: true, icon: false,
                        children: []
                      }
                    ];

        this.generateTreeFromLayers(layers, treeChildren[0], baseId, true);

        return treeChildren;
    },

    generateBaseLayersTree : function(layers) {

        var baseId = this.id + '_baselayers';

        var treeChildren =[
                       {title: OpenLayers.i18n("Base Layer"), key: baseId, hideCheckbox: true, unselectable: true, expand: true, isFolder: true, icon: false,
                         children: []
                       }
                     ];

        this.generateTreeFromLayers(layers, treeChildren[0], baseId, false);

        return treeChildren;
    },

    updateBaseLayer : function(layerid) {
        var layers = this.map.layers;
        for (var i=0, len = layers.length; i < len; i++) {
            var layer = layers[i];
            if (layer.isBaseLayer) {
                this.layerStates[i].visibility = (layer.id == layerid);
            }
        }
        this.map.setBaseLayer(this.map.getLayer(layerid));
    },

    updateLayerVisibility : function(layerid, select) {
        var layers = this.map.layers;
        for (var i=0, len = layers.length; i < len; i++) {
            var layer = layers[i];
            if (layer.id == layerid) {
                this.layerStates[i].visibility = select;
                break;
            }
        }
        this.map.getLayer(layerid).setVisibility(select);
    },

	/**
	 * Method: addLayers Add layers to TOC. Defaults accordion, if type is tree
	 * creates a Tree structure
	 */
	addLayersToTOC :  function() {
	
		var layers = this.map.layers.slice();
		var groups = [];
        // Save state -- for checking layer if the map state changed.
        // We save this before redrawing, because in the process of redrawing
        // we will trigger more visibility changes, and we want to not redraw
        // and enter an infinite loop.
        var len = this.map.layers.length;
        this.layerStates = new Array(len);
        for (var i=0; i <len; i++) {
            var layer = this.map.layers[i];
            this.layerStates[i] = {
                'name': layer.name,
                'visibility': layer.isBaseLayer ? layer == this.map.baseLayer : layer.getVisibility(),
                'inRange': layer.inRange,
                'id': layer.id
            };
            this.setVisibleLayer(layer);
        }
        this.map.events.on({
            addlayer: this.redraw,
            removelayer: this.redraw,
            changebaselayer: this.redraw,
            changelayer: this.redraw,
            scope: this
        });
		if (this.DEFAULTTYPE == 'tree') {

			$('#' + this.DEFAULTTABS.tabs[0]).append($('<div id="tree1_' + this.DEFAULTTABS.tabs[0] + '">'));
			$('#' + this.DEFAULTTABS.tabs[0]).append($('<div id="tree2_' + this.DEFAULTTABS.tabs[0] + '">'));


	        if (!this.reverse) { layers.reverse(); }
	        var baselayers = [], overlays = [];
	        for (var i=0, len=layers.length; i<len; i++) {
	            var layer = layers[i];
	            if (layer.isBaseLayer) {
	                baselayers.push(layer);
	            } else {
	                overlays.push(layer);
	            }
	        }

	        this.baseLayersTree = $('#tree1_' + this.DEFAULTTABS.tabs[0]).dynatree({
			  classNames: {
					container: 'dynatree-container-external',
			        focused: 'dynatree-focused-external',
					expander: 'dynatree-expander-external',
					checkbox: 'dynatree-radio'
			  },
	          checkbox: true,
	          // Override class name for checkbox icon:
	          selectMode: 1,
	          clickFolderMode: 2,
	          parent: this,
	          children: this.generateBaseLayersTree(baselayers),
	          onSelect: function(select, node) {
	              node.tree.options.parent.updateBaseLayer(node.data._layer);
                  node.tree.options.parent.setVisibleLayer(node.tree.options.parent.map.getLayer(node.data._layer));
	          },
	          cookieId: "dynatree-external-Cb1",
	          idPrefix: "dynatree-external-Cb1-",
	          debugLevel: 0
	        });

	        this.overlaysTree = $('#tree2_' + this.DEFAULTTABS.tabs[0]).dynatree({
			  classNames: {
					container: 'dynatree-container-external',
			        focused: 'dynatree-focused-external',
					expander: 'dynatree-expander-external'
			  },
	          checkbox: true,
	          selectMode: 3,
	          clickFolderMode: 2,
	          parent: this,
	          children: this.generateOverlaysTree(overlays),
	          onSelect: function(select, node) {
	              updateNodeLayer = function(node) {
	                  if(node.hasChildren() === false) {
	                      node.tree.options.parent.updateLayerVisibility(node.data._layer, node.isSelected());
	                      node.tree.options.parent.setVisibleLayer(node.tree.options.parent.map.getLayer(node.data._layer));
	                  }
	              };
	              
	              node.visit(updateNodeLayer, true);
	          },
	          cookieId: "dynatree-external-Cb2",
	          idPrefix: "dynatree-external-Cb2-",
	          debugLevel: 0
	        });
		} else {
	        for(var i = 0; i < layers.length; i++) {
	            var layer = layers[i];
	            var group = layer.group_name;

	            if ($.inArray(group, groups) == -1) {
		            groups.push(group);
		            $('#' + this.DEFAULTTABS.tabs[0]).append($('<h3>').text(group));
		            $('#' + this.DEFAULTTABS.tabs[0]).append($('<div id="' + group + '">'));
	            }
	            this.addLayerToGroup(group, layer);
	        }
	        $('#' + this.DEFAULTTABS.tabs[0]).accordion();
		}
	},
	
	/**
	 * 
	 */
	setVisibleLayer : function(layer) {
		
		var layerName = TOC.Util.replaceAll(layer.id,'.','_');
		var layerLine = $('#' + layerName);

		if((layerLine.length == 0) && (layer.getVisibility())) {
			var context = {
				'layer' : layer,
				'TOC' : this
			};

			// create logo of information
			var info_logo = $('<img>', {
				css : {
					'verticalAlign' : "middle",
					'cursor' : 'pointer',
					'width' : '16px',
					'height' : '16px'
				}
			});
			$(info_logo)
				.attr('src', this.DEFAULTIMAGES + "info-on.jpg")
				.attr('tag', 'active')
				.on("click", 
					null, 
					context, 
					function(evt) {
						var active = ($(this).attr('tag') == 'active') ? true : false;
						if(active)
							$(this).attr('src', evt.data.TOC.DEFAULTIMAGES + "info-off.jpg").attr('tag', 'inactive');
						else
							$(this).attr('src', evt.data.TOC.DEFAULTIMAGES + "info-on.jpg").attr('tag', 'active');
						var title = (!active) ? 'Desactiva capa para consulta' : 'Activa capa para consulta';
						$(this).attr('title', title);
						evt.data.TOC.addLayerQueryable(evt);
			});
			$(info_logo).attr("title", "Desactiva capa para consulta");

			// create cross
			var cross = $('<img>', {
				css : {
					'verticalAlign' : "middle",
					'cursor' : 'pointer',
					'width' : '16px',
					'height' : '16px'
				}
			});

			if(layer.isBaseLayer) {
				$(cross).attr('src', this.DEFAULTIMAGES + "layer-switcher-maximize.png");
				$(cross).attr('title', 'Capa base');
			} else {
				$(cross).attr('src',  this.DEFAULTIMAGES + "cleanlayer.png");
				$(cross).attr('title', 'Eliminar capa');

				$(cross).on("click", 
						null, 
						context, 
						function(evt) {
							evt.data.TOC.onClickCross(evt.data.layer);
						});
			}

			var labelSpan = $("<span>")
				.attr("class", "labelSpan")
				.text(layer.name)
				.css({
					"verticalAlign" : "middle", 
					"cursor": "pointer"
						})
				.attr("title", layer.group_name + " - " + layer.name);

			// create image
			var image = $('<img>', {
				src : this.DEFAULTIMAGES + "layer-panel.png",
				css : {
					'verticalAlign' : "middle",
					'margin-left': '3px', 
					'margin-right': '3px',
					'margin-bottom': '1px',
					'margin-top': '1px',
					'cursor' : 'pointer'
				}
			}).attr("title", "Lenda/Transparencia");

			var panel = new TOC.Panel();
			$(image).on("click", 
					null, 
					context, 
					function(evt) {
						panel.launch(evt);
					});

			// create li
			var line = $('<li>');
			if(layer.isBaseLayer) {
				line.attr('id', 'line_base_layer');
			} else {
				line.attr('id', 'line_' + layerName);
			}

			if(!layer.isBaseLayer) {
				$(line).append(info_logo);				
				/*var nlayers = $('#capas_visibles').text().extractInteger() + 1;
				$('#capas_visibles').text('Visibles (' + nlayers.toString() +')');*/
			}

			$(line).append(cross);
			$(line).append(image);
			$(line).append(labelSpan);			

			if (layer.isBaseLayer) {
				$('#line_base_layer').remove();
				$('#visible_base_layer').append($(line));
			} else {
				$('#visible_overlay_layer').append(
					$('<div>').attr('id', layerName).append($(line))
				);
			}
		} else {
			if (! layer.getVisibility()) {
				/*var nlayers = $('#capas_visibles').text().extractInteger() - 1;
				$('#capas_visibles').text('Visibles (' + nlayers.toString() +')');*/
				$('#' + layerName).remove();
			}
		}
	},
	
	/**
	 * 
	 * @param layer
	 */
	onClickCross : function(layer) {
		
	},
	
	/**
	 * 
	 * @param evt
	 */
	addLayerQueryable : function(evt) {
		
	},
	
	/**
	 * Method: addLayerToGroup add layers to a group created previously
	 */
	addLayerToGroup : function(group, layer) {
		
		var baseLayer = layer.isBaseLayer;
		
		if(layer.displayInLayerSwitcher) {

			// only check a baselayer if it is *the* baselayer, check data
			// layers if they are visible
			var checked = (baseLayer) ? (layer == this.map.baseLayer) : layer.getVisibility();

			// create input element
			var inputElem = $('<input>');
			inputElem.attr("id", "input_" + layer.name.split(' ').join('').toLowerCase())
				.attr("name", (baseLayer) ? group + "_baseLayers" : layer.name)
				.attr("type", (baseLayer) ? "radio" : "checkbox")
				.val(layer.name)
				.attr("checked", checked)
				.attr("defaultChecked", checked)
				.css("verticalAlign" , "middle")
				.attr('title', (checked) ? 'Desactivar capa' : 'Activar capa'); // TODO Localize
			
			var context = {
				'inputElem' : inputElem,
				'layer' : layer,
				'group' : group,
				'toc' : this
			};
			
			inputElem.on(
					'change',
					null,
					context,
					function(evt) {
						var this_ = evt.data.toc;
						if(evt.data.inputElem.attr('type') == "radio"){
							this_.updateBaseLayer(layer.id);
							evt.data.layer.map.setBaseLayer(evt.data.layer);
						} else {
							var checked = (evt.data.inputElem.attr('checked') === 'checked') ? true : false;
							this_.updateLayerVisibility(layer.id, checked);
							evt.data.layer.setVisibility(checked);
						}
						this_.setVisibleLayer(layer);
					}
			);

			// create span
			var labelSpan = $("<span>");
			labelSpan
				.attr("class", "labelSpan")
				.text(layer.name)
				.css({"verticalAlign": "middle", "cursor": "pointer"})
				.attr("title", group + " - " + layer.name);

			// create image
			var image = $('<img>', {
				src : this.DEFAULTIMAGES + "layer-panel.png",
				css : {
					'verticalAlign' : "middle",
					'margin-left': '3px', 
					'margin-right': '3px',
					'margin-bottom': '1px',
					'margin-top': '1px',
					'cursor' : 'pointer'
				}
			}).attr("title", "Lenda/Transparencia"); // TODO Localice

			var panel = new TOC.Panel();
			$(image).on(
					"click", 
					null, 
					context, 
					function(evt) {
						panel.launch(evt);
					}
			);

			// create li
			var line = $('<li>');

			line.append(inputElem)
				.append(image)
				.append(labelSpan);				

			$("#" + group).append(line);
		}
	}
});