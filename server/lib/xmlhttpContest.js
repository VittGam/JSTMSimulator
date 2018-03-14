/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2011-2018 Vittorio Gambaletta <vittgam@turingsimulator.net>
 * https://www.turingsimulator.net/
 *
 * See https://www.turingsimulator.net/github for source code.
 *
 * Please see the attached LICENSE file for licensing information.
 */

xmlhttp('ajax/init?_r=' + encodeURIComponent(+(new Date())), null, function(success, data){
	if (success && data && data.success && data.username && data.contestProblems) {
		handleConnection(data.username, data.contestProblems);
	}
});
