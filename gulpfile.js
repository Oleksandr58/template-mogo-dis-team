var gulp        = require('gulp'),
				scss        = require('gulp-sass'),
				browserSync = require('browser-sync'),
				uglify      = require('gulp-uglifyjs'),
				concat      = require('gulp-concat'),
				cssnano     = require('gulp-cssnano'),
				rename      = require('gulp-rename'),
				del         = require('del'),
				imagemin    = require('gulp-imagemin'),
				pngquant    = require('imagemin-pngquant'),
				autoprefixer= require('gulp-autoprefixer'),
				nunjucks 			= require('gulp-nunjucks');
				svgSprite = require('gulp-svg-sprite');
				cheerio = require('gulp-cheerio'),
				replace = require('gulp-replace');


var config = {
	shape: {
		dimension: {         // Set maximum dimensions
			maxWidth: 500,
			maxHeight: 500
						},
			spacing: {         // Add padding
				padding: 0
						}
					},
			mode: {
				symbol: {
					dest : '.'
						}
					}
				};
				
gulp.task('svg-sprite', function (cb) {
	return gulp.src('app/img/svg_icons/*.svg')
		.pipe(svgSprite(config))
		.pipe(gulp.dest('app/img/sprite'))
		.pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[stroke]').removeAttr('stroke');
				$('[style]').removeAttr('style');
			},
			parserOptions: {xmlMode: true}
		}))
		.pipe(replace('&gt;', '>'))
				});					

gulp.task('nunjucks', function () {
	return gulp.src('app/templates/index.html')
		.pipe(nunjucks.compile())
		.pipe(gulp.dest('app'))
		.pipe(browserSync.reload({ stream: true }))
});

gulp.task('scss', function() {
	return gulp.src('app/scss/main.scss')
	.pipe(scss().on( 'error', function( error )
      {console.log( error );} )
	)
	.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade:true}))
	.pipe(cssnano())
	.pipe(rename({suffix: '.min'})) 
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('js-libs', function() {
	return gulp.src([ 
					'app/libs/jquery.min.js', 
					'app/libs/slick.min.js' 
					])
					.pipe(concat('libs.min.js')) 
					.pipe(uglify()) 
					.pipe(gulp.dest('app/js'));
});

gulp.task('js', function() {
	return gulp.src('app/js/layout/*.js')
					.pipe(concat('scripts.min.js')) 
					.pipe(uglify()) 
					.pipe(gulp.dest('app/js'))
					.pipe(browserSync.reload({ stream: true }));
});

gulp.task('browser-sync', function(){
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false
	});
});

gulp.task('clean', function(){
	return del.sync('dist');
});

gulp.task('img', function(){
	return gulp.src('app/img/**/*')
	.pipe(imagemin({
		interlaced: true,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	}))
	.pipe(gulp.dest('dist/img'));
});

gulp.task('watch', ['browser-sync', 'nunjucks', 'scss', 'js'], function() {
	gulp.watch('app/scss/**/*.scss', ['scss']);
	gulp.watch('app/templates/*.html', ['nunjucks']);
	gulp.watch('app/css/js/layout/*.js', ['js']);
});

gulp.task('build', ['clean', 'nunjucks', 'scss', 'img', 'js', 'js-libs'], function() {
	var buildIndex = gulp.src('app/index.html')
	.pipe(gulp.dest('dist'));

	var buildFonts = gulp.src('app/fonts/**/*') 
			.pipe(gulp.dest('dist/fonts'))
	
	var buildCss = gulp.src('app/css/main.min.css')
	.pipe(gulp.dest('dist/css'));
	
	var buildJS = gulp.src([ 
		'app/js/libs.min.js', 
		'app/js/scripts.min.js' 
		])
	.pipe(gulp.dest('dist/js'));
});

// Default Task
gulp.task('default', ['watch']);