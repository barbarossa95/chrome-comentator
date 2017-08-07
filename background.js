    FB.init({
            appId            : '503342810008442',
            autoLogAppEvents : true,
            xfbml            : true,
            version          : 'v2.10'
        });

function setCommentatorIcon() {
    console.log('setCommentatorIcon');
    var isActive = getCommentatorSettings('isActive');
    var icon = {
        path    : 'images/comment-off.png',
    };
    var title = {
        title   : 'Commentator stoped'
    };
    if (isActive) {
        icon["path"]="images/comment.png";
        title['title'] = 'Commentator is running';
    }
    chrome.browserAction.setIcon(icon);
    chrome.browserAction.setTitle(title);
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
    console.log('onInstalled');
    initStorage();
    setCommentatorIcon();
});

chrome.app.runtime.onLaunched.addListener(function() {
    console.log('onStartup');
    // sync extension settings since google cloud
    chrome.storage.sync.get('commentatorSettings', function(val) {
        if (typeof val.commentatorSettings !== "undefined" 
            && typeof val.targets !== "undefined"
            && typeof val.posts !== "undefined") {
            localStorage.commentatorSettings = val.commentatorSettings;
            localStorage.targets = val.targets;
            localStorage.posts = val.posts;
        } else {
            initStorage();
        }
    });
    setCommentatorIcon();
    getUpdates();
    gotoPage('options.html');
});

//open options.html page on extension icon click
chrome.browserAction.onClicked.addListener(function(tab) {
    gotoPage('options.html');
});


//get extension interval setting and run update callback on timeout
function getUpdates() {
    console.log('get updates');
    var isActive = getCommentatorSettings('isActive');
    if (isActive) {
        var targets = localStorage.targets.split('\n');
        for (var i = targets.length - 1; i >= 0; i--) {
            var url = targets[i];
            var site = '';
            if (url.search('(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\-]*)?') !== -1) {
                site = 'facebook';
            }
            if (url.search('(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am)\/([A-Za-z0-9-_]+)') !== -1) {
                site = 'instagram';
            }
            post = getPostFromStorage(url);
            if (!post) {
                post = {
                    id: 0,
                    url: url,
                    comments: null,
                    syncDate: null
                }
            }
            switch (site) {
                case 'facebook': FacebookParser(post); break;
                case 'instagram': InstagramParser(post); break;
                default: continue;
            }
        }
        setTimeout(function() {
            notifyByTelegram(targets);
        }, 1000 * 30);
    }
    var interval = getCommentatorSettings('interval');
    setTimeout(getUpdates, 1000 * 60 * interval);
}

function initStorage() {
    console.log('initStorage');
    var commentatorSettings = {
            'isActive'          : true,
            'botToken'          : '384661304:AAHMZB7auyT0I-KTFHg1QDT9YpMmtC4-CqU',
            'tgUserId'          : '@barbarossa_95',
            'interval'          : 0.2,
            'messageTemplate'   : 'Post: {{URL}} Сообщение: {{MESSAGE}}'
    };
    localStorage.commentatorSettings = JSON.stringify(commentatorSettings);
    localStorage.targets = "https://www.instagram.com/p/BWpKvR7BDMB";
    localStorage.posts = "";
    chrome.storage.sync.set({
        'commentatorSettings'   : localStorage.commentatorSettings,
        'targets'               : localStorage.targets,
        'posts'                 : localStorage.posts
    }, function() {});
}