// -----------------------------------
// Auto Suggest Search by Ajax
// -----------------------------------

var searchAutoSuggest = searchAutoSuggest || {
    index: 0, /* Keyboard Nav Index */
    searchID: "#search",
    iskybrdNav: 1,
    searchFormID: "#searchForm",
    suggestionClass: ".suggestionList",
    suggestionID: "#searchAutoSuggestionsList",
    maxResult: "",
    searchDir: "https://api.github.com/search/repositories",
    searchPage: "",
    searchStr: "",
    dataSuggest: "",
    init: function() {
    	searchAutoSuggest.maxResult = $(searchAutoSuggest.searchID).attr('data-limit');
    	searchAutoSuggest.searchPage = $(searchAutoSuggest.searchFormID).attr('action');
    	searchAutoSuggest.dataSuggest = $(searchAutoSuggest.searchID).attr('data-suggest');
    	
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
		
        $('body').on('click', function(e) { /* Hide Suggestion box on focus out */
            if(!$(e.target).closest(searchAutoSuggest.searchID).length) {
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
        $.getJSON(path, {q: inputString} ,
		function(data) {
            count = 0;
            html = '';
			total_count = 0;
            if(data.total_count > 0) {
				total_count = data.total_count;
                html = '<ul>';
                $.each(data.items, function(k, v) {
                    if(count == searchAutoSuggest.maxResult) {
                        return false;
                    } /* break to show only limited hits */
                    html = html + '<li id="srch_item_' + k + '" class="srch_item"><a href="' + v.html_url + '"><span class="title">' + v.full_name + '</span><span class="excerpt">' + v.description + '</span></a></li>';
                    count++;
                });
                html = html + '</ul>';
            }
            
            if(count != 0) 
            	recmd_text = "Showing "+count+" of total "+total_count+" Repo's";
            else 
            	recmd_text = "No Repo Found";
            
            html = '<div class="srch_recommended"><span>' + recmd_text + ' </span></div>' + html;
            
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

$(document).ready( function(){
	searchAutoSuggest.init();
});