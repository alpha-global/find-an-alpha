const gulp = require('gulp');
const less = require('gulp-less');
const LessPluginAutoprefix = require('less-plugin-autoprefix');
const plugins = require('gulp-load-plugins')();
const path = require('path');
const del = require('del');

const lessAutoprefix = new LessPluginAutoprefix({ browsers: ['last 2 versions'] });

const paths = {
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
		.pipe(less({
			plugins: [lessAutoprefix]
		}))
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
		.pipe(less({
			plugins: [lessAutoprefix]
		}))
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

/**
 * Copy find-an-alpha.html from build to root
 */
gulp.task("production:post-build-copy", function () {
	return gulp.src(
		paths.dist.entry
	).pipe(gulp.dest('./'))
});

/**
 * Delete build folder
 */
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

gulp.task('default', ['theme']);

gulp.task("watch", function () {
	gulp.watch(paths.watch, ["theme:styles"])
	gulp.watch(paths.watch, ["theme:module-styles"])

});
