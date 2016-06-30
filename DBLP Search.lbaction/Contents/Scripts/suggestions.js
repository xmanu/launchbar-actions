// LaunchBar Action Script for live searching DBLP.
// (c) 2016 Manuel Weiel @mweiel

function runWithString(string)
{
    if (string.length == 0) {
        return [{'title': 'DBLP Search', 'icon': 'icon.png'},
		{'title': 'Search hints:', 'icon': 'at.obdev.LaunchBar:InfoTemplate.pdf'},
		{'title': 'case-insensitive prefix search:', 'subtitle': 'e.g. sig matches "SIGIR" as well as "signal"', 'icon': 'font-awesome:arrow-right', 'badge': 'default'},
		{'title': 'exact word search: append dollar sign ($) to word', 'subtitle': 'e.g., graph$ matches "graph", but not "graphics"', 'icon': 'font-awesome:arrow-right', 'badge': '$'},
		{'title': 'phrase search: connect words by a dot (.)', 'subtitle': 'e.g., inform.retriev.tech', 'icon': 'font-awesome:arrow-right', 'badge': '.'},
		{'title': 'boolean and: separate words by space', 'subtitle': 'e.g., codd model', 'icon': 'font-awesome:arrow-right', 'badge': ' '},
		{'title': 'boolean or: connect words by pipe symbol (|)', 'subtitle': 'e.g., graph|network', 'icon': 'font-awesome:arrow-right', 'badge': '|'},
		{'title': 'boolean not: prepend word by minus sign (-)', 'subtitle': 'e.g., knuth -don', 'icon': 'font-awesome:arrow-right', 'badge': '-'}
		];
    }
    
    var limit = (Action.preferences.SuggestLimit != undefined) ? Action.preferences.SuggestLimit : 10;
	var authorlimit = (Action.preferences.AuthorSuggestLimit != undefined) ? Action.preferences.AuthorSuggestLimit : 3;
    
	var queryURL = "http://dblp.uni-trier.de/search/publ/api?format=json&compl=author&c="+authorlimit+"&h="+limit+"&q=";
	
	var data = HTTP.getJSON(queryURL + encodeURI(string) + "*");
	
	var suggestions = [];
	
	var authorresults = data.data.result.completions.c;
	LaunchBar.debugLog(JSON.stringify(authorresults));
	
	if (authorresults != undefined) {
		for (var i = 0; i < authorresults.length; i++) {
			var item = authorresults[i];
			var name = item.text.substring(14).replace(/_/g, " ");
			var res = {'title' : name}
			res['icon'] = 'font-awesome:user';
			suggestions.push(res);
		}
	}
	
	var results = data.data.result.hits.hit;
	
	if (results != undefined) {
		for (var i = 0; i < results.length; i++) {
			var item = results[i];
			var title = item.info.title;
			var authors = item.info.authors.author.toString();
			var res = {'title' : title};
			res['subtitle'] = authors;
			res['icon'] = 'icon.png';
			if (item.info.year != undefined) {
				res['badge'] = item.info.year;
			}
		
			suggestions.push(res); 
		}
	}
    
    return suggestions;
}
