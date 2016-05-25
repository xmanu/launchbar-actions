// LaunchBar Action Script for live searching Apple Music.
// (c) 2016 Manuel Weiel @mweiel

function runWithString(string)
{
    if (string.length == 0) {
        return [];
    }
    
    var limit = (Action.preferences.FetchLimit != undefined) ? Action.preferences.FetchLimit : 5;
    var storeCountry = (Action.preferences.StoreCountry != undefined) ? Action.preferences.StoreCountry : LaunchBar.currentLocale;
	
	var data = HTTP.getJSON("https://sticky-summer-lb.inkstone-clients.net/api/v1/searchMusic?term="+encodeURI(string)+"&country="+storeCountry+"&media=appleMusic&entity=album&genreId=&limit="+limit);
	songData = HTTP.getJSON("https://sticky-summer-lb.inkstone-clients.net/api/v1/searchMusic?term="+encodeURI(string)+"&country="+storeCountry+"&media=appleMusic&entity=song&genreId=&limit="+limit);
	var results = data.data.results;
	results = results.concat(songData.data.results);
	
	var suggestions = [];
    var artworkRequests = [];
    var logoPaths = [];
    
	for (var index in results) {
		var item = results[index];
		
		var res = {'title' : item.name};
		
		LaunchBar.debugLog(JSON.stringify(item));
		
		if (item.kind == "album" || item.kind == "song") {
			var logoPath = Action.cachePath + '/' + item.id + ".png";
			
			if (!File.exists(logoPath)) {
                var artworkURL = item.artwork.url.replace('{w}', '32').replace('{h}', '32').replace('{f}', 'png');
                var artworkRequest = HTTP.createGetDataRequest(artworkURL);
                artworkRequest.path = logoPath;
                artworkRequests.push(artworkRequest);
			}
            
            res['icon'] = logoPath;
			res['url'] = "itms" + item.url.substring(4);
			res['subtitle'] = item.artistName;
			res['badge'] = "Album";
			if (item.kind == "song") {
				res['badge'] = "Song";
				res['subtitle'] = item.collectionName + " - " + item.artistName;
			}
			
			suggestions.push(res);
		}
	}
    
    var results = HTTP.loadRequests(artworkRequests);
    
    for (var i = 0; i < results.length; i++) {
        var logo = results[i];
        if (logo.error == undefined) {
            File.writeData(logo.data, artworkRequests[i].path);
        } else {
            suggestions[i].icon = (suggestions[i].badge == "Album") ? "at.obdev.LaunchBar:AlbumTemplate.icns" : "at.obdev.LaunchBar:AudioTrackTemplate.icns";
        }
    }
    
    return suggestions;
}
