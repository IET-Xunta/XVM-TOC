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
	DEFAULTCONFIG : 'config/toc.options.yaml',
	
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
	 * @param XVM.Loader.Reader
	 * @param XVM.Map
	 */
	initialize : function(reader, map) {
		this.map = map.OLMap;
		reader.readFromFile(
				this.DEFAULTCONFIG,
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
	createTOC : function(response) {
		this.createTabs();
		this.addLayersToTOC();
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
        }
        $('#layers').accordion();
	}
});