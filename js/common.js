$.support.cors = true;

function debug(msg) {
    switch(typeof msg) {
        case 'object':
            var propValue;
            for(var propName in msg) {
                propValue = msg[propName];

                System.Debug.outputString(propName + ': ' + propValue);
            }
            break;
        case 'array':
            for (var i = 0; i < msg.length; i++) {
                System.Debug.outputString(msg[i]);
            }
            break;
        default:
            System.Debug.outputString(msg);
            break;
    }
}

// compare two versions, return true if local is up to date, false otherwise
// if both versions are in the form of major[.minor][.patch] then the comparison parses and compares as such
// otherwise the versions are treated as strings and normal string compare is done
var VPAT = /^\d+(\.\d+){0,2}$/;
function isUpToDate(local, remote) {
    if (!local || !remote || local.length === 0 || remote.length === 0)
        return false;
    if (local == remote)
        return true;
    if (VPAT.test(local) && VPAT.test(remote)) {
        var lparts = local.split('.');
        while(lparts.length < 3)
            lparts.push("0");
        var rparts = remote.split('.');
        while (rparts.length < 3)
            rparts.push("0");
        for (var i = 0; i < 3; i++) {
            var l = parseInt(lparts[i], 10);
            var r = parseInt(rparts[i], 10);
            if (l === r)
                continue;
            return l > r;
        }
        return true;
    } else {
        return local >= remote;
    }
}

function checkForUpdate() {
    $.getJSON('https://api.github.com/repos/XjSv/Cryptocurrencies-Price-Tracker-Gadget/tags', function(data) {
        var currentVersion = System.Gadget.version;
        var latestVersion = data[0].name.slice(1); // Get the latest tag name and remove the 'v'.
        var isUpToDateResults = isUpToDate(currentVersion, latestVersion);

        if (!isUpToDateResults) {
            var latestVersionDownloadLink = 'https://github.com/XjSv/Cryptocurrencies-Price-Tracker-Gadget/releases/download/v' + latestVersion + '/CryptocurrenciesPriceTracker.gadget'
            $('#out-of-date').html('<a onclick="System.Gadget.close()" href="' + latestVersionDownloadLink + '">v' + latestVersion + ' is available!</a>');
        }
    });
}

checkForUpdate(); // Initially check for an update on init
setTimeout(checkForUpdate, 86400000); // Then check for updates every 24 hours.
