/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2013 VittGam.net. All Rights Reserved.
 * http://JSTMSimulator.VittGam.net/
 * https://github.com/VittGam/JSTMSimulator
 *
 * Please see the attached LICENSE file for licensing information.
 */

// The default admin credentials are admin:admin, change them below!

var path = require('path');
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var uglifyjs = require('uglify-js');
var uglifycss = require('uglifycss').processString;
var express = require('express');
var async = require('async');
var sanitizer = require('sanitizer');

var dbname = path.join(__dirname, 'database.sqlite');
if (!fs.existsSync(dbname)) {
	throw new Error('No database! Please use the file initContestDatabase.sample.js as a start to create a new database.');
}
var db = new sqlite3.Database(dbname);

var licenseText = fs.readFileSync(path.join(__dirname, '..', 'LICENSE'));
var cssStyle = fs.readFileSync(path.join(__dirname, '..', 'lib', 'style.css'));
var iecsshacksHtml = fs.readFileSync(path.join(__dirname, '..', 'lib', 'iecsshacks.htm')).toString().replace(new RegExp('(?:\\n|\\r|\\t)', 'g'), '');
var turingMachineHtml = fs.readFileSync(path.join(__dirname, '..', 'lib', 'TuringMachine.htm')).toString().replace(new RegExp('(?:\\n|\\r|\\t)', 'g'), '');
var json3JS = fs.readFileSync(path.join(__dirname, 'lib', 'json3', 'lib', 'json3.js'));
var turingMachineJS = fs.readFileSync(path.join(__dirname, '..', 'lib', 'TuringMachine.js'));
var i18nJS = fs.readFileSync(path.join(__dirname, '..', 'lib', 'i18n.js'));
var handleHTMLPageJS = fs.readFileSync(path.join(__dirname, '..', 'lib', 'handleHTMLPage.js'));
var handleContestProblemsJS = fs.readFileSync(path.join(__dirname, 'lib', 'handleContestProblems.js'));
var xmlhttpfuncJS = fs.readFileSync(path.join(__dirname, 'lib', 'xmlhttpfunc.js'));
var xmlhttpContestJS = fs.readFileSync(path.join(__dirname, 'lib', 'xmlhttpContest.js'));
var finalHTML = ('<!doctype html>\n<!-- saved from url=(0014)about:internet -->\n<!--\n' + licenseText + '--><html><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"><title>JSTMSimulator by VittGam</title><style>' + uglifycss(String(cssStyle)) + '</style>' + iecsshacksHtml + '</head><body class="loadmode savemode">' + turingMachineHtml + '<script>' + uglifyjs.minify('(function(){' + turingMachineJS + i18nJS + json3JS + 'var handleConnection = function(username, contestProblems){' + handleHTMLPageJS + handleContestProblemsJS + '};' + xmlhttpfuncJS + xmlhttpContestJS + '})();', {fromString: true}).code + '</script></body></html>').replace(new RegExp('(?:\\r\\n|\\n|\\r)', 'g'), '\r\n'); // just another IE 6 fix

var getEmptyCodeJS = fs.readFileSync(path.join(__dirname, 'lib', 'getEmptyCode.js'));
eval(getEmptyCodeJS.toString());

express.logger.token('user', function(req, res){return req.user});

var userapp = express();
userapp.listen(8081);
userapp.use(express.logger('[user]  :remote-addr - ":user" [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" ":req[host]"'));
userapp.use(express.basicAuth(function(username, password, callback){
	db.get('SELECT username, password FROM users WHERE username = ? AND password = ?', username, password, function(err, row){
		if (!err && row && row.username === username && row.password === password) {
			callback(null, username);
		} else {
			callback(true, null);
		}
	});
}, 'Benvenuto nella gara sulla Macchina di Turing; inserisci le tue credenziali di accesso per continuare'));

userapp.get('/', function(req, res){
	res.type('html');
	res.send(200, finalHTML);
});

userapp.get('/jstmsimulator.gif', function(req, res){
	res.sendfile(path.join(__dirname, '..', 'out', 'jstmsimulator.gif'));
});

userapp.get('/ajax/init', function(req, res){
	db.all('SELECT id, name FROM problems', function(err, rows){
		if (!err && rows) {
			res.json({success: true, username: req.user, contestProblems: rows});
		} else {
			res.json({success: false});
		}
	});
});

userapp.get('/ajax/problem/:problemid', function(req, res){
	if (req.params && req.params.problemid) {
		db.get('SELECT id, name FROM problems WHERE id = ?', req.params.problemid, function(err, row){
			if (!err && row && row.id === req.params.problemid) {
				db.get('SELECT code FROM userdata WHERE id = ? AND username = ? ORDER BY timestamp DESC LIMIT 0,1', req.params.problemid, req.user, function(err, row2){
					if (!err) {
						res.json({success: true, code: (row2 && row2.code) || getEmptyCode(req.params.problemid, row.name)});
					} else {
						res.json({success: false});
					}
				});
			} else {
				res.json({success: false});
			}
		});
	} else {
		res.json({success: false});
	}
});

userapp.post('/ajax/problem/:problemid', function(req, res){
	if (req.params && req.params.problemid && req.is('text/plain')) {
		var rawBody = '';
		req.setEncoding('utf8');
		req.on('data', function(chunk){
			rawBody += chunk;
		});
		req.on('end', function(){
			db.get('SELECT id FROM problems WHERE id = ?', req.params.problemid, function(err, row){
				if (!err && row && row.id === req.params.problemid) {
					db.run('INSERT INTO userdata VALUES (?, ?, ?, ?)', req.params.problemid, req.user, rawBody || '', +(new Date()), function(err){
						res.json({success: !err});
					});
				} else {
					res.json({success: false});
				}
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

var adminapp = express();
adminapp.listen(8082);
adminapp.use(express.logger('[admin] :remote-addr - ":user" [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" ":req[host]"'));
adminapp.use(express.basicAuth('admin', 'admin', 'JSTMSimulator Contest Admin'));

adminapp.get('/', function(req, res){
	async.parallel({
		users: function(callback){
			db.all('SELECT username, password FROM users', callback);
		},
		problems: function(callback){
			db.all('SELECT id, name, points FROM problems', callback);
		},
		userdata: function(callback){
			db.all('SELECT id, username, code, timestamp FROM userdata', callback);
		},
		testcases: function(callback){
			db.all('SELECT id, initialtape, expectedtape FROM testcases', callback);
		}
	}, function(err, results) {
		if (err) {
			res.send(500, 'Error!');
			return;
		}
		res.set('Content-Type', 'text/html');
		res.write('<html><head><title>JSTMSimulator Contest Admin</title></head><body><h1>JSTMSimulator Contest Admin</h1>');
		for (var currtable in results) {
			res.write('<h2>' + sanitizer.escape(String(currtable)) + '</h2>');
			if (results[currtable]) {
				res.write('<table border="1">');
				if (results[currtable].length) {
					for (var currelm in results[currtable][0]) {
						res.write('<th>' + sanitizer.escape(String(currelm)) + '</th>');
					}
					results[currtable].forEach(function(row){
						res.write('<tr>');
						for (var currelm in row) {
							res.write('<td><pre>' + (typeof row[currelm] === 'number' ? parseInt(row[currelm], 10) : sanitizer.escape(String(row[currelm]))) + '</pre></td>');
						}
						res.write('</tr>');
					});
				}
				res.write('</table>');
			} else {
				res.write('<p>Cannot get ' + sanitizer.escape(String(currtable)) + ' table!</p>');
			}
		}
		res.write('</body></html>');
		res.end();
	});
});

// TODO implement admin app interactivity

