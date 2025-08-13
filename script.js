(function(){
  'use strict';

  const frame = document.querySelector('.bg-frame');
  const toast = document.getElementById('toast');
  const debugBtn = document.getElementById('debugToggle');
  const rootStyle = document.documentElement.style;

  // Ensure keyboard events go to this page (esp. if embedded in an iframe)
  frame.addEventListener('pointerdown', ()=> frame.focus());

  const actions = {
    email(){ say('Email opened'); },
    text(){ say('Text opened'); },
    video(){ say('Video opened'); },
    calendar(){ say('Calendar opened'); },
    tasks(){ say('Tasks opened'); },
    photos(){ say('Photos opened'); }
  };

  // Wire click actions
  document.querySelectorAll('.icon-hit').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const key = [...btn.classList].find(c=>actions[c]);
      if (key) actions[key]();
    });
  });

  // Toast helper
  let tmr;
  function say(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(tmr);
    tmr = setTimeout(()=> toast.classList.remove('show'), 1200);
  }

  // Debug toggle
  function toggleDebug(force){
    const on = typeof force === 'boolean' ? force : !document.body.classList.contains('debug');
    document.body.classList.toggle('debug', on);
    debugBtn.setAttribute('aria-pressed', on ? 'true':'false');
    say(on ? 'Debug ON (red overlays)' : 'Debug OFF');
  }
  debugBtn.addEventListener('click', ()=> toggleDebug());

  // Keyboard nudging
  let selection = 1; // 1..6
  // utility to read all vars & update HUD
  function getVars(){
    const getVar = (name)=> parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;
    return {
      left: getVar('--icon-left'), size: getVar('--icon-size'),
      t1: getVar('--icon1-top'), t2: getVar('--icon2-top'), t3: getVar('--icon3-top'),
      t4: getVar('--icon4-top'), t5: getVar('--icon5-top'), t6: getVar('--icon6-top')
    };
  }
  function renderHUD(){
    const vars = getVars();
    for (const [key,val] of Object.entries(vars)){
      const sel = key==='left' ? '--icon-left' : key==='size' ? '--icon-size' : `--icon${key.slice(1)}-top`;
      const el = document.querySelector(`[data-var="${sel}"]`);
      if (el) el.textContent = `${val.toFixed(2)}%`;
    }
  }
  renderHUD();
  document.addEventListener('keydown', (e)=>{
    // If focused inside an input/textarea, ignore
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

    if (e.key >= '1' && e.key <= '6'){ selection = parseInt(e.key,10); toggleDebug(true); say('Selected icon '+selection); return; }

    const step = (e.shiftKey ? 0.5 : 0.1); // percentage step
    const getVar = (name)=> parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;
    const setVar = (name,val)=> rootStyle.setProperty(name, (Math.round(val*1000)/1000) + '%');

    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){
      e.preventDefault();
      if (!document.body.classList.contains('debug')) toggleDebug(true);
      if (e.key === 'ArrowUp')   setVar(`--icon${selection}-top`, getVar(`--icon${selection}-top`) - step);
      if (e.key === 'ArrowDown') setVar(`--icon${selection}-top`, getVar(`--icon${selection}-top`) + step);
      if (e.key === 'ArrowLeft') setVar(`--icon-left`, getVar(`--icon-left`) - step);
      if (e.key === 'ArrowRight')setVar(`--icon-left`, getVar(`--icon-left`) + step);
      say(`left=${getVar('--icon-left').toFixed(2)}%, t${selection}=${getVar(`--icon${selection}-top`).toFixed(2)}%`);
      renderHUD();
      return;
    }
    if (e.key.toLowerCase()==='s'){
      e.preventDefault();
      setVar('--icon-size', Math.max(1, getVar('--icon-size') + (e.shiftKey ? 1 : 0.2)));
      say(`size=${getVar('--icon-size').toFixed(2)}%`);
      renderHUD();
      return;
    }
    if (e.key.toLowerCase()==='p' || e.key.toLowerCase()==='c'){
      e.preventDefault();
      const v = getVars();
      const text = `:root{\n  --icon-left: ${v.left.toFixed(2)}%;\n  --icon-size: ${v.size.toFixed(2)}%;\n  --icon1-top: ${v.t1.toFixed(2)}%;\n  --icon2-top: ${v.t2.toFixed(2)}%;\n  --icon3-top: ${v.t3.toFixed(2)}%;\n  --icon4-top: ${v.t4.toFixed(2)}%;\n  --icon5-top: ${v.t5.toFixed(2)}%;\n  --icon6-top: ${v.t6.toFixed(2)}%;\n}`;
      navigator.clipboard.writeText(text).then(()=> say('CSS copied to clipboard')).catch(()=> say('Copy failed'));
      renderHUD();
      return;
    }
    if (e.key.toLowerCase()==='d'){ toggleDebug(); }
  });

  // Auto-enable debug if ?debug is present
  if (location.search.includes('debug')) toggleDebug(true);
})();

  // Copy button in HUD
  const copyBtn = document.getElementById('copyVars');
  if (copyBtn){
    copyBtn.addEventListener('click', ()=>{
      const v = getVars();
      const text = `:root{\n  --icon-left: ${v.left.toFixed(2)}%;\n  --icon-size: ${v.size.toFixed(2)}%;\n  --icon1-top: ${v.t1.toFixed(2)}%;\n  --icon2-top: ${v.t2.toFixed(2)}%;\n  --icon3-top: ${v.t3.toFixed(2)}%;\n  --icon4-top: ${v.t4.toFixed(2)}%;\n  --icon5-top: ${v.t5.toFixed(2)}%;\n  --icon6-top: ${v.t6.toFixed(2)}%;\n}`;
"
      "navigator.clipboard.writeText(text).then(()=> say('CSS copied to clipboard')).catch(()=> say('Copy failed'));
"
      "});
"
      "}
"
      "})();
"
