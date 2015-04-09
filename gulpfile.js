var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),
    stripDebug = require('gulp-strip-debug'),
    minifyHTML = require('gulp-minify-html'),
    uglify = require('gulp-uglify'),
    path = require('path'),
    autoprefix = require('gulp-autoprefixer'),
    minifyCSS = require('gulp-minify-css');

gulp.task('home',  ['lintHome', 'developHome']);

gulp.task('lintHome', function () {
  gulp.src('home.js')
    .pipe(jshint())
})

gulp.task('developHome', function () {
  nodemon({ script: 'home.js', ext: 'html js', ignore: ['ignoredHome.js'] })
    .on('change', ['lintHome'])
    .on('restart', function () {
      console.log('restarted Home Server!')
    })
})




gulp.task('develop', function () {
  nodemon({ script: 'online.js', ext: 'html js', ignore: ['ignoredOnline.js'] })
    //.on('change', ['jshint','minify-html'])
    .on('restart', function () {
      console.log('restarted Web Server!');
    })
})

gulp.task('checkapp', function() {
  gulp.src('./app.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
// JS hint task
gulp.task('jshint', function() {
  gulp.src('./src/scripts/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('minify-html', function() {
  var opts = {
    conditionals: true,
    spare:true
  };

  return gulp.src('./src/html/*.html')
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('./views/'));
});


// JS concat, strip debugging and minify
gulp.task('scripts', function() {
  gulp.src(['./src/scripts/lib.js','./src/js/*.js'])
    .pipe(concat('script.js'))
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(gulp.dest('./Public/js/'));
});

// JS concat, strip debugging and minify
gulp.task('lanteka', function() {
  gulp.src(['./src/js/lanteka.js'])
    .pipe(gulp.dest('./Public/js/'));
});

// CSS concat, auto-prefix and minify
gulp.task('styles', function() {
  gulp.src(['./src/styles/*.css'])
    .pipe(concat('styles.css'))
    .pipe(autoprefix('last 2 versions'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./Public/styles/')); //
});

// default gulp task
gulp.task('default', ['checkapp','jshint','lanteka','minify-html','develop'], function() {
  // watch for file changes
  gulp.watch('./src/html/*.html', ['minify-html','develop']);
  gulp.watch('./src/js/*.js',['jshint','lanteka','develop']);
});
