# AsteroNote v2.0 Examples

This directory contains example HTML files demonstrating various features of AsteroNote v2.0.

## Prerequisites

Before running the examples, you must build the project:

```bash
npm install
npm run build:v2
```

This will generate the necessary files in the `dist/v2/` directory.

## Running the Examples

After building, you can open any of the HTML files directly in your browser:

1. **cdn-basic.html** - Basic editor initialization
2. **cdn-with-plugins.html** - Editor with all Phase 1 plugins
3. **cdn-events.html** - Real-time event logging demonstration

### Option 1: Direct File Open
Simply double-click any `.html` file or open it in your browser.

### Option 2: Local Server (Recommended)
For a better development experience, use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to:
- http://localhost:8000/docs/examples/cdn-basic.html
- http://localhost:8000/docs/examples/cdn-with-plugins.html
- http://localhost:8000/docs/examples/cdn-events.html

## NPM/ESM Examples

See `npm-*.js` files for module import examples. These require a bundler like Webpack or Vite to run.

## Notes

- All examples use the local build from `../../dist/v2/AsteroNote.js`
- Make sure to rebuild (`npm run build:v2`) after making changes to the source code
- For production use, reference the published CDN version instead

