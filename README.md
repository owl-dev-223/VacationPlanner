# Vacation Planner — HTTPS hosting build

Static web app for **online hosting (HTTPS)**.  
Plan data stays on your **team drive** as `vacation-plan-2026-2036.json` and is read/written through the browser (Chrome / Edge).

No `.bat`, no local Python server.

## How it works

1. Host this folder on any HTTPS site (GitHub Pages, Netlify, internal web server, …).
2. Keep one shared file on the team drive, e.g.  
   `U:\Urlaub\vacation-plan-2026-2036.json`  
   (a starter copy is included in this folder — copy it to the team drive).
3. Everyone opens the hosted app in **Chrome or Edge**.
4. Click **Open plan file** and select that JSON on the team drive.
5. Edit the calendar, then **Save** — the selected file is overwritten on the drive.
6. The next user opens the same file and sees the updates.

## Requirements

- HTTPS (or `localhost` for testing)
- Chrome or Edge (File System Access API)
- Team drive reachable (VPN if needed)
- Read/write permission on the shared JSON file

## Local test (optional)

```bash
cd HTTPS-Hosting
python -m http.server 8080
```

Open `http://127.0.0.1:8080/vacation_planner.html`, then use **Open plan file**.

## Security notes

- Only the JSON file you pick can be read/written by the app.
- Calendar data is not stored on the hosting provider (only HTML/CSS/JS).
- Access control = normal Windows/share permissions on the JSON file.
- Last Save wins if two people edit at the same time.

## Files

- `vacation_planner.html` — app entry
- `styles.css`, `js/` — UI and logic
- `vacation-plan-2026-2036.json` — starter plan (copy to the team drive)
