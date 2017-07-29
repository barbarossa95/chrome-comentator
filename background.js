
function setCommentatorIcon() {
    var icon = {
        path: "images/comment.png",
    };
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
            chrome.tabs.create({url: url,index: tab.index + 1});
        });
    });
}

var commentatorSettings = {
    'targets'           : '',
    'botToken'          : '',
    'botId'             : '',
    'interval'          : '',
    'messageTemplate'   : ''
};

function getComments() {
    var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
    var pages = commentatorSettings.targets.split('/\r|\n/');
    for (var i = pages.length - 1; i >= 0; i--) {
        console.log('currnet page - '  + pages[i]);
        
        var req = new XMLHttpRequest();
        var url = pages[i];
        req.open('GET', url, true);
        req.onreadystatechange = processResponse;
        req.send(null);

        function processResponse() {
            if (req.readyState == 4 && req.status == 200) {
                if (page.search('/(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am)\/([A-Za-z0-9-_]+)/igm') != -1) {
                    parseInstagramm(page);
                }
                if (page.search() != -1) {
                    parseFacebook(page);    
                }
            } else {
                console.log('error on request: ' + req.responseText);
            }
        }
    }
}

function parseInstagramm(responseText) {
    //todo
}

function parseFacebook(responseText) {
    //todo
}

chrome.runtime.onInstalled.addListener(function(details){
    localStorage.commentatorSettings = JSON.stringify(commentatorSettings);
    gotoPage('options.html');
});

//open options.html page on extension icon click
chrome.browserAction.onClicked.addListener(function(tab) {
    gotoPage('options.html');
});

// sync extension settings from google cloud
chrome.storage.sync.get('commentatorSettings', function(val) {
    if (typeof val.commentatorSettings !== "undefined") {
        localStorage.commentatorSettings = val.commentatorSettings;
    }
});

//set icon
setCommentatorIcon();
// sync comments with local storage
getUpdates();

//get extension interval setting and run update callback on timeout
function getUpdates() {
    getComments();
    var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
    var interval = 1000 * 60 * commentatorSettings.interval;
    setTimeout(getUpdates, interval);
}

