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
	 * Method: addLayers Add layers to TOC. Defaults accordion, if type is tree
	 * creates a Tree structure
	 */
	addLayersToTOC :  function() {
	
		var layers = this.map.layers;
		var groups = [];
		if (this.DEFAULTTYPE == 'tree') {
			$('#' + this.DEFAULTTABS.tabs[0]).append($('<div id="tree_' + this.DEFAULTTABS.tabs[0] + '">'));
			$("#tree_" + this.DEFAULTTABS.tabs[0]).dynatree({
				  classNames: {
					container: 'dynatree-container-external',
			        focused: 'dynatree-focused-external',
					expander: 'dynatree-expander-external'
				  },
			      onActivate: function(node) {
			        // A DynaTreeNode object is passed to the activation handler
			        // Note: we also get this event, if persistence is on, and the page is reloaded.
			        alert("You activated " + node.data.title);
			      },
			      children: [
			        {title: "Item 1"},
			        {title: "Folder 2", isFolder: true, key: "folder2",
			          children: [
			            {title: "Sub-item 2.1"},
			            {title: "Sub-item 2.2"}
			          ]
			        },
			        {title: "Item 3"}
			      ]
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

		if(layerLine.length == 0) {
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
			/*var nlayers = $('#capas_visibles').text().extractInteger() - 1;
			$('#capas_visibles').text('Visibles (' + nlayers.toString() +')');*/
			$('#' + layerName).remove();
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
							evt.data.layer.map.setBaseLayer(evt.data.layer);
						}						
						else {
							var checked = (evt.data.inputElem.attr('checked') === 'checked') ? true : false;
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

			if (checked)
				this.setVisibleLayer(layer);
		}
	}
});