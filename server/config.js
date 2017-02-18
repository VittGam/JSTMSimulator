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
	adminServer: {
		bindHost: '0.0.0.0',
		bindPort: 8082,
		username: 'admin',
		password: 'admin',
	}
};
