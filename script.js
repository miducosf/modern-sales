document.querySelectorAll('.icon-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    alert(`Clicked: ${btn.title}`);
  });
});

const debugToggle = document.querySelector('.debug-toggle');
debugToggle.addEventListener('click', () => {
  document.body.classList.toggle('debug');
});
