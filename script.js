const video = document.getElementById('trainingVideo');
const playHint = document.getElementById('play-hint');
const mentorBox = document.getElementById('mentor');

video.addEventListener('play', () => {
  playHint.style.display = 'none';
});

video.addEventListener('timeupdate', () => {
  if (video.currentTime / video.duration > 0.95) {
    showMentor();
  }
});

video.addEventListener('ended', () => {
  showMentor();
});

function showMentor() {
  mentorBox.classList.add('show');
}
