function loadCommentatorInfo() {
    $(document).ready(function() {
        var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
        // get current settings
        $('#targets').val(commentatorSettings['targets'] || "");
        $('#botToken').val(commentatorSettings['botToken'] || "");
        $('#botId').val(commentatorSettings['botId'] || "");
        $('#interval').val(commentatorSettings['interval'] || "");
        $('#messageTemplate').val(commentatorSettings['messageTemplate'] || "");
    });
}

/**
 * button id save click handler
 *
 */
function save() {
    var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
    commentatorSettings['targets'] = $('#targets').val() || "";
    commentatorSettings['botToken'] = $('#botToken').val() || "";
    commentatorSettings['botId'] = $('#botId').val() || "";
    commentatorSettings['interval'] = $('#interval').val() || "";
    commentatorSettings['messageTemplate'] = $('#messageTemplate').val() || "";

    var settings = JSON.stringify(commentatorSettings);

    localStorage.commentatorSettings = settings;
    // sync settings to google cloud
    chrome.storage.sync.set({'commentatorSettings' : settings}, function() {});
}


document.addEventListener('DOMContentLoaded', function () {
    $('#btn-save').click(function() {
        save();
        editCommentatorSettings('isActive', true);
        setCommentatorIcon();
        alert('The configuration has been saved! Commentator is running.');
    });

    $('#btn-stop').click(function() {
        editCommentatorSettings('isActive', false);
        setCommentatorIcon();
        alert("Commentator stoped.");   
    });
});


function editCommentatorSettings(key, value) {
    var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
    commentatorSettings[key] = value;
    localStorage.commentatorSettings = JSON.stringify(commentatorSettings);    
    chrome.storage.sync.set({'commentatorSettings' : localStorage.commentatorSettings}, function() {});
}

function setCommentatorIcon() {
    var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
    var icon = {
        path    : 'images/comment-off.png',
    };
    var title = {
        title   : 'Commentator stoped'
    };
    if (commentatorSettings['isActive']) {
        icon["path"]="images/comment.png";
        title['title'] = 'Commentator is running';
    }
    chrome.browserAction.setIcon(icon);
    chrome.browserAction.setTitle(title);
}

loadCommentatorInfo();