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
            return;
        }
        if (url.search('(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am)\/([A-Za-z0-9-_]+)') !== -1) {
            InstagramParser(post);
            return;
        }
    }
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
    localStorage.posts = '';
}

function getPostFromStorage(url) {
    var posts = localStorage.posts ? JSON.parse(localStorage.posts) : [] ;
    var post = posts.find(function (post) {
        return post.url == url;
    });
    return post ? post : null;
}

function savePostToStorage(post) {
    var posts = localStorage.posts ? JSON.parse(localStorage.posts) : [] ;
    for (var i in posts) {
        if (posts[i].url == post.url) {
            posts[i] = post;
            localStorage.posts = JSON.stringify(posts);
            return; //Stop this loop, we found it!
        }
    }
    posts.push(post);
    localStorage.posts = JSON.stringify(posts);
    return;
}