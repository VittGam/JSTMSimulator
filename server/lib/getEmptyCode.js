/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2017 VittGam.net. All Rights Reserved.
 * https://www.turingsimulator.net/
 *
 * See https://www.turingsimulator.net/github for source code.
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
