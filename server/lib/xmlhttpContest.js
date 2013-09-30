/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2013 VittGam.net. All Rights Reserved.
 * http://www.turingsimulator.net/
 *
 * See http://www.turingsimulator.net/github for source code.
 *
 * Please see the attached LICENSE file for licensing information.
 */

xmlhttp('/ajax/init?_r=' + encodeURIComponent(+(new Date())), null, function(success, data){
	if (success && data && data.success && data.username && data.contestProblems) {
		handleConnection(data.username, data.contestProblems);
	}
});
