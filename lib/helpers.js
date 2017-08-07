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
    var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
    var botToken = commentatorSettings['botToken'];
    var tgUserId = commentatorSettings['tgUserId'];
    for (var i in post.comments) {
        if (post.comments[i].isSended) {
            continue;
        }
        var message = formMessage(post.comments[i], post.url, commentatorSettings['messageTemplate']);

        var body = '?chat_id=' + encodeURIComponent(tgUserId) +
            '&text=' + encodeURIComponent(message);
        var tgUrl = "https:\/\/api.telegram.org/bot" + botToken + "/sendMessage" + body;

        var req = new XMLHttpRequest();
        req.open('POST', tgUrl, true);
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
    var mes = messageTemplate.replace(/{{MESSAGE}}/g, comment.message + ' from: ' + comment.from + '.\nPost: ' + url);
    return mes; 
}