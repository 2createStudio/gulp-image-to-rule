# gulp-image-to-rule [![Build Status](https://travis-ci.org/2createStudio/gulp-image-to-rule.svg?branch=master)](https://travis-ci.org/2createStudio/postcss-sprites) [![npm version](https://badge.fury.io/js/gulp-image-to-rule.svg)](http://badge.fury.io/js/gulp-image-to-rule)
[Gulp](https://github.com/gulpjs/gulp) plugin that generate CSS rules from a folder with images.

## Install

```
npm install gulp-image-to-rule
```

## Example

```javascript
var path = require('path');
var gulp = require('gulp');
var i2r  = require('gulp-image-to-rule');

gulp.task('lazy-rules', function() {
	return gulp.src('./src/*.png')
		.pipe(i2r(path.resolve('./dist/sprite.css')))
		.pipe(gulp.dest('.'));
});
```

## Output
```css
.circle { background: url(../src/circle.png) no-repeat 0 0; width: 25px; height: 25px; }
.square { background: url(../src/square.png) no-repeat 0 0; width: 25px; height: 25px; }

@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
	.circle { background: url(../src/circle@2x.png) no-repeat 0 0; width: 25px; height: 25px; background-size: 25px 25px; }
	.square { background: url(../src/square@2x.png) no-repeat 0 0; width: 25px; height: 25px; background-size: 25px 25px; }
}
```

## Notes

- The plugin has built-in support for retina images.
- The CSS selectors are based on name of file e.g `ico-arrow.png => .ico-arrow`.
- The purpose of this plugin is to be a like preprocessor for the [postcss-sprites](https://github.com/2createStudio/postcss-sprites) plugin.

## Contributing

Pull requests are welcome.

## License
MIT © 2createStudio
