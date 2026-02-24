# Thomann Stock B Checker - Project Instructions

This is a Chrome extension project for checking Stock B availability on Thomann product pages.

## Project Overview

A Chrome extension that allows users to:
- Track multiple Thomann articles
- Check Stock B availability for multiple items at once
- View results with timestamps in a popup UI
- Manage tracked items (add, remove, clear)

## Project Structure

- `manifest.json` - Chrome extension configuration
- `popup.html` - Main popup interface
- `popup.js` - Popup logic and event handlers
- `styles.css` - UI styling
- `background.js` - Background service worker
- `icons/` - Extension icon assets

## Key Features

1. **Item Management**: Add/remove articles by ID or URL
2. **Stock Checking**: Batch check multiple items simultaneously
3. **Results Display**: Show availability status with timestamps
4. **Local Storage**: All data stored locally in browser

## Development Notes

- Uses Chrome Manifest V3
- No external dependencies required
- Pure JavaScript, HTML, CSS
- Local storage for persistence
- Direct HTTP requests to Thomann pages

## To Load Extension for Testing

1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select this folder

## Icon Assets Needed

Create placeholder icons in `icons/` directory:
- `icon-16.png` (16x16 pixels)
- `icon-48.png` (48x48 pixels)
- `icon-128.png` (128x128 pixels)
