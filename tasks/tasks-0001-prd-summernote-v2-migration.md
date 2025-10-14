## Relevant Files

### Build System & Configuration

- `rollup.config.js` - Main build configuration for generating UMD and ESM bundles.
- `package.json` - Update dependencies, add module field, configure exports.
- `.babelrc` or `babel.config.js` - Configure Babel for ES6+ transpilation if needed.

### Core Editor Files

- `src/js/core/Editor.js` - Main editor class, rewritten in vanilla JS.
- `src/js/core/EventEmitter.js` - Custom EventEmitter implementation.
- `src/js/core/PluginRegistry.js` - Plugin registration and management system.
- `src/js/core/dom.js` - DOM manipulation utilities to replace jQuery.
- `src/js/core/events.js` - Event handling utilities.
- `src/js/core/ajax.js` - Fetch API wrappers to replace jQuery.ajax.

### Styling Files

- `src/css/summernote.css` - Minimal custom styles (most styling from Bootstrap 5.3).
- `demo/index.html` - Single demo page using Bootstrap 5.3, Bootstrap Icons, and Google Fonts.

### Plugin Files (Phase 1 Essential Plugins)

- `src/js/plugins/Bold.js` - Bold formatting plugin using Bootstrap Icons.
- `src/js/plugins/Italic.js` - Italic formatting plugin.
- `src/js/plugins/Underline.js` - Underline formatting plugin.
- `src/js/plugins/List.js` - List (ordered/unordered) plugin.
- `src/js/plugins/Link.js` - Link insertion/editing plugin.

### Entry Points

- `src/js/index.js` - Main entry point for ESM builds.
- `src/js/summernote.js` - Main entry for standard bundle (core + essential plugins).
- `src/js/summernote-core.js` - Entry point for core-only bundle.

### Distribution

- `dist/summernote-core.js` - Core bundle (UMD).
- `dist/summernote-core.esm.js` - Core bundle (ESM).
- `dist/summernote.js` - Standard bundle with essential plugins (UMD).
- `dist/summernote.esm.js` - Standard bundle with essential plugins (ESM).
- `dist/summernote-full.js` - Full bundle with all plugins (UMD).
- `dist/summernote-full.esm.js` - Full bundle with all plugins (ESM).
- `dist/summernote.css` - Compiled CSS (minimal custom styles).
- `dist/plugins/` - Individual plugin bundles.

### Documentation

- `docs/api-v2.md` - API documentation for v2.0.
- `docs/examples/` - Usage examples for both CDN and NPM.
- `docs/icon-mapping.md` - Mapping from old icons to Bootstrap Icons.
- `README.md` - Update with v2.0 information and links.

### Files to Remove/Archive

- `lang/*` - All translation files (i18n removed).
- `dist/summernote-bs3.css` - Bootstrap 3 theme.
- `dist/summernote-bs4.css` - Bootstrap 4 theme.
- `dist/summernote-lite.css` - Lite theme variant.
- `plugin/*/lang/` - Plugin-specific translations.
- Any Font Awesome dependencies and references.

### Notes

- Manual testing will be performed for initial release; automated tests deferred to later phase.
- Focus on clean, modular code from the start.
- All code should use ES6+ features (const/let, arrow functions, classes, template literals, etc.).
- Only Bootstrap 5.3 for styling, Google Fonts for typography, Bootstrap Icons for all icons.
- No translation support; all UI text in English only.
- Single demo page only.

## Tasks

- [x] 1.0 Setup Project Infrastructure and Build System
  - [x] 1.1 Install and configure Rollup as the primary build tool
  - [x] 1.2 Create `rollup.config.js` with multiple entry points for core, standard, and full bundles
  - [x] 1.3 Configure Rollup plugins: babel (for transpilation), terser (for minification), and resolve/commonjs (for dependencies)
  - [x] 1.4 Update `package.json` with `main` (UMD) and `module` (ESM) fields
  - [x] 1.5 Configure `exports` field in `package.json` for core, standard, and plugin-specific imports
  - [x] 1.6 Remove jQuery from dependencies in `package.json`
  - [x] 1.7 Create separate build scripts for development and production in `package.json`
  - [x] 1.8 Configure source map generation for all bundles
  - [x] 1.9 Create `.gitignore` entries for new dist structure
  - [x] 1.10 Set up build watch mode for development

- [ ] 2.0 Remove jQuery and Implement Vanilla JavaScript Core
  - [x] 2.1 Create `src/js/core/dom.js` utility module with helper functions:
    - [x] 2.1.1 `$(selector)` - querySelector wrapper
    - [x] 2.1.2 `$$(selector)` - querySelectorAll wrapper returning array
    - [x] 2.1.3 `addClass(el, className)` - classList.add wrapper
    - [x] 2.1.4 `removeClass(el, className)` - classList.remove wrapper
    - [x] 2.1.5 `toggleClass(el, className)` - classList.toggle wrapper
    - [x] 2.1.6 `hasClass(el, className)` - classList.contains wrapper
    - [x] 2.1.7 `closest(el, selector)` - closest() wrapper
    - [x] 2.1.8 `delegate(parent, eventType, selector, handler)` - event delegation helper
  - [x] 2.2 Create `src/js/core/events.js` utility module:
    - [x] 2.2.1 `on(el, eventType, handler)` - addEventListener wrapper
    - [x] 2.2.2 `off(el, eventType, handler)` - removeEventListener wrapper
    - [x] 2.2.3 `once(el, eventType, handler)` - one-time event listener
    - [x] 2.2.4 `trigger(el, eventType, detail)` - CustomEvent dispatcher
  - [x] 2.3 Create `src/js/core/ajax.js` utility module:
    - [x] 2.3.1 `get(url, options)` - fetch wrapper for GET requests
    - [x] 2.3.2 `post(url, data, options)` - fetch wrapper for POST requests
    - [x] 2.3.3 Error handling and response parsing utilities
  - [x] 2.4 Create `src/js/core/Editor.js` main class:
    - [x] 2.4.1 Implement constructor accepting target element and options
    - [x] 2.4.2 Initialize contenteditable div structure using vanilla JS
    - [x] 2.4.3 Setup toolbar container and basic UI structure
    - [x] 2.4.4 Implement `init()` method for editor initialization
    - [x] 2.4.5 Implement `destroy()` method for cleanup
    - [x] 2.4.6 Implement content getters/setters (`getContent()`, `setContent()`)
    - [x] 2.4.7 Integrate EventEmitter for event handling
    - [x] 2.4.8 Implement focus/blur handlers
  - [x] 2.5 Audit existing jQuery code and create migration checklist
  - [x] 2.6 Replace all jQuery selectors with vanilla JS equivalents
  - [x] 2.7 Replace all jQuery event handlers with native addEventListener
  - [x] 2.8 Replace all jQuery AJAX calls with fetch API
  - [x] 2.9 Replace jQuery animations with CSS transitions or Web Animations API
  - [x] 2.10 Remove all jQuery utility usage ($.each, $.extend, $.trim, etc.) with native equivalents
  - [x] 2.11 Remove all i18n/translation function calls and replace with hardcoded English text

- [x] 3.0 Implement Styling with Bootstrap 5.3 and Bootstrap Icons
  - [x] 3.1 Create minimal `src/css/summernote.css`:
    - [x] 3.1.1 Define only editor-specific styles not covered by Bootstrap 5.3
    - [x] 3.1.2 Use CSS custom properties (variables) for theme customization
    - [x] 3.1.3 Ensure all styles are scoped to `.summernote-editor` or similar
    - [x] 3.1.4 Remove all Bootstrap 3/4 specific styles
    - [x] 3.1.5 Remove all theme variants (lite, air, etc.)
  - [x] 3.2 Replace all icon references with Bootstrap Icons:
    - [x] 3.2.1 Create icon mapping document (`docs/icon-mapping.md`)
    - [x] 3.2.2 Replace Font Awesome icons with Bootstrap Icons equivalents
    - [x] 3.2.3 Update toolbar button rendering to use `<i class="bi bi-*"></i>`
    - [x] 3.2.4 Ensure icon sizing is consistent using Bootstrap utilities
  - [x] 3.3 Update toolbar to use Bootstrap 5.3 components:
    - [x] 3.3.1 Use Bootstrap button classes (`btn`, `btn-sm`, etc.)
    - [x] 3.3.2 Use Bootstrap button groups for grouped buttons
    - [ ] 3.3.3 Use Bootstrap dropdowns for dropdown menus
    - [x] 3.3.4 Apply proper spacing using Bootstrap utilities (`me-2`, `mb-2`, etc.)
  - [x] 3.4 Update modals/dialogs to use Bootstrap 5.3 modal component
  - [x] 3.5 Remove all references to Font Awesome CSS/fonts (v2 code path)
  - [ ] 3.6 Remove all legacy Bootstrap version CSS files
  - [ ] 3.7 Configure Google Fonts:
    - [ ] 3.7.1 Document recommended Google Font (e.g., Inter, Roboto)
    - [x] 3.7.2 Add Google Fonts link to demo page
    - [ ] 3.7.3 Update documentation for users to choose their own fonts

- [x] 4.0 Implement EventEmitter System
  - [x] 4.1 Create `src/js/core/EventEmitter.js` class:
    - [x] 4.1.1 Implement `on(event, handler)` method for event subscription
    - [x] 4.1.2 Implement `off(event, handler)` method for event unsubscription
    - [x] 4.1.3 Implement `once(event, handler)` method for one-time subscriptions
    - [x] 4.1.4 Implement `emit(event, ...args)` method for event dispatch
    - [x] 4.1.5 Add support for namespaced events (e.g., 'summernote.change')
    - [x] 4.1.6 Implement wildcard event listeners (optional)
    - [x] 4.1.7 Add event handler cleanup to prevent memory leaks
  - [x] 4.2 Integrate EventEmitter into Editor class:
    - [x] 4.2.1 Make Editor extend or mixin EventEmitter
    - [x] 4.2.2 Define core editor events (init, change, focus, blur, keydown, keyup, etc.)
    - [x] 4.2.3 Emit events at appropriate lifecycle points
  - [x] 4.3 Document all core events with examples in comments
  - [x] 4.4 Create event naming convention guide (e.g., 'summernote.event', 'plugin.name.event')

- [x] 5.0 Design and Implement New Plugin Architecture
  - [x] 4.1 Create `src/js/core/PluginRegistry.js`:
    - [x] 4.1.1 Implement plugin registration method `register(plugin)`
    - [x] 4.1.2 Implement plugin retrieval by name `get(name)`
    - [x] 4.1.3 Implement plugin initialization with dependency resolution
    - [x] 4.1.4 Implement plugin load order management based on dependencies
    - [x] 4.1.5 Add validation for plugin interface compliance
    - [x] 4.1.6 Handle circular dependency detection
  - [x] 4.2 Define standard plugin interface/contract:
    - [x] 4.2.1 Required properties: `name` (string)
    - [x] 4.2.2 Optional properties: `dependencies` (array of plugin names)
    - [x] 4.2.3 Lifecycle methods: `init(editor)`, `destroy()`, `enable()`, `disable()`
    - [x] 4.2.4 Define plugin API access patterns (how plugins interact with editor)
  - [x] 4.3 Create plugin base class or template:
    - [x] 4.3.1 Create `src/js/core/BasePlugin.js` with default implementations
    - [x] 4.3.2 Add protected methods for accessing editor instance
    - [x] 4.3.3 Add methods for toolbar button registration
    - [x] 4.3.4 Add methods for keyboard shortcut registration
    - [x] 4.3.5 Add methods for context menu registration
  - [x] 4.4 Update Editor class to integrate PluginRegistry:
    - [x] 4.4.1 Accept `plugins` array in constructor options
    - [x] 4.4.2 Initialize plugins during editor init
    - [x] 4.4.3 Call plugin lifecycle methods appropriately
    - [x] 4.4.4 Expose plugin API to registered plugins
  - [x] 4.5 Create plugin developer documentation template
  - [x] 4.6 Add plugin isolation mechanisms (prevent global state pollution)

- [x] 5.0 Migrate Essential Plugins to v2.0 (Phase 1)
  - [x] 5.1 Create Bold Plugin (`src/js/plugins/Bold.js`):
    - [x] 5.1.1 Implement plugin structure following new architecture
    - [x] 5.1.2 Register toolbar button with icon
    - [x] 5.1.3 Implement bold toggle functionality using `document.execCommand('bold')`
    - [x] 5.1.4 Add keyboard shortcut (Ctrl+B / Cmd+B)
    - [x] 5.1.5 Emit plugin-specific events
    - [x] 5.1.6 Handle button state updates based on selection
  - [x] 5.2 Create Italic Plugin (`src/js/plugins/Italic.js`):
    - [x] 5.2.1 Implement similar to Bold plugin
    - [x] 5.2.2 Use `document.execCommand('italic')`
    - [x] 5.2.3 Add keyboard shortcut (Ctrl+I / Cmd+I)
  - [x] 5.3 Create Underline Plugin (`src/js/plugins/Underline.js`):
    - [x] 5.3.1 Implement similar to Bold plugin
    - [x] 5.3.2 Use `document.execCommand('underline')`
    - [x] 5.3.3 Add keyboard shortcut (Ctrl+U / Cmd+U)
  - [x] 5.4 Create List Plugin (`src/js/plugins/List.js`):
    - [x] 5.4.1 Implement ordered list functionality (`insertOrderedList`)
    - [x] 5.4.2 Implement unordered list functionality (`insertUnorderedList`)
    - [x] 5.4.3 Add toolbar buttons for both list types
    - [x] 5.4.4 Handle nested lists appropriately
  - [x] 5.5 Create Link Plugin (`src/js/plugins/Link.js`):
    - [x] 5.5.1 Create link insertion dialog/modal using vanilla JS
    - [x] 5.5.2 Implement `createLink` command with validation
    - [x] 5.5.3 Implement link editing (update existing links)
    - [x] 5.5.4 Implement unlink functionality
    - [x] 5.5.5 Add toolbar button with icon
    - [x] 5.5.6 Handle keyboard shortcut (Ctrl+K / Cmd+K)
  - [x] 5.6 Test each plugin individually in isolation
  - [x] 5.7 Test plugins working together without conflicts

- [x] 6.0 Configure Dual Module System (UMD + ESM) and Multiple Bundles
  - [x] 6.1 Create `src/js/summernote-core.js` entry point:
    - [x] 6.1.1 Import and export Editor class only
    - [x] 6.1.2 Import and export EventEmitter
    - [x] 6.1.3 Import and export core utilities
  - [x] 6.2 Create `src/js/summernote.js` entry point (standard bundle):
    - [x] 6.2.1 Import core editor
    - [x] 6.2.2 Import and register Phase 1 essential plugins
    - [x] 6.2.3 Export configured Summernote with plugins
  - [x] 6.3 Create `src/js/summernote-full.js` entry point (all plugins):
    - [x] 6.3.1 Import all available plugins (Phase 1 + future phases)
    - [x] 6.3.2 Auto-register all plugins
  - [x] 6.4 Configure Rollup for UMD output:
    - [x] 6.4.1 Set format to 'umd'
    - [x] 6.4.2 Define global name (e.g., 'Summernote')
    - [x] 6.4.3 Configure externals if needed
  - [x] 6.5 Configure Rollup for ESM output:
    - [x] 6.5.1 Set format to 'es'
    - [x] 6.5.2 Enable tree-shaking optimizations
  - [x] 6.6 Create individual plugin bundle configurations:
    - [x] 6.6.1 Configure each plugin as separate entry point
    - [x] 6.6.2 Output to `dist/plugins/` directory
  - [x] 6.7 Add bundle size reporting to build process
  - [x] 6.8 Test UMD bundles in browser (CDN-style usage)
  - [x] 6.9 Test ESM bundles with modern bundlers (Webpack, Vite, Rollup)
  - [x] 6.10 Verify tree-shaking works correctly for ESM builds
  - [x] 6.11 Test `package.json` exports field with different import patterns

- [x] 7.0 Create API Documentation and Usage Examples
  - [x] 7.1 Create `docs/api-v2.md`:
    - [x] 7.1.1 Document Editor class constructor and options
    - [x] 7.1.2 Document all public methods (init, destroy, getContent, setContent, etc.)
    - [x] 7.1.3 Document EventEmitter API and core events
    - [x] 7.1.4 Document plugin registration and usage
    - [x] 7.1.5 Document available configuration options
  - [x] 7.2 Create CDN usage examples:
    - [x] 7.2.1 Create `docs/examples/cdn-basic.html` - Basic initialization
    - [x] 7.2.2 Create `docs/examples/cdn-with-plugins.html` - Core + selected plugins
    - [x] 7.2.3 Create `docs/examples/cdn-events.html` - Event handling examples
  - [ ] 7.3 Create NPM/ESM usage examples:
    - [ ] 7.3.1 Create `docs/examples/npm-basic.js` - Basic ES module import
    - [ ] 7.3.2 Create `docs/examples/npm-selective-plugins.js` - Selective plugin imports
    - [ ] 7.3.3 Create `docs/examples/npm-custom-plugin.js` - Creating custom plugin
  - [ ] 7.4 Document migration considerations from v1.x:
    - [ ] 7.4.1 List major breaking changes (jQuery removal, i18n removal, theme removal)
    - [ ] 7.4.2 Provide before/after code examples
    - [ ] 7.4.3 Note Bootstrap 5.3 requirement and icon library change
  - [ ] 7.5 Create plugin development guide:
    - [ ] 7.5.1 Document plugin interface requirements
    - [ ] 7.5.2 Provide plugin template/boilerplate
    - [ ] 7.5.3 Show examples of toolbar button registration with Bootstrap Icons
    - [ ] 7.5.4 Show examples of shortcut and event registration
  - [ ] 7.6 Update main `README.md`:
    - [ ] 7.6.1 Add v2.0 installation instructions (CDN and NPM)
    - [ ] 7.6.2 Add quick start examples for both methods
    - [ ] 7.6.3 Link to detailed documentation
    - [ ] 7.6.4 Note v1.x vs v2.0 differences (jQuery removal, single Bootstrap version, English only)
    - [ ] 7.6.5 Add badges and version information
  - [ ] 7.7 Document styling and customization:
    - [ ] 7.7.1 Explain how to customize using Bootstrap 5.3 variables
    - [ ] 7.7.2 Provide examples of CSS custom properties
    - [ ] 7.7.3 Document how to use custom Google Fonts
  - [ ] 7.8 Document browser compatibility requirements
  - [ ] 7.9 Create bundle size comparison chart (core vs standard vs full)

- [ ] 8.0 Create Single Demo Page and Documentation
  - [ ] 8.1 Create `demo/index.html`:
    - [ ] 8.1.1 Include Bootstrap 5.3 CSS from CDN
    - [ ] 8.1.2 Include Bootstrap Icons CSS from CDN
    - [ ] 8.1.3 Include Google Fonts (Inter or chosen default)
    - [ ] 8.1.4 Include Summernote v2.0 CSS and JS
    - [ ] 8.1.5 Create comprehensive demo with all Phase 1 plugins
    - [ ] 8.1.6 Show both initialization methods (imperative and declarative)
    - [ ] 8.1.7 Demonstrate event handling
    - [ ] 8.1.8 Add code examples and explanations
    - [ ] 8.1.9 Use Bootstrap 5.3 layout and components for page structure
  - [ ] 8.2 Remove all other demo variations (lite, air, BS3, BS4, etc.)
  - [ ] 8.3 Create `docs/api-v2.md`:
    - [ ] 8.3.1 Document Editor class constructor and options
    - [ ] 8.3.2 Document all public methods (init, destroy, getContent, setContent, etc.)
    - [ ] 8.3.3 Document EventEmitter API and core events
    - [ ] 8.3.4 Document plugin registration and usage
    - [ ] 8.3.5 Document available configuration options
  - [ ] 8.4 Create `docs/icon-mapping.md`:
    - [ ] 8.4.1 List all old Font Awesome icons
    - [ ] 8.4.2 Provide Bootstrap Icons equivalents
    - [ ] 8.4.3 Include visual examples if possible
  - [ ] 8.5 Create CDN usage examples:
    - [ ] 8.5.1 Create `docs/examples/cdn-basic.html` - Basic initialization
    - [ ] 8.5.2 Create `docs/examples/cdn-with-plugins.html` - Core + selected plugins
    - [ ] 8.5.3 Create `docs/examples/cdn-events.html` - Event handling examples
  - [ ] 8.6 Create NPM/ESM usage examples:
    - [ ] 8.6.1 Create `docs/examples/npm-basic.js` - Basic ES module import
    - [ ] 8.6.2 Create `docs/examples/npm-selective-plugins.js` - Selective plugin imports
    - [ ] 8.6.3 Create `docs/examples/npm-custom-plugin.js` - Creating custom plugin
  - [ ] 8.7 Document migration considerations from v1.x:
    - [ ] 8.7.1 List major breaking changes (jQuery removal, i18n removal, theme removal)
    - [ ] 8.7.2 Provide before/after code examples
    - [ ] 8.7.3 Note Bootstrap 5.3 requirement and icon library change
  - [ ] 8.8 Create plugin development guide:
    - [ ] 8.8.1 Document plugin interface requirements
    - [ ] 8.8.2 Provide plugin template/boilerplate
    - [ ] 8.8.3 Show examples of toolbar button registration with Bootstrap Icons
    - [ ] 8.8.4 Show examples of shortcut and event registration
  - [ ] 8.9 Update main `README.md`:
    - [ ] 8.9.1 Add v2.0 installation instructions (CDN and NPM)
    - [ ] 8.9.2 Add quick start examples for both methods
    - [ ] 8.9.3 Link to detailed documentation
    - [ ] 8.9.4 Note v1.x vs v2.0 differences (jQuery removal, single Bootstrap version, English only)
    - [ ] 8.9.5 Add badges and version information
  - [ ] 8.10 Document styling and customization:
    - [ ] 8.10.1 Explain how to customize using Bootstrap 5.3 variables
    - [ ] 8.10.2 Provide examples of CSS custom properties
    - [ ] 8.10.3 Document how to use custom Google Fonts
  - [ ] 8.11 Document browser compatibility requirements
  - [ ] 8.12 Create bundle size comparison chart (core vs standard vs full)
