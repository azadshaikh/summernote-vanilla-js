# PRD: AsteroNote v2.0 - Modern Architecture Migration

## Introduction/Overview

AsteroNote v2.0 (formerly Summernote) represents a major architectural overhaul and rebranding of the popular WYSIWYG editor. The primary goal is to modernize the codebase to support both traditional CDN-based usage (CommonJS) and modern ES module imports via NPM, while redesigning the plugin architecture for better isolation and maintainability. This migration will create a new major version (v2.0.0) with a new brand identity under Astero Digital.

**Problem Statement:** The current architecture lacks modern module support, has a tightly-coupled plugin system, and doesn't provide flexible bundle options for different use cases.

**Goal:** Create a modern, modular version of the editor that supports both legacy CDN usage and modern NPM-based workflows, with a redesigned plugin architecture, multiple bundle options, and a fresh brand identity as AsteroNote.

## Goals

1. **Dual Distribution Support:** Enable AsteroNote to work seamlessly as both a CDN-delivered CommonJS library and an NPM-importable ES module
2. **Remove jQuery Dependency:** Eliminate jQuery dependency entirely and rewrite all functionality using vanilla JavaScript
3. **Simplify Styling and Design:** Use only Bootstrap 5.3 for styling, Google Fonts for typography, and Bootstrap Icons for all iconography
4. **Plugin System Redesign:** Implement a completely redesigned plugin architecture with better isolation, preventing plugins from interfering with each other
5. **Flexible Bundling:** Provide multiple bundle options (core + optional plugins) for optimized loading and tree-shaking
6. **Simple Event Management:** Implement a lightweight EventEmitter pattern for internal and external event handling
7. **Brand Identity:** Establish AsteroNote as a modern, professional brand under Astero Digital
8. **Phased Rollout:** Release core functionality first, followed by plugin ecosystem updates

## User Stories

### Story 1: Legacy CDN User
**As a** developer using a WYSIWYG editor via CDN
**I want to** use AsteroNote v2.0 without changing my integration method
**So that** I can benefit from improvements while maintaining my existing workflow

**Acceptance Criteria:**
- Can include AsteroNote v2.0 via `<script>` tag from CDN
- Global `AsteroNote` object is available
- CommonJS-style API works as expected
- Backward compatibility aliases (`Summernote`) available for gradual migration

### Story 2: Modern NPM User
**As a** developer using modern JavaScript build tools
**I want to** import AsteroNote as an ES module from NPM
**So that** I can tree-shake unused code and integrate it into my build pipeline

**Acceptance Criteria:**
- Can install via `npm install asteronote@2.0.0`
- Can import using `import AsteroNote from 'asteronote'`
- Can selectively import plugins: `import { BoldPlugin } from 'asteronote/plugins'`
- Works with Webpack, Vite, Rollup, and other modern bundlers
- Supports tree-shaking for unused plugins

### Story 3: Plugin Developer
**As a** plugin developer
**I want** a well-defined plugin API with proper isolation
**So that** my plugin doesn't conflict with other plugins and is easier to maintain

**Acceptance Criteria:**
- Clear plugin lifecycle hooks (init, destroy, enable, disable)
- Isolated plugin scope (no global state pollution)
- Access to editor instance through well-defined API
- Plugin can register its own events without conflicts
- Documentation for creating custom plugins

### Story 4: Bundle Optimizer
**As a** performance-conscious developer
**I want** to load only the core editor and specific plugins I need
**So that** I can minimize bundle size and improve page load time

**Acceptance Criteria:**
- Can load core editor without any plugins
- Can selectively include only needed plugins
- Multiple pre-built bundles available (minimal, standard, full)
- Clear documentation on bundle sizes and contents

## Functional Requirements

### FR1: jQuery Removal and Vanilla JavaScript Implementation
1.1. ALL jQuery code MUST be replaced with vanilla JavaScript (ES6+)
1.2. jQuery MUST NOT be included as a dependency in package.json
1.3. The library MUST NOT require jQuery to be loaded on the page
1.4. All DOM manipulation MUST use native methods (querySelector, addEventListener, classList, etc.)
1.5. All AJAX calls MUST use native fetch API
1.6. All animation/transitions MUST use CSS transitions or Web Animations API
1.7. All event handling MUST use native addEventListener/removeEventListener
1.8. Helper utilities MUST be created for common operations (e.g., DOM traversal, event delegation)

### FR2: Styling and Design Simplification
2.1. The editor MUST use ONLY Bootstrap 5.3 CSS for all styling
2.2. All legacy Bootstrap 3 and Bootstrap 4 theme support MUST be removed
2.3. Custom theme variations (lite, air, etc.) MUST be removed
2.4. Typography MUST use Google Fonts (specify default font family in documentation)
2.5. ALL icons MUST use Bootstrap Icons (https://icons.getbootstrap.com/)
2.6. Font Awesome and other icon libraries MUST be removed as dependencies
2.7. The editor MUST provide a single, clean demo page using Bootstrap 5.3
2.8. Multiple demo variations MUST NOT be included
2.9. CSS MUST be minimal and rely primarily on Bootstrap 5.3 classes
2.10. Custom SCSS/LESS compilation MUST NOT be required (pure CSS or minimal custom styles)

### FR3: Internationalization Removal
3.1. Translation files and i18n support MUST be removed from the core
3.2. All UI text MUST be in English only
3.3. Language switching functionality MUST be removed
3.4. The codebase MUST NOT include any translation infrastructure
3.5. Documentation MUST note that v2.0 is English-only (i18n can be added by the community later if needed)

### FR4: Dual Module System Support
4.1. The library MUST be buildable as both UMD (for CDN) and ES modules (for NPM)
4.2. The UMD build MUST expose a global object for backward compatibility with CDN usage
4.3. The ES module build MUST use standard `export` syntax for tree-shaking
4.4. Both builds MUST provide the same core functionality
4.5. Package.json MUST include both `main` (CommonJS/UMD) and `module` (ESM) entry points

### FR5: EventEmitter Implementation
5.1. The core MUST implement a simple EventEmitter pattern for event handling
5.2. The EventEmitter MUST support `.on()`, `.off()`, `.once()`, and `.emit()` methods
5.3. Events MUST be namespaced to prevent conflicts (e.g., `summernote.change`, `plugin.custom.action`)
5.4. The EventEmitter MUST support both internal (core) and external (user/plugin) events
5.5. Custom events MUST replace all jQuery custom events from v1.x

### FR6: Plugin Architecture Redesign
6.1. Plugins MUST be isolated from each other with no shared global state
6.2. Each plugin MUST have a standardized lifecycle: `init`, `destroy`, `enable`, `disable`
6.3. Plugins MUST register themselves through a plugin registry
6.4. Plugins MUST access the editor instance only through a defined API (no direct DOM manipulation of other plugins)
6.5. Plugins MUST declare dependencies explicitly if they rely on other plugins
6.6. The core MUST provide plugin load order management based on dependencies
6.7. Plugins MUST be able to contribute to toolbar, context menu, and keyboard shortcuts through defined extension points

### FR7: Multiple Bundle Options
7.1. The build system MUST generate the following bundles:
   - `summernote-core.js` (core editor only, no plugins)
   - `summernote.js` (core + essential plugins)
   - `summernote-full.js` (core + all plugins)
7.2. Each plugin MUST be available as a separate bundle (e.g., `plugin-table.js`)
7.3. Bundle documentation MUST clearly state size and included features
7.4. The NPM package MUST support selective imports: `import { Table } from 'summernote/plugins/table'`
7.5. All bundles MUST include source maps for debugging

### FR8: Core API Design
8.1. The core API MUST provide a pure JavaScript initialization API (no jQuery required)
8.2. The API MUST provide both imperative (`new Summernote()`) and declarative (data attributes) initialization
8.3. The API MUST expose methods for content manipulation, event handling, and state management
8.4. The API MUST be documented with clear examples for both CDN and NPM usage
8.5. Method names MUST be consistent and follow JavaScript naming conventions
8.6. Optional jQuery plugin wrapper MAY be provided as a separate package for easier migration

### FR9: Version Coexistence
9.1. v2.0 MUST be publishable to NPM with `@2.0.0` tag without affecting v1.x
9.2. The CDN MUST support serving both versions via versioned URLs
9.3. Documentation MUST clearly indicate which version is being referenced
9.4. The GitHub repository MUST use branches or tags to maintain both versions

### FR10: Phased Rollout Support
10.1. The core editor MUST be feature-complete and releasable independently
10.2. Core plugins MUST be prioritized and released in phase 1
10.3. Additional plugins MUST be released in subsequent phases
10.4. Each phase MUST have clear release notes and migration guidance
10.5. Plugin compatibility matrix MUST be maintained and published

## Non-Goals (Out of Scope)

1. **Migration Tools:** Automated migration tools or codemods will NOT be provided
2. **Comprehensive Migration Guide:** Detailed step-by-step migration documentation is out of scope; only API documentation will be provided
3. **Automated Testing:** Comprehensive test suite implementation is deferred to a later phase (manual testing for initial release)
4. **TypeScript Support:** No TypeScript rewrite or type definitions will be included in v2.0
5. **IE11 Support:** Legacy browser support may be dropped to enable modern JavaScript features
6. **Backward Compatibility:** v2.0 will NOT maintain API compatibility with v1.x (breaking changes expected)
7. **UI/UX Changes:** Visual design and user interface will remain largely unchanged from v1.x
8. **jQuery Compatibility Layer:** No built-in compatibility layer for jQuery will be provided in the core (though a separate wrapper package may be created later)
9. **Internationalization (i18n):** Translation support and multi-language functionality will NOT be included
10. **Multiple Theme Variants:** Bootstrap 3, Bootstrap 4, and custom theme support will NOT be maintained
11. **Multiple Icon Libraries:** Only Bootstrap Icons will be supported; Font Awesome and other icon libraries will NOT be included
12. **Font Management:** Custom font loading or management will NOT be provided; users should use Google Fonts or their own fonts
13. **Multiple Demo Pages:** Only one comprehensive demo page will be provided

## Design Considerations

### Module Structure
```
summernote/
├── src/
│   ├── core/
│   │   ├── editor.js          # Main editor class
│   │   ├── events.js          # EventEmitter implementation
│   │   └── plugin-registry.js # Plugin management
│   ├── plugins/
│   │   ├── bold.js
│   │   ├── italic.js
│   │   ├── table.js
│   │   └── ...
│   └── index.js               # Main entry point
├── dist/
│   ├── summernote-core.js     # Core only (UMD)
│   ├── summernote-core.esm.js # Core only (ESM)
│   ├── summernote.js          # Standard bundle (UMD)
│   ├── summernote.esm.js      # Standard bundle (ESM)
│   └── plugins/               # Individual plugin bundles
└── package.json
```

### API Example (Dual Usage)
```javascript
// CDN Usage (UMD) - NO JQUERY REQUIRED
<script src="https://cdn.example.com/asteronote@2.0.0/asteronote.js"></script>
<script>
  // Pure JavaScript API
  const editor = new AsteroNote('#editor', { /* options */ });

  // Alternative: data-attribute initialization
  // <div data-asteronote data-height="300"></div>
  AsteroNote.init(); // Auto-initializes all [data-asteronote] elements
</script>

// NPM Usage (ESM)
import AsteroNote from 'asteronote';
import { Table, Image } from 'asteronote/plugins';

const editor = new AsteroNote('#editor', {
  plugins: [Table, Image],
  height: 300,
  callbacks: {
    onChange: (contents) => {
      console.log('Contents changed:', contents);
    }
  }
});
```

## Technical Considerations

### Build System
- Use **Rollup** or **Webpack** for building both UMD and ESM bundles
- Configure multiple entry points for different bundle options
- Implement code splitting for plugins
- Generate source maps for all bundles
- Ensure the build process strips out any development-only code

### jQuery Removal Strategy
- **DOM Manipulation:** Replace all `$()` selectors with `document.querySelector()` / `querySelectorAll()`
- **Event Handling:** Replace `$(el).on()` with `element.addEventListener()`
- **AJAX:** Replace `$.ajax()` with native `fetch()` API
- **Animations:** Replace jQuery animations with CSS transitions or Web Animations API
- **Utilities:** Create vanilla JS helpers for common jQuery patterns:
  - `addClass/removeClass` → `classList.add/remove`
  - `$.each()` → `Array.forEach()` or `for...of`
  - `$.extend()` → `Object.assign()` or spread operator
  - `$.trim()` → `String.trim()`
  - Event delegation → Custom helper or native closest()

### EventEmitter Design
- Keep implementation lightweight (< 1KB)
- Consider using a well-tested library (e.g., `eventemitter3`) or implementing a minimal custom version
- Ensure events are properly cleaned up to prevent memory leaks

### Plugin Registry
- Implement a simple registry pattern for plugin management
- Support lazy loading of plugins
- Validate plugin interfaces at registration time
- Handle circular dependencies gracefully

### Package.json Configuration
```json
{
  "name": "asteronote",
  "version": "2.0.0",
  "main": "dist/asteronote.js",
  "module": "dist/asteronote.esm.js",
  "exports": {
    ".": {
      "require": "./dist/asteronote.js",
      "import": "./dist/asteronote.esm.js"
    },
    "./core": {
      "require": "./dist/asteronote-core.js",
      "import": "./dist/asteronote-core.esm.js"
    },
    "./plugins/*": {
      "require": "./dist/plugins/*.js",
      "import": "./dist/plugins/*.esm.js"
    }
  }
}
```

### Dependencies
```json
{
  "dependencies": {
    "bootstrap": "^5.3.0"
  },
  "peerDependencies": {
    "bootstrap": "^5.3.0"
  }
}
```

**Note:** Bootstrap 5.3 is the ONLY styling dependency. Google Fonts and Bootstrap Icons are loaded via CDN and do not require npm installation.

### Styling Architecture
```
summernote/
├── src/
│   ├── css/
│   │   └── summernote.css     # Minimal custom styles only
│   └── js/
│       └── ...
├── dist/
│   ├── summernote.css         # Compiled styles
│   └── summernote.js
└── demo/
    └── index.html             # Single demo page
```

### Demo Page Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AsteroNote v2.0 Demo - Astero Digital</title>

  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- AsteroNote CSS -->
  <link href="../dist/asteronote.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h1>AsteroNote v2.0</h1>
├── src/
│   ├── css/
│   │   └── summernote.css     # Minimal custom styles only
│   └── js/
│       └── ...
├── dist/
│   ├── summernote.css         # Compiled styles
│   └── summernote.js
└── demo/
    └── index.html             # Single demo page
```

### Demo Page Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Summernote v2.0 Demo</title>

  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Summernote CSS -->
  <link href="../dist/summernote.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h1>Summernote v2.0</h1>
    <div id="summernote"></div>
  </div>

  <!-- Bootstrap 5.3 JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Summernote JS -->
  <script src="../dist/summernote.js"></script>
  <script>
    const editor = new Summernote('#summernote', {
      height: 300
    });
  </script>
</body>
</html>
```

### Icon Usage Example
```javascript
// In plugin code, use Bootstrap Icons
const boldButton = {
  name: 'bold',
  icon: '<i class="bi bi-type-bold"></i>', // Bootstrap Icon
  callback: () => this.toggle()
};
```

## Technical Considerations

### Build System
- Use **Rollup** or **Webpack** for building both UMD and ESM bundles
- Configure multiple entry points for different bundle options
- Implement code splitting for plugins
- Generate source maps for all bundles
- Ensure the build process strips out any development-only code

### jQuery Removal Strategy
- **DOM Manipulation:** Replace all `$()` selectors with `document.querySelector()` / `querySelectorAll()`
- **Event Handling:** Replace `$(el).on()` with `element.addEventListener()`
- **AJAX:** Replace `$.ajax()` with native `fetch()` API
- **Animations:** Replace jQuery animations with CSS transitions or Web Animations API
- **Utilities:** Create vanilla JS helpers for common jQuery patterns:
  - `addClass/removeClass` → `classList.add/remove`
  - `$.each()` → `Array.forEach()` or `for...of`
  - `$.extend()` → `Object.assign()` or spread operator
  - `$.trim()` → `String.trim()`
  - Event delegation → Custom helper or native closest()

### EventEmitter Design
- Keep implementation lightweight (< 1KB)
- Consider using a well-tested library (e.g., `eventemitter3`) or implementing a minimal custom version
- Ensure events are properly cleaned up to prevent memory leaks

### Plugin Registry
- Implement a simple registry pattern for plugin management
- Support lazy loading of plugins
- Validate plugin interfaces at registration time
- Handle circular dependencies gracefully

### Package.json Configuration
```json
{
  "name": "summernote",
  "version": "2.0.0",
  "main": "dist/summernote.js",
  "module": "dist/summernote.esm.js",
  "exports": {
    ".": {
      "require": "./dist/summernote.js",
      "import": "./dist/summernote.esm.js"
    },
    "./core": {
      "require": "./dist/summernote-core.js",
      "import": "./dist/summernote-core.esm.js"
    },
    "./plugins/*": {
      "require": "./dist/plugins/*.js",
      "import": "./dist/plugins/*.esm.js"
    }
  }
}
```

### Dependencies
```json
{
  "dependencies": {
    "bootstrap": "^5.3.0"
  },
  "peerDependencies": {
    "bootstrap": "^5.3.0"
  }
}
```

**Note:** Bootstrap 5.3 is the ONLY styling dependency. Google Fonts and Bootstrap Icons are loaded via CDN and do not require npm installation.

### Styling Architecture
```
summernote/
├── src/
│   ├── css/
│   │   └── summernote.css     # Minimal custom styles only
│   └── js/
│       └── ...
├── dist/
│   ├── summernote.css         # Compiled styles
│   └── summernote.js
└── demo/
    └── index.html             # Single demo page
```

### Demo Page Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Summernote v2.0 Demo</title>

  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Summernote CSS -->
  <link href="../dist/summernote.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h1>Summernote v2.0</h1>
    <div id="summernote"></div>
  </div>

  <!-- Bootstrap 5.3 JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Summernote JS -->
  <script src="../dist/summernote.js"></script>
  <script>
    const editor = new Summernote('#summernote', {
      height: 300
    });
  </script>
</body>
</html>
```

### Icon Usage Example
```javascript
// In plugin code, use Bootstrap Icons
const boldButton = {
  name: 'bold',
  icon: '<i class="bi bi-type-bold"></i>', // Bootstrap Icon
  callback: () => this.toggle()
};
```

## Technical Considerations

### Build System
- Use **Rollup** or **Webpack** for building both UMD and ESM bundles
- Configure multiple entry points for different bundle options
- Implement code splitting for plugins
- Generate source maps for all bundles
- Ensure the build process strips out any development-only code

### jQuery Removal Strategy
- **DOM Manipulation:** Replace all `$()` selectors with `document.querySelector()` / `querySelectorAll()`
- **Event Handling:** Replace `$(el).on()` with `element.addEventListener()`
- **AJAX:** Replace `$.ajax()` with native `fetch()` API
- **Animations:** Replace jQuery animations with CSS transitions or Web Animations API
- **Utilities:** Create vanilla JS helpers for common jQuery patterns:
  - `addClass/removeClass` → `classList.add/remove`
  - `$.each()` → `Array.forEach()` or `for...of`
  - `$.extend()` → `Object.assign()` or spread operator
  - `$.trim()` → `String.trim()`
  - Event delegation → Custom helper or native closest()

### EventEmitter Design
- Keep implementation lightweight (< 1KB)
- Consider using a well-tested library (e.g., `eventemitter3`) or implementing a minimal custom version
- Ensure events are properly cleaned up to prevent memory leaks

### Plugin Registry
- Implement a simple registry pattern for plugin management
- Support lazy loading of plugins
- Validate plugin interfaces at registration time
- Handle circular dependencies gracefully

### Package.json Configuration
```json
{
  "name": "summernote",
  "version": "2.0.0",
  "main": "dist/summernote.js",
  "module": "dist/summernote.esm.js",
  "exports": {
    ".": {
      "require": "./dist/summernote.js",
      "import": "./dist/summernote.esm.js"
    },
    "./core": {
      "require": "./dist/summernote-core.js",
      "import": "./dist/summernote-core.esm.js"
    },
    "./plugins/*": {
      "require": "./dist/plugins/*.js",
      "import": "./dist/plugins/*.esm.js"
    }
  }
}
```

### Dependencies
```json
{
  "dependencies": {
    "bootstrap": "^5.3.0"
  },
  "peerDependencies": {
    "bootstrap": "^5.3.0"
  }
}
```

**Note:** Bootstrap 5.3 is the ONLY styling dependency. Google Fonts and Bootstrap Icons are loaded via CDN and do not require npm installation.

### Styling Architecture
```
summernote/
├── src/
│   ├── css/
│   │   └── summernote.css     # Minimal custom styles only
│   └── js/
│       └── ...
├── dist/
│   ├── summernote.css         # Compiled styles
│   └── summernote.js
└── demo/
    └── index.html             # Single demo page
```

### Demo Page Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Summernote v2.0 Demo</title>

  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Summernote CSS -->
  <link href="../dist/summernote.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h1>Summernote v2.0</h1>
    <div id="summernote"></div>
  </div>

  <!-- Bootstrap 5.3 JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Summernote JS -->
  <script src="../dist/summernote.js"></script>
  <script>
    const editor = new Summernote('#summernote', {
      height: 300
    });
  </script>
</body>
</html>
```

### Icon Usage Example
```javascript
// In plugin code, use Bootstrap Icons
const boldButton = {
  name: 'bold',
  icon: '<i class="bi bi-type-bold"></i>', // Bootstrap Icon
  callback: () => this.toggle()
};
```

## Technical Considerations

### Build System
- Use **Rollup** or **Webpack** for building both UMD and ESM bundles
- Configure multiple entry points for different bundle options
- Implement code splitting for plugins
- Generate source maps for all bundles
- Ensure the build process strips out any development-only code

### jQuery Removal Strategy
- **DOM Manipulation:** Replace all `$()` selectors with `document.querySelector()` / `querySelectorAll()`
- **Event Handling:** Replace `$(el).on()` with `element.addEventListener()`
- **AJAX:** Replace `$.ajax()` with native `fetch()` API
- **Animations:** Replace jQuery animations with CSS transitions or Web Animations API
- **Utilities:** Create vanilla JS helpers for common jQuery patterns:
  - `addClass/removeClass` → `classList.add/remove`
  - `$.each()` → `Array.forEach()` or `for...of`
  - `$.extend()` → `Object.assign()` or spread operator
  - `$.trim()` → `String.trim()`
  - Event delegation → Custom helper or native closest()

### EventEmitter Design
- Keep implementation lightweight (< 1KB)
- Consider using a well-tested library (e.g., `eventemitter3`) or implementing a minimal custom version
- Ensure events are properly cleaned up to prevent memory leaks

### Plugin Registry
- Implement a simple registry pattern for plugin management
- Support lazy loading of plugins
- Validate plugin interfaces at registration time
- Handle circular dependencies gracefully

### Package.json Configuration
```json
{
  "name": "summernote",
  "version": "2.0.0",
  "main": "dist/summernote.js",
  "module": "dist/summernote.esm.js",
  "exports": {
    ".": {
      "require": "./dist/summernote.js",
      "import": "./dist/summernote.esm.js"
    },
    "./core": {
      "require": "./dist/summernote-core.js",
      "import": "./dist/summernote-core.esm.js"
    },
    "./plugins/*": {
      "require": "./dist/plugins/*.js",
      "import": "./dist/plugins/*.esm.js"
    }
  }
}
```

### Dependencies
```json
{
  "dependencies": {
    "bootstrap": "^5.3.0"
  },
  "peerDependencies": {
    "bootstrap": "^5.3.0"
  }
}
```

**Note:** Bootstrap 5.3 is the ONLY styling dependency. Google Fonts and Bootstrap Icons are loaded via CDN and do not require npm installation.

### Styling Architecture
```
summernote/
├── src/
│   ├── css/
│   │   └── summernote.css     # Minimal custom styles only
│   └── js/
│       └── ...
├── dist/
│   ├── summernote.css         # Compiled styles
│   └── summernote.js
└── demo/
    └── index.html             # Single demo page
```

### Demo Page Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Summernote v2.0 Demo</title>

  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Summernote CSS -->
  <link href="../dist/summernote.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h1>Summernote v2.0</h1>
    <div id="summernote"></div>
  </div>

  <!-- Bootstrap 5.3 JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Summernote JS -->
  <script src="../dist/summernote.js"></script>
  <script>
    const editor = new Summernote('#summernote', {
      height: 300
    });
  </script>
</body>
</html>
```

### Icon Usage Example
```javascript
// In plugin code, use Bootstrap Icons
const boldButton = {
  name: 'bold',
  icon: '<i class="bi bi-type-bold"></i>', // Bootstrap Icon
  callback: () => this.toggle()
};
```

## Technical Considerations

### Build System
- Use **Rollup** or **Webpack** for building both UMD and ESM bundles
- Configure multiple entry points for different bundle options
- Implement code splitting for plugins
- Generate source maps for all bundles
- Ensure the build process strips out any development-only code

### jQuery Removal Strategy
- **DOM Manipulation:** Replace all `$()` selectors with `document.querySelector()` / `querySelectorAll()`
- **Event Handling:** Replace `$(el).on()` with `element.addEventListener()`
- **AJAX:** Replace `$.ajax()` with native `fetch()` API
- **Animations:** Replace jQuery animations with CSS transitions or Web Animations API
- **Utilities:** Create vanilla JS helpers for common jQuery patterns:
  - `addClass/removeClass` → `classList.add/remove`
  - `$.each()` → `Array.forEach()` or `for...of`
  - `$.extend()` → `Object.assign()` or spread operator
  - `$.trim()` → `String.trim()`
  - Event delegation → Custom helper or native closest()

### EventEmitter Design
- Keep implementation lightweight (< 1KB)
- Consider using a well-tested library (e.g., `eventemitter3`) or implementing a minimal custom version
- Ensure events are properly cleaned up to prevent memory leaks

### Plugin Registry
- Implement a simple registry pattern for plugin management
- Support lazy loading of plugins
- Validate plugin interfaces at registration time
- Handle circular dependencies gracefully

### Package.json Configuration
```json
{
  "name": "summernote",
  "version": "2.0.0",
  "main": "dist/summernote.js",
  "module": "dist/summernote.esm.js",
  "exports": {
    ".": {
      "require": "./dist/summernote.js",
      "import": "./dist/summernote.esm.js"
    },
    "./core": {
      "require": "./dist/summernote-core.js",
      "import": "./dist/summernote-core.esm.js"
    },
    "./plugins/*": {
      "require": "./dist/plugins/*.js",
      "import": "./dist/plugins/*.esm.js"
    }
  }
}
```

### Dependencies
```json
{
  "dependencies": {
    "bootstrap": "^5.3.0"
  },
  "peerDependencies": {
    "bootstrap": "^5.3.0"
  }
}
```

**Note:** Bootstrap 5.3 is the ONLY styling dependency. Google Fonts and Bootstrap Icons are loaded via CDN and do not require npm installation.

### Styling Architecture
```
summernote/
├── src/
│   ├── css/
│   │   └── summernote.css     # Minimal custom styles only
│   └── js/
│       └── ...
├── dist/
│   ├── summernote.css         # Compiled styles
│   └── summernote.js
└── demo/
    └── index.html             # Single demo page
```

### Demo Page Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Summernote v2.0 Demo</title>

  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Summernote CSS -->
  <link href="../dist/summernote.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h1>Summernote v2.0</h1>
    <div id="summernote"></div>
  </div>

  <!-- Bootstrap 5.3 JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Summernote JS -->
  <script src="../dist/summernote.js"></script>
  <script>
    const editor = new Summernote('#summernote', {
      height: 300
    });
  </script>
</body>
</html>
```

### Icon Usage Example
```javascript
// In plugin code, use Bootstrap Icons
const boldButton = {
  name: 'bold',
  icon: '<i class="bi bi-type-bold"></i>', // Bootstrap Icon
  callback: () => this.toggle()
};
```

## Technical Considerations

### Build System
- Use **Rollup** or **Webpack** for building both UMD and ESM bundles
- Configure multiple entry points for different bundle options
- Implement code splitting for plugins
- Generate source maps for all bundles
- Ensure the build process strips out any development-only code

### jQuery Removal Strategy
- **DOM Manipulation:** Replace all `$()` selectors with `document.querySelector()` / `querySelectorAll()`
- **Event Handling:** Replace `$(el).on()` with `element.addEventListener()`
- **AJAX:** Replace `$.ajax()` with native `fetch()` API
- **Animations:** Replace jQuery animations with CSS transitions or Web Animations API
- **Utilities:** Create vanilla JS helpers for common jQuery patterns:
  - `addClass/removeClass` → `classList.add/remove`
  - `$.each()` → `Array.forEach()` or `for...of`
  - `$.extend()` → `Object.assign()` or spread operator
  - `$.trim()` → `String.trim()`
  - Event delegation → Custom helper or native closest()

### EventEmitter Design
- Keep implementation lightweight (< 1KB)
- Consider using a well-tested library (e.g., `eventemitter3`) or implementing a minimal custom version
- Ensure events are properly cleaned up to prevent memory leaks

### Plugin Registry
- Implement a simple registry pattern for plugin management
- Support lazy loading of plugins
- Validate plugin interfaces at registration time
- Handle circular dependencies gracefully

### Package.json Configuration
```json
{
  "name": "summernote",
  "version": "2.0.0",
  "main": "dist/summernote.js",
  "module": "dist/summernote.esm.js",
  "exports": {
    ".": {
      "require": "./dist/summernote.js",
      "import": "./dist/summernote.esm.js"
    },
    "./core": {
      "require": "./dist/summernote-core.js",
      "import": "./dist/summernote-core.esm.js"
    },
    "./plugins/*": {
      "require": "./dist/plugins/*.js",
      "import": "./dist/plugins/*.esm.js"
    }
  }
}
```

### Dependencies
```json
{
  "dependencies": {
    "bootstrap": "^5.3.0"
  },
  "peerDependencies": {
    "bootstrap": "^5.3.0"
  }
}
```

**Note:** Bootstrap 5.3 is the ONLY styling dependency. Google Fonts and Bootstrap Icons are loaded via CDN and do not require npm installation.

### Styling Architecture
```
summernote/
├── src/
│   ├── css/
│   │   └── summernote.css     # Minimal custom styles only
│   └── js/
│       └── ...
├── dist/
│   ├── summernote.css         # Compiled styles
│   └── summernote.js
└── demo/
    └── index.html             # Single demo page
```

### Demo Page Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Summernote v2.0 Demo</title>

  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Summernote CSS -->
  <link href="../dist/summernote.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h1>Summernote v2.0</h1>
    <div id="summernote"></div>
  </div>

  <!-- Bootstrap 5.3 JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Summernote JS -->
  <script src="../dist/summernote.js"></script>
  <script>
    const editor = new Summernote('#summernote', {
      height: 300
    });
  </script>
</body>
</html>
```

### Icon Usage Example
```javascript
// In plugin code, use Bootstrap Icons
const boldButton = {
  name: 'bold',
  icon: '<i class="bi bi-type-bold"></i>', // Bootstrap Icon
  callback: () => this.toggle()
};
```

## Technical Considerations

### Build System
- Use **Rollup** or **Webpack** for building both UMD and ESM bundles
- Configure multiple entry points for different bundle options
- Implement code splitting for plugins
- Generate source maps for all bundles
- Ensure the build process strips out any development-only code

### jQuery Removal Strategy
- **DOM Manipulation:** Replace all `$()` selectors with `document.querySelector()` / `querySelectorAll()`
- **Event Handling:** Replace `$(el).on()` with `element.addEventListener()`
- **AJAX:** Replace `$.ajax()` with native `fetch()` API
- **Animations:** Replace jQuery animations with CSS transitions or Web Animations API
- **Utilities:** Create vanilla JS helpers for common jQuery patterns:
  - `addClass/removeClass` → `classList.add/remove`
  - `$.each()` → `Array.forEach()` or `for...of`
  - `$.extend()` → `Object.assign()` or spread operator
  - `$.trim()` → `String.trim()`
  - Event delegation → Custom helper or native closest()

### EventEmitter Design
- Keep implementation lightweight (< 1KB)
- Consider using a well-tested library (e.g., `eventemitter3`) or implementing a minimal custom version
- Ensure events are properly cleaned up to prevent memory leaks

### Plugin Registry
- Implement a simple registry pattern for plugin management
- Support lazy loading of plugins
- Validate plugin interfaces at registration time
- Handle circular dependencies gracefully

### Package.json Configuration
```json
{
  "name": "summernote",
  "version": "2.0.0",
  "main": "dist/summernote.js",
  "module": "dist/summernote.esm.js",
  "exports": {
    ".": {
      "require": "./dist/summernote.js",
      "import": "./dist/summernote.esm.js"
    },
    "./core": {
      "require": "./dist/summernote-core.js",
      "import": "./dist/summernote-core.esm.js"
    },
    "./plugins/*": {
      "require": "./dist/plugins/*.js",
      "import": "./dist/plugins/*.esm.js"
    }
  }
}
```

### Dependencies
```json
{
  "dependencies": {
    "bootstrap": "^5.3.0"
  },
  "peerDependencies": {
    "bootstrap": "^5.3.0"
  }
}
```

**Note:** Bootstrap 5.3 is the ONLY styling dependency. Google Fonts and Bootstrap Icons are loaded via CDN and do not require npm installation.

### Styling Architecture
```
summernote/
├── src/
│   ├── css/
│   │   └── summernote.css     # Minimal custom styles only
│   └── js/
│       └── ...
├── dist/
│   ├── summernote.css         # Compiled styles
│   └── summernote.js
└── demo/
    └── index.html             # Single demo page
```

### Demo Page Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Summernote v2.0 Demo</title>

  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Summernote CSS -->
  <link href="../dist/summernote.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h1>Summernote v2.0</h1>
    <div id="summernote"></div>
  </div>

  <!-- Bootstrap 5.3 JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Summernote JS -->
  <script src="../dist/summernote.js"></script>
  <script>
    const editor = new Summernote('#summernote', {
      height: 300
    });
  </script>
</body>
</html>
```

### Icon Usage Example
```javascript
// In plugin code, use Bootstrap Icons
const boldButton = {
  name: 'bold',
  icon: '<i class="bi bi-type-bold"></i>', // Bootstrap Icon
  callback: () => this.toggle()
};
```

## Technical Considerations

### Build System
- Use **Rollup** or **Webpack** for building both UMD and ESM bundles
- Configure multiple entry points for different bundle options
- Implement code splitting for plugins
- Generate source maps for all bundles
- Ensure the build process strips out any development-only code

### jQuery Removal Strategy
- **DOM Manipulation:** Replace all `$()` selectors with `document.querySelector()` / `querySelectorAll()`
- **Event Handling:** Replace `$(el).on()` with `element.addEventListener()`
- **AJAX:** Replace `$.ajax()` with native `fetch()` API
- **Animations:** Replace jQuery animations with CSS transitions or Web Animations API
- **Utilities:** Create vanilla JS helpers for common jQuery patterns:
  - `addClass/removeClass` → `classList.add/remove`
  - `$.each()` → `Array.forEach()` or `for...of`
  - `$.extend()` → `Object.assign()` or spread operator
  - `$.trim()` → `String.trim()`
  - Event delegation → Custom helper or native closest()

### EventEmitter Design
- Keep implementation lightweight (< 1KB)
- Consider using a well-tested library (e.g., `eventemitter3`) or implementing a minimal custom version
- Ensure events are properly cleaned up to prevent memory leaks

### Plugin Registry
- Implement a simple registry pattern for plugin management
- Support lazy loading of plugins
- Validate plugin interfaces at registration time
- Handle circular dependencies gracefully

### Package.json Configuration
```json
{
  "name": "summernote",
  "version": "2.0.0",
  "main": "dist/summernote.js",
  "module": "dist/summernote.esm.js",
  "exports": {
    ".": {
      "require": "./dist/summernote.js",
      "import": "./dist/summernote.esm.js"
    },
    "./core": {
      "require": "./dist/summernote-core.js",
      "import": "./dist/summernote-core.esm.js"
    },
    "./plugins/*": {
      "require": "./dist/plugins/*.js",
      "import": "./dist/plugins/*.esm.js"
    }
  }
}
```

### Dependencies
```json
{
  "dependencies": {
    "bootstrap": "^5.3.0"
  },
  "peerDependencies": {
    "bootstrap": "^5.3.0"
  }
}
```

**Note:** Bootstrap 5.3 is the ONLY styling dependency. Google Fonts and Bootstrap Icons are loaded via CDN and do not require npm installation.

### Styling Architecture
```
summernote/
├── src/
│   ├── css/
│   │   └── summernote.css     # Minimal custom styles only
│   └── js/
│       └── ...
├── dist/
│   ├── summernote.css         # Compiled styles
│   └── summernote.js
└── demo/
    └── index.html             # Single demo page
```

### Demo Page Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Summernote v2.0 Demo</title>

  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Summernote CSS -->
  <link href="../dist/summernote.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h1>Summernote v2.0</h1>
    <div id="summernote"></div>
  </div>

  <!-- Bootstrap 5.3 JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Summernote JS -->
  <script src="../dist/summernote.js"></script>
  <script>
    const editor = new Summernote('#summernote', {
      height: 300
    });
  </script>
</body>
</html>
```

### Icon Usage Example
```javascript
// In plugin code, use Bootstrap Icons
const boldButton = {
  name: 'bold',
  icon: '<i class="bi bi-type-bold"></i>', // Bootstrap Icon
  callback: () => this.toggle()
};
```

## Technical Considerations

### Build System
- Use **Rollup** or **Webpack** for building both UMD and ESM bundles
- Configure multiple entry points for different bundle options
- Implement code splitting for plugins
- Generate source maps for all bundles
- Ensure the build process strips out any development-only code

### jQuery Removal Strategy
- **DOM Manipulation:** Replace all `$()` selectors with `document.querySelector()` / `querySelectorAll()`
- **Event Handling:** Replace `$(el).on()` with `element.addEventListener()`
- **AJAX:** Replace `$.ajax()` with native `fetch()` API
- **Animations:** Replace jQuery animations with CSS transitions or Web Animations API
- **Utilities:** Create vanilla JS helpers for common jQuery patterns:
  - `addClass/removeClass` → `classList.add/remove`
  - `$.each()` → `Array.forEach()` or `for...of`
  - `$.extend()` → `Object.assign()` or spread operator
  - `$.trim()` → `String.trim()`
  - Event delegation → Custom helper or native closest()

### EventEmitter Design
- Keep implementation lightweight (< 1KB)
- Consider using a well-tested library (e.g., `eventemitter3`) or implementing a minimal custom version
- Ensure events are properly cleaned up to prevent memory leaks

### Plugin Registry
- Implement a simple registry pattern for plugin management
- Support lazy loading of plugins
- Validate plugin interfaces at registration time
- Handle circular dependencies gracefully

### Package.json Configuration
```json
{
  "name": "summernote",
  "version": "2.0.0",
  "main": "dist/summernote.js",
  "module": "dist/summernote.esm.js",
  "exports": {
    ".": {
      "require": "./dist/summernote.js",
      "import": "./dist/summernote.esm.js"
    },
    "./core": {
      "require": "./dist/summernote-core.js",
      "import": "./dist/summernote-core.esm.js"
    },
    "./plugins/*": {
      "require": "./dist/plugins/*.js",
      "import": "./dist/plugins/*.esm.js"
    }
  }
}
```

### Dependencies
```json
{
  "dependencies": {
    "bootstrap": "^5.3.0"
  },
  "peerDependencies": {
    "bootstrap": "^5.3.0"
  }
}
```

**Note:** Bootstrap 5.3 is the ONLY styling dependency. Google Fonts and Bootstrap Icons are loaded via CDN and do not require npm installation.

### Styling Architecture
```
summernote/
├── src/
│   ├── css/
│   │   └── summernote.css     # Minimal custom styles only
│   └── js/
│       └── ...
├── dist/
│   ├── summernote.css         # Compiled styles
│   └── summernote.js
└── demo/
    └── index.html             # Single demo page
```

### Demo Page Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Summernote v2.0 Demo</title>

  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Summernote CSS -->
  <link href="../dist/summernote.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h1>Summernote v2.0</h1>
    <div id="summernote"></div>
  </div>

  <!-- Bootstrap 5.3 JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Summernote JS -->
  <script src="../dist/summernote.js"></script>
  <script>
    const editor = new Summernote('#summernote', {
      height: 300
    });
  </script>
</body>
</html>
```

### Icon Usage Example
```javascript
// In plugin code, use Bootstrap Icons
const boldButton = {
  name: 'bold',
  icon: '<i class="bi bi-type-bold"></i>', // Bootstrap Icon
  callback: () => this.toggle()
};
```

## Technical Considerations

### Build System
- Use **Rollup** or **Webpack** for building both UMD and ESM bundles
- Configure multiple entry points for different bundle options
- Implement code splitting for plugins
- Generate source maps for all bundles
- Ensure the build process strips out any development-only code

### jQuery Removal Strategy
- **DOM Manipulation:** Replace all `$()` selectors with `document.querySelector()` / `querySelectorAll()`
- **Event Handling:** Replace `$(el).on()` with `element.addEventListener()`
- **AJAX:** Replace `$.ajax()` with native `fetch()` API
- **Animations:** Replace jQuery animations with CSS transitions or Web Animations API
- **Utilities:** Create vanilla JS helpers for common jQuery patterns:
  - `addClass/removeClass` → `classList.add/remove`
  - `$.each()` → `Array.forEach()` or `for...of`
  - `$.extend()` → `Object.assign()` or spread operator
  - `$.trim()` → `String.trim()`
  - Event delegation → Custom helper or native closest()

### EventEmitter Design
- Keep implementation lightweight (< 1KB)
- Consider using a well-tested library (e.g., `eventemitter3`) or implementing a minimal custom version
- Ensure events are properly cleaned up to prevent memory leaks

### Plugin Registry
- Implement a simple registry pattern for plugin management
- Support lazy loading of plugins
- Validate plugin interfaces at registration time
- Handle circular dependencies gracefully

### Package.json Configuration
```json
{
  "name": "summernote",
  "version": "2.0.0",
  "main": "dist/summernote.js",
  "module": "dist/summernote.esm.js",
  "exports": {
    ".": {
      "require": "./dist/summernote.js",
      "import": "./dist/summernote.esm.js"
    },
    "./core": {
      "require": "./dist/summernote-core.js",
      "import": "./dist/summernote-core.esm.js"
    },
    "./plugins/*": {
      "require": "./dist/plugins/*.js",
      "import": "./dist/plugins/*.esm.js"
    }
  }
}
```

### Dependencies
```json
{
  "dependencies": {
    "bootstrap": "^5.3.0"
  },
  "peerDependencies": {
    "bootstrap": "^5.3.0"
  }
}
```

**Note:** Bootstrap 5.3 is the ONLY styling dependency. Google Fonts and Bootstrap Icons are loaded via CDN and do not require npm installation.

### Styling Architecture
```
summernote/
├── src/
│   ├── css/
│   │   └── summernote.css     # Minimal custom styles only
│   └── js/
│       └── ...
├── dist/
│   ├── summernote.css         # Compiled styles
│   └── summernote.js
└── demo/
    └── index.html             # Single demo page
```

### Demo Page Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Summernote v2.0 Demo</title>

  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Summernote CSS -->
  <link href="../dist/summernote.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h1>Summernote v2.0</h1>
    <div id="summernote"></div>
  </div>

  <!-- Bootstrap 5.3 JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Summernote JS -->
  <script src="../dist/summernote.js"></script>
  <script>
    const editor = new Summernote('#summernote', {
      height: 300
    });
  </script>
</body>
</html>
```

### Icon Usage Example
```javascript
// In plugin code, use Bootstrap Icons
const boldButton = {
  name: 'bold',
  icon: '<i class="bi bi-type-bold"></i>', // Bootstrap Icon
  callback: () => this.toggle()
};
```

## Technical Considerations

### Build System
- Use **Rollup** or **Webpack** for building both UMD and ESM bundles
- Configure multiple entry points for different bundle options
- Implement code splitting for plugins
- Generate source maps for all bundles
- Ensure the build process strips out any development-only code

### jQuery Removal Strategy
- **DOM Manipulation:** Replace all `$()` selectors with `document.querySelector()` / `querySelectorAll()`
- **Event Handling:** Replace `$(el).on()` with `element.addEventListener()`
- **AJAX:** Replace `$.ajax()` with native `fetch()` API
- **Animations:** Replace jQuery animations with CSS transitions or Web Animations API
- **Utilities:** Create vanilla JS helpers for common jQuery patterns:
  - `addClass/removeClass` → `classList.add/remove`
  - `$.each()` → `Array.forEach()` or `for...of`
  - `$.extend()` → `Object.assign()` or spread operator
  - `$.trim()` → `String.trim()`
  - Event delegation → Custom helper or native closest()

### EventEmitter Design
- Keep implementation lightweight (< 1KB)
- Consider using a well-tested library (e.g., `eventemitter3`) or implementing a minimal custom version
- Ensure events are properly cleaned up to prevent memory leaks

### Plugin Registry
- Implement a simple registry pattern for plugin management
- Support lazy loading of plugins
- Validate plugin interfaces at registration time
- Handle circular dependencies gracefully

### Package.json Configuration
```json
{
  "name": "summernote",
  "version": "2.0.0",
  "main": "dist/summernote.js",
  "module": "dist/summernote.esm.js",
  "exports": {
    ".": {
      "require": "./dist/summernote.js",
      "import": "./dist/summernote.esm.js"
    },
    "./core": {
      "require": "./dist/summernote-core.js",
      "import": "./dist/summernote-core.esm.js"
    },
    "./plugins/*": {
      "require": "./dist/plugins/*.js",
      "import": "./dist/plugins/*.esm.js"
    }
  }
}
```

### Dependencies
```json
{
  "dependencies": {
    "bootstrap": "^5.3.0"
  },
  "peerDependencies": {
    "bootstrap": "^5.3.0"
  }
}
```

**Note:** Bootstrap 5.3 is the ONLY styling dependency. Google Fonts and Bootstrap Icons are loaded via CDN and do not require npm installation.

### Styling Architecture
```
summernote/
├── src/
│   ├── css/
│   │   └── summernote.css     # Minimal custom styles only
│   └── js/
│       └── ...
├── dist/
│   ├── summernote.css         # Compiled styles
│   └── summernote.js
└── demo/
    └── index.html             # Single demo page
```

### Demo Page Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Summernote v2.0 Demo</title>

  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Summernote CSS -->
  <link href="../dist/summernote.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h1>Summernote v2.0</h1>
    <div id="summernote"></div>
  </div>

  <!-- Bootstrap 5.3 JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Summernote JS -->
  <script src="../dist/summernote.js"></script>
  <script>
    const editor = new Summernote('#summernote', {
      height: 300
    });
  </script>
</body>
</html>
```

### Icon Usage Example
```javascript
// In plugin code, use Bootstrap Icons
const boldButton = {
  name: 'bold',
  icon: '<i class="bi bi-type-bold"></i>', // Bootstrap Icon
  callback: () => this.toggle()
};
```

## Technical Considerations

### Build System
- Use **Rollup** or **Webpack** for building both UMD and ESM bundles
- Configure multiple entry points for different bundle options
- Implement code splitting for plugins
- Generate source maps for all bundles
- Ensure the build process strips out any development-only code

### jQuery Removal Strategy
- **DOM Manipulation:** Replace all `$()` selectors with `document.querySelector()` / `querySelectorAll()`
- **Event Handling:** Replace `$(el).on()` with `element.addEventListener()`
- **AJAX:** Replace `$.ajax()` with native `fetch()` API
- **Animations:** Replace jQuery animations with CSS transitions or Web Animations API
- **Utilities:** Create vanilla JS helpers for common jQuery patterns:
  - `addClass/removeClass` → `classList.add/remove`
  - `$.each()` → `Array.forEach()` or `for...of`
  - `$.extend()` → `Object.assign()` or spread operator
  - `$.trim()` → `String.trim()`
  - Event delegation → Custom helper or native closest()

### EventEmitter Design
- Keep implementation lightweight (< 1KB)
- Consider using a well-tested library (e.g., `eventemitter3`) or implementing a minimal custom version
- Ensure events are properly cleaned up to prevent memory leaks

### Plugin Registry
- Implement a simple registry pattern for plugin management
- Support lazy loading of plugins
- Validate plugin interfaces at registration time
- Handle circular dependencies gracefully

### Package.json Configuration
```json
{
  "name": "summernote",
  "version": "2.0.0",
  "main": "dist/summernote.js",
  "module": "dist/summernote.esm.js",
  "exports": {
    ".": {
      "require": "./dist/summernote.js",
      "import": "./dist/summernote.esm.js"
    },
    "./core": {
      "require": "./dist/summernote-core.js",
      "import": "./dist/summernote-core.esm.js"
    },
    "./plugins/*": {
      "require": "./dist/plugins/*.js",
      "import": "./dist/plugins/*.esm.js"
    }
  }
}
```

### Dependencies
```json
{
  "dependencies": {
    "bootstrap": "^5.3.0"
  },
  "peerDependencies": {
    "bootstrap": "^5.3.0"
  }
}
```

**Note:** Bootstrap 5.3 is the ONLY styling dependency. Google Fonts and Bootstrap Icons are loaded via CDN and do not require npm installation.

### Styling Architecture
```
summernote/
├── src/
│   ├── css/
│   │   └── summernote.css     # Minimal custom styles only
│   └── js/
│       └── ...
├── dist/
│   ├── summernote.css         # Compiled styles
│   └── summernote.js
└── demo/
    └── index.html             # Single demo page
```

### Demo Page Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Summernote v2.0 Demo</title>

  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Summernote CSS -->
  <link href="../dist/summernote.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h1>Summernote v2.0</h1>
    <div id="summernote"></div>
  </div>

  <!-- Bootstrap 5.3 JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Summernote JS -->
  <script src="../dist/summernote.js"></script>
  <script>
    const editor = new Summernote('#summernote', {
      height: 300
    });
  </script>
</body>
</html>
```

### Icon Usage Example
```javascript
// In plugin code, use Bootstrap Icons
const boldButton = {
  name: 'bold',
  icon: '<i class="bi bi-type-bold"></i>', // Bootstrap Icon
  callback: () => this.toggle()
};
```

## Technical Considerations

### Build System
- Use **Rollup** or **Webpack** for building both UMD and ESM bundles
- Configure multiple entry points for different bundle options
- Implement code splitting for plugins
- Generate source maps for all bundles
- Ensure the build process strips out any development-only code

### jQuery Removal Strategy
- **DOM Manipulation:** Replace all `$()` selectors with `document.querySelector()` / `querySelectorAll()`
- **Event Handling:** Replace `$(el).on()` with `element.addEventListener()`
- **AJAX:** Replace `$.ajax()` with native `fetch()` API
- **Animations:** Replace jQuery animations with CSS transitions or Web Animations API
- **Utilities:** Create vanilla JS helpers for common jQuery patterns:
  - `addClass/removeClass` → `classList.add/remove`
  - `$.each()` → `Array.forEach()` or `for...of`
  - `$.extend()` → `Object.assign()` or spread operator
  - `$.trim()` → `String.trim()`
  - Event delegation → Custom helper or native closest()

### EventEmitter Design
- Keep implementation lightweight (< 1KB)
- Consider using a well-tested library (e.g., `eventemitter3`) or implementing a minimal custom version
- Ensure events are properly cleaned up to prevent memory leaks

### Plugin Registry
- Implement a simple registry pattern for plugin management
- Support lazy loading of plugins
- Validate plugin interfaces at registration time
- Handle circular dependencies gracefully

### Package.json Configuration
```json
{
  "name": "summernote",
  "version": "2.0.0",
  "main": "dist/summernote.js",
  "module": "dist/summernote.esm.js",
  "exports": {
    ".": {
      "require": "./dist/summernote.js",
      "import": "./dist/summernote.esm.js"
    },
    "./core": {
      "require": "./dist/summernote-core.js",
      "import": "./dist/summernote-core.esm.js"
    },
    "./plugins/*": {
      "require": "./dist/plugins/*.js",
      "import": "./dist/plugins/*.esm.js"
    }
  }
}
```

### Dependencies
```json
{
  "dependencies": {
    "bootstrap": "^5.3.0"
  },
  "peerDependencies": {
    "bootstrap": "^5.3.0"
  }
}
```

**Note:** Bootstrap 5.3 is the ONLY styling dependency. Google Fonts and Bootstrap Icons are loaded via CDN and do not require npm installation.

### Styling Architecture
```
summernote/
├── src/
│   ├── css/
│   │   └── summernote.css     # Minimal custom styles only
│   └── js/
│       └── ...
├── dist/
│   ├── summernote.css         # Compiled styles
│   └── summernote.js
└── demo/
    └── index.html             # Single demo page
```

### Demo Page Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Summernote v2.0 Demo</title>

  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Summernote CSS -->
  <link href="../dist/summernote.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h1>Summernote v2.0</h1>
    <div id="summernote"></div>
  </div>

  <!-- Bootstrap 5.3 JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Summernote JS -->
  <script src="../dist/summernote.js"></script>
  <script>
    const editor = new Summer
