# Semester Cracker

Semester Cracker is a local-first academic productivity web app for students. It is built with Python and Flask, with personal academic data stored entirely in the browser using localStorage and IndexedDB.

## Features

- Dashboard with local academic metrics
- Task manager
- Notes system
- Attendance tracking
- CGPA calculation
- Study planner
- Pomodoro timer
- Local analytics
- Private PDF vault
- Backup and restore
- Reset app data per browser/device

## Local-first design

All user data stays in the current browser/device. No shared personal database is used. PDF files are stored in browser-local IndexedDB and not uploaded to a server.

## Run locally

1. Create a virtual environment.
2. Install dependencies:
   pip install -r requirements.txt
3. Start the app:
   gunicorn app:app
4. Open the site in a browser.

## Production

The app reads the PORT environment variable and is configured for Gunicorn in the Procfile.

## Notes

- No external database or authentication service is required.
- Every browser/device receives its own guest workspace automatically.
