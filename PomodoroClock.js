// filepath: d:\application_folder\PomodoroClock\pomodoro.js

let timer; // Variable to hold the timer interval
let isRunning = false; // Flag to check if the timer is running
let workDuration = 25 * 60; // Work duration in seconds (25 minutes)
let breakDuration = 5 * 60; // Break duration in seconds (5 minutes)
let currentDuration = workDuration; // Current duration set to work duration

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
        // Switch to break or reset timer
        if (currentDuration === 0 && currentDuration === workDuration) {
          currentDuration = breakDuration; // Switch to break
        } else {
          currentDuration = workDuration; // Reset to work duration
        }
        updateDisplay();
      }
    }, 1000);
  }
}

// Function to reset the timer
function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  currentDuration = workDuration; // Reset to work duration
  updateDisplay();
}

// Event listeners for buttons
document.getElementById('start-button').addEventListener('click', startTimer);
document.getElementById('reset-button').addEventListener('click', resetTimer);

// Initial display update
updateDisplay();