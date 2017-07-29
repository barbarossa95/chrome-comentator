function loadCommentatorInfo() {
    $(document).ready(function() {
            console.log(localStorage.commentatorSettings);

        var commentatorSettings = JSON.parse(localStorage.commentatorSettings);
        // get current settings
        $('#targets').val(commentatorSettings[''] || "");
        $('#botToken').val(commentatorSettings[''] || "");
        $('#botId').val(commentatorSettings[''] || "");
        $('#interval').val(commentatorSettings[''] || "");
        $('#messageTemplate').val(commentatorSettings[''] || "");
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
        console.log('saved');
        console.log(localStorage.commentatorSettings);
        save();
    });

    $('#btn-stop').click(function() {
        console.log('stoped');
        // todo stop working of commentator
    });
});

loadCommentatorInfo();