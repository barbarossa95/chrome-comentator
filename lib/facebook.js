//facebook.js

function FacebookParser(post) {
    // -_____-   hardcode    
    post.id = getPostId(post.url);
    if (!post.offset) {
        post.offset = 0;
    }

    getComments(post);

    function getComments(post) {
        var query = "https://www.facebook.com/ajax/ufi/comment_fetch.php?dpr=1"
            +"&ft_ent_identifier=" + post.id
            +"&__a=1&offset=" + post.offset
            +"&length=50&orderingmode=recent_activity";
        var req = new XMLHttpRequest();
        req.open('GET', query, true);
        req.onreadystatechange = parseResponse;
        req.send(null);
    }

    function parseResponse(event) {
        req = event.target;
        if (req.readyState == 4 && req.status == 200) {
            try {
                var response = JSON.parse(req.responseText.substring(9));
            } catch(e) {
                notify('Error', 'Error while parsing ' + req.responseURL + '\nError: ' + e);
                return;
            }
            var comments = response.jsmods.require["0"][3][1].comments;
            var profiles = response.jsmods.require["0"][3][1].profiles;
            if (!comments ) {
                notify('Error', 'Error while parsing ' + req.responseURL + '\nError: ' + response.error);
                return;
            }
            if (comments.length !== 0) {
                if (!post.comments) {
                    post.comments = [];
                }
                var lastSync = post.syncDate;
                if (!lastSync) {
                    lastSync = 0;
                }
                comments.forEach(function (comment) {
                    if(comment.timestamp.time > lastSync) {
                        post.comments.push({
                            isSended    : false,
                            from        : profiles[comment.author].name,
                            message     : comment.body.text,
                            created_at  : comment.timestamp.time
                        });
                    }
                });
                post.syncDate = comments[comments.length-1].timestamp.time;
                post.offset = post.offset + 50;
                getComments(post);
            }
            savePostToStorage(post);
        }
        if(req.status == 404) {
            notify('Error', 'Error! Post ' + req.responseURL + ' not found (404).');
        }
    }
}