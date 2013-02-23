/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2013 VittGam.net. All Rights Reserved.
 * https://server1.vittgam.net/jstmsimulator/
 * https://github.com/VittGam/JSTMSimulator
 *
 * Please see the attached LICENSE file for licensing information.
 */

// This function can be used to set default problem texts for the contest
var getEmptyCode = function(problemid, problemname){
	if (problemid === 'hello') {
		return '# Programma di esempio\n# Questo e\' un commento\n(0, -, 1, C, >)\n\(1, -, 2, I, >)\n(2, -, 3, A, >)\n(3, -, 4, O, >)\n';
	}
	return '# ' + problemname + '\n\n';
};
