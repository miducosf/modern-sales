(() => {
  'use strict';

  // Elements
  const openerVideo = document.getElementById('openerVideo');
  const openerShell = document.getElementById('openerShell');
  const startHint = document.getElementById('startHint');
  const choiceMount = document.getElementById('choiceMount');
  const mentor = document.getElementById('mentorFeedback');
  const mentorCopy = document.getElementById('mentorCopy');
  const iconButtons = Array.from(document.querySelectorAll('.icon-hit'));
  const doneBtn = document.getElementById('doneBtn');
  const logoReset = document.querySelector('.logo-reset');
  const flowActions = document.getElementById('flowActions');
  const continueBtn = document.getElementById('continueBtn');

  // Set the start pill text
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
    doneBtn.disabled = false;
  }

  // ---------- Opening flow ----------
  let mentorShown = false;

  if (openerVideo) {
    const hideHint = () => startHint?.classList.add('hidden');
    ['play', 'seeking', 'timeupdate', 'volumechange', 'click'].forEach(ev =>
      openerVideo.addEventListener(ev, hideHint, { passive: true })
    );

    openerVideo.addEventListener('timeupdate', () => {
      // unlock at 30s (or earlier if ended)
      if (!STATE.unlockedByTime && openerVideo.currentTime >= UNLOCK_AT) {
        STATE.unlockedByTime = true;
        unlockIcons();
      }

      // show mentor near the end (in "lower" position)
      if (!mentorShown) {
        const dur = Number.isFinite(openerVideo.duration) ? openerVideo.duration : NaN;
        const revealAt = Number.isFinite(dur) ? Math.max(dur - 1.2, 0) : 7.0;
        if (openerVideo.currentTime >= revealAt) {
          mentor.classList.remove('hidden');
          mentor.classList.add('lower');
          mentor.setAttribute('aria-hidden', 'false');
          mentorCopy.textContent = "Nice start. Explore the channels on the left—I'll coach you as you go. When you’re finished, press Done.";
          mentorShown = true;
        }
      }
    });

    openerVideo.addEventListener('ended', () => {
      unlockIcons(); // ensure unlocked if video < 30s

      // Hide the opener window immediately…
      openerShell?.classList.add('hidden');

      // …then pause briefly and glide the mentor up slowly.
      setTimeout(() => {
        mentor.classList.remove('lower');
        mentor.classList.add('raise');
      }, 2000); // ~2s pause per your request
    });
  }

  // ---------- Icon routing ----------
  iconButtons.forEach(btn => {
    // native title tooltips
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
    flowActions.classList.add('hidden'); // hide continue until a selection is made

    const panel = document.createElement('div');
    panel.className = 'panel fade-in video-choices';
    panel.innerHTML = `
      <h3>How did Jamie respond to your conversation?</h3>
      <div class="row" style="gap:16px; align-items:flex-start;">
        <div>
          <div class="small-video">
            <video preload="metadata" playsinline controls>
              <source src="assets/05_Jamie_Closing_Positive.mp4" type="video/mp4">
            </video>
          </div>
          <div style="display:flex; justify-content:center;">
            <button class="btn ghost" data-close="positive">Response A</button>
          </div>
        </div>
        <div>
          <div class="small-video">
            <video preload="metadata" playsinline controls>
              <source src="assets/06_Jamie_Closing_Negative.mp4" type="video/mp4">
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
        // Feedback appears here (mentor bar), then we show Continue
        if (outcome === 'positive') {
          mentorCopy.textContent = "This is great news! You kept a warm, professional tone and adapted to the client’s needs. Great job.";
        } else {
          mentorCopy.textContent = "Not the best outcome. Your initial tone made it harder to build rapport. Try connecting before problem-solving.";
        }
        flowActions.classList.remove('hidden');
        continueBtn.focus();
      });
    });

    choiceMount.appendChild(panel);
    requestAnimationFrame(() => panel.classList.add('show'));

    // Instruction text (no “below”)
    mentorCopy.textContent = "How did Jamie respond to your conversation? Select each play button to hear possible responses and then select Response A or Response B.";
  }

  continueBtn.addEventListener('click', () => {
    flowActions.classList.add('hidden');
    playManagerWrapUp();
  });

  function playManagerWrapUp() {
    choiceMount.innerHTML = '';

    // No title/border — mimic opening video look
    const wrap = document.createElement('div');
    wrap.className = 'video-panel';
    wrap.innerHTML = `
      <video id="mgrClose" preload="metadata" playsinline autoplay controls>
        <source src="assets/04_Manager_WrapUp.mp4" type="video/mp4">
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
      mentorCopy.textContent = "Thanks for completing the scenario! You can keep exploring channels or press Done again to revisit closings.";
      vid.removeEventListener('ended', onEnd);
    };
    vid.addEventListener('ended', onEnd);
  }

  // ---------- Channel renderers ----------
  function mountPanel(kind) {
    choiceMount.innerHTML = '';
    flowActions.classList.add('hidden');
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

  // EMAIL
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

  // TEXT
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

  // VIDEO
  function renderVideo(el) {
    el.classList.add('video-choices');
    el.innerHTML = `
      <h3>Video – how would you respond?</h3>
      <div class="small-video">
        <video id="scenarioVideo" preload="metadata" playsinline controls>
          <source src="assets/01_Jamie_Connect.mp4" type="video/mp4">
        </video>
      </div>
      <div class="row" id="optionsRow" style="display:none;">
        <div class="card" data-outcome="positive">
          <strong>Response A</strong><br/>
          “I hear where you’re coming from, Jamie. Let’s slow the rollout and add a mid-week check-in so your team feels supported. Does Tuesday 10am work?”
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
        swapVideo(vid, 'assets/02_Jamie_Positive.mp4');
        mentorCopy.textContent = "Great news! Your warm tone and adaptive answers built trust.";
      } else {
        swapVideo(vid, 'assets/03_Jamie_Negative.mp4');
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

  // CALENDAR – scrollable days with fixed times column + synced header
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

    // Sync header scroll with body scroll for days
    const headScroll = el.querySelector('.days-head-scroll');
    const bodyScroll = el.querySelector('.days-scroll');
    if (headScroll && bodyScroll) {
      bodyScroll.addEventListener('scroll', () => { headScroll.scrollLeft = bodyScroll.scrollLeft; }, { passive:true });
    }

    mentorCopy.textContent = "You have a very busy week ahead!";
  }

  // TASKS
  function renderTasks(el) {
    el.classList.add('tasks');
    el.innerHTML = `
      <h3>Tasks</h3>
      <ul class="tasklist">
        <li><input id="t1" type="checkbox"><label for="t1">Send follow-up email to client</label></li>
        <li><input id="t2" type="checkbox"><label for="t2">Finalize training slide deck</label></li>
        <li><input id="t3" type="checkbox"><label for="t3"><strong>Complete paperwork to hire Michael Coleman.</strong> 🐣</label></li>
        <li><input id="t4" type="checkbox"><label for="t4">Share draft rollout timeline with Jamie</label></li>
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

  // CLIENTS
  function renderClients(el) {
    el.classList.add('clients');
    el.innerHTML = `
      <h3>Client Portfolio</h3>
      <div class="grid">
        <button class="client" data-key="al"><img src="assets/headshot1.png" alt="Healthcare client headshot"><span class="badge">Healthcare</span></button>
        <button class="client" data-key="bk"><img src="assets/headshot2.png" alt="Fintech client headshot"><span class="badge">Fintech</span></button>
        <button class="client" data-key="cr"><img src="assets/headshot3.png" alt="Retail client headshot"><span class="badge">Retail</span></button>
        <button class="client" data-key="ds"><img src="assets/headshot4.png" alt="SaaS client headshot"><span class="badge">SaaS</span></button>
      </div>
    `;
    const strategies = {
      al: "For Allegro Health, we introduced microlearning for clinical staff. Short compliance bursts reduced onboarding time and boosted completion.",
      bk: "BrightKite’s new hires got an AI mentor chatbot that adapts by role. It nudges progress and answers questions in the flow of work.",
      cr: "Cascade Retail needed consistency. We built a scenario-based practice sim so associates could rehearse conversations safely—CSAT rose.",
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
    mentorCopy.textContent = "Tap a client to see the engagement strategy I used with them.";
  }

  // ---------- Reset via logo ----------
  if (logoReset) {
    logoReset.addEventListener('click', resetToStart);
  }

  function resetToStart() {
    STATE.canInteract = false;
    STATE.unlockedByTime = false;

    startHint?.classList.remove('hidden');
    if (startHint) startHint.textContent = "Select play to continue.";
    choiceMount.innerHTML = '';
    doneBtn.disabled = true;
    flowActions.classList.add('hidden');

    mentor.classList.add('hidden');
    mentor.classList.remove('raise','lower');
    mentor.setAttribute('aria-hidden', 'true');
    mentorShown = false;

    openerShell?.classList.remove('hidden');
    if (openerVideo) {
      openerVideo.pause();
      openerVideo.currentTime = 0;
      openerVideo.load();
    }
    try { document.querySelector('.video-wrap')?.scrollIntoView({ behavior:'smooth', block:'start' }); } catch {}
  }
})();
