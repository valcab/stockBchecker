# Build Instructions

This Chrome extension is built with React, TypeScript, Vite, and shadcn/ui.

## Prerequisites

You need Node.js and npm installed on your system:

### Install Node.js

#### macOS (using Homebrew)
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

#### macOS (using installer)
Download and install from: https://nodejs.org/

#### Verify installation
```bash
node --version
npm --version
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

## Development

Run the development server:
```bash
npm run dev
```

This will:
- Start Vite dev server with hot reload
- Build extension to `dist/` folder
- Watch for changes and rebuild automatically

### Load extension in Chrome:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder

During development, changes will automatically rebuild. You may need to click the refresh button in Chrome extensions page to see updates.

## Production Build

Build the extension for production:
```bash
npm run build
```

The built extension will be in the `dist/` folder, ready to be loaded in Chrome or packaged for distribution.

## Project Structure

```
stockBchecker/
├── src/
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── App.tsx          # Main popup component
│   ├── main.tsx         # React entry point
│   ├── index.css        # Global styles with Tailwind
│   ├── types.ts         # TypeScript types
│   └── background.js    # Service worker
├── public/              # Static assets
├── icons/               # Extension icons
├── manifest.json        # Extension manifest
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS config
└── package.json         # Dependencies and scripts
```

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Beautiful, accessible components
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icons

## Troubleshooting

### "npm: command not found"
You need to install Node.js first (see Prerequisites above).

### Port already in use
If port 5173 is already in use, Vite will automatically try the next available port.

### Extension not updating
1. Go to `chrome://extensions/`
2. Click the refresh icon for the Thomann Stock B Checker
3. Close and reopen the popup

### Module not found errors
Try deleting `node_modules` and reinstalling:
```bash
rm -rf node_modules package-lock.json
npm install
```
