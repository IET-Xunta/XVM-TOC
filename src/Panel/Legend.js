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
		format : 'image/png', 
		version : '1.1.1'
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
			var thelayers = layer.params.LAYERS.split(',');
			if( thelayers instanceof Array) {
				layers = thelayers;
			} else {
				layers = new Array(thelayers);
			}
		}
		
		var ul = $('<ul>').attr('id', 'legend_ul')
			.css('list-style', 'none');
		for(var n in layers) {
			var layer_name = $.trim(layers[n]);
			var layer_petition = {'layer' : layer_name};
			$.extend(layer_petition, this.DEFAULT_PARAMS);
			var paramStr = TOC.Util.getParameterString(layer_petition);
			var legendUrl = TOC.Util.urlAppend(layer.url, paramStr);
			var image = $('<img>')
				.attr('src', 'toc/images/loading.gif');
			var line = $('<li>');
			image.error(function(evt){
				image.remove();
				line.append($('<span>').
						attr('class', 'legendSpan').
						text('Non hai lenda para a capa seleccionada.')); // TODO Localize
			});
			image.attr('id', 'legend_img_' + layer_name)
				.attr('src', legendUrl)
				.attr('title', layer_name);

			line.append(image);
			line.append($('<span>').text(layer_name).css('margin-left', '2px'));
			ul.append(line);
		}
		this.div.append(ul);
	}
});