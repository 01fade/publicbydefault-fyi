module.exports = {
    addElems: function(parent, arr, female, male) {
        for (var i = 0; i < arr.length; i++) {
            const actor = arr[i].actor.firstname;
            const target = arr[i].transactions[0].target.firstname;
            const order = arr[i].type === "payment" ? [actor, target] : [target, actor];
            const paymentText = order[0] + " paid " + order[1];
            const time = moment.utc(arr[i].created_time).utcOffset(-5).format("MMMM DD, hh:mm a");
            const floatClass = order[0].toLowerCase() === female ? "female" : "male";

            let $commentsDiv = $("<div>", { "dataid": i, class: floatClass + " comments" }).css("display", "none");
            for (var j = 0; j < arr[i].comments.length; j++) {
                const current = arr[i].comments[j];
                const cTime = moment.utc(current.created_time).utcOffset(-5);
                let cTimeF = cTime.format("hh:mm a");
                const index = j > 0 ? (j - 1) : 0;
                const prevD = moment.utc(arr[i].comments[index].created_time).utcOffset(-5).dayOfYear();
                if (j === 0 || prevD != cTime.dayOfYear()) {
                    $commentsDiv.append($("<p>", { class: "day" }).text(cTime.format("MMMM DD")));
                }
                const commentClass = current.actor.firstname.toLowerCase() === female ? "female" : "male";
                $commentsDiv.append($("<div>", { class: commentClass + " comment" })
                    .append($("<p>").text(current.message))
                    .append($("<p>", { class: "commentdate" }).text(cTimeF))
                );
            }
            const $content = $("<div>", { class: floatClass + " payment" })
                .append($("<h3>").text('"' + arr[i].message + '"'))
                .append($("<p>", { class: "whopaid" }).text(paymentText))
                .append($("<p>", { class: "date" }).text(time))
                .append($("<p>", { "dataid": i, class: "commentcount" }).text(arr[i].comments.length + " comments"))
                .append($("<img>", { src: "media/" + order[0].toLowerCase() + ".png" }));
            parent.append($("<div>").append($content));
            if (arr[i].comments.length > 0) {
                $commentsDiv.append($("<button>", { "dataid": i, class: "small" }).text("close comments"));
                parent.append($commentsDiv);
            }
        }
    },
    setup: function(id, data) {
        console.log("show", id);
        const sad = _.sortBy(data[0], function(o) { return moment.utc(o.created_time).unix() });
        const happy = _.sortBy(data[1], function(o) { return moment.utc(o.created_time).unix() });
        // console.log(sad, happy);
        const $sadDiv = $("#sad-love");
        this.addElems($sadDiv, sad, "susana", "gonzalo");
        $sadDiv.find(".commentcount").click(function(e) {
            var id = e.currentTarget.attributes["dataid"].value;
            $sadDiv.find(".comments[dataid='" + id + "']").fadeIn(1000);
        });
        $sadDiv.find("button").click(function(e){
            var id = e.currentTarget.attributes["dataid"].value;
            $sadDiv.find(".comments[dataid='" + id + "']").fadeOut(700);
        })

        const $happyDiv = $("#happy-love");
        this.addElems($happyDiv, happy, "breezy", "pedro");
        $happyDiv.find(".commentcount").click(function(e) {
            var id = e.currentTarget.attributes["dataid"].value;
            $happyDiv.find(".comments[dataid='" + id + "']").fadeIn(1000);
        });
        $happyDiv.find("button").click(function(e){
            var id = e.currentTarget.attributes["dataid"].value;
            $happyDiv.find(".comments[dataid='" + id + "']").fadeOut(700);
        })
    }
}