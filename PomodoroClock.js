// filepath: d:\application_folder\PomodoroClock\pomodoro.js

let timer; // Variable to hold the timer interval
let currentDuration = 0; // Current duration in seconds
let totalDuration = 0; // Total duration for progress calculation

// Load sound files with error handling
const startOfShortBreakSound = new Audio("../sounds/StartOfShortBreak.mp3");
startOfShortBreakSound.onerror = () => console.error("Failed to load StartOfShortBreak.mp3");

const startOfLongBreakSound = new Audio("../sounds/StartOfLongBreak.mp3");
startOfLongBreakSound.onerror = () => console.error("Failed to load StartOfLongBreak.mp3");

const endOfBreakSound = new Audio("../sounds/EndOfBrake.mp3");
endOfBreakSound.onerror = () => console.error("Failed to load EndOfBrake.mp3");

let previousSegmentType = null; // Track the previous segment type

// Function to generate the schedule dynamically
function generateSchedule() {
  const schedule = [];
  const firstWorkDuration = 50 * 60; // 50 minutes in seconds
  const shortBreakDuration = 10 * 60; // 10 minutes in seconds
  const longBreakDuration = 45 * 60; // 45 minutes in seconds
  const secondPhaseWorkDuration = 25 * 60; // 25 minutes in seconds
  const secondPhaseBreakDuration = 5 * 60; // 5 minutes in seconds

  let currentTime = new Date();
  currentTime.setHours(8, 0, 0, 0); // Start at 8:00 AM

  // First Phase: 7 cycles of 50-10, with a long break after the 4th Pomodoro
  for (let i = 1; i <= 7; i++) {
    // Add a work period
    const workEnd = new Date(currentTime.getTime() + firstWorkDuration * 1000);
    schedule.push({ start: new Date(currentTime), end: new Date(workEnd), type: "work" });
    currentTime = workEnd;

    // Add a break period
    if (i < 7) { // No break after the last work period in this phase
      const breakDuration = (i === 4) ? longBreakDuration : shortBreakDuration;
      const breakEnd = new Date(currentTime.getTime() + breakDuration * 1000);
      schedule.push({ start: new Date(currentTime), end: new Date(breakEnd), type: "break" });
      currentTime = breakEnd;
    }
  }

  // Second Phase: 8 cycles of 25-5
  for (let i = 1; i <= 8; i++) {
    // Add a work period
    const workEnd = new Date(currentTime.getTime() + secondPhaseWorkDuration * 1000);
    schedule.push({ start: new Date(currentTime), end: new Date(workEnd), type: "work" });
    currentTime = workEnd;

    // Add a break period
    if (i < 8) { // No break after the last work period in this phase
      const breakEnd = new Date(currentTime.getTime() + secondPhaseBreakDuration * 1000);
      schedule.push({ start: new Date(currentTime), end: new Date(breakEnd), type: "break" });
      currentTime = breakEnd;
    }
  }

  return schedule;
}

// Generate the schedule
const schedule = generateSchedule();

// Function to create dots for the Pomodoro schedule
function createDots() {
  const dotsContainer = document.querySelector(".dots-container");
  dotsContainer.innerHTML = ""; // Clear any existing dots

  // Create one dot for each work segment in the schedule
  schedule.forEach((segment, index) => {
    if (segment.type === "work") { // Only create dots for work periods
      const dot = document.createElement("div");
      dot.classList.add("dot");
      dot.dataset.index = index; // Store the index for reference
      dotsContainer.appendChild(dot);
    }
  });
}

// Function to update the dots based on the current segment
function updateDots() {
  const now = new Date();

  schedule.forEach((segment, index) => {
    const dot = document.querySelector(`.dot[data-index="${index}"]`);
    if (!dot) return;

    if (now >= segment.end) {
      // Pomodoro has been completed
      dot.classList.remove("active");
      dot.classList.add("completed");
    } else if (now >= segment.start && now < segment.end) {
      // Pomodoro is currently active
      dot.classList.add("active");
      dot.classList.remove("completed");
    } else {
      // Pomodoro has not started yet
      dot.classList.remove("active");
      dot.classList.remove("completed");
    }
  });

  // Ensure the last dot is marked as completed when the timer ends
  const lastSegment = schedule[schedule.length - 1];
  if (lastSegment && new Date() >= lastSegment.end) {
    const lastDot = document.querySelector(".dot:last-child");
    if (lastDot) {
      lastDot.classList.remove("active");
      lastDot.classList.add("completed");
    }
  }
}

// Call createDots after generating the schedule
createDots();

// Function to get the current segment from the schedule
function getCurrentSegment() {
  const now = new Date();
  return schedule.find((segment) => now >= segment.start && now < segment.end);
}

// Function to update the timer display
function updateDisplay() {
  const segment = getCurrentSegment();
  if (!segment) {
    // If no segment is found, clear the timer and stop the last dot from blinking
    clearInterval(timer);

    // Ensure the last dot is marked as completed
    const lastDot = document.querySelector(".dot:last-child");
    if (lastDot) {
      lastDot.classList.remove("active");
      lastDot.classList.add("completed");
    }

    return; // Do not display any additional text
  }

  const now = new Date();
  const segmentEnd = segment.end;

  // Calculate remaining time based on the difference between now and segmentEnd
  currentDuration = Math.floor((segmentEnd - now) / 1000); // Remaining time in seconds
  totalDuration = Math.floor((segment.end - segment.start) / 1000); // Total duration in seconds

  // Ensure the timer doesn't display negative values
  if (currentDuration < 0) {
    currentDuration = 0;
  }

  const timerDisplay = document.getElementById("timer");
  timerDisplay.textContent = formatTimeDisplay(currentDuration);
  updateProgressRing(segment.type);

  // Update the dots
  updateDots();

  // Play sound when the segment changes
  if (segment.type !== previousSegmentType) {
    if (segment.type === "work") {
      endOfBreakSound.play(); // Play sound when a work period starts
    } else if (segment.type === "break") {
      const breakDuration = totalDuration / 60; // Convert seconds to minutes
      if (breakDuration === 10 || breakDuration === 5) {
        startOfShortBreakSound.play(); // Play short break sound
      } else if (breakDuration === 45) {
        startOfLongBreakSound.play(); // Play long break sound
      }
    }
    previousSegmentType = segment.type; // Update the previous segment type
  }
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

  let progress;
  if (type === "work") {
    // Counterclockwise for work: progress decreases from 100% to 0%
    progress = (currentDuration / totalDuration) * 100;
  } else {
    // Clockwise for break: progress increases from 0% to 100%
    progress = ((totalDuration - currentDuration) / totalDuration) * 100;
  }

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

// Start the timer automatically
timer = setInterval(updateDisplay, 1000);
updateDisplay();