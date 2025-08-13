(function(){
  'use strict';

  // Expose simple hooks for integration with your app.
  // Replace these with your real screen loaders when ready.
  function openEmail(){ window.SIMPLE?.openEmail?.() ?? console.log('[SIMPLE] Email'); }
  function openText(){ window.SIMPLE?.openText?.() ?? console.log('[SIMPLE] Text'); }
  function openVideo(){ window.SIMPLE?.openVideo?.() ?? console.log('[SIMPLE] Video'); }
  function openCalendar(){ window.SIMPLE?.openCalendar?.() ?? console.log('[SIMPLE] Calendar'); }
  function openTasks(){ window.SIMPLE?.openTasks?.() ?? console.log('[SIMPLE] Tasks'); }
  function openPhotos(){ window.SIMPLE?.openPhotos?.() ?? console.log('[SIMPLE] Photos'); }

  const actions = { email:openEmail, text:openText, video:openVideo, calendar:openCalendar, tasks:openTasks, photos:openPhotos };

  document.querySelectorAll('.icon-hit').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = [...btn.classList].find(c => actions[c]);
      actions[key]?.();
    });
    // Keyboard activate
    btn.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });
})();