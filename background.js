    FB.init({
            appId            : '503342810008442',
            autoLogAppEvents : true,
            xfbml            : true,
            version          : 'v2.10'
        });

function setCommentatorIcon() {
    var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
    var icon = {
        path: "images/comment-off.png",
    };
    if (commentatorSettings['isActive']) {
        icon["path"]="images/comment.png";
    }
    chrome.browserAction.setIcon(icon);
}

function gotoPage(url) {
    var fulurl = chrome.extension.getURL(url);
    chrome.tabs.getAllInWindow(undefined, function(tabs) {
        for (var i in tabs) {
            tab = tabs[i];
            if (tab.url == fulurl) {
                chrome.tabs.update(tab.id, { selected: true });
                return;
            }
        }
        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.create({
                url     : fulurl,
                index   : tab.index + 1
            });
        });
    });
}

function getComments() {
    var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
    var pages = commentatorSettings.targets.split('\n');
    for (var i = pages.length - 1; i >= 0; i--) {
        if (pages[i].search('(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\-]*)?') !== -1) {
            var since = localStorage.facebookSyncDate;
            FacebookParser(pages[i], since);
            return;
        }
        if (pages[i].search('(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am)\/([A-Za-z0-9-_]+)') !== -1) {
            InstagramParser(pages[i]);
            return;
        }
    }
}

chrome.runtime.onInstalled.addListener(function(details){
    initStorage();
    setCommentatorIcon();
    gotoPage('options.html');
});

//open options.html page on extension icon click
chrome.browserAction.onClicked.addListener(function(tab) {
    gotoPage('options.html');
});

// sync extension settings since google cloud
chrome.storage.sync.get('commentatorSettings', function(val) {
    if (typeof val.commentatorSettings !== "undefined") {
        localStorage.commentatorSettings = val.commentatorSettings;
    } else {
        initStorage();
    }
});

// sync comments with local storage
getUpdates();

//get extension interval setting and run update callback on timeout
function getUpdates() {
    var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
    if (commentatorSettings['isActive']) {
        getComments();
    }
    var interval = 1000 * 60 * commentatorSettings.interval;
    setTimeout(getUpdates, interval);
}

function initStorage() {
    var commentatorSettings = {
            'isActive'          : true,
            'targets'           : 'https://www.facebook.com/150029108903859/posts/110903252893547',
            'botToken'          : '401718482:AAGabhE9Vaf3lqiAWT1DP4-8OcyAsOQNm40',
            'botId'             : '@commentatorChannel',
            'interval'          : 0.1,
            'messageTemplate'   : 'test messageTemplate {{MESSAGE}}'
    };
    localStorage.commentatorSettings = JSON.stringify(commentatorSettings);
    localStorage.facebookSyncDate = '';
    localStorage.facebookComments = JSON.stringify([{
        name: 'facebook',
    }]);
}