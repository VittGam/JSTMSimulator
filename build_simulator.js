/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2014 VittGam.net. All Rights Reserved.
 * http://www.turingsimulator.net/
 *
 * See http://www.turingsimulator.net/github for source code.
 *
 * Please see the attached LICENSE file for licensing information.
 */

var path = require('path');
var fs = require('fs');
var uglifyjs = require('uglify-js');
var uglifycss = require('uglifycss').processString;

var licenseText = fs.readFileSync(path.join(__dirname, 'LICENSE'));
var cssStyle = fs.readFileSync(path.join(__dirname, 'lib', 'style.css'));
var htmlheadHtml = fs.readFileSync(path.join(__dirname, 'lib', 'htmlhead.htm')).toString().replace(new RegExp('(?:\\n|\\r|\\t)', 'g'), '');
var iecsshacksHtml = fs.readFileSync(path.join(__dirname, 'lib', 'iecsshacks.htm')).toString().replace(new RegExp('(?:\\n|\\r|\\t)', 'g'), '');
var turingMachineHtml = fs.readFileSync(path.join(__dirname, 'lib', 'TuringMachine.htm')).toString().replace(new RegExp('(?:\\n|\\r|\\t)', 'g'), '');
var turingMachineJS = fs.readFileSync(path.join(__dirname, 'lib', 'TuringMachine.js'));
var i18nJS = fs.readFileSync(path.join(__dirname, 'lib', 'i18n.js'));
var handleHTMLPageJS = fs.readFileSync(path.join(__dirname, 'lib', 'handleHTMLPage.js'));

fs.writeFileSync(path.join(__dirname, 'out', 'jstmsimulator.htm'), ('<!doctype html>\n<!-- saved from url=(0014)about:internet -->\n<!--\n' + licenseText + '--><html manifest="cache.manifest" class="notranslate"><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"><title>Turing Machine Simulator by VittGam</title>' + htmlheadHtml + '<style>' + uglifycss(String(cssStyle)) + '</style>' + iecsshacksHtml + '</head><body>' + turingMachineHtml + '<script>' + uglifyjs.minify('(function(){' + turingMachineJS + i18nJS + handleHTMLPageJS + '})();', {fromString: true}).code + '</script></body></html>').replace(new RegExp('(?:\\r\\n|\\n|\\r)', 'g'), '\r\n')); // just another IE 6 fix
fs.writeFileSync(path.join(__dirname, 'out', 'cache.manifest'), 'CACHE MANIFEST\n# Built on '+(new Date().toString())+'\nNETWORK:\n*\nCACHE:\njstmsimulator.gif\n');
