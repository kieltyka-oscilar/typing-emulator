# Human Typer ⌨️🚀

**Human Typer** is a Chrome extension designed to make automation look natural. It intercepts standard paste events (`Ctrl+V` or `Cmd+V`) and replays the clipboard content as realistic, human-like typing—complete with configurable speeds, natural timing jitter, and simulated errors with automatic corrections.

## ✨ Features

- **Paste Interception**: Automatically catches paste events in input fields, textareas, and `contentEditable` elements.
- **Realistic Speed**: Configure typing speed from 10 to 200 Words Per Minute (WPM).
- **Natural Timing**: Dynamic pauses after punctuation (`.`, `!`, `?`) and commas, plus randomized jitter to mimic human rhythm.
- **Error Simulation**: Real-world typo generation using a QWERTY keyboard adjacency map. The extension will occasionally hit the "wrong" key, pause, backspace, and correct itself.
- **Clipboard Preview**: View exactly what is in your clipboard before you "type" it.
- **Universal Support**: Works on almost any website, including complex web apps with custom text editors.
- **Sleek Dark UI**: A modern, premium interface for quick configuration.

## 🚀 Installation

Since this is a developer tool, you can install it as an "Unpacked" extension:

1. **Download/Clone** this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** in the top-left corner.
5. Select the folder containing the extension files.
6. The Human Typer icon should now appear in your extension bar.

## 🛠 Usage

1. Click the extension icon to open the popup.
2. **Enable** the "Human Typer" toggle.
3. Configure your desired **WPM**, **Error Rate**, and **Speed Variance**.
4. Go to any text field on a website.
5. Press `Ctrl+V` (Windows/Linux) or `Cmd+V` (Mac).
6. Watch as the text is typed out naturally instead of appearing instantly!

> [!TIP]
> You can stop an ongoing typing session by clicking the toggle to "Disabled" or by initiating a new paste.

## ⚙️ Configuration

- **Typing Speed**: Controls the base speed of characters per minute.
- **Error Rate**: The probability (0% to 40%) that a character will trigger a typo.
- **Speed Variance**:
    - **Low**: Very consistent rhythm.
    - **Medium**: Natural human variation.
    - **High**: Significant bursts and lulls in typing speed.

## 🧠 How it Works

Human Typer uses a combination of event interception and DOM manipulation:

1. **Interception**: A content script listens for the `paste` event in the capture phase. If enabled, it prevents the default instant paste.
2. **Analysis**: It extracts the plain text from the clipboard.
3. **Simulation**:
    - It iterates through each character, calculating a delay based on WPM and variance.
    - It dispatches `keydown`, `keypress`, and `keyup` events for every character to ensure compatibility with site-side scripts (like character counters or auto-savers).
    - For typos, it selects a neighbor key from a QWERTY map, "types" it, then executes a `deleteContentBackward` input event before typing the correct character.
4. **Context Awareness**: It uses `document.execCommand` for `contentEditable` areas and native property setters for standard inputs to ensure the cursor stays in the right place and site logic isn't broken.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
