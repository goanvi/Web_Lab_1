const rInput = document.querySelector("#rInput");
const dottedLines = document.querySelectorAll(".dotted-line");
const checkLines = document.querySelectorAll(".hidden-line");
const yLine = document.querySelector("#y-line");
const graph = document.querySelector("#graph-svg");
const circle = document.querySelector(".dot");
const xPointer = document.querySelector("#x-pointer");
const yPointer = document.querySelector("#y-pointer");
let rValue;
let segment;

graph.addEventListener("mousemove", (e) => {
  const coord = e.offsetY - 20 * (e.offsetY / 320);
  if (rValue) {
    const limit = 300 / rValue;
    if (coord > 150) {
      yLine.setAttribute("y1", coord <= 150 + limit ? coord : 150 + limit);
      yLine.setAttribute("y2", coord <= 150 + limit ? coord : 150 + limit);
    } else {
      yLine.setAttribute("y1", coord >= 150 - limit ? coord : 150 - limit);
      yLine.setAttribute("y2", coord >= 150 - limit ? coord : 150 - limit);
    }
  } else {
    yLine.setAttribute("y1", coord);
    yLine.setAttribute("y2", coord);
  }
});

graph.addEventListener("click", (e) => {
  if (rValue) setDot();
});

rInput.addEventListener("input", (event) => {
  rValue = +event.target.value;
  if (validateRInput(rValue)) {
    setLinesCoordinates(rValue);
    changeRText(rValue);
  } else inactiveMode();
});

checkLines.forEach((line) => {
  line.addEventListener("mouseover", (event) => {
    let attr = event.target.dataset["number"];
    if (
      event.target.getAttribute("x1") > 300 ||
      event.target.getAttribute("x1") < 0
    ) {
      attr-=2;
    }
    dottedLines.forEach((dotLine) => {
      if (dotLine.dataset["number"] == attr) {
        dotLine.classList.add("active");
      }
    });
  });
  line.addEventListener("mouseout", (event) => {
    let attr = event.target.dataset["number"];
    const coordX = event.offsetX - 20 * (event.offsetX / 320); // при изменении размера графа это сломается
    if (
      coordX < 150 - segment * (checkLines.length / 2) ||
      coordX > 150 + segment * (checkLines.length / 2)
    ) {
      return;
    }
    if (
      event.target.getAttribute("x1") > 300 ||
      event.target.getAttribute("x1") < 0
    ) {
      attr-=2;
    }
    dottedLines.forEach((dotLine) => {
      if (dotLine.dataset["number"] == attr) {
        dotLine.classList.remove("active");
      }
    });
  });
});

function validateRInput(rValue) {
  if (rValue >= 1 && rValue <= 4) {
    return true;
  }
  return false;
}

function changeRText(rValue) {
  const rlablesWhole = document.querySelectorAll(".graph-label.r-whole-pos");
  const rlablesHalf = document.querySelectorAll(".graph-label.r-half-pos");
  const rlablesNegWhole = document.querySelectorAll(".graph-label.r-whole-neg");
  const rlablesNegHalf = document.querySelectorAll(".graph-label.r-half-neg");
  rlablesWhole.forEach((el) => (el.textContent = +rValue ? rValue : "R"));
  rlablesHalf.forEach(
    (el) => (el.textContent = +rValue / 2 ? rValue / 2 : "R/2")
  );
  rlablesNegWhole.forEach((el) => (el.textContent = -rValue ? -rValue : "-R"));
  rlablesNegHalf.forEach(
    (el) => (el.textContent = -(rValue / 2) ? -(rValue / 2) : "-R/2")
  );
}

function setLinesCoordinates(rValue) {
  segment = 100 / rValue;
  let shift = 1;
  for (let i = 0; i < dottedLines.length; i += 2) {
    dottedLines[i].setAttribute("x1", 150 - segment * shift);
    dottedLines[i].setAttribute("x2", 150 - segment * shift);
    dottedLines[i + 1].setAttribute("x1", 150 + segment * shift);
    dottedLines[i + 1].setAttribute("x2", 150 + segment * shift);
    checkLines[i].setAttribute("x1", 150 - segment * shift);
    checkLines[i].setAttribute("x2", 150 - segment * shift);
    checkLines[i + 1].setAttribute("x1", 150 + segment * shift);
    checkLines[i + 1].setAttribute("x2", 150 + segment * shift);
    checkLines[i].setAttribute("stroke-width", segment);
    checkLines[i + 1].setAttribute("stroke-width", segment);
    checkLines[i].classList.remove("inactive");
    checkLines[i + 1].classList.remove("inactive");
    shift++;
  }
}

function setDot() {
  let activeLine;
  dottedLines.forEach((line) => {
    if (line.classList.contains("active")) activeLine = line;
  });
  const x = activeLine ? activeLine.getAttribute("x1") : 150;
  const y = yLine.getAttribute("y1");
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  xPointer.setAttribute("x1", x);
  xPointer.setAttribute("y1", y);
  xPointer.setAttribute("y2", y);
  yPointer.setAttribute("y1", y);
  yPointer.setAttribute("x1", x);
  yPointer.setAttribute("x2", x);
  xPointer.classList.add("pointer");
  yPointer.classList.add("pointer");
  xPointer.classList.remove("inactive");
  yPointer.classList.remove("inactive");
  circle.classList.remove("inactive");
}

function inactiveMode() {
  checkLines.forEach((line) => line.classList.add("inactive"));
  changeRText("R");
  xPointer.classList.add("inactive");
  yPointer.classList.add("inactive");
  circle.classList.add("inactive");
}