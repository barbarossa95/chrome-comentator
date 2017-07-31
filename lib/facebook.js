//facebook.js

function FacebookParser(url, from) {
    // -_____-   hardcode
    var accessToken = '503342810008442|MSzyXs_AQG-x5eMCRO3A3LnVXg0';
    
    var postId = getPostId(url);

    var from = from;

    function getPostId(url) {
        return url.substring(url.lastIndexOf("/")+1);
    }

    function parseResponse(event) {
        req = event.target;
        if (req.readyState == 4 && req.status == 200) {
            var response = JSON.parse(req.responseText);
            console.log(response);
            if (response.error) {
                console.log(response.error);
            }
            //todo
            response.data.forEach(function (comment) {
                console.log(comment.message);
            })
        }
    }

    function getComments(from) {
        var graphUrl = "https:\/\/graph.facebook.com/"+ postId +"/comments?filter=stream&access_token=" + accessToken;
        if(from) {
            //if specified from date add filter by date
            from = new Date(from);
            graphUrl += "&since=" + from.getTime();
        }
        var req = new XMLHttpRequest();
        req.open('GET', graphUrl, true);
        req.onreadystatechange = parseResponse;
        req.send(null);
    }

    getComments(from);  
}