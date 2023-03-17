let chime = new Audio("/frontend-project/sounds/chime.mp3");
let cancelSnd = new Audio("/frontend-project/sounds/cancel.mp3");
let selectedType = "";
let selectedMonth = "all";
let userDetails = {};
let collected = 0;
let donated = 0;
let totalLength = 0;
let anyChanges = true;
let firstLoad = true;

startUp();
function startUp() {
  if (JSON.parse(localStorage.getItem("collectedObj"))) {
    userDetails = JSON.parse(localStorage.getItem("collectedObj"));
  }

  $("#dropdown-type li").on("click", function () {
    $("#selectedType").text($(this).text());
    selectedType = $(this).text().toLowerCase();
    if (selectedType === "sea creatures") {
      selectedType = "sea";
    }
    anyChanges = true;
  });

  $("#dropdown-month li").on("click", function () {
    $("#selectedMonth").text($(this).text());
    let month = $("#selectedMonth").text().toLowerCase();
    if (month === "all") {
      selectedMonth = "all";
    } else {
      selectedMonth = getMonthNumber($(this).text());
    }
    anyChanges = true;
  });

  $("#reset").on("click", reset);
  $("#run").on("click", resetAnim);
}

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function resetAnim() {
  $("#item-box").addClass("not-loaded");
  $("#detail-box").addClass("not-loaded");
  $("#icon").addClass("not-visible");
  $("#table-container").addClass("not-visible");
  if (!firstLoad) {
    await delay(600);
  } else {
    firstLoad = false;
  }
  search();
}

function search() {
  if (!anyChanges) {
    return;
  }
  $("#item-table").empty();
  $.get(`https://acnhapi.com/v1/${selectedType}/`, (data) => {
    totalLength = 0;
    if (selectedType === "fossils") {
      selectedMonth = "all";
    }

    if (selectedMonth !== "all") {
      for (let key in data) {
        let monthArray = data[key].availability["month-array-northern"];
        for (let i = 0; i < monthArray.length; i++) {
          if (monthArray[i] === selectedMonth) {
            totalLength++;
          }
        }
      }
    } else {
      totalLength = Object.keys(data).length;
    }

    let rowsInTable = 10;
    if (totalLength % 10 === 0) {
      rowsInTable = 10;
    } else if (totalLength % 9 === 0) {
      rowsInTable = 9;
    } else if (totalLength % 8 === 0) {
      rowsInTable = 8;
    } else {
      rowsInTable = 7;
    }

    createTable(rowsInTable);

    let count = 0;
    collected = 0;
    donated = 0;
    for (let key in data) {
      if (selectedMonth === "all") {
        createTd(data[key], rowsInTable, count++);
        countDetails(key);
      } else {
        let monthArray = data[key].availability["month-array-northern"];
        for (let i = 0; i < monthArray.length; i++) {
          if (monthArray[i] === selectedMonth) {
            createTd(data[key], rowsInTable, count++);
            countDetails(key);
          }
        }
      }
    }
    refreshTotals();
  });
  anyChanges = false;
}

function setupPopup(item) {
  $(".modal-content").empty();
  const title = $("<h2>")
    .addClass("modal-title")
    .text(item.name["name-USen"].toUpperCase());
  const closeBtn = $("<button>")
    .addClass("btn-close")
    .attr("data-bs-dismiss", "modal")
    .on("click", search);
  const header = $("<div>").addClass("modal-header").append(title, closeBtn);

  const img = $("<img>").addClass("img-responsive");
  const liPrice = $("<li>").text(`Price: ${item.price}`);
  const fullList = $("<ul>").addClass("text-start");
  if (selectedType === "fossils") {
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
    .text("Close")
    .on("click", search);

  if (userDetails.hasOwnProperty(item["file-name"])) {
    if (userDetails[item["file-name"]].collected) {
      collBtn.addClass("btn btn-success");
    } else {
      collBtn.addClass("btn btn-warning");
      donBtn.addClass("d-none");
    }
    if (userDetails[item["file-name"]].donated) {
      donBtn.addClass("btn btn-success");
    } else {
      donBtn.addClass("btn btn-warning");
    }
  } else {
    collBtn.addClass("btn btn-warning");
    donBtn.addClass("btn btn-warning");
    donBtn.addClass("d-none");
  }
  const footer = $("<div>")
    .addClass("modal-footer")
    .append(donBtn, collBtn, clearBtn, closeBtn2);
  $(".modal-content").append(header, body, footer);
}

/* ***************** TABLE CREATION FUNCTIONS ***************/

function createTable(rowsInTable) {
  const rows = Math.ceil(totalLength / rowsInTable);
  for (let i = 0; i <= rows; i++) {
    const tr = $("<tr>").attr("id", `row${i}`);
    $("#item-table").append(tr);
  }
}

function createTd(item, rowsInTable, count) {
  const row = Math.floor(count / rowsInTable) + 1;
  const img = $("<img>").addClass("img-fluid table-image");
  if (selectedType === "fossils") {
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
  if (userDetails.hasOwnProperty(item["file-name"])) {
    let key = userDetails[item["file-name"]];
    if (key.donated) {
      td.addClass("donated");
    } else if (key.collected) {
      td.addClass("collected");
    }
  }
  const tr = $(`#row${row}`).append(td);
  $("#item-table").append(tr);
}

/* ***************** BUTTON FUNCTIONS ***************/

function collectItem(name) {
  if (userDetails.hasOwnProperty(name)) {
    if (userDetails[name]["collected"]) {
      return;
    }
  }
  userDetails[name] = {
    collected: true,
    donated: false,
  };
  chime.play();
  $("#donate-button").removeClass("d-none");
  $("#collect-button").addClass("btn-success").removeClass("btn-warning");
  localStorage.setItem("collectedObj", JSON.stringify(userDetails));
  collected++;
  refreshTotals();
  anyChanges = true;
}

function donateItem(name) {
  if (userDetails.hasOwnProperty(name)) {
    if (userDetails[name]["donated"]) {
      return;
    }
  }
  userDetails[name] = {
    collected: true,
    donated: true,
  };
  chime.play();
  $("#donate-button").addClass("btn-success").removeClass("btn-warning");
  localStorage.setItem("collectedObj", JSON.stringify(userDetails));
  donated++;
  refreshTotals();
  anyChanges = true;
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
    $("#donate-button")
      .addClass("btn-warning d-none")
      .removeClass("btn-success");
    $("#collect-button").addClass("btn-warning").removeClass("btn-success");
    localStorage.setItem("collectedObj", JSON.stringify(userDetails));
    refreshTotals();
    anyChanges = true;
  }
}

function reset() {
  const affirm = confirm(
    "Are you sure you want to reset? You will lose all saved data!"
  );
  if (affirm) {
    cancelSnd.play();
    localStorage.removeItem("collectedObj");
    userDetails = {};
    anyChanges = true;
    $("#item-table").empty();
    $("#item-box").addClass("not-loaded");
    $("#detail-box").addClass("not-loaded");
    $("#icon").addClass("not-visible");
    $("#table-container").addClass("not-visible");
  }
}

/* ***************** MISC FUNCTIONS ***************/

function countDetails(key) {
  if (userDetails.hasOwnProperty(key)) {
    if (userDetails[key].collected) {
      collected++;
    }
    if (userDetails[key].donated) {
      donated++;
    }
  }
}

function refreshTotals() {
  $("#item-box").removeClass("not-loaded");
  $("#detail-box").removeClass("not-loaded");
  $("#icon").removeClass("not-visible");
  $("#table-container").removeClass("not-visible");
  $("#icon").attr("src", `/frontend-project/images/${selectedType}.png`);
  if (selectedMonth === "all") {
    $("#item-totals").text(
      `TOTAL ${selectedType.toUpperCase()} IN ALL MONTHS: ${totalLength}`
    );
  } else {
    $("#item-totals").text(
      `TOTAL ${selectedType.toUpperCase()} IN ${getMonthName(
        selectedMonth
      ).toUpperCase()}: ${totalLength}`
    );
  }
  $("#detail-totals").text(`COLLECTED: ${collected} / DONATED: ${donated}`);
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

function getMonthNumber(month) {
  var d = Date.parse(month + "1, 2012");
  if (!isNaN(d)) {
    return new Date(d).getMonth() + 1;
  }
}
