const submitButton = $("#submit");
const input = $("input");
const resultContainer = $("#results");
const bugTable = $("#bug-table");
const dropdown = $(".dropdown-menu li");
let selected = "";
let rowsInTable = 10;
let userDetails = {}; //userDetails[itemName].collected = false or userDetails[itemName].donated = false
let collected = 0;
let donated = 0;
let totalLength = 0;

startUp();
function startUp() {
  if (JSON.parse(localStorage.getItem("collectedObj"))) {
    // JSON.parse(localStorage.setItem("collectedObj", null));
    userDetails = JSON.parse(localStorage.getItem("collectedObj"));
    console.log(userDetails);
  }
}

dropdown.on("click", function () {
  $("#selected").text($(this).text());
  selected = $(this).text().toLowerCase();
  if (selected === "sea creatures") {
    selected = "sea";
  }
});

//Setup button/input interactions
submitButton.on("click", search);

function search() {
  bugTable.empty();
  $.get(`https://acnhapi.com/v1/${selected}/`, (data) => {
    totalLength = Object.keys(data).length;
    if (totalLength % 10 === 0) {
      rowsInTable = 10;
    } else {
      rowsInTable = 9;
    }
    createTable(totalLength);
    // console.log(Object.keys(data).length);
    let count = 0;
    console.log(data);
    collected = 0;
    donated = 0;
    for (let key in data) {
      createTd(data[key], count++);
      if (userDetails.hasOwnProperty(key)) {
        if (userDetails[key].collected) {
          collected++;
        }
        if (userDetails[key].donated) {
          donated++;
        }
      }
    }
    refreshTotals();
  });
}

function refreshTotals() {
  $("#item-totals").text(`TOTAL ${selected.toUpperCase()}: ${totalLength}`);
  $("#detail-totals").text(`COLLECTED: ${collected} / DONATED: ${donated}`);
}

function createTable(length) {
  const rows = length / rowsInTable;
  for (let i = 1; i <= rows; i++) {
    const tr = $("<tr>").attr("id", `row${i}`);
    bugTable.append(tr);
  }
}

function createTd(data, count) {
  let item = data;
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
}

function setupPopup(item) {
  $(".modal-content").empty();
  const title = $("<div>").addClass("modal-title").text(item.name["name-USen"]);
  const closeBtn = $("<button>")
    .addClass("btn-close")
    .attr("data-bs-dismiss", "modal");
  const header = $(".modal-header").append(title, closeBtn);

  const img = $("<img>").addClass("img-responsive");
  const liPrice = $("<li>").text(`Price: ${item.price}`);
  const fullList = $("<ul>");
  if (selected === "fossils") {
    img.attr("src", item.image_uri);
    fullList.append(liPrice);
  } else {
    img.attr("src", item.icon_uri);

    let months = "";
    let monthArray = item.availability["month-array-northern"];
    for (let i = 0; i < monthArray.length; i++) {
      if (i + 1 === monthArray.length) {
        months += `${getMonthName(monthArray[i])}`;
      } else {
        months += `${getMonthName(monthArray[i])}, `;
      }
    }

    const li1 = $("<li>").text(`Location: ${item.availability.location}`);
    const li2 = $("<li>").text(`Months: ${months}`);
    const li3 = $("<li>").text(`Time: ${item.availability.time}`);
    const li4 = $("<li>").text(`Rarity: ${item.availability.rarity}`);
    fullList.append(li1, li2, li3, li4, liPrice);
  }

  const body = $("<div>").addClass("modal-body").append(img, fullList);

  const collBtn = $("<button>")
    .attr("id", "collect-button")
    .text("Collected")
    .on("click", function () {
      collectItem(item["file-name"]);
    });
  const donBtn = $("<button>")
    .attr("id", "donate-button")
    .text("Donated")
    .on("click", function () {
      donateItem(item["file-name"]);
    });
  const clearBtn = $("<button>")
    .addClass("btn btn-danger")
    .text("Clear")
    .on("click", function () {
      clearItem(item["file-name"]);
    });
  const closeBtn2 = $("<button>")
    .addClass("btn btn-danger")
    .attr("data-bs-dismiss", "modal")
    .text("Close");

  if (userDetails.hasOwnProperty(item["file-name"])) {
    if (userDetails[item["file-name"]].collected) {
      collBtn.addClass("btn btn-success");
    } else {
      collBtn.addClass("btn btn-warning");
    }
    if (userDetails[item["file-name"]].donated) {
      donBtn.addClass("btn btn-success");
    } else {
      donBtn.addClass("btn btn-warning");
    }
  } else {
    collBtn.addClass("btn btn-warning");
    donBtn.addClass("btn btn-warning");
  }
  const footer = $("<div>")
    .addClass("modal-footer")
    .append(collBtn, donBtn, clearBtn, closeBtn2);
  $(".modal-content").append(header, body, footer);
}

function collectItem(name) {
  if (userDetails.hasOwnProperty(name)) {
    console.log("has prop");
    if (userDetails[name]["collected"]) {
      console.log("collectedd");
      return;
    } else if (userDetails[name].hasOwnProperty("donated")) {
      console.log("has donated prop");
      if (userDetails[name]["donated"]) {
        console.log("donated");
        userDetails[name] = {
          collected: true,
          donated: true,
        };
      }
    }
  }
  userDetails[name] = {
    collected: true,
    donated: false,
  };
  console.log(userDetails);
  $("#collect-button").addClass("btn-success").removeClass("btn-warning");
  localStorage.setItem("collectedObj", JSON.stringify(userDetails));
  collected++;
  refreshTotals();
}

function donateItem(name) {
  if (userDetails.hasOwnProperty(name)) {
    if (userDetails[name]["donated"]) {
      return;
    } else if (userDetails[name].hasOwnProperty("collected")) {
      if (userDetails[name]["collected"]) {
        userDetails[name] = {
          collected: true,
          donated: true,
        };
      }
    } else {
      userDetails[name] = {
        collected: false,
        donated: true,
      };
    }
  } else {
    userDetails[name] = {
      collected: false,
      donated: true,
    };
  }
  $("#donate-button").addClass("btn-success").removeClass("btn-warning");
  localStorage.setItem("collectedObj", JSON.stringify(userDetails));
  donated++;
  refreshTotals();
}

function clearItem(name) {
  if (userDetails.hasOwnProperty(name)) {
    if (userDetails[name].collected) {
      collected--;
    }
    if (userDetails[name].donated) {
      donated--;
    }
    userDetails[name] = {
      collected: false,
      donated: false,
    };
    $("#donate-button").addClass("btn-warning").removeClass("btn-success");
    $("#collect-button").addClass("btn-warning").removeClass("btn-success");
    localStorage.setItem("collectedObj", JSON.stringify(userDetails));
    refreshTotals();
  }
}

function getMonthName(num) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return monthNames[num - 1];
}
