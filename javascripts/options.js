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
    localStorage.targets = $('#targets').val() || "";
    
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

    getTelegramChatId();
}


document.addEventListener('DOMContentLoaded', function () {
    var isActive = getCommentatorSettings('isActive');
    
    $btnSwitch = $('#btn-switch');

    $btnSwitch.val(isActive ? "Stop" : "Start");

    $('#targets').bind('input propertychange', function() {
        var targets = $('#targets').val();
        targets = $('#targets').val() || "";
        localStorage.targets = targets;
        chrome.storage.sync.set({
            'targets'                 : localStorage.targets
    }, function() {});
    });

    $('#btn-save').click(function() {
        save();
        notify("Commentator", "The configuration has been saved!");
    });

    $('#btn-switch').click(function() {
        var isActive = getCommentatorSettings('isActive');
        editCommentatorSettings('isActive', !isActive);
        setCommentatorIcon(!isActive);
        $btnSwitch.html(isActive ? "Start" : "Stop");
        if (isActive) {
            notify("Commentator", "Commentator stoped.");
            resetCounter();            
        } else {
            notify("Commentator", "Commentator started.");   
        }
    });
});

loadCommentatorInfo();