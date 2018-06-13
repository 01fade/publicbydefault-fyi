// credits
// https://bl.ocks.org/mbostock/7607535

module.exports = {
    setup: function(div, origData) {
        console.log("show", div);
        var storyContainer = $("#" + div);
        const divnum = div.replace("story-content", "");
        this.createSvg(storyContainer, divnum, origData);
    },
    createSvg: function(container, id, data) {
        var w = window.innerWidth,
            h = 700;

        container.find("svg.packed" + id).height(h + 100).width(w);

        var svg = d3.select("svg.packed" + id),
            margin = 20,
            diameter = h,
            g = svg.append("g").attr("transform", "translate(" + w / 2 + "," + diameter / 2 + ")");

        var pack = d3.pack()
            .size([diameter - margin, diameter - margin])
            .padding(2);

        var root = d3.hierarchy(data)
            .sum(function(d) { return 1; })
            .sort(function(a, b) { return b.value - a.value; });

        var focus = root,
            nodes = pack(root).descendants(),
            view;

        var circle = g.selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("class", function(d) { return d.parent ? d.children ? "node node--tag" : "node node--leaf" : "node node--root"; })
            .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

        var text = g.selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("class", function(d) { return d.parent === root ? "label" : "smalllabel"; })
            .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
            .attr("dy", function(d){ return d.data.subline === "" ? "0.5em" : "0em"})
            .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
            .append("tspan")
            .attr("x", 0)
            .text(function(d) { return d.data.name; });

        var label = g.selectAll(".label")
            .append("tspan")
            .attr("x", 0)
            .attr("dy", "1em")
            .text(function(d) { return d.data.subline; })

        var node = g.selectAll("circle,text");

        svg.on("click", function() { zoom(root); });

        zoomTo([root.x, root.y, root.r * 2 + margin]);

        function zoom(d) {
            var focus0 = focus;
            focus = d;

            var transition = d3.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .tween("zoom", function(d) {
                    var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                    return function(t) { zoomTo(i(t)); };
                });

            // focus is the thing that I clicked
            // i.e. the inner circle or the root circle
            // inner circle has parent
            // root circle parent is null

            transition.selectAll("text")
                .filter(function(d) {
                    if (d != undefined) {
                        // filter all texts in the circle I clicked
                        // or the text is shown, i.e. names of other circles
                        return d.parent === focus || this.style.display === "inline";
                    }
                })
                .style("fill-opacity", function(d) {
                    if (d != undefined) {
                        // opacity 1 for the texts inside the circle
                        return d.parent === focus ? 1 : 0;
                    }
                })
                .on("start", function(d) {
                    if (d != undefined) {
                        // at the beginning of the transition
                        // texts inside the circle show, so opacity can be animated
                        if (d.parent === focus) this.style.display = "inline";
                    }
                })
                .on("end", function(d) {
                    if (d != undefined) {
                        // texts outside the circle should be hidden after the opacity animation
                        if (d.parent !== focus) this.style.display = "none";
                    }
                });

            transition.selectAll(".node--tag")
                .style("opacity", function(d) {
                    if (d != undefined) {
                        // either show only the one circle that was clicked
                        // or show all when zoom out (focus.parent doesn't exist)
                        return d === focus || focus.parent === null ? "1" : "0";
                    }
                });
        }

        function zoomTo(v) {
            var k = diameter / v[2];
            view = v;
            node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
            circle.attr("r", function(d) { return d.r * k; });
        }

    }
}