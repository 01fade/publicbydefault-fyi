module.exports = {
    transformData: function(d) {
        var localT = moment.utc(d.created_time).utcOffset(-7);
        var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S");
        var date = parseDate(localT.format("YYYY-MM-DDTHH:mm:ss"));
        var hour = localT.hours() + localT.minutes() / 60;
        var weekday = moment(date).day();
        weekday = weekday === 0 ? 6 : weekday - 1;
        return { date: date, hour: hour, weekday: weekday };
    },
    setup: function(div, origData, filter) {
        var self = this;
        console.log("show", div);
        var container = $("#" + div);
        if (filter) {
            origData = _.filter(origData, { tag: filter });
        }
        var newData = _.map(origData, function(element) {
            return _.extend({}, element, self.transformData(element));
        });
        this.createSvg(container, filter.toLowerCase(), newData);
    },
    createSvg: function(container, id, data) {

        var w = window.innerWidth,
            h = 300;

        var svg = d3.select("#" + id).append("svg").attr("id", "timeline-" + id),
            margin = { top: 0, right: 0, bottom: 50, left: 0 },
            xAxisRoom = 0,
            width = w - margin.left - margin.right,
            height = h - margin.top - margin.bottom - xAxisRoom;

        container.find("#timeline-" + id).height(h).width(w);

        var x = d3.scaleTime().range([0, width]),
            y = d3.scaleLinear().range([height, 0]);

        var xAxis = d3.axisBottom(x).tickSizeOuter(0),
            yAxis = d3.axisRight(y).tickValues([0, 1, 2, 3, 4, 5, 6]).tickSizeOuter(0).tickFormat(function(d, i) { return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i] });

        var parseD = d3.timeParse("%Y-%m-%d");
        var xStart = parseD("2016-12-21");
        var xEnd = parseD("2018-01-10");

        x.domain([xStart, xEnd]);
        y.domain([7, -1]); // just neeaded 6-0, but elements will be cut off

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // y axis background
        focus.append("rect")
            .attr("class", "axisbg")
            .attr("width", 30)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + (margin.top - 0) + ")");

        if (id === "loan") {
            // help line for y axis
            focus.append("rect")
                .attr("class", "highlight")
                .attr("x", x(xStart))
                .attr("width", x(xEnd))
                .attr("y", y(2.5))
                .attr("height", y(2)) // 3 units
        } else {
            focus.append("rect")
                .attr("class", "highlight")
                .attr("x", x(xStart))
                .attr("width", x(xEnd))
                .attr("y", y(0.5))
                .attr("height", y(0)) // 1 unit

            focus.append("rect")
                .attr("class", "highlight")
                .attr("x", x(xStart))
                .attr("width", x(xEnd))
                .attr("y", y(2.5))
                .attr("height", y(1))
        }

        var rects = focus.append("g");
        rects.attr("clip-path", "url(#clip)");

        showNewElems(data);

        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (height + xAxisRoom) + ")") // a little room at the bottom
            .call(xAxis);

        // ticks text
        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis)
            .selectAll("text")
            .attr("dx", 20)

        // ticks line
        focus.select(".axis--y").selectAll("line").attr("x2", 20);

        function getCat(f, type) {
            if (f.tag.toLowerCase() === "loan") {
                return f.type === "payment" ? type + " cat1" : type + " cat2";
            } else {
                if (f.message.toLowerCase().indexOf("walmart") > -1) {
                    return type + " " + "walmart";
                } else if (f.message.toLowerCase().indexOf("albertsons") > -1) {
                    return type + " " + "albertsons";
                } else if (f.message.toLowerCase().indexOf("costco") > -1) {
                    return type + " " + "costco";
                } else if (f.message.toLowerCase().indexOf("walgreens") > -1) {
                    return type + " " + "walgreens";
                } else if (f.message.toLowerCase().indexOf("aldi") > -1) {
                    return type + " " + "aldi";
                } else {
                    console.log("error", f.message);
                }
            }
        }

        function showNewElems(dd) {
            // https://bost.ocks.org/mike/join/
            var dataJoin = rects.selectAll(".group")
                .data(dd);
            // ENTER
            var group = dataJoin.enter().append("g")
                .attr("class", "group");
            // UPDATE
            group.merge(dataJoin)
            // ENTER
            var rect = group.append("rect")
                .attr("class", function(d) { return getCat(d, "rect") })
                .style("opacity", 0.4)
                .merge(dataJoin.select(".rect"))
                .attr("width", 8)
                .attr("height", 8)
                .attr("x", function(d) { return x(d.date) - 4; })
                .attr("y", function(d) { return y(d.weekday) - 4; });

            if (id === "loan") {
                var line = group.append("line")
                    .attr("class", function(d) { return getCat(d, "line") })
                    .style("opacity", 0.3)
                    .merge(dataJoin.select(".line"))
                    .attr("x1", function(d) { return x(d.date); })
                    .attr("y1", y(7))
                    .attr("x2", function(d) { return x(d.date); })
                    .attr("y2", function(d) { return y(d.weekday); });
            }

            // Append text
            group.append("text")
                .attr("class", "msg")
                .attr("dy", "1em")
                .attr("dx", 7)
                .style("font-size", "0.8em")
                .attr("text-anchor", "start")
                .merge(dataJoin.select(".msg"))
                .text(function(d) { return ""; })
                .attr("transform", function(d) {
                    return "translate(" + x(d.date) + "," + y(d.weekday) + ")";
                });
            // EXIT
            dataJoin.exit().remove();

        }

    }
}