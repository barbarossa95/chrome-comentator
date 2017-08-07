//facebook.js

function FacebookParser(post) {
    // -_____-   hardcode
    var appId = "503342810008442";
    var secret = "36ebdf7620814543a26080bec1881a43";
    var accessToken = appId+ "|" + secret;
    
    post.id = getPostId(post.url);

    getComments(post);

    function getComments(post) {
        var graphUrl = "https:\/\/graph.facebook.com/"+ post.id +"/comments?filter=stream&access_token=" + accessToken;

        if(post.syncDate) {
            //if specified since date add filter by date
            since = new Date(post.syncDate);
            var until = new Date(since);
            until.setMonth(until.getMonth() + 5);
            graphUrl += "&since=" + since.getUnixTime() + "&until=" + until.getUnixTime();
        }
        var req = new XMLHttpRequest();
        req.open('GET', graphUrl, true);
        req.onreadystatechange = parseResponse;
        req.send(null);
    }

    function parseResponse(event) {
        req = event.target;
        if (req.readyState == 4 && req.status == 200) {
            var response = JSON.parse(req.responseText);
            if (response.error) {
                notify('Error', 'Error while parsing ' + req.responseURL + '\nError: ' + response.error);
            }
            if (response.data.length !== 0) {
                if (!post.comments) {
                    post.comments = [];
                }
                response.data.forEach(function (comment) {
                    post.comments.push({
                        isSended: false,
                        from : comment.from.name,
                        message: comment.message,
                        created_at: comment.created_time
                    });
                });
                post.syncDate = response.data[response.data.length-1].created_time;
            }
            savePostToStorage(post);
        }
        if(req.status == 404) {
            notify('Error', 'Error! Post ' + req.responseURL + ' not found (404).');
        }
    }
}