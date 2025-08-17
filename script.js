(() => {
  'use strict';

  // Elements
  const openerVideo = document.getElementById('openerVideo');
  const openerShell = document.getElementById('openerShell') || openerVideo?.closest('.video-panel');
  const startHint = document.getElementById('startHint');
  const choiceMount = document.getElementById('choiceMount');
  const mentor = document.getElementById('mentorFeedback');
  const mentorCopy = document.getElementById('mentorCopy');
  const iconButtons = Array.from(document.querySelectorAll('.icon-hit'));

  // State
  const STATE = {
    canInteract: false,
    videoOutcome: null
  };

  // Unlock icons after 30s of the welcome video (or on video end)
  const UNLOCK_AT = 30; // seconds

  function unlockIcons() {
    if (STATE.canInteract) return;
    STATE.canInteract = true;
  }

  // -----------------------------
  // Welcome video flow + mentor
  // -----------------------------
  let mentorShown = false;

  if (openerVideo) {
    // Hide the "Select play" hint once the user interacts with the video
    const hideHint = () => startHint?.classList.add('hidden');
    ['play', 'seeking', 'timeupdate', 'volumechange', 'click'].forEach(ev =>
      openerVideo.addEventListener(ev, hideHint, { passive: true })
    );

    openerVideo.addEventListener('timeupdate', () => {
      // Unlock after the 30s mark
      if (!STATE.canInteract && openerVideo.currentTime >= UNLOCK_AT) {
        unlockIcons();
      }

      // Reveal the mentor near the end of the clip
      if (!mentorShown) {
        const dur = Number.isFinite(openerVideo.duration) ? openerVideo.duration : NaN;
        const revealAt = Number.isFinite(dur) ? Math.max(dur - 1.2, 0) : 7.0; // fallback to ~7s if duration unknown
        if (openerVideo.currentTime >= revealAt) {
          mentor.classList.remove('hidden');
          mentor.setAttribute('aria-hidden', 'false');
          mentor.classList.add('fade-in');
          mentorCopy.textContent = "Nice start. From here, use the icons to explore channels—I'll coach as you decide.";
          mentorShown = true;
        }
      }
    });

    openerVideo.addEventListener('ended', () => {
      // Ensure unlocked even if the video is shorter than 30s
      unlockIcons();

      // Hide the welcome video panel to make room for the content
      openerShell?.classList.add('hidden');
    });
  }

  // -----------------------------
  // Icon routing (guarded)
  // -----------------------------
  iconButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!STATE.canInteract) return; // ignore clicks before unlock
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

  // -----------------------------
  // Mount helper
  // -----------------------------
  function mountPanel(kind) {
    choiceMount.innerHTML = '';
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

  // -----------------------------
  // EMAIL
  // -----------------------------
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

  // -----------------------------
  // TEXT
  // -----------------------------
  function renderText(el) {
    el.innerHTML = `
      <h3>Text – quick coordination</h3>
      <div class="row">
        <div class="card chat" data-feedback="Friendly, low-friction nudge that keeps momentum.">
          <div class="meta">Jamie (Online)</div>
          <div class="bubble">Morning! Would a quick 2pm check-in help us sort the rollout questions?</div>
          <div class="bubble" style="margin-top:6px;">I can share a short clip and next steps.</div>
        </div>
        <div class="card chat" data-feedback="Reads rushed; consider adding empathy before logistics.">
          <div class="meta">Jamie (Typing…)</div>
          <div class="bubble">I booked 2pm. We’ll run through the plan and lock timelines.</div>
          <div class="bubble" style="margin-top:6px;">Sounds good — I’ll push the deck.</div>
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

  // -----------------------------
  // VIDEO (Connect → choose → Wrap-up)
  // -----------------------------
  function renderVideo(el) {
    el.classList.add('video-choices');
    el.innerHTML = `
      <h3>Video – final call & response</h3>
      <div class="small-video">
        <video id="scenarioVideo" preload="metadata" playsinline controls>
          <source src="assets/01_Jamie_Connect.mp4" type="video/mp4">
        </video>
      </div>
      <div class="controls" style="margin-bottom:10px;">
        <button class="btn primary" id="playConnect">Play “Connect/Answer”</button>
        <button class="btn ghost" id="showOptions">Show Options</button>
        <button class="btn ghost" id="replay">Replay</button>
      </div>
      <div class="row" id="optionsRow" style="display:none;">
        <div class="card" id="optPos" data-outcome="positive"><strong>Response A</strong><br/>Warm acknowledgment + concrete next step.</div>
        <div class="card" id="optNeg" data-outcome="negative"><strong>Response B</strong><br/>Solution-first; lighter on rapport.</div>
      </div>
      <div class="controls">
        <button class="btn ghost" id="continueWrap" disabled>Continue to Wrap-up</button>
      </div>
    `;

    const vid = el.querySelector('#scenarioVideo');
    const playConnect = el.querySelector('#playConnect');
    const showOptions = el.querySelector('#showOptions');
    const replay = el.querySelector('#replay');
    const optionsRow = el.querySelector('#optionsRow');
    const continueWrap = el.querySelector('#continueWrap');

    playConnect.addEventListener('click', () => {
      swapVideo(vid, 'assets/01_Jamie_Connect.mp4');
      mentorCopy.textContent = "Later that day — video call with Jamie.";
      optionsRow.style.display = 'none';
      continueWrap.disabled = true;
      vid.play().catch(()=>{});
    });

    showOptions.addEventListener('click', () => {
      optionsRow.style.display = 'flex';
      mentorCopy.textContent = "Choose the best response to close positively.";
    });

    replay.addEventListener('click', () => {
      vid.currentTime = 0;
      vid.play().catch(()=>{});
      optionsRow.style.display = 'none';
      continueWrap.disabled = true;
    });

    optionsRow.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      optionsRow.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      STATE.videoOutcome = card.dataset.outcome;
      continueWrap.disabled = false;

      if (STATE.videoOutcome === 'positive') {
        swapVideo(vid, 'assets/02_Jamie_Positive.mp4');
        mentorCopy.textContent = "Great news! Your warm tone and adaptive answers built trust.";
      } else {
        swapVideo(vid, 'assets/03_Jamie_Negative.mp4');
        mentorCopy.textContent = "Tough outcome. Next time, connect before problem-solving.";
      }
      vid.play().catch(()=>{});
    });

    continueWrap.addEventListener('click', () => {
      // Hide mentor during final wrap-up only
      mentor.classList.add('hidden');
      mentor.setAttribute('aria-hidden', 'true');

      swapVideo(vid, 'assets/04_Manager_WrapUp.mp4');
      vid.play().catch(()=>{});

      const onEnd = () => {
        mentor.classList.remove('hidden');
        mentor.setAttribute('aria-hidden', 'false');
        mentorCopy.textContent = "Thanks for completing the scenario! Want to try a different path or explore other channels?";
        vid.removeEventListener('ended', onEnd);
      };
      vid.addEventListener('ended', onEnd);
    });

    mentorCopy.textContent = "This is the final call with Jamie. Start with Connect/Answer, then pick a response.";
  }

  function swapVideo(videoEl, src) {
    videoEl.pause();
    videoEl.innerHTML = `<source src="${src}" type="video/mp4">`;
    videoEl.load();
  }

  // -----------------------------
  // CALENDAR
  // -----------------------------
  function renderCalendar(el) {
    el.classList.add('calendar');
    el.innerHTML = `
      <h3>Calendar – jam-packed week</h3>
      <div class="grid">
        <div class="head">
          <div class="cell" style="background:#f1f5f9"></div>
          <div class="cell">Mon</div><div class="cell">Tue</div><div class="cell">Wed</div><div class="cell">Thu</div><div class="cell">Fri</div>
        </div>
        <div class="body">
          <div class="times"><div>9 AM</div><div>10 AM</div><div>11 AM</div><div>12 PM</div><div>1 PM</div><div>2 PM</div><div>3 PM</div><div>4 PM</div></div>
          <div class="day">
            <div class="meeting cat1" style="top:5%;height:10%;">Team Sync</div>
            <div class="meeting cat2" style="top:22%;height:14%;">Client Call</div>
            <div class="meeting cat3" style="top:60%;height:10%;">Design Review</div>
          </div>
          <div class="day">
            <div class="meeting cat2" style="top:10%;height:15%;">Budget Check</div>
            <div class="meeting cat4" style="top:40%;height:10%;">1:1 Alex</div>
            <div class="meeting cat1" style="top:65%;height:20%;">Workshop</div>
          </div>
          <div class="day">
            <div class="meeting cat3" style="top:15%;height:15%;">Product Demo</div>
            <div class="meeting cat5" style="top:45%;height:10%;">Quick Sync</div>
            <div class="meeting cat4" style="top:70%;height:15%;">Training</div>
          </div>
          <div class="day">
            <div class="meeting cat1" style="top:5%;height:10%;">Standup</div>
            <div class="meeting cat2" style="top:30%;height:20%;">Client Meeting</div>
            <div class="meeting cat3" style="top:65%;height:15%;">Interview</div>
          </div>
          <div class="day">
            <div class="meeting cat5" style="top:10%;height:15%;">Weekly Recap</div>
            <div class="meeting cat4" style="top:45%;height:10%;">Lunch & Learn</div>
            <div class="meeting cat2" style="top:70%;height:20%;">Planning</div>
          </div>
          <!-- horizontal dividers behind meetings -->
          <div class="div" style="top:12.5%"></div><div class="div" style="top:25%"></div><div class="div" style="top:37.5%"></div>
          <div class="div" style="top:50%"></div><div class="div" style="top:62.5%"></div><div class="div" style="top:75%"></div><div class="div" style="top:87.5%"></div>
        </div>
      </div>
    `;
    mentorCopy.textContent = "Jam-packed week! Propose a low-friction time to connect—acknowledge their constraints.";
  }

  // -----------------------------
  // TASKS
  // -----------------------------
  function renderTasks(el) {
    el.classList.add('tasks');
    el.innerHTML = `
      <h3>Tasks</h3>
      <div class="item"><div class="checkbox"><div class="tick"></div></div><div class="label">Send follow-up email to client</div></div>
      <div class="item"><div class="checkbox"><div class="tick"></div></div><div class="label">Review Q3 budget proposal</div></div>
      <div class="item"><div class="checkbox"><div class="tick"></div></div><div class="label">Finalize training slide deck</div></div>
      <div class="item"><div class="checkbox"><div class="tick"></div></div><div class="label">Schedule team sync</div></div>
      <div class="item" id="egg"><div class="checkbox"><div class="tick"></div></div><div class="label"><strong>Complete paperwork to hire Michael Coleman.</strong> 🐣</div></div>
      <div class="item"><div class="checkbox"><div class="tick"></div></div><div class="label">Update performance dashboard</div></div>
    `;
    el.querySelectorAll('.item').forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('done');
        mentorCopy.textContent = item.id === 'egg' && item.classList.contains('done')
          ? "Nice catch — that one’s important! 🎉"
          : "Good progress. Keep the momentum rolling.";
      });
    });
    mentorCopy.textContent = "Use this list to keep momentum between touches.";
  }

  // -----------------------------
  // CLIENTS (Photos)
  // -----------------------------
  function renderClients(el) {
    el.classList.add('clients');
    el.innerHTML = `
      <h3>Clients</h3>
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

})();
