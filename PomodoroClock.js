// filepath: d:\application_folder\PomodoroClock\pomodoro.js

let timer; // Variable to hold the timer interval
let currentDuration = 0; // Current duration in seconds
let totalDuration = 0; // Total duration for progress calculation

// Load sound files
const startOfShortBreakSound = new Audio("../sounds/StartOfShortBreak.mp3");
const startOfLongBreakSound = new Audio("../sounds/StartOfLongBreak.mp3");
const endOfBreakSound = new Audio("../sounds/EndOfBrake.mp3");

let previousSegmentType = null; // Track the previous segment type

// Function to generate the schedule dynamically
function generateSchedule() {
  const schedule = [];
  const firstWorkDuration = 50 * 60; // 50 minutes in seconds
  const midWorkDuration = 30 * 60; // 30 minutes in seconds
  const lastWorkDuration = 20 * 60; // 20 minutes for Pomodoros 13 to 17
  const shortBreakDuration = 10 * 60; // 10 minutes in seconds
  const longBreakDuration = 40 * 60; // 40 minutes in seconds
  const subsequentShortBreakDuration = 5 * 60; // 5 minutes in seconds
  const subsequentLongBreakDuration = 20 * 60; // 20 minutes in seconds

  let currentTime = new Date("2025-04-07T08:00:00"); // Start at 8:00 AM
  const endTime = new Date("2025-04-07T19:00:00"); // End at 7:00 PM

  let workCount = 0;
  let breakCount = 0;

  while (currentTime < endTime) {
    // Determine work duration
    let workDuration;
    if (workCount < 4) {
      workDuration = firstWorkDuration; // First 4 Pomodoros are 50 minutes
    } else if (workCount >= 4 && workCount < 12) {
      workDuration = midWorkDuration; // Pomodoros 5 to 12 are 30 minutes
    } else {
      workDuration = lastWorkDuration; // Pomodoros 13 to 17 are 20 minutes
    }

    // Add a work period
    const workEnd = new Date(currentTime.getTime() + workDuration * 1000);
    if (workEnd > endTime) break; // Stop if the work period exceeds the end time
    schedule.push({ start: formatTime(currentTime), end: formatTime(workEnd), type: "work" });
    currentTime = workEnd;

    workCount++;

    // Stop adding breaks after the last Pomodoro
    if (workCount === 17) break;

    // Determine break duration
    let breakDuration;
    if (workCount <= 4) {
      // First 4 breaks
      breakDuration = (workCount % 4 === 0) ? longBreakDuration : shortBreakDuration;
    } else {
      // Subsequent breaks
      breakCount++;
      breakDuration = (breakCount % 4 === 0) ? subsequentLongBreakDuration : subsequentShortBreakDuration;
    }

    const breakEnd = new Date(currentTime.getTime() + breakDuration * 1000);

    // Add a break period
    if (breakEnd <= endTime) {
      schedule.push({ start: formatTime(currentTime), end: formatTime(breakEnd), type: "break" });
      currentTime = breakEnd;
    } else {
      break; // Stop if the break period exceeds the end time
    }
  }

  return schedule;
}

// Generate the schedule
const schedule = generateSchedule();

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
    return;
  }

  const now = new Date();
  const segmentEnd = new Date(`2025-04-07T${segment.end}:00`);
  currentDuration = Math.floor((segmentEnd - now) / 1000); // Remaining time in seconds
  totalDuration = Math.floor((new Date(`2025-04-07T${segment.end}:00`) - new Date(`2025-04-07T${segment.start}:00`)) / 1000);

  const timerDisplay = document.getElementById("timer");
  timerDisplay.textContent = formatTimeDisplay(currentDuration);
  updateProgressRing(segment.type);

  // Debugging logs
  console.log("Segment type:", segment.type);
  console.log("Break duration:", totalDuration / 60);
  console.log("Previous segment type:", previousSegmentType);

  // Play sound when the segment changes
  if (segment.type !== previousSegmentType) {
    if (segment.type === "work") {
      endOfBreakSound.play(); // Play sound when a work period starts
    } else if (segment.type === "break") {
      const breakDuration = totalDuration / 60; // Convert seconds to minutes
      if (breakDuration === 10 || breakDuration === 5) {
        startOfShortBreakSound.play(); // Play short break sound
      } else if (breakDuration === 40 || breakDuration === 20) {
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