/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2017 VittGam.net. All Rights Reserved.
 * https://www.turingsimulator.net/
 *
 * See https://www.turingsimulator.net/github for source code.
 *
 * Please see the attached LICENSE file for licensing information.
 */

var serverConfig = {
	contestServer: {
		bindHost: '0.0.0.0',
		bindPort: 8081,
		authRealm: 'Benvenuto alla Gara di programmazione della Macchina di Turing; inserisci le tue credenziali di accesso per continuare',
	},
	results: {
		maxSteps: 100000,
		startFromZero: false,
		authRealm: 'Correzione dei problemi della Gara di programmazione della Macchina di Turing',
	},
	users: {
		'testuser1': 'testpass1',
		'testuser2': 'testpass2',
		'testuser3': 'testpass3',
	},
	problems: {
		'hello': ['Hello World', 0],
		'problem1': ['Problem 1', 1, {
			'DCCSDLCDD': '100213011',
			'C': '0',
			'DDDD': '1111',
		}],
		'problem2': ['Problem 2', 3, {
			'130201301123230S': 'B',
			'S0001': 'B',
			'12321S3021': 'M',
		}],
		'problem3': ['Problem 3', 5, {
			'S01200213': '8',
			'123001002S0123301': '16',
			'S': '0',
		}],
	},
};
