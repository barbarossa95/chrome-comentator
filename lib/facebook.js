//facebook.js

function FacebookParser(url, since) {
    // -_____-   hardcode
    var appId = "503342810008442";
    var secret = "36ebdf7620814543a26080bec1881a43";
    var accessToken = appId+ "|" + secret;
    
    var postId = getPostId(url);

    /**Unix time function*/
    Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
    if(!Date.now) Date.now = function() { return new Date(); }
    Date.time = function() { return Date.now().getUnixTime(); }

    var since = since;

    function getPostId(url) {
        return url.substring(url.lastIndexOf("/")+1);
    }

    function parseResponse(event) {
        req = event.target;
        if (req.readyState == 4 && req.status == 200) {
            var response = JSON.parse(req.responseText);
            if (response.error) {
                console.log(response.error);
            }
            response.data.url = url;
            storeComments(postId, response.data);
            //getting last sync date
            var since;
            response.data.forEach(function (comment) {
                since = comment.created_time;
            });
            if (since) {
                localStorage.facebookSyncDate = since;
            }
        }
    }

    function getComments(since) {
        var graphUrl = "https:\/\/graph.facebook.com/"+ postId +"/comments?filter=stream&access_token=" + accessToken;

        if(since) {
            //if specified since date add filter by date
            since = new Date(since);
            var until = new Date(since);
            until.setMonth(until.getMonth() + 5);
            graphUrl += "&since=" + since.getUnixTime() + "&until=" + until.getUnixTime();
        }
        var req = new XMLHttpRequest();
        req.open('GET', graphUrl, true);
        req.onreadystatechange = parseResponse;
        req.send(null);
    }
    getComments(since);

    function storeComments (postId, comments) {
        var facebookComments = JSON.parse(localStorage.facebookComments);
        if (!facebookComments) {
            facebookComments = [];
        }

        comments.forEach(function (comment) {
            comment.url = comments.url;
            facebookComments.push({
                postId  : postId,
                comment : comment,
            });
            sendMessage(comment);
        });

        localStorage.facebookComments = JSON.stringify(facebookComments);
    }

    // send message to tg
    function sendMessage(data) {
        var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
        var botToken = commentatorSettings['botToken'];
        var tgUserId = commentatorSettings['botId'];
        var message = formMessage(data, commentatorSettings['messageTemplate']);

        var body = '?chat_id=' + encodeURIComponent(tgUserId) +
          '&text=' + encodeURIComponent(message);
        var tgUrl = "https:\/\/api.telegram.org/bot" + botToken + "/sendMessage" + body;

        var req = new XMLHttpRequest();
        req.open('POST', tgUrl, true);
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        req.onreadystatechange = sended;
        req.send();

        function sended() {
            req = event.target;
            if (req.readyState == 4 && req.status == 200) {
                var response = JSON.parse(req.responseText);
                if (response.ok) {
                    console.log(response.error);
                }
                console.log(response.data);
            }
        }
    }

    function formMessage(data, messageTemplate ) {
        var mes = messageTemplate.replace(/{{MESSAGE}}/g, data.message + ' from: ' + data.from.name + '.\nPost: ' + data.url);
        return mes; 
    }
}