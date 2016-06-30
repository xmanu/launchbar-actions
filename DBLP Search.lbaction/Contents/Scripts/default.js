// LaunchBar Action Script for live searching DBLP.
// (c) 2016 Manuel Weiel @mweiel

var bibTexPageBase = "http://dblp.uni-trier.de/rec/bibtex/";
var bibTexDownloadBase = "http://dblp.uni-trier.de/rec/bib2/";

function runWithString(string)
{
    if (string.length == 0) {
        return [];
    }
    
    var limit = (Action.preferences.FetchLimit != undefined) ? Action.preferences.FetchLimit : 20;
    
	var queryURL = "http://dblp.uni-trier.de/search/publ/api?format=json&h="+limit+"&q=";
	
	var data = HTTP.getJSON(queryURL+encodeURI(string) + "*");
	
	var results = data.data.result.hits.hit;
	
	var suggestions = [];
	
	if (results != undefined) {
		for (var i = 0; i < results.length; i++) {
	        var item = results[i];
			LaunchBar.debugLog(JSON.stringify(item));
			var title = item.info.title;
			var authors = item.info.authors.author.toString();
			var res = {'title' : title};
			res['subtitle'] = authors;
			if (item.info.year != undefined) {
				res['badge'] = item.info.year;
			}
			res['icon'] = 'icon.png';
			if (item.info.url != undefined) {
				var key = item.info.url.substring(19)
				res['actionReturnsItems'] = true;
				res['children'] = [
					{'title' : 'Copy bibtex entry',
					 'subtitle': 'Press ⌥\+Return to show entry in LaunchBar',
					 'icon' : 'at.obdev.LaunchBar:CopyActionTemplate.pdf',
					 'action' : 'copy_bib',
					 'actionArgument' : key},
					{'title' : 'Download bibtex entry',
					 'url' : bibTexDownloadBase + key + '.bib',
				 	 'icon' : 'at.obdev.LaunchBar:SelectTemplate.pdf'},
					{'title' : 'View bibtex entry',
					'url' : bibTexPageBase + key,
					}
				];
			}
		
			suggestions.push(res); 
		}
	}
	
	LaunchBar.debugLog(JSON.stringify(suggestions));
    
	if (suggestions.length == 1) {
		return suggestions[0]['children'];
	}
	if (suggestions.length == 0) {
		return {'title' : 'No entries found...',
		'icon' : 'at.obdev.LaunchBar:Caution.icns'
		};
	}
	
    return suggestions;
}

function copy_bib(key) {
	var bibUrl = bibTexDownloadBase + key + '.bib';
	
	var response = HTTP.get(bibUrl);
	
	if (response.data != undefined) {
		if (LaunchBar.options.alternateKey) {
			if (LaunchBar.options.shiftKey) {
				LaunchBar.displayInLargeType(
					{'string': response.data}
				);
			} else
				return {'title': response.data};
		} else {
			LaunchBar.setClipboardString(response.data);
			LaunchBar.displayNotification(
				{'string': 'Entry has been copied to the clipboard.',
				 'title': 'DBLP Search'
				});
		}
	} else {
		LaunchBar.displayNotification(
			{'string': 'Could not copy the bibtex entry.',
			 'title': 'DBLP Search'
			});
	}
}
