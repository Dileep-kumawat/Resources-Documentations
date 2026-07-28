# node-pty — Quick Recall Notes (MERN Dev Perspective)

## 1. What is it?
`node-pty` is a Node.js native addon that creates **real pseudoterminals (PTYs)**.
It lets your Node backend spawn shell processes (bash, zsh, powershell, python, ssh, etc.)
exactly as a real terminal would — not just `child_process.exec`, but a **full interactive TTY**.

Used by: VS Code's integrated terminal, Hyper, Theia, web-based IDEs, CI dashboards,
"terminal in the browser" features (think Replit, CodeSandbox, GitHub Codespaces style UIs).

## 2. Why not just `child_process`?
| Feature | `child_process.spawn/exec` | `node-pty` |
|---|---|---|
| Real TTY (isatty = true) | ❌ | ✅ |
| Interactive prompts (sudo password, REPLs, `vim`, `top`) | ❌ breaks/hangs | ✅ works |
| Colors/ANSI escape codes preserved | ⚠️ often stripped | ✅ preserved |
| Resizing terminal (rows/cols) | ❌ | ✅ |
| Line buffering vs raw mode | buffered pipes | raw PTY stream |
| Signals (Ctrl+C, Ctrl+D) | clunky | natural |

**Rule of thumb:** if the user needs to *type into* a running process or see
colored/interactive output live (like a real terminal), use `node-pty`.
If you just need to run a command and get output once, `child_process` is enough.

## 3. Installation
```bash
npm install node-pty
```
- It's a **native addon** (built with node-gyp) → needs build tools:
  - Linux: `python3`, `make`, `g++`
  - Mac: Xcode command line tools
  - Windows: `windows-build-tools` or VS Build Tools
- Must match your Node version/ABI — rebuild if you change Node versions
  (`npm rebuild` or `electron-rebuild` if used in Electron).
- Common gotcha: works in Electron, but needs `electron-rebuild` for native module ABI mismatch.

## 4. Core API

```js
const pty = require('node-pty');

const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';

const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
});

// Listen to output (everything the terminal prints)
ptyProcess.onData(data => {
  console.log(data); // send this to frontend via WebSocket
});

// Send input (as if user typed it)
ptyProcess.write('ls -la\r');

// Resize when browser window/terminal panel resizes
ptyProcess.resize(100, 40);

// Kill the process
ptyProcess.kill();

// Exit event
ptyProcess.onExit(({ exitCode, signal }) => {
  console.log('Process exited', exitCode, signal);
});
```

### Key methods/properties
- `pty.spawn(shellPath, args, options)` → returns a `ptyProcess`
- `ptyProcess.onData(callback)` — stream of terminal output (string)
- `ptyProcess.write(data)` — send keystrokes/commands (need `\r` for Enter)
- `ptyProcess.resize(cols, rows)` — sync terminal size
- `ptyProcess.kill(signal?)` — terminate
- `ptyProcess.onExit(callback)` — cleanup hook
- `ptyProcess.pid` — process id
- `ptyProcess.process` — name of running process (e.g., currently running command)

## 5. MERN Integration Pattern (Web Terminal)

**Goal:** Browser terminal (using `xterm.js`) ↔ Express/Node backend (`node-pty`) ↔ real shell.

### Architecture
```
[React + xterm.js]  <--WebSocket-->  [Express + Socket.IO/ws]  <--node-pty-->  [Bash/Shell process]
```

### Backend (Express + Socket.IO + node-pty)
```js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  const shell = pty.spawn(process.platform === 'win32' ? 'powershell.exe' : 'bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env
  });

  // PTY -> Browser
  shell.onData(data => socket.emit('terminal:output', data));

  // Browser -> PTY
  socket.on('terminal:input', data => shell.write(data));

  // Handle resize from frontend
  socket.on('terminal:resize', ({ cols, rows }) => shell.resize(cols, rows));

  socket.on('disconnect', () => shell.kill());
});

server.listen(5000);
```

### Frontend (React + xterm.js)
```bash
npm install xterm socket.io-client
```
```jsx
import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { io } from 'socket.io-client';
import 'xterm/css/xterm.css';

function WebTerminal() {
  const termRef = useRef(null);

  useEffect(() => {
    const term = new Terminal();
    term.open(termRef.current);

    const socket = io('http://localhost:5000');

    term.onData(data => socket.emit('terminal:input', data));
    socket.on('terminal:output', data => term.write(data));

    return () => socket.disconnect();
  }, []);

  return <div ref={termRef} style={{ height: '400px' }} />;
}

export default WebTerminal;
```

## 6. Real-World Use Cases (for MERN devs)
- **In-browser code execution / IDE** (like Replit, Codesandbox, LeetCode-style judges)
- **Admin dashboard** that lets devs SSH/run server commands from a web UI
- **DevOps/CI tool UI** showing live build logs with colors
- **Remote server management panel**
- **Teaching platforms** with embedded terminals
- **AI coding agents** (like Claude Code, Cursor) that need to run/interact with shell commands

## 7. Security ⚠️ (Important — interview-relevant)
Spawning a real shell from a backend = **major attack surface** if exposed publicly.
- Never expose raw shell access to unauthenticated users.
- Sandbox/isolate: use Docker containers per session, restrict user, use `chroot`/firejail, or VM-level isolation (e.g., Firecracker, gVisor).
- Limit allowed commands if possible (don't give full shell to untrusted users).
- Set resource limits (CPU/memory/timeouts) to prevent abuse (crypto mining, fork bombs).
- Rate-limit sessions; auto-kill idle PTYs to avoid resource leaks.

## 8. Common Pitfalls
- Forgetting `\r` (carriage return) when calling `.write()` to simulate "Enter".
- Not killing `ptyProcess` on socket disconnect → orphaned shell processes pile up.
- Not handling terminal resize → output gets garbled/wraps wrong.
- Native module build failures on deploy (different OS/arch) — rebuild on the target server or use Docker with matching base image.
- Using `node-pty` in serverless (Vercel/Lambda) — **won't work**, needs persistent process & native binary; use a regular long-running server (Express/EC2/Docker) instead.

## 9. Quick Comparison Cheat Sheet
| Concept | Plain analogy |
|---|---|
| `pty.spawn()` | Opening a new terminal window |
| `.write()` | Typing into that terminal |
| `.onData()` | Watching the terminal's screen output |
| `.resize()` | Dragging the terminal window edges |
| `.kill()` | Closing the terminal |
| `xterm.js` | The "terminal UI" component on the frontend (renders what node-pty sends) |

## 10. One-Line Summary (for fast recall)
> **node-pty = backend library to spawn a real, interactive terminal/shell process from Node.js; pair it with `xterm.js` on the frontend over WebSockets to build browser-based terminals (like VS Code's or Replit's), but always sandbox it since it's basically remote shell access.**
