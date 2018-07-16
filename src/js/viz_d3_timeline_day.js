// Credits
// http://www.d3noob.org/2014/07/my-favourite-tooltip-method-for-line.html

module.exports = {
    transformData: function(d) {
        var localT = moment.utc(d.created_time).utcOffset(-7);
        var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S");
        var date = parseDate(localT.format("YYYY-MM-DDTHH:mm:ss"));
        var hour = localT.hours() + localT.minutes() / 60;
        return { date: date, hour: hour };
    },
    setup: function(div, origData, person, filter) {
        var self = this;
        // console.log("%cshow timeline day " + div, 'color: #00f');
        var container = $("#" + div);
        var origData = _.map(origData, function(element) {
            return _.extend({}, element, self.transformData(element));
        });

        var fcontainer = container.find(".filter"),
            filterArr = _.chain(origData).countBy('tag').map((count, tag) => ({ tag, count })).sortBy("count").reverse().value(),
            otherI = _.findIndex(filterArr, { tag: "Other" }),
            other = filterArr[otherI];
        filterArr.splice(otherI, 1);
        filterArr.push(other);

        for (var i = 0; i < filterArr.length; i++) {
            fcontainer.append($("<button>", { id: filterArr[i].tag, class: "small" }).text(filterArr[i].tag));
            fcontainer.find("#" + filterArr[0].tag).addClass("active");
        }

        var fData = _.filter(origData, { tag: filterArr[0].tag });
        this.createSvg(container, filter.toLowerCase(), fData, origData, person);
    },
    createSvg: function(container, id, data, oData, person) {
        var w = window.innerWidth,
            h = 300;

        var svgparent = $("#" + id + ".timeline");
        var svg = d3.select("#" + id).append("svg").attr("id", "timeline-" + id),
            margin = { top: 10, right: 0, bottom: 30, left: 0 },
            xAxisRoom = 0,
            height = h - margin.top - margin.bottom - xAxisRoom,
            width = w - margin.left - margin.right,
            thisTimeline = container.find("#timeline-" + id);

        thisTimeline.height(h).width(w);

        var x, y, xAxis, yAxis, xAxisEl;
        var bisectDate = d3.bisector(d => d.date).left;
        var parseD = d3.timeParse("%Y-%m-%d");
        var xStart = parseD("2016-12-20");
        var xEnd = parseD("2018-01-11");

        var clipPath = svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect");

        var focus = svg.append("g").attr("class", "focus");

        focus.append("rect")
            .attr("class", "axisbg")
            .attr("width", 30)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + 0 + ")");

        var rects = focus.append("g");

        var xAxisEl = focus.append("g")
            .attr("class", "axis axis--x");

        y = d3.scaleLinear().range([height, 0]);

        yAxis = d3.axisRight(y)
            .tickSizeOuter(0)
            .tickValues([0, 12, 18, 24])
            .tickFormat(function(d, i) { return ["Time of Day", "12pm", "6pm", "12am"][i] });

        y.domain([25, -1]);

        // ticks text
        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis)
            .selectAll("text")
            .style("text-anchor", function(d) { return d === 0 ? "end" : "start" })
            .style("opacity", function(d) { return d === 0 ? 0.5 : 1 })
            .attr("dx", function(d) { return d === 0 ? "-1.5em" : "-0.2em" })
            .attr("dy", "2em")
            .attr("transform", "rotate(-90)");

        // ticks line
        focus.select(".axis--y").selectAll("line").attr("x2", 20);

        // tooltip
        svgparent.prepend($("<div>", {class: "tooltip message"}).css("opacity", 0).append($("<p>").text("'")));

        var tooltip = svg.append("g")
            .attr("transform", "translate(0, " + margin.top + ")")
            .style("display", "none");

        tooltip.append("rect").attr("class", "y")
            .style("fill", "none")
            .style("stroke", "black")
            .style("opacity", 0.8)
            .attr("width", 8)
            .attr("height", 8);

        // rectangle to capture mouse
        var mouseTracker = svg.append("rect")
            .attr("transform", "translate(0, " + margin.top + ")")
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
            thisTimeline.width(w);
            width = w - margin.left - margin.right;

            clipPath.attr("width", width).attr("height", height);

            x = d3.scaleTime().range([0, width]);
            xAxis = d3.axisBottom(x)
                .tickSizeOuter(0)
                .ticks(3)
                .tickFormat(function(date) {
                    if (d3.timeYear(date) < date) {
                        return d3.timeFormat('%b')(date);
                    } else {
                        return "'" + d3.timeFormat('%y')(date);
                    }
                });
            x.domain([xStart, xEnd]);

            xAxisEl.attr("transform", "translate(0," + (height + xAxisRoom) + ")") // a little room at the bottom
                .call(xAxis);

            focus.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            rects.attr("clip-path", "url(#clip)");

            showNewElems(data);

            mouseTracker.attr("width", width).attr("height", height);

            // update elements with filter
            container.find(".filter button").click(function(e) {
                $(this).siblings().removeClass("active");
                $(this).addClass("active");
                data = _.filter(oData, { tag: e.currentTarget.id });
                showNewElems(data);
            });
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
                    .attr("transform", "translate(" + (x(d.date) - 4) + "," + (y(d.hour) - 4) + ")");

                var msg = d.message.replace("\\n", " ");
                svgparent.find(".message p").html(window.emoji.replace_unified(msg));
            }
        }

        function getCat(f, type) {
            person = parseInt(person);
            return (f.actor === person && f.type === "payment" || f.target === person && f.type === "charge") ? type + " cat1" : type + " cat2";
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
                .attr("y", function(d) { return y(d.hour) - 4; });
            // EXIT
            dataJoin.exit().remove();
        }
    }
}