(function(){
  'use strict';

  (async function init(){
    const content = await fetch('assets/content.json').then(r=>r.json());

    // Static mentor copy + preload avatar when panel appears (panel is present from start; prefetch anyway)
    const mentorCopy = document.getElementById('mentorCopy');
    const mentorPanel = document.getElementById('mentorFeedback');
    if (mentorCopy) mentorCopy.textContent = content.opening.mentorIntro || '';
    const preloadAvatar = new Image(); preloadAvatar.src = 'assets/sales-manager.jpg';

    // Start hint behavior
    const video = document.getElementById('openerVideo');
    const hint = document.getElementById('startHint');
    const hideHint = ()=> { if (hint) hint.style.display='none'; };
    ['play','seeking','timeupdate','volumechange'].forEach(ev=> video.addEventListener(ev, hideHint));
    video.addEventListener('click', hideHint);

    // Choice mount
    const mount = document.getElementById('choiceMount');
    function slidePanel(html){
      mount.innerHTML = '';
      const panel = document.createElement('div');
      panel.className = 'panel';
      panel.innerHTML = html;
      mount.appendChild(panel);
      requestAnimationFrame(()=> panel.classList.add('show'));
    }

    function showMentor(text){
      if (text) mentorCopy.textContent = text;
    }

    function chooseOutcome(choiceId){
      const good = new Set(content.routingRules.positiveIds);
      return good.has(choiceId) ? 'positive' : 'negative';
    }

    function goFinal(choiceId){
      const path = chooseOutcome(choiceId);
      const final = content.videoFinal[path];
      slidePanel(`
        <div style="display:flex; gap:10px; align-items:flex-start">
          <div style="font-weight:600">Jamie:</div>
          <div>${final.clientVideoText}</div>
        </div>
      `);
      showMentor(final.mentorFeedback);
    }

    function renderOptions(block){
      const rows = block.options.map(opt => `
        <div style="padding:10px 0; border-top:1px solid rgba(2,8,23,.08)">
          <div style="font-weight:600; margin-bottom:6px">${opt.label}</div>
          ${opt.learnerText ? `<div style="margin-bottom:8px">${opt.learnerText}</div>` : ''}
          <button data-id="${opt.id}" style="padding:8px 10px; border-radius:10px; border:1px solid rgba(2,8,23,.15); background:#f8fafc; cursor:pointer">Send</button>
        </div>
      `).join('');
      slidePanel(`<div><div style="font-size:12px; opacity:.7; margin-bottom:6px">${block.title}</div>${rows}</div>`);

      mount.querySelectorAll('[data-id]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const id = btn.getAttribute('data-id');
          const opt = block.options.find(o=>o.id===id);
          slidePanel(`
            <div style="display:flex; flex-direction:column; gap:12px">
              <div><span style="font-weight:600">You:</span> ${opt.learnerText || ''}</div>
              <div><span style="font-weight:600">Jamie:</span> ${opt.clientResponse}</div>
            </div>
          `);
          showMentor(opt.mentorFeedback);
          goFinal(id);
        });
      });
    }

    function renderVideoImmediate(block){
      slidePanel(`
        <div style="display:flex; flex-direction:column; gap:12px">
          <div><span style="font-weight:600">Jamie:</span> ${block.clientLine}</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap">
            ${block.options.map(o=>`<button data-id="${o.id}" style="padding:8px 10px; border-radius:10px; border:1px solid rgba(2,8,23,.15); background:#f8fafc; cursor:pointer">${o.label}</button>`).join('')}
          </div>
        </div>
      `);
      mount.querySelectorAll('[data-id]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const id = btn.getAttribute('data-id');
          const opt = block.options.find(o=>o.id===id);
          slidePanel(`<div><span style="font-weight:600">You:</span> ${opt.learnerLine}</div>`);
          showMentor(opt.mentorFeedback);
          goFinal(id);
        });
      });
    }

    // Wire icon buttons directly
    const q = c => document.querySelector(`.icon-hit.${c}`);
    q('email')?.addEventListener('click', ()=> renderOptions(content.interactions.email));
    q('text')?.addEventListener('click', ()=> renderOptions(content.interactions.text));
    q('video')?.addEventListener('click', ()=> renderVideoImmediate(content.interactions.videoImmediate));
  })();
})();