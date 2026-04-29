// ─── Keyboard adjacency map (QWERTY) ────────────────────────────────────────
const ADJACENT = {
  a: ['q','w','s','z'],        b: ['v','g','h','n'],        c: ['x','d','f','v'],
  d: ['s','e','r','f','c','x'],e: ['w','s','d','r'],        f: ['d','r','t','g','v','c'],
  g: ['f','t','y','h','b','v'],h: ['g','y','u','j','n','b'],i: ['u','j','k','o'],
  j: ['h','u','i','k','m','n'],k: ['j','i','o','l','m'],    l: ['k','o','p'],
  m: ['n','j','k'],            n: ['b','h','j','m'],         o: ['i','k','l','p'],
  p: ['o','l'],                q: ['w','a'],                 r: ['e','d','f','t'],
  s: ['a','w','e','d','x','z'],t: ['r','f','g','y'],         u: ['y','h','j','i'],
  v: ['c','f','g','b'],        w: ['q','a','s','e'],         x: ['z','s','d','c'],
  y: ['t','g','h','u'],        z: ['a','s','x'],
  '1':['2','q'],'2':['1','3','q','w'],'3':['2','4','w','e'],'4':['3','5','e','r'],
  '5':['4','6','r','t'],'6':['5','7','t','y'],'7':['6','8','y','u'],
  '8':['7','9','u','i'],'9':['8','0','i','o'],'0':['9','o','p'],
};

function getAdjacentKey(ch) {
  const lower = ch.toLowerCase();
  const pool  = ADJACENT[lower];
  if (!pool) return lower;
  const wrong = pool[Math.floor(Math.random() * pool.length)];
  return ch === ch.toUpperCase() ? wrong.toUpperCase() : wrong;
}

// ─── Timing ──────────────────────────────────────────────────────────────────
const VARIANCE_FACTORS = [0, 0.35, 0.7];

function charDelay(baseMs, variance) {
  const factor = VARIANCE_FACTORS[variance] ?? 0.35;
  if (factor === 0) return baseMs;
  const rand   = (Math.random() + Math.random()) / 2;
  const jitter = 1 + factor * (rand * 2 - 1);
  return Math.max(20, baseMs * jitter);
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─── Element helpers ─────────────────────────────────────────────────────────
function isEditable(el) {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return !el.disabled && !el.readOnly;
  return !!el.isContentEditable;
}

function isContentEditable(el) {
  return el && el.isContentEditable;
}

function dispatchKey(el, eventType, key, code) {
  el.dispatchEvent(new KeyboardEvent(eventType, {
    key, code, bubbles: true, cancelable: true, composed: true, view: window,
  }));
}

function getNativeSetter(el) {
  const proto = el instanceof HTMLInputElement
    ? HTMLInputElement.prototype
    : HTMLTextAreaElement.prototype;
  return Object.getOwnPropertyDescriptor(proto, 'value')?.set;
}

function insertChar(el, char) {
  if (isContentEditable(el)) {
    document.execCommand('insertText', false, char);
    return;
  }
  const start  = el.selectionStart ?? el.value.length;
  const end    = el.selectionEnd   ?? el.value.length;
  const before = el.value.slice(0, start);
  const after  = el.value.slice(end);
  const setter = getNativeSetter(el);
  if (setter) setter.call(el, before + char + after);
  else        el.value = before + char + after;
  el.setSelectionRange(start + 1, start + 1);
  el.dispatchEvent(new InputEvent('input', {
    inputType: 'insertText', data: char,
    bubbles: true, cancelable: false, composed: true,
  }));
}

function deleteChar(el) {
  if (isContentEditable(el)) {
    document.execCommand('delete', false);
    return;
  }
  const start  = el.selectionStart ?? el.value.length;
  const end    = el.selectionEnd   ?? el.value.length;
  if (start === 0 && start === end) return;
  const delStart = start === end ? start - 1 : start;
  const before   = el.value.slice(0, delStart);
  const after    = el.value.slice(end);
  const setter   = getNativeSetter(el);
  if (setter) setter.call(el, before + after);
  else        el.value = before + after;
  el.setSelectionRange(delStart, delStart);
  el.dispatchEvent(new InputEvent('input', {
    inputType: 'deleteContentBackward', data: null,
    bubbles: true, cancelable: false, composed: true,
  }));
}

function charCode(char) {
  if (char.match(/[a-zA-Z]/)) return `Key${char.toUpperCase()}`;
  if (char.match(/[0-9]/))    return `Digit${char}`;
  return 'Unidentified';
}

async function typeOneChar(el, char) {
  const code = charCode(char);
  dispatchKey(el, 'keydown',  char, code);
  dispatchKey(el, 'keypress', char, code);
  insertChar(el, char);
  dispatchKey(el, 'keyup',    char, code);
}

async function typeBackspace(el) {
  dispatchKey(el, 'keydown',  'Backspace', 'Backspace');
  deleteChar(el);
  dispatchKey(el, 'keyup',    'Backspace', 'Backspace');
}

// ─── Main typing engine ───────────────────────────────────────────────────────
let stopTyping = false;
let isTyping   = false;

async function typeText(el, text, config) {
  const { wpm, errorRate, variance } = config;
  const baseDelay = 60000 / (wpm * 5);
  isTyping   = true;
  stopTyping = false;
  el.focus();

  let i = 0;
  while (i < text.length) {
    if (stopTyping) break;

    const char = text[i];

    if (char === '\n') {
      if (isContentEditable(el)) document.execCommand('insertParagraph', false);
      else insertChar(el, '\n');
      i++;
      await sleep(charDelay(baseDelay * 1.5, variance));
      continue;
    }

    const canErr    = /[a-zA-Z0-9]/.test(char);
    const makeError = canErr && Math.random() < errorRate;

    if (makeError) {
      const numWrong = Math.random() < 0.75 ? 1 : 2;
      for (let e = 0; e < numWrong && !stopTyping; e++) {
        await typeOneChar(el, getAdjacentKey(char));
        await sleep(charDelay(baseDelay, variance));
      }
      if (stopTyping) break;
      await sleep(charDelay(baseDelay * 3, variance));
      for (let e = 0; e < numWrong && !stopTyping; e++) {
        await typeBackspace(el);
        await sleep(charDelay(baseDelay * 0.7, variance));
      }
      if (stopTyping) break;
      await sleep(charDelay(baseDelay * 1.2, variance));
    }

    if (stopTyping) break;
    await typeOneChar(el, char);
    i++;

    let delay = charDelay(baseDelay, variance);
    if ('.!?'.includes(char))      delay *= 3.5;
    else if (',;:'.includes(char)) delay *= 1.8;
    else if (char === ' ')         delay *= 1.1;
    await sleep(delay);
  }

  isTyping = false;
}

// ─── Paste interception ───────────────────────────────────────────────────────
document.addEventListener('paste', async (e) => {
  // Read state fresh from storage on every paste — no stale in-memory state
  let settings;
  try {
    settings = await chrome.storage.local.get(['enabled', 'wpm', 'errorRate', 'variance']);
  } catch (_) {
    return;
  }

  if (!settings.enabled) return;
  if (!isEditable(e.target)) return;

  // Stop any in-progress typing and start fresh
  if (isTyping) {
    stopTyping = true;
    await sleep(60);
  }

  const text = e.clipboardData.getData('text/plain');
  if (!text) return;

  e.preventDefault();
  e.stopImmediatePropagation();

  const config = {
    wpm:       settings.wpm       ?? 60,
    errorRate: (settings.errorRate ?? 5) / 100,  // storage always holds raw 0–40 value
    variance:  settings.variance  ?? 1,
  };

  try {
    await typeText(e.target, text, config);
  } catch (_) {}
}, true);
