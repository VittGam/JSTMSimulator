/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2013 VittGam.net. All Rights Reserved.
 * http://JSTMSimulator.VittGam.net/
 * https://github.com/VittGam/JSTMSimulator
 *
 * Please see the attached LICENSE file for licensing information.
 */

var path = require('path');
var fs = require('fs');
var sanitizer = require('sanitizer');
var sqlite3 = require('sqlite3').verbose();
var uglifyjs = require('uglify-js');
var uglifycss = require('uglifycss').processString;

var dbname = path.join(__dirname, 'database.sqlite');
if (!fs.existsSync(dbname)) {
	throw new Error('Database not found!');
}
var db = new sqlite3.Database(dbname);

var jstmsimulatorGif = fs.readFileSync(path.join(__dirname, '..', 'out', 'jstmsimulator.gif'));
var licenseText = fs.readFileSync(path.join(__dirname, '..', 'LICENSE'));
var cssStyle = fs.readFileSync(path.join(__dirname, '..', 'lib', 'style.css'));
var iecsshacksHtml = fs.readFileSync(path.join(__dirname, '..', 'lib', 'iecsshacks.htm')).toString().replace(new RegExp('(?:\\n|\\r|\\t)', 'g'), '');
var turingMachineHtml = fs.readFileSync(path.join(__dirname, '..', 'lib', 'TuringMachine.htm')).toString().replace(new RegExp('(?:\\n|\\r|\\t)', 'g'), '');
var turingMachineJS = fs.readFileSync(path.join(__dirname, '..', 'lib', 'TuringMachine.js'));
var i18nJS = fs.readFileSync(path.join(__dirname, '..', 'lib', 'i18n.js'));
var handleHTMLPageJS = fs.readFileSync(path.join(__dirname, '..', 'lib', 'handleHTMLPage.js'));
var handlePreloadedProblemsJS = fs.readFileSync(path.join(__dirname, 'lib', 'handlePreloadedProblems.js'));
var getEmptyCodeJS = fs.readFileSync(path.join(__dirname, 'lib', 'getEmptyCode.js'));
eval(getEmptyCodeJS.toString());
eval(turingMachineJS.toString());
eval(i18nJS.toString());
var currlang = lang.it;

var resultsDirName = path.join(__dirname, 'results', String(+(new Date())));
if (!fs.existsSync(path.join(__dirname, 'results'))) {
	fs.mkdirSync(path.join(__dirname, 'results'));
}
fs.mkdirSync(resultsDirName);
console.log('Output dir: ' + resultsDirName);
console.log('');

db.serialize();
db.all('SELECT id, name, points FROM problems', function(err, contestProblems){
	if (!(!err && contestProblems)) {
		throw new Error('select problems failed');
	}
	var problemMap = {};
	var userTimestamps = {};
	contestProblems.forEach(function(i, j){
		problemMap[i.id] = j;
		i.testcases = [];
		i.userdata = {};
	});
	db.each('SELECT id, initialtape, expectedtape FROM testcases', function(err, currtestcase){
		if (!(!err && currtestcase && typeof problemMap[currtestcase.id] === 'number' && contestProblems[problemMap[currtestcase.id]])) {
			throw new Error('select testcases failed');
		}
		contestProblems[problemMap[currtestcase.id]].testcases.push({
			initialtape: String(currtestcase.initialtape).toUpperCase(),
			expectedtape: String(currtestcase.expectedtape).toUpperCase().replace(new RegExp('^ *(.*?) *$'), '$1')
		});
	});
	db.each('SELECT id, username, code, timestamp FROM userdata ORDER BY timestamp DESC', function(err, curruserdata){
		if (!(!err && curruserdata && typeof problemMap[curruserdata.id] === 'number' && contestProblems[problemMap[curruserdata.id]])) {
			throw new Error('select userdata failed');
		}
		if (!contestProblems[problemMap[curruserdata.id]].userdata[curruserdata.username]) {
			userTimestamps[curruserdata.username] = curruserdata.timestamp;
			contestProblems[problemMap[curruserdata.id]].userdata[curruserdata.username] = {code: curruserdata.code};
		}
	});
	db.each('SELECT username, password FROM users', function(err, row){
		if (!(!err && row)) {
			throw new Error('select users failed');
		}
		var points = 0;
		contestProblems.forEach(function(currproblem){
			if (currproblem.testcases.length < 1) {
				return;
			}
			console.log('Evaluating problem "' + currproblem.id + '" for user "' + row.username + '"...');
			if (!currproblem.userdata[row.username]) {
				currproblem.userdata[row.username] = {code: getEmptyCode(currproblem.id, currproblem.name)};
			}
			var curruserproblem = currproblem.userdata[row.username];
			curruserproblem.success = false;
			curruserproblem.error = false;
			curruserproblem.testcases = [];
			curruserproblem.successcount = 0;
			currproblem.testcases.some(function(currrawproblem, j){
				var currtestcase = [];
				currtestcase.initialtape = currrawproblem.initialtape;
				currtestcase.expectedtape = currrawproblem.expectedtape;
				currtestcase.outcome = 'Not Run';
				currtestcase.steps = 0;
				currtestcase.endstate = '';
				currtestcase.finaltape = '';
				currtestcase.warnings = [];
				currtestcase.instance = new TuringMachine({
					code: curruserproblem.code,
					tapetext: currtestcase.initialtape,
					onstop: function(){
						currtestcase.outcome = 'Run';
					},
					onerror: function(obj){
						curruserproblem.error = obj;
					},
					onwarning: function(warning){
						currtestcase.warnings.push(warning);
					}
				});
				currtestcase.instance.start();
				while (currtestcase.instance.stepcount <= 100000 && currtestcase.instance.tick());
				currtestcase.steps = currtestcase.instance.stepcount;
				currtestcase.endstate = currtestcase.instance.currstate;
				currtestcase.finaltape = String(currtestcase.instance.tapetext).replace(new RegExp('^ *(.*?) *$'), '$1');
				delete currtestcase.instance;
				if (curruserproblem.error) {
					return true;
				}
				if (currtestcase.outcome !== 'Run' && currtestcase.steps > 100000) {
					currtestcase.outcome = 'Timeout';
				} else if (currtestcase.outcome === 'Run' && currtestcase.finaltape === currtestcase.expectedtape) {
					currtestcase.success = true;
					curruserproblem.successcount++;
				}
				curruserproblem.testcases.push(currtestcase);
			});
			if (curruserproblem.successcount === currproblem.testcases.length) {
				curruserproblem.success = true;
				if (currproblem.points) {
					points += currproblem.points;
				}
			}
		});
		//console.dir(contestProblems);

		var lastsavedate = new Date(userTimestamps[row.username]);
		var lastsavehour = lastsavedate.getHours();
		var lastsavemins = lastsavedate.getMinutes();
		var lastsavesecs = lastsavedate.getSeconds();
		var lastsavetime = (lastsavehour < 10 ? '0' : '') + lastsavehour + ':' + (lastsavemins < 10 ? '0' : '') + lastsavemins + ':' + (lastsavesecs < 10 ? '0' : '') + lastsavesecs;
		var contestTableHtml = '<div id="results"><h1 align="center">Verifica della gara del '+lastsavedate.getDate()+'/'+(lastsavedate.getMonth()+1)+'/'+lastsavedate.getFullYear()+'</h1><p>Per provare usare il <a href="#simulator">simulatore</a> pre-caricato con i problemi della squadra \'<i>'+sanitizer.escape(String(row.username))+'</i>\'.</p><h2>Sommario ('+points+' punt'+(points === 1 ? 'o' : 'i')+', ultimo salvataggio '+lastsavetime+')</h2><table border="1">';
		contestProblems.forEach(function(currproblem, j){
			contestTableHtml += '<tr><td><a'+(currproblem.testcases.length > 0 ? ' href="#'+sanitizer.escape(String(currproblem.id))+'"' : '')+'>'+sanitizer.escape(String(currproblem.name))+'</a> (<a href="progs/'+sanitizer.escape(String(currproblem.id))+'.t">download</a>)</td><td>'+(currproblem.testcases.length > 0 ? (currproblem.userdata[row.username].success ? 'OK' : 'FAIL') : 'N/A')+'</td><td>'+currproblem.points+'</td></tr>';
		});
		contestTableHtml += '</table>';
		contestProblems.forEach(function(currproblem, j){
			if (currproblem.testcases.length < 1) {
				return;
			}
			var curruserproblem = currproblem.userdata[row.username];
			contestTableHtml += '<h2><a name="'+sanitizer.escape(String(currproblem.id))+'">'+sanitizer.escape(String(currproblem.name))+'</a> ('+currproblem.points+' punt'+(currproblem.points === 1 ? 'o' : 'i')+')</h2><table border="1"><tr><td>Outcome</td><td>Input</td><td>Output</td><td>Atteso</td><td>Passi</td><td>Risultato</td></tr>';
			if (curruserproblem.error) {
				contestTableHtml += '<tr><td colspan="6"><font color="#ff0000">'+sanitizer.escape(String((curruserproblem.error.errorType === 'syntax' ? String(currlang.SYNTAX_ERROR_LABEL).replace('%d', curruserproblem.error.errorLine + 1) : currlang.UNKNOWN_ERROR_LABEL) + ' ' + currlang[curruserproblem.error.errorMessage]))+'</font></td></tr>';
			} else {
				curruserproblem.testcases.forEach(function(currtestcase){
					contestTableHtml += '<tr><td>'+sanitizer.escape(String(currtestcase.outcome))+'</td><td class="codecell">'+sanitizer.escape(String(currtestcase.initialtape))+'</td><td class="codecell">'+sanitizer.escape(String(currtestcase.finaltape))+'</td><td class="codecell">'+sanitizer.escape(String(currtestcase.expectedtape))+'</td><td>'+currtestcase.steps+'</td><td>'+(currtestcase.success ? 'OK' : 'FAIL')+'</td></tr>';
				});
			}
			contestTableHtml += '</table>';
		});
		contestTableHtml += '<h2 align="center"><a name="simulator">Simulatore pre-caricato con i problemi della squadra \'<i>'+sanitizer.escape(String(row.username))+'</i>\'</a></h2></div>';

		fs.mkdirSync(path.join(resultsDirName, row.username));
		fs.mkdirSync(path.join(resultsDirName, row.username, 'progs'));

		var preloadedProblems = [];
		contestProblems.forEach(function(currproblem){
			var currcode = (currproblem.userdata[row.username] ? currproblem.userdata[row.username].code : getEmptyCode(currproblem.id, currproblem.name));
			preloadedProblems.push({name: currproblem.name, code: currcode});
			fs.writeFileSync(path.join(resultsDirName, row.username, 'progs', currproblem.id + '.t'), currcode);
		});
		fs.writeFileSync(path.join(resultsDirName, row.username, 'index.html'), ('<!doctype html>\n<!-- saved from url=(0014)about:internet -->\n<!--\n' + licenseText + '--><html><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"><title>JSTMSimulator by VittGam</title><style>' + uglifycss(String(cssStyle)) + '</style>' + iecsshacksHtml + '</head><body class="loadmode displayresults">' + contestTableHtml + turingMachineHtml + '<script>' + uglifyjs.minify('(function(){' + turingMachineJS + i18nJS + handleHTMLPageJS + 'var preloadedProblems = '+JSON.stringify(preloadedProblems)+';' + handlePreloadedProblemsJS + '})();', {fromString: true}).code + '</script></body></html>').replace(new RegExp('(?:\\r\\n|\\n|\\r)', 'g'), '\r\n')); // just another IE 6 fix
		fs.writeFileSync(path.join(resultsDirName, row.username, 'jstmsimulator.gif'), jstmsimulatorGif);

		// TODO creare htpasswd e htaccess qui. l'username sta in row.username e la password sta in row.password

		console.log('');
	}, function(){
		console.log('Results written into ' + resultsDirName);
	});
});
