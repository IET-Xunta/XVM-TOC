/**
 * XVM-TOC: TOC para o Xeovisor ----------------------------------------------
 * Copyright (c) 2012, Xunta de Galicia. All rights reserved. Code licensed
 * under the BSD License: LICENSE.txt file available at the root application
 * directory
 * 
 * @author Instituto Estudos do Territorio, IET
 */

TOC.Panel = TOC.Class.extend({

	/*
	 * Property: layer
	 * {OpenLayer.Layer}
	 */
	layer : null,

	/*
	 * Property: div
	 * {DOMElement}
	 * DIV element to create panel
	 */
	div : null,

	/*
	 * Property: legendControl
	 * {OpenLayers.Control.LegendLayerControl}
	 */
	legendControl : null,

	/*
	 * Method: initialize
	 * Constructor
	 */
	initialize : function() {
		//this.legendControl = new OpenLayers.Control.LegendLayerControl();
	},

	/*
	 * Method: draw
	 * Draw into viewport the panel with controls
	 */
	draw : function() {
		this.div = $('<div>');
		this.div.attr("id", "id_panel_" + this.layer.name);
		$(this.layer.map.viewPortDiv).append(this.div);
		this.div.dialog({
			resizable : true,
			show : {
				effect : 'drop',
				direction : "left"
			},
			hide : {
				effect : 'drop',
				direction : "left"
			},
			title : this.layer.name,
			height : 200,
			maxHeight : 500,
			minWidth : 275,
			width : 275,
			maxWidth : 275
		});

		this.div.dialog().on(
				'dialogclose', 
				null, 
				this, 
				function(evt) {
					evt.data.destroy(evt);
				}
		);

		// add slider control
		var slider = $("<div>");
		slider.attr("id", "id_slider_" + this.layer.name);
		this.div.append(slider);

		if(!this.layer.opacity) {
			this.layer.opacity = 1;
		}
		
		slider.slider({
			min : 0,
			max : 1,
			step : 0.1,
			value : this.layer.opacity
		});

		$(slider).on(
				"slide", 
				null, 
				this, 
				this.setOpacity);

		//add legend control
		/*var legend = $('<div>');
		legend.attr("id", "id_legend_" + this.layer.id;);
		legend.css({
			'margin' : '5px'
		});
		div.append(legend);
		this.legendControl.initialize(legendid, {width:15, heigth:15});
		this.legendControl.getLegendGraphic(this.layer);*/

	},

	/*
	 * Method: destroy
	 */
	destroy : function(evt, ui) {
		$(evt.target).dialog("destroy");
		$(evt.target).remove();
		evt.data.div = null;
	},

	/*
	 * Method: setOpacity
	 * {jQuery Event}
	 * Apply opacity to layer
	 */
	setOpacity : function(evt, ui) {
		evt.data.layer.setOpacity(ui.value);
	},

	/*
	 * Method: launch
	 * Parameters:
	 * {jQuery.Event}
	 * This method is necessary to responds
	 * panel events
	 */
	launch : function(evt) {
		this.layer = evt.data.layer;
		if(this.div == null) 
			this.draw();
	}
});