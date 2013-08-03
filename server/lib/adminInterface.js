/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2013 VittGam.net. All Rights Reserved.
 * http://JSTMSimulator.VittGam.net/
 * https://github.com/VittGam/JSTMSimulator
 *
 * Please see the attached LICENSE file for licensing information.
 */

// TODO add server write interactivity and reorganize the sections (testcases under single problems, userdata under single users)
// TODO add loading indicator (it's nicer ;) )

var navigation = document.getElementById('navigation');
var currview = document.getElementById('currview');
xmlhttp('/ajax/getData?_r=' + encodeURIComponent(+(new Date())), null, function(success, response){
	if (success && response && response.success && response.data) {
		var newnav = document.createElement('ul');
		newnav.className = 'nav nav-list';
		newnav.setAttribute('id', 'navigation');
		var currli = document.createElement('li');
		currli.className = 'nav-header';
		var curra = document.createElement('a');
		curra.textContent = 'Problems';
		currli.appendChild(curra);
		newnav.appendChild(currli);
		currli = curra = null;
		if (response.data.problems) {
			response.data.problems.forEach(function(currproblem){
				var currli = document.createElement('li');
				var curra = document.createElement('a');
				curra.textContent = currproblem.name;
				var currspan = document.createElement('span');
				currspan.className = 'label label-warning';
				currspan.textContent = currproblem.points;
				curra.appendChild(currspan);
				currli.appendChild(curra);
				newnav.appendChild(currli);
				currli = curra = currspan = null;
			});
		}
		var currli = document.createElement('li');
		currli.className = 'nav-header';
		var curra = document.createElement('a');
		curra.textContent = 'Users';
		currli.appendChild(curra);
		newnav.appendChild(currli);
		currli = curra = null;
		if (response.data.users) {
			response.data.users.forEach(function(curruser){
				var currli = document.createElement('li');
				var curra = document.createElement('a');
				curra.textContent = curruser.username;
				currli.appendChild(curra);
				newnav.appendChild(currli);
				currli = curra = null;
			});
		}
		navigation.parentElement.replaceChild(newnav, navigation);
		navigation = newnav;
		newnav = null;
		var newview = document.createElement('span');
		newview.className = 'span9';
		newview.setAttribute('id', 'currview');
		for (var currtable in response.data) {
			var currheader = document.createElement('h2');
			currheader.textContent = currtable;
			newview.appendChild(currheader);
			currheader = null;
			var outtable;
			if (response.data[currtable]) {
				outtable = document.createElement('table');
				outtable.className = 'table table-bordered table-striped table-condensed rawdata';
				if (response.data[currtable].length) {
					var currthead = document.createElement('thead');
					var currtr = document.createElement('tr');
					for (var currelm in response.data[currtable][0]) {
						var currth = document.createElement('th');
						currth.textContent = currelm;
						currtr.appendChild(currth);
						currth = null;
					}
					var currth = document.createElement('th');
					currth.textContent = 'actions';
					currtr.appendChild(currth);
					currth = null;
					currthead.appendChild(currtr);
					outtable.appendChild(currthead);
					currthead = currtr = null;
					var currtbody = document.createElement('tbody');
					response.data[currtable].forEach(function(row){
						var currtr = document.createElement('tr');
						for (var currelm in row) {
							var currtd = document.createElement('td');
							currtd.textContent = row[currelm];
							currtr.appendChild(currtd);
							currtd = null;
						}
						var currtd = document.createElement('td');
						var currlink = document.createElement('a');
						currlink.textContent = 'edit · delete';
						currtd.appendChild(currlink);
						currtr.appendChild(currtd);
						currtd = currlink = null;
						currtbody.appendChild(currtr);
						currtr = null;
					});
					outtable.appendChild(currtbody);
					currtbody = null;
				}
			}
			newview.appendChild(outtable || document.createTextNode('Cannot get ' + currtable + ' table!'));
			outtable = null;
		}
		currview.parentElement.replaceChild(newview, currview);
		currview = newview;
		newview = null;
	}
});
