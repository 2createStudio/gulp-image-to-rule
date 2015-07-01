'use strict';

/**
 * Module dependencies.
 */
var path         = require('path');
var fs           = require('fs');
var tape         = require('tape');
var gulp         = require('gulp');
var through      = require('through2');
var plugin       = require('../');
var PluginError  = require('gulp-util').PluginError;
var testRoot     = path.resolve(__dirname, '.');
var fixturesRoot = path.resolve(testRoot, './fixtures/');
var buildRoot    = path.resolve(testRoot, './build');
var expectedCss  = fs.readFileSync(path.resolve(testRoot, './expectations/sprite.css'), 'utf-8');

/**
 * Tests.
 */
tape('should ignore null files', function(t) {
	t.plan(1);

	gulp
		.src(path.resolve(fixturesRoot, '*.gif'))
		.pipe(plugin(path.resolve(buildRoot, './sprite.css'), {
			selectorWithPseudo: '.{base}-{pseudo}, a:{pseudo} .{base}, button:{pseudo} .{base}, .{base}, a.{pseudo} .{base}, button.{pseudo} .{base}, .{base}.{pseudo}'
		}))
		.pipe(through.obj(function(file, enc, cb) {
			t.equal(file.contents.toString().length, 0, 'empty output file');
			cb(null, file);
		}))
		.pipe(gulp.dest('.'));
});

tape('should support buffers', function(t) {
	t.plan(1);

	gulp
		.src(path.resolve(fixturesRoot, '*.png'))
		.pipe(plugin(path.resolve(buildRoot, './sprite.css'), {
			selectorWithPseudo: '.{base}-{pseudo}, a:{pseudo} .{base}, button:{pseudo} .{base}, .{base}, a.{pseudo} .{base}, button.{pseudo} .{base}, .{base}.{pseudo}'
		}))
		.pipe(through.obj(function(file, enc, cb) {
			t.equal(file.contents.toString(), expectedCss, 'stylesheet created');
			cb(null, file);
		}))
		.pipe(gulp.dest('.'));
});

tape('should support streams', function(t) {
	t.plan(1);

	gulp
		.src(path.resolve(fixturesRoot, '*.png'), { buffer: false })
		.pipe(plugin(path.resolve(buildRoot, './sprite.css'), {
			selectorWithPseudo: '.{base}-{pseudo}, a:{pseudo} .{base}, button:{pseudo} .{base}, .{base}, a.{pseudo} .{base}, button.{pseudo} .{base}, .{base}.{pseudo}'
		}))
		.pipe(through.obj(function(file, enc, cb) {
			t.equal(file.contents.toString(), expectedCss, 'stylesheet created');
			cb(null, file);
		}))
		.pipe(gulp.dest('.'));
});
