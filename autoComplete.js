// -----------------------------------
// Search
// -----------------------------------

var searchAutoSuggest = searchAutoSuggest || {
    index: 0, /* Keyboard Nav Index */
    searchID: "#q",
    iskybrdNav: 1,
    searchFormID: "#searchForm",
    suggestionClass: ".suggestionList",
    suggestionID: "#searchAutoSuggestionsList",
    maxResult: "",
    searchDir: "",
    searchPage: "",
    searchStr: "",
    dataSuggest: "",
    init: function() {
    	searchAutoSuggest.maxResult = $("#searchForm").attr('data-limit');
    	searchAutoSuggest.searchDir = $("#searchForm #dir").val();
    	searchAutoSuggest.searchPage = $("#searchForm").attr('action');
    	searchAutoSuggest.dataSuggest = $("#q").attr('data-suggest');
    	
    	if(searchAutoSuggest.dataSuggest == "true") {
    		$(searchAutoSuggest.searchID).on({
                keyup: function(e) {
                	searchAutoSuggest.searchStr = this.value;
                    var iskybrd = searchAutoSuggest.iskybrdNav;

                    if(searchAutoSuggest.searchStr.length < 3) {
                        $(searchAutoSuggest.suggestionClass).hide(); /* Hide the suggestion box. */
                    } else {
                        iskybrd = searchAutoSuggest.keybrdNav(e); /* Handle Keyboard Navigation & Get Result */

                        if(iskybrd != 0) { /* Check we've done keyboard navigation */
                        	/* Remove the active class & add to current one */
                            $(searchAutoSuggest.suggestionID +' ul li.active').removeClass('active');
                            $(searchAutoSuggest.suggestionID +' ul li').eq(searchAutoSuggest.index).addClass('active');
                        } else {
                            searchAutoSuggest.getSearchResult(searchAutoSuggest.searchStr, searchAutoSuggest.searchDir);
                        }
                    }
                },
                focus: function() {
                	//$(searchAutoSuggest.searchID).val("");                   
                }
            });
    	}
        
        $("body").on('click', '.srch_all', function(p) {
            p.preventDefault();
            $(this).parents('form').submit();
        });
        
        $('body').on('click', function(e) { /* Hide Suggestion box on focus out */
            if(!$(e.target).closest(searchAutoSuggest.searchID +', '+ searchAutoSuggest.searchFormID +' input["type=submit"]').length) {
                $(searchAutoSuggest.suggestionClass).hide();
                $(searchAutoSuggest.searchID).val("");
            };
        });
    },
    keybrdNav: function(e) {
        var index = searchAutoSuggest.index;
        var iskybrd = searchAutoSuggest.iskybrdNav;
        if(e.which == 38) { /* Down arrow */
            index--;
            if(index < 0) { /* Check that we've not tried to select before the first item */
                index = 0;
            }
            iskybrd = 1; /* Set a variable to show that we've done some keyboard navigation */
        }else if(e.which == 40) { /* Up arrow */
            index++;
            if (index > $(searchAutoSuggest.suggestionID + ' ul li').length - 1) { /* Check that index is not beyond the last item */
                index = $(searchAutoSuggest.suggestionID + ' ul li').length - 1;
            }
            iskybrd = 1;
        }else if(e.which == 27) { /* Esc key */
            index = -1;
            $(searchAutoSuggest.suggestionClass).hide();
            iskybrd = 1;
        }else if(e.which == 13) { /* Enter key */
            if (index > -1) {
                $(searchAutoSuggest.suggestionID+' ul li.active a').trigger("click"); /* trigger click on Enter */
            }
            iskybrd = 1;
        }else {
            iskybrd = 0;
        }

        searchAutoSuggest.index = index;
        return iskybrd;
    },
    getSearchResult: function(inputString, path) {      
        $.getJSON("/bin/querybuilder.json?1_group.1_property=fn:lower-case(@jcr:content/jcr:title)&1_group.1_property.operation=like&1_group.1_property.value="+inputString.toLowerCase()+"%25&1_group.2_property=fn:lower-case(@jcr:content/jcr:description)&1_group.2_property.operation=like&1_group.2_property.value=%25"+inputString.toLowerCase()+"%25&1_group.p.or=true&2_orderby=@jcr:content/cq:lastModified&2_orderby.index=true&2_orderby.sort=desc&3_path="+path+"&4_type=cq:Page",
           function(data) {
            count = 0;
            html = '';
            if(data.success) {
                html = '<ul>';
                $.each(data.hits, function(k, v) {
                    if(count == searchAutoSuggest.maxResult) {
                        return false;
                    } /* break to show only limited hits */
                    html = html + '<li id="srch_item_' + k + '" class="srch_item"><a href="' + v.path + '"><span class="title">' + v.title + '</span><span class="excerpt">' + v.excerpt + '</span></a></li>';
                    count++;
                });
                html = html + '</ul>';
            }
            
            if(count != 0) 
            	recmd_text = "Recommended";
            else 
            	recmd_text = "No Recommended";
            
            html = '<div class="srch_recommended"><span>' + recmd_text + ' links.</span><a class="srch_all" href="">Search All</a></div>' + html;
            
            if ($(searchAutoSuggest.suggestionID).length != 0) {
                $(searchAutoSuggest.suggestionClass).empty();
                $(searchAutoSuggest.suggestionID).append(html);
                $(searchAutoSuggest.suggestionClass).show();
            } else {
                html = '<div class="suggestion-container"><div id="searchAutoSuggestionsList" class="suggestionList">' + html + '</div></div>';
                $(searchAutoSuggest.searchID).after(html);
            }
            $(searchAutoSuggest.suggestionID + " ul li:first-child").addClass("active");
        });
    }
};