/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2014 VittGam.net. All Rights Reserved.
 * http://www.turingsimulator.net/
 *
 * See http://www.turingsimulator.net/github for source code.
 *
 * Please see the attached LICENSE file for licensing information.
 */

var currlang = lang.en;
try {
	var browserLang = (window.navigator && (navigator.language || navigator.userLanguage || navigator.browserLanguage));
	if (browserLang && lang[String(browserLang).substr(0, 2)]) {
		currlang = lang[String(browserLang).substr(0, 2)];
	}
	browserLang = null;
} catch (e) {}

var turingMachineInstance = null;
var beforeUnloadWarningEnabled = false;
var currclass = null;
var ascending_character_class_warning = false;
var statusTimeout = null;
var drawTimeout = null;
var tickTimeout = null;
var tickSpeed = null;
var drawSpeed = null;
var speedToTimeoutMapping = [1500, 1350, 1200, 1050, 900, 750, 600, 450, 300, 150, 0, -1];

var statusDiv = document.getElementById('status');
var stateDiv = document.getElementById('state');
var usernameDiv = document.getElementById('username');
var codeTextarea = document.getElementById('code');
var inputBox = document.getElementById('input');
var tapeDiv = document.getElementById('tape');
var speedLabel = document.getElementById('speedlbl');
var speedSelect = document.getElementById('speed');
var startBtn = document.getElementById('startbtn');
var stopBtn = document.getElementById('stopbtn');
var progsSelect = document.getElementById('progs');
var loadBtn = document.getElementById('loadbtn');
var saveBtn = document.getElementById('savebtn');
var moveLeftBtn = document.getElementById('moveleft');
var moveRightBtn = document.getElementById('moveright');
var cells = [];
for (var i = 0; i < 31; i++) {
	cells[i] = document.getElementById('cell' + i);
}

var textContentProp = ('textContent' in document.body ? 'textContent' : 'innerText');
var setTextContent = function(div, text){
	if (div) {
		div[textContentProp] = text;
	}
};

startBtn.value = currlang.START_BUTTON;
stopBtn.value = currlang.STOP_BUTTON;
loadBtn.value = currlang.LOAD_BUTTON;
saveBtn.value = currlang.SAVE_BUTTON;
setTextContent(speedLabel, currlang.SPEED_LABEL);

var setstatus = function(text, dontcancel){
	clearTimeout(statusTimeout);
	setTextContent(statusDiv, text || '');
	if (!dontcancel && text !== '') {
		statusTimeout = setTimeout(function(){
			setTextContent(statusDiv, '');
		}, 5000);
	}
};
var addEvent = function(elm, evt, func){
	if (elm.addEventListener) {
		elm.addEventListener(evt, func, false);
	} else if (elm.attachEvent) {
		elm.attachEvent('on' + (evt === 'change' ? 'propertychange' : evt), func);
	}
};
var textareaSelectLine = function(currtextarea, linenumber){
	try {
		if (linenumber < 0) {
			return;
		}
		var startpos = 0;
		var endpos = 0;
		var currtextareavalue = currtextarea.value.replace(new RegExp('(?:\r\n|\r)', 'g'), '\n');
		var currtextareavaluelen = currtextareavalue.length;
		for (var i = linenumber; i > 0; i--) {
			startpos = currtextareavalue.indexOf('\n', startpos) + 1;
			if (startpos === 0) {
				return;
			}
		}
		endpos = currtextareavalue.indexOf('\n', startpos);
		if (typeof startpos !== 'number' || startpos < 0 || startpos > currtextareavaluelen) {
			startpos = 0;
		}
		if (typeof endpos !== 'number' || endpos < 0 || endpos > currtextareavaluelen) {
			endpos = currtextareavaluelen;
		}
		if (endpos <= startpos) {
			return;
		}
		var textarealineheight = null;
		if ((window.getComputedStyle && (textarealineheight = window.getComputedStyle(currtextarea, null))) || (document.defaultView && document.defaultView.getComputedStyle && (textarealineheight = document.defaultView.getComputedStyle(currtextarea, null)))) {
			textarealineheight = parseInt(textarealineheight.getPropertyValue('line-height'), 10);
		}
		if (!textarealineheight) {
			textarealineheight = parseInt((currtextarea.currentStyle || currtextarea.style || {}).lineHeight || 16, 10);
		}
		currtextarea.scrollTop = Math.max(0, linenumber * textarealineheight - (currtextarea.clientHeight - textarealineheight) / 2);
		textarealineheight = null;
		if (startpos === 0 && endpos === currtextareavaluelen && typeof currtextarea.select === 'function') {
			currtextarea.select();
		} else if (currtextarea.setSelectionRange) {
			currtextarea.setSelectionRange(startpos, endpos);
		} else if (currtextarea.createTextRange) {
			var range = currtextarea.createTextRange();
			range.collapse(true);
			range.moveEnd('character', endpos);
			range.moveStart('character', startpos);
			range.select();
			range = null;
		}
		window.setTimeout(function(){
			currtextarea.scrollLeft = 0;
		}, 0);
	} catch (e) {}
};
var drawtape = function(){
	var redraw = false;
	if (currclass === 0) {
		currclass = (turingMachineInstance.lastmove === '-' ? 3 : 1);
	} else if (currclass === 1) {
		currclass = 2;
		redraw = true;
	} else if (currclass === 2) {
		currclass = 0;
	} else if (currclass === 3) {
		currclass = 4;
		redraw = true;
	} else if (currclass === 4) {
		currclass = 0;
	} else {
		currclass = 0;
		redraw = true;
	}
	if (redraw) {
		for (var i = 0; i < 31; i++) {
			setTextContent(cells[i], turingMachineInstance.tapetext.charAt(i + turingMachineInstance.tapepos - 15));
		}
		if (startBtn.disabled) {
			textareaSelectLine(codeTextarea, turingMachineInstance.currtickline);
		}
		setTextContent(stateDiv, turingMachineInstance.currstate);
		setstatus(currlang.STEPS_LABEL + ' ' + turingMachineInstance.stepcount, true);
	}
	var newClassName = [];
	if (currclass === 1 || currclass === 2) {
		newClassName.push('anim' + currclass);
	}
	if (currclass === 2) {
		if (turingMachineInstance.lastmove === '<') {
			newClassName.push('movedleft');
		} else if (turingMachineInstance.lastmove === '>') {
			newClassName.push('movedright');
		}
	}
	newClassName = newClassName.join(' ');
	if (tapeDiv.className !== newClassName) {
		tapeDiv.className = newClassName;
	}
	newClassName = null;
	if (currclass === 0 && turingMachineInstance.stopped) {
		setstatus(currlang.STOPPED + ' ' + currlang.STEPS_LABEL + ' ' + turingMachineInstance.stepcount, true);
		currclass = null;
		codeTextarea.readOnly = inputBox.disabled = startBtn.disabled = progsSelect.disabled = loadBtn.disabled = saveBtn.disabled = false;
		return;
	}
	drawTimeout = setTimeout(drawtape, drawSpeed);
};
var setspeed = function(){
	tickSpeed = speedToTimeoutMapping[speedSelect.selectedIndex];
	if (tickSpeed === -1) {
		tickSpeed = 0;
		drawSpeed = 130;
	} else {
		drawSpeed = tickSpeed / 3;
	}
};
var start = function(){
	turingMachineInstance = new TuringMachine({
		code: codeTextarea.value,
		tapetext: inputBox.value,
		onaftertick: function(){
			tickTimeout = setTimeout(turingMachineInstance.tick, tickSpeed);
		},
		onprestart: function(){
			codeTextarea.readOnly = inputBox.disabled = startBtn.disabled = progsSelect.disabled = loadBtn.disabled = saveBtn.disabled = true;
			beforeUnloadWarningEnabled = true;
			currclass = null;
			clearTimeout(drawTimeout);
			clearTimeout(tickTimeout);
		},
		onstart: function(){
			setstatus();
			stopBtn.disabled = false;
			setspeed();
			codeTextarea.focus();
			drawtape();
		},
		onstop: function(){
			stopBtn.disabled = true;
			currclass = null;
			drawtape();
		},
		onerror: function(obj){
			stopBtn.disabled = true;
			clearTimeout(drawTimeout);
			clearTimeout(tickTimeout);
			textareaSelectLine(codeTextarea, obj.errorLine);
			setstatus((obj.errorType === 'syntax' ? String(currlang.SYNTAX_ERROR_LABEL).replace('%d', obj.errorLine + 1) : currlang.UNKNOWN_ERROR_LABEL) + ' ' + currlang[obj.errorMessage]);
			currclass = null;
			codeTextarea.readOnly = inputBox.disabled = startBtn.disabled = progsSelect.disabled = loadBtn.disabled = saveBtn.disabled = false;
		},
		onwarning: function(warning){
			if (warning === 'WARNING_ASCENDING_CHARACTER_CLASS' && !ascending_character_class_warning) {
				ascending_character_class_warning = true;
				alert(currlang.WARNING_ASCENDING_CHARACTER_CLASS + '\n\n' + currlang.WARNING_WONT_BE_SHOWN_AGAIN);
			} else {
				alert(currlang[warning] || warning);
			}
		}
	});
	turingMachineInstance.start();
};
var preventSelectTo = [stateDiv, usernameDiv, speedLabel, statusDiv, tapeDiv, moveLeftBtn, moveRightBtn];
var selectPreventerEvent = ('onselectstart' in document.body ? 'selectstart' : 'mousedown');
var selectPreventerFunc = function(e){
	if (!e) {
		e = window.event;
	}
	if (e.preventDefault) {
		e.preventDefault();
	}
	return false;
};
for (var j = 0; j < preventSelectTo.length; j++) {
	addEvent(preventSelectTo[j], selectPreventerEvent, selectPreventerFunc);
}
preventSelectTo = selectPreventerEvent = selectPreventerFunc = null;
addEvent(startBtn, 'click', start);
addEvent(stopBtn, 'click', function(){
	stopBtn.disabled = true;
	if (turingMachineInstance) {
		turingMachineInstance.stop();
	}
});
addEvent(moveLeftBtn, 'click', function(){
	if (turingMachineInstance && turingMachineInstance.stopped && !startBtn.disabled) {
		turingMachineInstance.tapepos++;
		currclass = null;
		drawtape();
	}
});
addEvent(moveRightBtn, 'click', function(){
	if (turingMachineInstance && turingMachineInstance.stopped && !startBtn.disabled) {
		turingMachineInstance.tapepos--;
		currclass = null;
		drawtape();
	}
});
addEvent(speedSelect, 'change', function(e, v){
	setspeed();
});
window.onbeforeunload = function(){
	if (beforeUnloadWarningEnabled || codeTextarea.value !== '') {
		return currlang.EXIT_CONFIRMATION;
	}
};
codeTextarea.disabled = codeTextarea.readOnly = inputBox.disabled = speedSelect.disabled = startBtn.disabled = progsSelect.disabled = loadBtn.disabled = saveBtn.disabled = false;
