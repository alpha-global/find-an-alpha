var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var path = require('path');
var paths = {
  less:{
    styles:["./assets/less/styles/**/*.less"],
    modules:["./assets/less/modules/**/*.less"],
  }, 
  js: ['./scripts/*.js'],
  html:['./find-an-alpha.html'],
  watch:['./assets/less/**/*'],
  dist: {
    css:{
      styles:"./css/",
      modules:"./css/modules/",
    },
    js: './scripts/',
    html:'./'
  }
};





gulp.task("polymer", function(){
	return gulp.src('./find-an-alpha.html')
    .pipe(plugins.vulcanize({
		stripComments : true,
		inlineScripts : true
	})).
	pipe(plugins.rename({
		basename : "bundle"
	}))
    .pipe(gulp.dest(paths.dist.html));

});

/**
 * Theme Styles
 */
gulp.task("theme:styles", function(){
	return gulp.src(paths.less.styles)
		
		.pipe(plugins.less())
		.pipe(plugins.minifyCss())
		.pipe(plugins.rename({
			extname: ".min.css"
		}))
		.pipe(gulp.dest(paths.dist.css.styles));
});

/**
 * Web component styles are built in less, but need to be wrapped in a <dom-module> syntax and loaded from an .html import
 * This task accomplishes that
 */
gulp.task("theme:theme-styles", function(){
	return gulp.src(paths.less.styles)
		.pipe(plugins.less())
		.pipe(plugins.minifyCss())
		.pipe(concatUtil.header('<dom-module id="theme:<%= moduleId(file) %>"><template><style>', {moduleId:function(file){
			return path.basename(file.path, ".css");
		}}))
		.pipe(plugins.concatUtil.footer('</style></template></dom-module>'))
		.pipe(plugins.rename({
			extname: '.html'
		}))
		.pipe(gulp.dest(paths.css));
});

/**
 * Web component module styles are built in less, but need to be wrapped in a <dom-module> syntax and loaded from an .html import
 * This task accomplishes that
 */
gulp.task("theme:module-styles", function(){
	return gulp.src(paths.less.modules)
		.pipe(plugins.less())
		.pipe(plugins.minifyCss())
		.pipe(plugins.concatUtil.header('<dom-module id="module:<%= moduleId(file) %>"><template><style>', {moduleId:function(file){
			return path.basename(file.path, ".css");
		}}))
		.pipe(plugins.concatUtil.footer('</style></template></dom-module>'))
		.pipe(plugins.rename({
			extname: '.html'
		}))
		.pipe(gulp.dest(paths.dist.css.modules));
});

/**
 * Take the .woff files and build them into data-uri, concatted file
 */
gulp.task("theme:fonts", function(){
	return gulp.src("wp-content/themes/alpha-donate/assets/fonts/**/*.woff")
			
		.pipe(plugins.font2css())
		.pipe(plugins.concatUtil('fonts.min.css'))
		.pipe(gulp.dest("wp-content/themes/alpha-donate/css"));
});

/**
 * Build theme tasks into one
 */
gulp.task("theme", ["theme:styles",  "theme:module-styles"]);


/**
 * Plugin Tasks
 */
gulp.task("plugin:styles", function(){
	return gulp.src("wp-content/mu-plugins/alpha-donate/assets/less/styles/**/*.less")
		
		.pipe(plugins.less())
		.pipe(gulp.dest("wp-content/mu-plugins/alpha-donate/assets/css"))
		.pipe(plugins.minifyCss())
		.pipe(plugins.rename({
			extname: ".min.css"
		}))
		.pipe(gulp.dest("wp-content/mu-plugins/alpha-donate/assets/css"));
});

gulp.task("watch", function(){
	gulp.watch(paths.watch,["theme:styles"])
	gulp.watch(paths.watch,["theme:module-styles"])
		
});
