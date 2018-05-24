// https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172
// http://bl.ocks.org/rajvansia/ce6903fad978d20773c41ee34bf6735c
//

module.exports = {
    test: function() {
        console.log("d3_story test");
    },
    setup: function(id) {
        console.log("show", id);
        // var w = window.innerWidth,
        //     h = window.innerHeight;

        var svg = d3.select("svg"),
            margin = { top: 20, right: 40, bottom: 110, left: 40 },
            margin2 = { top: 430, right: 40, bottom: 30, left: 40 },
            width = 1400 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom,
            height2 = 500 - margin2.top - margin2.bottom;

        var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");

        var x = d3.scaleTime().range([0, width]),
            x2 = d3.scaleTime().range([0, width]),
            y = d3.scaleLinear().range([height, 0]),
            y2 = d3.scaleLinear().range([height2, 0]);

        var xAxis = d3.axisBottom(x),
            xAxis2 = d3.axisBottom(x2),
            yAxis = d3.axisLeft(y);

        x.domain([parseDate("2016-12-29T00:00:00Z"), parseDate("2018-01-04T00:00:00Z")]);
        y.domain([25.5, -1.5]); // 0-24 needed, but nice ticks
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
                [width/2, height]
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

        d3.csv("./data/" + id + ".csv", type, function(error, data) {
            if (error) throw error;

            // append scatter plot to main chart area
            var dots = focus.append("g");
            dots.attr("clip-path", "url(#clip)");
            dots.selectAll("dot")
                .data(data)
                .enter().append("circle")
                .attr('class', function(d) { return 'dot c' + (Math.round(d.hour)%3 + Math.round(Math.random())); })
                .attr("r", 5)
                .style("opacity", .5)
                .attr("cx", function(d) { return x(d.date); })
                .attr("cy", function(d) { return y(d.hour); })

            focus.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            focus.append("g")
                .attr("class", "axis axis--y")
                .call(yAxis);

            // append scatter plot to brush chart area
            var dots = context.append("g");
            dots.attr("clip-path", "url(#clip)");
            dots.selectAll("dot")
                .data(data)
                .enter().append("circle")
                .attr('class', 'dotContext')
                .attr("r", 2)
                .style("opacity", .5)
                .attr("cx", function(d) { return x2(d.date); })
                .attr("cy", function(d) { return y2(d.hour); })

            context.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height2 + ")")
                .call(xAxis2);

            context.append("g")
                .attr("class", "brush")
                .call(brush)
                .call(brush.move, [0, width/2]); // initial brush selection

            svg.append("rect")
                .attr("class", "zoom")
                .attr("width", width)
                .attr("height", height)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(zoom);
        });

        function brushed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            var s = d3.event.selection || x2.range(); // what the user selected
            x.domain(s.map(x2.invert, x2)); // change x domain (in focus div)
            focus.selectAll(".dot") // update data and elements and show only the ones in the domain
                .attr("cx", function(d) { return x(d.date); })
                .attr("cy", function(d) { return y(d.hour); });
            focus.select(".axis--x").call(xAxis); // update x axis
            svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                .scale(width / (s[1] - s[0]))
                .translate(-s[0], 0));
        }

        function zoomed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
            var t = d3.event.transform;
            x.domain(t.rescaleX(x2).domain());
            focus.selectAll(".dot")
                .attr("cx", function(d) { return x(d.date); })
                .attr("cy", function(d) { return y(d.hour); });
            focus.select(".axis--x").call(xAxis);
            context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
        }

        function type(d) {
            d.date = parseDate(d.created_time);
            var date = new Date(d.created_time.replace("Z", ""));
            var hour = date.getHours();
            var min = date.getMinutes();
            d.hour = hour + min/60;
            return d;
        }
    }
}