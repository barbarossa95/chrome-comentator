function loadCommentatorInfo() {
    $(document).ready(function() {
        var targets = localStorage.targets;
        $('#targets').val(targets || "");

        var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
        $('#botToken').val(commentatorSettings['botToken'] || "");
        $('#tgUserId').val(commentatorSettings['tgUserId'] || "");
        $('#interval').val(commentatorSettings['interval'] || "");
        $('#messageTemplate').val(commentatorSettings['messageTemplate'] || "");
    });
}

function save() {
    localStorage.targets = $('#targets').html() || "";
    
    var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
    commentatorSettings['botToken'] = $('#botToken').val() || "";
    commentatorSettings['tgUserId'] = $('#tgUserId').val() || "";
    commentatorSettings['interval'] = $('#interval').val() || "";
    commentatorSettings['messageTemplate'] = $('#messageTemplate').val() || "";
    localStorage.commentatorSettings = JSON.stringify(commentatorSettings);
    // sync settings to google cloud
    chrome.storage.sync.set({
        'commentatorSettings'   : localStorage.settings,
        'targets'               : localStorage.targets,
        'posts'                 : localStorage.posts
    }, function() {});

    var tgUser = getCommentatorSettings('tgUserId');
    var botToken = getCommentatorSettings('botToken');
    var query = "https:\/\/api.telegram.org/bot" 
            + botToken + "/getUpdates";

    var req = new XMLHttpRequest();
    req.open('POST', query, true);
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    req.onreadystatechange = function() {
        req = event.target;
        if (req.readyState == 4 && req.status == 200) {
            var response = JSON.parse(req.responseText);
            if (response.ok) {
                response.result.forEach(function(update) {
                    if(update.message.from.username == tgUser.substr(1)) {
                        localStorage.chatId = update.message.chat.id;
                        return;
                    }
                });
            }
        }
    };
    req.send();
}


document.addEventListener('DOMContentLoaded', function () {
    var isActive = getCommentatorSettings('isActive');
    
    $btnSwitch = $('#btn-switch');

    $btnSwitch.val(isActive ? "Stop" : "Start");

    $('#targets').bind('input propertychange', function() {
        var targets = $('#targets').val();
        targets = $('#targets').val() || "";
        localStorage.targets = targets;

    });

    $('#btn-save').click(function() {
        save();
        alert('The configuration has been saved!');
    });

    $('#btn-switch').click(function() {
        var isActive = getCommentatorSettings('isActive');
        editCommentatorSettings('isActive', !isActive);
        setCommentatorIcon(!isActive);
        $btnSwitch.html(isActive ? "Start" : "Stop");
        if (isActive) {
            alert("Commentator stoped.");   
        } else {
            alert("Commentator started.");   
        }
    });
});

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

function setCommentatorIcon(isActive) {
    var icon = {
        path    : 'images/comment-off.png',
    };
    var title = {
        title   : 'Commentator stoped'
    };
    if (isActive) {
        icon["path"]="images/comment.png";
        title['title'] = 'Commentator is running';
    }
    chrome.browserAction.setIcon(icon);
    chrome.browserAction.setTitle(title);
}

loadCommentatorInfo();