import story1 from "../data/story1.csv";
import story2 from "../data/story2.csv";
// import story4 from "../data/story4.csv";
import story4 from "../data/story4_packed.json";
import story5 from "../data/story5.csv";

import sadlove from "../data/story_putintobank.json";
import happylove from "../data/story_venmodollar.json";

var $world, $god, $insights, $stories, $storylink, $storycontent, $aboutlink, $intro, $introscreens, $venmoSettings;
var ww, wh;
var introIndex = 0;
var state = "";
var d3_brush = require('./d3_brush.js');
var d3_packed = require('./d3_packed.js');
var chat = require('./chat.js');
var simulation = require('./simulation.js');
var d3_timeline = require('./d3_timeline.js');

//without this line, CSSPlugin and AttrPlugin may get dropped by your bundler...
var plugins = [CSSPlugin];

function godMode() {
    simulation.pause();
    $storycontent.fadeOut();
    $stories.fadeOut(function() {
        let x = ww / 2 - ww * 0.12 / 2; // center - half god width
        let y = wh * 0.05;
        TweenMax.to($god, 0.7, {
            css: { x: x, y: y, z: 0.1, rotationZ: 0.01, force3D: true, scale: 0.7001, cursor: "inherit" },
            onComplete: function() { $insights.fadeIn(); }
        });
        TweenMax.to($world, 0.7, {
            css: { y: wh * 0.3 - 35, cursor: "pointer" },
        });
    });
    $god.removeClass("clickhint");
    $storylink.removeClass("clickhint");
    state = "godMode";
}

function worldMode() {
    simulation.pause();
    $insights.animate({ scrollTop: 0 }, 100);
    $storycontent.fadeOut();
    $insights.fadeOut(function() {
        TweenMax.to($world, 0.7, {
            css: { y: 0, cursor: "inherit" },
            onComplete: function() {
                $stories.fadeIn();
                $god.addClass("clickhint");
                $($storylink[1]).addClass("clickhint");
            }
        });
        TweenMax.to($god, 0.7, {
            css: { x: ww * 0.85, y: wh * 0.03, z: 0.1, rotationZ: 0.01, force3D: true, scale: 1.001, cursor: "pointer", display: "block" },
        });
    });
    state = "worldMode";
}

function storyMode(e) {
    let id = (typeof e === "string" || e === undefined) ? e : e.currentTarget.id.replace("story", "story-content");
    $aboutlink.show();
    $stories.fadeOut(function() {
        TweenMax.to($world, 0.8, {
            css: { y: wh * 0.3 - 35, cursor: "pointer" },
            onComplete: function() { $("#" + id).fadeIn(); }
        });
        TweenMax.to($god, 0.8, {
            css: { x: ww * 0.87, y: wh * 0.02, z: 0.1, rotationZ: 0.01, force3D: true, scale: 0.5001, cursor: "pointer" },
        });
    });
    $god.removeClass("clickhint");
    $storylink.removeClass("clickhint");
    state = "storyMode";
}

function reset() {
    state = "";
    simulation.pause();
    $aboutlink.fadeOut();
    $storycontent.fadeOut();
    $stories.fadeOut();
    $insights.fadeOut();
    TweenMax.to($world, 0.8, {
        css: { y: wh * 0.3 }
    });
    TweenMax.to($god, 0.8, {
        css: { x: ww / 2, y: -wh * 0.3, scale: 1 },
        onComplete: function() { $intro.fadeIn(); }
    });
}

function listeners() {
    $god.click(godMode);
    $world.click(worldMode);
    $storylink.click(storyMode);
    $aboutlink.click(reset);
    $("#branding").click(worldMode);
    $("#start").click(function(e) {
        $intro.fadeOut(function() {
            $aboutlink.fadeIn();
            worldMode();
            // reset intro screens
            introIndex = -1;
            showScreen(e);
        });
    });
    $("#prev").click(showScreen);
    $("#next").click(showScreen);
    $("#venmo-settings-link").click(venmoSettingsSteps);
    $("#venmo-settings-close").click(venmoSettingsSteps);
    $insights.scroll(function(e) {
        if (e.currentTarget.scrollTop === 0) {
            $god.fadeIn();
        } else {
            $god.fadeOut();
        }
    });
    $(".backstory").click(worldMode);
    window.addEventListener("hashchange", function() {
        if (window.location.hash === "#venmo") {
            TweenMax.set($venmoSettings, { y: -wh });
        } else {
            TweenMax.set($venmoSettings, { y: wh * 0.2 });
        }
    });
    let doit;
    $(window).resize(function() {
        ww = window.innerWidth;
        wh = window.innerHeight;
        clearTimeout(doit);
        doit = setTimeout(function() {
            if (state === "worldMode") { worldMode(); } else if (state === "godMode") { godMode(); } else if (state === "storyMode") { storyMode(); } else {};
        }, 50);
    });
}

function initVars() {
    ww = window.innerWidth;
    wh = window.innerHeight;
    TweenMax.defaultEase = Power2.easeOut;
    $world = $("#world");
    // origin bottom left
    TweenMax.set($world, { y: wh * 0.3, display: "block" });
    $god = $("#god");
    // origin top left
    TweenMax.set($god, { x: ww / 2, y: -wh * 0.3, display: "block" });
    $insights = $("#insights");
    $stories = $("#stories");
    $storylink = $(".story-link");
    $storycontent = $(".story-content");
    $aboutlink = $("#about-link");
    $intro = $("#intro");
    $introscreens = $("#intro-screens");
    $venmoSettings = $("#venmo-settings");
}

function showScreen(e) {
    let add = e.target.id === "prev" ? -1 : 1,
        p = $("#prev"),
        n = $("#next"),
        s = $("#start");
    introIndex = introIndex + add;
    switch (introIndex) {
        case 0:
            // TweenMax.to($introscreens, 0.3, { "left": "0" });
            TweenMax.to($introscreens, 0.3, { x: 0 });
            p.hide();
            n.fadeIn();
            s.hide();
            break;
        case 1:
            // TweenMax.to($introscreens, 0.3, { "left": "-100vw" });
            TweenMax.to($introscreens, 0.3, { x: -ww });
            p.fadeIn();
            n.fadeIn();
            s.hide();
            break;
        case 2:
            // TweenMax.to($introscreens, 0.3, { "left": "-200vw" });
            TweenMax.to($introscreens, 0.3, { x : -2 * ww });
            var $span = $introscreens.find(".emph span");
            TweenMax.to($span, 0.5, {scale: 1.2, delay: 0.5});
            TweenMax.to($span, 0.5, {scale: 1, delay: 1});
            n.hide();
            s.fadeIn();
            break;
    }
}

function venmoSettingsSteps(e) {
    e.preventDefault();
    if (e.target.id === "venmo-settings-link") {
        TweenMax.to($venmoSettings, 0.2, {
            css: { y: -wh, display: "block" },
            onComplete: function() {
                window.location.hash = "#venmo";
            }
        });
    } else {
        TweenMax.to($venmoSettings, 0.2, {
            css: { y: wh * 0.2 },
            onComplete: function() {
                window.location.hash = "";
                history.replaceState(null, null, ' ');
            }
        });
    }
}

document.addEventListener('readystatechange', event => {
    if (event.target.readyState === "interactive") {
        initVars();
        listeners();

        // populate the data
        d3_brush.setup("story-content1", story1);
        d3_packed.setup("story-content4", story4);
        simulation.setup("story-content2", story2);
        chat.setup("story-content3", [sadlove, happylove]);
        d3_timeline.setup("story-content5", story5, "Groceries");
        d3_timeline.setup("story-content5", story5, "Loan");

    } else if (event.target.readyState === "complete") {
        console.log("-----------------", "Auf die Plätze, fertig, los!", document.readyState, new Date());
        // if (window.location.hash === "#venmo") {
        //     TweenMax.set($venmoSettings, { y: -wh, display: "block" });
        //     $intro.delay(10).show();
        // } else {
        //     $intro.fadeIn(10);
        // }

        storyMode("story-content5");

        $("#loading img").delay(1000).fadeOut(function() {
            $("#next").fadeIn();
        });
    }
});