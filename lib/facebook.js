//facebook.js

function FacebookParser(url) {
    window.fbAsyncInit = function() {
        FB.init({
            appId            : '503342810008442',
            autoLogAppEvents : true,
            xfbml            : true,
            version          : 'v2.10'
        });
        FB.AppEvents.logPageView();
    };
    console.log(url);

}