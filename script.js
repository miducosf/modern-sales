(function(){
  'use strict';

  const actions = {
    email(){ console.log('[SIMPLE] Email open'); },
    text(){ console.log('[SIMPLE] Text open'); },
    video(){ console.log('[SIMPLE] Video open'); },
    calendar(){ console.log('[SIMPLE] Calendar open'); },
    tasks(){ console.log('[SIMPLE] Tasks open'); },
    photos(){ console.log('[SIMPLE] Photos open'); },
  };
  document.querySelectorAll('.icon-hit').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const key = [...btn.classList].find(c=>actions[c]);
      if (key) actions[key]();
    });
  });

  // Feedback reveal timing (approximate; edit if needed)
  const FEEDBACK_DELAY_MS = 20000;
  const feedback = document.getElementById('mentorFeedback');
  const dismiss = feedback.querySelector('.dismiss');
  dismiss.addEventListener('click', ()=> feedback.classList.add('hidden'));

  function showFeedback(){ feedback.classList.remove('hidden'); }
  window.SIMPLE = Object.assign(window.SIMPLE || {}, { showFeedback });

  let timer;
  function startTimer(){ clearTimeout(timer); timer = setTimeout(showFeedback, FEEDBACK_DELAY_MS); }
  document.addEventListener('visibilitychange', ()=>{ if (!document.hidden) startTimer(); });
  startTimer();

})();