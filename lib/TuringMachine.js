/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2011-2018 Vittorio Gambaletta <vittgam@turingsimulator.net>
 * https://www.turingsimulator.net/
 *
 * See https://www.turingsimulator.net/github for source code.
 *
 * Please see the attached LICENSE file for licensing information.
 */

var TuringMachine = function(obj){
	if (!obj) {
		return null;
	}

	var callback = function(name, arg){
		if (obj[name]) {
			try {
				obj[name](arg);
			} catch (e) {}
		}
	};

	var alphabet = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^-{|}';
	var input = '';
	var rules = {};

	var that = this; // IE 6 does not seem to support Function.prototype.bind...

	that.stepcount = 0;
	that.lastmove = '-';
	that.tapetext = '';
	that.tapepos = 0;
	that.currstate = '0';
	that.currtickline = 0;
	that.stopped = true;

	var TMError = function(type){
		if (!(this instanceof TMError)) {
			return new TMError(type);
		}
		if (type) {
			this.type = type;
		}
	};
	TMError.prototype = new Error();
	TMError.prototype.name = 'TMError';
	TMError.toString = function(){
		return 'function TMError() { [native code] }';
	};
	TMError.toString.toString = TMError.toString;

	var inArray = function(currarray, elm){
		if (currarray) {
			for (var i = 0; i < currarray.length; i++) {
				if (i in currarray && currarray[i] === elm) {
					return i;
				}
			}
		}
		return -1;
	};
	var tick = function(){
		if (that.stopped) {
			return false;
		}
		while (that.tapepos < 0) {
			that.tapetext = ' ' + that.tapetext;
			that.tapepos++;
		}
		while (that.tapepos >= that.tapetext.length) {
			that.tapetext = that.tapetext + ' ';
		}
		var currchar = that.tapetext.charAt(that.tapepos);
		if (!(rules[that.currstate] && rules[that.currstate][currchar])) {
			that.stopped = true;
			callback('onstop');
			return false;
		}
		that.tapetext = that.tapetext.substring(0, that.tapepos) + rules[that.currstate][currchar][1] + that.tapetext.substring(that.tapepos + 1);
		if (rules[that.currstate][currchar][2] === '<') {
			that.lastmove = '<';
			that.tapepos--;
		} else if (rules[that.currstate][currchar][2] === '>') {
			that.lastmove = '>';
			that.tapepos++;
		} else {
			that.lastmove = '-';
		}
		that.stepcount++;
		that.currtickline = rules[that.currstate][currchar][3];
		that.currstate = rules[that.currstate][currchar][0];
		callback('onaftertick');
		return true;
	};
	var unescapedIndexOf = function(input, srch, startidx){
		var output = (typeof startidx == 'undefined' ? 0 : startidx) - 1;
		do {
			output = input.indexOf(srch, output + 1);
		} while (input.charAt(output - 1) === '\\' && ((input.charAt(output - 2) !== '\\') || (input.charAt(output - 3) === '\\')));
		return output;
	};
	var getpart = function(grplength, currtype){
		var openpIdx = unescapedIndexOf(input, '(');
		var commaIdx;
		var closeIdx;
		var commaError;
		if (currtype === 4) { // parsing movement, it's the last part of the 5-uple
			commaIdx = unescapedIndexOf(input, ')');
			closeIdx = -1;
			commaError = 'READ_ERROR_EXPECTED_END_OF_RULE';
		} else {
			commaIdx = unescapedIndexOf(input, ',');
			closeIdx = unescapedIndexOf(input, ')');
			commaError = 'READ_ERROR_EXPECTED_COMMA';
		}
		var nlineIdx = input.indexOf('\n');
		if (openpIdx !== -1 && openpIdx < commaIdx) {
			throw new TMError(commaError);
		} else if (closeIdx !== -1 && closeIdx < commaIdx) {
			throw new TMError(commaError);
		} else if (nlineIdx !== -1 && nlineIdx < commaIdx) {
			throw new TMError(commaError);
		}
		var part = input.substring(0, commaIdx).replace(new RegExp('^\\s\\s*'), '').replace(new RegExp('\\s\\s*$'), '');
		input = input.substring(commaIdx + 1);
		if (part === '') {
			if (currtype === 0) {
				throw new TMError('READ_ERROR_EMPTY_SOURCE_STATUS');
			} else if (currtype === 1) {
				throw new TMError('READ_ERROR_EMPTY_SOURCE_SYMBOL');
			} else if (currtype === 2) {
				throw new TMError('READ_ERROR_EMPTY_DESTINATION_STATUS');
			} else if (currtype === 3) {
				throw new TMError('READ_ERROR_EMPTY_DESTINATION_SYMBOL');
			} else if (currtype === 4) {
				throw new TMError('READ_ERROR_EMPTY_MOVEMENT');
			}
			throw new TMError('READ_ERROR'); // this shouldn't ever happen...
		}
		var open1Idx = unescapedIndexOf(part, '[');
		var clos1Idx = unescapedIndexOf(part, ']');
		var open2Idx = unescapedIndexOf(part, '{');
		var clos2Idx = unescapedIndexOf(part, '}');
		var caretIdx = unescapedIndexOf(part, '^');
		if (open1Idx !== -1) {
			if (clos1Idx === -1) {
				throw new TMError('READ_ERROR_WRONG_CHARACTER_CLASS');
			}
			if (open2Idx !== -1 || clos2Idx !== -1) {
				throw new TMError(commaError);
			}
			if (caretIdx !== -1 && caretIdx !== open1Idx + 1) {
				throw new TMError(commaError);
			}
			if (currtype !== 0 && currtype !== 2 && ((open1Idx !== 0) || (clos1Idx !== part.length - 1))) {
				throw new TMError(commaError);
			}
			if ((currtype === 0 || currtype === 2) && unescapedIndexOf(part, '[', open1Idx + 1) !== -1) {
				throw new TMError(commaError);
			}
			if ((currtype === 0 || currtype === 2) && unescapedIndexOf(part, ']', clos1Idx + 1) !== -1) {
				throw new TMError(commaError);
			}
			return parsegroup(0, grplength, part.substring(open1Idx + 1, clos1Idx), part.substring(0, open1Idx), part.substring(clos1Idx + 1));
		} else if (open2Idx !== -1) {
			if (clos2Idx === -1) {
				throw new TMError('READ_ERROR_WRONG_CHARACTER_CLASS');
			}
			if (open1Idx !== -1 || clos1Idx !== -1) {
				throw new TMError(commaError);
			}
			if (caretIdx !== -1 && caretIdx !== open2Idx + 1) {
				throw new TMError(commaError);
			}
			if (currtype !== 0 && currtype !== 2 && ((open2Idx !== 0) || (clos2Idx !== part.length - 1))) {
				throw new TMError(commaError);
			}
			if ((currtype === 0 || currtype === 2) && unescapedIndexOf(part, '{', open2Idx + 1) !== -1) {
				throw new TMError(commaError);
			}
			if ((currtype === 0 || currtype === 2) && unescapedIndexOf(part, '}', clos2Idx + 1) !== -1) {
				throw new TMError(commaError);
			}
			return parsegroup(1, grplength, part.substring(open2Idx + 1, clos2Idx), part.substring(0, open2Idx), part.substring(clos2Idx + 1));
		}
		if (currtype !== 0 && currtype !== 2) { // not the states
			return parsegroup((part.length > 1 ? 2 : 3), grplength, part, '', '');
		}
		if (part.charAt(part.length - 1) === '\\' && part.charAt(part.length - 2) !== '\\') {
			throw new TMError(commaError);
		}
		return normalizestate(part);
	};
	var normalizestate = function(part){
		var outx = '';
		while (part.length) {
			if (part.charAt(0) === '\\') {
				if (part.length < 2) {
					throw new TMError('READ_ERROR_EXPECTED_COMMA');
				}
				outx += part.charAt(1);
				part = part.substr(2);
			} else if (part.charAt(0) === '-') {
				outx += ' ';
				part = part.substr(1);
			} else {
				outx += part.charAt(0);
				part = part.substr(1);
			}
		}
		return outx;
	};
	var addrule = function(currline, readstate, readtape, writestate, writetape, movement){
		var checkme = null;
		if (readstate instanceof Array) {
			checkme = readstate;
		} else if (readtape instanceof Array) {
			checkme = readtape;
		} else if (writestate instanceof Array) {
			checkme = writestate;
		} else if (writetape instanceof Array) {
			checkme = writetape;
		} else if (movement instanceof Array) {
			checkme = movement;
		}
		if (checkme !== null) {
			var currreadstate = (readstate instanceof Array && readstate[0] === checkme[0]);
			var currreadtape = (readtape instanceof Array && readtape[0] === checkme[0]);
			var currwritestate = (writestate instanceof Array && writestate[0] === checkme[0]);
			var currwritetape = (writetape instanceof Array && writetape[0] === checkme[0]);
			var currmovement = (movement instanceof Array && movement[0] === checkme[0]);
			for (var i = 1; i < checkme.length; i++) {
				addrule(currline, (currreadstate ? readstate[i] : readstate), (currreadtape ? readtape[i] : readtape), (currwritestate ? writestate[i] : writestate), (currwritetape ? writetape[i] : writetape), (currmovement ? movement[i] : movement));
			}
			return;
		}
		if (movement !== '<' && movement !== '>' && movement !== ' ') {
			throw new TMError('READ_ERROR_WRONG_MOVEMENT');
		}
		if (!rules[readstate]) {
			rules[readstate] = {};
		}
		rules[readstate][readtape] = [writestate, writetape, movement, currline];
	};
	var parsegroup = function(grpid, grplength, group, prefix, suffix){
		var outarray = [];
		var reversematch = false;
		prefix = normalizestate(prefix);
		suffix = normalizestate(suffix);
		var prefix2 = prefix;
		var suffix2 = suffix;
		if (group.charAt(0) === '^') {
			reversematch = true;
			group = group.substring(1);
			prefix = suffix = '';
			if (grpid === 3) {
				grpid = 2;
			}
		}
		while (group.length) {
			if (group.charAt(0) === '\\' && !(group.substr(2, 2) === '..' && group.charAt(group.charAt(4) === '\\' ? 5 : 4) !== '')) {
				outarray.push(prefix + group.charAt(1) + suffix);
				group = group.substring(2);
			} else if (group.charAt(0) === '-') {
				outarray.push(prefix + ' ' + suffix);
				group = group.substring(1);
			} else if (group.charAt(0) === '\\' ? (group.substr(2, 2) === '..' && group.charAt(group.charAt(4) === '\\' ? 5 : 4) !== '') : (group.substr(1, 2) === '..' && group.charAt(group.charAt(3) === '\\' ? 4 : 3) !== '')) {
				var startchar = group.charAt(0);
				if (startchar === '\\') {
					startchar = group.charAt(1);
					group = group.substring(1);
				}
				var stopchar = group.charAt(3);
				if (stopchar === '\\') {
					stopchar = group.charAt(4);
					group = group.substring(5);
				} else {
					group = group.substring(4);
				}
				var i = alphabet.indexOf(startchar);
				var j = alphabet.indexOf(stopchar);
				if (i <= j) {
					for (; i <= j; i++) {
						outarray.push(prefix + alphabet.charAt(i) + suffix);
					}
				} else {
					callback('onwarning', 'WARNING_ASCENDING_CHARACTER_CLASS');
					for (; i >= j; i--) {
						outarray.push(prefix + alphabet.charAt(i) + suffix);
					}
				}
			} else {
				outarray.push(prefix + group.charAt(0) + suffix);
				group = group.substring(1);
			}
		}
		if (reversematch) {
			var newoutarray = [];
			for (var k = 0; k < alphabet.length; k++) {
				if (inArray(outarray, alphabet.charAt(k)) === -1) {
					newoutarray.push(prefix2 + alphabet.charAt(k) + suffix2);
				}
			}
			if (inArray(outarray, ' ') === -1) {
				newoutarray.push(prefix2 + ' ' + suffix2);
			}
			outarray = newoutarray;
		}
		if (outarray.length === 1) {
			grpid = 3;
		}
		if (outarray.length < 1) {
			throw new TMError('READ_ERROR_EMPTY_CHARACTER_CLASS');
		} else if (grplength[grpid] && grplength[grpid] !== outarray.length) {
			throw new TMError('READ_ERROR_WRONG_CHARACTER_CLASS');
		}
		grplength[grpid] = outarray.length;
		outarray.unshift(grpid);
		return outarray;
	};
	var start = function(){
		if (!that.stopped) {
			return;
		}
		callback('onprestart');
		try {
			input = String(obj.code).toUpperCase().replace(new RegExp('(?:\r\n|\r)', 'g'), '\n').replace(new RegExp('\t', 'g'), ' ');
			rules = {};
			that.lastmove = '-';
			that.stepcount = 0;
			that.tapetext = String(obj.tapetext).toUpperCase();
			that.tapepos = 0;
			that.currstate = '0';
			that.currtickline = 0;
			that.stopped = false;
			var currline = 0;
			var exitloop = false;
			while (!exitloop) {
				switch (input.substr(0, 1)) {
					case '':
						exitloop = true;
						break;
					case '#':
						currline++;
						if (input.indexOf('\n') === -1) {
							input = '';
							exitloop = true;
						} else {
							input = input.substring(input.indexOf('\n') + 1);
						}
						break;
					case '\n':
						currline++;
						input = input.substring(1);
						break;
					case ' ':
						input = input.substring(1);
						break;
					case '(':
						input = input.substring(1);
						var grplength = {};
						var readstate = getpart(grplength, 0);
						var readtape = getpart(grplength, 1);
						var writestate = getpart(grplength, 2);
						var writetape = getpart(grplength, 3);
						var movement = getpart(grplength, 4);
						addrule(currline, readstate, readtape, writestate, writetape, movement);
						break;
					default:
						throw new TMError('READ_ERROR_UNEXPECTED_END_OF_RULE');
				}
			}
			//console.log(rules);
			callback('onstart');
			tick();
		} catch (e) {
			that.stopped = true;
			callback('onerror', {errorMessage: (e instanceof TMError ? e.type : (e.message || e)), errorType: (e instanceof TMError ? 'syntax' : 'unknown'), errorLine: currline});
		}
	};

	that.tick = tick;
	that.start = start;
	that.stop = function(){
		that.stopped = true;
	};
};
