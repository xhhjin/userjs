﻿// ==UserScript==
// @name        No track
// @namespace   http://maxint.github.io
// @description Disable track of search engine
// @include     https://search.yahoo.com/yhs/search*
// @version     1
// @grant       none
// ==/UserScript==

// a function that loads jQuery and calls a callback function when jQuery has finished loading
function withjQuery(callback, safe) {
    if (typeof(jQuery) == "undefined") {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.11.1.min.js";
        if (safe) {
            var cb = document.createElement("script");
            cb.type = "text/javascript";
            cb.textContent = "jQuery.noConflict();(" + callback.toString() + ")(jQuery, window);";
            script.addEventListener('load', function(){
                document.head.appendChild(cb);
            });
        } else {
            var dollar = undefined;
            if (typeof($) != "undefined") dollar = $;
            script.addEventListener('load', function(){
                jQuery.noConflict();
                $ = dollar;
                callback(jQuery, window);
            });
        }
        document.head.appendChild(script);
    } else {
        setTimeout(function(){
            //Firefox supports
            console.log('Runing custom script');
            callback(jQuery, typeof(unsafeWindow) == "undefined" ? window : unsafeWindow);
        }, 30);
    }
}

// the guts of this userscript
withjQuery(function($, window) {
    console.log('Using jquery ' + $().jquery);
    $("a[id^='link']").each(function(){
        $(this).attr('dirtyhref', $(this).attr('href')).attr('target', '_blank');
    });
}, true);
