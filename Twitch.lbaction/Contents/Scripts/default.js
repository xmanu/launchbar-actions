// Twitch followed channels LaunchBar Action
// (c) 2015 Manuel Weiel
// @mweiel

function run(argument) {
	
	var user = "";
    if (argument == undefined) {
        
		if (Action.preferences.user == undefined) {
        	LaunchBar.alert('No user was set. Please pass the user as an argument. It will be saved until you pass another user.');
			return;
		} else {
			user = Action.preferences.user;
		}
    } else {
		Action.preferences.user = argument;
		user = argument;
    }
	
	followedChannels = HTTP.getJSON('https://api.twitch.tv/kraken/users/'+user+'/follows/channels?sortby=last_broadcast&limit=100');
	
	if (followedChannels.data.follows == undefined) {
		LaunchBar.alert('It was not possible to retrieve the channels of that user. Please check the spelling of the username.');
		return;
	}
	
	var channelNames = [];
	for (i = 0; i < followedChannels.data.follows.length; i++) {
		var channel = followedChannels.data.follows[i].channel;
		var channelName = channel.name;
		channelNames[channelNames.length] = channelName;
	}
	
	var streamURL = 'https://api.twitch.tv/kraken/streams?channel=' + channelNames;
	var streamRes = HTTP.getJSON(streamURL);
	var onlineStreamers = {};
	if (streamRes.error == undefined && streamRes.data.streams != undefined) {
		for (i = 0; i < streamRes.data.streams.length; i++) {
			onlineStreamers[streamRes.data.streams[i].channel.name] = streamRes.data.streams[i].viewers;
		}
	}
	
	var result = [];
	
	for (i = 0; i < followedChannels.data.follows.length; i++) {
		var channel = followedChannels.data.follows[i].channel;
		
		var res = {'title': channel.display_name, 'url': channel.url};

		if (channel.status != undefined) {
			res['subtitle'] = channel.status;
		}
		
		if (channel.game != undefined) {
			res['subtitle'] = channel.game + ': ' + res['subtitle'];
		}
		
		if (channel.logo != undefined) {
			var logoPath = Action.cachePath + '/' + channel.logo.substring(channel.logo.lastIndexOf('/')+1);
			if (!File.exists(logoPath)) {
				LaunchBar.log('Downloading logo to: ' + logoPath);
				var logo = HTTP.getData(channel.logo);
				if (logo.error == undefined) {
					File.writeData(logo.data, logoPath);
				}
			}
			if (File.exists(logoPath)) {
				res['icon'] = logoPath;
			} else {
				res['icon'] = 'logo.png';
			}
		} else {
			res['icon'] = 'logo.png';
		}
		
		if (channel.name in onlineStreamers) {
			res['badge'] = 'ONLINE: ' + onlineStreamers[channel.name];
		}
		
		result[result.length] = res;
	}
	return result;
}
