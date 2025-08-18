(() => {
  'use strict';

  // Elements
  const openerVideo = document.getElementById('openerVideo');
  const openerShell = document.getElementById('openerShell'); // wrapper around video-panel
  const startHint = document.getElementById('startHint');
  const choiceMount = document.getElementById('choiceMount');
  const mentor = document.getElementById('mentorFeedback');
  const mentorCopy = document.getElementById('mentorCopy');
  const iconButtons = Array.from(document.querySelectorAll('.icon-hit'));
  const doneBtn = document.getElementById('doneBtn');
  const logoReset = document.querySelector('.logo-reset');
  const flowActions = document.getElementById('flowActions');
  const continueBtn = document.getElementById('continueBtn');
  const frame = document.querySelector('.bg-frame');

  // Start pill text
  if (startHint) startHint.textContent = "Select play to continue.";

  // State
  const STATE = {
    canInteract: false,
    unlockedByTime: false
  };
  const UNLOCK_AT = 30; // seconds into opener video

  function unlockIcons() {
    if (STATE.canInteract) return;
    STATE.canInteract = true;
    if (doneBtn) doneBtn.disabled = false;
  }

  // ---------- Opening flow (no mentor during playback) ----------
  if (openerVideo) {
    const hideHint = () => startHint?.classList.add('hidden');
    ['play','seeking','timeupdate','volumechange','click'].forEach(ev =>
      openerVideo.addEventListener(ev, hideHint, { passive:true })
    );

    openerVideo.addEventListener('timeupdate', () => {
      if (!STATE.unlockedByTime && openerVideo.currentTime >= UNLOCK_AT) {
        STATE.unlockedByTime = true;
        unlockIcons();
      }
    });

    openerVideo.addEventListener('ended', () => {
      unlockIcons();

      // Fade out the opener shell, then hide it and fade in mentor
      if (openerShell) {
        openerShell.classList.add('fade-out');
        openerShell.addEventListener('animationend', () => {
          openerShell.classList.add('hidden');
          openerShell.classList.remove('fade-out');
          // Fade in mentor with same message as before
          mentorCopy.textContent = "Let's get started. Explore the channels on the left—I'll coach you as you go. When you’re finished, press Done.";
          mentor.classList.remove('hidden');
          mentor.classList.add('fade-in');
        }, { once:true });
      } else {
        // Fallback if no shell wrapper
        mentorCopy.textContent = "Let's get started. Explore the channels on the left—I'll coach you as you go. When you’re finished, press Done.";
        mentor.classList.remove('hidden');
        mentor.classList.add('fade-in');
      }
    });
  }

  // ---------- Icon routing ----------
  iconButtons.forEach(btn => {
    const label = btn.getAttribute('data-tip');
    if (label && !btn.title) btn.title = label;

    btn.addEventListener('click', () => {
      if (!STATE.canInteract) return;
      const area = getArea(btn);
      if (area) mountPanel(area);
    }, { passive: true });
  });

  function getArea(btn) {
    if (btn.classList.contains('email')) return 'email';
    if (btn.classList.contains('text')) return 'text';
    if (btn.classList.contains('video')) return 'video';
    if (btn.classList.contains('calendar')) return 'calendar';
    if (btn.classList.contains('tasks')) return 'tasks';
    if (btn.classList.contains('photos')) return 'clients';
    return null;
  }

  // ---------- Done flow ----------
  if (doneBtn) {
    doneBtn.addEventListener('click', () => {
      if (!STATE.canInteract) return;
      renderClosingSelector();
    });
  }

  function renderClosingSelector() {
    choiceMount.innerHTML = '';
    flowActions?.classList.add('hidden');

    const panel = document.createElement('div');
    panel.className = 'panel fade-in video-choices';
    panel.innerHTML = `
      <h3>How did Jamie respond to your conversation?</h3>
      <div class="row" style="gap:16px; align-items:flex-start;">
        <div>
          <div class="small-video">
            <video preload="metadata" playsinline controls>
              <source src="assets/video-positive.mp4" type="video/mp4">
            </video>
          </div>
          <div style="display:flex; justify-content:center;">
            <button class="btn ghost" data-close="positive">Response A</button>
          </div>
        </div>
        <div>
          <div class="small-video">
            <video preload="metadata" playsinline controls>
              <source src="assets/video-negative.mp4" type="video/mp4">
            </video>
          </div>
          <div style="display:flex; justify-content:center;">
            <button class="btn ghost" data-close="negative">Response B</button>
          </div>
        </div>
      </div>
    `;

    panel.querySelectorAll('button[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const outcome = btn.getAttribute('data-close');
        mentorCopy.textContent = (outcome === 'positive')
          ? "This is great news! You kept a warm, professional tone and adapted to the client’s needs. Great job."
          : "Not the best outcome. Your initial tone made it harder to build rapport. Try connecting before problem-solving.";
        flowActions?.classList.remove('hidden');
        continueBtn?.focus();
      });
    });

    choiceMount.appendChild(panel);
    requestAnimationFrame(() => panel.classList.add('show'));

    mentorCopy.textContent = "How did Jamie respond to your conversation? Select each play button to hear possible responses and then select Response A or Response B.";
  }

  continueBtn?.addEventListener('click', () => {
    flowActions.classList.add('hidden');
    playManagerWrapUp();
  });

  function playManagerWrapUp() {
    choiceMount.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'video-panel';
    wrap.innerHTML = `
      <video id="mgrClose" preload="metadata" playsinline autoplay controls>
        <source src="assets/closing-sales-manager.mp4" type="video/mp4">
      </video>
    `;
    choiceMount.appendChild(wrap);

    const vid = wrap.querySelector('#mgrClose');

    // Hide mentor during final wrap-up
    mentor.classList.add('hidden');
    mentor.setAttribute('aria-hidden', 'true');

    const onEnd = () => {
      mentor.classList.remove('hidden');
      mentor.setAttribute('aria-hidden', 'false');
      mentorCopy.textContent = "Thanks for working through the scenarios! You can keep exploring channels or select Done again to revisit the closing.";
      vid.removeEventListener('ended', onEnd);
    };
    vid.addEventListener('ended', onEnd);
  }

  // ---------- Channel renderers ----------
  function mountPanel(kind) {
    choiceMount.innerHTML = '';
    flowActions?.classList.add('hidden');
    const panel = document.createElement('div');
    panel.className = 'panel fade-in';

    switch (kind) {
      case 'email':    renderEmail(panel); break;
      case 'text':     renderText(panel); break;
      case 'video':    renderVideo(panel); break;
      case 'calendar': renderCalendar(panel); break;
      case 'tasks':    renderTasks(panel); break;
      case 'clients':  renderClients(panel); break;
      default: break;
    }

    choiceMount.appendChild(panel);
    requestAnimationFrame(() => panel.classList.add('show'));
  }

  function renderEmail(el) {
    el.innerHTML = `
      <h3>Email – choose a tone</h3>
      <div class="row">
        <div class="card email" data-feedback="Warm, concise opener that invites a reply. Nice tone setting.">
          <div class="subject">Quick follow-up on your timeline</div>
          <div class="sender">From: You</div>
          <div class="snippet">Hi Jamie — thanks again for your time yesterday. Would a brief 10-min call help us align on rollout support? Happy to adapt…</div>
        </div>
        <div class="card email" data-feedback="A bit dense and direct; consider softening before proposing solutions.">
          <div class="subject">Re: Level deployment risks</div>
          <div class="sender">From: You</div>
          <div class="snippet">Jamie, I reviewed the issues and attached a proposed plan. If we implement steps 1–4 immediately, we can stay on schedule…</div>
        </div>
      </div>
    `;
    el.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => {
        el.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        mentorCopy.textContent = card.dataset.feedback;
      });
    });
    mentorCopy.textContent = "Pick the email that best balances warmth and clarity. Aim for an easy ‘yes’ to a brief call.";
  }

  function renderText(el) {
    el.innerHTML = `
      <h3>Text – choose your message</h3>
      <div class="row">
        <div class="card chat" data-feedback="Friendly, low-friction nudge that keeps momentum.">
          <div class="meta">Jamie from Level</div>
          <div class="bubble">Morning! Would a quick 2pm check-in help us sort the rollout questions?</div>
        </div>
        <div class="card chat" data-feedback="Reads rushed; consider adding empathy before logistics.">
          <div class="meta">Jamie from Level</div>
          <div class="bubble">I booked 2pm. We’ll run through the plan and lock timelines.</div>
        </div>
      </div>
    `;
    el.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => {
        el.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        mentorCopy.textContent = card.dataset.feedback;
      });
    });
    mentorCopy.textContent = "Texts work for quick nudges. Lead with empathy before logistics.";
  }

  function renderVideo(el) {
    el.classList.add('video-choices');
    el.innerHTML = `
      <h3>Video – how would you respond?</h3>
      <div class="small-video">
        <video id="scenarioVideo" preload="metadata" playsinline controls>
          <source src="assets/video-chat-simulation.mp4" type="video/mp4">
        </video>
      </div>
      <div class="row" id="optionsRow" style="display:none;">
        <div class="card" data-outcome="positive">
          <strong>Response A</strong><br/>
          “I hear where you’re coming from, Jamie. Let’s schedule a check-in so your team feels supported and has a better sense of how we can move forward. Does Tuesday 10am work?”
        </div>
        <div class="card" data-outcome="negative">
          <strong>Response B</strong><br/>
          “We can still hit the date if we move fast. If you approve steps 1–4 today, we’ll lock the timeline and push ahead.”
        </div>
      </div>
    `;

    const vid = el.querySelector('#scenarioVideo');
    const optionsRow = el.querySelector('#optionsRow');

    const revealOptions = () => {
      optionsRow.style.display = 'flex';
      mentorCopy.textContent = "Select the response that addresses Jamie’s real concern—not just finishing the job.";
    };
    vid.addEventListener('play', revealOptions, { once: true });
    vid.play().catch(() => revealOptions());

    optionsRow.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      optionsRow.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      if (card.dataset.outcome === 'positive') {
        swapVideo(vid, 'assets/video-positive.mp4');
        mentorCopy.textContent = "Great news! Your warm tone and adaptive answers built trust.";
      } else {
        swapVideo(vid, 'assets/video-negative.mp4');
        mentorCopy.textContent = "Tough outcome. Next time, connect before problem-solving.";
      }
      vid.play().catch(()=>{});
    });
  }

  function swapVideo(videoEl, src) {
    videoEl.pause();
    videoEl.innerHTML = `<source src="${src}" type="video/mp4">`;
    videoEl.load();
  }

  function renderCalendar(el) {
    el.classList.add('calendar');
    el.innerHTML = `
      <h3>Calendar</h3>
      <div class="grid">
        <div class="head">
          <div class="times-head"></div>
          <div class="days-head-scroll"><div class="days-head">
            <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div>
          </div></div>
        </div>
        <div class="body">
          <div class="times"><div>9 AM</div><div>10 AM</div><div>11 AM</div><div>12 PM</div><div>1 PM</div><div>2 PM</div><div>3 PM</div><div>4 PM</div></div>
          <div class="days-scroll">
            <div class="days">
              <div class="day-col">
                <div class="meeting cat1" style="top:5%;height:14%;">Team Sync</div>
                <div class="meeting cat2" style="top:24%;height:18%;">Client Call</div>
                <div class="meeting cat3" style="top:60%;height:14%;">Design Review</div>
              </div>
              <div class="day-col">
                <div class="meeting cat2" style="top:10%;height:19%;">Budget Check</div>
                <div class="meeting cat4" style="top:40%;height:14%;">1:1 Alex</div>
                <div class="meeting cat1" style="top:65%;height:24%;">Workshop</div>
              </div>
              <div class="day-col">
                <div class="meeting cat3" style="top:15%;height:19%;">Product Demo</div>
                <div class="meeting cat5" style="top:45%;height:14%;">Quick Sync</div>
                <div class="meeting cat4" style="top:70%;height:19%;">Training</div>
              </div>
              <div class="day-col">
                <div class="meeting cat1" style="top:5%;height:14%;">Standup</div>
                <div class="meeting cat2" style="top:30%;height:24%;">Client Meeting</div>
                <div class="meeting cat3" style="top:65%;height:19%;">Interview</div>
              </div>
              <div class="day-col">
                <div class="meeting cat5" style="top:10%;height:19%;">Weekly Recap</div>
                <div class="meeting cat4" style="top:45%;height:14%;">Lunch & Learn</div>
                <div class="meeting cat2" style="top:70%;height:24%;">Planning</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const headScroll = el.querySelector('.days-head-scroll');
    const bodyScroll = el.querySelector('.days-scroll');
    if (headScroll && bodyScroll) {
      bodyScroll.addEventListener('scroll', () => { headScroll.scrollLeft = bodyScroll.scrollLeft; }, { passive:true });
    }

    mentorCopy.textContent = "You have a busy week ahead!";
  }

  function renderTasks(el) {
    el.classList.add('tasks');
    el.innerHTML = `
      <h3>Tasks</h3>
      <ul class="tasklist">
        <li><input id="t1" type="checkbox"><label for="t1">Send follow-up email to client.</label></li>
        <li><input id="t2" type="checkbox"><label for="t2">Finalize training slide deck.</label></li>
        <li><input id="t3" type="checkbox"><label for="t3"><strong>Complete paperwork to hire Michael Coleman.</strong> 🐣</label></li>
        <li><input id="t4" type="checkbox"><label for="t4">Share draft rollout timeline with Jamie.</label></li>
      </ul>
    `;
    el.querySelectorAll('.tasklist input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.id === 't3' && cb.checked) {
          mentorCopy.textContent = "Nice catch — that one’s important! 🎉";
        } else {
          mentorCopy.textContent = "Good progress. Keep the momentum rolling.";
        }
      });
    });
    mentorCopy.textContent = "Keep momentum with quick, visible wins. Check things off as you go.";
  }

  function renderClients(el) {
    el.classList.add('clients');
    el.innerHTML = `
      <h3>Client Portfolio</h3>
      <div class="grid">
        <button class="client" data-key="al"><img src="assets/Anna_Allegro_Health.png" alt="Healthcare client headshot"><span class="badge">Healthcare</span></button>
        <button class="client" data-key="bk"><img src="assets/Ben_BrightKite.png" alt="Fintech client headshot"><span class="badge">Fintech</span></button>
        <button class="client" data-key="cr"><img src="assets/Cynthia_Cascade.png" alt="Retail client headshot"><span class="badge">Retail</span></button>
        <button class="client" data-key="ds"><img src="assets/David_DataSprout.png" alt="SaaS client headshot"><span class="badge">SaaS</span></button>
      </div>
    `;
    const strategies = {
      al: "For Allegro Health, we introduced microlearning for clinical staff. Short compliance bursts reduced onboarding time and boosted completion.",
      bk: "BrightKite’s new hires got an AI mentor chatbot that adapts by role. It nudges progress and answers questions in the flow of work.",
      cr: "Cascade Retail needed consistency. We built a scenario-based practice sim so associates could rehearse conversations safely and customer service scores rose.",
      ds: "DataSprout piloted a dual-chatbot roleplay: one as customer, one coaching live. Handle time dropped and call confidence improved."
    };
    el.querySelectorAll('.client').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        mentorCopy.textContent = strategies[key];
        el.querySelectorAll('.client').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
    mentorCopy.textContent = "Tap a client to see the engagement strategy we've used with them.";
  }

  // ---------- Reset via logo ----------
  logoReset?.addEventListener('click', resetToStart);

  function resetToStart() {
    STATE.canInteract = false;
    STATE.unlockedByTime = false;

    startHint?.classList.remove('hidden');
    if (startHint) startHint.textContent = "Select play to begin.";
    choiceMount.innerHTML = '';
    doneBtn && (doneBtn.disabled = true);
    flowActions?.classList.add('hidden');

    mentor.classList.add('hidden');
    mentor.setAttribute('aria-hidden', 'true');

    openerShell?.classList.remove('hidden');
    if (openerVideo) {
      openerVideo.pause();
      openerVideo.currentTime = 0;
      openerVideo.load();
    }
    try { document.querySelector('.video-wrap')?.scrollIntoView({ behavior:'smooth', block:'start' }); } catch {}
  }

  // ---------- DEBUG MODE ----------
  const urlDebug = new URLSearchParams(location.search).get('debug');
  let debugOn = urlDebug === '1';
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'd' && e.shiftKey) {
      debugOn = !debugOn;
      toggleDebug(debugOn);
    }
  });

  function toggleDebug(on) {
    if (!frame) return;
    if (on) {
      createDebugOverlay();
    } else {
      removeDebugOverlay();
    }
  }

  let marker, hud;
  function createDebugOverlay() {
    if (marker || hud) return;

    const frameRect = frame.getBoundingClientRect();
    const btnRect = doneBtn?.getBoundingClientRect();
    const initLeft = btnRect ? (btnRect.left - frameRect.left) : 80;
    const initTop  = btnRect ? (btnRect.top - frameRect.top)  : (frameRect.height * 0.8);

    marker = document.createElement('div');
    marker.id = 'debugMarker';
    marker.style.left = `${initLeft}px`;
    marker.style.top  = `${initTop}px`;
    frame.appendChild(marker);

    hud = document.createElement('div');
    hud.id = 'debugHUD';
    hud.innerHTML = `<div><strong>Debug HUD</strong></div>
      <div>Arrows: move 1px • Shift+Arrows: 10px • <code>G</code> snap • <code>C</code> copy • <code>Esc</code> hide • <code>Shift+D</code> toggle</div>
      <div id="debugData" style="margin-top:6px; white-space:pre;"></div>`;
    document.body.appendChild(hud);

    updateHUD();

    window.addEventListener('keydown', handleDebugKeys, true);
  }

  function removeDebugOverlay() {
    window.removeEventListener('keydown', handleDebugKeys, true);
    marker?.remove(); marker = null;
    hud?.remove(); hud = null;
  }

  function handleDebugKeys(e) {
    if (!marker) return;
    let step = e.shiftKey ? 10 : 1;
    let moved = false;
    const left = parseFloat(marker.style.left || '0');
    const top  = parseFloat(marker.style.top || '0');

    switch (e.key) {
      case 'ArrowLeft':  marker.style.left = `${left - step}px`; moved = true; break;
      case 'ArrowRight': marker.style.left = `${left + step}px`; moved = true; break;
      case 'ArrowUp':    marker.style.top  = `${top  - step}px`; moved = true; break;
      case 'ArrowDown':  marker.style.top  = `${top  + step}px`; moved = true; break;
      case 'g': case 'G':
        if (doneBtn) {
          const fr = frame.getBoundingClientRect();
          const br = doneBtn.getBoundingClientRect();
          marker.style.left = `${br.left - fr.left}px`;
          marker.style.top  = `${br.top  - fr.top }px`;
          moved = true;
        }
        break;
      case 'c': case 'C':
        copyDebugJSON();
        break;
      case 'Escape':
        toggleDebug(false);
        break;
      default: return;
    }
    if (moved) { e.preventDefault(); updateHUD(); }
  }

  function updateHUD() {
    if (!marker || !hud) return;
    const dataEl = hud.querySelector('#debugData');
    const fr = frame.getBoundingClientRect();
    const mr = marker.getBoundingClientRect();
    const icon = document.querySelector('.icon-hit.email') || document.querySelector('.icon-hit');
    const ir = icon ? icon.getBoundingClientRect() : null;

    const left = mr.left - fr.left;
    const top  = mr.top  - fr.top;
    const pctX = ((left / fr.width) * 100).toFixed(2);
    const pctY = ((top  / fr.height) * 100).toFixed(2);

    let nudge = null;
    if (ir) nudge = Math.round(left - (ir.left - fr.left));

    const json = {
      frame: { width: Math.round(fr.width), height: Math.round(fr.height) },
      marker: { left: Math.round(left), top: Math.round(top), leftPct: pctX, topPct: pctY, width: Math.round(mr.width), height: Math.round(mr.height) },
      iconEdgeLeftPx: ir ? Math.round(ir.left - fr.left) : null,
      suggestedDoneLeftNudgePx: nudge
    };
    dataEl.textContent =
`left: ${Math.round(left)}px  (${pctX}%)
top:  ${Math.round(top)}px   (${pctY}%)
icon left edge: ${ir ? Math.round(ir.left - fr.left) + 'px' : 'n/a'}
suggested --done-left-nudge: ${nudge !== null ? nudge + 'px' : 'n/a'}

JSON: ${JSON.stringify(json)}`;
  }

  async function copyDebugJSON() {
    const fr = frame.getBoundingClientRect();
    const mr = marker.getBoundingClientRect();
    const icon = document.querySelector('.icon-hit.email') || document.querySelector('.icon-hit');
    const ir = icon ? icon.getBoundingClientRect() : null;
    const payload = {
      frame: { width: Math.round(fr.width), height: Math.round(fr.height) },
      marker: { left: Math.round(mr.left - fr.left), top: Math.round(mr.top - fr.top), width: Math.round(mr.width), height: Math.round(mr.height) },
      iconEdgeLeftPx: ir ? Math.round(ir.left - fr.left) : null,
      suggestedDoneLeftNudgePx: ir ? Math.round((mr.left - fr.left) - (ir.left - fr.left)) : null
    };
    try { await navigator.clipboard.writeText(JSON.stringify(payload)); } catch {}
  }

  // Auto-enable debug if ?debug=1
  if (debugOn) toggleDebug(true);

})();

// === CC Tracks + Video Fit Tweaks (added) ===
(function(){
  function addCaptionTrack(video){
    if (!video) return;
    if (video.querySelector('track[kind="captions"]')) return;
    const sourceEl = video.querySelector('source');
    const src = video.currentSrc || (sourceEl && sourceEl.getAttribute('src')) || "";
    if (!src || !/\.mp4($|\?)/i.test(src)) return;
    const track = document.createElement('track');
    track.kind = 'captions';
    track.srclang = 'en';
    track.label = 'English';
    track.default = true;
    track.src = src.replace(/\.mp4(\?.*)?$/i, '.vtt$1');
    video.appendChild(track);
  }

  function markChatSimContain(video){
    const sourceEl = video.querySelector('source');
    const src = video.currentSrc || (sourceEl && sourceEl.getAttribute('src')) || "";
    if (src.includes('video-chat-simulation.mp4')) {
      video.classList.add('video--contain');
    }
  }

  function processVideo(video){
    addCaptionTrack(video);
    markChatSimContain(video);
  }

  document.querySelectorAll('video').forEach(processVideo);

  const mo = new MutationObserver((mutations) => {
    for (const m of mutations){
      for (const node of m.addedNodes){
        if (node.nodeType !== 1) continue;
        if (node.tagName === 'VIDEO') processVideo(node);
        node.querySelectorAll && node.querySelectorAll('video').forEach(processVideo);
      }
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
})();
