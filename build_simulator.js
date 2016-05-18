/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2016 VittGam.net. All Rights Reserved.
 * https://www.turingsimulator.net/
 *
 * See https://www.turingsimulator.net/github for source code.
 *
 * Please see the attached LICENSE file for licensing information.
 */

var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var uglifyjs = require('uglify-js');
var uglifycss = require('uglifycss').processString;

var licenseText = fs.readFileSync(path.join(__dirname, 'LICENSE'), 'utf8');
var cssStyle = fs.readFileSync(path.join(__dirname, 'lib', 'style.css'), 'utf8');
var htmlheadHtml = fs.readFileSync(path.join(__dirname, 'lib', 'htmlhead.htm'), 'utf8').replace(new RegExp('(?:\\n|\\r|\\t)', 'g'), '');
var iecsshacksHtml = fs.readFileSync(path.join(__dirname, 'lib', 'iecsshacks.htm'), 'utf8').replace(new RegExp('(?:\\n|\\r|\\t)', 'g'), '');
var turingMachineHtml = fs.readFileSync(path.join(__dirname, 'lib', 'TuringMachine.htm'), 'utf8').replace(new RegExp('(?:\\n|\\r|\\t)', 'g'), '');

var jsFiles = [
	['lib', 'TuringMachine.js'],
	['lib', 'i18n.js'],
	['lib', 'handleHTMLPage.js']
];

var jsToplevel = null;
jsFiles.forEach(function(currfile){
	var currcode = fs.readFileSync(path.join.apply(null, [__dirname].concat(currfile)), 'utf8');
	jsToplevel = uglifyjs.parse(currcode, {
		filename: currfile.join('/'),
		toplevel: jsToplevel
	});
});

var jsCopyrightComment = '/*' + jsToplevel.start.comments_before[0].value + '*/';

jsToplevel = uglifyjs.parse(jsCopyrightComment + '(function(){$ORIGFUNC;})();').transform(new uglifyjs.TreeTransformer(function(node){
	if (node instanceof uglifyjs.AST_SimpleStatement && node.body && node.body instanceof uglifyjs.AST_SymbolRef && node.body.name === '$ORIGFUNC') {
		return uglifyjs.MAP.splice(jsToplevel.body);
	}
}));

jsToplevel.figure_out_scope();
var jsCompressor = uglifyjs.Compressor({warnings: false, unsafe: true});
jsToplevel = jsToplevel.transform(jsCompressor);
jsToplevel.figure_out_scope();
jsToplevel.compute_char_frequency();
jsToplevel.mangle_names();
var minifiedJS = jsToplevel.print_to_string();

var jsSourceMap = uglifyjs.SourceMap({file: 'jstmsimulator.min.js.map', 'root': 'src/'});
var copyrightCommentAlreadyAdded = false;
var minifiedJS2 = jsToplevel.print_to_string({source_map: jsSourceMap, comments: function(node, comment){
	if (!copyrightCommentAlreadyAdded && comment.type === 'comment2' && comment.pos === 0) {
		copyrightCommentAlreadyAdded = true;
		return true;
	}
	return false;
}});
minifiedJS2 += '\n//# sourceMappingURL=jstmsimulator.min.js.map';
jsSourceMap = jsSourceMap.toString();

var minifiedCSS = uglifycss(cssStyle);
var minifiedCSS2 = jsCopyrightComment + minifiedCSS;

var indexHTMLOutput = '<!doctype html>\n<!-- saved from url=(0014)about:internet -->\n<!--\n' + licenseText + '--><html manifest="cache.minfiles.manifest" class="notranslate"><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"><title>Turing Machine Simulator by VittGam</title>' + htmlheadHtml + '<link rel="stylesheet" type="text/css" href="jstmsimulator.min.css">' + iecsshacksHtml + '</head><body>' + turingMachineHtml + '<script src="jstmsimulator.min.js"></script></body></html>';

var allInOneHTMLOutput = '<!doctype html>\n<!-- saved from url=(0014)about:internet -->\n<!--\n' + licenseText + '--><html manifest="cache.manifest" class="notranslate"><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"><title>Turing Machine Simulator by VittGam</title>' + htmlheadHtml + '<style>' + minifiedCSS + '</style>' + iecsshacksHtml + '</head><body>' + turingMachineHtml + '<script>' + minifiedJS + '</script></body></html>';

var currhash = crypto.createHash('md5');
currhash.update(allInOneHTMLOutput, 'utf8');
currhash.update(indexHTMLOutput, 'utf8');
currhash.update(minifiedCSS2, 'utf8');
currhash.update(minifiedJS2, 'utf8');
currhash.update(jsSourceMap, 'utf8');
var buildHash = currhash.digest('hex');

// the \r\n replacement is just another IE 6 fix
fs.writeFileSync(path.join(__dirname, 'out', 'index.htm'), indexHTMLOutput.replace(new RegExp('(?:\\r\\n|\\n|\\r)', 'g'), '\r\n'));
fs.writeFileSync(path.join(__dirname, 'out', 'jstmsimulator.min.css'), minifiedCSS2.replace(new RegExp('(?:\\r\\n|\\n|\\r)', 'g'), '\r\n'));
fs.writeFileSync(path.join(__dirname, 'out', 'jstmsimulator.min.js'), minifiedJS2.replace(new RegExp('(?:\\r\\n|\\n|\\r)', 'g'), '\r\n'));
fs.writeFileSync(path.join(__dirname, 'out', 'jstmsimulator.min.js.map'), jsSourceMap);
fs.writeFileSync(path.join(__dirname, 'out', 'cache.minfiles.manifest'), 'CACHE MANIFEST\n# Build hash: '+buildHash+'\nNETWORK:\n*\nCACHE:\njstmsimulator.min.css\njstmsimulator.min.js\njstmsimulator.min.js.map\njstmsimulator.gif\n');

fs.writeFileSync(path.join(__dirname, 'out', 'jstmsimulator.htm'), allInOneHTMLOutput.replace(new RegExp('(?:\\r\\n|\\n|\\r)', 'g'), '\r\n'));
fs.writeFileSync(path.join(__dirname, 'out', 'cache.manifest'), 'CACHE MANIFEST\n# Build hash: '+buildHash+'\nNETWORK:\n*\nCACHE:\njstmsimulator.gif\n');
