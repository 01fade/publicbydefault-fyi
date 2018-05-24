var state = "worldMode";
var $world, $god, $insights, $stories, $storylink, $showstory;
var d3_story = require('./d3_story.js');

function godMode() {
    $showstory.fadeOut(function() {
        $("#show-story svg").empty();
    });
    $stories.fadeOut(function() {
        var gh = window.innerWidth * 18 / window.innerHeight; // god height in vh
        var top = (100 - Math.ceil(gh) - 1) + "vh"; // window height - god height
        var right = (50 - 24 / 2) + "vw"; // center - half of god width
        TweenLite.to($god, 1, {
            css: { top: top, right: right, cursor: "inherit", width: "24vw", height: "18vw" },
            ease: Power1.easeOut,
            onComplete: function() {
                $insights.fadeIn();
            }
        });
        TweenLite.to($world, 1, {
            css: { top: "10vh", width: "25vw", height: "25vw", cursor: "pointer" },
            ease: Power1.easeOut
        });
    });
    state = "godMode";
}

function worldMode() {
    $showstory.fadeOut(function() {
        $("#show-story svg").empty();
    });
    $insights.fadeOut(function() {
        TweenLite.to($world, 1, {
            css: { top: "35vh", width: "90vw", height: "90vw", cursor: "inherit" },
            ease: Power1.easeOut,
            onComplete: function() {
                $stories.fadeIn();
            }
        });
        TweenLite.to($god, 1, {
            css: { top: "50px", right: "80px", margin: "0", cursor: "pointer", width: "16vw", height: "12vw" },
            ease: Power1.easeOut
        });
    });
    state = "worldMode";
}

function storyMode(e) {
    var id = e.currentTarget.id;
    d3_story.setup(id);
    $stories.fadeOut(function() {
        TweenLite.to($world, 1, {
            css: { top: "92vh", width: "90vw", height: "90vw", cursor: "pointer" },
            ease: Power1.easeOut,
            onComplete: function() {
                $showstory.fadeIn();
            }
        });
        TweenLite.to($god, 1, {
            css: { top: "30px", right: "30px", margin: "0", cursor: "pointer", width: "64px", height: "48px" },
            ease: Power1.easeOut
        });
    });
    state = "storyMode";
}

function listeners() {
    $god.click(godMode);
    $world.click(worldMode);
    $storylink.click(storyMode);
    $("#branding").click(worldMode);
}


$(document).ready(function() {
    $world = $("#world");
    $god = $("#god");
    $insights = $("#insights");
    $stories = $("#stories");
    $storylink = $(".story");
    $showstory = $("#show-story");
    // console.log(_.meanBy(Data, 'items'));
    worldMode();
    listeners();
});