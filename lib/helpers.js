// helpers.js

/**Unix time function*/
Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
if(!Date.now) Date.now = function() { return new Date(); }
Date.time = function() { return Date.now().getUnixTime(); }

function getPostId(url) {
    return url.substring(url.lastIndexOf("/")+1);
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
    var chatId = localStorage.chatId;
    if (!chatId) {
        return;
    }
    var pages = localStorage.targets.split('\n');
    for (var i = pages.length - 1; i >= 0; i--) {
        var url = pages[i];
        post = getPostFromStorage(url);
        if (!post) {
            continue;
        }        
        sendMessageViaTg(post);
    }
}

// send message to tg
function sendMessageViaTg(post) {
    var chatId = localStorage.chatId;
    var botToken = getCommentatorSettings('botToken');
    var messageTemplate = getCommentatorSettings('messageTemplate');
    for (var i in post.comments) {
        if (post.comments[i].isSended) {
            continue;
        }
        var text = formMessage(post.comments[i], post.url, messageTemplate);

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
        var response = JSON.parse(req.responseText);
        if (response.ok) {
            req.comment.isSended = true;
        }
        savePostToStorage(req.post);
    }
}

function formMessage(comment, url, messageTemplate) {
    var mes = messageTemplate.replace(/{{MESSAGE}}/g, '@' + comment.from + ':' + comment.message);
    mes = mes.replace(/{{URL}}/g, url);
    return mes; 
}

function editCommentatorSettings(key, value) {
    var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
    commentatorSettings[key] = value;
    localStorage.commentatorSettings = JSON.stringify(commentatorSettings);    
    chrome.storage.sync.set({'commentatorSettings' : localStorage.commentatorSettings}, function() {});
}

function getCommentatorSettings(key) {
    var commentatorSettings = JSON.parse(localStorage.commentatorSettings) || "";
    return commentatorSettings[key];
}