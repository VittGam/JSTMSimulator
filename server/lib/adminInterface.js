/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2017 VittGam.net. All Rights Reserved.
 * https://www.turingsimulator.net/
 *
 * See https://www.turingsimulator.net/github for source code.
 *
 * Please see the attached LICENSE file for licensing information.
 */

// TODO add server write interactivity and reorganize the sections (testcases under single problems, userdata under single users)
// TODO add loading indicator (it's nicer ;) )

var doc = document;
var navigation = doc.getElementById('navigation');
var currview = doc.getElementById('currview');
var navHomeLinkClick = null;
doc.getElementById('navHomeLink').addEventListener('click', function(){
	if (navHomeLinkClick) {
		navHomeLinkClick();
	}
	return false;
}, false);
xmlhttp('ajax/getData?_r=' + encodeURIComponent(+(new Date())), null, function(success, response){
	if (success && response && response.success && response.data) {
		var newnav = doc.createElement('ul');
		newnav.className = 'nav nav-list';
		newnav.setAttribute('id', 'navigation');
		var currli = doc.createElement('li');
		currli.className = 'nav-header';
		var curra = doc.createElement('a');
		curra.textContent = 'Problems';
		curra.addEventListener('click', function(){
			showOnlyTheseTables(['problems_table', 'users_table']);
			return false;
		}, false);
		currli.appendChild(curra);
		newnav.appendChild(currli);
		currli = curra = null;
		if (response.data.problems) {
			response.data.problems.forEach(function(currproblem){
				var currli = doc.createElement('li');
				var curra = doc.createElement('a');
				curra.textContent = currproblem.name;
				var currspan = doc.createElement('span');
				currspan.className = 'label label-warning';
				currspan.textContent = currproblem.points;
				curra.appendChild(currspan);
				curra.addEventListener('click', function(){
					showOnlyTheseTables(['problem_'+currproblem.id+'_table', 'testcases_'+currproblem.id+'_table']);
					return false;
				}, false);
				currli.appendChild(curra);
				newnav.appendChild(currli);
				currli = curra = currspan = null;
			});
		}
		var currli = doc.createElement('li');
		currli.className = 'nav-header';
		var curra = doc.createElement('a');
		curra.textContent = 'Users';
		curra.addEventListener('click', function(){
			showOnlyTheseTables(['problems_table', 'users_table']);
			return false;
		}, false);
		currli.appendChild(curra);
		newnav.appendChild(currli);
		currli = curra = null;
		if (response.data.users) {
			response.data.users.forEach(function(curruser){
				var currli = doc.createElement('li');
				var curra = doc.createElement('a');
				curra.textContent = curruser.username;
				curra.addEventListener('click', function(){
					showOnlyTheseTables(['user_'+curruser.username+'_table', 'userdata_'+curruser.username+'_table']);
					return false;
				}, false);
				currli.appendChild(curra);
				newnav.appendChild(currli);
				currli = curra = null;
			});
		}
		navigation.parentElement.replaceChild(newnav, navigation);
		navigation = newnav;
		newnav = null;
		var newview = doc.createElement('span');
		newview.className = 'span9';
		newview.setAttribute('id', 'currview');

		var tableIDs = [];
		var tableDivs = {};

		var createTable = function(title, tableid, rowdata) {
			var rootdiv = doc.createElement('div');
			rootdiv.setAttribute('id', tableid);
			tableDivs[tableid] = rootdiv;
			tableIDs.push(tableid);
			var currheader = doc.createElement('h2');
			currheader.textContent = title;
			rootdiv.appendChild(currheader);
			currheader = null;
			var outtable = doc.createElement('table');
			outtable.className = 'table table-bordered table-striped table-condensed rawdata';
			var currthead = doc.createElement('thead');
			var currtr = doc.createElement('tr');
			var currth;
			if (rowdata) {
				rowdata.forEach(function(i){
					currth = doc.createElement('th');
					if (typeof i == 'object') {
						currth.appendChild(i);
					} else {
						currth.textContent = i;
					}
					currtr.appendChild(currth);
				});
			}
			currthead.appendChild(currtr);
			outtable.appendChild(currthead);
			var currtbody = doc.createElement('tbody');
			outtable.appendChild(currtbody);
			rootdiv.appendChild(outtable);
			newview.appendChild(rootdiv);
			rootdiv = currthead = currtr = currth = outtable = null;
			return currtbody;
		};

		var addRowToTable = function(currtbody, rowdata) {
			var currtr = doc.createElement('tr');
			var currtd;
			if (rowdata) {
				rowdata.forEach(function(i){
					currtd = doc.createElement('td');
					if (typeof i == 'object') {
						currtd.appendChild(i);
					} else {
						currtd.textContent = i;
					}
					currtr.appendChild(currtd);
				});
			}
			currtbody.appendChild(currtr);
			currtr = currtd = null;
		};

		var showOnlyTheseTables = function(tableIdToShowArray) {
			tableIDs.forEach(function(i){
				tableDivs[i].style.display = ((tableIdToShowArray.indexOf(i)===-1) ? 'none' : '');
			});
		};

		var problemsTable = createTable('Problems', 'problems_table', ['ID', 'Name', 'Points', 'Actions']);
		var usersTable = createTable('Users', 'users_table', ['Username', 'Password', 'Actions']);
		var testcasesTables = {};
		var userdataTables = {};
		var problemNames = {};

		if (response.data.problems) {
			response.data.problems.forEach(function(row){
				var actionlink = doc.createElement('a');
				actionlink.textContent = 'View / edit';
				actionlink.addEventListener('click', function(){
					showOnlyTheseTables(['problem_'+row.id+'_table', 'testcases_'+row.id+'_table']);
					return false;
				}, false);
				addRowToTable(problemsTable, [row.id, row.name, row.points, actionlink]);
				testcasesTables[row.id] = createTable('Test cases for ' + row.name, 'testcases_'+row.id+'_table', ['Initial tape', 'Expected tape', 'Actions']);
				problemNames[row.id] = row.name;
			});
		}

		if (response.data.testcases) {
			response.data.testcases.forEach(function(row){
				addRowToTable(testcasesTables[row.id], [row.initialtape, row.expectedtape, 'actionlink']);
			});
		}

		if (response.data.users) {
			response.data.users.forEach(function(row){
				var actionlink = doc.createElement('a');
				actionlink.textContent = 'View / edit';
				actionlink.addEventListener('click', function(){
					showOnlyTheseTables(['user_'+row.username+'_table', 'userdata_'+row.username+'_table']);
					return false;
				}, false);
				addRowToTable(usersTable, [row.username, row.password, actionlink]);
				userdataTables[row.username] = createTable('User data for ' + row.username, 'userdata_'+row.username+'_table', ['Problem name', 'Code', 'Timestamp', 'Actions']);
			});
		}

		if (response.data.userdata) {
			response.data.userdata.forEach(function(row){
				addRowToTable(userdataTables[row.username], [problemNames[row.id], row.code, new Date(row.timestamp).toString(), 'actionlink']);
			});
		}

		showOnlyTheseTables(['problems_table', 'users_table']);

		navHomeLinkClick = function(){
			showOnlyTheseTables(['problems_table', 'users_table']);
		};

		currview.parentElement.replaceChild(newview, currview);
		currview = newview;
		newview = null;
	}
});
