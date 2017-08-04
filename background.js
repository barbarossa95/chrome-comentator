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

chrome.runtime.onInstalled.addListener(function(details){
    initStorage();
    setCommentatorIcon();
    gotoPage('options.html');
    // sync comments with local storage
    getUpdates();
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
        var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
        var posts = localStorage.posts ? JSON.parse(localStorage.posts) : [] ;
        var pages = commentatorSettings.targets.split('\n');
        for (var i = pages.length - 1; i >= 0; i--) {
            var url = pages[i];
            post = getPostFromStorage(url);
            if (!post) {
                post = {
                    id: 0,
                    url: url,
                    comments: null,
                    syncDate: null
                }
            }
            if (url.search('(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\-]*)?') !== -1) {
                FacebookParser(post);
                continue;
            }
            if (url.search('(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am)\/([A-Za-z0-9-_]+)') !== -1) {
                InstagramParser(post);
                continue;
            }
        }
        setTimeout(function() {
            notifyByTelegram();
        }, 1000 * 30);
    }
    var interval = 1000 * 60 * commentatorSettings.interval;
    setTimeout(getUpdates, interval);
}

function initStorage() {
    var commentatorSettings = {
            'isActive'          : true,
            'targets'           : 'https://www.instagram.com/p/BWpKvR7BDMB',
            'botToken'          : '401718482:AAGabhE9Vaf3lqiAWT1DP4-8OcyAsOQNm40',
            'tgUserId'          : '@commentatorChannel',
            'interval'          : 1,
            'messageTemplate'   : 'You have new comment: {{MESSAGE}}'
    };
    localStorage.commentatorSettings = JSON.stringify(commentatorSettings);
    localStorage.posts = '';
}