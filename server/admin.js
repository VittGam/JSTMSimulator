/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2014 VittGam.net. All Rights Reserved.
 * http://www.turingsimulator.net/
 *
 * See http://www.turingsimulator.net/github for source code.
 *
 * Please see the attached LICENSE file for licensing information.
 */

// The default admin credentials are admin:admin, change them in config.js!

var path = require('path');
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var uglifyjs = require('uglify-js');
var uglifycss = require('uglifycss').processString;
var express = require('express');
var async = require('async');

var dbname = path.join(__dirname, 'database.sqlite');
if (!fs.existsSync(dbname)) {
	throw new Error('No database! Please use the file init_contest_database.sample.js as a start to create a new database.');
}
var db = new sqlite3.Database(dbname);

var licenseText = fs.readFileSync(path.join(__dirname, 'LICENSE'));
var json3JS = fs.readFileSync(path.join(__dirname, 'lib', 'json3', 'lib', 'json3.js'));
var xmlhttpfuncJS = fs.readFileSync(path.join(__dirname, 'lib', 'xmlhttpfunc.js'));

var serverConfigJS = fs.readFileSync(path.join(__dirname, 'config.js'));
eval(serverConfigJS.toString());

express.logger.token('user', function(req, res){return req.user});

try {
	process.title = 'node: JSTMAdmin, '+serverConfig.adminServer.bindPort+' '+serverConfig.adminServer.bindHost;
} catch (e) {}

var adminapp = express();
adminapp.listen(serverConfig.adminServer.bindPort, serverConfig.adminServer.bindHost);
adminapp.use(express.logger('[admin] :remote-addr - ":user" [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" ":req[host]"'));
adminapp.use(express.basicAuth(serverConfig.adminServer.username, serverConfig.adminServer.password, 'JSTMSimulator Contest Admin'));
adminapp.use(express.json());

adminapp.get('/glyphicons-halflings.png', function(req, res){
	res.sendfile(path.join(__dirname, 'lib', 'bootstrap', 'img', 'glyphicons-halflings.png'));
});

adminapp.get('/glyphicons-halflings-white.png', function(req, res){
	res.sendfile(path.join(__dirname, 'lib', 'bootstrap', 'img', 'glyphicons-halflings-white.png'));
});

var adminInterfaceCss = fs.readFileSync(path.join(__dirname, 'lib', 'adminInterface.css'));
var adminInterfaceHtml = fs.readFileSync(path.join(__dirname, 'lib', 'adminInterface.htm')).toString().replace(new RegExp('(?:\\n|\\r|\\t)', 'g'), '');
var adminInterfaceJS = fs.readFileSync(path.join(__dirname, 'lib', 'adminInterface.js'));
var jqueryJS = fs.readFileSync(path.join(__dirname, 'lib', 'jquery.min.js')).toString().replace(new RegExp('\\n?//@ sourceMappingURL=jquery\\.min\\.map\\n?', 'g'), '');
var bootstrapJS = fs.readFileSync(path.join(__dirname, 'lib', 'bootstrap', 'js', 'bootstrap.min.js'));
var bootstrapCss = fs.readFileSync(path.join(__dirname, 'lib', 'bootstrap', 'css', 'bootstrap.min.css')).toString().replace(new RegExp('\\.\\./img/glyphicons', 'g'), 'glyphicons');
var bootstrapRespCss = fs.readFileSync(path.join(__dirname, 'lib', 'bootstrap', 'css', 'bootstrap-responsive.min.css'));
var finalAdminHTML = ('<!doctype html>\n<!-- saved from url=(0014)about:internet -->\n<!--\n' + licenseText + '--><html class="notranslate"><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"><title>JSTMSimulator Contest Admin</title><style>' + bootstrapCss + bootstrapRespCss + uglifycss(String(adminInterfaceCss)) + '</style></head><body>' + adminInterfaceHtml + '<script>' + uglifyjs.minify('(function(){' + json3JS + xmlhttpfuncJS + adminInterfaceJS + '})();', {fromString: true}).code + '</script><script>' + jqueryJS + bootstrapJS + '</script></body></html>').replace(new RegExp('(?:\\r\\n|\\n|\\r)', 'g'), '\r\n'); // just another IE 6 fix

var adminGetData = function(callback){
	async.parallel({
		problems: function(callback){
			db.all('SELECT id, name, points FROM problems', callback);
		},
		testcases: function(callback){
			db.all('SELECT id, initialtape, expectedtape FROM testcases', callback);
		},
		users: function(callback){
			db.all('SELECT username, password FROM users', callback);
		},
		userdata: function(callback){
			db.all('SELECT id, username, code, timestamp FROM userdata', callback);
		}
	}, callback);
};

adminapp.get('/', function(req, res){
	res.type('html');
	res.send(200, finalAdminHTML);
});

adminapp.get('/ajax/getData', function(req, res){
	adminGetData(function(err, results) {
		if (!err && results) {
			res.json({success: true, data: results});
		} else {
			res.json({success: false});
		}
	});
});

var adminEditCompletionCallback = function(err){
	if (err) {
		res.json({success: false});
	} else {
		adminGetData(function(err, results) {
			if (!err && results) {
				res.json({success: true, data: results});
			} else {
				res.json({success: false});
			}
		});
	}
};

adminapp.post('/ajax/edit', function(req, res){
	if (!req.body) {
		res.json({success: false});
	} else if (req.body.action === 'add_user' && req.body.username && req.body.password) {
		db.run('INSERT INTO users VALUES (?, ?)', [req.body.username, req.body.password], adminEditCompletionCallback);
	} else if (req.body.action === 'edit_user_password' && req.body.username && req.body.password) {
		db.run('UPDATE users SET password = ? WHERE username = ?', [req.body.password, req.body.username], adminEditCompletionCallback);
	} else if (req.body.action === 'delete_user' && req.body.username) {
		db.run('DELETE FROM users WHERE username = ?', [req.body.username], adminEditCompletionCallback);
	} else if (req.body.action === 'add_problem' && req.body.id && req.body.name && typeof req.body.points === 'number') {
		db.run('INSERT INTO problems VALUES (?, ?, ?)', [req.body.id, req.body.name, req.body.points], adminEditCompletionCallback);
	} else if (req.body.action === 'edit_problem_name' && req.body.id && req.body.name) {
		db.run('UPDATE problems SET name = ? WHERE id = ?', [req.body.name, req.body.id], adminEditCompletionCallback);
	} else if (req.body.action === 'edit_problem_points' && req.body.id && typeof req.body.points === 'number') {
		db.run('UPDATE problems SET points = ? WHERE id = ?', [req.body.points, req.body.id], adminEditCompletionCallback);
	} else if (req.body.action === 'delete_problem' && req.body.id) {
		db.run('DELETE FROM problems WHERE id = ?', [req.body.id], adminEditCompletionCallback);
	} else if (req.body.action === 'add_testcase' && req.body.id && req.body.initialtape && req.body.expectedtape) {
		db.run('INSERT INTO testcases VALUES (?, ?, ?)', [req.body.id, req.body.initialtape, req.body.expectedtape], adminEditCompletionCallback);
	} else if (req.body.action === 'edit_testcase_initialtape' && req.body.id && req.body.initialtape) {
		db.run('UPDATE testcases SET initialtape = ? WHERE id = ?', [req.body.initialtape, req.body.id], adminEditCompletionCallback);
	} else if (req.body.action === 'edit_testcase_expectedtape' && req.body.id && req.body.expectedtape) {
		db.run('UPDATE testcases SET expectedtape = ? WHERE id = ?', [req.body.expectedtape, req.body.id], adminEditCompletionCallback);
	} else if (req.body.action === 'delete_testcase' && req.body.id && req.body.initialtape && req.body.expectedtape) {
		db.run('DELETE FROM testcases WHERE id = ? AND initialtape = ? AND expectedtape = ?', [req.body.id, req.body.initialtape, req.body.expectedtape], adminEditCompletionCallback);
	} else {
		res.json({success: false});
	}
});
