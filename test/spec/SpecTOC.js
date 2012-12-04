/**
* XVM-TOC: Tests Xeovisor
* ----------------------------------------------
* Copyright (c) 2012, Xunta de Galicia. All rights reserved.
* Code licensed under the BSD License: 
*   LICENSE.txt file available at the root application directory
*
*/

/**
 * TOC.Control
 */

describe("TOC Control tests:", function() {	

	var fakeeventbus = new XVM.Event.EventBus();
	XVM.EventBus = fakeeventbus;
	
	var fakemap = new XVM.Map();
	
	var data = loadJSONFixtures('mapoptions.json');
	var options = data['mapoptions.json'];
	
	// Add config parameters to map
	fakemap.addConfigParameters(options);
	
	// Add layers
	var fakeLayer = new OpenLayers.Layer.WMS( "fakeData",
            "http://vmap0.tiles.osgeo.org/wms/vmap0",
            {layers: 'basic'} );
	fakeLayer.layer_position = 1;
	fakeLayer.group_name = 'capa_base';
	
	var anotherFakeLayer = new OpenLayers.Layer.WMS( "anotherFakeData",
            "http://vmap0.tiles.osgeo.org/wms/vmap0",
            {layers: 'basic'} );
	anotherFakeLayer.layer_position = 0;
	anotherFakeLayer.group_name = 'capa_base';

	var fakeoverlay1 = new OpenLayers.Layer.WMS( "fakeoverlay1",
            "http://vmap0.tiles.osgeo.org/wms/vmap0",
            {layers: 'basic'},
            {isBaseLayer: false});
	fakeoverlay1.layer_position = 1;
	fakeoverlay1.group_name = 'fake_group1';
	
	var fakeoverlay2 = new OpenLayers.Layer.WMS( "fakeoverlay2",
            "http://vmap0.tiles.osgeo.org/wms/vmap0",
            {layers: 'basic'},
            {isBaseLayer: false} );
	fakeoverlay2.layer_position = 2;
	fakeoverlay2.group_name = 'fake_group1';
	
	var fakeoverlay3 = new OpenLayers.Layer.WMS( "fakeoverlay3",
            "http://vmap0.tiles.osgeo.org/wms/vmap0",
            {layers: 'basic'},
            {isBaseLayer: false, 
            	visibility: false} );
	fakeoverlay3.layer_position = 3;
	fakeoverlay3.group_name = 'fake_group2';
	
	var layers = [fakeLayer, 
	               anotherFakeLayer, 
	               fakeoverlay1,
	               fakeoverlay2,
	               fakeoverlay3];
	
	fakemap.addLayers(layers);
	
	// Add fakecontrols
	fakemap.addControls([]);
	
	var fakereader = new XVM.Loader.Reader();	
	var faketoc = new TOC.Control();
	faketoc.DEFAULTCONFIG = '../config/';
	faketoc.DEFAULTIMAGES = '../images/';		
	
	beforeEach(function(){
		loadFixtures("TOC.html");
		spyOn(fakereader, 'readFromFile');
		spyOn(fakeeventbus, 'addListener');
	});
	
	XVM.Reader = fakereader;
	
	it("Add map to TOC reads config", function(){
		faketoc.addMapToTOC(fakemap);
		expect(faketoc.map).toEqual(fakemap.OLMap);
		expect(fakereader.readFromFile).toHaveBeenCalled();
	});
	
	it("Load TOC into TOC div and create tabs", function(){
		faketoc.createTabs();
		expect($(faketoc.div)).toBeVisible();
	});
	
	it("Create group layers", function() {
		faketoc.addLayersToTOC();
		expect($('#capa_base')).toBe('div');
		expect($('#input_anotherfakedata')).toBe('input');
		expect($('#fake_group1')).toBe('div');
		expect($('#input_fakeoverlay1')).toBe('input');
		expect($('#input_fakeoverlay1')).toBeChecked();
		expect($('#input_fakeoverlay1').val()).toEqual(fakeoverlay1.name);
		expect($('#fake_group2')).toBe('div');
		expect($('#input_fakeoverlay3')).toBe('input');
		expect($('#input_fakeoverlay3')).not.toBeChecked();
		expect($('#input_fakeoverlay3').attr('title')).toEqual('Activar capa');
	});
	
	it("Change setbaselayer sets new baseLayer into map", function() {
		$('#input_fakedata').change();
		expect(faketoc.map.baseLayer).toEqual(fakeLayer);
		$('#input_anotherfakedata').change();
		expect(faketoc.map.baseLayer).toEqual(anotherFakeLayer);		
	});
	
	it("Change visibility sets this into map", function() {
		$('#input_fakeoverlay1').attr('checked', false).change();
		expect(faketoc.map.getLayersByName('fakeoverlay1')[0].visibility).toBeFalsy();
		$('#input_fakeoverlay1').attr('checked', true).change();
		expect(faketoc.map.getLayersByName('fakeoverlay1')[0].visibility).toBeTruthy();		
		$('#input_fakeoverlay3').attr('checked', true).change();
		expect(faketoc.map.getLayersByName('fakeoverlay1')[0].visibility).toBeTruthy();
	});
	
	it("Change visibility load layer into visible tab", function() {
		//expect($('#visibles > baselayer').children()).toBe('li');
	});
});