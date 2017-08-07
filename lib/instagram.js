//instagram.js

function InstagramParser(post) {

    var url = post.url;

    getComments(post);

    function getComments(post) {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.onreadystatechange = parseResponse;
        req.send();
    }

    function parseResponse(event) {
        req = event.target;
        if (req.readyState == 4 && req.status == 200) {
            var entry = '<script type="text/javascript">window._sharedData = ';
            var outer = '};</script>\n';

            var response = req.responseText;
            var indexStart = response.indexOf(entry);
            var indexEnd = response.indexOf(outer);

            var _sharedData = response.substring(indexStart + entry.length, indexEnd + 1);
            var json = JSON.parse(_sharedData);
            var comments = json.entry_data.PostPage["0"].graphql.shortcode_media.edge_media_to_comment.edges;
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
        if (req.readyState == 4 && req.status == 404) {
            console.log("post not found");
        }
    }
}