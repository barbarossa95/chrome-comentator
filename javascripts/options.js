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
    var targets = $('#targets').val() || "";
    localStorage.targets = targets;
    
    var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
    commentatorSettings['botToken'] = $('#botToken').val() || "";
    commentatorSettings['tgUserId'] = $('#tgUserId').val() || "";
    commentatorSettings['interval'] = $('#interval').val() || "";
    commentatorSettings['messageTemplate'] = $('#messageTemplate').val() || "";
    var settings = JSON.stringify(commentatorSettings);
    localStorage.commentatorSettings = settings;
    // sync settings to google cloud
    chrome.storage.sync.set({
        'commentatorSettings' : settings,
        'targets' : targets
    }, function() {});
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