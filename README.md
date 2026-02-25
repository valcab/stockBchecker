# Thomann Stock B Checker

A modern Chrome extension built with React and shadcn/ui to track and check Stock B availability on Thomann product pages.

## Features

- 🎯 **Track Multiple Items** - Add articles by ID or URL
- 🔄 **Batch Checking** - Check multiple items simultaneously  
- ⏰ **Auto-Check** - Automatic periodic checks with configurable intervals
- 🔔 **Notifications** - Get notified when B-Stock becomes available
- 💜 **Modern UI** - Clean, compact interface with purple theme
- 📊 **Results History** - View availability status with timestamps
- 💰 **Price Tracking** - Monitor both regular and B-Stock prices

## Quick Start

### For Users

1. Download or clone this repository
2. See [BUILD.md](BUILD.md) for build instructions
3. Load the extension in Chrome (see below)

### Loading in Chrome

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder (after building)

## Development

See [BUILD.md](BUILD.md) for detailed setup and development instructions.

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. **Add Items**: Enter a Thomann article URL or ID
2. **Check Stock**: Click "Check All Items" to check availability
3. **Auto-Check**: Enable automatic checking in settings
4. **Remove Items**: Click the trash icon to remove tracked items

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Chrome Extension Manifest V3

## Original Files

The original vanilla JS implementation is backed up as:
- `popup.html.bak`
- `popup.js.bak`
- `styles.css.bak`

## License

MIT
