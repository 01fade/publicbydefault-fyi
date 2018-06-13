// credits
// https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172
// http://bl.ocks.org/rajvansia/ce6903fad978d20773c41ee34bf6735c

module.exports = {
    transformData: function(d) {
        var localT = moment.utc(d.created_time).utcOffset(-7);
        var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S");
        d.date = parseDate(localT.format("YYYY-MM-DDTHH:mm:ss"));
        d.hour = localT.hours() + localT.minutes() / 60;
        return d;
    },
    getData: function(dat) {
        for (var i = 0; i < dat.length; i++) {
            dat[i] = this.transformData(dat[i]);
            if (i === dat.length - 1) {
                var filter = _.chain(dat).countBy('tag').map((count, tag) => ({ tag, count })).sortBy("count").reverse().value();
                return [dat, filter];
            }
        }
    },
    setup: function(div, origData) {
        console.log("show", div);
        var data = this.getData(origData),
            filter = data[1],
            // show the tag with the most transactions first
            items = _.filter(data[0], { tag: filter[0].tag }),
            items2 = data[0];
        // console.log(items, filter);

        var storyContainer = $("#" + div);
        var filtercontainer = storyContainer.find(".filter");
        // filtercontainer.empty();
        for (var i = 0; i < filter.length; i++) {
            filtercontainer.append($("<button>", { id: filter[i].tag, class: "small" }).text(filter[i].tag));
            // move "other" to end
            filtercontainer.find("#other").css("order", "10");
            filtercontainer.find("#" + filter[0].tag).addClass("active");
        }
        const divnum = div.replace("story-content", "");
        // if (storyContainer.find("svg.brush"+divnum)[0].childElementCount === 0) {
            this.createSvg(storyContainer, divnum, items, items2);
        // }
    },
    createSvg: function(container, id, arr, arr2) {

        var w = window.innerWidth,
            h = Math.min(window.innerHeight - 200, 600),
            minih = 100;

        container.find("svg.brush"+id).height(h).width(w);

        var svg = d3.select("svg.brush"+id),
            margin = { top: 0, right: 0, bottom: minih + 50, left: 0 },
            margin2 = { top: h - minih, right: 0, bottom: 30, left: 0 },
            width = w - margin.left - margin.right,
            height = h - margin.top - margin.bottom,
            height2 = h - margin2.top - margin2.bottom;

        var x = d3.scaleTime().range([0, width]),
            x2 = d3.scaleTime().range([0, width]),
            y = d3.scaleLinear().range([height, 0]),
            y2 = d3.scaleLinear().range([height2, 0]);

        var xAxis = d3.axisBottom(x).tickSizeOuter(0),
            xAxis2 = d3.axisBottom(x2).tickSizeOuter(0),
            yAxis = d3.axisRight(y).tickValues([0, 12, 24]).tickSizeOuter(0).tickFormat(function(d,i){ return ["Time of Day", "Noon", "Midnight"][i] });

        var parseD = d3.timeParse("%Y-%m-%d");

        x.domain([parseD("2016-12-20"), parseD("2018-01-10")]);
        y.domain([26, 0]);
        x2.domain(x.domain());
        y2.domain([30, -6]);

        // at start show whole timeline
        var brush = d3.brushX()
            .extent([
                [0, 0],
                [width, height2]
            ])
            .on("brush end", brushed);

        var zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([
                [0, 0],
                [width, height]
            ]) // area brush is movable in
            .extent([
                [0, 0],
                [width, height]
            ])
            .on("zoom", zoomed);

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

        // append scatter plot to main chart area
        var rects = focus.append("g");
        rects.attr("clip-path", "url(#clip)");

        // append scatter plot to brush chart area
        var dots = context.append("g");
        dots.attr("clip-path", "url(#clip)");
        dots.selectAll("dot")
            .data(arr2)
            .enter().append("circle")
            .attr('class', 'dotContext')
            .attr("r", 2)
            .attr("cx", function(d) { return x2(d.date); })
            .attr("cy", function(d) { return y2(d.hour); })

        showNewElems(arr);

        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (height + 20) + ")") // a little room at the bottom
            .call(xAxis);

        // y axis background
        focus.append("rect")
            .attr("class", "axisbg")
            .attr("width", 30)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + (margin.top - 0) + ")");

        // ticks text
        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis)
            .selectAll("text")
            .style("text-anchor", function(d){return d === 0 ? "end" : "start"})
            .style("opacity", function(d){return d === 0 ? 0.5 : 1})
            .attr("dx", function(d){return d === 0 ? "-1.5em" : "-0.2em"})
            .attr("dy", "2em")
            .attr("transform", "rotate(-90)");

        // ticks line
        focus.select(".axis--y").selectAll("line").attr("x2", 30);

        context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, [0, width / 3]); // initial brush selection

        // ability to click on the focus area and zoom
        svg.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + (margin.top - 0) + ")")
            .call(zoom)
            .on("wheel.zoom", null); // no scroll zoom

        // update elements with filter
        container.find(".filter button").click(function(e) {
            $(this).siblings().removeClass("active");
            $(this).addClass("active");
            var newData = _.filter(arr2, { tag: e.currentTarget.id });
            // console.log("filter", e.currentTarget.id, newData);
            showNewElems(newData);
        });

        container.find("#show-msg").click(function() {
            var btn = $(this);
            if (btn.hasClass("checked")) {
                rects.selectAll("text.msg").transition().style("opacity", 0);
                btn.text("Show messages");
                btn.removeClass("checked");
            } else {
                rects.selectAll("text.msg").transition().style("opacity", 0.8);
                btn.text("Hide messages");
                btn.addClass("checked");
            }
        });

        // show/update elements
        function showNewElems(dd) {

            dots.selectAll(".dotContext")
                // if tag is the same as from filter
                .attr("class", function(d) { return d.tag === dd[0].tag ? "dotContext highlight" : "dotContext normal"; });

            dots.selectAll(".highlight").each(function() {
                this.parentNode.parentNode.appendChild(this.parentNode);
            });

            // https://bost.ocks.org/mike/join/
            var dataJoin = rects.selectAll(".group")
                .data(dd);
            // ENTER
            var group = dataJoin.enter().append("g")
                .attr("class", "group");
            // UPDATE
            group.merge(dataJoin)
            // .attr("transform", function(d) { return "translate(" + x(d.date) + "," + y(d.hour) + ")"; });
            // ENTER
            var rect = group.append("rect")
                .attr("class", "rect")
                .style("opacity", 0.5)
                .merge(dataJoin.select(".rect"))
                .attr("width", 5)
                .attr("height", 5)
                .attr("x", function(d) { return x(d.date); })
                .attr("y", function(d) { return y(d.hour); });

            // var showMsg = $("#show-msg").hasClass("checked");
            var showMsg = true;
            // Append text
            group.append("text")
                .style("opacity", function() { return (showMsg === true) ? 0.7 : 0; })
                .attr("class", "msg")
                .attr("dy", "1em")
                .attr("dx", 7)
                .style("font-size", "0.8em")
                .attr("text-anchor", "start")
                .merge(dataJoin.select(".msg"))
                .text(function(d) { return d.message; })
                .attr("transform", function(d) {
                    return "translate(" + x(d.date) + "," + y(d.hour) + ")";
                });
            // EXIT
            dataJoin.exit().remove();

        }

        function brushed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            var s = d3.event.selection || x2.range(); // what the user selected
            x.domain(s.map(x2.invert, x2)); // change x domain (in focus div)
            focus.selectAll(".rect") // update data and elements and show only the ones in the domain
                .attr("x", function(d) { return x(d.date); })
                .attr("y", function(d) { return y(d.hour); });
            focus.selectAll(".msg")
                .attr("transform", function(d) {
                    return "translate(" + x(d.date) + "," + y(d.hour) + ")";
                });
            focus.select(".axis--x").call(xAxis); // update x axis
            svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                .scale(width / (s[1] - s[0]))
                .translate(-s[0], 0));
        }

        function zoomed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
            var t = d3.event.transform;
            x.domain(t.rescaleX(x2).domain());
            focus.selectAll(".rect")
                .attr("x", function(d) { return x(d.date); })
                .attr("y", function(d) { return y(d.hour); });
            focus.selectAll(".msg")
                .attr("transform", function(d) {
                    return "translate(" + x(d.date) + "," + y(d.hour) + ")";
                });
            focus.select(".axis--x").call(xAxis);
            context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
        }

    }
}