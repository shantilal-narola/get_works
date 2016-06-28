/*
 * SmartRecruiters - https://www.smartrecruiters.com
 * Copyright (C) 2010 SmartRecruiters
 * Author: Dominik Malysa
 *
 * V 3.0 SmartRecruiters job list widget
 *
 * Example usage:
 <script type='text/javascript' src='https://www.smartrecruiters.com/img/script/smartWidget/smart_widget.js'></script>
 <script type='text/javascript'>
 widget({
 "company_code":"49306135",                 - code of your company to print your jobs
 "group_id":"test",							- code of group to print your jobs
 "bg_color_widget":"#ffffff",             	- job table background
 "bg_color_headers":"#969696",            	- table header background
 "txt_color_headers":"#292929",            	- table header text color
 "bg_color_even_row":"#e0e0e0",            	- table even row background color
 "bg_color_odd_row":"#f7f7f7",            	- table odd row background color
 "txt_color_job":"#3d3d3d",                	- table content text color
 "bg_color_links":"#99ccff",                - table row background color
 "custom_css_url":"https://www.smartrecruiters.com/img/style/smartWidget/smart_widget.css", - external custom css for widget styling
 "widget_width":"630",                    	- widget width in px
 "widget_height":"400",                    	- widget height in px
 "jobs_number":"10",                        - number of jobs shown in widget
 "job_title":"true",                        - job title column visibility
 "type_of_employment":"true",            	- type of employment column visibility
 "department":"true",                    	- department column visibility
 "location":"true",                        	- job location column visibility
 "occupational_area":"true",                - occupational area column visibility
 "published_since":"true",                	- job published since date column visibility
 "remove_headers":"true",                	- table header visibility
 "display_headers":"true,"					- table header visibility
 "add_search":"false",						- search bar and pagination visibility
 "filter_departments":"Finance",            - company department filter
 "filter_locations":"San Francisco"        - job location filter
 });
 </script>
 */
//This array is needed in jobWidgetColorPicker.js to create color pickers
var colorPickerArray = {
    "bg_color_widget": ".srJobList",
    "bg_color_headers": ".srJobListTitles th",
    "txt_color_headers": ".srJobListTitles th nobr",
    "bg_color_even_row": ".srJobList .srJobListJobEven *",
    "bg_color_odd_row": ".srJobList .srJobListJobOdd *",
    "txt_color_job": ".srJobListJobEven td, .srJobListJobOdd td",
    "bg_color_links": ".srJobList .srJobListJobEven:hover *,.srJobList .srJobListJobOdd:hover *"
};

var load;
window.widgetList = window.widgetList || [];
window.widget = window.widget || (function (window) {
    var testEnv = false;
    var jobNumber = 100;

    load = function () {
        load.getScript("https://www.smartrecruiters.com/img/js/jquery/jquery.min.js");
        load.tryReady(0);
    };

    load.getScript = function (filename) {
        var script = document.createElement('script');
        script.type = "text/javascript";
        script.src = filename;
        script.async = true;
        if (script.readyState) {
            script.onreadystatechange = function () {
                if (this.readyState === 'loaded') {
                    jQuery.each(widgetStock, function (index, value) {
                        var widgetElement = value;
                        widget(widgetElement.widget_json, widgetElement.widget_element_id, widgetElement.widget_refresh_data, widgetElement.widget_callback);
                    });
                }
            }
        } else {
            script.onload = function () {
                jQuery.each(widgetStock, function (index, value) {
                    var widgetElement = value;
                    if (widgetElement.widget_json !== undefined) {
                        widget(widgetElement.widget_json, widgetElement.widget_element_id, widgetElement.widget_refresh_data, widgetElement.widget_callback);
                    }
                });
            }
        }
        document.getElementsByTagName("head")[0].appendChild(script);
    };

    load.tryReady = function (time_elapsed) {
        if (typeof(jQuery) === "undefined") {
            if (time_elapsed <= 5000) {
                setTimeout("load.tryReady(" + (time_elapsed + 200) + ")", 200);
            } else {
                alert("Timed out while loading jQuery.");
            }
        } else {
            jQuery.noConflict();
        }
    };

    if (typeof(jQuery) === 'undefined') {
        load();
    }
    
    function defaultContent(){
     	return translate('filter_by');
    };
    var widgetStock = [];
    var widgetJSON = {};
    var filerJSON = {};


    if (typeof(numberOfWidgets) === 'undefined') {
        var numberOfWidgets = 0;
    }

    function widget(json, element_id, refresh_data, callback) {
        var widgetElement;
        var localWidgetList;
        var widgetID;

        if (typeof(jQuery) === 'undefined') {
            widgetStock.push({
                'widget_json': json,
                'widget_element_id': element_id,
                'widget_refresh_data': refresh_data,
                'widget_callback': callback
            });
        } else {
            localWidgetList = jQuery(".job_widget");
            if (localWidgetList.length == 0) {
                localWidgetList = jQuery("[src$='/smart_widget.js']").next("script");
            }
            localWidgetList.each(function (index) {
                jQuery(this).attr("id", "job_widget_" + index);
            });
            if (window.widgetList == undefined) {
                window.widgetList = new Array();
            }

            loadCSS(json.custom_css_url);

            if (element_id == undefined || jQuery("#" + element_id).length == 0) {
                var div = document.createElement('div');
                div.setAttribute("class", "smartWidget");
                div.id = "smartWidget" + numberOfWidgets;
                element_id = div.id;
                widgetID = "#smartWidget" + numberOfWidgets;
                jQuery(jQuery("#job_widget_" + numberOfWidgets)).after(jQuery(div));
                numberOfWidgets++;
                widgetElement = jQuery(div);
            } else {
                widgetID = "#" + element_id;
                widgetElement = jQuery(widgetID);
            }
            widgetElement.html("");
            widgetElement.addClass('loading');
            widgetJSON[element_id] = json;
            initFilterValues(json, element_id);
            setCurrentPage(element_id, 0);
            setOffset(element_id, 0);
            setLimit(element_id, json.jobs_number);
            if (refresh_data == undefined || refresh_data) {
                if ((json.company_code !== undefined && json.company_code.length > 0) || (json.group_id !== undefined && json.group_id.length > 0)) {
                    executeQuery(element_id, null, callback);
                    addEvents(element_id);
                }
            } else {
                data = window.widgetList[element_id];
                createWidgetContent(json.company_code, data, element_id, json, widgetElement, callback);
            }
        }
    }
    
    function initFilterValues(json, widgetID){
    	filerJSON[widgetID] = {};
    	if (json){
    		if (json.filter_departments){    		
    			filerJSON[widgetID].filter_departments = json.filter_departments;
    		}
    		if (json.filter_locations){
    			filerJSON[widgetID].filter_locations = json.filter_locations;
    		}
    		for (var key in json){
    			if (isCustomField(key)){
    				filerJSON[widgetID][key] = json[key];
    			}
    		}
    	}
    }

    function toList(obj) {
        if (typeof(obj) === 'string') {
            return [obj];
        } else {
            return obj || [];
        }
    }

    function filterValAllElements(array){
    	var hasValAll = false;
    	for (var i = 0; i < array.length; i++){
    		if (array[i] && array[i].indexOf('val_all_') >= 0){
    			hasValAll = true;
    			break;
    		}
    	}
    	return hasValAll ? [] : array; 
    }

    function executeQuery(widgetID, queryString, callback, offset, limit) {       
        var json = extendWithFilters(widgetJSON[widgetID], widgetID);
        var company_code = json.company_code;
        var group_code = json.group_id;
        var jobListURL;
        var domain;

        offset = offset || 0;
        limit = limit || getLimit(widgetID) || jobNumber;

        if (json.api_url && json.api_url.length > 0) {
            domain = json.api_url;
        } else {
            domain = 'https://api.smartrecruiters.com';
        }
        if (company_code) {
            jobListURL = domain + "/job-api/public/search/widgets/" + company_code + "/postings?";
        } else if (group_code) {
            jobListURL = domain + "/job-api/public/search/companyGroups/" + group_code + "/postings?";
        } else {
            return;
        }
        if (queryString && queryString !== defaultContent()) {
            jobListURL += 'q=' + queryString;
        }

        var keyFilterTranslation = {
            filter_locations: 'location',
            filter_companies: 'company_name',
            filter_departments: 'facet_department'
        };      

        if (offset !== undefined) {
            jobListURL += '&offset=' + offset;
        }

        if (limit !== undefined) {
            jobListURL += '&limit=' + limit;
        }

        var filterArray = [];
        var items;       	
       	 
        for (var key in json) {
            items = [];
            if (isFilterParam(key, keyFilterTranslation)){
	            if (filerJSON && filerJSON[widgetID] && filerJSON[widgetID][key]) {
	                var filters = filerJSON[widgetID][key];
	                if (jQuery.isArray(filters)){
	                	items = filters;
	                } else {
	                	items = [filters];
	                }
	            }
	            items = filterValAllElements(items);
	            if (items && items.length > 0) {
	                filterArray.push(getParamNameForFilter(key, keyFilterTranslation) + ':(' + encodeURIComponent(items.join(';')) + ')');
	            } 
            }        
        }        
        jobListURL += '&fq=' + filterArray.join(',');
        var widgetElement = jQuery("#" + widgetID);
        jQuery.ajax(
            {
                url: jobListURL,
                dataType: 'jsonp',
                type: 'GET',
                success: function (data) {
                    window.widgetList[widgetID] = data;
                    createWidgetContent(company_code, data, widgetID, json, widgetElement, callback);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    createEmptyWidget();
                }
            }
        );
    }
    
    function extendWithFilters(orginalJson, widgetID){
	var json = orginalJson;
    	if (filerJSON && filerJSON[widgetID]){
    		json = jQuery.extend({}, orginalJson, filerJSON[widgetID])
    	}	
   		return json;
    }						
    
    var customFieldRegexp = /^custom_field_(.*)/;
    
    function isFilterParam(key, translations) {
    	if (key) {
       		return (translations[key] || key.match(customFieldRegexp));
		}
		return false;	
    }
    
    function isCustomField(key) {
    	if (key) {
       		return key.match(customFieldRegexp);
		}
		return false;	
    }
        
   	function getParamNameForFilter(key, translations) {
		var customFieldMatch = key.match(customFieldRegexp);
       	if (customFieldMatch) {
       		return "custom_field_value_id_" + customFieldMatch[1];
       	} else {
       		return translations[key];
       	} 
    }

    function addEvents(widgetID) {
    	jQuery('#' + widgetID).undelegate('.srSearchOptionListElement', 'click');
    	jQuery('#' + widgetID).undelegate('.srSearch .srSearchOption', 'click');
    	jQuery('#' + widgetID).undelegate('.srSearchForm', 'submit');
    	jQuery('#' + widgetID).undelegate('.srSearchButton', 'click');
    	jQuery('#' + widgetID).undelegate('.srSearchInput', 'keypress');
    	jQuery('html').unbind('click');
        jQuery('#' + widgetID).delegate('.srSearchOptionListElement', 'click', function () {
            var selectedElement = jQuery(this).find('.srSearchOptionListElementText').html();
            jQuery(this).siblings().removeClass('srSearchOptionListElementChecked');
            if (jQuery(this).hasClass('srSearchOptionListElementChecked')) {
                jQuery(this).removeClass('srSearchOptionListElementChecked');
            } else {
                jQuery(this).parents('ul').prev().html(add3Dots(selectedElement, 10));
                jQuery(this).addClass('srSearchOptionListElementChecked');
            }
            setCurrentPage(widgetID, 0);
            executeQueryWithFilter(this);
        });

        jQuery('#' + widgetID).delegate('.srSearch .srSearchOption', 'click', function () {
            var listElement = jQuery(this).children('.srSearchOptionList');
            listElement.children().length > 0 ? listElement.removeClass('none') : listElement.addClass('none');
            if (jQuery(this).children('.srSearchOptionList').is(':visible')) {
                jQuery(this).children('.srSearchOptionList').slideUp('fast');
            } else {
                jQuery(this).children('.srSearchOptionList').slideDown('fast');
            }
            return false;
        });
        jQuery('#' + widgetID).delegate('.srSearchForm', 'submit', function (e) {
            e.preventDefault();
        });
        jQuery('#' + widgetID).delegate('.srSearchButton', 'click', function () {
            setCurrentPage(widgetID, 0);
            executeQueryWithFilter(this);
        });
        jQuery('#' + widgetID).delegate('.srSearchInput', 'keypress', function (e) {
            if (e.keyCode == 13) {
                setCurrentPage(widgetID, 0);
                executeQueryWithFilter(this);
            }
        });
        jQuery('html').bind('click',function(){
        	jQuery('.srSearchOptionList').slideUp('fast');
    	});
    }

    function getWidgetId(element) {
        return jQuery(element).parents('.smartWidget, #widget_content').attr('id');
    }

    function getCurrentPage(id) {
        return filerJSON[id].currentPage;
    }

    function setCurrentPage(id, value) {
        filerJSON[id].currentPage = value;
    }

    function getPageCount(id) {
        return filerJSON[id].pageCount;
    }

    function setPageCount(id, value) {
        filerJSON[id].pageCount = value;
    }

    function getOffset(id) {
        return filerJSON[id].offset;
    }

    function setOffset(id, value) {
        filerJSON[id].offset = value;
    }

    function getLimit(id) {
        return filerJSON[id].limit;
    }

    function setLimit(id, value) {
        filerJSON[id].limit = value;
    }

    function executeQueryWithFilter(filter) {
        var filterObject = jQuery(filter);
        var widgetID = filterObject.parents('.smartWidget, #widget_content').attr('id');
        var filerID = filterObject.parents('.srSearchOption').attr('id');
        if (!filerJSON[widgetID]) {
            filerJSON[widgetID] = {};
        }
        if (filterObject.hasClass('srSearchOptionListElementChecked') && !filterObject.hasClass('srSearchOptionClearListElement')) {
            filerJSON[widgetID][keyFacetToFilterTranslation[filerID]] = filterObject.children('.srSearchOptionListElementText').attr('data-filter-value');
        } else {
            filerJSON[widgetID][keyFacetToFilterTranslation[filerID]] = restoreFilter(widgetID, keyFacetToFilterTranslation[filerID]);
        }
        var queryString = escapeHtml(jQuery('#' + widgetID).find('.srSearchInput').val() || "");
        if (queryString !== defaultContent()) {
            filerJSON[widgetID]['queryString'] = queryString;
        } else {
            filerJSON[widgetID]['queryString'] = '';
        }

        executeQuery(widgetID, queryString);
    }

    function executeCurrentQuery(offset, limit, widgetId) {
        var queryString = filerJSON[widgetId]['queryString'];
        executeQuery(widgetId, queryString, null, offset, limit);
    }

    function loadCSS(url) {
        var targetelement = "link";
        var targetattr = "href";
        var allsuspects = document.getElementsByTagName(targetelement);
        var present = false;
        for (var i = allsuspects.length; i >= 0; i--) {
            if (allsuspects[i] && allsuspects[i].getAttribute(targetattr) != null && allsuspects[i].getAttribute(targetattr) == url) {
                present = true;
            }
        }
        if (!present) {
            var link = document.createElement('link');
            link.rel = "stylesheet";
            link.type = "text/css";
            link.media = "screen";
            link.setAttribute("href", url);
            if (typeof(link) !== "undefined") {
                document.getElementsByTagName("head")[0].appendChild(link);
            }
        }
    }

    function populateColorInputs() {
        for (var key in colorPickerArray) {
            if (colorPickerArray.hasOwnProperty(key)) {
                var fieldID = key + "_field";
                var selectorID = key + "_selector";
                if (key.indexOf('bg_color') === 0) {
                    css = "backgroundColor";
                } else {
                    css = "color";
                }
                if (jQuery("#" + fieldID).val() != undefined && jQuery("#" + fieldID).val().length != 0) {
                    var hex = jQuery("#" + fieldID).val();
                    var colorString = hex2rgb(hex);
                } else {
                    var colorString = jQuery(colorPickerArray[key]).css(css);
                    if (colorString != undefined && colorString.substr(0, 1) == "#") {
                        var hex = colorString;
                        colorString = hex2rgb(colorString);
                    } else {
                        var hex = rgb2hex(colorString);
                    }
                }
                if (colorString != undefined) {
                    jQuery("#" + fieldID).val(hex);
                    jQuery("#" + fieldID).css('backgroundColor', colorString);
                    jQuery("#" + fieldID).parents(".srWidgetInputContainer").css('backgroundColor', hex);
                    jQuery("#" + fieldID).prevAll(".jobWidgetPageColorField").css('backgroundColor', hex);
                    //jQuery("#" + fieldID).parents(".srWidgetInputContainer").find("div").css('backgroundColor', hex);
                    jQuery("#" + selectorID).ColorPickerSetColor(hex);
                }
            }
        }
    }

    function rgb2hex(rgb) {
        if (rgb != undefined) {
            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            if (rgb != null) {
                return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
            } else {
                return "";
            }
        }
        return "";
    }

    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }

    function hex2rgb(hex) {
        var c, o = [], k = 0, m = hex.match(/^#(([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})|([0-9a-f])([0-9a-f])([0-9a-f]))$/i);
        if (!m) return "rgb(0,0,0)";
        for (var i = 2, s = m.length; i < s; i++) {
            if (undefined === m[i]) continue;
            c = parseInt(m[i], 16);
            o[k++] = c + (i > 4 ? c * 16 : 0);
        }
        return "rgb(" + o[0] + "," + o[1] + "," + o[2] + ")";
    }

    function findCustomFieldName(data) {
        if (!data.results || !data.results.length > 0) {
            return 'Custom Field';
        }

        for (var i = 0; i < data.results.length; i++) {
            var cfValues = data.results[i].customFieldValues;
            if (cfValues && cfValues.length > 0 && cfValues[0].fieldLabel) {
                return cfValues[0].fieldLabel;
            }
        }

        return 'Custom Field';
    }

    function createWidgetContent(companyIdentifier, data, widgetID, json, widgetElement, callback) {
        if (data === undefined) {
            return false;
        }
        var htmlContent = "";
        if (json.custom_css_url != undefined && json.custom_css_url.length > 0) {
            htmlContent = htmlContent + "<link href='" + json.custom_css_url + "' type='text/css' rel='stylesheet'>";
        }
        //SearchBar
        if (json.add_search && json.add_search === "true") {
            htmlContent += createSearchBar(data, widgetID, json);
        }

        //Content Table
        //Columns Header
        htmlContent = htmlContent + "<table border='1' class='srJobList' style='display:none;'>";
        if (json.remove_headers == undefined || (json.remove_headers != undefined && json.remove_headers != "true")) {
            json.$customFieldName = findCustomFieldName(data);
            htmlContent = htmlContent + createHeader(json);
        }
        //Data
        var countOfItems = 0;
        var countOnPage = json.jobs_number || jobNumber;
        if (data.results != undefined) {
            countOfItems = data.results.length;

            if (json.api_url && json.api_url.length > 0) {
                var domain =  json.api_url;
            } else {
                var domain = 'http://www.smartrecruiters.com';
            }

            jQuery.each(data.results, function (i, vacancy) {
                var link = '"' + domain + '/' + vacancy.companyIdentifier + '/' + vacancy.publicationId;

                if (vacancy.urlJobName) {
                    link = link + '-' + vacancy.urlJobName;
                }

                link += '"';

                if (i % 2 === 0) {
                    htmlContent = htmlContent + "<tr class='srJobListJobOdd' onClick ='window.open(" + link + ");'>";

                } else {
                    htmlContent = htmlContent + "<tr class='srJobListJobEven' onClick ='window.open(" + link + ");'>";
                }
                if (json.job_title !== "undefined" && json.job_title == "true") {
                    htmlContent += buildContentElement('srJobListJobTitle', escapeHtml(vacancy.vacancyName || ""));
                }
                if (typeof(json.group_id) != "undefined" && json.group_id.length > 0) {
                    htmlContent += buildContentElement('srJobListTypeOfEmployment', escapeHtml(vacancy.companyName || ""));
                }
                if (json.type_of_employment != "undefined" && json.type_of_employment == "true") {
                    htmlContent += buildContentElement('srJobListTypeOfEmployment', vacancy.typeOfEmployment || "");
                }
                if (json.department != "undefined" && json.department == "true") {
                    htmlContent +=  buildContentElement('srJobListDepartment', escapeHtml(vacancy.department || ""));
                }
                if (json.location != "undefined" && json.location == "true") {
                    var location = buildLocation(vacancy); 
                    htmlContent += buildContentElement('srJobListLocation', location);
                }
                if (json.occupational_area !== undefined && json.occupational_area == "true") {
                    htmlContent += buildContentElement('srJobListOccupationalArea', vacancy.occupationalArea || "");
                }
                if (json.published_since != "undefined" && json.published_since == "true") {
                    var releaseDate = vacancy.releasedDate;
                    var formattedDate = "";
                    if (releaseDate) {
                        formattedDate = format(new Date(releaseDate));
                    }
                    htmlContent += buildContentElement('srJobListPublishedSince', formattedDate);
                }
                if (json.custom_field != "undefined" && json.custom_field == "true") {
                    var customValueLabel = (vacancy.customFieldValues && vacancy.customFieldValues.length > 0) ?
                        vacancy.customFieldValues[0].valueLabel : "";
                    htmlContent += buildContentElement('srJobListCustomField', customValueLabel);
                     
                }
                htmlContent = htmlContent + "</tr>";
            });
        }
        htmlContent = htmlContent + "</table>";

        if (json.add_search && json.add_search === "true") {
            htmlContent = htmlContent + createPagination(countOfItems, countOnPage, widgetID);
        }
        jQuery('.srPagesTextPrevious').unbind('click');
        jQuery('.srPagesTextNext').unbind('click');

        widgetElement.html(htmlContent);

        jQuery('.srPagesTextPrevious').bind('click', prev);
        jQuery('.srPagesTextNext').bind('click', next);

        var link = widgetElement.find("link");
        if (link.length > 0) {
            link.after(createCSS(json, widgetElement));
        } else {
            widgetElement.prepend(createCSS(json, widgetElement));
        }
        widgetElement.find("table").fadeIn("fast", function () {
            if (callback != undefined && jQuery.isFunction(eval(callback))) {
                eval(callback).call();
            }
        });
        widgetElement.removeClass('loading');
        if (typeof(jQuery("#widget_content").parents("#srWidgetPreviewContainer").AjaxIndicator) == "function") {
            jQuery("#widget_content").parents("#srWidgetPreviewContainer").AjaxIndicator('hide');
        }
        jQuery('.srSearchOptionList').each(function () {
            if (jQuery(this).css('height').replace('px', '') == 0) {
                jQuery(this).addClass('none');
            }
            else if (jQuery(this).css('height').replace('px', '') <= 240) {
           		jQuery(this).css('overflow-y', 'auto');
            	jQuery(this).removeClass('none');
            }
            else {
                jQuery(this).css('overflow-y', 'scroll');
                jQuery(this).removeClass('none');
            }
        });
        jQuery('.srSearchOptionList .srSearchOptionListElementChecked').each(function () {
            jQuery(this).parent().prev('.srSearchOptionText').html(add3Dots(jQuery(this).find('.srSearchOptionListElementText').html(), 10));
        });
        return true;
    }
    
    function buildLocation(vacancy){
     	var location = []; 
      	location.push(vacancy.location);
      	if (vacancy.regionAbbreviation && vacancy.countryAbbreviation && vacancy.countryAbbreviation.toLowerCase() === "us") {
      		location.push(vacancy.regionAbbreviation);
      	} else if (vacancy.countryName) {
      		location.push(vacancy.countryName);
      	}
      	return location.join(', ');
    }
    
    function buildContentElement(className, content){
    	return "<td class='" + className + "'>" + content + "</td>";
    }

    function createEmptyWidget() {

    }

    function createCSS(json, widgetElement) {
        var ss1 = document.createElement('style');
        ss1.setAttribute("type", "text/css");

        var styleContent = "";
        styleContent += "#" + widgetElement.attr("id") + "{";
        styleContent += addSizeRule("width", json.widget_width);
        styleContent += addSizeRule("width", json.auto_width, true);
        styleContent += addSizeRule("height", json.widget_height);
        styleContent += addSizeRule("height", json.auto_height, true);
        if (json.widget_height > 0 || json.widget_width > 0) {
            styleContent += addRule("overflow", "hidden");
        }
        styleContent += "}\n";
        styleContent += "\n#" + widgetElement.attr("id") + " .srJobList{";
        styleContent += addRule("background-color", json.bg_color_widget);
        styleContent += addSizeRule("width", json.widget_width);
        styleContent += addSizeRule("width", json.auto_width);
        styleContent += addSizeRule("height", json.widget_height);
        styleContent += addSizeRule("height", json.auto_height, true);
        styleContent += "}\n";

        styleContent += "#" + widgetElement.attr("id") + " .srJobList .srJobListTitles *{";
        styleContent += addRule("background-color", json.bg_color_headers);
        styleContent += addRule("color", json.txt_color_headers);
        styleContent += "}\n";

        styleContent += "#" + widgetElement.attr("id") + " .srJobList .srJobListJobOdd *{";
        styleContent += addRule("background-color", json.bg_color_odd_row);
        styleContent += "}\n";

        styleContent += "#" + widgetElement.attr("id") + " .srJobList .srJobListJobEven *{";
        styleContent += addRule("background-color", json.bg_color_even_row);
        styleContent += "}\n";

        styleContent += "#" + widgetElement.attr("id") + " .srJobList .srJobListJobEven td{";
        styleContent += addRule("color", json.txt_color_job);
        styleContent += "}\n";

        styleContent += "#" + widgetElement.attr("id") + " .srJobList .srJobListJobOdd td{";
        styleContent += addRule("color", json.txt_color_job);
        styleContent += "}\n";

        styleContent += "#" + widgetElement.attr("id") + " .srJobList .srJobListJobEven:hover *{";
        styleContent += addRule("background-color", json.bg_color_links);
        styleContent += "}\n";

        styleContent += "#" + widgetElement.attr("id") + " .srJobList .srJobListJobOdd:hover *{";
        styleContent += addRule("background-color", json.bg_color_links);
        styleContent += "}\n";

        if (ss1.styleSheet) {
            ss1.styleSheet.cssText = styleContent;
        } else {
            var tt1 = document.createTextNode(styleContent);
            ss1.appendChild(tt1);
        }
        return ss1;
    }

    function getObjectCss() {
        var css = null;
        try {
            css = document.styleSheets[0];
            if (!css) {
                var head = document.getElementsByTagName("head").item(0);
                head.appendChild(document.createElement("style"));
                css = document.styleSheets[0];
            }
        } catch (ex) {
            css = document.createStyleSheet("styles.css");
        }
        return css;
    }


    function addRule(style, value) {
        if (value != undefined) {
            return style + ":" + value + ";\n";
        } else {
            return "";
        }
    }

    function addSizeRule(style, value, real_value) {
        if (value != undefined) {
            if (value == "auto") {
                if (real_value == true) {
                    return style + ":" + value + ";\n";
                } else {
                    return style + ":100%;\n";
                }
            } else {
                return style + ":" + parseInt(value) + "px;\n";
            }
        } else {
            return "";
        }
    }

    var keyFacetTranslation = {
        facet_location: 'location',
        facet_company: 'company_name',
        facet_department: 'department'
    };

    var keyFacetToFilterTranslation = {
        facet_location: 'filter_locations',
        facet_company: 'filter_companies',
        facet_department: 'filter_departments'
    };

    function createSearchBar(data, widgetID, json) {
        var group_code = json.group_id;
        var htmlContent = '';
        var queryString;
        if (filerJSON && filerJSON[widgetID] && filerJSON[widgetID]['queryString']) {
            queryString = filerJSON[widgetID]['queryString'];
        } else {
            queryString = defaultContent();
        }
        htmlContent += '<div class="srSearch">';
        htmlContent += '<form class="srSearchForm">';
        htmlContent += '<input class="srSearchInput" type="text" onblur="if(this.value==\'\') { this.value=\'' + defaultContent() + '\'; }" onfocus="if(this.value==\'' + defaultContent() + '\') { this.value=\'\'; }" value=\'' + queryString + '\' />' +
            '<input class="srSearchButton" type="button" value="' + translate('search_button') + '"/>';
        htmlContent += '</form>';
        for (var facet in keyFacetTranslation) {
            if (!(!group_code && facet === 'facet_company')) {
                htmlContent += '<div class="srSearchOption" id="' + facet + '">';
                htmlContent += '<span class="srSearchOptionText">' + add3Dots(translate(keyFacetTranslation[facet]), 10) + '</span>';
                htmlContent += '<ul class="srSearchOptionList">';
                var facetElements = data.facets[facet];

                var facetFilter = filerJSON[widgetID][keyFacetToFilterTranslation[facet]];
                var defaultFilter = restoreFilter(widgetID, keyFacetToFilterTranslation[facet]);
                if (facetFilter && facetFilter !== defaultFilter)  {
					htmlContent += '<li class="srSearchOptionListElement srSearchOptionClearListElement">';
					htmlContent += '<span class="srSearchOptionListElementText">' + translate('view_all')+ '</span>';
					htmlContent += '</li>';
                }
                for (var facetElement in facetElements) {
                	var filters = toList(filerJSON[widgetID][keyFacetToFilterTranslation[facet]]);
                    if (filerJSON[widgetID] && filters.length == 1 && facetElement === filters[0]) {
                        htmlContent += '<li class="srSearchOptionListElement srSearchOptionListElementChecked">';
                    } else {
                        htmlContent += '<li class="srSearchOptionListElement">';
                    }
                    htmlContent += '<span data-filter-value="' + escapeHtml(facetElement)+ '" class="srSearchOptionListElementText">' + escapeHtml(facetElement) + '</span>';
                    htmlContent += '</li>';

                }
                htmlContent += '</ul>';
                htmlContent += '</div>';
            }
        }
        htmlContent += '</div>';
        return htmlContent;

    }

    function createHeader(json) {
        var header = "<tr class='srJobListTitles'>";
        if (json.job_title != "undefined" && json.job_title == "true") {
            header = header + buildHeaderColumn('srJobListJobTitle', 'job_title');
        }
        if (typeof json.group_id != "undefined" && json.group_id.length > 0) {
            header = header + buildHeaderColumn('srJobListCompanyName', 'company_name');
        }
        if (json.type_of_employment != "undefined" && json.type_of_employment == "true") {
            header = header + buildHeaderColumn('srJobListTypeOfEmployment', 'type_of_employment');
        }
        if (json.department != "undefined" && json.department == "true") {
            header = header +  buildHeaderColumn('srJobListDepartment', 'department');
        }
        if (json.location != "undefined" && json.location == "true") {
            header = header + buildHeaderColumn('srJobListLocation', 'location');
        }
        if (json.occupational_area != "undefined" && json.occupational_area == "true") {
            header = header + buildHeaderColumn('srJobListOccupationalArea', 'occupational_area');
        }
        if (json.published_since != "undefined" && json.published_since == "true") {
            header = header + buildHeaderColumn('srJobListPublishedSince', 'published_since');
        }
        if (json.custom_field != "undefined" && json.custom_field == "true") {
            header = header +  buildHeaderColumn('srJobListCustomField', json.$customFieldName);
           
        }
        header = header + "</tr>";
        return header;
    }
    
    function escapeHtml(unsafe) {
    	return unsafe
         	.replace(/&/g, "&amp;")
         	.replace(/</g, "&lt;")
         	.replace(/>/g, "&gt;")
         	.replace(/"/g, "&quot;")
         	.replace(/'/g, "&#039;");
 	}
    
    var translation = {
		en : {
			job_title: 'Job Title',
			company_name: 'Company',
			type_of_employment : 'Type of Employment',
			department: 'Department',
			location: 'Location',
			occupational_area: 'Occupational Area',
			published_since: 'Published Since',
			search_button: 'Search',
			view_all: 'View all',
			filter_by: 'Filter by title, expertise'
		},
		pl : {
			job_title: 'Nazwa stanowiska',
			company_name: 'Firma',
			type_of_employment : 'Typ zatrudnienia',
			department: 'Departament',
			location: 'Adres',
			occupational_area: 'Obszar zawodu',
			published_since: 'Data opublikowania',
			search_button: 'Szukaj',
			view_all: 'Zobacz wszystko',
			filter_by: 'Filtruj po nazwie'
		},
		es : {
			job_title : 'Titulo del Trabajo',
			company_name : 'Empresa',
			type_of_employment : 'Tipo de Empleo',
			department : 'Departamento',
			location : 'Ubicacion',
			occupational_area : 'Area Ocupacional',
			published_since : 'Publicado En',
			search_button : 'Buscar',
			view_all : 'Ver Todo',
			filter_by : 'Filtrar por titulo, pericia'
		},
		de : {
			job_title : 'Stelle',
			company_name : 'Unternehmen',
			type_of_employment : 'Beschaftigung',
			department : 'Abteilung',
			location : 'Standort',
			occupational_area : 'Arbeitsbereich',
			published_since : 'Veroffentlicht seit',
			search_button : 'Suche',
			view_all : 'Alle anzeigen',
			filter_by : 'Filter nach Stelle, Arbeitsbereich'		
		},
		fr : {
			job_title : 'Titre du poste',
			company_name : 'SociÃ©tÃ©',
			type_of_employment : 'Type d\'emploi',
			department : 'DÃ©partement',
			location : 'Emplacement',
			occupational_area : 'Espace professionnel',
			published_since : 'PubliÃ© depuis',
			search_button : 'Rechercher',
			view_all : 'Tout afficher',
			filter_by : 'Filtrer par titre, par expertise'		
		},
        pt: {
			job_title : 'Cargo',
			company_name : 'Empresa',
			type_of_employment : 'Tipo de Emprego',
			department : 'Departamento',
			location : 'Local',
			occupational_area : 'Ãrea de Atividade',
			published_since : 'Publicado Desde',
			search_button : 'Pesquisar',
			view_all : 'Ver todos',
			filter_by : 'Filtrar por cargo, experiÃªncia'
        },
        sk: {
			job_title : 'NÃ¡zov pracovnej ponuky',
			company_name : 'SpoloÄnosÅ¥',
			type_of_employment : 'Typ zamestnania".',
			department : 'Oddelenie',
			location : 'Lokalita"',
			occupational_area : 'Typ zamerania',
			published_since : 'ZverejnenÃ© od',
			search_button : 'HÄ¾adaÅ¥',
			view_all : 'PrezrieÅ¥ vÅ¡etko',
			filter_by : 'FiltrovaÅ¥ podÄ¾a nÃ¡zvu, typu skÃºsenostÃ­'
        },
        no: {
			job_title : 'Stillingstittel',
			company_name : 'Bedrift',
			type_of_employment : 'Stillingstype',
			department : 'Avdeling',
			location : 'Plassering',
			occupational_area : 'ArbeidsomrÃ¥de',
			published_since : 'Publisert siden',
			search_button : 'SÃ¸k',
			view_all : 'Se alle',
			filter_by : 'Filtrer etter tittel, ekspertise'
        },
        ko: {
			job_title : 'ì§í•¨',
			company_name : 'íšŒì‚¬',
			type_of_employment : 'ê³ ìš© í˜•íƒœ',
			department : 'ë¶€ì„œ',
			location : 'ì§€ì—­',
			occupational_area : 'ì§ì—… ì˜ì—­',
			published_since : 'ê²Œì‹œì¼',
			search_button : 'ê²€ìƒ‰',
			view_all : 'ëª¨ë‘ ë³´ê¸°',
			filter_by : 'ì œëª©, ì „ë¬¸ ë¶„ì•¼ë¡œ ê²€ìƒ‰'
        },
        cs: {
			job_title : 'NÃ¡zev pracovnÃ­ pozice',
			company_name : 'SpoleÄnost',
			type_of_employment : 'Typ zamÄ›stnÃ¡nÃ­',
			department : 'OddÄ›lenÃ­',
			location : 'MÃ­sto',
			occupational_area : 'PracovnÃ­ oblast',
			published_since : 'UveÅ™ejnÄ›no od',
			search_button : 'Hledat',
			view_all : 'Zobrazit vÅ¡e',
			filter_by : 'Filtrovat podle nÃ¡zvu, odbornosti'
        },
        af: {
			job_title : 'Postitel',
			company_name : 'Maatskappy',
			type_of_employment : 'Soort betrekking',
			department : 'Departement',
			location : 'Plek',
			occupational_area : 'Beroepsarea',
			published_since : 'Gepubliseer sedert',
			search_button : 'Soek',
			view_all : 'Vertoon alles',
			filter_by : 'Filter volgens titel, kundigheid'
        },
        it: {
			job_title : 'Titolo professionale',
			company_name : 'SocietÃ ',
			type_of_employment : 'Tipo di impiego',
			department : 'Dipartimento',
			location : 'Luogo',
			occupational_area : 'Area professionale',
			published_since : 'Pubblicato dal',
			search_button : 'Cerca',
			view_all : 'Vedi tutto',
			filter_by : 'Filtra per titolo, competenza'
        },
        zh: {
			job_title : 'è·ä½åç¨±',
			company_name : 'å…¬å¸',
			type_of_employment : 'å°±æ¥­é¡žåž‹',
			department : 'éƒ¨é–€',
			location : 'åœ°é»ž',
			occupational_area : 'è·æ¥­é ˜åŸŸ',
			published_since : 'ç™¼ä½ˆæ—¥æœŸ',
			search_button : 'æœç´¢',
			view_all : 'æŸ¥çœ‹å…¨éƒ¨',
			filter_by : 'æŒ‰åç¨±ã€å°ˆé•·éŽæ¿¾'
        },
        da: {
			job_title : 'Jobtitel',
			company_name : 'Firma',
			type_of_employment : 'AnsÃ¦ttelsestype',
			department : 'Afdeling',
			location : 'Sted',
			occupational_area : 'ArbejdsomrÃ¥de',
			published_since : 'Offentliggjort siden',
			search_button : 'SÃ¸g',
			view_all : 'Se alle',
			filter_by : 'FiltrÃ©r efter titel, ekspertise'
        },
        ro: {
			job_title : 'Denumire loc de muncÄƒ',
			company_name : 'Companie',
			type_of_employment : 'Tip angajare',
			department : 'Departament',
			location : 'LocaÈ›ia',
			occupational_area : 'Domeniu ocupaÈ›ional',
			published_since : 'Publicat din',
			search_button : 'CÄƒutare',
			view_all : 'Vizualizare toate',
			filter_by : 'Filtrare dupÄƒ titlu, experienÈ›Äƒ'
        },
        fi: {
			job_title : 'TyÃ¶nimike',
			company_name : 'Yritys',
			type_of_employment : 'TyÃ¶suhteen tyyppi',
			department : 'Osasto',
			location : 'Sijainti',
			occupational_area : 'Ammatillinen alue',
			published_since : 'Julkaistu lÃ¤htien',
			search_button : 'Hae',
			view_all : 'NÃ¤ytÃ¤ kaikki',
			filter_by : 'Suodata nimikkeen, asiantuntemuksen perusteella'
        },
        bg: {
			job_title : 'Ð”Ð»ÑŠÐ¶Ð½Ð¾ÑÑ‚',
			company_name : 'Ð¤Ð¸Ñ€Ð¼Ð°',
			type_of_employment : 'Ð¢Ð¸Ð¿ Ð·Ð°ÐµÑ‚Ð¾ÑÑ‚',
			department : 'ÐžÑ‚Ð´ÐµÐ»',
			location : 'ÐœÐµÑÑ‚Ð¾Ñ€Ð°Ð±Ð¾Ñ‚Ð°',
			occupational_area : 'ÐžÐ±Ð»Ð°ÑÑ‚ Ð½Ð° Ð·Ð°ÐµÑ‚Ð¾ÑÑ‚',
			published_since : 'ÐŸÑƒÐ±Ð»Ð¸ÐºÑƒÐ²Ð°Ð½Ð° Ð½Ð°',
			search_button : 'Ð¢ÑŠÑ€ÑÐµÐ½Ðµ',
			view_all : 'ÐŸÐ¾ÐºÐ°Ð¶Ð¸ Ð²ÑÐ¸Ñ‡ÐºÐ¸',
			filter_by : 'Ð¤Ð¸Ð»Ñ‚Ñ€Ð¸Ñ€Ð°Ð¹ Ð¿Ð¾ Ð´Ð»ÑŠÐ¶Ð½Ð¾ÑÑ‚, Ð¾Ð¿Ð¸Ñ‚'
        },
        sv: {
			job_title : 'Jobbtitel',
			company_name : 'FÃ¶retag',
			type_of_employment : 'AnstÃ¤llningsform',
			department : 'Avdelning',
			location : 'Plats',
			occupational_area : 'YrkesomrÃ¥de',
			published_since : 'Publicerad sedan',
			search_button : 'SÃ¶k',
			view_all : 'Se alla',
			filter_by : 'Filter pÃ¥ titel, kompetens'
        },
        nl: {
			job_title : 'Functie',
			company_name : 'Bedrijf',
			type_of_employment : 'Functieomschrijving',
			department : 'Afdeling',
			location : 'Locatie',
			occupational_area : 'Beroepsgroep',
			published_since : 'Gepubliceerd sinds',
			search_button : 'Zoek',
			view_all : 'Alles bekijken',
			filter_by : 'Filter op titel, deskundigheid'
        },
        he: {
			job_title : '×ª×™××•×¨ ×ª×¤×§×™×“',
			company_name : '×—×‘×¨×”',
			type_of_employment : '×¡×•×’ ×”×¢×¡×§×”',
			department : '×ž×—×œ×§×”',
			location : '×ž×™×§×•×',
			occupational_area : '×ª×—×•× ×ž×§×¦×•×¢×™',
			published_since : '×¤×•×¨×¡× ×‘×ª××¨×™×š',
			search_button : '×ª×•×•×™×ª ×œ×—×¦×Ÿ',
			view_all : '×‘×™×˜×•×œ ×ª×™×‘×ª ×‘×—×™×¨×”',
			filter_by : '×—×™×¤×•×©'
        },
        ar: {
			job_title : 'Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙˆØ¸ÙŠÙÙŠ',
			company_name : 'Ø§Ù„Ø´Ø±ÙƒØ©',
			type_of_employment : 'Ù†ÙˆØ¹ Ø§Ù„ØªÙˆØ¸ÙŠÙ',
			department : 'Ø§Ù„Ù‚Ø³Ù…',
			location : 'Ø§Ù„Ù…ÙˆÙ‚Ø¹',
			occupational_area : 'Ø§Ù„Ù…Ø¬Ø§Ù„ Ø§Ù„Ù…Ù‡Ù†ÙŠ',
			published_since : 'ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†',
			search_button : 'Ø§Ù„Ø¨Ø­Ø«',
			view_all : 'Ø§Ø³ØªØ¹Ø±Ø§Ø¶ ÙƒØ§ÙØ© Ø§Ù„ÙˆØ¸Ø§Ø¦Ù',
			filter_by : 'Ø§Ù„ÙÙ„ØªØ±Ø© Ø¨Ø­Ø³Ø¨ Ø§Ù„Ø¹Ù†ÙˆØ§Ù†ØŒ Ø§Ù„ØªØ®ØµØµ'
        },
        ru: {
			job_title : 'ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ Ð²Ð°ÐºÐ°Ð½ÑÐ¸Ð¸',
			company_name : 'ÐšÐ¾Ð¼Ð¿Ð°Ð½Ð¸Ñ',
			type_of_employment : 'Ð¢Ð¸Ð¿ Ð·Ð°Ð½ÑÑ‚Ð¾ÑÑ‚Ð¸',
			department : 'ÐžÑ‚Ð´ÐµÐ»',
			location : 'ÐœÐµÑÑ‚Ð¾Ð½Ð°Ñ…Ð¾Ð¶Ð´ÐµÐ½Ð¸Ðµ',
			occupational_area : 'Ð¡Ñ„ÐµÑ€Ð° Ð·Ð°Ð½ÑÑ‚Ð¾ÑÑ‚Ð¸',
			published_since : 'Ð”Ð°Ñ‚Ð° Ð¿ÑƒÐ±Ð»Ð¸ÐºÐ°Ñ†Ð¸Ð¸Â»',
			search_button : 'ÐŸÐ¾Ð¸ÑÐº',
			view_all : 'ÐŸÑ€Ð¾ÑÐ¼Ð¾Ñ‚Ñ€ÐµÑ‚ÑŒ Ð²ÑÐµ',
			filter_by : 'Ð¤Ð¸Ð»ÑŒÑ‚Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ Ð¿Ð¾ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸ÑŽ, ÑÐ¿ÐµÑ†Ð¸Ð°Ð»Ð¸Ð·Ð°Ñ†Ð¸Ð¸'
        }
	};
    
    function buildHeaderColumn(className, translation_key){
    	return "<th class='" + className + "'><nobr>" + translate(translation_key) + "</nobr></th>";
    }

    function prev(e) {
        var id = getWidgetId(this);
        var currentPage = getCurrentPage(id);
        if (currentPage > 0) {
            currentPage -= 1;
        }
        var limit = getLimit(id);
        var offset = currentPage * limit;
        setCurrentPage(id, currentPage);
        setOffset(id, offset);
        executeCurrentQuery(offset, limit, id);

        e.preventDefault();
        return false;
    }
    function next(e) {
        var id = getWidgetId(this);
        var currentPage = getCurrentPage(id);
        var pageCount = getPageCount(id);
        if (currentPage < pageCount - 1) {
            currentPage += 1;
        }
        var limit = getLimit(id);
        var offset = currentPage * limit;
        setCurrentPage(id, currentPage);
        setOffset(id, offset);
        executeCurrentQuery(offset, limit, id);

        e.preventDefault();
        return false;
    }

    function createPagination(itemsCount, countOnPage, id) {
        var content = '';
        var pageCount = Math.round(itemsCount / countOnPage);
        if (pageCount > 1) {
            setPageCount(id, pageCount);
            setLimit(id, countOnPage);
            content = '<div class="srPages">' +
                            '<span class="srPagesText srPagesTextPrevious">&nbsp;</span>' +
                            '<span class="srPagesText srPagesTextCenter">' + (getCurrentPage(id) + 1) + ' of ' + pageCount +'</span>' +
                            '<span class="srPagesText srPagesTextNext">&nbsp;</span>' +
                          '</div>';
        }
        return content;
    }

    function add3Dots(string, limit) {
        var dots = "...";
        if (string.length > limit) {
            string = string.substring(0, limit) + dots;
        }

        return string;
    }

    function format(date) {
    	var month = date.getMonth() + 1;
        return [month < 10 ? "0" + month : month, date.getDate(), date.getFullYear()].join('/');
    }
    
    function translate(key){
    	var language = window.navigator.userLanguage || window.navigator.language;
    	language = language.substring(0,2);
    	if (language != undefined && language.length > 1){
    	    if (translation[language] != undefined && translation[language][key] != undefined){
    			return translation[language][key];
    		} else if (translation.en[key] != undefined){
    			return translation.en[key];
    		}
    	}
    	return key;

    }
    
    function translate(key){
    	var language = window.navigator.userLanguage || window.navigator.language;
    	language = language.substring(0,2);
    	if (language != undefined && language.length > 1){
    	    if (translation[language] != undefined && translation[language][key] != undefined){
    			return translation[language][key];
    		} else if (translation.en[key] != undefined){
    			return translation.en[key];
    		}
    	}
    	    		return key;
    }
    
    function restoreFilter(widgetID, key){
    	var defaultFilterValue = widgetJSON[widgetID][key];
    	return defaultFilterValue ? defaultFilterValue : "";
    }

    return widget;
})(window);

