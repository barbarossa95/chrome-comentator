//instagram.js

function InstagramParser(post) {

    var url = post.url;

    getComments(post);

    function getComments(post) {
        var req = new XMLHttpRequest();
        req.open('GET', url + '?__a=1', true);
        req.onreadystatechange = parseResponse;
        req.send();
    }

    function parseResponse(event) {
        req = event.target;
        if (req.readyState == 4 && req.status == 200) {
            var response = req.responseText;
            
            if (!response) {
                notify('Error', 'Error! Cant allocate comments on page ' + req.responseURL);
                return;
            }
            try {
                var json = JSON.parse(response);
            } catch(e) {
                notify('Error', 'Error! Cant allocate comments on page ' + e);
                return;
            }
            var comments = json.graphql.shortcode_media.edge_media_to_comment.edges;
            comments = comments.map(function (item) { 
                return item.node;
            });
            if (comments.length !== 0) {
                if (!post.comments) {
                    post.comments = [];
                }
                var lastSync = post.syncDate;
                if (!lastSync) {
                    lastSync = 0;
                }
                comments.forEach(function (comment) {
                    if(comment.created_at > lastSync) {
                        post.comments.push({
                            isSended: false,
                            from : comment.owner.username,
                            message: comment.text,
                            created_at: comment.created_at
                        });
                    }
                });
                post.syncDate = comments[comments.length-1].created_at;
            }
            savePostToStorage(post);
        }
        if(req.status == 404) {
            notify('Error', 'Error! Post ' + req.responseURL + ' not found (404).');
        }
    }
}