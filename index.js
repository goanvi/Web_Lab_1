import "./styles/style.scss";
const rInput = document.querySelector("#r-input");
const yInput = document.querySelector("#y-input");
const xInputs = document.querySelectorAll(".x-btn");
const dottedLines = document.querySelectorAll(".dotted-line");
const checkLines = document.querySelectorAll(".hidden-line");
const yLine = document.querySelector("#y-line");
const graph = document.querySelector("#graph-svg");
const circle = document.querySelector(".dot");
const xPointer = document.querySelector("#x-pointer");
const yPointer = document.querySelector("#y-pointer");
const submitBtn = document.querySelector("#submit-btn");
const form = document.querySelector("#form");
const notify = document.querySelector(".notify");
const notifyMessage = document.querySelector(".notify__message");
const timezone = new Date().getTimezoneOffset();
let rValue;
let xValue;
let yValue;
let segment;

if (location.hostname == "127.0.0.1") window.close();

document.addEventListener("DOMContentLoaded", () => {
  const data = sessionStorage.getItem("history");
  document
    .querySelector("#result-table-body")
    .insertAdjacentHTML("beforeend", data ? data : "");
});

graph.addEventListener("mousemove", (e) => {
  const coord = e.offsetY - 20 * (e.offsetY / 320);
  const coordX = e.offsetX - 20 * (e.offsetX / 320);
  yLine.setAttribute("stroke", "red");
  if (rValue) {
    const limit = 300 / rValue;
    if (coord > 150) {
      yLine.setAttribute("y1", coord <= 150 + limit ? coord : 150 + limit);
      yLine.setAttribute("y2", coord <= 150 + limit ? coord : 150 + limit);
    } else {
      yLine.setAttribute("y1", coord >= 150 - limit ? coord : 150 - limit);
      yLine.setAttribute("y2", coord >= 150 - limit ? coord : 150 - limit);
    }
    if (
      coordX > 150 + (segment * dottedLines.length) / 2 ||
      coordX < 150 - (segment * dottedLines.length) / 2
    ) {
      let activeLine;
      dottedLines.forEach((line) => {
        if (line.classList.contains("active")) activeLine = line;
      });
      if (coordX > 150 + (segment * dottedLines.length) / 2 && !activeLine) {
        dottedLines[dottedLines.length - 1].classList.add("active");
      } else if (
        coordX < 150 - (segment * dottedLines.length) / 2 &&
        !activeLine
      ) {
        dottedLines[dottedLines.length - 2].classList.add("active");
      }
    }
  } else {
    yLine.setAttribute("y1", coord);
    yLine.setAttribute("y2", coord);
  }
});

form.addEventListener("submit", (event) => {
  disableNotification();
  event.preventDefault();
  if (xValue !== undefined && yValue !== undefined && rValue !== undefined) {
    fetch(`http://localhost:5000/api/hit?x=${xValue}&y=${yValue}&r=${rValue}&timezone=${timezone}`)
      .then((res) => res.text())
      .then((data) => {
        sessionStorage.setItem(
          "history",
          sessionStorage.getItem("history") === null
            ? data
            : data + sessionStorage.getItem("history")
        );
        document
          .querySelector("#result-table-body")
          .insertAdjacentHTML("afterbegin", data);
      })
      .catch((e) => alert(e.message));
  } else if (xValue === undefined) {
    setNotification("x value is empty");
  } else if (yValue === undefined) {
    setNotification("invalid y, range [-3,3]");
  } else if (rValue === undefined) {
    setNotification("invalid r, range [1,4]");
  }
});

graph.addEventListener("click", (e) => {
  disableNotification();
  if (rValue) {
    let activeLine;
    dottedLines.forEach((line) => {
      if (line.classList.contains("active")) activeLine = line;
    });
    const x = activeLine ? activeLine.getAttribute("x1") : 150;
    const y = yLine.getAttribute("y1");
    setDot(x, y);
    const convX = +(((x - 150) / 100) * +rValue).toFixed();
    const convY = +(-((y - 150) / 100) * +rValue).toFixed(2);
    xValue = convX;
    yValue = convY;
    setInput(convX, convY);
  }
});

rInput.addEventListener("input", (event) => {
    disableNotification();
    if (validateRInput(+event.target.value)) {
      rValue = +event.target.value;
      setLinesCoordinates(rValue);
      changeRText(rValue);
    } else {
      rValue = undefined;
      inactiveMode();
      return;
    }
    if (validateYInput(yValue) && xValue) {
      const convX = +((+xValue / rValue) * 100 + 150);
      const convY = +(-((+yValue / rValue) * 100) + 150);
      setDot(convX, convY);
    }
  }
);

yInput.addEventListener("input", (event) => {
    disableNotification();
    if (validateYInput(event.target.value)) {
      yValue = +event.target.value;
    } else {
      yValue = undefined;
      return;
    }
    if (validateRInput(rValue) && xValue) {
      const convX = +((+xValue / rValue) * 100 + 150);
      const convY = +(-((+yValue / rValue) * 100) + 150);
      setDot(convX, convY);
    }
  }
);

xInputs.forEach((xBtn) => {
  xBtn.addEventListener("change", (event) => {
    disableNotification();
    xInputs.forEach((xBtn) => {
      xBtn.parentElement.classList.remove("active-btn");
    });
    if (xValue === +event.target.value) {
      xValue = undefined;
      inactiveDot();
      return;
    } else {
      event.target.parentElement.classList.add("active-btn");
      xValue = +event.target.value;
    }
    if (validateYInput(yValue) && validateRInput(rValue)) {
      const convX = +((+xValue / rValue) * 100 + 150);
      const convY = +(-((+yValue / rValue) * 100) + 150);
      setDot(convX, convY);
    }
  });
});

checkLines.forEach((line) => {
  line.addEventListener("mouseover", (event) => {
    let attr = event.target.dataset["number"];
    if (
      event.target.getAttribute("x1") > 300 ||
      event.target.getAttribute("x1") < 0
    ) {
      attr -= 2;
    }
    dottedLines.forEach((dotLine) => {
      if (dotLine.dataset["number"] == attr) {
        dotLine.classList.add("active");
      }
    });
  });
  line.addEventListener("mouseout", (event) => {
    let attr = event.target.dataset["number"];
    const coordX = event.offsetX - 20 * (event.offsetX / 320); // ?????? ?????????????????? ?????????????? ?????????? ?????? ??????????????????
    if (
      event.target.getAttribute("x1") > 300 ||
      event.target.getAttribute("x1") < 0
    ) {
      attr -= 2;
    }
    dottedLines.forEach((dotLine) => {
      if (dotLine.dataset["number"] == attr) {
        dotLine.classList.remove("active");
      }
    });
  });
});

graph.addEventListener("mouseleave", () => {
  dottedLines.forEach((dotLine) => dotLine.classList.remove("active"));
  yLine.setAttribute("stroke", "transparent");
});

function validateRInput(rValue) {
  if (rValue >= 1 && rValue <= 4) {
    return true;
  }
  return false;
}

function validateYInput(yValue) {
  if (yValue == "") return false;
  if (yValue >= -3 && yValue <= 3) {
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

function setDot(x, y) {
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

function setInput(x, y) {
  yInput.value = y;
  xInputs.forEach((xBtn) => {
    xBtn.parentElement.classList.remove("active-btn");
    if (+xBtn.value === x) {
      xBtn.parentElement.classList.add("active-btn");
    }
  });
}

function inactiveMode() {
  checkLines.forEach((line) => line.classList.add("inactive"));
  changeRText("R");
  inactiveDot();
}

function inactiveDot() {
  xPointer.classList.add("inactive");
  yPointer.classList.add("inactive");
  circle.classList.add("inactive");
}

function setNotification(text) {
  notify.classList.remove("disabled");
  notifyMessage.innerText = text;
}
function disableNotification() {
  notify.classList.add("disabled");
}
