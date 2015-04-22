// gulp images
// gulp less
// gulp online
// gulp home
//

var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    stripDebug = require('gulp-strip-debug'),
    minifyHTML = require('gulp-minify-html'),
    uglify = require('gulp-uglify'),
    path = require('path'),
    autoprefix = require('gulp-autoprefixer'),
    minifyCSS = require('gulp-minify-css'),
    gulp = require('gulp'),
    less = require('gulp-less'),
    nodeInspector = require('gulp-node-inspector');


// default gulp task
gulp.task('default', ['onlinejs','lantekajs','minify-html', 'less'], function() {
  gulp.watch('./src/less/*.less', ['less']);   // watching for file changes
  gulp.watch('./src/html/*.html', ['minify-html','develop']);   // watching for file changes
  gulp.watch('./src/js/*.js',['jshint','lantekajs','develop']);   // watching for file changes
});

gulp.task('home', function () {
  nodemon({ script: 'home.js',
            ext: 'html js',
            ignore: ['node_modules/**'] })

  .on('restart', function () {
      console.log('restarted Home Server!')
  })
})


gulp.task('online', function () {
  nodemon({ script: 'online.js',
            ext: 'html js less',
            ignore: ['node_modules/**'],
            tasks: ['onlinejs','lantekajs','minify-html','less']
         })
  .on('restart', function () {
      console.log('restarted Web Server!');
  })
})

gulp.task('debugonline', function() {
  // gulp.src([])
  //   .pipe(nodeInspector({
  //     debugPort: 8082,
  //     webHost: '0.0.0.0',
  //     webPort: 8081,
  //     saveLiveEdit: false,
  //     preload: true,
  //     inject: true,
  //     hidden: [],
  //     stackTraceLimit: 50,
  //     sslKey: '',
  //     sslCert: ''
  //   }));
  //
  gulp.src([])
    .pipe(nodeInspector());
});

gulp.task('debughome', function() {
  gulp.src([])
    .pipe(nodeInspector({
      debugPort: 5858,
      webHost: '0.0.0.0',
      webPort: 8080,
      saveLiveEdit: false,
      preload: true,
      inject: true,
      hidden: [],
      stackTraceLimit: 50,
      sslKey: '',
      sslCert: ''
    }));
});

///////////////////////////////////////////////////
///     ACTUAL GULP MODULES - ONLINE JOBS       ///
///////////////////////////////////////////////////

gulp.task('onlinejs', function() {
  gulp.src('./online.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
     console.log("checkapp");
     gulp.src('./src/js/lanteka.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// JS concat, strip debugging and minify
gulp.task('lantekajs', function() {
  gulp.src(['./src/js/lanteka.js'])
    .pipe(gulp.dest('./Public/js/'));
  console.log("lanteka");
});

gulp.task('minify-html', function() {
  var opts = {
    conditionals: true,
    spare:true
  };
  return gulp.src('./src/html/*.html')
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('./views/'));
        console.log("minify-html");
});

gulp.task('less', ['less:freelancer', 'less:mixins','less:variables']);

gulp.task('less:freelancer', function() {
  return gulp.src('./src/less/freelancer.less')
    .pipe(less({ paths: [path.join(__dirname, 'less', 'includes')] }))
    .pipe(gulp.dest('./Public/css'));
});
gulp.task('less:mixins', function() {
  return gulp.src('./src/less/mixins.less')
    .pipe(less({ paths: [path.join(__dirname, 'less', 'includes')] }))
    .pipe(gulp.dest('./Public/css'));
});
gulp.task('less:variables', function() {
  return gulp.src('./src/less/variables.less')
    .pipe(less({ paths: [path.join(__dirname, 'less', 'includes')] }))
    .pipe(gulp.dest('./Public/css'));
});


// JS concat, strip debugging and minify
gulp.task('scripts', function() {
  gulp.src(['./src/scripts/lib.js','./src/js/*.js'])
    .pipe(concat('script.js'))
    .pipe(stripDebug())
    .pipe(uglify())
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

gulp.task('images', function(){
    return gulp.src('src/img/*')
      .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
      }))
      .pipe(gulp.dest('Public/img'));
});

///////////////////////////////////////////////////
///     ACTUAL GULP MODULES - ONLINE JOBS       ///
///////////////////////////////////////////////////

gulp.task('lintHome', function () {
  gulp.src('home.js')
    .pipe(jshint())
})
