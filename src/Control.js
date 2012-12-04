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
		$(this.div).tabs();
	},
	
	/**
	 * Method: creates TOC
	 */
	createTOC : function(response, context) {
		var this_ = context;
		this_.createTabs();
		this_.addLayersToTOC();
	},
	
	/**
	 * Method: addLayers Add layers to TOC. Defaults accordion, if type is tree
	 * creates a Tree structure
	 */
	addLayersToTOC :  function() {		
		var layers = this.map.layers;
		var groups = [];
        for(var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            var group = layer.group_name;

            if ($.inArray(group, groups) == -1) {
            	groups.push(group);
            	$('#layers').append($('<h3>').text(group));
            	$('#layers').append($('<div id="' + group + '">'));
            }
            this.addLayerToGroup(group, layer);
        }
        $('#layers').accordion();
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
						if(evt.data.inputElem.attr('type') == "radio")
							evt.data.layer.map.setBaseLayer(evt.data.layer);
						else {
							evt.data.layer.setVisibility((evt.data.inputElem.attr('checked') === 'checked') ? true : false);
						}
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

			/*var panel = new TOC.Panel();
			panel.initialize(null);
			$(image).on("click", null, context, function(evt) {
				panel.launch(evt);
			});*/

			// create li
			var line = $('<li>');

			line.append(inputElem)
				.append(image)
				.append(labelSpan);				

			$("#" + group).append(line);
		}
	}
});