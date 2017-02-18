/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2017 VittGam.net. All Rights Reserved.
 * https://www.turingsimulator.net/
 *
 * See https://www.turingsimulator.net/github for source code.
 *
 * Please see the attached LICENSE file for licensing information.
 */

if (contestProblems) {
	setTextContent(usernameDiv, currlang.USERNAME_LABEL + ' ' + username);

	var disableInputs = function(){
		codeTextarea.readOnly = inputBox.disabled = speedSelect.disabled = startBtn.disabled = progsSelect.disabled = loadBtn.disabled = saveBtn.disabled = true;
	};

	var enableInputs = function(){
		codeTextarea.readOnly = inputBox.disabled = speedSelect.disabled = startBtn.disabled = progsSelect.disabled = loadBtn.disabled = saveBtn.disabled = false;
	};

	addEvent(loadBtn, 'click', function(){
		var curridx = progsSelect.selectedIndex;
		// always ask for confirmation even if codeTextarea.value === '', so the user can still cancel and ctrl-z after deleting everything
		if (contestProblems[curridx] && confirm(String(currlang.LOAD_CONFIRMATION).replace(new RegExp('{program_name}', 'g'), contestProblems[curridx].name))) {
			disableInputs();
			xmlhttp('ajax/problem/' + encodeURIComponent(contestProblems[curridx].id) + '?_r=' + encodeURIComponent(+(new Date())), null, function(success, response){
				if (success && response && response.success) {
					codeTextarea.value = response.code || '';
					alert(currlang.LOAD_RESULT_OK);
				} else {
					alert(currlang.LOAD_RESULT_FAIL);
				}
				enableInputs();
			});
		}
	});

	addEvent(saveBtn, 'click', function(){
		var curridx = progsSelect.selectedIndex;
		if (contestProblems[curridx] && confirm(String(currlang.SAVE_CONFIRMATION).replace(new RegExp('{program_name}', 'g'), contestProblems[curridx].name))) {
			disableInputs();
			xmlhttp('ajax/problem/' + encodeURIComponent(contestProblems[curridx].id) + '?_r=' + encodeURIComponent(+(new Date())), codeTextarea.value.replace(new RegExp('(?:\r\n|\r)', 'g'), '\n'), function(success, response){
				if (success && response && response.success) {
					alert(currlang.SAVE_RESULT_OK);
				} else {
					alert(currlang.SAVE_RESULT_FAIL);
				}
				enableInputs();
			});
		}
	});

	for (var i = 0; i < contestProblems.length; i++) {
		var curroption = new Option();
		setTextContent(curroption, contestProblems[i].name);
		progsSelect.appendChild(curroption);
	}
}
