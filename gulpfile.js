var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var path = require('path');
var del = require('del');
var paths = {
	less: {
		styles: ["./assets/less/styles/**/*.less"],
		modules: ["./assets/less/modules/**/*.less"],
	},
	js: ['./src/*.js'],
	watch: ['./assets/less/**/*'],
	dist: {
		css: {
			styles: "./css/",
			modules: "./css/modules/",
		},
		js: './src/',
		entry: './build/production/src/find-an-alpha.html',
		html: './'
	}
};

/**
 * Theme Styles
 */
gulp.task("theme:styles", function () {
	return gulp.src(paths.less.styles)

		.pipe(plugins.less())
		.pipe(plugins.minifyCss())
		.pipe(plugins.rename({
			extname: ".min.css"
		}))
		.pipe(gulp.dest(paths.dist.css.styles));
});

/**
 * Web component module styles are built in less, but need to be wrapped in a <dom-module> syntax and loaded from an .html import
 * This task accomplishes that
 */
gulp.task("theme:module-styles", function () {
	return gulp.src(paths.less.modules)
		.pipe(plugins.less())
		.pipe(plugins.minifyCss())
		.pipe(plugins.concatUtil.header('<dom-module id="module:<%= moduleId(file) %>"><template><style>', {
			moduleId: function (file) {
				return path.basename(file.path, ".css");
			}
		}))
		.pipe(plugins.concatUtil.footer('</style></template></dom-module>'))
		.pipe(plugins.rename({
			extname: '.html'
		}))
		.pipe(gulp.dest(paths.dist.css.modules));
});

gulp.task("production:post-build-copy", function () {
	return gulp.src(
		paths.dist.entry
	).pipe(gulp.dest('./'))
});

gulp.task("production:post-build-cleanup", function () {
	return del([
		'build/**'
	])
});

gulp.task("production:post-build", ["production:post-build-copy", "production:post-build-cleanup"]);


/**
 * Build theme tasks into one
 */
gulp.task("theme", ["theme:styles", "theme:module-styles"]);


gulp.task("watch", function () {
	gulp.watch(paths.watch, ["theme:styles"])
	gulp.watch(paths.watch, ["theme:module-styles"])

});
