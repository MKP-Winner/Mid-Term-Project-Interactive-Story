// ── Element References ──────────────────────────────────────
const p1             = document.getElementById('paragraph1');
const p2             = document.getElementById('paragraph2');
const p3             = document.getElementById('paragraph3');
const storyImage     = document.getElementById('story-image');
const btn1           = document.getElementById('btn-choice1');
const btn2           = document.getElementById('btn-choice2');
const btn3           = document.getElementById('btn-choice3');
const btnSubmit      = document.getElementById('btn-submit');
const btnReview      = document.getElementById('btn-review');
const btnRestart     = document.getElementById('btn-restart');
const codeInput      = document.getElementById('code-input');
const healthDisplay  = document.getElementById('health-display');
const healthBar      = document.getElementById('health-bar');
const pathDisplay    = document.getElementById('path-display');
const inventoryDisp  = document.getElementById('inventory-display');
const inventoryList  = document.getElementById('inventory-list');
const timerBox       = document.getElementById('timer-box');
const timerDisplay   = document.getElementById('timer-display');
const logJournal     = document.getElementById('log-journal');
const inputArea      = document.getElementById('input-area');
const clueArea       = document.getElementById('clue-area');
const intelPanel     = document.getElementById('intel-panel');
const intelList      = document.getElementById('intel-list');
const choiceArea     = document.getElementById('choice-area');
const endingScreen   = document.getElementById('ending-screen');
const endingTitle    = document.getElementById('ending-title');
const endingText     = document.getElementById('ending-text');
const endingBadge    = document.getElementById('ending-badge');
const storyContainer = document.getElementById('story-container');

// ── State Variables ─────────────────────────────────────────
let hp             = 100;   // player health
let inventory      = [];    // items collected
let intel          = [];    // intel/clues collected
let currentPath    = '';    // army / lab / survivor
let weapon         = '';    // which weapon was chosen
let labCodeTries   = 0;     // wrong lab code attempts
let labSubPath     = '';    // chosen lab location (hosp/abandoned/sewer/command/radio/nest)
let countdownTimer = null;  // setInterval reference
let currentScene   = 'intro';

// ── Scene Data ───────────────────────────────────────────────
const SCENES = {

  // ── Prologue / Battlefield Arrival ──
  intro:           { img:'./images/battlefield.png',       text:['You slam through the last door of the zombie house — and stumble straight into a war.', 'Smoke. Artillery. Thousands of Walkers flooding the streets. This is not your world.', 'A soldier grabs you: "Civilian! Army base is north. Research lab is east. Or run south and disappear."'], b1:'Join the Human Army', b2:'Study the zombies — head to Research Lab', b3:'Escape the war and survive', intel:'Three options: Army HQ (north), Research Lab (east), Abandoned City (south).' },

  // ── Army Path ──
  army_strategy:   { img:'./images/strategy_room.png',     text:['Fort Cardinal. Generals argue over maps while the city burns outside.', '"Two options," the Commander says. "Lead a direct assault on the horde — take the fight to them."', '"Or destroy the portal they\'re using to multiply. No portal, no reinforcements."'],                   b1:'Lead the attack — direct assault', b2:'Destroy the portal — cut off reinforcements', path:'army', intel:'Two strategies: Lead a direct assault OR destroy the portal cutting off Walker reinforcements.' },
  army_lead:       { img:'./images/lead_attack.jpg',       text:['You lead a squad of fifty soldiers into the horde\'s densest district.', 'The battle is massive — street by street, block by block. The horde pushes back hard.', '"We\'ve located the Boss Walker. It\'s coordinating everything. Take it out NOW."'],                                         b1:'Find and fight the Boss Battle', b2:'Sacrifice yourself as a distraction', hp:-15, intel:'Boss Walker located at the city center. Eliminating it breaks the horde\'s coordination.' },
  army_portal:     { img:'./images/destroy_portal.png',    text:['The portal is a shimmering tear in reality behind the old stadium — Walkers pour through endlessly.', 'Your squad fights to the base of it. The energy readings are off the charts.', '"We need a weapon powerful enough to collapse the portal. Choose wisely."'],                             b1:'Find and fight the Boss Battle', b2:'Sacrifice yourself to destroy it', hp:-10, intel:'The portal is the source of infinite Walker reinforcements. Collapsing it ends the invasion.' },
  army_boss:       { img:'./images/boss_battle.png',       text:['The Boss Walker is ten feet tall — mutated far beyond anything you\'ve seen.', 'It turns to face you. The surrounding horde goes still, waiting.', '"Choose your weapon," your sergeant shouts. "One shot is all you\'ll get."'],                                                               b1:'Rocket Launcher', b2:'Plasma Rifle', b3:'Energy Sword' },
  army_sacrifice:  { img:'./images/sacrifice.png',         text:['You volunteer to be the distraction — to draw the horde so the others can complete the mission.', 'Running into the open, shouting, drawing hundreds of Walkers away from the objective.', '"Choose your weapon," you call back to your squad. "Make it count."'],                               b1:'Rocket Launcher', b2:'Plasma Rifle', b3:'Energy Sword', hp:-20 },
  army_rocket:     { img:'./images/rocket_launcher.png',   text:['You heft the rocket launcher. One shot.', 'The targeting reticle locks on. The Boss Walker spreads its arms wide — almost daring you.', 'You fire. The rocket connects. The Boss Walker detonates in a shockwave that ripples through the entire horde.'], ending:'end_hero', item:'Rocket Launcher' },
  army_plasma:     { img:'./images/plasma_rifle.png',      text:['The plasma rifle hums with barely contained energy.', 'You hold the trigger. The weapon screams, glows white — and overheats.', 'The explosion takes out a city block of Walkers and the Boss. It also takes out your squad.'], ending:'end_weapon_overheats', item:'Plasma Rifle' },
  army_sword:      { img:'./images/energy_sword.png',      text:['The energy sword crackles blue-white in your hand. Close range.', 'The sword cuts clean — but the Boss Walker grabs your arm in its last moment. The bite is small.', 'You finish the fight. Three days later, you understand why that mattered.'], ending:'end_infected', item:'Energy Sword', hp:-10 },

  // ── Lab Path ──
  lab_arrive:      { img:'./images/research_lab.png',      text:['BioLab 4 is still running. Generators hum. Scientists work in full hazmat gear.', '"You came from the source world," the Lead Researcher says. "Your blood is remarkable — no infection markers at all."', '"We can use it. But we need to choose a direction: cure, or control."'],              b1:'Help create a cure', b2:'Help control the zombies', path:'lab', intel:'Pinned to the lab wall: a faded project manifest. The header is torn — only "GEN" is readable. The rest is water-damaged.' },
  lab_cure:        { img:'./images/lab_cure.png',          text:['The cure requires synthesizing your blood markers with compounds found in the field.', '"We have two location options for the final ingredients," the researcher says.', '"Military Hospital — high risk, high yield. Or the abandoned laboratory — safer but uncertain."'],                   b1:'Go to the Military Hospital', b2:'Go to the Abandoned Laboratory', b3:'Search the Underground Sewer', intel:'A researcher\'s notebook left open: "...compound reacts with GEN-type markers. Cross-ref: Project _SIS, classified above my clearance."' },
  lab_control:     { img:'./images/lab_control.png',       text:['The control formula rewires the Walker neural network — turning the horde into a controllable force.', '"The synthesis location matters," the researcher says grimly. "Different sites give different results."', '"Military Command Center gives the most power. But the others are... options."'],  b1:'Go to the Military Command Center', b2:'Go to the Radio Tower', b3:'Go to the Zombie Nest', intel:'Scrawled on a whiteboard in red marker: "CONTROL NODE: GEN___IS. DO NOT ERASE." Someone erased the middle three letters anyway.' },
  lab_terminal:    { img:'./images/lab_terminal.png',      text:['Back at the lab. Everything is ready. Your blood is drawn. The compounds are mixed.', 'The synthesis machine is locked. A single input field blinks on the screen. No label. No instructions.', 'The researcher stares at it. "I never had the clearance. Whatever the code is — it\'s not in any file I\'ve seen."'],  input:true },
  lab_unlocked:    { img:'./images/lab_unlocked.png',      text:['The machine unlocks. The formula begins synthesizing.', 'The researcher watches the readout. "It\'s working. Whatever you chose — it\'s done."', 'The results are already spreading. There is no going back.'], ending:'lab_resolve' },

  // ── Survivor Path ──
  surv_escape:     { img:'./images/abandoned_city.png',    text:['You run south — away from the army, away from the lab, away from the war.', 'The abandoned city district is quiet compared to the battlefield. Shells of buildings. Empty streets.', 'Then: a sound. Voices. Someone else is alive out here.'],                                                    b1:'Follow the voices — find the survivors', b2:'Stay alone — trust no one', path:'survivor', intel:'Survivor voices detected in the abandoned city district. Someone else made it.' },
  surv_hub:        { img:'./images/survivor_hub.png',      text:['A group of thirty people in a fortified basement. Families. Workers. A few soldiers who broke away.', '"We\'ve been here for weeks," the leader says. "We need to decide where to go next."', '"There are three possible safe zones. But each one is a gamble."'],                              b1:'Head to the Radio Tower', b2:'Head to the Shopping Mall', b3:'Head to the Underground Subway', intel:'Three possible survivor safe zones: Radio Tower, Shopping Mall, Underground Subway.' },
  surv_radio:      { img:'./images/radio_tower.png',       text:['The radio tower is broadcasting a signal — coordinates for a cleared extraction zone.', 'Your group makes the trek across three miles of Walker-controlled streets.', 'When you arrive, the extraction team is real. The zone is real. Helicopters are waiting.'],                              b1:'Board the helicopters — leave this world', b2:'Stay and help others reach the zone', hp:-10 },
  surv_mall:       { img:'./images/shopping_mall.png',     text:['The mall looked safe from the outside. It was not.', 'A horde had already moved in — hundreds of Walkers sealed inside the ventilation system. They flood the ground floor within minutes.', 'Your group scatters. There is no way out. One by one, the screaming stops.'], ending:'end_mall_death', hp:-30 },
  surv_subway:     { img:'./images/underground_subway.png',text:['The subway tunnels stretch for miles beneath the city — it seems like the perfect shelter.', 'Three days in, your group realizes the tunnels are already infested. Walkers fill every passage, drawn by the echo of footsteps.', 'There is no fighting out of this. There is no way back up. The darkness takes everyone.'], ending:'end_subway_death', hp:-30 },
  surv_finally:    { img:'./images/finally_end.png',       text:['The survivors have held together through everything. There is one last decision to make.', '"We can\'t stay mobile forever," the leader says. "We pick a permanent path now."', '"Extra protection — defend a camp. Or move the people somewhere safer."'],                                    b1:'Take the extra path — defend a camp', b2:'Lead the people away to safety' },
  surv_camp:       { img:'./images/defend_camp.png',       text:['You find a defensible position — old factory, thick walls, generator intact.', 'Your group builds a perimeter. Soldiers train civilians. Children learn to be quiet.', 'Month by month, the Walker density outside decreases. The camp holds.'],                                              b1:'Declare it a permanent settlement', b2:'Use it as a staging point to push further', hp:-5 },
  surv_lead:       { img:'./images/lead_away.png',         text:['You lead the people north — away from the city, toward rumors of an uninfected region.', 'The journey is brutal. You lose three people to Walker encounters. But you keep moving.', 'On the seventh day, the skyline clears. Green. Fields. No Walkers.'],                                    b1:'Settle here — start over', b2:'Keep moving — find other survivors', hp:-15 },
};

// ── Button Routing Maps ──────────────────────────────────────
const BTN1_MAP = {
  intro:'army_strategy',
  army_strategy:'army_lead',
  army_lead:'army_boss',         army_portal:'army_boss',
  army_boss:'army_rocket',       army_sacrifice:'army_rocket',
  lab_arrive:'lab_cure',         lab_cure:'lab_terminal',
  lab_control:'lab_terminal',
  lab_terminal:'lab_unlocked',
  surv_escape:'surv_hub',        surv_hub:'surv_radio',
  surv_radio:'end_survivor_city',
  surv_finally:'surv_camp',
  surv_camp:'end_city',          surv_lead:'end_survivor_leader',
};

const BTN2_MAP = {
  intro:'lab_arrive',
  army_strategy:'army_portal',
  army_lead:'army_sacrifice',    army_portal:'army_sacrifice',
  army_boss:'army_plasma',       army_sacrifice:'army_plasma',
  lab_arrive:'lab_control',      lab_cure:'lab_terminal',
  lab_control:'lab_terminal',
  surv_escape:'end_lonely',      surv_hub:'surv_mall',
  surv_radio:'surv_finally',
  surv_finally:'surv_lead',
  surv_camp:'surv_finally',      surv_lead:'end_survivor_leader',
};

// ── Endings Data ─────────────────────────────────────────────
const ENDINGS = {
  end_hero:             { badge:'🎖️', title:'ENDING: HERO SURVIVES',         color:'#39ff14', text:'The rocket connects. The Boss Walker disintegrates in a shockwave that ripples through the entire horde. Without their coordinator, the Walkers scatter. The army sweeps the city in four days. You walk out into a morning with no smoke on the horizon. Your name goes on every memorial wall they build.' },
  end_weapon_overheats: { badge:'🔥', title:'ENDING: WEAPON OVERHEATS',       color:'#e8a020', text:'You hold the trigger too long. The plasma rifle screams, glows white — and detonates. The explosion takes out a city block of Walkers and the Boss. It also takes out your squad. The war ends eventually. Nobody is quite sure how to categorize what happened to you.' },
  end_infected:         { badge:'🧟', title:'ENDING: INFECTED',               color:'#c0392b', text:'The energy sword cuts clean — but the Boss Walker grabs your arm in its last moment. The bite is small. You finish the fight. Three days later, you understand why that mattered. The army wins the war. You are not there to see it.' },
  end_cure_success:     { badge:'🧬', title:'ENDING: THE CURE',               color:'#39ff14', text:'The serum works. Released through the water supply and air dispersal systems, it reaches the Walker horde within seventy-two hours. They don\'t die — they reverse. Slowly, quietly, the war ends without a final battle. Scientists from this world name the compound after your blood type. You never quite get used to that.' },
  end_survive_nocure:   { badge:'⚗️', title:'ENDING: SURVIVE — NO CURE',      color:'#e8a020', text:'The abandoned laboratory doesn\'t have everything you need. The formula is incomplete. It slows the infection — buys months, maybe a year. The war drags on. But people are alive who wouldn\'t have been. You stay in the lab, keep working. The cure is still out there somewhere.' },
  end_death_sewer:      { badge:'💀', title:'ENDING: DEATH IN THE DARK',      color:'#c0392b', text:'The underground sewer was supposed to be a shortcut. It wasn\'t. The Walker cluster down there hadn\'t been reported. The lab never gets its compound. The war continues without the cure. Nobody knows what happened to the person from the other world who almost changed everything.' },
  end_zombie_ruler:     { badge:'👑', title:'ENDING: ZOMBIE RULER',           color:'#c0392b', text:'The Military Command Center gives you access to the Walker neural broadcast frequency. You don\'t just control a few — you control all of them. Thousands of empty eyes turn to you at once. You stand on the roof of the Command Center and look out at your army. You opened a door into this world. Now you decide what it becomes.' },
  end_survive_notower:  { badge:'📡', title:'ENDING: SURVIVE — NO TOWER',     color:'#e8a020', text:'The Radio Tower is destroyed before you reach it. The signal goes dark. Your group makes it back to the mall and holds there indefinitely. The world outside keeps burning. You survive. That has to be enough for now.' },
  end_subway_death:     { badge:'💀', title:'ENDING: SWALLOWED BY THE DARK', color:'#c0392b', text:'The subway was never safe — it just looked that way from the surface. The tunnels had been Walker territory for weeks. Your group never made it to the other side. The city above kept burning, not knowing anyone had tried to escape below.' },
  end_death:            { badge:'💀', title:'ENDING: DEATH',                  color:'#c0392b', text:'The Zombie Nest was the worst possible choice and some part of you knew it. The formula never gets synthesized. The horde never gets controlled. The war grinds on for years without you.' },
  end_survivor_city:    { badge:'🏙️', title:'ENDING: SURVIVOR CITY',          color:'#39ff14', text:'The extraction helicopters take your group to a fortified civilian settlement sixty miles north. Three hundred people. Running water. Gardens. Defense perimeter. You help build it into something real. Years later, when the war finally ends, it\'s one of the first cities to reopen its gates.' },
  end_mall_death:       { badge:'🧟', title:'ENDING: OVERRUN',                color:'#c0392b', text:'The mall was a trap. The Walker horde inside the vents had been there for weeks, sealed in and starving. Your group never had a chance. The last thing you see is the emergency exit sign flickering out. Nobody makes it out of the shopping mall.' },
  end_lonely:           { badge:'🌑', title:'ENDING: LONELY',                 color:'#c0392b', text:'You chose to trust no one. The abandoned city is quiet. You find food, find shelter, find a rhythm. Years pass. The war ends somewhere far away. You don\'t hear about it for months. When you do, you realize you\'ve been alone so long you\'re not sure you know how to stop.' },
  end_city:             { badge:'🏗️', title:'ENDING: A NEW CITY',             color:'#39ff14', text:'The camp becomes a town. The town becomes a city. People come from the surrounding ruins — survivors, soldiers who put down their weapons, even a few Walkers who reversed on their own. You built something in the ruins of a war you started by accident. That has to count for something.' },
  end_survivor_leader:  { badge:'🌿', title:'ENDING: SURVIVOR LEADER',        color:'#39ff14', text:'The uninfected region to the north is larger than anyone imagined. Your group reaches it and finds others already there — hundreds, building quietly. You become one of the people who holds it together. Not a hero of the war. Something quieter than that. Someone people follow because they trust you.' },
};

// ── FUNCTION 1: updateHP(amount) ────────────────────────────
// Adjusts HP, updates the bar and display, triggers death if 0.
function updateHP(amount) {
  hp = Math.max(0, Math.min(100, hp + amount));
  healthDisplay.textContent = hp;
  healthBar.style.width = hp + '%';
  if (hp > 60)      healthBar.style.background = 'linear-gradient(90deg,#1f8c0a,#39ff14)';
  else if (hp > 30) healthBar.style.background = 'linear-gradient(90deg,#8c6c0a,#e8a020)';
  else              healthBar.style.background = 'linear-gradient(90deg,#6b0a0a,#c0392b)';
  if (amount < 0) {
    storyContainer.classList.remove('damage-flash');
    void storyContainer.offsetWidth;
    storyContainer.classList.add('damage-flash');
  }
  if (hp <= 0) triggerEnding('end_death');
}

// ── FUNCTION 2: swapImage(url, alt) ─────────────────────────
// Fades out the scene image, swaps src, fades back in.
function swapImage(url, alt) {
  try {
    storyImage.classList.add('fade-out');
    setTimeout(function() {
      storyImage.src = url;
      storyImage.alt = alt || 'Scene';
      storyImage.classList.remove('fade-out');
    }, 450);
  } catch (err) {
    console.error('swapImage error:', err);
  }
}

// ── FUNCTION 3: displayText(a, b, c) ────────────────────────
// Sets all three story paragraphs at once.
function displayText(a, b, c) {
  p1.textContent = a || '';
  p2.textContent = b || '';
  p3.textContent = c || '';
}

// ── FUNCTION 4: setButtons(l1, l2, l3) ──────────────────────
// Sets button labels and shows/hides the third button.
function setButtons(l1, l2, l3) {
  btn1.textContent = l1; btn1.style.display = 'inline-block'; btn1.disabled = false;
  btn2.textContent = l2; btn2.style.display = 'inline-block'; btn2.disabled = false;
  btn3.style.display = l3 ? 'inline-block' : 'none';
  if (l3) { btn3.textContent = l3; btn3.disabled = false; }
  inputArea.style.display  = 'none';
  choiceArea.style.display = 'flex';
}

// ── FUNCTION 5: addItem(item) ────────────────────────────────
// Adds item to inventory array and appends a <li> via appendChild.
function addItem(item) {
  if (inventory.includes(item)) return;
  inventory.push(item);
  inventoryDisp.textContent = inventory.join(', ');
  var li = document.createElement('li');
  li.textContent = item;
  inventoryList.appendChild(li); 
  appendJournal('+ ITEM: ' + item);
}

// ── FUNCTION 6: addIntel(clue) ───────────────────────────────
// Adds a clue to the intel array and shows the Review Intel button.
// The intel panel itself stays hidden until the button is clicked.
function addIntel(clue) {
  if (intel.includes(clue)) return;
  intel.push(clue);
  clueArea.style.display = 'block'; 
  appendJournal('> INTEL LOGGED: ' + clue);
}

// ── FUNCTION 7: appendJournal(text) ─────────────────────────
// Creates a <p> and appends it to the log journal via appendChild.
function appendJournal(text) {
  var entry = document.createElement('p');
  entry.textContent = text;
  logJournal.appendChild(entry); 
  logJournal.scrollTop = logJournal.scrollHeight;
}

// ── FUNCTION 8: showIntelPanel() ────────────────────────────
// Populates and reveals the intel panel, then hides the button.
// Intel only shows once per click — button disappears after.
function showIntelPanel() {
  intelList.innerHTML = ''; 

  for (var i = 0; i < intel.length; i++) {
    var li = document.createElement('li');
    li.textContent = '[' + (i + 1) + '] ' + intel[i];
    intelList.appendChild(li);
  }

  intelPanel.style.display = 'block'; 
  clueArea.style.display   = 'none';  
}

// ── FUNCTION 9: startCountdown(sec, callback) ────────────────
// Starts a setInterval countdown in the HUD, fires callback at 0.
function startCountdown(sec, callback) {
  var t = sec;
  timerBox.style.display = 'flex';
  timerDisplay.textContent = t;
  clearInterval(countdownTimer);
  countdownTimer = setInterval(function() {
    t--;
    timerDisplay.textContent = t;
    if (t <= 3) timerDisplay.style.color = '#ff2d1a';
    if (t <= 0) {
      clearInterval(countdownTimer);
      timerBox.style.display = 'none';
      timerDisplay.style.color = '';
      callback();
    }
  }, 1000);
}

// ── FUNCTION 10: triggerEnding(type) ────────────────────────
// Shows the ending screen with the correct content for this ending.
function triggerEnding(type) {
  try {
    clearInterval(countdownTimer);
    storyContainer.style.display = 'none';
    endingScreen.style.display   = 'block';
    var e = ENDINGS[type];
    if (!e) throw new Error('Unknown ending: ' + type);
    endingBadge.textContent = e.badge;
    endingTitle.textContent = e.title;
    endingTitle.style.color = e.color;
    endingText.textContent  = e.text;
  } catch (err) {
    console.error('triggerEnding error:', err);
  }
}

// ── FUNCTION 11: checkLabCode() ─────────────────────────────
// Validates the lab terminal password. Uses try-catch for safety.
function checkLabCode() {
  try {
    labCodeTries++;
    var val = codeInput.value.trim().toUpperCase();
    if (val === 'GENESIS') {
      codeInput.style.borderColor = '#39ff14';
      appendJournal('> ACCESS GRANTED — synthesis protocol unlocked.');
      loadScene('lab_unlocked');
    } else {
      codeInput.classList.remove('shake');
      void codeInput.offsetWidth;
      codeInput.classList.add('shake');
      codeInput.style.borderColor = '#c0392b';
      updateHP(-10);
      appendJournal('> ACCESS DENIED. Attempt ' + labCodeTries + '. HP -10.');
      if (labCodeTries === 3) appendJournal('> Check your intel log. The answer is in the notes you collected.');
    }
  } catch (err) {
    console.error('checkLabCode error:', err);
    appendJournal('> SYSTEM ERROR. Try again.');
  }
}

// ── FUNCTION 12: loadScene(name) ────────────────────────────
// Central scene manager. Looks up scene data, applies all effects, handles special cases (endings, input, countdown, weapon scenes).
function loadScene(name) {
  try {
    currentScene = name;
    clearInterval(countdownTimer);
    timerBox.style.display = 'none';
    intelPanel.style.display = 'none';
    clueArea.style.display   = 'none';

    // Check if this is a direct ending trigger
    if (ENDINGS[name]) return triggerEnding(name);

    if (name === 'lab_resolve') {
      var endMap = {
        lab_hosp: 'end_cure_success', lab_abandoned: 'end_survive_nocure',
        lab_sewer: 'end_death_sewer', lab_command: 'end_zombie_ruler',
        lab_radio: 'end_survive_notower', lab_nest: 'end_death'
      };
      return triggerEnding(endMap[labSubPath] || 'end_cure_success');
    }

    var s = SCENES[name];
    if (!s) throw new Error('Scene not found: ' + name);

    // Apply scene image and text
    swapImage(s.img, s.text[0]);
    displayText(s.text[0], s.text[1], s.text[2]);

    // Apply optional side effects
    if (s.hp)    updateHP(s.hp);
    if (s.item)  { addItem(s.item); weapon = s.item; }
    if (s.intel) addIntel(s.intel);
    if (s.delay) setTimeout(function() { appendJournal('> ' + s.delay); }, 2500);
    if (s.ending) {
      var endTarget = s.ending;
      var capturedSubPath = labSubPath; 
      setTimeout(function() {
        if (endTarget === 'lab_resolve') {
          var endMap = {
            lab_hosp:'end_cure_success', lab_abandoned:'end_survive_nocure',
            lab_sewer:'end_death_sewer', lab_command:'end_zombie_ruler',
            lab_radio:'end_survive_notower', lab_nest:'end_death'
          };
          triggerEnding(endMap[capturedSubPath] || 'end_cure_success');
        } else {
          triggerEnding(endTarget);
        }
      }, 1800);
      return;
    }

    // Update path display when a path is first set
    if (s.path) {
      currentPath = s.path;
      pathDisplay.textContent = s.path.toUpperCase();
      pathDisplay.style.color = s.path === 'survivor' ? '#e8a020' : '#39ff14';
    }

    // Input scene: show password field instead of buttons
    if (s.input) {
      choiceArea.style.display = 'none';
      inputArea.style.display  = 'flex';
      appendJournal('> Terminal locked. No instructions. No label.');
      return;
    }

    // Countdown scene: start timer then auto-advance
    if (s.countdown) {
      setButtons(s.b1, s.b2, s.b3);
      startCountdown(s.countdown.sec, function() {
        appendJournal('> TIME IS UP.');
        loadScene(s.countdown.next);
      });
      return;
    }

    setButtons(s.b1, s.b2, s.b3);

  } catch (err) {
    console.error('loadScene error:', err);
    appendJournal('> ERROR loading scene. Check console.');
  }
}

// ── Event Listeners ──────────────────────────────────────────

// EL 1 — Button 1: advance via BTN1_MAP
btn1.addEventListener('click', function() {
  if (currentScene === 'lab_cure')    labSubPath = 'lab_hosp';
  if (currentScene === 'lab_control') labSubPath = 'lab_command';
  var next = BTN1_MAP[currentScene];
  if (next) loadScene(next);
});

// EL 2 — Button 2: advance via BTN2_MAP
btn2.addEventListener('click', function() {
  if (currentScene === 'lab_cure')    labSubPath = 'lab_abandoned';
  if (currentScene === 'lab_control') labSubPath = 'lab_radio';
  var next = BTN2_MAP[currentScene];
  if (next) loadScene(next);
});

// EL 3 — Button 3: handles three-way branches
btn3.addEventListener('click', function() {
  if (currentScene === 'intro')         loadScene('surv_escape');
  if (currentScene === 'army_boss')     loadScene('army_sword');
  if (currentScene === 'army_sacrifice') loadScene('army_sword');
  if (currentScene === 'lab_cure')      { labSubPath = 'lab_sewer';   loadScene('lab_terminal'); }
  if (currentScene === 'lab_control')   { labSubPath = 'lab_nest';   loadScene('lab_terminal'); }
  if (currentScene === 'surv_hub')      loadScene('surv_subway');
});

// EL 4 — Submit button: run lab password check
btnSubmit.addEventListener('click', checkLabCode);

// EL 5 — Enter key in code input: also submits password
codeInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') checkLabCode();
});

// EL 6 — Live input feedback: glow amber when 7+ chars typed
codeInput.addEventListener('input', function() {
  var long = codeInput.value.trim().length >= 7;
  codeInput.style.borderColor = long ? '#e8a020' : '';
  codeInput.style.boxShadow   = long ? '0 0 8px rgba(232,160,32,0.4)' : '';
});

// EL 7 — Review Intel button: shows intel panel and hides the button
btnReview.addEventListener('click', function() {
  showIntelPanel(); 
});

// EL 8 — Restart button: resets all state and starts over
btnRestart.addEventListener('click', function() {
  hp = 100; inventory = []; intel = []; currentPath = ''; weapon = ''; labCodeTries = 0; labSubPath = '';
  clearInterval(countdownTimer);
  healthDisplay.textContent = '100';
  healthBar.style.width = '100%';
  healthBar.style.background = 'linear-gradient(90deg,#1f8c0a,#39ff14)';
  pathDisplay.textContent = '—'; pathDisplay.style.color = '';
  inventoryDisp.textContent = 'None';
  inventoryList.innerHTML = ''; logJournal.innerHTML = '';
  intelList.innerHTML = ''; intelPanel.style.display = 'none';
  timerBox.style.display = 'none'; clueArea.style.display = 'none';
  inputArea.style.display = 'none'; endingScreen.style.display = 'none';
  storyContainer.style.display = 'block';
  codeInput.value = ''; codeInput.style.borderColor = '';
  loadScene('intro');
});

// EL 9 — Keydown W: print inventory to journal
document.addEventListener('keydown', function(e) {
  if (e.key === 'w' || e.key === 'W') {
    appendJournal('[W] INVENTORY: ' + (inventory.length ? inventory.join(', ') : 'Empty'));
  }
});

// EL 10 — Keydown H: print HP status to journal
document.addEventListener('keydown', function(e) {
  if (e.key === 'h' || e.key === 'H') {
    var status = hp > 60 ? 'STABLE' : hp > 30 ? 'WOUNDED' : 'CRITICAL';
    appendJournal('[H] HP: ' + hp + '/100 — ' + status);
  }
});

// EL 11 — Keydown I: loop through and print all intel clues
document.addEventListener('keydown', function(e) {
  if (e.key === 'i' || e.key === 'I') {
    appendJournal('[I] INTEL SUMMARY:');
    for (var i = 0; i < intel.length; i++) appendJournal('  • ' + intel[i]);
    if (!intel.length) appendJournal('  No intel yet.');
  }
});

// EL 12 — Keydown Escape: scroll journal to bottom
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') logJournal.scrollTop = logJournal.scrollHeight;
});

// EL 13 — Click on story image: random scene observation
storyImage.addEventListener('click', function() {
  var obs = [
    'You scan the area. Everything is wrong in small ways.',
    'The smell of smoke and rot is everywhere.',
    'You count exits automatically now. Old habit.',
    'This world has the same bones — different scars.',
  ];
  appendJournal('> EXAMINE: ' + obs[Math.floor(Math.random() * obs.length)]);
});

// EL 14 — Double-click anywhere: random internal thought
document.addEventListener('dblclick', function() {
  var thoughts = [
    '"I opened that door. I\'m the reason this started."',
    '"Keep moving. Figure out the guilt later."',
    '"There are people alive because of what I do next."',
    '"There has to be a way back. After this is over."',
  ];
  appendJournal('> THOUGHT: ' + thoughts[Math.floor(Math.random() * thoughts.length)]);
});

// EL 15 — Click HP display: print detailed health status
healthDisplay.addEventListener('click', function() {
  if (hp > 70)      appendJournal('> You\'re holding together. Barely.');
  else if (hp > 40) appendJournal('> You\'re bleeding. Keep moving anyway.');
  else              appendJournal('> You shouldn\'t still be standing. But here you are.');
});

// EL 16 — Click inventory display: loop and list all items
inventoryDisp.addEventListener('click', function() {
  if (!inventory.length) { appendJournal('> Nothing in your pockets.'); return; }
  appendJournal('> FULL INVENTORY:');
  // for loop prints each item when inventory display is clicked
  for (var i = 0; i < inventory.length; i++) {
    appendJournal('   [' + (i + 1) + '] ' + inventory[i]);
  }
});

// EL 17 — Click path display: remind player of their current path
pathDisplay.addEventListener('click', function() {
  var messages = {
    army:     '> You\'re with the army. Find the Boss Walker.',
    lab:      '> You\'re at the lab. The formula decides everything.',
    survivor: '> You\'re keeping people alive. That matters.',
  };
  appendJournal(messages[currentPath] || '> No path chosen yet.');
});

// ── Start the game ───────────────────────────────────────────
loadScene('intro');

// Background music — loops continuously during gameplay
var bgMusic = new Audio('./sounds/background.wav');
bgMusic.loop = true;
bgMusic.volume = 0.35;

// Sound effects
var sfxDamage  = new Audio('sounds/damage.wav');      // taking damage
var sfxSuccess = new Audio('sounds/success.wav');     // correct code / good ending
var sfxDeath   = new Audio('sounds/death.wav');       // death ending
var sfxEnding  = new Audio('sounds/ending.wav');      // any ending screen

// Start music on first user interaction — browsers block autoplay before this
document.addEventListener('click', function startMusic() {
  bgMusic.play().catch(function() {});
  document.removeEventListener('click', startMusic);
}, { once: true });

// Play damage sound whenever HP drops — patch into updateHP via MutationObserver
var lastHP = 100;
var hpObserver = new MutationObserver(function() {
  var current = parseInt(healthDisplay.textContent);
  if (current < lastHP) { sfxDamage.currentTime = 0; sfxDamage.play().catch(function(){}); }
  lastHP = current;
});
hpObserver.observe(healthDisplay, { childList: true, characterData: true, subtree: true });

// Play ending sounds when the ending screen appears
var endObserver = new MutationObserver(function() {
  if (endingScreen.style.display === 'block') {
    var title = endingTitle.textContent;
    if (title.includes('DEATH') || title.includes('OVERRUN') || title.includes('INFECTED') || title.includes('LONELY')) {
      sfxDeath.currentTime = 0; sfxDeath.play().catch(function(){});
    } else {
      sfxSuccess.currentTime = 0; sfxSuccess.play().catch(function(){});
    }
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
});
endObserver.observe(endingScreen, { attributes: true, attributeFilter: ['style'] });

// Resume music when player restarts
btnRestart.addEventListener('click', function() {
  bgMusic.currentTime = 0;
  bgMusic.play().catch(function(){});
});