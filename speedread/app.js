import { tokenize, isMath, focusParts, wordDelay, formatTime } from './reader.mjs';
import { renderMath } from './math.mjs';

const $ = id => document.getElementById(id);
const MAX_TEXT = 2_000_000;
const SAMPLE = `# A different way to read

This is your reading room. Instead of moving your eyes across a page, let the words come to you.

Keep your gaze on the highlighted letter. Start at a comfortable pace, then move the speed slider until the rhythm feels right. There is no score to beat.

Copy a response from Codex or ChatGPT and choose **Paste & read**. You can also paste directly into the text box or open a text, Markdown, or PDF file.

Press Space to pause whenever you want to think. The arrow keys let you revisit a word. Take your time with ideas that deserve it.`;
const MATH_SAMPLE = String.raw`# Reading equations

Here is a complete equation:

$$
x = y^2 + \log\left(\frac{T}{4}\right)
$$

Press Space to continue. Inline math such as $E = mc^2$ or \(T_{ij}\) stays together and gets extra reading time.

Aligned equations work too:

\[
\begin{aligned}
\frac{\partial \rho}{\partial t} + \nabla\cdot(\rho\mathbf{v}) &= 0, \\
\int_0^1 x^2\,dx &= \frac{1}{3}.
\end{aligned}
\]

And a matrix:

$$
A = \begin{pmatrix} a & b \\ c & d \end{pmatrix}
$$

Your original source is always kept in the text box.`;
let words = [], position = 0, remainingMs = [0], remainingHolds = [0];
let playing = false, finished = false, timer = null, busy = false;
let wpm = 300, wordSize = 72;
let equationCount = 0, sourceErrors = 0, renderedMath = null, mathError = null, playbackVersion = 0;

try {
  const prefs = JSON.parse(localStorage.getItem('speedreader-preferences') || '{}');
  if (Number.isFinite(prefs.wpm)) wpm = Math.max(100, Math.min(1000, Math.round(prefs.wpm / 25) * 25));
  if ([56, 72, 92].includes(prefs.wordSize)) wordSize = prefs.wordSize;
  if (typeof prefs.cleanMarkdown === 'boolean') $('clean-markdown').checked = prefs.cleanMarkdown;
  if (typeof prefs.pauses === 'boolean') $('pauses').checked = prefs.pauses;
  if (typeof prefs.holdMath === 'boolean') $('hold-math').checked = prefs.holdMath;
} catch { /* Reading still works when browser storage is unavailable. */ }
$('wpm').value = $('speed').value = wpm;
$('text-size').value = wordSize;

function savePreferences() {
  try {
    localStorage.setItem('speedreader-preferences', JSON.stringify({ wpm, wordSize,
      cleanMarkdown: $('clean-markdown').checked, pauses: $('pauses').checked, holdMath: $('hold-math').checked }));
  } catch { /* Preferences are optional; response text is never stored. */ }
}

function status(message, error = false) {
  $('status').textContent = message;
  $('status').classList.toggle('error', error);
}

function updateDurations() {
  remainingMs = new Array(words.length + 1).fill(0);
  remainingHolds = new Array(words.length + 1).fill(0);
  equationCount = 0;
  sourceErrors = 0;
  for (let i = words.length - 1; i >= 0; i--) {
    const math = isMath(words[i]);
    if (math) equationCount++;
    if (math && words[i].error) sourceErrors++;
    const hold = math && (words[i].error || (words[i].display && $('hold-math').checked));
    remainingHolds[i] = remainingHolds[i + 1] + (hold ? 1 : 0);
    remainingMs[i] = remainingMs[i + 1] + (hold ? 0 : wordDelay(words[i], wpm, $('pauses').checked));
  }
}

function readingSummary() {
  const count = (words.length - equationCount).toLocaleString();
  return equationCount ? `${count} words · ${equationCount} equation${equationCount === 1 ? '' : 's'}` : `${count} words`;
}

function mustHold() {
  const current = words[position];
  return isMath(current) && (current.error || mathError || (current.display && $('hold-math').checked));
}

function fitWord() {
  if (isMath(words[position])) {
    const box = $('math-scroll');
    box.classList.remove('wide');
    const size = words[position].display ? Math.min(36, wordSize / 2) : Math.min(48, wordSize * .65);
    box.style.fontSize = `${size}px`;
    if (!mathError) {
      const width = $('math-output').getBoundingClientRect().width;
      const available = box.clientWidth - 24;
      if (width > available && available > 0) box.style.fontSize = `${Math.max(18, size * available / width)}px`;
    }
    box.classList.toggle('wide', $('math-output').getBoundingClientRect().width > box.clientWidth - 24);
    return;
  }
  $('word').style.fontSize = `${wordSize}px`;
  const side = Math.max($('word-before').getBoundingClientRect().width, $('word-after').getBoundingClientRect().width)
    + $('word-focus').getBoundingClientRect().width / 2;
  const available = $('stage').clientWidth / 2 - 12;
  if (side > available && available > 0) $('word').style.fontSize = `${wordSize * available / side}px`;
}

function render() {
  const word = words[position] || 'Ready.';
  const math = isMath(word);
  $('word').hidden = math;
  $('math-display').hidden = !math;
  $('stage').classList.toggle('math-mode', math);
  if (math) {
    if (renderedMath !== word) {
      mathError = renderMath(word, $('math-output'));
      renderedMath = word;
      $('math-scroll').scrollLeft = $('math-scroll').scrollTop = 0;
    }
  } else {
    renderedMath = null;
    mathError = null;
    const parts = focusParts(word);
    for (const part of ['before', 'focus', 'after']) $('word-' + part).textContent = parts[part];
    $('word').setAttribute('aria-label', word);
  }
  $('stage').classList.toggle('math-error', Boolean(mathError));
  fitWord();
  const holding = !playing && !finished && mustHold();
  $('math-hint').hidden = !math || finished;
  $('math-hint').classList.toggle('error', Boolean(mathError));
  $('math-hint').textContent = mathError ? `${mathError} Original source is shown. Edit it, or press Space to continue.`
    : holding ? 'Take your time with this equation. Press Space or Continue when ready.'
    : 'This expression stays together and gets extra reading time.';
  if (math && $('math-scroll').classList.contains('wide')) $('math-hint').textContent += ' Scroll horizontally to see the full equation.';
  $('reader-state').textContent = !words.length ? 'Ready when you are' : finished ? 'Reading complete'
    : holding ? mathError ? 'Math needs attention' : 'Equation · waiting' : playing ? math ? 'Reading math' : 'Reading' : 'Paused';
  document.body.classList.toggle('is-playing', playing);
  const playLabel = playing ? 'Pause' : finished ? 'Replay' : holding ? 'Continue' : 'Play';
  $('play-label').textContent = playLabel;
  $('play').setAttribute('aria-label', playLabel);
  $('play-icon').hidden = playing;
  $('pause-icon').hidden = !playing;
  $('play').disabled = !words.length || busy;
  $('restart').disabled = !words.length || busy;
  $('previous').disabled = !words.length || position === 0 || busy;
  $('next').disabled = !words.length || position === words.length - 1 || busy;
  $('progress').disabled = words.length <= 1 || busy;
  $('progress').max = Math.max(1, words.length - 1);
  $('progress').value = finished ? $('progress').max : position;
  const current = words.length ? position + 1 : 0;
  $('progress').setAttribute('aria-valuetext', `${equationCount ? 'Step' : 'Word'} ${current} of ${words.length}`);
  $('position').textContent = `${current.toLocaleString()} / ${words.length.toLocaleString()} ${equationCount ? 'steps' : 'words'}`;
  $('source-count').textContent = readingSummary();
  const holds = finished ? 0 : remainingHolds[position];
  $('remaining').textContent = `${formatTime(finished ? 0 : remainingMs[position] / 1000)}${holds ? ` + ${holds} equation pause${holds === 1 ? '' : 's'}` : ' remaining'}`;
  $('context').textContent = !words.length ? 'Paste a response, or try the sample below.'
    : finished ? 'All done. Take a moment to let it sink in.'
    : (position > 4 ? '… ' : '') + words.slice(Math.max(0, position - 4), position + 5).map(token => isMath(token) ? '⟨equation⟩' : token).join(' ') + (position + 5 < words.length ? ' …' : '');
}

function pause() {
  playbackVersion++;
  clearTimeout(timer);
  timer = null;
  playing = false;
  render();
}

function schedule() {
  clearTimeout(timer);
  const version = ++playbackVersion;
  if (mustHold()) { pause(); return; }
  if (isMath(words[position]) && document.fonts.status === 'loading') {
    document.fonts.ready.then(() => {
      if (playing && version === playbackVersion) { fitWord(); schedule(); }
    });
    return;
  }
  timer = setTimeout(() => {
    if (!playing || version !== playbackVersion) return;
    if (position === words.length - 1) {
      finished = true;
      pause();
      status(`Finished ${readingSummary()}. Press Replay to read again.`);
      return;
    }
    position++;
    render();
    schedule();
  }, wordDelay(words[position], wpm, $('pauses').checked));
}

function revealReader() {
  const bounds = $('stage').getBoundingClientRect();
  if (bounds.top < 0 || bounds.bottom > window.innerHeight) $('stage').scrollIntoView({ block: 'center' });
}

function play(continueEquation = true) {
  if (!words.length || busy) return;
  if (finished) position = 0;
  else if (continueEquation && mustHold()) {
    if (position === words.length - 1) { finished = true; render(); status(`Finished ${readingSummary()}.`); return; }
    position++;
  }
  finished = false;
  playing = true;
  render();
  revealReader();
  schedule();
}

function setText(text, name = 'Text') {
  if (text.length > MAX_TEXT) {
    status('This text is too large. Please load a section under 2 million characters.', true);
    return false;
  }
  const nextWords = tokenize(text, $('clean-markdown').checked);
  if (!nextWords.length) {
    status('There are no words to read. Paste text or choose a file containing text.', true);
    return false;
  }
  pause();
  $('source').value = text;
  words = nextWords;
  position = 0;
  finished = false;
  updateDurations();
  render();
  reportReady(`${name} loaded.`);
  return true;
}

function reportReady(prefix = '') {
  status(`${prefix} ${readingSummary()} ready.${sourceErrors ? ` ${sourceErrors} math expression${sourceErrors === 1 ? ' needs' : 's need'} a matching closing delimiter; original source is retained.` : ' Press Play or ⌘/Ctrl + Enter.'}`.trim(), sourceErrors > 0);
}

function step(offset) {
  pause();
  finished = false;
  position = Math.max(0, Math.min(words.length - 1, position + offset));
  render();
}

function setBusy(value) {
  busy = value;
  $('source').readOnly = value;
  for (const id of ['paste', 'open-file', 'sample', 'math-sample', 'clean-markdown']) $(id).disabled = value;
  $('source-panel').setAttribute('aria-busy', String(value));
  render();
}

$('play').addEventListener('click', () => playing ? pause() : play());
$('restart').addEventListener('click', () => { pause(); position = 0; finished = false; render(); });
$('previous').addEventListener('click', () => step(-1));
$('next').addEventListener('click', () => step(1));
$('progress').addEventListener('input', event => {
  const nextPosition = Number(event.target.value);
  pause();
  position = Math.min(words.length - 1, nextPosition);
  finished = false;
  render();
});

function changeSpeed(value) {
  const number = Number(value);
  if (Number.isFinite(number)) wpm = Math.max(100, Math.min(1000, Math.round(number / 25) * 25));
  $('wpm').value = $('speed').value = wpm;
  updateDurations();
  savePreferences();
  render();
  if (playing) schedule();
}
$('speed').addEventListener('input', event => changeSpeed(event.target.value));
$('wpm').addEventListener('input', event => {
  const value = Number(event.target.value);
  if (value >= 100 && value <= 1000) changeSpeed(value);
});
$('wpm').addEventListener('change', event => changeSpeed(event.target.value));
$('pauses').addEventListener('change', () => { updateDurations(); savePreferences(); render(); if (playing) schedule(); });
$('hold-math').addEventListener('change', () => { updateDurations(); savePreferences(); render(); if (playing) schedule(); });
$('text-size').addEventListener('change', event => { wordSize = Number(event.target.value); savePreferences(); fitWord(); });

function sourceEdited() {
  pause();
  words = tokenize($('source').value, $('clean-markdown').checked);
  position = 0;
  finished = false;
  updateDurations();
  render();
  if (words.length) reportReady(); else status('Copy a response from either app to get started.');
}
$('source').addEventListener('input', sourceEdited);
$('clean-markdown').addEventListener('change', () => { sourceEdited(); savePreferences(); });
$('sample').addEventListener('click', () => { setText(SAMPLE, 'Sample'); revealReader(); $('stage').focus({ preventScroll: true }); });
$('math-sample').addEventListener('click', () => {
  setText(MATH_SAMPLE, 'Math sample');
  position = words.findIndex(isMath);
  render();
  revealReader();
  $('stage').focus({ preventScroll: true });
});

$('paste').addEventListener('click', async () => {
  pause();
  setBusy(true);
  try {
    const text = await navigator.clipboard.readText();
    const loaded = setText(text, 'Clipboard');
    setBusy(false);
    if (loaded) { $('stage').focus({ preventScroll: true }); play(false); }
  } catch {
    setBusy(false);
    $('source').focus();
    status('Clipboard access is unavailable. Paste into the text box with ⌘V or Ctrl+V, then press Play.', true);
  }
});

$('open-file').addEventListener('click', () => $('file').click());
$('file').addEventListener('change', async () => {
  const file = $('file').files[0];
  $('file').value = '';
  if (!file) return;
  if (!/\.(txt|md|markdown|pdf)$/i.test(file.name)) { status('Choose a .txt, .md, or .pdf file.', true); return; }
  if (file.size > 20 * 1024 * 1024) { status('Choose a file smaller than 20 MB.', true); return; }
  pause();
  setBusy(true);
  status(`Reading ${file.name} locally…`);
  try {
    let text;
    if (/\.pdf$/i.test(file.name)) {
      const { extractPdf } = await import('./pdf.mjs');
      text = await extractPdf(file);
    } else {
      text = await file.text();
    }
    if (setText(text, file.name) && /\.pdf$/i.test(file.name)) status(`${file.name} loaded. Check text order for columns, tables, or equations before reading.`);
  } catch (error) {
    status(error.message || 'Could not open that file. Try pasting its text instead.', true);
  } finally {
    setBusy(false);
  }
});

document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault();
    if (playing) pause(); else play();
    $('stage').focus({ preventScroll: true });
    return;
  }
  if (event.key === 'Escape') { pause(); return; }
  if (busy || event.metaKey || event.ctrlKey || event.altKey || event.repeat || event.target.closest('textarea, input, select, a, [contenteditable="true"]')) return;
  if (event.target.closest('#math-scroll') && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) return;
  if (event.code === 'Space' && !event.target.closest('button')) { event.preventDefault(); playing ? pause() : play(); }
  if (words.length && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) { event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1); }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && playing) { pause(); status('Paused while the reader is hidden. Press Play to continue.'); }
});
new ResizeObserver(fitWord).observe($('stage'));
document.fonts.addEventListener('loadingdone', fitWord);

render();
