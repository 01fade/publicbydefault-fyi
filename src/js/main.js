import story1 from "../data/story1.csv";
import story1sales from "../data/story1_sales.csv";
import story2top1 from "../data/story2_top1.csv";
import story4 from "../data/story4.csv";
import story5 from "../data/story5.csv";

import sadlove from "../data/story_putintobank.json";
import happylove from "../data/story_venmodollar.json";

var $world, $god, $sky, $godlink, $insights, $stories, $storylink, $storycontent, $basics, $introlink, $intro, $introscreens, $venmoSettings, $notes, $privacy, $smallstories, $branding;
var ww, wh, resizeCheck,
    introIndex = 0,
    state = "home",
    chat = require('./viz_chat.js'),
    simulation = require('./viz_simulation.js'),
    d3_timeline_week = require('./viz_d3_timeline_week.js'),
    d3_timeline_day = require('./viz_d3_timeline_day.js'),
    transaction_float = require('./viz_transaction_float.js'),
    stream = require('./viz_stream.js'),
    insights = require('./viz_insights.js');

//without this line, CSSPlugin and AttrPlugin may get dropped by your bundler...
var plugins = [CSSPlugin];

//
//
//

function getPopShow() {
    return { top: 0, display: "block" };
}

function getPopHide() {
    return { top: wh * 1.1, display: "none" }
}

function scrollingDivFadeIn(el) {
    el.css("opacity", 0);
    el.show();
    el.scrollTop(0);
    TweenMax.to(el, 0.6, {
        css: { opacity: 1 },
    });
}

//
// animations
//

function godMode(resize) {
    simulation.pause();
    $storycontent.fadeOut();
    $godlink.fadeOut();
    $sky.fadeOut();
    $stories.fadeOut(function() {
        let x = ww / 2 - $god.width() / 2; // center - half god width
        let y = wh * 0.09;
        TweenMax.to($god, 0.6, {
            css: { x: x, y: y, z: -0.1, rotationZ: 0.01, scale: 0.7001, cursor: "inherit" },
            onComplete: function() {
                if (resize != false) {
                    scrollingDivFadeIn($insights);
                }
            }
        });
        TweenMax.to($world, 0.6, {
            css: { y: $world.height() - 25, cursor: "pointer" },
            onComplete: function() {
                $smallstories.fadeIn();
            }
        });
    });
    $god.removeClass("clickhint");
    $storylink.removeClass("clickhint");
    state = "godMode";
    matomoPageView(state);
}


function worldMode(resize) {
    simulation.pause();
    $insights.fadeOut();
    $storycontent.fadeOut();
    $smallstories.fadeOut(function() {
        TweenMax.to($world, 0.6, {
            css: { y: 0, cursor: "inherit" },
            onComplete: function() {
                $sky.fadeIn();
            }
        });
        TweenMax.to($god, 0.6, {
            css: { x: Math.min(ww * 0.5, ww - $god.width() - 10), y: wh * 0.25, z: -0.1, rotationZ: 0.01, scale: 1.001, cursor: "pointer", display: "block" },
            onComplete: function() {
                setTimeout(function() {
                    $godlink.fadeIn();
                    $god.addClass("clickhint");
                    $storylink.addClass("clickhint");
                    $stories.fadeIn();
                }, 100);
            }
        });
    });
    state = "worldMode";
    matomoPageView(state);
}


function storyMode(e, resize) {
    let id = (typeof e === "string" || e === undefined) ? e : e.currentTarget.id.replace("story", "story-content");
    $basics.show();
    $godlink.fadeOut();
    $sky.fadeOut();
    $stories.fadeOut(function() {
        TweenMax.to($world, 0.6, {
            css: { y: $world.height() - 25, cursor: "pointer" },
            onComplete: function() {
                $smallstories.fadeIn();
                if (resize != false) {
                    scrollingDivFadeIn($("#" + id));
                }
            }
        });
        TweenMax.to($god, 0.6, {
            css: { x: Math.min(ww * 0.87, ww - $god.width()), y: 70, z: -0.1, rotationZ: 0.01, scale: 0.5001, cursor: "pointer" },
        });
    });
    $god.removeClass("clickhint");
    $storylink.removeClass("clickhint");
    state = "storyMode";
    matomoPageView(id);
}


function reset() {
    state = "";
    simulation.pause();

    $basics.fadeOut();
    $storycontent.fadeOut();
    $stories.fadeOut();
    $godlink.fadeOut();
    $sky.fadeOut();
    $insights.fadeOut();
    $smallstories.fadeOut();

    introIndex = -1;
    showScreen({ currentTarget: "start" });
    TweenMax.to($world, 0.6, {
        css: { y: $world.height() }
    });
    TweenMax.to($god, 0.6, {
        css: { x: ww / 2, y: -wh * 0.3, scale: 1 },
        onComplete: function() {
            $intro.fadeIn();
        }
    });
}

//
//
//

function matomoPageView(title) {
    _paq.push(['setCustomUrl', '/' + window.location.hash.substr(1)]);
    _paq.push(['setDocumentTitle', title]);
    _paq.push(['trackPageView']);
}

function handleHashChange() {
    console.log("%chash " + window.location.hash, 'color: #00f');
    animatePopup("close", undefined, function() {
        animatePopup(window.location.hash.substr(1));
    })
}

function windowResize() {
    ww = window.innerWidth;
    wh = window.innerHeight;
    clearTimeout(resizeCheck);
    resizeCheck = setTimeout(function() {
        if (state === "worldMode") { worldMode(false); } else if (state === "godMode") { godMode(false); } else if (state === "storyMode") { storyMode(undefined, false); } else {};
    }, 80);
    innerHeightDynamic();
}

function innerHeightDynamic() {
    // fix because sometimes vh != window.innerHeight
    $intro.css("height", wh + "px");
    $insights.css("height", wh + "px");
    $storycontent.css("height", wh + "px");
    $(".popup").css("height", wh + "px");
    if (wh < 600) {
        $intro.find(".example").css("height", "185px");
    } else if (wh < 640) {
        $intro.find(".example").css("height", "225px");
    } else {
        $intro.find(".example").css("height", "auto");
    }
}

function showScreen(e) {
    let add = e.currentTarget.id === "prev" ? -1 : 1,
        p = $("#prev"),
        n = $("#next"),
        s = $("#start");
    introIndex = introIndex + add;
    TweenMax.to($introscreens, 0.3, { "left": introIndex * -100 + "vw" });
    $("#progress").css("width", (introIndex + 1) / 4 * 100 + "%");
    switch (introIndex) {
        case 0:
            $branding.fadeOut();
            p.hide();
            n.fadeIn();
            s.hide();
            break;
        case 1:
            $branding.fadeIn();
            p.fadeIn();
            n.fadeIn();
            break;
        case 2:
            n.fadeIn();
            s.hide();
            break;
        case 3:
            var $span = $introscreens.find(".emph span");
            TweenMax.to($span, 0.5, { scale: 1.2, delay: 0.5 });
            TweenMax.to($span, 0.5, { scale: 1, delay: 1 });
            n.hide();
            s.fadeIn();
            break;
    }
}

function animatePopup(e, t, callback) {
    if (e.target) {
        e.preventDefault();
        var target = e.target.id;
    } else {
        var target = e;
    }
    var time = t === undefined ? 0.2 : t;
    var close = target.indexOf("close") > -1 ? true : false;
    if (target.indexOf("venmo") > -1) {
        var hashT = "venmo";
        var div = $venmoSettings;
    } else if (target.indexOf("notes") > -1 || target.indexOf("about") > -1) {
        var hashT = "about";
        var div = $notes;
    } else if (target.indexOf("privacy") > -1) {
        var hashT = "privacy";
        var div = $privacy;
    }
    if (close) {
        div.removeClass("visible").addClass("hidden");
        div.find(".container").scrollTop(0);
        TweenMax.to(div, time, {
            css: getPopHide(),
            onComplete: function() {
                window.location.hash = "";
                history.pushState(null, null, ' ');
                matomoPageView(state);
                if (callback) { callback(); };
            }
        });
    } else if (div) {
        TweenMax.to(div, time, {
            css: getPopShow(),
            onComplete: function() {
                div.removeClass("hidden").addClass("visible");
                window.location.hash = hashT;
                matomoPageView(hashT);
                if (callback) { callback(); };
            }
        });
    }
}

function hideGod(e) {
    if (e.currentTarget.scrollTop === 0) { $god.fadeIn(); } else { $god.fadeOut(); }
}

function replaceEmoji() {
    window.emoji.img_sets.apple.path = '../media/img-apple-64/';
    window.emoji.use_sheet = false;
    window.emoji.include_title = true;
    window.emoji.replace_mode = 'img';
    window.emoji.supports_css = false;
    window.emoji.init_env();
}

//
//
//


function listeners() {
    $god.click(godMode);
    $world.click(worldMode);
    $storylink.click(storyMode);
    $introlink.click(reset);
    $branding.click(worldMode);
    $("#start").click(function(e) {
        $intro.fadeOut(function() {
            worldMode();
            $basics.fadeIn();
        });
    });
    $("#prev").click(showScreen);
    $("#next").click(showScreen);
    $(".venmo-settings-link").click(animatePopup);
    $("#venmo-settings-close").click(animatePopup);

    $("#menu-notes-link").click(animatePopup);
    $("#project-notes-close").click(animatePopup);

    $("#privacy-link").click(animatePopup);
    $("#privacy-close").click(animatePopup);

    $insights.scroll(hideGod);
    $storycontent.scroll(hideGod);
    $(".backstory").click(worldMode);

    var menuopen = false;
    $("#menu-link").click(function(e) {
        if (menuopen) {
            $(this).find(".menu").hide();
            menuopen = false;
        } else {
            $(this).find(".menu").show();
            menuopen = true;
        }
    });

    window.addEventListener("hashchange", handleHashChange);
    $(window).resize(windowResize);
}

function initVars() {
    ww = window.innerWidth;
    wh = window.innerHeight;
    CSSPlugin.defaultForce3D = true;
    TweenMax.defaultEase = Power2.easeOut;
    $world = $("#world");
    TweenMax.to($world, 0, { y: $world.height(), display: "block" }); // origin bottom left
    $god = $("#god");
    TweenMax.to($god, 0, { x: ww / 2, y: -wh * 0.3, display: "block" }); // origin top left
    $sky = $("#sky");
    $godlink = $god.find(".god-link");
    $insights = $("#insights");
    $stories = $("#stories");
    $storylink = $(".story-link-container");
    $storycontent = $(".story-content");
    $basics = $("#basics");
    $introlink = $("#intro-link");
    $intro = $("#intro");
    $introscreens = $("#intro-screens");
    TweenMax.to($introscreens, 0, { left: "0vw" });
    $venmoSettings = $("#venmo-settings");
    $notes = $("#project-notes");
    $privacy = $("#privacy");
    TweenMax.to(".popup", 0, getPopHide()); // setting first helps for smooth animations
    $smallstories = $("#small-stories");
    $branding = $("#branding");

    innerHeightDynamic();
}

document.addEventListener('readystatechange', event => {
    if (event.target.readyState === "interactive") {
        initVars();
        listeners();
        replaceEmoji();

        // create visualizations
        d3_timeline_day.setup("story-content1", story1, "17682208", "Drugs");
        transaction_float.setup("story-content1", story1sales, "float");
        simulation.setup("story-content2", story2top1);
        chat.setup("story-content3", [sadlove, happylove]);
        stream.setup("story-content4", story4, "stream");
        d3_timeline_week.setup("story-content5", story5, "Groceries");
        d3_timeline_week.setup("story-content5", story5, "Loan");

        insights.setup($insights);

    } else if (event.target.readyState === "complete") {
        console.log("%c--- Auf die Plätze, fertig, los! " + new Date(), 'color: #00f');

        // DEV
        // storyMode("story-content3");
        // godMode();

        $("#loading").delay(700).fadeOut(function() {
            $branding.hide();
            if (window.location.hash.length > 0) {
                setTimeout(function() {
                    animatePopup(window.location.hash.substr(1), 0.1);
                    $intro.delay(100).show();
                }, 300)
            } else {
                $intro.delay(200).fadeIn(10);
            }
        });
    }
});