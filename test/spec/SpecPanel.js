/**
* XVM-TOC: Tests Xeovisor
* ----------------------------------------------
* Copyright (c) 2012, Xunta de Galicia. All rights reserved.
* Code licensed under the BSD License: 
*   LICENSE.txt file available at the root application directory
*
*/

/**
 * TOC.Panel
 */
describe('TOC Panel tests: ', function(){
	
	var fakemap = new OpenLayers.Map('map');
	
	// add layers
	var fakeLayer = new OpenLayers.Layer.WMS( "fakeData",
            "http://vmap0.tiles.osgeo.org/wms/vmap0",
            {layers: 'basic'},
            {opacity : 0.5});
	fakeLayer.layer_position = 1;
	fakeLayer.group_name = 'capa_base';
	
	var anotherFakeLayer = new OpenLayers.Layer.WMS( "anotherFakeData",
            "http://vmap0.tiles.osgeo.org/wms/vmap0",
            {layers: 'basic'} );
	anotherFakeLayer.layer_position = 0;
	anotherFakeLayer.group_name = 'grupo1';
	
	var layers = [fakeLayer, 
	               anotherFakeLayer];
	
	fakemap.addLayers(layers);
	
	var fakeevt = {
		data : 
			{
				layer : fakeLayer
			}	
	};
	
	var fakePanel = new TOC.Panel();
	
	beforeEach(function(){
		loadFixtures('Panel.html');
	});
	
	it('Panel launch test', function(){
		fakePanel.div = 'fake';
		fakePanel.launch(fakeevt);
		expect(fakePanel.layer).toEqual(fakeLayer);
		fakePanel.div = null;
		fakePanel.launch(fakeevt);
		expect(fakePanel.div.dialog('isOpen')).toBeTruthy();
		expect(fakePanel.div.dialog('option', 'title')).toEqual(fakeLayer.name);
		expect($('#id_slider_fakeData').slider('value')).toEqual(fakeLayer.opacity);
	});
	
	it('Sets opacity test', function(){
		var fakeui = {value : 0.8}
		fakePanel.setOpacity(fakeevt, fakeui);
		console.log(fakeLayer);
		expect(fakeLayer.opacity).toEqual(fakeui.value);
	});
	
	// TODO
	it('Dialog closes destroy it', function(){
		fakePanel.div.dialog('close');
	});
});