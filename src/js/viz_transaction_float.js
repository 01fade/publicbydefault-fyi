module.exports = {
    setup: function(div, origData, classN) {
        // console.log("%cshow transaction float " + div, 'color: #00f');
        var container = $("#" + div);
        var $transactions = $("<div>", {class: "transaction-container"});
        for (var i = 0; i < origData.length; i++) {
            var date = moment.utc(origData[i].created_time).utcOffset(-7),
                time = date.format("hh:mm a"),
                day = date.format("MMM D");
            $transactions.append(
                $("<div>", { class: origData[i].tag.toLowerCase() + " transaction" })
                .append($("<p>", {class: "msg"}).html(window.emoji.replace_unified(origData[i].message)))
                .append($("<p>", {class: "day"}).text(day))
                .append($("<p>", {class: "time"}).text(time))
            )
        }
        container.find("." + classN).prepend($transactions);
    }
}