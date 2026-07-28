function pages() {
  let cards = document.querySelectorAll(".elem");
  let pages = document.querySelectorAll(".pages");
  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      const cardId = e.currentTarget.id;
      pages.forEach((page) => {
        // page.style.display = page.id === cardId ? "flex" : "";
        // page.style.transform = page.id === cardId ? "scale(1)" : "none";
        page.classList.toggle("active", page.id === cardId);
      });
    });
  });
  pages.forEach((e) => {
    let p = e.querySelector("p");
    p.addEventListener("click", () => {
      e.classList.remove("active");
    });
  });
}

function todo() {
  let inputTitle = document.querySelector("form .inp");
  let inputDetails = document.querySelector("form textarea");
  let check = document.querySelector(".todo-page form .checkbox input");
  let submit = document.querySelector("form botton");
  let todosContainer = document.querySelector(".todo-page .bot .right .list");
  let form = document.querySelector(".todo-page form");
  let listitems = document.querySelectorAll(".todo-page .list .listitems");

  let tasks = JSON.parse(localStorage.getItem("todoList")) || [];

  function render() {
    let sum = "";
    tasks.forEach((elem, idx) => {
      sum += ` <div class="listitems" id="${idx}">
                   <p class="text ${
                     elem.completed ? "done" : ""
                   }" id="${idx}"> <span class="imp ${
        elem.completed ? "grey" : ""
      }" >${elem.imp ? "imp" : ""}</span> ${elem.task}</p>
                   <p class="completed" id="${idx}">${
        elem.completed ? "undo completed" : "mark as completed"
      }</p>
                   <p class="delete" id="${idx}" >delete</p>
                </div>`;
    });

    todosContainer.innerHTML = sum;
  }
  render();
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    tasks.push({
      task: inputTitle.value,
      taskDet: inputDetails.value,
      imp: check.checked,
      completed: false,
    });
    // console.log(tasks);
    localStorage.setItem("todoList", JSON.stringify(tasks));
    inputTitle.value = "";
    inputDetails.value = "";
    check.checked = false;
    render();
  });
  todosContainer.addEventListener("click", (e) => {
    const item = e.target.closest(".listitems");
    if (!item) return;
    const textP = item.querySelector(".text");
    console.log(textP);
    // console.log(e.target.classList.contains("delete"));
    if (e.target.classList.contains("delete")) {
      tasks.splice(Number(e.target.id), 1);
    }
    if (e.target.classList.contains("completed")) {
      tasks[Number(e.target.id)].completed =
        !tasks[Number(e.target.id)].completed;
    }
    localStorage.setItem("todoList", JSON.stringify(tasks));
    render();
  });
}
function dailyPlanner() {
  let listConatiner = document.querySelector(".dailyplanner-page .bot .inside");
  let items = document.querySelectorAll(
    ".dailyplanner-page .bot .inside .items"
  );
  let inputText = document.querySelector(
    ".dailyplanner-page .bot .inside .items input"
  );
  let dayplanData = JSON.parse(localStorage.getItem("dailyplanData")) || {};

  function renderTime() {
    let cluster = "";

    function formatTime(hour) {
      const period = hour >= 12 ? "pm" : "am";
      const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
      return `${formattedHour}:${period}`;
    }

    let hours = Array.from({ length: 18 }, (_, idx) => {
      const startHour = 5 + idx;
      const endHour = startHour + 1;

      return `${formatTime(startHour)}-${formatTime(endHour)}`;
    });

    hours.forEach((elem, idx) => {
      let str = dayplanData[idx] || "";
      cluster += ` <div class="items" id=${idx}>
                     <p>${elem}</p>
                     <input id=${idx} type="text"  placeholder="add your plan..." value="${str}">
                  </div>`;
    });
    listConatiner.innerHTML = cluster;
  }
  renderTime();

  listConatiner.addEventListener("input", (e) => {
    console.log(e.target.id);
    dayplanData[e.target.id] = e.target.value;
    localStorage.setItem("dailyplanData", JSON.stringify(dayplanData));
    // console.log(dayplanData);
  });
}

function motivationalQuote() {
  let textDiv = document.querySelector(
    ".motivational-page .bot .quoteDiv .quote"
  );
  let authorName = document.querySelector(
    ".motivational-page .bot .quoteDiv .name"
  );
  let btn = document.querySelector(".motivational-page .bot .inside .btn");

  async function fetchQuote() {
    let response = await fetch(
      "https://random-quotes-freeapi.vercel.app/api/random"
    );
    let val = await response.json();
    // quote author
    quote = val.quote;
    author = val.author;
    console.log(quote, author);
    textDiv.innerHTML = quote;
    authorName.innerHTML = `"${author}"`;
  }
  btn.addEventListener("click", () => {
    fetchQuote();
  });
}

function pomoDoro() {
  let pomodoroTab = document.querySelector(
    ".pomodoro-page .bot .timerDiv .tabs .pomo"
  );
  let shortBreakTab = document.querySelector(
    ".pomodoro-page .bot .timerDiv .tabs .shortBreak"
  );
  let longBreakTab = document.querySelector(
    ".pomodoro-page .bot .timerDiv .tabs .longBreak"
  );
  let timerDiv = document.querySelector(".pomodoro-page .bot .timerDiv .timer");
  let startBtn = document.querySelector(
    ".pomodoro-page .bot .timerDiv .btn .btn1"
  );
  let resetBtn = document.querySelector(
    ".pomodoro-page .bot .timerDiv .btn .btn2"
  );

  //timers
  const timer1 = {
    minutes: 25,
    seconds: 0,
    startMinutes: 25,
    intervalId: null,
  };
  const timer2 = {
    minutes: 5,
    seconds: 0,
    startMinutes: 5,
    intervalId: null,
  };
  const timer3 = {
    minutes: 10,
    seconds: 0,
    startMinutes: 10,
    intervalId: null,
  };

  let activeTimer = timer1;

  //reset the time
  function reset(timer) {
    clearInterval(timer.intervalId);
    timer.intervalId = null;
    timer.minutes = timer.startMinutes;
    timer.seconds = 0;
    render(timer);
  }

  //render on screen
  function render(timer) {
    timerDiv.innerHTML = `${timer.minutes} 
    <span><i class="ri-circle-fill"></i><i class="ri-circle-fill"></i></span>
    ${timer.seconds.toString().padStart(2, "0")}`;
  }

  //updateds the time
  function updateTimer(timer) {
    if (timer.intervalId) return;

    timer.intervalId = setInterval(() => {
      if (timer.minutes === 0 && timer.seconds === 0) {
        clearInterval(timer.intervalId);
        timer.intervalId = null;
        return;
      }

      if (timer.seconds === 0) {
        timer.minutes--;
        timer.seconds = 59;
      } else {
        timer.seconds--;
      }

      render(timer);
    }, 1000);
  }
  // switch timer and resets the old timer instantly
  function switchTimer(newTimer) {
    // 1️⃣ Reset the currently active timer
    reset(activeTimer);

    // 2️⃣ Switch active timer
    activeTimer = newTimer;

    // 3️⃣ Render the new timer
    render(activeTimer);
  }

  pomodoroTab.addEventListener("click", () => {
    switchTimer(timer1);
  });

  shortBreakTab.addEventListener("click", () => {
    switchTimer(timer2);
  });
  longBreakTab.addEventListener("click", () => {
    switchTimer(timer3);
  });

  startBtn.addEventListener("click", () => {
    updateTimer(activeTimer);
  });

  resetBtn.addEventListener("click", () => {
    reset(activeTimer);
  });
}

function weather() {
  let apiKey = "e14e105c8eb24b31b0a155937260201";
  let placeDiv = document.querySelector(".weather-sec1 .place");
  let tempDiv = document.querySelector(".weather-sec1 .temp");
  let conditionDiv = document.querySelector(".weather-sec1 .condition");
  let dateDiv = document.querySelector(".weather-sec1 .date");
  let icon = document.querySelector(".weather-sec1 .icon");
  let timeDiv = document.querySelector(".weather-sec3 h1");
  let humidity = document.querySelector(".weather-sec2 .Humidity");
  let wind = document.querySelector(".weather-sec2 .wind");
  let feelLike = document.querySelector(".weather-sec2 .feelLike");
  let pm2 = document.querySelector(".weather-sec2 .pm2");
  let uv = document.querySelector(".weather-sec2 .uv");
  let visibility = document.querySelector(".weather-sec2 .visibility");

  function getDate() {
    const now = new Date();
    const dayName = now.toLocaleString("en-US", { weekday: "long" });

    const formattedDate = `${dayName}, ${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // console.log(formattedDate);
    dateDiv.innerHTML = formattedDate;
  }
  function updateClock() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    timeDiv.innerHTML = `${hours}:${minutes}<span class="seconds">:${seconds}</span> `;
  }
  document.addEventListener("DOMContentLoaded", () => {
    updateClock(); // show immediately
    setInterval(updateClock, 1000); // update every second
  });

  async function getWeather() {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=yes`
      );

      const data = await response.json();
      console.log(data.location);
      console.log(data.current);
      icon.src = data.current.condition.icon;
      conditionDiv.innerHTML = data.current.condition.text;
      placeDiv.innerHTML = data.location.name;
      tempDiv.innerHTML = `${Math.floor(data.current.temp_c)}°C`;
      humidity.innerHTML = `${Math.floor(data.current.humidity)}`;
      wind.innerHTML = `${Math.floor(
        data.current.wind_kph
      )}<span class="km">km/h</span> `;
      feelLike.innerHTML = `${Math.floor(
        data.current.feelslike_c
      )}<span class="celcius">°C</span>`;
      pm2.innerHTML = `${Math.floor(data.current.air_quality.pm2_5)}`;
      uv.innerHTML = data.current.uv;
      visibility.innerHTML = `${data.current.vis_km}<span class="km">km</span> `;
      getDate();
    });
  }

  getWeather();
}

function kanbanBoard() {
  let todoDiv = document.querySelector(
    ".kanban-page .bot .todo-sec .bottom-sec"
  );
  let addTaskBtn = document.querySelector(".kanban-page .bot .add-taskbtn");
  let formDiv = document.querySelector(".kanban-page .bot .add-form");
  let form = document.querySelector(".kanban-page .bot .add-form form");
  let closeFormBtn = document.querySelector(
    ".kanban-page .bot .add-form .close-form"
  );
  let inprogressDiv = document.querySelector(
    ".kanban-page .bot .inprogress-sec .bottom-sec"
  );
  let doneDiv = document.querySelector(
    ".kanban-page .bot .done-sec .bottom-sec"
  );

  let dragItem = null;
  let taskData = {};

  // Load tasks from localStorage
  function loadTasks() {
    if (localStorage.getItem("tasks")) {
      const data = JSON.parse(localStorage.getItem("tasks"));
      console.log("Loading tasks:", data);

      for (const colId in data) {
        // Find column by its parent's id
        let targetDiv = document.querySelector(`#${colId} .bottom-sec`);

        if (targetDiv && data[colId]) {
          data[colId].forEach((task) => {
            const item = createTaskElement(task.title, task.description);
            targetDiv.appendChild(item);
          });
        }
      }
      updateTaskCounts();
    }
  }

  // Create task element
  function createTaskElement(title, description) {
    const item = document.createElement("div");
    item.className = "todo-items";
    item.draggable = true;

    item.innerHTML = `
      <div class="text-wrapper">
        <div class="task">${title}</div>
        <div class="decription">${description}</div>
      </div>
      <p class="delete-btn">delete</p>
    `;

    // Add drag event listener
    item.addEventListener("dragstart", (e) => {
      dragItem = item;
    });

    // Add delete functionality
    const deleteBtn = item.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
      item.remove();
      saveTasksToLocalStorage();
      updateTaskCounts();
    });

    return item;
  }

  // Update task counts
  function updateTaskCounts() {
    document.querySelectorAll(".task-column").forEach((col) => {
      let tasks = col.querySelectorAll(".todo-items");
      let count = col.querySelector(".upper .count");
      if (count) {
        count.textContent = `task count : ${tasks.length}`;
      }
    });
  }

  // Save tasks to localStorage
  function saveTasksToLocalStorage() {
    taskData = {};

    // Save todo tasks
    const todoTasks = todoDiv.querySelectorAll(".todo-items");
    taskData["todo"] = Array.from(todoTasks).map((t) => ({
      title: t.querySelector(".task").textContent,
      description: t.querySelector(".decription").textContent,
    }));

    // Save progress tasks
    const progressTasks = inprogressDiv.querySelectorAll(".todo-items");
    taskData["progress"] = Array.from(progressTasks).map((t) => ({
      title: t.querySelector(".task").textContent,
      description: t.querySelector(".decription").textContent,
    }));

    // Save done tasks
    const doneTasks = doneDiv.querySelectorAll(".todo-items");
    taskData["done"] = Array.from(doneTasks).map((t) => ({
      title: t.querySelector(".task").textContent,
      description: t.querySelector(".decription").textContent,
    }));

    console.log("Saving tasks:", taskData);
    localStorage.setItem("tasks", JSON.stringify(taskData));
  }

  // Form features handling
  function formHandling() {
    addTaskBtn.addEventListener("click", () => {
      formDiv.classList.add("active");
    });

    closeFormBtn.addEventListener("click", () => {
      formDiv.classList.remove("active");
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = e.target.querySelector(".task-input").value;
      const desc = e.target.querySelector(".desc-input").value;

      const item = createTaskElement(title, desc);
      todoDiv.appendChild(item);

      saveTasksToLocalStorage();
      updateTaskCounts();

      formDiv.classList.remove("active");
      e.target.reset();
    });
  }

  // Drag functionality
  function dragFunctionality(targetDiv) {
    targetDiv.addEventListener("dragenter", (e) => {
      e.preventDefault();
      targetDiv.classList.add("hover-over");
    });

    targetDiv.addEventListener("dragleave", (e) => {
      e.preventDefault();
      targetDiv.classList.remove("hover-over");
    });

    targetDiv.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    targetDiv.addEventListener("drop", (e) => {
      e.preventDefault();
      targetDiv.classList.remove("hover-over");

      if (dragItem) {
        targetDiv.appendChild(dragItem);
        saveTasksToLocalStorage();
        updateTaskCounts();
      }
    });
  }

  // Initialize drag functionality for all columns
  dragFunctionality(inprogressDiv);
  dragFunctionality(doneDiv);
  dragFunctionality(todoDiv);

  // Initialize form handling
  formHandling();

  // Load existing tasks
  loadTasks();
}

pages();
kanbanBoard();
weather();
pomoDoro();
motivationalQuote();
dailyPlanner();
todo();
