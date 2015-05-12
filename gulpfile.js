// MAIN COMMANDS:

//   gulp images
//   gulp less
//   gulp online
//   gulp bootstrap - run once
//   gulp home


var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    stripDebug = require('gulp-strip-debug'),
    minifyHTML = require('gulp-minify-html'),
    uglify = require('gulp-uglify'),
    path = require('path'),
    concatCss = require('gulp-concat-css'),
    autoprefix = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    less = require('gulp-less'),
    nodeInspector = require('gulp-node-inspector');

// default gulp task
gulp.task('default', ['jshint','minify-html', 'less'], function() {
    gulp.watch('./src/less/*.less', ['less']);   // watching for file changes
    gulp.watch('./src/html/index.html', ['minify-html']);   // watching for file changes
    gulp.watch('./src/js/*.js',['jshint']);   // watching for file changes
});

gulp.task('home', function () {
    nodemon({ script: 'home.js',
            ext: 'html js',
            ignore: ['node_modules/**'],
            tasks: ['lintHome']
             })
    .on('restart', function () {
      console.log('restarted Home Server!');
    })
    .on('start', function () {
      console.log('started Home Server!');
    })
})


gulp.task('online', function () {
    nodemon({ script: 'online.js',
            ext: 'html js less',
            ignore: ['node_modules/**', 'Public'],
            tasks: ['jshint','minify-html','less']
     })
    .on('restart', function () {
      setTimeout(function() {
            require('fs').writeFileSync('.rebooted', 'rebooted');
          }, 6000);
    })
})

// not working used yet
gulp.task('debugonline', function() {
    gulp.src([])
      .pipe(nodeInspector({
        debugPort: 8082,
        webHost: '0.0.0.0',
        webPort: 8081,
        saveLiveEdit: false,
        preload: true,
        inject: true,
        hidden: [],
        stackTraceLimit: 50,
        sslKey: '',
        sslCert: ''
      }));

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

gulp.task('jshint', function() {
    gulp.src('./online.js')
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
    gulp.src('./src/js/lanteka.js')
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
    gulp.src(['./src/js/*.js'])
      .pipe(gulp.dest('./Public/js/'));
});   //.pipe(stripDebug())

gulp.task('minify-html', function() {
    var opts = {
      conditionals: true,
      spare:true
    };
    return gulp.src('./src/html/index.html')
      .pipe(minifyHTML(opts))
      .pipe(gulp.dest('./views/'));
});

gulp.task('less', ['less:freelancer', 'less:animations','styles', 'bootstrap']);

gulp.task('less:freelancer', function() {
    return gulp.src('./src/less/freelancer.less')
      .pipe(less({ paths: [path.join(__dirname, 'less', 'includes')] }))
      .pipe(gulp.dest('./src/css'));
});

// gulp.task('less:mixins', function() {
//     return gulp.src('./src/less/mixins.less')
//       .pipe(less({ paths: [path.join(__dirname, 'less', 'includes')] }))
//       .pipe(gulp.dest('./src/css'));
// });

// gulp.task('less:variables', function() {
//     return gulp.src('./src/less/variables.less')
//       .pipe(less({ paths: [path.join(__dirname, 'less', 'includes')] }))
//       .pipe(gulp.dest('./src/css'));
// });

gulp.task('less:animations', function() {
    return gulp.src('./src/less/animations.less')
      .pipe(less({ paths: [path.join(__dirname, 'less', 'includes')] }))
      .pipe(gulp.dest('./src/css'));
});

gulp.task('bootstrap', function() {
    gulp.src(['./src/css/bootstrap.min.css'])
      .pipe(concatCss("bootstrap.min.css"))
      .pipe(gulp.dest('./Public/css')); //
});

gulp.task('styles', function() {
    gulp.src(['./src/css/*.css'])
      .pipe(minifyCss({compatibility: 'ie8'}))
      .pipe(concatCss("styles.css"))
      .pipe(gulp.dest('./Public/css')); //
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
  //  gulp.src('home.js')
  //    .pipe(jshint())
          return gulp.src('./src/html/home.html')
      .pipe(minifyHTML(opts))
      .pipe(gulp.dest('./views/'));
})
