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
var dbname = path.join(__dirname, 'database.sqlite');

var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();

var exists = fs.existsSync(dbname);
if (exists) {
	console.info('Database already exists.');
} else {
	console.info('Creating database.');

	var db = new sqlite3.Database(dbname);
	db.serialize(function(){
		db.run('CREATE TABLE users (username TEXT UNIQUE NOT NULL, password TEXT NOT NULL)');
		db.run('CREATE TABLE problems (id TEXT UNIQUE NOT NULL, name TEXT UNIQUE NOT NULL, points INT)');
		db.run('CREATE TABLE userdata (id TEXT NOT NULL, username TEXT NOT NULL, code TEXT, timestamp INT)');
		db.run('CREATE TABLE testcases (id TEXT NOT NULL, initialtape TEXT, expectedtape TEXT)');

		var stmt = db.prepare('INSERT INTO users VALUES (?, ?)');
		stmt.run('testuser1', 'testpass1');
		stmt.run('testuser2', 'testpass2');
		stmt.run('testuser3', 'testpass3');
		stmt.finalize();
		stmt = null;

		var stmt = db.prepare('INSERT INTO problems VALUES (?, ?, ?)');
		stmt.run('hello', 'Hello World', 0);
		stmt.run('problem1', 'Problem 1', 1);
		stmt.run('problem2', 'Problem 2', 3);
		stmt.run('problem3', 'Problem 3', 5);
		stmt.finalize();
		stmt = null;

		var stmt = db.prepare('INSERT INTO testcases VALUES (?, ?, ?)');

		stmt.run('problem1', 'DCCSDLCDD', '100213011');
		stmt.run('problem1', 'C', '0');
		stmt.run('problem1', 'DDDD', '1111');

		stmt.run('problem2', '130201301123230S', 'B');
		stmt.run('problem2', 'S0001', 'B');
		stmt.run('problem2', '12321S3021', 'M');

		stmt.run('problem3', 'S01200213', '8');
		stmt.run('problem3', '123001002S0123301', '16');
		stmt.run('problem3', 'S', '0');

		stmt.finalize();
		stmt = null;
	});
}
