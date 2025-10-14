# Summernote v2.0 Source Code

This directory contains the v2.0 rewrite of Summernote with vanilla JavaScript (no jQuery dependency).

## Directory Structure

- `src/` - Contains the source code for Summernote.
- `dist/` - Contains the compiled and minified files for production.
- `test/` - Contains the test files and test runner.
- `docs/` - Contains the documentation files.
- `examples/` - Contains example files demonstrating how to use Summernote.

## Installation

To install Summernote, use npm:

```bash
npm install summernote
```



## Usage

To use Summernote, include the CSS and JavaScript files in your project:

```html
<link href="path/to/summernote.css" rel="stylesheet">
<script src="path/to/summernote.js"></script>
```

Then, initialize Summernote on your desired textarea:

```javascript
$(document).ready(function() {
  $('#summernote').summernote();
});
```

## Contributing

We welcome contributions to Summernote! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) file for more information on how to contribute.

## License

Summernote is licensed under the MIT license. See the [LICENSE.md](LICENSE.md) file for more information.
