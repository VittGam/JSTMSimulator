/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2017 VittGam.net. All Rights Reserved.
 * https://www.turingsimulator.net/
 *
 * See https://www.turingsimulator.net/github for source code.
 *
 * Please see the attached LICENSE file for licensing information.
 */

// The configuration can be found in config.js

var path = require('path');
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var uglifyjs = require('uglify-js');
var uglifycss = require('uglifycss').processString;
var express = require('express');
var async = require('async');

var dbname = path.join(__dirname, 'database.sqlite');
var db = new sqlite3.Database(dbname);
db.run('CREATE TABLE IF NOT EXISTS userdata (id TEXT NOT NULL, username TEXT NOT NULL, code TEXT, timestamp INT)');

var licenseText = fs.readFileSync(path.join(__dirname, 'LICENSE'));
var cssStyle = fs.readFileSync(path.join(__dirname, '..', 'lib', 'style.css'));
var htmlheadHtml = fs.readFileSync(path.join(__dirname, '..', 'lib', 'htmlhead.htm')).toString().replace(new RegExp('(?:\\n|\\r|\\t)', 'g'), '');
var iecsshacksHtml = fs.readFileSync(path.join(__dirname, '..', 'lib', 'iecsshacks.htm')).toString().replace(new RegExp('(?:\\n|\\r|\\t)', 'g'), '');
var turingMachineHtml = fs.readFileSync(path.join(__dirname, '..', 'lib', 'TuringMachine.htm')).toString().replace(new RegExp('(?:\\n|\\r|\\t)', 'g'), '').replace('<div id="status"><a href="https://www.turingsimulator.net/">Turing Machine Simulator</a> by <a href="https://www.vittgam.net/">VittGam</a></div>', '<div id="status">Turing Machine Simulator by VittGam</div>');
var json3JS = fs.readFileSync(path.join(__dirname, 'lib', 'json3', 'lib', 'json3.js'));
var turingMachineJS = fs.readFileSync(path.join(__dirname, '..', 'lib', 'TuringMachine.js'));
var i18nJS = fs.readFileSync(path.join(__dirname, '..', 'lib', 'i18n.js'));
var handleHTMLPageJS = fs.readFileSync(path.join(__dirname, '..', 'lib', 'handleHTMLPage.js'));
var handleContestProblemsJS = fs.readFileSync(path.join(__dirname, 'lib', 'handleContestProblems.js'));
var xmlhttpfuncJS = fs.readFileSync(path.join(__dirname, 'lib', 'xmlhttpfunc.js'));
var xmlhttpContestJS = fs.readFileSync(path.join(__dirname, 'lib', 'xmlhttpContest.js'));
var finalHTML = ('<!doctype html>\n<!-- saved from url=(0014)about:internet -->\n<!--\n' + licenseText + '--><html class="notranslate"><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"><title>Turing Machine Competition</title>' + htmlheadHtml + '<style>' + uglifycss(String(cssStyle)) + '</style>' + iecsshacksHtml + '</head><body class="loadmode savemode">' + turingMachineHtml + '<script>' + uglifyjs.minify('(function(){' + turingMachineJS + i18nJS + json3JS + 'var handleConnection = function(username, contestProblems){' + handleHTMLPageJS + handleContestProblemsJS + '};' + xmlhttpfuncJS + xmlhttpContestJS + '})();', {fromString: true}).code + '</script></body></html>').replace(new RegExp('(?:\\r\\n|\\n|\\r)', 'g'), '\r\n'); // just another IE 6 fix

var getEmptyCodeJS = fs.readFileSync(path.join(__dirname, 'lib', 'getEmptyCode.js'));
eval(getEmptyCodeJS.toString());

var serverConfigJS = fs.readFileSync(path.join(__dirname, 'config.js'));
eval(serverConfigJS.toString());

express.logger.token('user', function(req, res){return req.user});

try {
	process.title = 'JSTMServer '+serverConfig.contestServer.bindPort+' '+serverConfig.contestServer.bindHost;
} catch (e) {}

var userapp = express();
userapp.listen(serverConfig.contestServer.bindPort, serverConfig.contestServer.bindHost);
userapp.use(express.logger(':remote-addr :req[x-real-ip-ok] - ":user" [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" ":req[host]"'));
userapp.use(express.basicAuth(function(username, password, callback){
	if (username && password && serverConfig.users[username] === password) {
		callback(null, username);
	} else {
		callback(true, null);
	}
}, serverConfig.contestServer.authRealm));

userapp.use(function(req, res, next){
	res.header('X-Content-Type-Options', 'nosniff');
	if (req.path === '/jstmsimulator.gif') {
		res.header('Cache-Control', 'private, must-revalidate, post-check=0, pre-check=0');
	} else if (req.path !== '/favicon.ico') {
		res.header({
			'Cache-Control': 'private, no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
			'Pragma': 'no-cache',
			'Expires': 'Thu, 25 May 1995 21:16:00 GMT',
		});
	}
	next();
});

userapp.get('/', function(req, res){
	res.type('html');
	res.send(200, finalHTML);
});

userapp.get('/jstmsimulator.gif', function(req, res){
	res.sendfile(path.join(__dirname, '..', 'out', 'jstmsimulator.gif'));
});

userapp.get('/ajax/init', function(req, res){
	var ret = {success: true, username: req.user, contestProblems: []};
	Object.keys(serverConfig.problems).forEach(function(i){
		ret.contestProblems.push({id: i, name: serverConfig.problems[i][0]});
	});
	res.json(ret);
});

userapp.get('/ajax/problem/:problemid', function(req, res){
	if (req.params && req.params.problemid && serverConfig.problems[req.params.problemid]) {
		db.get('SELECT code FROM userdata WHERE id = ? AND username = ? ORDER BY timestamp DESC LIMIT 0,1', req.params.problemid, req.user, function(err, row){
			if (!err) {
				res.json({success: true, code: (row && row.code) || getEmptyCode(req.params.problemid, serverConfig.problems[req.params.problemid][0])});
			} else {
				res.json({success: false});
			}
		});
	} else {
		res.json({success: false});
	}
});

userapp.post('/ajax/problem/:problemid', function(req, res){
	if (req.params && req.params.problemid && serverConfig.problems[req.params.problemid] && req.is('text/plain')) {
		var rawBody = '';
		req.setEncoding('utf8');
		req.on('data', function(chunk){
			rawBody += chunk;
		});
		req.on('end', function(){
			db.run('INSERT INTO userdata VALUES (?, ?, ?, ?)', req.params.problemid, req.user, rawBody || '', +(new Date()), function(err){
				res.json({success: !err});
			});
		});
	} else {
		res.json({success: false});
	}
});

userapp.get('/favicon.ico', function(req, res){
	res.send(204);
});

userapp.get('*', function(req, res){
	res.redirect('/');
});
