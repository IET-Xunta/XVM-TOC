/**
* ToC 
* ----------------------------------------------
* Copyright (c) 2012, Xunta de Galicia. All rights reserved.
* Code licensed under the BSD License: 
*   LICENSE.txt file available at the root application directory
*
* https://forxa.mancomun.org/projects/xeoportal
* http://xeovisorminimo.forxa.mancomun.org
*
*/

/**
 * Namespace to TOC
 */

var TOC = {
	
	/**
	 * The version number
	 */
	VERSION_NUMBER : 0, 
	
	Util: {'getParameterString' :function(params) {
	    var paramsArray = [];
	    
	    for (var key in params) {
	      var value = params[key];
	      if ((value != null) && (typeof value != 'function')) {
	        var encodedValue;
	        if (typeof value == 'object' && value.constructor == Array) {
	          /* value is an array; encode items and separate with "," */
	          var encodedItemArray = [];
	          var item;
	          for (var itemIndex=0, len=value.length; itemIndex<len; itemIndex++) {
	            item = value[itemIndex];
	            encodedItemArray.push(encodeURIComponent(
	                (item === null || item === undefined) ? "" : item)
	            );
	          }
	          encodedValue = encodedItemArray.join(",");
	        }
	        else {
	          /* value is a string; simply encode */
	          encodedValue = encodeURIComponent(value);
	        }
	        paramsArray.push(encodeURIComponent(key) + "=" + encodedValue);
	      }
	    }
	    
	    return paramsArray.join("&");
	}, 'urlAppend' : function(url, paramStr) {
	    var newUrl = url;
	    if(paramStr) {
	        var parts = (url + " ").split(/[?&]/);
	        newUrl += (parts.pop() === " " ?
	            paramStr :
	            parts.length ? "&" + paramStr : "?" + paramStr);
	    }
	    return newUrl;
	}, 'replaceAll' : function(cadena, str1, str2, ignore){
		   return cadena.replace(new RegExp(str1.replace(/([\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, function(c){return "\\" + c;}), "g"+(ignore?"i":"")), str2);
	}
	}
};
