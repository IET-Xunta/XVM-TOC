/**
* XVM-TOC: Tests Xeovisor
* ----------------------------------------------
* Copyright (c) 2012, Xunta de Galicia. All rights reserved.
* Code licensed under the BSD License: 
*   LICENSE.txt file available at the root application directory
*
*/

/**
 * TOC.Legend
 */

/**
 * TODO refactor this test. Do not use URL from a real server
 */

describe('TOC Legend tests: ', function() {
	
	var fakeLayer = new OpenLayers.Layer.WMS( "fakeLegendData",
            "http://geoportalcredia.org:8080/geoserver/credia/wms",
            {layers: 'credia:Red Vial de Honduras'});
	
	beforeEach(function(){
		loadFixtures('Legend.html');
	});
	
	var fakeLegend = new TOC.Legend('legend_div');
	
	it('new Legend creates div', function() {
		expect($('#legend_div')).toBe('div');
	});
});