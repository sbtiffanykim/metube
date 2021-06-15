const videoContainer = document.getElementById("videoContainer");
const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const totalTime = document.getElementById("totalTime");
const currentTime = document.getElementById("currentTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenBtnIcon = fullScreenBtn.querySelector("i");
const videoController = document.getElementById("videoController");

let controllerTimeout = null;
let mouseMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substr(14, 5);

const handlePlay = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMute = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volumeRange.value = video.muted ? "0" : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtnIcon.classList = "fas fa-volume-up";
  }
  volumeValue = value;
  video.volume = value;
};

const handleLodedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullScreenBtn = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenBtnIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenBtnIcon.classList = "fas fa-compress";
  }
};

const hideControls = () => videoController.classList.remove("showing");

const handleMouseover = () => {
  // if a user mouse over to the video within 3 seconds
  if (controllerTimeout) {
    // cancel the timeout
    clearTimeout(controllerTimeout);
    // clear the timeout id
    controllerTimeout = null;
  }
  // when a user keep moving mouse on a video, the controller would not be disappeared
  if (mouseMovementTimeout) {
    clearTimeout(mouseMovementTimeout);
    mouseMovementTimeout = null;
  }
  videoController.classList.add("showing");
  // if a user sopts moving mouse for 3 seconds, the controller would be disappeared
  mouseMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseleave = () => {
  // set the timeout id
  controllerTimeout = setTimeout(() => {
    hideControls;
  }, 3000);
};

const handleVideoClick = () => {
  handlePlay();
};

const handleKeyDown = (event) => {
  const { keyCode } = event;
  if (keyCode === 32) {
    event.preventDefault();
    handlePlay();
  }
  // up arrow
  if (keyCode === 38) {
  }
  // down arrow
  // forward
  // backward
};

document.addEventListener("keydown", handleKeyDown);
playBtn.addEventListener("click", handlePlay);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadeddata", handleLodedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("mouseover", handleMouseover);
video.addEventListener("mouseleave", handleMouseleave);
video.addEventListener("click", handleVideoClick);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreenBtn);
