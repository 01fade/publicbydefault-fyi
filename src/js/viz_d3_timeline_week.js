// Credits
// http://www.d3noob.org/2014/07/my-favourite-tooltip-method-for-line.html

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
        // console.log("%cshow timeline week " + div, 'color: #00f');
        var container = $("#" + div);
        origData = _.filter(origData, { tag: filter });
        var newData = _.map(origData, function(element) {
            return _.extend({}, element, self.transformData(element));
        });
        this.createSvg(container, filter.toLowerCase(), newData);
    },
    createSvg: function(container, id, data) {
        var w = window.innerWidth,
            h = 300;

        var svgparent = $("#" + id + ".timeline");
        var svg = d3.select("#" + id).append("svg").attr("id", "timeline-" + id),
            margin = { top: 0, right: 0, bottom: 50, left: 0 },
            xAxisRoom = 0,
            width = w - margin.left - margin.right,
            height = h - margin.top - margin.bottom - xAxisRoom;

        container.find("#timeline-" + id).height(h).width(w);

        var x, y, xAxis, yAxis, xAxisEl;
        var bisectDate = d3.bisector(d => d.date).left;
        var parseD = d3.timeParse("%Y-%m-%d");
        var xStart = parseD("2016-12-20");
        var xEnd = parseD("2018-01-11");

        var clipPath = svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect");

        y = d3.scaleLinear().range([height, 0]);

        yAxis = d3.axisRight(y).tickValues([0, 1, 2, 3, 4, 5, 6]).tickSizeOuter(0).tickFormat(function(d, i) { return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i] });

        y.domain([7, -1]); // just neeaded 6-0, but elements will be cut off

        var focus = svg.append("g").attr("class", "focus");

        focus.append("rect")
            .attr("class", "axisbg")
            .attr("width", 30)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + (margin.top - 0) + ")");

        if (id === "loan") {
            // help line for y axis
            focus.append("rect").attr("class", "highlight high1");
        } else if (id === "groceries") {
            focus.append("rect").attr("class", "highlight high2");
            focus.append("rect").attr("class", "highlight high3");
        }

        var rects = focus.append("g");

        xAxisEl = focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (height + xAxisRoom) + ")"); // a little room at the bottom

        // ticks text
        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        var tooltip = svg.append("g")
            .style("display", "none");

        tooltip.append("rect")
            .attr("class", "y")
            .style("fill", "none")
            .style("stroke", "black")
            .style("opacity", 0.7)
            .attr("width", 8)
            .attr("height", 8);

        svgparent.prepend($("<div>", { class: "tooltip message" }).css("opacity", 0).append($("<p>").text("'")));

        // rectangle to capture mouse
        var mouseTracker = svg.append("rect")
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function() {
                tooltip.style("display", null);
                svgparent.find(".message").css("opacity", 1);
            })
            .on("mouseout", function() {
                tooltip.style("display", "none");
                svgparent.find(".message").css("opacity", 0);
            })
            .on("mousemove", mousemove);

        /////////////////////////////////////////////

        function update() {
            container.find("#timeline-" + id).width(w);
            width = w - margin.left - margin.right;

            clipPath.attr("width", width).attr("height", height);

            x = d3.scaleTime().range([0, width]);
            xAxis = d3.axisBottom(x).tickSizeOuter(0).tickFormat(function(date) {
                if (d3.timeYear(date) < date) {
                    return d3.timeFormat('%b')(date);
                } else {
                    return "'" + d3.timeFormat('%y')(date);
                }
            });
            x.domain([xStart, xEnd]);
            xAxisEl.call(xAxis);

            focus.select(".axis--y")
                .selectAll("text")
                .attr("dx", function() { return w > 600 ? 8 : -2 });

            focus.select(".axis--y")
                .selectAll("line")
                .attr("x2", function() { return w > 600 ? 8 : 3 });

            focus.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            rects.attr("clip-path", "url(#clip)");

            if (id === "loan") {
                focus.select(".high1")
                    .attr("x", x(xStart))
                    .attr("width", x(xEnd))
                    .attr("y", y(2.5))
                    .attr("height", y(2)) // 3 units
            } else if (id === "groceries") {
                focus.select(".high2")
                    .attr("x", x(xStart))
                    .attr("width", x(xEnd))
                    .attr("y", y(0.5))
                    .attr("height", y(0)) // 1 unit

                focus.select(".high3")
                    .attr("x", x(xStart))
                    .attr("width", x(xEnd))
                    .attr("y", y(2.5))
                    .attr("height", y(1))
            }

            showNewElems(data);

            mouseTracker.attr("width", width).attr("height", height);
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

        function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(data, x0, 1),
                d0 = data[i - 1],
                d1 = data[i];

            if (d0 && d1) {
                var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                tooltip.select("rect.y")
                    .attr("transform", "translate(" + (x(d.date) - 4) + "," + (y(d.weekday) - 4) + ")");

                var msg = d.message.replace("\\n", " ");
                svgparent.find(".message p").html(window.emoji.replace_unified(msg));

                // var offset = 12;
                // tooltip.select("text")
                //     .text(d.message)
                //     .attr('x', x(d.date) < width / 2 ? offset : -offset)
                //     .style("text-anchor", x(d.date) < width / 2 ? "start" : "end")
                //     .attr("transform", x(d.date) < width / 2 ? "translate(" + (x(d.date) + 4) + "," + (y(d.weekday) - 4) + ")" : "translate(" + (x(d.date) - 8) + "," + (y(d.weekday) - 4) + ")");

                // var bb;
                // tooltip.select("text").each(function() { bb = this.getBBox(); });
                // var bw = bb.width + 16,
                //     bh = bb.height + 6;

                // var translate = x(d.date) < width / 2 ? "translate(" + (x(d.date) + 8) + "," + (y(d.weekday) - bh / 2) + ")" : "translate(" + (x(d.date) - offset - bw) + "," + (y(d.weekday) - bh / 2) + ")";
                // tooltip.select("rect.tooltipbg")
                //     .attr("transform", translate)
                //     .attr("width", bw)
                //     .attr("height", bh);
            }
        }

        function getCat(f, type) {
            if (f.tag.toLowerCase() === "loan") {
                return f.type === "payment" ? type + " cat1" : type + " cat2";
            } else if (f.tag.toLowerCase() === "groceries") {
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
                    console.error("error", f.message);
                }
            } else {
                return "";
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
            // EXIT
            dataJoin.exit().remove();

        }

    }
}