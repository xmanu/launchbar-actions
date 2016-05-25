// LaunchBar Action Script for live searching Apple Music.
// (c) 2016 Manuel Weiel @mweiel

function runWithString(string)
{
    if (string.length == 0) {
        return [];
    }
    
	var limit = 5;
	
	var data = HTTP.getJSON("https://sticky-summer-lb.inkstone-clients.net/api/v1/searchMusic?term="+encodeURI(string)+"&country="+LaunchBar.currentLocale+"&media=appleMusic&entity=album&genreId=&limit="+limit);
	songData = HTTP.getJSON("https://sticky-summer-lb.inkstone-clients.net/api/v1/searchMusic?term="+encodeURI(string)+"&country="+LaunchBar.currentLocale+"&media=appleMusic&entity=song&genreId=&limit="+limit);
	var results = data.data.results;
	results = results.concat(songData.data.results);
	
	var suggestions = [];
	for (var index in results) {
		var item = results[index];
		
		var res = {'title' : item.name};
		
		LaunchBar.debugLog(JSON.stringify(item));
		
		if (item.kind == "album" || item.kind == "song") {
			
			var logoPath = Action.cachePath + '/' + item.id + ".png";
			
			if (!File.exists(logoPath)) {
				var artworkURL = item.artwork.url.replace('{w}', '32').replace('{h}', '32').replace('{f}', 'png');
				LaunchBar.debugLog('Downloading logo ('+artworkURL+') to: ' + logoPath);
				var logo = HTTP.getData(artworkURL);
				LaunchBar.debugLog('Downloaded logo');
				if (logo.error == undefined) {
					LaunchBar.debugLog('Attepmting to write data...');
					File.writeData(logo.data, logoPath);
				}
			}
			
			if (File.exists(logoPath)) {
				res['icon'] = logoPath;
			} else {
				res['icon'] = 'logo.png';
			}
			
			res['url'] = "itms" + item.url.substring(4);
			res['subtitle'] = item.artistName;
			res['badge'] = "album";
			if (item.kind == "song") {
				res['badge'] = "song";
				res['subtitle'] = item.collectionName + " - " + item.artistName;
			}
			
			suggestions.push(res);
		}
	}
	
    return suggestions;
}
