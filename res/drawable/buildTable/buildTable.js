(function($) {
	// Actual method when plugin is initialised
    $.fn.buildTable = function(options) {
    	var opts = $.extend( {'tbodyrowhtml':''}, $.fn.buildTable.defaults, options );
    	
    	return this.each(function() {
    		var tableID = this.id;
    		$(this).wrap('<div id="div_'+tableID+'" style="position:relative;"></div>');
    		$(this).wrap('<div class="tab_wrapper"></div>');
    		opts.pageLength = opts.availPageLen[0];
    		makePageSel(tableID,'tab_wrapper',opts);
    		makeTextSearch(tableID,'tab_wrapper',opts);
    		if (opts.addFilInput)
    			makeFilInput(tableID,'tab_wrapper',opts);
    		makePagination(tableID, 'tab_wrapper',opts);
    		makeRowsInfo(tableID,'tab_wrapper');
    		makeLoadDiv(tableID,opts);
    		$('#div_'+tableID+' .tab_wrapper').before('<span style="display:block;clear:both;"></span>');
    		$('#div_'+tableID+' .div_loading').before('<span style="display:block;clear:both;"></span>');
			var theadRows = $(this).children('thead').children('tr');
			var tBodyRows = $(this).children('tbody').children('tr');
			tBodyRows.slice(1).remove();
    		if (opts.addCheckable){
    			opts.availCheckAct.splice(0, 0, "Clear");
    			makeCheckActDiv(tableID,opts);
    			if (theadRows.length > 1){
    				theadRows.first().prepend('<th class="checkable" rowspan="'+theadRows.length+'"><input class="check_head" type="checkbox"></th>');
    			} else {
    				theadRows.prepend('<th class="checkable"><input class="check_head" type="checkbox"></th>');
    			}
    			theadRows.children('.checkable').each(function(){
    				setClickAction(this,'thead',tableID,opts);
    			});
    			tBodyRows.prepend('<td class="checkable"><input type="checkbox"></td>');
    			tBodyRows.children('.checkable').each(function(){
    				setClickAction(this,'tbody',tableID,opts);
    			});
    		}
    		opts.tbodyrowhtml = tBodyRows.html();
    		tBodyRows.after('<tr class="norecordrow"><td colspan="'+tBodyRows.first().children('td').length+'" style="text-align:center;">'+opts.tableEmptyMsg+'</td></tr>');
    		theadRows.children('th.sortableH').each(function(){
    			$(this).html($(this).html()+'<i class="fa fa-sort" style="margin-left:10px;"></i>');
    			$(this).on('click', function(){
    				sortColumn($(this),$(this).attr('value'),tableID,opts);
    			});
    		});
    		$('#'+tableID+' .norecordrow').css('display','none');
    		populateTable(opts.initialValues,tableID,opts);
    		var nextEnabled = {};
    		if (opts.nextPage)
    			nextEnabled = {'nextEnabled':'Y'};
			setControlState(nextEnabled,tableID,opts);
			$('#'+tableID+' thead th.defaultSort').each(function(){
				var columnNo = $(this).index();
				if (opts.addCheckable)
					columnNo -= 1;
				//alert(columnNo);
				opts.sortingType.push({'value':parseInt(columnNo),'order':0});
				opts.sortedCol.push(columnNo);
				$(this).children('i').first().removeClass('fa-sort').addClass('fa-sort-up').css('color','black');
				hlAllSortedCol(tableID,opts);
			});
			//alert(JSON.stringify(opts.sortingType));
			// call resize function after window is resized (30 milliseconds)
			$(window).resize(function() {
		    	clearTimeout(this.id);
		    	this.id = setTimeout(function(){
		    		var tabOuterDiv = $('#div_'+tableID);
			    	if (tabOuterDiv.find('.div_loading').is(':visible'))
			    		resizeLoadDiv(tabOuterDiv, tableID);
			    	opts.completeEvenFunc.call();
			    }, 30);
			});
    	});
    };
    // Default variables required by plugin
    $.fn.buildTable.defaults = {
		updateUrl : '',
		initialValues : [['1-1','1-2','1-3','1-4','1-5','1-6','1-7','1-8','1-9','1-10','1-11','1-12'],['2-1','2-2','2-3','2-4','2-5','2-6','2-7','2-8','2-9','2-10','2-11','2-12']],
		addCheckable : false,
		availPageLen : [10,25,50,100],
		availCheckAct : [],
		checkSingleOnly : [],
		checkActRetVal : 'checkActVal',
		checkActFunc : function() {},
		clickableRetVal : 'checkActVal',
		clickableFunc : function() {},
		searchableCol : 'searchableCol',
		addFilInput : false,
		availFilters : [], // 2 Dimensional Array; e.g. [{'name':'Superuser','column':'0','values':['Yes','No']},{'name':'Status','column':'1','values':['True','False']}]
		completeEvenFunc : function() {},
		windowResizeFunc : function() {},
		noRecordMsg : 'No record(s) to show',
		tableEmptyMsg : 'No record(s) available for viewing',
		pageLength : 10,
    	recordStart : 1,
    	recordEnd : 10,
    	numOfRecords : 2,
    	sortingType : [],
    	sortedCol : [],
    	prevPage : false,
    	nextPage : true,
    	searchText : [],
    	tableFunc : true,
    	loadImgSrc : '/static/buildTable/loading.gif'
	};
    
    // Private Functions ------------------------------------------------------------------------------------
    // Function to highlight/unhighlight selected row
	function rowSelected(element){
		if (element.checked)
			$(element).closest('tr').addClass('row_selected');
		else
			$(element).closest('tr').removeClass('row_selected');
	};
	// Function to populate checkAct dropdownlist for selected rows accordingly
	function popCheckAct(tableID,checkSingleOnly){
		var numItems = $('#'+tableID+' tbody tr.row_selected').filter(':visible').length;
		var selActEle = $('#check_'+tableID);
		if (numItems > 1){
			for (var i=0,len=checkSingleOnly.length;i<len;i++){
				selActEle.children('option[value="'+checkSingleOnly[i]+'"]').css('display','none');
				if (selActEle.val() == checkSingleOnly[i])
					selActEle.prop('selectedIndex',0);
			}
		} else {
			for (var i=0,len=checkSingleOnly.length;i<len;i++){
				selActEle.children('option[value="'+checkSingleOnly[i]+'"]').css('display','');
			}
		}
	};
	// function to check if all checkboxes (tbody) are selected, and check/uncheck the header checkbox accordingly
	function checkAllSel(tableID){
		console.time('checkAllSel timer');
		var checkboxes = $('#'+tableID+' tbody tr td.checkable input').filter(':visible');
		if (checkboxes.length == checkboxes.filter(':checked').length)
        	$('#'+tableID+' thead th.checkable input').prop('checked',true);
        else
        	$('#'+tableID+' thead th.checkable input').prop('checked',false);
		console.timeEnd('checkAllSel timer');
	};
    function setClickAction(element,parent,tableID,opts){
    	var checkbox = $(element).children('input');
		$(element).on('click',function(){
			checkbox.click();
		});
		checkbox.on('click',function(e){
			switch (parent){
				case 'thead':
					var checkedState = this.checked;
					$('#'+tableID+' tbody tr').filter(':visible').not('.norecordrow').find('.checkable input').each(function(){
						this.checked = checkedState;
						rowSelected(this);
					});
					if (opts.addCheckable)
						popCheckAct(tableID,opts.checkSingleOnly);
					break;
				case 'tbody':
					//alert(this.checked);
					rowSelected(this);
					if (opts.addCheckable)
						popCheckAct(tableID,opts.checkSingleOnly);
					checkAllSel(tableID);
					break;
			}
			e.stopPropagation();
		});
    };
    // Resize the loadig div
    function resizeLoadDiv(tabOuterDiv, tableID){
    	tabOuterDiv.find('.loadingSpace').height($('#'+tableID).offset().top-tabOuterDiv.offset().top);
    	return tabOuterDiv.find('.div_loading').height(tabOuterDiv.height()).width(tabOuterDiv.width());
    }
    // Function to pause/unpause all table functions, and show/hide loading prompt
    function pauseTableFunc(isPause,tableID,opts){
    	var tabOuterDiv = $('#div_'+tableID);
		if (isPause){
			// var imgHeight = parseInt(height/4.5);
			// if (imgHeight > 110)
				// imgHeight = 110;
			// else if (imgHeight < 35)
				// imgHeight = 35;
			(resizeLoadDiv(tabOuterDiv, tableID)).css('display','block');
			$('#sel_'+tableID).prop('disabled',true);
			$('#text_'+tableID).prop('disabled',true);
			$('#check_'+tableID).prop('disabled',true);
			tabOuterDiv.find('.div_filInput select').prop('disabled',true);
			opts.tableFunc = false;
			/*
			$('#loading_div').css('display','none');
			$('#pageLenSel').prop('disabled',false);
			*/
		} else {
			tabOuterDiv.find('.div_loading').css('display','none');
			if (opts.numOfRecords > 0 || opts.searchText.length > 0){
				$('#sel_'+tableID).prop('disabled',false);
				$('#text_'+tableID).prop('disabled',false);
				$('#check_'+tableID).prop('disabled',false);
				tabOuterDiv.find('.div_filInput select').prop('disabled',false);
				opts.tableFunc = true;
			}
		}
	};
    // Function to clear all visible rows, create/hide rows when necessary, and then populate the remaining visible rows with data
    function populateTable(data,tableID,opts){
    	console.time('populateTable timer');
    	var table = $('#'+tableID);
    	// Clear data for all visible rows first
    	var allTBodyRows = table.find('tbody tr');
		allTBodyRows.filter(':visible').not('.norecordrow').each(function(){
			$(this).find('td').each(function(index){
				if (index == 0 && opts.addCheckable){
					var checkbox = $(this).children('input').get(0);
					checkbox.checked = false;
					rowSelected(checkbox);
					popCheckAct(tableID,opts.checkSingleOnly);
				}
				else
					$(this).html('').removeClass('sortCell');
			});
		});
		table.find('thead .checkable input').prop('checked',false);
		// Get number of existing rows (exclude empty table data row)
		var existRows = allTBodyRows.not('.norecordrow').length;
		// If number of existing rows less than number of data records, create additional required rows
		var noRecordRow = allTBodyRows.filter('.norecordrow');
		if (existRows < data.length){
			for (var i=0;i<data.length-existRows;i++){
				noRecordRow.before('<tr>'+opts.tbodyrowhtml+'</tr>');
			}
			allTBodyRows = table.find('tbody tr');
			allTBodyRows.not('.norecordrow').slice(existRows).children('.checkable').each(function(){
				setClickAction(this,'tbody',tableID,opts);
			});
		}
		// If number of existing rows more than number of data records, hide the extra rows
		else if (existRows > data.length)
			allTBodyRows.not('.norecordrow').slice(data.length).css('display','none');
		// If there are data records
		if (data.length > 0){
			var notNoRecordRows = allTBodyRows.not('.norecordrow');
			var row;
			for (var i=0;i<data.length;i++){
				row = notNoRecordRows.filter(':eq('+i+')');
				row.children('td').not('.checkable').each(function(index){
					//if (index != 0)
					$(this).html(data[i][index]);
				});
				row.css('display','');
			}
			hlAllSortedCol(tableID,opts);
			noRecordRow.css('display','none');
		} else
			noRecordRow.css('display','');
		allTBodyRows.not('.norecordrow').find('.'+opts.clickableRetVal).wrapInner('<i class="clickableData"></i>');
		allTBodyRows.not('.norecordrow').find('.clickableData').on('click',function(){
			opts.clickableFunc.call(this);
		});
		allTBodyRows.filter(':visible').filter(':odd').addClass('odd');
		allTBodyRows.filter(':visible').filter(':even').addClass('even');
    	console.timeEnd('populateTable timer');
	};
	// Function to highlight all sorted columns
	function hlAllSortedCol(tableID,opts){
		for (var i=0,arrLen=opts.sortedCol.length;i<arrLen;i++){
			$('#'+tableID+' tbody tr').filter(':visible').not('.norecordrow').each(function(){
				$(this).children('td').not('.checkable').filter(':eq('+opts.sortedCol[i]+')').addClass('sortCell');
			});
		} 
	};
	// Function to set the state (enable/disable) of table controls generated by this plugin
    function setControlState(data,tableID,opts){
    	console.time('setControlState timer');
    	var tabOuterDiv = $('#div_'+tableID);
		if (data.prevEnabled == 'Y'){
			opts.prevPage = true;
			tabOuterDiv.find('.page_first').addClass('enabled');
			tabOuterDiv.find('.page_prev').addClass('enabled');
		} else {
			opts.prevPage = false;
			tabOuterDiv.find('.page_first').removeClass('enabled');
			tabOuterDiv.find('.page_prev').removeClass('enabled');
		}
		if (data.nextEnabled == "Y"){
			opts.nextPage = true;
			tabOuterDiv.find('.page_next').addClass('enabled');
			tabOuterDiv.find('.page_last').addClass('enabled');
		} else {
			opts.nextPage = false;
			tabOuterDiv.find('.page_next').removeClass('enabled');
			tabOuterDiv.find('.page_last').removeClass('enabled');
		}
		if (opts.numOfRecords == 0){
			tabOuterDiv.find('.div_rowsInfo').html('No entries to show');
			if (opts.searchText.length == 0){
				opts.tableFunc = false;
				$('#sel_'+tableID).prop('disabled',true);
				$('#text_'+tableID).prop('disabled',true);
				$('#check_'+tableID).prop('disabled',true);
				tabOuterDiv.find('.div_filInput select').prop('disabled',true);
				tabOuterDiv.find('.sortableH').removeClass('sortableH');
			}
		} else
			tabOuterDiv.find('.div_rowsInfo').html('Showing <strong>'+opts.recordStart+'</strong> to <strong>'+opts.recordEnd+'</strong> of <strong>'+opts.numOfRecords+'</strong> entries');
    	console.timeEnd('setControlState timer');
	};
    // Function to handle changing of page length
    function chngPageLen(element,tableID,opts){
    	if (opts.tableFunc){
    		console.time('chngPageLen timer');
			pauseTableFunc(true,tableID,opts);
			updateSearch(tableID,opts);
			var selectedLen = $(element).val();
			$.ajax({
	            type:"POST",
	            url :opts.updateUrl,
	            data:{'pageLength':selectedLen,'sortingType':JSON.stringify(opts.sortingType),'recordStart':opts.recordStart,'recordEnd':opts.recordEnd,'searchText':JSON.stringify(opts.searchText)},
	            dataType:"json",
	            success:function(data){
	            	//logToConsole(data);
	            	//logToConsole(data.valueList);
	            	opts.numOfRecords = data.numOfRecords;
	            	opts.recordStart = data.recordStart;
	            	opts.recordEnd = data.recordEnd;
	    			populateTable(data.valueList,tableID,opts);
	    			setControlState(data,tableID,opts);
	    			opts.pageLength = selectedLen;
	    			pauseTableFunc(false,tableID,opts);
    				opts.completeEvenFunc.call();
	    		},
	    		error : function(xhr,errmsg,err) {
	    			alert(xhr.status + ": " + xhr.responseText);
				}
			});
    		console.timeEnd('chngPageLen timer');
		}
    };
    // Function to handle changing of table page
    function changePage(paginate,tableID,opts){
		if (opts.tableFunc){
			var proceed = false;
			switch (paginate){
				case "first":
				case "prev":
					if (opts.prevPage)
						proceed = true;
					break;
				case "next":
				case "last":
					if (opts.nextPage)
						proceed = true;
					break;
				default:
					break;
			}
			if (proceed){
    			console.time('changePage timer');
    			pauseTableFunc(true,tableID,opts);
				updateSearch(tableID,opts);
				$.ajax({
		            type:"POST",
		            url :opts.updateUrl,
		            data:{'pageLength':opts.pageLength,'sortingType':JSON.stringify(opts.sortingType),'recordStart':opts.recordStart,'recordEnd':opts.recordEnd,'searchText':JSON.stringify(opts.searchText),'paginate':paginate},
		            dataType:"json",
		            success:function(data){
		            	//logToConsole(data);
		            	opts.numOfRecords = data.numOfRecords;
		            	opts.recordStart = data.recordStart;
		            	opts.recordEnd = data.recordEnd;
		            	populateTable(data.valueList,tableID,opts);
		    			setControlState(data,tableID,opts);
		    			pauseTableFunc(false,tableID,opts);
	    				opts.completeEvenFunc.call();
		    		},
		    		error : function(xhr,errmsg,err) {
		    			alert(xhr.status + ": " + xhr.responseText);
					}
				});
    			console.timeEnd('changePage timer');
			}
		}
	};
    // Function for sorting of columns
    function sortColumn(element,info,tableID,opts){
		if (opts.tableFunc){
    		console.time('sortColumn timer');
			pauseTableFunc(true,tableID,opts);
			updateSearch(tableID,opts);
			/*var infoArr = $.map(info.split(';'), function(value){
			    //return parseInt(value, 10);
				return +value;
			    // or return +value; which handles float values as well
			});*/
			var found = false;
			for (var i=0;i<opts.sortingType.length;i++){
				if (opts.sortingType[i].value == info){
					switch (opts.sortingType[i].order){
						case 0:
							opts.sortingType[i].order = 1;
							break;
						case 1:
						default:
							opts.sortingType.splice(i,1);
							break;
					}
					found = true;
					break;
				}
			}
			if (!found){
				opts.sortingType.push({'value':parseInt(info),'order':0});
			}
			var sortIcon = $(element).children('i').first();
			if (sortIcon.hasClass('fa-sort')){
				sortIcon.removeClass('fa-sort').addClass('fa-sort-up').css('color','black');
				opts.sortedCol.push(info);
			}
			else if (sortIcon.hasClass('fa-sort-up'))
				sortIcon.removeClass('fa-sort-up').addClass('fa-sort-down');
			else if (sortIcon.hasClass('fa-sort-down')){
				sortIcon.removeClass('fa-sort-down').addClass('fa-sort').css('color','');
				opts.sortedCol.splice($.inArray(info, opts.sortedCol),1);
			}
			//alert(JSON.stringify(opts.sortingType));
			$.ajax({
	            type:"POST",
	            url :opts.updateUrl,
	            data:{'pageLength':opts.pageLength,'sortingType':JSON.stringify(opts.sortingType),'recordStart':opts.recordStart,'recordEnd':opts.recordEnd,'searchText':JSON.stringify(opts.searchText)},
	            dataType:"json",
	            success:function(data){
	            	//alert(data);
	            	//setTimeout(function(){
	            	opts.numOfRecords = data.numOfRecords;
	            	opts.recordStart = data.recordStart;
	            	opts.recordEnd = data.recordEnd;
	            	populateTable(data.valueList,tableID,opts);
	    			setControlState(data,tableID,opts);
	    			pauseTableFunc(false,tableID,opts);
	    			opts.completeEvenFunc.call();
	            	//},1000);
	    		},
	    		error : function(xhr,errmsg,err) {
	    			alert(xhr.status + ": " + xhr.responseText);
				}
			});
    		console.timeEnd('sortColumn timer');
		}
	};
	// Function to handle data search
    function processSearch(tableID,opts){
    	if (opts.tableFunc){
    		console.time('processSearch timer');
			pauseTableFunc(true,tableID,opts);
			updateSearch(tableID,opts);
			//logToConsole(opts.searchText);
			$.ajax({
	            type:"POST",
	            url :opts.updateUrl,
	            data:{'pageLength':opts.pageLength,'sortingType':JSON.stringify(opts.sortingType),'recordStart':opts.recordStart,'recordEnd':opts.recordEnd,'searchText':JSON.stringify(opts.searchText),'firstSearch':'Y'},
	            dataType:"json",
	            success:function(data){
	            	opts.numOfRecords = data.numOfRecords;
	            	opts.recordStart = data.recordStart;
	            	opts.recordEnd = data.recordEnd;
	    			populateTable(data.valueList,tableID,opts);
	    			setControlState(data,tableID,opts);
	    			pauseTableFunc(false,tableID,opts);
    				opts.completeEvenFunc.call();
	    		},
	    		error : function(xhr,errmsg,err) {
	    			alert(xhr.status + ": " + xhr.responseText);
				}
			});
    		console.timeEnd('processSearch timer');
		}
    };
	// Function to refresh search text
	function updateSearch(tableID,opts){
		var searchVal = [];
			var valueStr;
			if (opts.addFilInput){
				$('#div_'+tableID+' .div_filInput select').each(function(){
					valueStr = $(this).val();
					if (valueStr != "")
						searchVal.push({'searchType':$(this).attr('columnno'), 'searchTerm':valueStr});
				});
			}
			valueStr = $('#text_'+tableID).val();
			if (valueStr != "")
				searchVal.push({'searchType':'sText', 'searchTerm':valueStr});
			opts.searchText = searchVal;
	};
    
    
	// Create page length select control for table
	function makePageSel(tableID, wrapperClass,opts){
		var tabOuterDiv = $('#div_'+tableID);
    	var divPageSel = createElement('div', {'class':'div_pageSel'});
    	var pageSel = createElement('select', {'id':'sel_'+tableID,'class':'pageSel','style':'margin-left:3px;margin-right:3px;'});
    	for (var i=0;i<opts.availPageLen.length;i++){
    		if (i==0)
    			pageSel.append('<option selected="selected" value="'+opts.availPageLen[i]+'">'+opts.availPageLen[i]+'</option>');
    		else
    			pageSel.append('<option value="'+opts.availPageLen[i]+'">'+opts.availPageLen[i]+'</option>');
    	}
    	divPageSel.append('<label for="sel_'+tableID+'">Show</label>');
    	divPageSel.append(pageSel);
    	divPageSel.append('<label for="sel_'+tableID+'">entries</label>');
    	tabOuterDiv.find('.'+wrapperClass).before(divPageSel);
    	// handler function for page select
    	tabOuterDiv.find('.pageSel').on('change', function(){
    		chngPageLen(this,tableID,opts);
    	});
    };
    // Create text search controls for table
    function makeTextSearch(tableID, wrapperClass, opts){
		var tabOuterDiv = $('#div_'+tableID);
    	var divTextSearch = createElement('div', {'class':'div_textSearch'});
    	divTextSearch.append('<label for="text_'+tableID+'">Search:</label>');
    	divTextSearch.append('<input id="text_'+tableID+'" class="textSearch" type="text" style="margin-left:3px;margin-right:3px;" placeholder="Query Text" />');
    	divTextSearch.append('<span class="btn_textSearch"><i class="fa fa-arrow-right"></i></span>');
    	tabOuterDiv.find('.'+wrapperClass).before(divTextSearch);
    	tabOuterDiv.find('th.searchableCol').css('font-style','italic').prepend('* ');
    	tabOuterDiv.after('<span class="searchableInfo" style="display:block;font-style:italic;font-weight:bold;">* Only data within these columns are searchable.</span>');
    	var textSearchBtn = tabOuterDiv.find('.btn_textSearch');
    	tabOuterDiv.find('.textSearch').on('keyup',function(event){
    		if(event.keyCode == 13){
		        textSearchBtn.click();
		    }
    	});
    	textSearchBtn.on('click',function(){
    		processSearch(tableID,opts);
    	});
    	
    };
    // Create filter input controls for table
    function makeFilInput(tableID, wrapperClass, opts){
		var tabOuterDiv = $('#div_'+tableID);
    	var divFilInput = createElement('div', {'class':'div_filInput'});
    	divFilInput.append('<label for="fil_'+tableID+'">Filter By:</label>');
    	var availFilters = opts.availFilters;
    	var filInput;
    	for (var i=0,iLen=availFilters.length;i<iLen;i++){
    		filInput = createElement('select', {'id':'fil'+(i+1)+'_'+tableID,'class':'filInput'+(i+1),'style':'margin-left:3px;margin-left:3px;','columnno':availFilters[i].column});
    		for (var x=0,xLen=availFilters[i].value.length;x<xLen;x++){
    			filInput.append('<option value="'+availFilters[i].value[x]+'">'+availFilters[i].text[x]+'</option>');
	    	}
	    	filInput.prepend('<option value="">All</option>');
	    	filInput.prepend('<option selected="selected" value="">'+availFilters[i].name+'</option>');
	    	divFilInput.append(filInput);
    	}
    	tabOuterDiv.find('.'+wrapperClass).before(divFilInput);
    	tabOuterDiv.find('.div_filInput select').on('change',function(){
    		processSearch(tableID,opts);
		});
    };
    // Create control to show row(s) information
    function makeRowsInfo(tableID, wrapperClass){
    	var divRowsInfo = createElement('div', {'class':'div_rowsInfo','text':$.fn.buildTable.defaults.noRecordMsg});
    	$('#div_'+tableID+' .'+wrapperClass).after(divRowsInfo);
    };
    // Create pagination controls for table
    function makePagination(tableID, wrapperClass,opts){
    	var tabOuterDiv = $('#div_'+tableID);
    	var divPaginate = createElement('div', {'class':'div_pagination'});
    	divPaginate.append('<span class="page_first" value="first"><i class="fa fa-fast-backward"></i>&nbsp;&nbsp;First</span>');
    	divPaginate.append('<span class="page_prev" value="prev" style="margin-left:10px;"><i class="fa fa-step-backward"></i>&nbsp;&nbsp;Prev</span>');
    	divPaginate.append('<span class="page_next" value="next" style="margin-left:15px;margin-right:10px;">Next&nbsp;&nbsp;<i class="fa fa-step-forward"></i></span>');
    	divPaginate.append('<span class="page_last" value="last">Last&nbsp;&nbsp;<i class="fa fa-fast-forward"></i></span>');
    	tabOuterDiv.find('.'+wrapperClass).after(divPaginate);
    	tabOuterDiv.find('.div_pagination').children().on('click', function(){
    		//alert($(this).attr('value'));
    		changePage($(this).attr('value'),tableID,opts);
    	});
    };
    // Create div to display loading image when table is processing information
    function makeLoadDiv(tableID,opts){
    	$('#div_'+tableID).append('<div class="div_loading"><span class="loadingSpace"></span><span class="loadingImg">Loading...<br/><img src="'+opts.loadImgSrc+'" /></span></div>');
	};
	function makeCheckActDiv(tableID,opts){
		var tabOuterDiv = $('#div_'+tableID);
    	var divCheckAct = createElement('div', {'class':'div_checkAct'});
    	var checkAct = createElement('select', {'id':'check_'+tableID,'class':'checkAct','style':'margin-left:3px;margin-right:3px;'});
    	for (var i=0;i<opts.availCheckAct.length;i++){
    		if (i==0)
    			checkAct.append('<option selected="selected" value="'+opts.availCheckAct[i]+'">'+opts.availCheckAct[i]+'</option>');
    		else
    			checkAct.append('<option value="'+opts.availCheckAct[i]+'">'+opts.availCheckAct[i]+'</option>');
    	}
    	divCheckAct.append('<label for="check_'+tableID+'">Select Checked Action:</label>');
    	divCheckAct.append(checkAct);
    	divCheckAct.append('<span class="btn_checkAct"><i class="fa fa-arrow-right"></i></span>');
    	tabOuterDiv.prepend(divCheckAct);
    	tabOuterDiv.find('.btn_checkAct').on('click', function(){
    		if (opts.tableFunc){
	    		var checkControl = $('#check_'+tableID);
	    		if (checkControl.prop('selectedIndex') == 0){
		    		tabOuterDiv.find('tr').filter(':visible').not('.norecordrow').find('.checkable input').each(function(){
						this.checked = false;
						rowSelected(this);
					});
					popCheckAct(tableID,opts.checkSingleOnly);
	    		} else {
	    			var selectedIDs = [];
	    			tabOuterDiv.find('tbody tr').filter(':visible').not('.norecordrow').each(function(){
	    				if ($(this).find('.checkable input').prop('checked'))
	    					selectedIDs.push($(this).find('.'+opts.checkActRetVal).text());
	    			});
	    			opts.checkActFunc.call(checkControl.get(0),selectedIDs);
	    		}
    		}
    	});
	};
	
	
	
    // function to create a HTML element
    function createElement(type, attr) {
    	// Example of attr : {'id':'element_id','text':'Hello world!'}
    	if(typeof(attr)==='undefined')
    		return $('<'+type+'>');
    	else
    		return $('<'+type+'>', attr);
    };
    // for browser logging purposes (Firefox - firebug, Chrome - Web Developers Tool)
    function logToConsole(msgToLog){
    	if ( window.console && window.console.log ) {
    		window.console.log(msgToLog);
    	}
    };
    // In case we forget to take out console statements. IE becomes very unhappy when we forget. Let's not make IE unhappy
	if(typeof(console) === 'undefined') {
	    var console = {}
	    console.log = console.error = console.info = console.debug = console.warn = console.trace = console.dir = console.dirxml = console.group = console.groupEnd = console.time = console.timeEnd = console.assert = console.profile = function() {};
	}
    // Adds CSRF cookie to ajax calls to correct csrf error -------------
    // Function to get cookie name from document
	function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
   	};
    var csrftoken = getCookie('csrftoken');
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    };
    // Adds CSRF cookie to ajax calls for methods that requires it
    $.ajaxSetup({
        crossDomain: false, // obviates need for sameOrigin test
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type)) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    // End of CSRF cookie function ------------------------------------------
    /*
    $.fn.buildTable.makePageSel = function(tableID, wrapperClass, availPageLen){
    	//var pageSel = createElement('div', {'class':'tab_pageSel'});
    	//pageSel.append(createElement('label'));
    	var pageSel = createElement('select', {'id':'sel_'+tableID,'onchange':'javascript:void(0)'});
    	for (var i=0;i<availPageLen.length;i++){
    		if (i==0)
    			pageSel.append('<option selected="selected" value="'+availPageLen[i]+'">'+availPageLen[i]+'</option>');
    		else
    			pageSel.append('<option value="'+availPageLen[i]+'">'+availPageLen[i]+'</option>');
    	}
    	$('.'+wrapperClass).before(pageSel);
    }
    */
}(jQuery));