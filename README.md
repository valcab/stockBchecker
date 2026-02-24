# Thomann Stock B Checker Extension

A Chrome extension that checks the availability of Stock B items on Thomann product pages. This extension allows you to track multiple items and quickly check their stock status.

## Features

- ✅ Track multiple Thomann articles
- ✅ Check Stock B availability for all items at once
- ✅ View check history with timestamps
- ✅ Easy-to-use popup interface
- ✅ Quick add/remove items functionality

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `stockBchecker` folder
6. The extension icon will appear in your Chrome toolbar

## Usage

### Adding Items

1. Click the extension icon in your Chrome toolbar
2. Enter a Thomann article ID (e.g., "123456") or full URL (e.g., "https://www.thomann.de/123456.html")
3. Click "Add Item" or press Enter
4. The item will appear in the "Tracked Items" list

### Checking Stock

1. Click the "Check All Items" button
2. Wait for the checks to complete (typically 2-5 seconds)
3. Results appear in the "Results" section with status indicators:
   - 🟢 Green: Stock B is available
   - 🔴 Red: Stock B is not available
   - 🟡 Yellow: Currently checking
   - Gray: Error during check

### Managing Items

- Click "Remove" next to any item to stop tracking it
- Click "Clear All" to remove all tracked items and results

## Technical Details

- **Manifest Version**: 3
- **Permissions**: 
  - `activeTab` - Required to interact with active tab
  - `scripting` - Required to run content scripts
  - `storage` - Required to save items and results
- **Host Permissions**: Access to Thomann.de website

## How It Works

The extension:
1. Fetches Thomann product pages using the article URLs
2. Searches for Stock B availability indicators in the page HTML
3. Stores results locally in your browser
4. Updates the popup UI with real-time status

## Project Structure

```
stockBchecker/
├── manifest.json          # Extension configuration
├── popup.html            # Main UI
├── popup.js              # Popup logic and event handlers
├── styles.css            # UI styling
├── background.js         # Background service worker
├── icons/                # Extension icons
└── README.md             # This file
```

## Future Enhancements

- [ ] Scheduled automatic checks
- [ ] Notifications when Stock B becomes available
- [ ] Support for multiple regional Thomann sites
- [ ] Price tracking
- [ ] Export check history
- [ ] Browser storage sync across devices

## Troubleshooting

**Extension doesn't load:**
- Make sure you're in Developer mode
- Check that all files are in the correct directory
- Reload the extension after making changes

**Stock check fails:**
- Ensure you have an active internet connection
- Verify the article ID is correct
- Check that the Thomann website is accessible

**Results not updating:**
- Clear your browser cache
- Reload the extension
- Try removing and re-adding the item

## License

This project is provided as-is for personal use.
