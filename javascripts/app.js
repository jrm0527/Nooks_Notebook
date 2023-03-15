const submitButton = $("#submit");
const input = $("input");
const resultContainer = $("#results");
const bugTable = $("#bug-table");
const dropdown = $(".dropdown-menu li");
let selected = "";
let rowsInTable = 10;

dropdown.on("click", function () {
  $("#selected").text($(this).text());
  selected = $(this).text().toLowerCase();
  if (selected === "sea creatures") {
    selected = "sea";
  }
});

//Setup button/input interactions
submitButton.on("click", search);
// input.on("keypress", function (event) {
//   if (event.key == "Enter") {
//     search();
//   }
// });

function search() {
  bugTable.empty();
  $.get(`https://acnhapi.com/v1/${selected}/`, (data) => {
    const length = Object.keys(data).length;
    if (length % 10 === 0) {
      rowsInTable = 10;
    } else {
      rowsInTable = 9;
    }
    createTable(Object.keys(data).length);
    console.log(Object.keys(data).length);
    let count = 0;
    console.log(data);
    for (let key in data) {
      createTd(data[key], count++);
    }
  });
}

function createTable(length) {
  const rows = length / rowsInTable;
  for (let i = 1; i <= rows; i++) {
    const tr = $("<tr>").attr("id", `row${i}`);
    bugTable.append(tr);
  }
}

function createTd(item, count) {
  const row = Math.floor(count / rowsInTable) + 1;
  const img = $("<img>");
  if (selected === "fossils") {
    img.attr("src", item.image_uri);
  } else {
    img.attr("src", item.icon_uri);
  }
  img
    .attr("data-bs-toggle", "modal")
    .attr("data-bs-target", "#myModal")
    .on("click", function () {
      setupPopup(item);
    });
  const h6 = $("<h6>").text(item.name["name-USen"]);
  const td = $("<td>").append(h6, img);
  const tr = $(`#row${row}`).append(td);
  bugTable.append(tr);
  //const div = $("<div>").addClass("modal fade");

  //   <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  //   <div class="modal-dialog">
  //     <div class="modal-content">
  //       <div class="modal-header">
  //         <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
  //         <button type="button" class="btn-close" data-mdb-dismiss="modal" aria-label="Close"></button>
  //       </div>
  //       <div class="modal-body">...</div>
  //       <div class="modal-footer">
  //         <button type="button" class="btn btn-secondary" data-mdb-dismiss="modal">Close</button>
  //         <button type="button" class="btn btn-primary">Save changes</button>
  //       </div>
  //     </div>
  //   </div>
  // </div>
}

function setupPopup(item) {
  $(".modal-title").text(item.name["name-USen"]);
  const img = $("<img>");
  if (selected === "fossils") {
    img.attr("src", item.image_uri);
  } else {
    img.attr("src", item.icon_uri);
  }
  $(".modal-body").append(img);
}
