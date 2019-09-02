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

//update function
const update = data => {
  console.log(data);

  //join enhanced (pie) data to path elements
  const path = graph.selectAll("path").data(pie(data));

  console.log(path.enter());

  path
    .enter()
    .append("path")
    .attr("class", "arc")
    .attr("d", arcPath)
    .attr("stroke", "#fff")
    .attr("stroke-width", 3);
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
