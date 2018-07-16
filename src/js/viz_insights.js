import lastnames from "../data/users_lastnames.json";
import registered from "../data/users_registered.json";
import docs_byhour from "../data/docs_byhour.json";
import pizza_month from "../data/pizza_month.json";
import rent_perday from "../data/rent_perday.json";
import airbnb from "../data/airbnb.json";
import decwe from "../data/decwe.json";

module.exports = {
    setup: function(container) {
        this.barChartHor(container, "lastnames", _.reverse(lastnames.slice(0, 50)), [20000, 40000, 60000, 80000, 100000], true, ".1s");
        this.crowds(container, "registered", registered);

        const perhour = _.map(docs_byhour, o => { o.count = o.count / 365; return o; });
        this.barChartHor(container, "activity", _.reverse(perhour), [10000, 20000, 30000, 40000], false, ".2s");

        this.barChartVer(container, "pizza", pizza_month.count_month, "🍕", [100000, 200000, 300000], false, ".3s");
        this.barChartVer(container, "rent", rent_perday.count_day, "🏠💸", [200000, 300000, 400000], false, ".3s");

        this.list(container, "airbnb", airbnb);
        this.list(container, "decwe", decwe);
    },
    barChartHor: function(container, id, data, tickArr, secondX, tickform) {
        var w = window.innerWidth,
            h = data.length * 20;

        container.find("#" + id + " svg").height(h).width(w);

        var svg = d3.select("#" + id + " svg"),
            margin = { top: 50, right: w > 600 ? w / 10 : 2, bottom: 30, left: 0 };

        var y, x;

        var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var xAxis = g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + 0 + ")");

        if (secondX) {
            var xAxis2 = g.append("g")
                .attr("class", "axis axis--x");
        }

        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar");

        g.selectAll(".label")
            .data(data)
            .enter().append("text")
            .attr("class", "label");


        function update() {
            container.find("#" + id + " svg").width(w);
            margin.right = 100;
            var width = w - margin.left - margin.right,
                height = h - margin.top - margin.bottom;

            y = d3.scaleBand().rangeRound([height, 0]).padding(0.1);
            x = d3.scaleLinear().rangeRound([0, width]);

            y.domain(data.map(function(d) { return d._id; }));
            x.domain([0, d3.max(data, function(d) { return d.count; })]);

            xAxis.call(d3.axisTop(x).tickValues(tickArr).tickFormat(d3.format(tickform)));

            if (secondX) {
                xAxis2
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x).tickValues(tickArr).tickFormat(d3.format(tickform)));
            }

            g.selectAll(".bar")
                .attr("y", function(d) { return y(d._id); })
                .attr("x", x(0))
                .attr("height", y.bandwidth())
                .attr("width", function(d) { return x(d.count); });

            g.selectAll(".label")
                .text(function(d) { return d._id; })
                .attr("x", function(d) { return x(d.count); })
                .attr("dy", "0.9em")
                .style("text-anchor", "start")
                .attr("dx", "0.5em")
                .attr("y", function(d) { return y(d._id); });

        }

        update();

        var resizeCheck;
        $(window).resize(function() {
            clearTimeout(resizeCheck);
            resizeCheck = setTimeout(function() {
                w = window.innerWidth,
                    update();
            }, 80);
        });
    },
    barChartVer: function(container, id, data, label, tickArr, secondX, tickform) {
        var w = Math.min(window.innerWidth, 700),
            h = 300;
        container.find("#" + id + " svg").height(h).width(w);

        var svg = d3.select("#" + id + " svg"),
            margin = { top: 50, right: 20, bottom: 30, left: 50 };

        var g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x, y;
        var xAxis = g.append("g").attr("class", "axis axis--x");
        var yAxis = g.append("g").attr("class", "axis axis--y");

        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar");

        g.selectAll(".label")
            .data(data)
            .enter().append("text")
            .attr("class", "label");

        function update() {
            container.find("#" + id + " svg").width(w);
            var width = w - margin.left - margin.right,
                height = h - margin.top - margin.bottom;

            x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
            y = d3.scaleLinear().rangeRound([height, 0]);

            x.domain(data.map(function(d) { return d._id; }));
            y.domain([0, d3.max(data, function(d) { return d.count; })]);

            xAxis.attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            yAxis.call(d3.axisLeft(y).tickValues(tickArr).tickFormat(d3.format(tickform)));

            g.selectAll(".bar")
                .attr("x", function(d) { return x(d._id); })
                .attr("y", function(d) { return y(d.count); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return height - y(d.count); });

            g.selectAll(".label")
                .text(label)
                .attr("x", function(d) { return x(d._id); })
                .attr("dx", x.bandwidth() / 2)
                .attr("y", function(d) { return y(d.count); })
                .attr("dy", "0.5em");
        }

        update();

        var resizeCheck;
        $(window).resize(function() {
            clearTimeout(resizeCheck);
            resizeCheck = setTimeout(function() {
                w = Math.min(window.innerWidth, 700);
                update();
            }, 80);
        });

    },
    crowds: function(container, id, data) {
        var div = container.find("#" + id);
        var users = _.map(data, o => Math.round(o.count / _.maxBy(data, "count").count * 100));
        var out = _.map(data, o => Math.round(o.out / _.maxBy(data, "out").out * 100));

        var $ul = $("<ul>");
        for (var i = 0; i < data.length; i++) {
            var people = $("<div>", { class: "users" });
            for (var j = 0; j < users[i]; j++) {
                people.append($("<div>", { class: "user-box" })
                    .append($("<p>", { class: "user user" + Math.floor(Math.random()*10) }))
                    )
            }
            var money = $("<div>", { class: "transactions" });
            for (var h = 0; h < out[i]; h++) {
                money.append($("<div>", { class: "money-box" })
                    .append($("<p>", { class: "money" }))
                    )
            }

            $ul.append($("<li>")
                .append($("<div>", { class: "year" }).text(data[i]._id))
                .append($("<div>")
                    .append(people)
                    .append(money)
                )
            )
        }

        div.append($ul);
    },
    list: function(container, id, data) {
        var div = container.find("#" + id);
        for (var i = 0; i < data.length; i++) {
            div.append($("<li>").html(window.emoji.replace_unified(data[i].text)))
        }
    }
}