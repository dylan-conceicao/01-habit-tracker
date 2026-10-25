// Find the elements we need on the page
const form = document.getElementById("habit-form");
const input = document.getElementById("habit-input");
const list = document.getElementById("habit-list");
const resetButton = document.getElementById("reset-button");

resetButton.addEventListener("click", function () {
  const sure = confirm("Delete all your habits and their history? This can't be undone.");
  if (sure) {
    habits = [];
    localStorage.removeItem("habit-tracker:habits");
    render();
  }
});

// All our habits live in this array
let habits = [];

// Run this when the form is submitted (Add clicked, or Enter pressed)
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  const name = input.value.trim();
  if (name === "") {
    return; // ignore empty habits
  }

  habits.push({ name: name, done: [] });
  save();
  input.value = "";
  render();
});

// Draw the list of habits on the page
function render() {
  list.innerHTML = "";
  const days = lastSevenDays();
  const todayKey = dateKey(new Date());

  for (const habit of habits) {
    const item = document.createElement("li");
    item.className = "habit";

    // The top line: the habit's name
    const header = document.createElement("div");
    header.className = "habit-header";
    const title = document.createElement("h2");
    title.textContent = habit.name;
    header.appendChild(title);
        const streak = getStreak(habit);
    const badge = document.createElement("span");
    badge.className = "streak";
    if (streak === 0) {
      badge.textContent = "No streak yet";
    } else if (streak === 1) {
      badge.textContent = "1 day streak";
    } else {
      badge.textContent = streak + " day streak";
    }
    header.appendChild(badge);
    item.appendChild(header);

    // The row of 7 circles
    const grid = document.createElement("div");
    grid.className = "grid";

    for (const day of days) {
      const key = dateKey(day);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.textContent = day.toLocaleDateString("en", { weekday: "short" });
      cell.title = day.toDateString();

      if (habit.done.includes(key)) {
        cell.classList.add("done");
      }
      if (key === todayKey) {
        cell.classList.add("today");
      }

      cell.addEventListener("click", function () {
        toggleDay(habit, key);
      });
      grid.appendChild(cell);
    }

    item.appendChild(grid);
    list.appendChild(item);
  }
}

// Save the habits array into the browser's storage
function save() {
  localStorage.setItem("habit-tracker:habits", JSON.stringify(habits));
}

// Load saved habits, if there are any
function load() {
  const saved = localStorage.getItem("habit-tracker:habits");
  if (saved) {
    habits = JSON.parse(saved);
  }
}

// Turn a date into text like "2026-10-25"
function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Make a list of the last 7 days, oldest first, ending today
function lastSevenDays() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    days.push(day);
  }
  return days;
}

// Tick a day off, or untick it if it was already ticked
function toggleDay(habit, key) {
  if (habit.done.includes(key)) {
    habit.done = habit.done.filter(function (d) { return d !== key; });
  } else {
    habit.done.push(key);
  }
  save();
  render();
}

// Count how many days in a row this habit was done
function getStreak(habit) {
  let streak = 0;
  const day = new Date();

  // Today not ticked yet? Start counting from yesterday.
  if (!habit.done.includes(dateKey(day))) {
    day.setDate(day.getDate() - 1);
  }

  // Step back one day at a time until we find a day that wasn't done
  while (habit.done.includes(dateKey(day))) {
    streak++;
    day.setDate(day.getDate() - 1);
  }

  return streak;
}

// Start the app
load();
render();