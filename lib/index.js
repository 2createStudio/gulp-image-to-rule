'use strict';

/**
 * Module dependencies.
 */
var fs      = require('fs');
var path    = require('path');
var util    = require('util');
var through = require('through2');
var gutil   = require('gulp-util');
var lodash  = require('lodash');
var Q       = require('q');
var sizeOf  = require('image-size');

/**
 * Constants.
 *
 * @type {Mixed}
 */
var PLUGIN_NAME = 'gulp-image-to-rule';
var TEMPLATES   = {
	REGULAR: '../templates/regular.jst',
	RETINA : '../templates/retina.jst'
};

/**
 * Register the gulp plugin.
 */
module.exports = plugin;

/**
 * Gulp plugin definition.
 *
 * @param  {String} stylesheet
 * @return {Stream}
 */
function plugin(stylesheet) {
	var images = [];
	var file;

	// Resolve path to stylesheet
	stylesheet = stylesheet || path.resolve(__dirname, '../sprite.css');

	// Create empty output file
	file = new gutil.File({
		path: stylesheet
	});

	return through.obj(function(file, enc, cb) {
		// Ignore empty files
		if (file.isNull()) {
			cb();
			return;
		}

		// Collect path to image
		images.push(file.path);

		cb();
	}, function(cb) {
		if (!images) {
			cb();
			return;
		}

		prepareImages(images, stylesheet)
			.spread(preloadTemplates)
			.spread(generateStylesheet)
			.catch(function(err) {
				if (err) {
					this.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
				}
			}.bind(this))
			.done(function(css) {
				file.contents = Buffer(css);
				this.push(file);
				cb();
			}.bind(this));
	});
}

/**
 * Convert image paths to Image objects.
 *
 * @param  {Array}  images
 * @param  {String} stylesheet
 * @return {Promise}
 */
function prepareImages(images, stylesheet) {
	return Q.Promise(function(resolve, reject) {
		images = lodash.map(images, function(image) {
			image = {
				url       : path.relative(path.dirname(stylesheet), image).replace(/\\/g, '/'),
				selector  : getSelector(image),
				ratio     : getRatio(image),
				dimensions: sizeOf(image)
			};

			return image;
		});

		resolve([images, stylesheet]);
	});
}

/**
 * Read the template files and convert them
 * to template functions.
 *
 * @param  {Array}  images
 * @param  {String} stylesheet
 * @return {Promise}
 */
function preloadTemplates(images, stylesheet) {
	return Q.Promise(function(resolve, reject) {
		var templates = lodash
			.chain(TEMPLATES)
			.map(function(templatePath, templateKey) {
				return Q
					.nfcall(fs.readFile, path.resolve(__dirname, templatePath), 'utf-8')
					.then(function(data) {
						return {
							key: templateKey,
							fn : lodash.template(data)
						};
					});
			})
			.value();

		Q
			.all(templates)
			.then(function(templates) {
				resolve([images, stylesheet, templates]);
			})
			.catch(function(err) {
				if (err) {
					reject(err);
				}
			});
	});
}

/**
 * Build the CSS code.
 *
 * @param  {Array}  images
 * @param  {String} stylesheet
 * @param  {Array}  templates
 * @return {Promise}
 */
function generateStylesheet(images, stylesheet, templates) {
	return Q.Promise(function(resolve, reject) {
		var css = '';

		// Group images by ratio
		var groups = lodash
			.chain(images)
			.groupBy(function(image) {
				return image.ratio;
			})
			.value();

		// Output the CSS
		lodash.forEach(groups, function(images, ratio) {
			var isRetina = lodash.parseInt(ratio) > 1;
			var tplKey   = isRetina ? 'RETINA' : 'REGULAR';
			var tpl      = lodash.find(templates, { key: tplKey });

			css += tpl.fn({ images: images });
			css += '\n';
		});

		resolve(css);
	});
}

/**
 * Convert filename to valid CSS selector.
 *
 * @param  {String} filePath
 * @return {String}
 */
function getSelector(filePath) {
	var selector = path.basename(filePath);
		selector = selector.replace(/(@\d+x)?\..+$/gi, '');
		selector = lodash.kebabCase(selector);

	return selector;
}

/**
 * Extract retina ratio from the name of file.
 *
 * @param  {String} filePath
 * @return {Number}
 */
function getRatio(filePath) {
	var file    = path.basename(filePath);
	var matches = /@(\d)x\.[a-z]{3,4}$/gi.exec(file);

	return !lodash.isNull(matches) ? lodash.parseInt(matches[1]) : 1;
}
