/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2011-2018 Vittorio Gambaletta <vittgam@turingsimulator.net>
 * https://www.turingsimulator.net/
 *
 * See https://www.turingsimulator.net/github for source code.
 *
 * Please see the attached LICENSE file for licensing information.
 */

var xmlhttp = function(url, postdata, onload, method, contenttype){
	var not_done = true;
	try {
		var xmlhttp = null;
		try {if (window.XMLHttpRequest) {xmlhttp = new XMLHttpRequest()}} catch (e) {}
		if (!xmlhttp && window[(['Active'].concat('Object').join('X'))]) {
			try {if (!xmlhttp) {xmlhttp = new window[(['Active'].concat('Object').join('X'))]('Msxml2.XMLHTTP.6.0')}} catch (e) {}
			try {if (!xmlhttp) {xmlhttp = new window[(['Active'].concat('Object').join('X'))]('Msxml2.XMLHTTP.3.0')}} catch (e) {}
			try {if (!xmlhttp) {xmlhttp = new window[(['Active'].concat('Object').join('X'))]('Msxml2.XMLHTTP')}} catch (e) {}
		}
		if (!xmlhttp) {
			return;
		}
		xmlhttp.onreadystatechange = function(){
			if (!(not_done && xmlhttp && xmlhttp.readyState === 4)) {
				return;
			}
			not_done = null;
			if (onload) {
				if (xmlhttp.status === 200) {
					try {
						var decodedRespText = JSON.parse(xmlhttp.responseText);
					} catch (e) {
						onload(false, null, xmlhttp);
						onload = null;
						return;
					}
					onload(true, decodedRespText, xmlhttp);
				} else {
					onload(false, null, xmlhttp);
				}
			}
			xmlhttp = onload = null;
		};
		xmlhttp.open((method !== undefined ? method : (postdata !== null ? 'POST' : 'GET')), url, true);
		if (postdata !== null) {
			xmlhttp.setRequestHeader('Content-Type', (contenttype !== undefined ? contenttype : 'text/plain; charset=UTF-8'));
		}
		xmlhttp.send(postdata !== null ? postdata : null);
	} catch (e) {}
};
