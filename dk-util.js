// window.dkutil = {};

// window.dkutil.dataMarshallers = window.dkutil.dataMarshallers || ((_) => {
//     return {
//         getIncomeOfEachArtist: getIncomeOfEachArtist,
//         getUniqueArtists: getUniqueArtists
//     };

//     function getUniqueArtists(data) {
//         return _.uniq(
//             _.map(data, 'Artist')
//         );
//     }

//     function getIncomeOfEachArtist(data) {
//         const groupByArtist = _.groupBy(data, "Artist");
//         const incomeByArtist = _.map(groupByArtist, (artist) => {
//             const curArtist = artist[0]["Artist"];
//             const sum = _.reduce(artist, (sum, n) => {
//                 return sum + Number(n["Earnings (USD)"]);
//             }, 0);
//             return {artist: curArtist, sum: sum};
//         });
//         return incomeByArtist;
//     }
// })(_);

// $(document).ready(function() {
//     let data = [];

//     $("input[type=file]").on("change", function(e) {
//         const fileReader = new FileReader();
//         fileReader.onload = function(e) {
//             const result = e.target.result;
//             data = d3.tsvParse(result, function(d) {
//                 return d;
//             });

//             const artists = window.dkutil.dataMarshallers.getUniqueArtists(data);

//             _.forEach(artists, (a) => {
//                 $(".artist-select").append($("<option>", {
//                     value: a,
//                     text: a
//                 }))
//             })

//             const incomeByArtist = window.dkutil.dataMarshallers.getIncomeOfEachArtist(data);

//             // let width = 1200,
//             //     barHeight = 20,
//             //     labelWidth = 300;
//             // let x = d3.scaleLinear()
//             //     .range([0, width - labelWidth]);
//             // let chart = d3.select(".chart")
//             //     .attr("width", width);
//             // x.domain([0, d3.max(incomeByArtist, function(d) { return d.sum; })]);
//             // chart.attr("height", barHeight * incomeByArtist.length);
//             // var bar = chart.selectAll("g")
//             //     .data(incomeByArtist)
//             //     .enter().append("g")
//             //     .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });
//             // bar.append("rect")
//             //     .attr("width", function(d) { return x(d.sum); })
//             //     .attr("height", barHeight - 1)
//             //     .attr("x", labelWidth);
//             // bar.append("text")
//             //     .attr("x", 0)
//             //     .attr("y", barHeight / 2)
//             //     .attr("dy", ".35em")
//             //     .classed('label', true)
//             //     .text(function(d) { return d.artist; });
//             // bar.append("text")
//             //     .attr("x", labelWidth)
//             //     .attr("y", barHeight / 2)
//             //     .attr("dy", ".35em")
//             //     .attr("fill", "lightgray")
//             //     .text(function(d) { return "$" + d.sum.toFixed(2); });
//         };
//         fileReader.readAsText(e.target.files[0]);
//     });
// });

var DataMarshallers = {
    methods: {
        getUniqueArtists(data) {
            const uniqueArtists = [];
            data.forEach((d) => {
                if (!uniqueArtists.includes(d["Artist"])) {
                    uniqueArtists.push(d.Artist);
                }
            })
            return uniqueArtists;
        },
        getIncomeOfEachArtistBySaleMonth(data) {
            const artists = this.getUniqueArtists(data);
            const byMonth = {};
            artists.forEach((a) => {
                byMonth[a] = {};
            });

            const groupedByMonth = data.forEach((d) => {
                const curArtist = d["Artist"];
                const curSaleMonth = d["Sale Month"];
                const artistObj = byMonth[curArtist];
                if (!(curSaleMonth in artistObj)) {
                    artistObj[curSaleMonth] = [];
                }
                artistObj[curSaleMonth].push(d);
            });

            for (let artistKey in byMonth) {
                let artist = byMonth[artistKey];
                for (let saleMonthKey in artist) {
                    let saleMonth = artist[saleMonthKey];
                    const sum = saleMonth.reduce((acc, cur) => {
                        return acc + Number(cur["Earnings (USD)"]);
                    }, 0);
                    artist[saleMonthKey] = sum;
                }
            }

            let sums = {};
            artists.forEach((a) => {
                sums[a] = [];
            });

            for (let artistKey in byMonth) {
                let artist = byMonth[artistKey];
                for (let saleMonthKey in artist) {
                    let sum = artist[saleMonthKey];
                    sums[artistKey].push({month: saleMonthKey, earnings: sum.toFixed(2)});
                }
            }

            let sortedSums = {};
            _.forEach(sums, (artist, key) => {
                sortedSums[key] = _.sortBy(artist, ["month"]);
            });

            console.log(sortedSums);

            return sortedSums;
        }
    }
}

var dkutil = new Vue({
    computed: {
        
    },
    data: {
        artists: [],
        incomeByArtistBySaleMonth: {},
        selectedArtist: "",
        userData: []
    },
    el: "#dk-util",
    methods: {
        newFile(e) {
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                const result = e.target.result;
                data = d3.tsvParse(result, function(d) {
                    return d;
                });
                this.userData = data;

                this.artists = this.getUniqueArtists(this.userData);
                this.incomeByArtistBySaleMonth = this.getIncomeOfEachArtistBySaleMonth(this.userData);
            }
            fileReader.readAsText(e.target.files[0]);
        }
    },
    mixins: [
        DataMarshallers
    ]
})