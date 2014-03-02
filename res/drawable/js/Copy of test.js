(function($) {
	// Actual method when plugin is initialised
    $.fn.buildTable = function(options) {
    	var opts = $.extend( {'tbodyrowhtml':''}, $.fn.buildTable.defaults, options );
    	
    	return this.each(function() {
    		var tableID = this.id;
    		$(this).wrap('<div id="div_'+tableID+'" style="position:relative;"></div>');
    		$(this).wrap('<div class="tab_wrapper"></div>');
    		
    		makePageSel(tableID,'tab_wrapper',opts);
    		makeFilInput(tableID,'tab_wrapper');
    		makePagination(tableID, 'tab_wrapper',opts);
    		makeRowsInfo(tableID,'tab_wrapper');
    		makeLoadDiv(tableID,opts);
    		$('#div_'+tableID+' .tab_wrapper').before('<span style="display:block;clear:both;"></span>');
    		$('#div_'+tableID+' .div_loading').before('<span style="display:block;clear:both;"></span>');
    		var tableHead = $(this).children('thead');
    		var tableBody = $(this).children('tbody');
    		//var numOfTD = 0;
    		tableBody.children('tr').slice(1).remove();
    		
    		
    		/*
    		tableBody.find('tr td').not('.checkable').each(function(){
    			//numOfTD++;
    			$(this).html('');
    		});
    		if (opts.addCheckable){
    			var headerRows = tableHead.children('tr').length;
    			if (headerRows > 1){
    				tableHead.children('tr').first().prepend('<th class="checkable" rowspan="'+headerRows+'"><input class="check_head" type="checkbox"></th>');
    			} else {
    				tableHead.children('tr').first().prepend('<th class="checkable"><input class="check_head" type="checkbox"></th>');
    			}
    			tableBody.children('tr').prepend('<td class="checkable"><input type="checkbox"></td>');
    			//tableBody.children('.checkable').children('input').on('change',function(){
    			//	alert('weee!');
    			//});
    		}
    		opts.tbodyrowhtml = tableBody.children('tr').html();
    		var maxStartRows = opts.availPageLen[0];
    		if (opts.initialValues.length < maxStartRows)
    			maxStartRows = opts.initialValues.length;
    		for (var i=1;i<maxStartRows;i++){
    			tableBody.append('<tr>'+opts.tbodyrowhtml+'</tr>');
    		}
    		tableBody.append('<tr class="norecordrow"><td colspan="'+tableBody.find('tr:first-child td').length+'" style="text-align:center;">'+opts.tableEmptyMsg+'</td></tr>');
    		tableHead.find('th.sortableH').each(function(){
    			$(this).html($(this).html()+'<i class="fa fa-sort" style="margin-left:10px;"></i>');
    			$(this).on('click', function(){
    				sortColumn($(this),$(this).attr('value'),tableID,opts);
    			});
    		});
    		//alert(tableHead.find('th.sortableH').length);
    		if (maxStartRows > 0){
	    		tableBody.children('tr').not('.norecordrow').each(function(trIndex){
	    			$(this).children('td').not('.checkable').each(function(tdIndex){
	    				$(this).html(opts.initialValues[trIndex][tdIndex]);
	    			});
	    		});
	    		$('#'+tableID+' .norecordrow').css('display','none');
	    		opts.recordStart = 1;
	    		opts.recordEnd = maxStartRows;
	    		$('#div_'+tableID+' .div_rowsInfo').html('Showing <strong>'+opts.recordStart+'</strong> to <strong>'+opts.recordEnd+'</strong> of <strong>'+opts.numOfRecords+'</strong> entries');
	    		$('#div_'+tableID+' .page_next').addClass('enabled');
				$('#div_'+tableID+' .page_last').addClass('enabled');
    		} else {
    			$('#'+tableID+' tbody tr').filter(':visible').not('.norecordrow').each(function(){
	    			$(this).css('display','none');
	    		});
    			opts.tableFunc = false;
    			opts.nextPage = false;
				$('#sel_'+tableID).prop('disabled',true);
				$('#text_'+tableID).prop('disabled',true);
				$('#div_'+tableID+' .sortableH').removeClass('sortableH');
    		}
    		$('#'+tableID+' tbody tr').filter(':visible').filter(':odd').addClass('odd');
			$('#'+tableID+' tbody tr').filter(':visible').filter(':even').addClass('even');
			//logToConsole($('#div_'+tableID).html());
			*/
    	});
    };
    // Default variables required by plugin
    $.fn.buildTable.defaults = {
		updateUrl : '',
		initialValues : [['1-1','1-2','1-3','1-4','1-5','1-6','1-7','1-8','1-9','1-10','1-11','1-12'],['2-1','2-2','2-3','2-4','2-5','2-6','2-7','2-8','2-9','2-10','2-11','2-12']],
		availPageLen : [10,25,50,100],
		addCheckable : false,
		noRecordMsg : 'No record(s) to show',
		tableEmptyMsg : 'No record(s) available for viewing',
		pageLength : 10,
    	recordStart : 1,
    	recordEnd : 10,
    	numOfRecords : 2,
    	filterType : [],
    	sortedCol : [],
    	prevPage : false,
    	nextPage : true,
    	tableFunc : true,
    	loadImgSrc : '/static/img/loading-blue.gif'
	};
    
    // Private Functions ------------------------------------------------------------------------------------
    // Function to pause/unpause all table functions, and show/hide loading prompt
    function pauseTableFunc(isPause,tableID,opts){
		if (isPause){
			var height = $('#div_'+tableID).height();
			var imgHeight = parseInt(height/4.5);
			if (imgHeight > 110)
				imgHeight = 110;
			else if (imgHeight < 35)
				imgHeight = 35;
			$('#div_'+tableID+' .loadingImg').height(imgHeight);
			$('#div_'+tableID+' .div_loading').height(height).width($('#div_'+tableID).width()).css({
				'line-height':height+'px',
				'display':'block'
			});
			$('#sel_'+tableID).prop('disabled',true);
			$('#text_'+tableID).prop('disabled',true);
			opts.tableFunc = false;
			/*
			$('#loading_div').css('display','none');
			$('#pageLenSel').prop('disabled',false);
			*/
		} else {
			$('#div_'+tableID+' .div_loading').css('display','none');
			if (opts.numOfRecords > 0){
				$('#sel_'+tableID).prop('disabled',false);
				$('#text_'+tableID).prop('disabled',false);
				opts.tableFunc = true;
			}
		}
	}
    // Function to clear all visible rows, create/hide rows when necessary, and then populate the remaining visible rows with data
    function populateTable(data,tableID,opts){
    	// Clear data for all visible rows first
		$('#'+tableID+' tbody tr').filter(':visible').not('.norecordrow').each(function(){
			$(this).find('td').not('.checkable').each(function(index){
				$(this).html('').removeClass('sortCell', false);
			});
		});
		// Get number of existing rows (exclude empty table data row)
		var existRows = $('#'+tableID+' tbody tr').not('.norecordrow').length;
		// If number of existing rows less than number of data records, create additional required rows
		if (existRows < data.length){
			for (var i=0;i<data.length-existRows;i++){
				$('#'+tableID+' .norecordrow').before('<tr>'+opts.tbodyrowhtml+'</tr>');
			}
    		$('#'+tableID+' tbody tr').filter(':odd').addClass('odd');
			$('#'+tableID+' tbody tr').filter(':even').addClass('even');
		}
		// If number of existing rows more than number of data records, hide the extra rows
		else if (existRows > data.length)
			$('#'+tableID+' tbody tr').not('.norecordrow').slice(data.length).css('display','none');
		// If there are data records
		if (data.length > 0){
			var row;
			for (var i=0;i<data.length;i++){
				row = $('#'+tableID+' tbody tr').get(i)
				$(row).children('td').not('.checkable').each(function(index){
					//if (index != 0)
					$(this).html(data[i][index]);
				});
				$(row).css('display','');
			}
			//logToConsole($('#div_'+tableID).html());
			//popActSelect();
			hlAllSortedCol(tableID,opts);
		} else
			$('#'+tableID+' .norecordrow').css('display','');
		/*
		resizeFunc();
		*/
	};
	// Fucntion to highlight all sorted columns
	function hlAllSortedCol(tableID,opts){
		for (var i=0;i<opts.sortedCol.length;i++){
			$('#'+tableID+' tbody tr').filter(':visible').each(function(){
				$(this).children('td').not('.checkable').filter(':eq('+opts.sortedCol[i]+')').addClass('sortCell');
			});
		} 
	}
	// Function to set the state (enable/disable) of table controls generated by this plugin
    function setControlState(data,tableID,opts){
		if (data.prevEnabled == 'Y'){
			opts.prevPage = true;
			$('#div_'+tableID+' .page_first').addClass('enabled');
			$('#div_'+tableID+' .page_prev').addClass('enabled');
		} else {
			opts.prevPage = false;
			$('#div_'+tableID+' .page_first').removeClass('enabled');
			$('#div_'+tableID+' .page_prev').removeClass('enabled');
		}
		if (data.nextEnabled == "Y"){
			opts.nextPage = true;
			$('#div_'+tableID+' .page_next').addClass('enabled');
			$('#div_'+tableID+' .page_last').addClass('enabled');
		} else {
			opts.nextPage = false;
			$('#div_'+tableID+' .page_next').removeClass('enabled');
			$('#div_'+tableID+' .page_last').removeClass('enabled');
		}
		if (opts.numOfRecords == 0){
			opts.tableFunc = false;
			$('#sel_'+tableID).prop('disabled',true);
			$('#text_'+tableID).prop('disabled',true);
			$('#div_'+tableID+' .sortableH').removeClass('sortableH');
			$('#div_'+tableID+' .div_rowsInfo').html('No entries to show');
		} else
			$('#div_'+tableID+' .div_rowsInfo').html('Showing <strong>'+opts.recordStart+'</strong> to <strong>'+opts.recordEnd+'</strong> of <strong>'+opts.numOfRecords+'</strong> entries');
	}
    // Function to handle changing of page length
    function chngPageLen(element,tableID,opts){
    	if (opts.tableFunc){
			pauseTableFunc(true,tableID,opts);
			var selectedLen = $(element).val();
			$.ajax({
	            type:"POST",
	            url :opts.updateUrl,
	            data:{'pageLength':selectedLen,'filterType':JSON.stringify(opts.filterType),'recordStart':opts.recordStart,'recordEnd':opts.recordEnd},
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
	    		},
	    		error : function(xhr,errmsg,err) {
	    			alert(xhr.status + ": " + xhr.responseText);
				}
			});
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
    			pauseTableFunc(true,tableID,opts);
				$.ajax({
		            type:"POST",
		            url :opts.updateUrl,
		            data:{'pageLength':opts.pageLength,'filterType':JSON.stringify(opts.filterType),'recordStart':opts.recordStart,'recordEnd':opts.recordEnd,'paginate':paginate},
		            dataType:"json",
		            success:function(data){
		            	logToConsole(data);
		            	opts.numOfRecords = data.numOfRecords;
		            	opts.recordStart = data.recordStart;
		            	opts.recordEnd = data.recordEnd;
		            	populateTable(data.valueList,tableID,opts);
		    			setControlState(data,tableID,opts);
		    			pauseTableFunc(false,tableID,opts);
		    		},
		    		error : function(xhr,errmsg,err) {
		    			alert(xhr.status + ": " + xhr.responseText);
					}
				});
			}
		}
	}
    // Function for sorting of columns
    function sortColumn(element,info,tableID,opts){
		if (opts.tableFunc){
			pauseTableFunc(true,tableID,opts);
			/*var infoArr = $.map(info.split(';'), function(value){
			    //return parseInt(value, 10);
				return +value;
			    // or return +value; which handles float values as well
			});*/
			var found = false;
			for (var i=0;i<opts.filterType.length;i++){
				if (opts.filterType[i].value == info){
					switch (opts.filterType[i].order){
						case 0:
							opts.filterType[i].order = 1;
							break;
						case 1:
						default:
							opts.filterType.splice(i,1);
							break;
					}
					found = true;
					break;
				}
			}
			if (!found){
				opts.filterType.push({'value':parseInt(info),'order':0});
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
			//alert(JSON.stringify(opts.filterType));
			$.ajax({
	            type:"POST",
	            url :opts.updateUrl,
	            data:{'pageLength':opts.pageLength,'filterType':JSON.stringify(opts.filterType),'recordStart':opts.recordStart,'recordEnd':opts.recordEnd},
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
	            	//},1000);
	    		},
	    		error : function(xhr,errmsg,err) {
	    			alert(xhr.status + ": " + xhr.responseText);
				}
			});
		}
	}
    
    
	// Create page length select control for table
	function makePageSel(tableID, wrapperClass,opts){
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
    	$('#div_'+tableID+' .'+wrapperClass).before(divPageSel);
    	// handler function for page select
    	$('#div_'+tableID+' .pageSel').on('change', function(){
    		chngPageLen(this,tableID,opts);
    	});
    };
    // Create filter input controls for table
    function makeFilInput(tableID, wrapperClass){
    	var divFilInput = createElement('div', {'class':'div_filInput'});
    	divFilInput.append('<label for="text_'+tableID+'">Search:</label>');
    	divFilInput.append('<input id="text_'+tableID+'" class="filInputText" type="text" style="margin-left:3px;margin-right:3px;" placeholder="Query Text" />');
    	divFilInput.append('<span class="btn_filInput"><i class="fa fa-arrow-right"></i></span>');
    	$('#div_'+tableID+' .'+wrapperClass).before(divFilInput);
    	$('#div_'+tableID+' .btn_filInput').on('click',function(){
    		alert('weee');
    	});
    };
    // Create control to show row(s) information
    function makeRowsInfo(tableID, wrapperClass){
    	var divFilInput = createElement('div', {'class':'div_rowsInfo','text':$.fn.buildTable.defaults.noRecordMsg});
    	$('#div_'+tableID+' .'+wrapperClass).after(divFilInput);
    };
    // Create pagination controls for table
    function makePagination(tableID, wrapperClass,opts){
    	var divFilInput = createElement('div', {'class':'div_pagination'});
    	divFilInput.append('<span class="page_first" value="first"><i class="fa fa-fast-backward"></i>&nbsp;&nbsp;First</span>');
    	divFilInput.append('<span class="page_prev" value="prev" style="margin-left:10px;"><i class="fa fa-step-backward"></i>&nbsp;&nbsp;Prev</span>');
    	divFilInput.append('<span class="page_next" value="next" style="margin-left:15px;margin-right:10px;">Next&nbsp;&nbsp;<i class="fa fa-step-forward"></i></span>');
    	divFilInput.append('<span class="page_last" value="last">Last&nbsp;&nbsp;<i class="fa fa-fast-forward"></i></span>');
    	$('#div_'+tableID+' .'+wrapperClass).after(divFilInput);
    	$('#div_'+tableID+' .div_pagination').children().on('click', function(){
    		//alert($(this).attr('value'));
    		changePage($(this).attr('value'),tableID,opts);
    	});
    };
    // Create div to display loading image when table is processing information
    function makeLoadDiv(tableID,opts){
    	$('#div_'+tableID).append('<div class="div_loading" style="position:absolute;top:0px;left:0px;z-index:10;width:100px;height:100px;background-color:rgba(255,255,255,0.5);text-align:center;display:none;"><img class="loadingImg" src="'+opts.loadImgSrc+'" style="height:100px;" /></div>');
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
    }
    var csrftoken = getCookie('csrftoken');
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
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