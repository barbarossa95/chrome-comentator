// helpers.js

/**Unix time function*/
Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
if(!Date.now) Date.now = function() { return new Date(); }
Date.time = function() { return Date.now().getUnixTime(); }

function getPostId(url) {
    var u = url;
    if (u.lastIndexOf("/") == u.length-1) {
        u = u.substr(0,url.length-1)
    }
    return u.substring(u.lastIndexOf("/")+1);
}

getTargetUrl(target) {
    return target.split(' - ')[0];
}

getTargetLabel(target) {
    return target.split(' - ')[1];
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

function notifyByTelegram() {
    var chatId = getCommentatorSettings('tgUserId');
    if (!chatId) {
        return;
    }
    var pages = localStorage.targets.split('\n');
    for (var i = pages.length - 1; i >= 0; i--) {
        var url = getTargetUrl(pages[i]);
        post = getPostFromStorage(url);
        if (!post) {
            continue;
        }
        var label = getTargetLabel(pages[i]);
        sendMessageViaTg(post, label);
    }
}

// send message to tg
function sendMessageViaTg(post, label) {
    var chatId = getCommentatorSettings('tgUserId');
    var botToken = getCommentatorSettings('botToken');
    var messageTemplate = getCommentatorSettings('messageTemplate');
    for (var i in post.comments) {
        if (post.comments[i].isSended) {
            continue;
        }
        var text = formMessage(post.comments[i], post.url, label, messageTemplate);

        var query = "https:\/\/api.telegram.org/bot"
            + botToken + "/sendMessage"
            + '?chat_id=' + encodeURIComponent(chatId)
            + '&text=' + encodeURIComponent(text)
            + '&disable_web_page_preview=true';

        var req = new XMLHttpRequest();
        req.open('POST', query, true);
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        req.post = post;
        req.comment = post.comments[i];
        req.onreadystatechange = sended;

        req.send();
    }
}

function sended() {
    req = event.target;
    if (req.readyState == 4 && req.status == 200) {
        try {
            var response = JSON.parse(req.responseText);
        } catch(e) {
            // notify('Error', 'Cant send message via tg');
            return;
        }
        if (response.ok) {
            req.comment.isSended = true;
        }
        savePostToStorage(req.post);
    }
}

function formMessage(comment, url, label, messageTemplate) {
    var mes = messageTemplate.replace(/{{MESSAGE}}/g, '@' + comment.from + ': ' + comment.message);
    mes = mes.replace(/{{URL}}/g, url);
    mes = mes.replace(/{{URL TAG}}/g, label ? label : '');

    return mes;
}

function editCommentatorSettings(key, value) {
    try{
        var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
    } catch(e) {
        return;
    }
    commentatorSettings[key] = value;
    localStorage.commentatorSettings = JSON.stringify(commentatorSettings);
    chrome.storage.sync.set({'commentatorSettings' : localStorage.commentatorSettings}, function() {});
}

function getCommentatorSettings(key) {
    try{
        var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
    } catch(e) {
        return '';
    }
    return commentatorSettings[key];
}

function setCommentatorIcon() {
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

function getTelegramChatId() {
    var tgUser = getCommentatorSettings('tgUserId');
    var botToken = getCommentatorSettings('botToken');
    var query = "https:\/\/api.telegram.org/bot"
            + botToken + "/getUpdates";
    var req = new XMLHttpRequest();
    req.open('POST', query, true);
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    req.onreadystatechange = function() {
        req = event.target;
        if (req.readyState == 4 && req.status == 200) {
            var response = JSON.parse(req.responseText);
            if (response.ok) {
                response.result.forEach(function(update) {
                    if(update.message.from.username == tgUser.substr(1)) {
                        localStorage.chatId = update.message.chat.id;
                        return;
                    }
                });
            }
        }
    };
    req.send();
}

function notify(title, message) {
    chrome.notifications.create('', {
        'type'      : 'basic',
        'iconUrl'   : 'images/comment.png',
        'title'     : title,
        'message'   : message
    }, function() {});
}

function resetCounter() {
    localStorage.requestCounter = 0;
    chrome.browserAction.setBadgeText({
        'text'  : ''
    });
}

function increaseCounter() {
    localStorage.requestCounter = parseInt(localStorage.requestCounter) + 1;
    chrome.browserAction.setBadgeText({
        'text'  : localStorage.requestCounter
    });
}