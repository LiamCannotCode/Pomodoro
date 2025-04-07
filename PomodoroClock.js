// filepath: d:\application_folder\PomodoroClock\pomodoro.js

let timer; // Variable to hold the timer interval
let isRunning = false; // Flag to check if the timer is running
let workDuration = 15; // Work duration in seconds (15 seconds for testing)
let breakDuration = 15; // Break duration in seconds (15 seconds for testing)
let currentDuration = workDuration; // Current duration set to work duration
let totalDuration = workDuration; // Total duration for progress calculation
let isWorkPeriod = true; // Flag to track if it's a work period

// Helper function to pad numbers
function pad(num) {
  return String(num).padStart(2, '0');
}

// Function to format time in mm:ss
function formatTime(seconds) {
  const minutes = pad(Math.floor(seconds / 60));
  const secs = pad(seconds % 60);
  return `${minutes}:${secs}`;
}

// Function to update the timer display
function updateDisplay() {
  const timerDisplay = document.getElementById('timer');
  timerDisplay.textContent = formatTime(currentDuration);
  updateProgressRing();
}

// Function to update the progress ring
function updateProgressRing() {
  const circle = document.querySelector('.progress-ring');
  const radius = 45; // Radius of the circle
  const circumference = 2 * Math.PI * radius; // Circumference of the circle

  let progress;
  if (isWorkPeriod) {
    // For work time, progress goes from full to empty
    progress = (currentDuration / workDuration) * 100;
  } else {
    // For break time, progress goes from empty to full
    progress = ((breakDuration - currentDuration) / breakDuration) * 100;
  }

  const offset = circumference - (progress / 100) * circumference; // Calculate offset
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = offset;

  // Change the color of the progress ring based on the mode
  if (isWorkPeriod) {
    circle.style.stroke = "#ff4757"; // Red for work
  } else {
    circle.style.stroke = "#ffffff"; // White for break
  }
}

// Function to start the timer
function startTimer() {
  if (!isRunning) {
    isRunning = true;
    timer = setInterval(() => {
      if (currentDuration > 0) {
        currentDuration--;
        updateDisplay();
      } else {
        clearInterval(timer);
        isRunning = false;

        // Switch between work and break periods
        if (isWorkPeriod) {
          isWorkPeriod = false; // Switch to break
          currentDuration = breakDuration;
          totalDuration = breakDuration;
        } else {
          isWorkPeriod = true; // Switch to work
          currentDuration = workDuration;
          totalDuration = workDuration;
        }

        updateDisplay();
        startTimer(); // Automatically start the next phase
      }
    }, 1000);
  }
}

// Function to reset the timer
function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  isWorkPeriod = true; // Reset to work period
  currentDuration = workDuration; // Reset to work duration
  totalDuration = workDuration; // Reset total duration
  updateDisplay();

  // Set the ring color to white when the timer is reset
  const circle = document.querySelector('.progress-ring');
  circle.style.stroke = "#ffffff"; // White color
}

// Event listeners for buttons
document.getElementById('start-button').addEventListener('click', startTimer);
document.getElementById('reset-button').addEventListener('click', resetTimer);

// Initial display update
updateDisplay();