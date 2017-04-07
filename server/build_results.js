/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2017 VittGam.net. All Rights Reserved.
 * https://www.turingsimulator.net/
 *
 * See https://www.turingsimulator.net/github for source code.
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
var htmlheadHtml = fs.readFileSync(path.join(__dirname, '..', 'lib', 'htmlhead.htm')).toString().replace(new RegExp('(?:\\n|\\r|\\t)', 'g'), '');
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

var serverConfigJS = fs.readFileSync(path.join(__dirname, 'config.js'));
eval(serverConfigJS.toString());

var getLastSaveTime = function(lastsavedate) {
	var lastsavehour = lastsavedate.getHours();
	if (isNaN(lastsavehour)) return 'Mai';
	var lastsavemins = lastsavedate.getMinutes();
	var lastsavesecs = lastsavedate.getSeconds();
	return (lastsavehour < 10 ? '0' : '') + lastsavehour + ':' + (lastsavemins < 10 ? '0' : '') + lastsavemins + ':' + (lastsavesecs < 10 ? '0' : '') + lastsavesecs;
};

var resultsDirName = path.join(__dirname, 'results', String(+(new Date())));
if (!fs.existsSync(path.join(__dirname, 'results'))) {
	fs.mkdirSync(path.join(__dirname, 'results'));
}
fs.mkdirSync(resultsDirName);
console.log('Output dir: ' + resultsDirName);
console.log('');

db.serialize();
var contestProblems = [];
Object.keys(serverConfig.problems).forEach(function(i){ // FIXME!!!
	contestProblems.push({id: i, name: serverConfig.problems[i][0], points: serverConfig.problems[i][1]});
});
var problemMap = {};
var userTimestamps = {};
var lastTimestamp = null;
var userPoints = {};
contestProblems.forEach(function(i, j){
	problemMap[i.id] = j;
	i.testcases = [];
	i.userdata = {};
});
Object.keys(serverConfig.testcases).forEach(function(i){ // FIXME!!!
	if (!(typeof problemMap[i] === 'number' && contestProblems[problemMap[i]])) {
		throw new Error('select testcases failed');
	}
	serverConfig.testcases[i].forEach(function(j){
		contestProblems[problemMap[i]].testcases.push({
			initialtape: String(j[0]).toUpperCase(),
			expectedtape: String(j[1]).toUpperCase().replace(new RegExp('^ *(.*?) *$'), '$1')
		});
	});
});
db.each('SELECT id, username, code, timestamp FROM userdata ORDER BY timestamp DESC', function(err, curruserdata){
	if (!(!err && curruserdata && typeof problemMap[curruserdata.id] === 'number' && contestProblems[problemMap[curruserdata.id]])) {
		throw new Error('select userdata failed');
	}
	if (!contestProblems[problemMap[curruserdata.id]].userdata[curruserdata.username]) {
		if (!userTimestamps[curruserdata.username]) {
			userTimestamps[curruserdata.username] = curruserdata.timestamp;
		}
		if (!lastTimestamp) {
			lastTimestamp = curruserdata.timestamp;
		}
		contestProblems[problemMap[curruserdata.id]].userdata[curruserdata.username] = {code: curruserdata.code};
	}
}, function(){
	Object.keys(serverConfig.users).forEach(function(i){
		var row = {username: i, password: serverConfig.users[i]}; // FIXME!!!

		if (!userTimestamps.hasOwnProperty(row.username)) {
			return;
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
			currproblem.testcases.some(function(currrawproblem){
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
				while (currtestcase.instance.stepcount <= serverConfig.maxsteps && currtestcase.instance.tick());
				currtestcase.steps = currtestcase.instance.stepcount;
				currtestcase.endstate = currtestcase.instance.currstate;
				currtestcase.finaltape = String(currtestcase.instance.tapetext).replace(new RegExp('^ *(.*?) *$'), '$1');
				delete currtestcase.instance;
				if (curruserproblem.error) {
					return true;
				}
				if (currtestcase.outcome !== 'Run' && currtestcase.steps > serverConfig.maxsteps) {
					console.log('Timeout!');
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
		var lastsavetime = getLastSaveTime(lastsavedate);
		var contestTableHtml = '<div id="results"><h1 align="center">Verifica della gara del '+lastsavedate.getDate()+'/'+(lastsavedate.getMonth()+1)+'/'+lastsavedate.getFullYear()+'</h1><p>Per provare usare il <a href="#simulator">simulatore</a> pre-caricato con i problemi della squadra \'<i>'+sanitizer.escape(String(row.username))+'</i>\'.</p><h2>Sommario ('+points+' punt'+(points === 1 ? 'o' : 'i')+', ultimo salvataggio '+lastsavetime+')</h2><table border="1"><tr><th>Problem</th><th>Points</th><th>Result</th><th>Count</th></tr>';
		contestProblems.forEach(function(currproblem){
			contestTableHtml += '<tr><td><a';
			if (currproblem.testcases.length > 0) {
				contestTableHtml += ' href="#'+sanitizer.escape(String(currproblem.id))+'"';
			}
			contestTableHtml += '>'+sanitizer.escape(String(currproblem.name))+'</a> (<a href="progs/'+sanitizer.escape(String(currproblem.id))+'.t">download</a>)</td>';
			if (currproblem.testcases.length > 0) {
				contestTableHtml += '<td>' + currproblem.points + '</td>';
				var xcolor = (currproblem.userdata[row.username].success ? 'green' : (currproblem.userdata[row.username].successcount > 0 ? 'yellow' : 'red'));
				contestTableHtml += '<td class="' + xcolor + '">' + (currproblem.userdata[row.username].success ? 'OK' : 'FAIL') + '</td>';
				contestTableHtml += '<td class="' + xcolor + '">' + currproblem.userdata[row.username].successcount + '/' + currproblem.testcases.length + '</td>';
			} else {
				contestTableHtml += '<td>N/A</td><td>N/A</td><td>N/A</td>';
			}
			contestTableHtml += '</tr>';
		});
		contestTableHtml += '</table>';
		contestProblems.forEach(function(currproblem){
			if (currproblem.testcases.length < 1) {
				return;
			}
			var curruserproblem = currproblem.userdata[row.username];
			contestTableHtml += '<h2><a name="'+sanitizer.escape(String(currproblem.id))+'">'+sanitizer.escape(String(currproblem.name))+'</a> ('+currproblem.points+' punt'+(currproblem.points === 1 ? 'o' : 'i')+')</h2><table border="1"><tr><th>Outcome</th><th>Input</th><th>Output</th><th>Atteso</th><th>Passi</th><th>Risultato</th></tr>';
			if (curruserproblem.error) {
				contestTableHtml += '<tr><td colspan="6" style="color:#f00">'+sanitizer.escape(String((curruserproblem.error.errorType === 'syntax' ? String(currlang.SYNTAX_ERROR_LABEL).replace('%d', curruserproblem.error.errorLine + 1) : currlang.UNKNOWN_ERROR_LABEL) + ' ' + currlang[curruserproblem.error.errorMessage]))+'</td></tr>';
			} else {
				curruserproblem.testcases.forEach(function(currtestcase){
					contestTableHtml += '<tr><td>'+sanitizer.escape(String(currtestcase.outcome))+'</td><td class="codecell">'+sanitizer.escape(String(currtestcase.initialtape))+'</td><td class="codecell">'+sanitizer.escape(String(currtestcase.finaltape))+'</td><td class="codecell">'+sanitizer.escape(String(currtestcase.expectedtape))+'</td><td>'+currtestcase.steps+'</td><td class="'+(currtestcase.success ? 'green' : 'red')+'">'+(currtestcase.success ? 'OK' : 'FAIL')+'</td></tr>';
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
		fs.writeFileSync(path.join(resultsDirName, row.username, 'index.html'), ('<!doctype html>\n<!-- saved from url=(0014)about:internet -->\n<!--\n' + licenseText + '--><html class="notranslate"><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"><title>Turing Machine Competition Results</title>' + htmlheadHtml + '<style>' + uglifycss(String(cssStyle)) + '</style>' + iecsshacksHtml + '</head><body class="loadmode displayresults">' + contestTableHtml + turingMachineHtml + '<script>' + uglifyjs.minify('(function(){' + turingMachineJS + i18nJS + handleHTMLPageJS + 'var preloadedProblems = '+JSON.stringify(preloadedProblems)+';' + handlePreloadedProblemsJS + '})();', {fromString: true}).code + '</script></body></html>').replace(new RegExp('(?:\\r\\n|\\n|\\r)', 'g'), '\r\n')); // just another IE 6 fix
		fs.writeFileSync(path.join(resultsDirName, row.username, 'jstmsimulator.gif'), jstmsimulatorGif);

		userPoints[row.username] = points;

		// TODO creare htpasswd e htaccess qui. l'username sta in row.username e la password sta in row.password

		console.log('');
	});
	var lastsavedate = new Date(lastTimestamp);
	var lastsavetime = getLastSaveTime(lastsavedate);
	var contestTableHtml = '<div id="results"><h1 align="center">Classifica della gara del '+lastsavedate.getDate()+'/'+(lastsavedate.getMonth()+1)+'/'+lastsavedate.getFullYear()+'</h1><h2>Ultimo salvataggio globale: '+lastsavetime+'</h2><table border="1"><tr><th>Posizione</th><th>Nome utente</th><th>Punteggio</th><th>Ultimo salvataggio</th>';
	var contestCSV = '"Nome utente";"Posizione";"Punteggio";"Ultimo salvataggio"\n';
	contestProblems.forEach(function(currproblem){
		if (currproblem.testcases.length > 0) {
			contestTableHtml += '<th class="prob">' + sanitizer.escape(String(currproblem.name)) + '</th>';
		}
	});
	contestTableHtml += '</tr>';
	Object.keys(userTimestamps).sort(function(a, b){
		if (userPoints[a] != userPoints[b]) {
			return userPoints[b] - userPoints[a];
		}
		if (!isNaN(userTimestamps[a]) && !isNaN(userTimestamps[b])) {
			return userTimestamps[a] - userTimestamps[b];
		}
		if (isNaN(userTimestamps[a]) && !isNaN(userTimestamps[b])) {
			return b;
		}
		if (isNaN(userTimestamps[b]) && !isNaN(userTimestamps[a])) {
			return a;
		}
		return a < b ? -1 : 1;
	}).forEach(function(currusername, j){
		contestTableHtml += '<tr><td>'+(j+1)+'°</td><td><a href="'+sanitizer.escape(String(currusername))+'">'+sanitizer.escape(String(currusername))+'</a></td><td>'+userPoints[currusername]+'</td><td>'+sanitizer.escape(String(getLastSaveTime(new Date(userTimestamps[currusername]))))+'</td>';
		contestCSV += '"' + sanitizer.escape(String(currusername)) + '","'+(j+1)+'","'+userPoints[currusername]+'","'+sanitizer.escape(String(getLastSaveTime(new Date(userTimestamps[currusername]))))+'"\n';
		contestProblems.forEach(function(currproblem){
			if (currproblem.testcases.length > 0) {
				contestTableHtml += '<td class="prob ' + (currproblem.userdata[currusername].success ? 'green' : (currproblem.userdata[currusername].successcount > 0 ? 'yellow' : 'red')) + '">' + currproblem.userdata[currusername].successcount + '/' + currproblem.testcases.length + '</td>';
			}
		});
		contestTableHtml += '</tr>';
	});
	contestTableHtml += '</table></div>';

	fs.writeFileSync(path.join(resultsDirName, 'index.html'), ('<!doctype html>\n<!-- saved from url=(0014)about:internet -->\n<!--\n' + licenseText + '--><html class="notranslate"><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"><title>Turing Machine Competition Results</title>' + htmlheadHtml + '<style>' + uglifycss(String(cssStyle)) + '</style>' + iecsshacksHtml + '</head><body class="loadmode displayresults">' + contestTableHtml + '</body></html>').replace(new RegExp('(?:\\r\\n|\\n|\\r)', 'g'), '\r\n')); // just another IE 6 fix
	fs.writeFileSync(path.join(resultsDirName, 'index.csv'), contestCSV);

	console.log('Results written into ' + resultsDirName);
});
