# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Arzisoft Coming-Soon Landing Page** — A single-file, static HTML website with a cyberpunk/retro aesthetic. Features a Matrix rain effect, countdown timer to launch (June 29, 2026), and progress bar showing time elapsed since project start (March 29, 2026).

- **Type:** Static HTML page (no build system, no dependencies)
- **Target Launch:** June 29, 2026
- **Duration:** 92 days from start to launch
- **Contact:** contact@arzisoft.com

## File Structure

```
.
└── index.html          # Single file containing all HTML, CSS, and JavaScript
```

## Development

### Viewing the Page

Open `index.html` directly in a browser:
```bash
# On Windows (from repo root)
start index.html

# Or use a local server (Python 3)
python -m http.server 8000
# Then visit http://localhost:8000
```

### Key Components

All styling and logic is embedded in `index.html`:

1. **CSS Variables** (`:root`)
   - `--bg`: Background color (`#050810`)
   - `--accent`: Primary accent (`#00ffe0` cyan)
   - `--accent2`: Secondary accent (`#0077ff` blue)
   - `--text`: Text color (`#c8d8e8`)
   - `--dim`: Dimmed text (`#3a4a5a`)

2. **Animations**
   - Matrix rain effect (canvas animation, 40ms interval)
   - Fade-up entrance animations with staggered delays
   - Blinking colon separators in countdown
   - Pulsing status indicator

3. **JavaScript Logic**
   - **Clock update:** Real-time HH:MM:SS display (1s interval)
   - **Countdown:** Calculates days/hours/minutes/seconds until June 29, 2026
   - **Progress bar:** Shows percentage of time elapsed (March 29 → June 29)
   - **Matrix animation:** Character fall effect with responsive canvas resizing

### Editing

When modifying:
- **Countdown date:** Change `LAUNCH` constant in the `<script>` section (currently `2026-06-29T00:00:00`)
- **Colors:** Update CSS variables in `:root`
- **Fonts:** Currently uses Google Fonts (Orbitron, Share Tech Mono)
- **Content:** Update text in the `.logo-block`, `.headline`, and `.boot-log` sections

### Testing Changes

1. Edit `index.html`
2. Save and reload the browser (Ctrl+R or Cmd+R)
3. Open DevTools (F12) to debug:
   - Canvas animations in the Console
   - Network tab to verify font loading
   - Responsive design at different viewport sizes

## Architecture Notes

**Design Pattern:** Single-page HTML with embedded styling and scripting
- **Pros:** No build step, single file deployment, instant load time
- **Cons:** Not suitable for scaling to multi-page site

**Animation Strategy:** Staggered entrance animations (0.2s–1.6s delays) give a progressive reveal effect. The Matrix canvas runs independently to avoid blocking.

**Responsive Design:** Uses `clamp()` CSS function for fluid scaling across viewport sizes (mobile to desktop).

## Git Branches

- `main` — Production-ready coming-soon page
- `coming-soon` — Development branch for this page
