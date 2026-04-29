const enabledToggle     = document.getElementById('enabledToggle');
const toggleRow         = document.getElementById('toggleRow');
const toggleTitle       = document.getElementById('toggleTitle');
const toggleSub         = document.getElementById('toggleSub');
const hint              = document.getElementById('hint');
const wpmSlider         = document.getElementById('wpmSlider');
const errorSlider       = document.getElementById('errorSlider');
const varianceSlider    = document.getElementById('varianceSlider');
const wpmLabel          = document.getElementById('wpmLabel');
const errorLabel        = document.getElementById('errorLabel');
const varianceLabel     = document.getElementById('varianceLabel');
const clipboardPreview  = document.getElementById('clipboardPreview');

const varianceNames = ['None', 'Medium', 'High'];

// ── Clipboard preview ────────────────────────────────────────────────────────
async function readClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    clipboardPreview.textContent = text || '(empty)';
    clipboardPreview.style.color = '#aaa';
  } catch {
    clipboardPreview.textContent = 'Unable to read clipboard — copy something, then click ↻';
    clipboardPreview.style.color = '#e02020';
  }
}

readClipboard();
document.getElementById('refreshClipBtn').addEventListener('click', readClipboard);

// ── Load saved settings ──────────────────────────────────────────────────────
chrome.storage.local.get(['enabled', 'wpm', 'errorRate', 'variance'], (data) => {
  const on = !!data.enabled;
  setToggleUI(on);
  enabledToggle.checked = on;

  if (data.wpm !== undefined)       { wpmSlider.value      = data.wpm;       wpmLabel.textContent      = `${data.wpm} WPM`; }
  if (data.errorRate !== undefined) { errorSlider.value    = data.errorRate; errorLabel.textContent    = `${data.errorRate}%`; }
  if (data.variance !== undefined)  { varianceSlider.value = data.variance;  varianceLabel.textContent = varianceNames[data.variance]; }
});

// ── Toggle ───────────────────────────────────────────────────────────────────
function setToggleUI(on) {
  toggleTitle.textContent = on ? 'Enabled' : 'Disabled';
  toggleSub.textContent   = on ? 'Paste will simulate typing' : 'Paste will behave normally';
  toggleRow.classList.toggle('on', on);
  hint.classList.toggle('active', on);
}

toggleRow.addEventListener('click', () => {
  enabledToggle.checked = !enabledToggle.checked;
  enabledToggle.dispatchEvent(new Event('change'));
});

// Prevent the pill label's click from bubbling up and double-toggling
document.getElementById('pillLabel').addEventListener('click', (e) => {
  e.stopPropagation();
});

enabledToggle.addEventListener('change', () => {
  const on = enabledToggle.checked;
  setToggleUI(on);
  chrome.storage.local.set({ enabled: on }); // content script reads this fresh on each paste
});

// ── Sliders ──────────────────────────────────────────────────────────────────
wpmSlider.addEventListener('input', () => {
  wpmLabel.textContent = `${wpmSlider.value} WPM`;
  chrome.storage.local.set({ wpm: Number(wpmSlider.value) });
});

errorSlider.addEventListener('input', () => {
  errorLabel.textContent = `${errorSlider.value}%`;
  chrome.storage.local.set({ errorRate: Number(errorSlider.value) }); // stored as 0–40
});

varianceSlider.addEventListener('input', () => {
  varianceLabel.textContent = varianceNames[varianceSlider.value];
  chrome.storage.local.set({ variance: Number(varianceSlider.value) });
});
