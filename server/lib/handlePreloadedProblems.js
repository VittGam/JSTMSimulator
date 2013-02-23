/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2013 VittGam.net. All Rights Reserved.
 * https://server1.vittgam.net/jstmsimulator/
 * https://github.com/VittGam/JSTMSimulator
 *
 * Please see the attached LICENSE file for licensing information.
 */

if (preloadedProblems) {
	addEvent(loadBtn, 'click', function(){
		var curridx = progsSelect.selectedIndex;
		// always ask for confirmation even if codeTextarea.value === '', so the user can still cancel and ctrl-z after deleting everything
		if (preloadedProblems[curridx] && confirm(String(currlang.LOAD_CONFIRMATION_NOSAVE).replace(new RegExp('{program_name}', 'g'), preloadedProblems[curridx].name))) {
			codeTextarea.value = preloadedProblems[curridx].code;
		}
	});

	for (var i = 0; i < preloadedProblems.length; i++) {
		var curroption = new Option();
		setTextContent(curroption, preloadedProblems[i].name);
		progsSelect.appendChild(curroption);
	}
}
