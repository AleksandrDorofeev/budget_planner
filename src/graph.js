const dimentions = { height: 300, width: 300, radius: 150 };
const center = { x: dimentions.width / 2 + 5, y: dimentions.height / 2 + 5 };

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", dimentions.width + 150)
  .attr("height", dimentions.height + 150);

const graph = svg
  .append("g")
  .attr("transform", `translate(${center.x}, ${center.y})`);

const pie = d3
  .pie()
  .sort(null)
  .value(d => d.cost);

// const angles = pie([
//   { name: "rent", cost: 500 },
//   { name: "bills", cost: 300 },
//   { name: "gaming", cost: 200 }
// ]);

const arcPath = d3
  .arc()
  .outerRadius(dimentions.radius)
  .innerRadius(dimentions.radius / 2);

// console.log(arcPath(angles[0]));

const colour = d3.scaleOrdinal(d3["schemeSet3"]);

//update function
const update = data => {
  console.log(data);

  //update color scale domain
  colour.domain(data.map(d => d.name));

  //join enhanced (pie) data to path elements
  const paths = graph.selectAll("path").data(pie(data));

  //handle the exit selection
  paths
    .exit()
    .transition()
    .duration(750)
    .attrTween("d", arcTweenExit)
    .remove();
    
  //handle the current DOM path updates
  paths.attr("d", arcPath);

  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("fill", d => colour(d.data.name))
    .transition()
    .duration(750)
    .attrTween("d", arcTweenEnter);
};

//data array and firestore
var data = [];

db.collection("expenses").onSnapshot(res => {
  res.docChanges().forEach(change => {
    const doc = { ...change.doc.data(), id: change.doc.id };
    // console.log(doc);

    switch (change.type) {
      case "added":
        data.push(doc);
        break;
      case "modified":
        const index = data.findIndex(item => item.id === doc.id);
        data[index] = doc;
        break;
      case "removed":
        data = data.filter(item => item.id !== doc.id);
        break;
      default:
        break;
    }
  });
  update(data);
});

const arcTweenEnter = d => {
  let i = d3.interpolate(d.startAngle, d.endAngle);

  return function(t) {
    d.endAngle = i(t);
    return arcPath(d);
  };
};

const arcTweenExit = d => {
  let i = d3.interpolate(d.endAngle, d.startAngle);

  return function(t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};
