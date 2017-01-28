$(document).ready(function() {
    let data = [];

    $("input[type=file]").on("change", function(e) {
        const fileReader = new FileReader();
        fileReader.onload = function(e) {
            const result = e.target.result;
            data = d3.tsvParse(result, function(d) {
                return d;
            });
            const groupByArtist = _.groupBy(data, "Artist");
            const incomeByArtist = _.map(groupByArtist, (artist) => {
                const curArtist = artist[0]["Artist"];
                const sum = _.reduce(artist, (sum, n) => {
                    return sum + Number(n["Earnings (USD)"]);
                }, 0);
                return {artist: curArtist, sum: sum};
            });

            console.log(incomeByArtist);

            let width = 1200,
                barHeight = 20,
                labelWidth = 300;
            let x = d3.scaleLinear()
                .range([0, width - labelWidth]);
            let chart = d3.select(".chart")
                .attr("width", width);
            x.domain([0, d3.max(incomeByArtist, function(d) { return d.sum; })]);
            chart.attr("height", barHeight * incomeByArtist.length);
            var bar = chart.selectAll("g")
                .data(incomeByArtist)
                .enter().append("g")
                .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });
            bar.append("rect")
                .attr("width", function(d) { return x(d.sum); })
                .attr("height", barHeight - 1)
                .attr("x", labelWidth);
            bar.append("text")
                .attr("x", 0)
                .attr("y", barHeight / 2)
                .attr("dy", ".35em")
                .classed('label', true)
                .text(function(d) { return d.artist; });
            bar.append("text")
                .attr("x", labelWidth)
                .attr("y", barHeight / 2)
                .attr("dy", ".35em")
                .attr("fill", "lightgray")
                .text(function(d) { return "$" + d.sum.toFixed(2); });
        };
        fileReader.readAsText(e.target.files[0]);
    });
});