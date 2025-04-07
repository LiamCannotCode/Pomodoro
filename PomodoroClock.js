// filepath: d:\application_folder\PomodoroClock\pomodoro.js

let timer; // Variable to hold the timer interval
let isRunning = false; // Flag to check if the timer is running
let currentDuration = 0; // Current duration in seconds
let totalDuration = 0; // Total duration for progress calculation
let isWorkPeriod = true; // Flag to track if it's a work period

// Define the schedule
const schedule = [
  { start: "08:00", end: "08:50", type: "work" },
  { start: "08:50", end: "09:00", type: "break" },
  { start: "09:00", end: "09:50", type: "work" },
  { start: "09:50", end: "10:00", type: "break" },
  { start: "10:00", end: "10:50", type: "work" },
  { start: "10:50", end: "11:00", type: "break" },
  { start: "11:00", end: "11:50", type: "work" },
  { start: "11:50", end: "12:30", type: "break" },
  { start: "12:30", end: "12:55", type: "work" },
  { start: "12:55", end: "13:00", type: "break" },
  { start: "13:00", end: "13:25", type: "work" },
  { start: "13:25", end: "13:30", type: "break" },
  { start: "13:30", end: "13:55", type: "work" },
  { start: "13:55", end: "14:00", type: "break" },
  { start: "14:00", end: "14:25", type: "work" },
  { start: "14:25", end: "14:30", type: "break" },
  { start: "14:30", end: "14:55", type: "work" },
  { start: "14:55", end: "15:00", type: "break" },
  { start: "15:00", end: "15:25", type: "work" },
  { start: "15:25", end: "15:30", type: "break" },
  { start: "15:30", end: "15:55", type: "work" },
  { start: "15:55", end: "16:00", type: "break" },
  { start: "16:00", end: "16:25", type: "work" },
  { start: "16:25", end: "16:30", type: "break" },
  { start: "16:30", end: "16:55", type: "work" },
  { start: "16:55", end: "17:00", type: "break" },
  { start: "17:00", end: "17:25", type: "work" },
  { start: "17:25", end: "17:30", type: "break" },
  { start: "17:30", end: "17:55", type: "work" },
  { start: "17:55", end: "18:00", type: "break" },
  { start: "18:00", end: "18:25", type: "work" },
  { start: "18:25", end: "18:30", type: "break" },
  { start: "18:30", end: "18:55", type: "work" },
  { start: "18:55", end: "19:00", type: "break" },
  { start: "19:00", end: "19:25", type: "work" },
  { start: "19:25", end: "19:30", type: "break" },
  { start: "19:30", end: "19:55", type: "work" },
  { start: "19:55", end: "20:00", type: "break" },
];

// Helper function to format time as HH:mm
function formatTime(date) {
  return date.toTimeString().slice(0, 5);
}

// Function to get the current segment from the schedule
function getCurrentSegment() {
  const now = new Date();
  const currentTime = formatTime(now);
  return schedule.find((segment) => currentTime >= segment.start && currentTime < segment.end);
}

// Function to update the timer display
function updateDisplay() {
  const segment = getCurrentSegment();
  if (!segment) {
    clearInterval(timer);
    isRunning = false;
    return;
  }

  const now = new Date();
  const segmentEnd = new Date(`2025-04-07T${segment.end}:00`);
  currentDuration = Math.floor((segmentEnd - now) / 1000); // Remaining time in seconds
  totalDuration = Math.floor((new Date(`2025-04-07T${segment.end}:00`) - new Date(`2025-04-07T${segment.start}:00`)) / 1000);

  const timerDisplay = document.getElementById("timer");
  timerDisplay.textContent = formatTimeDisplay(currentDuration);
  updateProgressRing(segment.type);
}

// Function to format time in mm:ss
function formatTimeDisplay(seconds) {
  const minutes = pad(Math.floor(seconds / 60));
  const secs = pad(seconds % 60);
  return `${minutes}:${secs}`;
}

// Helper function to pad numbers
function pad(num) {
  return String(num).padStart(2, "0");
}

// Function to update the progress ring
function updateProgressRing(type) {
  const circle = document.querySelector(".progress-ring");
  const radius = 45; // Radius of the circle
  const circumference = 2 * Math.PI * radius; // Circumference of the circle

  const progress = (currentDuration / totalDuration) * 100;
  const offset = circumference - (progress / 100) * circumference; // Calculate offset
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = offset;

  // Change the color of the progress ring based on the mode
  if (type === "work") {
    circle.style.stroke = "#ff4757"; // Red for work
  } else {
    circle.style.stroke = "#ffffff"; // White for break
  }
}

// Function to start the timer
function startTimer() {
  if (!isRunning) {
    isRunning = true;
    timer = setInterval(updateDisplay, 1000);
    updateDisplay();
  }
}

// Event listeners for buttons
document.getElementById("start-button").addEventListener("click", startTimer);
document.getElementById("reset-button").addEventListener("click", () => {
  clearInterval(timer);
  isRunning = false;
  updateDisplay();
});

// Initial display update
updateDisplay();