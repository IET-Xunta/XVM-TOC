/**
 * XVM-TOC: TOC para o Xeovisor ----------------------------------------------
 * Copyright (c) 2012, Xunta de Galicia. All rights reserved. Code licensed
 * under the BSD License: LICENSE.txt file available at the root application
 * directory
 * 
 * @author Instituto Estudos do Territorio, IET
 */

TOC.Legend = TOC.Class.extend({
	
	/**
	 * 
	 */
	div : null,
	
	/**
	 * Constant: DEFAULT_PARAMS
	 * {Object} Hash with defaults parameters to GetLegendGraphic
	 * petition key/value pair
	 */
	DEFAULT_PARAMS : {
		service : 'wms',
		request : 'getlegendgraphic',
		format : 'image/png'
	},	
	
	/**
	 * Property: params
	 * {Object} Parameters to petition
	 */
	params : {},
	
	/**
	 * Method: initialize
	 *
	 */
	initialize : function(divId) {
		this.div = $('#' + divId);
	},
	
	/**
	 * Method: getLegendGraphic
	 * create the url to make getlegendgraphic petition to server
	 */
	getLegendGraphic : function(layer) {

		//console.log('getLegendGraphic');
		var layers = null;
		if(layer.params != undefined) {
			//this.createTableLegend(layer);
			if(layer.params.LAYERS instanceof Array) {
				layers = layer.params.LAYERS;
			} else {
				layers = new Array(layer.params.LAYERS);
			}
		}
		
		var ul = $('<ul>').attr('id', 'legend_ul')
			.css('list-style', 'none');
		for(var n in layers) {
			var layer_name = layers[n];
			var layer_petition = {'layer' : layer_name};
			$.extend(layer_petition, this.DEFAULT_PARAMS);
			var paramStr = TOC.Util.getParameterString(layer_petition);
			var legendUrl = TOC.Util.urlAppend(layer.url, paramStr);
			var image = $('<img>');
			var line = $('<li>');
			image.error(function(evt){
				image.remove();
				line.append($('<span>').
						attr('class', 'legendSpan').
						text('Non hai lenda para a capa seleccionada.')); // TODO Localize
			});
			image.attr('id', 'legend_img_' + layer.name)
				.attr('src', legendUrl)
				.attr('title', layer.name);
			
			line.append(image);
			ul.append(line);
		}
		this.div.append(ul);
	}
});