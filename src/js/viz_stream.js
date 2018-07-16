module.exports = {
    setup: function(div, origData, classN) {
        // console.log("%cshow stream" + div, 'color: #00f');
        var container = $("#" + div);
        var $transactions = $("<div>", { class: "stream-container" });
        var data = _.filter(origData, function(o) {
            return o.tag === "Soft Drinks" || o.tag === "Alcohol" || o.tag === "Sweets" || o.tag === "Fast Food";
        });
        for (var i = 0; i < data.length; i++) {
            var msg = data[i].message.toLowerCase();
            var pairs = [
                ["coke", "🥤"],
                ["soda", "🥤"],
                [":festival_beer:", "🍺"],
                [":rocket_popsicle:", "🍧"],
                [":america_cake:", "🍰"],
                [":candy_cane:", "🍭"],
                ["drinkk", "🍹"],
                ["drink", "🍹"],
                [":candy_corn:", "🌽"],
                ["candy", "🍬"],
                [":festival_grilled_cheese:", "🧀🥪"],
                ["cokkies", "🍪"],
                ["chesse", "🧀"],
                ["pizzas", "🍕"],
                ["para ti", ""],
                ["adrianna", ""],
                ["for", ""],
                ["3 -26", ""],
                ["16", ""],
                ["mextly cookies", ""]
            ];
            for (var j = 0; j < pairs.length; j++) {
                msg = msg.replace(pairs[j][0], pairs[j][1]);
            }

            var tag = data[i].tag.toLowerCase().replace(" ", "-");
            $transactions.append(
                $("<p>", { class: tag + " transaction-el" }).html(window.emoji.replace_unified(msg))
            );
        }
        container.find("." + classN).prepend($transactions);
        this.addListeners($transactions, container);
    },
    addListeners: function(div, container) {
        container.click(function(e) {
            if (e.target.parentElement.className.indexOf("transaction-el") > -1) {
                var filter = "." + e.target.parentElement.className.replace(" transaction-el", "");
                div.find(".transaction-el").css("opacity", 0.3);
                div.find(filter).css("opacity", 1);
            } else {
                div.find(".transaction-el").css("opacity", 1);
            }
        });
    }
}