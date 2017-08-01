//instagram.js

function InstagramParser(post) {

    var token = '1472405141.27c9a7f.07d3dc3443564bd8ab325a02a21010a0';
    var key = post.url.substring(post.url.lastIndexOf('/')+1);

    post.id = getPostId(post.url);

    getComments(post);

    function getComments(post) {
        var getMediaIdCmd = "https://api.instagram.com/v1/media/shortcode/" + encodeURIComponent(key) + "?access_token=" + (token);

        var req = new XMLHttpRequest();
        req.open('GET', getMediaIdCmd, true);
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        req.onreadystatechange = parseResponse;
        req.send();
    }

    function parseResponse(event) {
        req = event.target;
        if (req.readyState == 4 && req.status == 200) {
            var response = JSON.parse(req.responseText);
            if (response.data.id) {
                var mediaId = response.data.id;
                var getCommentsCmd = "https://api.instagram.com/v1/media/" + encodeURIComponent(mediaId) + "/comments?access_token=" + (token);
                req.open('GET', getCommentsCmd, true);
                req.send();
            }
            console.log('Not implemented yet');
        }
    }
}