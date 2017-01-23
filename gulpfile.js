var gulp = require('gulp');
var runSequence = require('run-sequence');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var babelify = require('babelify');
var uglify = require('gulp-uglifyjs');
var pump = require('pump');
var cleanCSS = require('gulp-clean-css');
var sass = require('gulp-sass');
var watchify = require('watchify');
var watch = require('gulp-watch');
var gutil = require('gulp-util');
var fs = require('fs');
var ReactDOMServer = require('react-dom/server');
var React = require('react');
var decache = require('decache');
var fs = require('fs-extra');
var rimraf = require('rimraf');
var minifyImg = require('gulp-imagemin');

var config = {
  js: {
    src: './client/js/main.jsx',
    watch: './client/js/**',
    outputDir: './server/public/javascripts/',
    outputFile: 'app.js',
    outputPath: './server/public/javascripts/app.js'
  },
  css: {
    src: './client/scss/style.scss',
    watch: './client/scss/stylesheets/**',
    outputDir: './server/public/stylesheets/',
    outputFile: 'style.css',
    outputPath: './server/public/stylesheets/style.css',
  },
  html: {
    src: './client/html/index.html',
    watch: './client/html/**',
    outputDir: './server/public/html',
    outputFile: 'index.html',
    outputPath: './server/public/html/index.html',
  }
};

gulp.task('default', function() {

});

gulp.task('run', function() {
  return runSequence('clean', ['compile-html', 'watch-html', 'watch-js', 'watch-css', 'sass', 'img', 'static', 'nodemon']);
});

gulp.task('lintjs', function() {
  return gulp.src([
    'main.js',
    'gulpfile.js',
    './routes/**.js',
    '.util/**.js',
    './client/actions/**.js',
    './client/stores/**.js'
  ], {matchBase: true})
    .pipe(jshint({esnext: true}))
    .pipe(jshint.reporter('default'));
});

gulp.task('nodemon', function() {
  nodemon({
    script: 'server/bin/www',
    tasks: [],
    ext: 'html js jsx jade scss',
    env: { 'NODE_ENV': 'development' },
    ignore: [
      'public/**',
      'node_modules',
      'client/**'
    ],
  });
});

gulp.task('watch-html', function() {
  return watch(config.html.watch, function() {
    return gulp.start('compile-html');
  });
});

gulp.task('compile-html', function() {
  // Make sure the html folder exists
  var dir = './server/public/html';
  if (!fs.existsSync('./server/public')) {
    fs.mkdirSync('./server/public');
  }
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  require('babel-register')({
    presets: ['es2015', 'react'],
    plugins: ['transform-react-inline-elements', 'transform-react-constant-elements'],
  });

  fs.readFile(config.html.src, 'utf8', function(e, data) {
    if (e) {
      gutil.log(gutil.colors.red(e.toString()));
    } else {

      // Replace into the html
      var newFile = data;

      var MainFrame = require('./client/js/components/MainFrame.jsx');
      decache('./client/js/components/MainFrame.jsx');
      var mainFrameProps = {};
      var mainFrameString = ReactDOMServer.renderToString(React.createElement(MainFrame, mainFrameProps));

      newFile = newFile.replace('<%REPLACE_REACT_MAIN%>', mainFrameString);

      fs.writeFile(config.html.outputPath, newFile, function(e) {
        if (e) {
          gutil.log(gutil.colors.red(e.toString()));
        }
      });
    }
  });
});

gulp.task('watch-js', function() {
  var task = '[watch-js]';
  var count = 0;
  var cyan = gutil.colors.cyan;
  var magenta = gutil.colors.magenta;

  var bundle = function(bundler) {
    gutil.log(cyan(task), 'Starting bundling', magenta('#' + count));
    var startTime = new Date().getTime();

    return bundler
      .bundle()
      .on('error', function(e) {
        gutil.log(gutil.colors.red(e.toString()));
        this.emit('end');
      })
      .pipe(source(config.js.outputFile))
      .pipe(gulp.dest(config.js.outputDir))
      .on('end', function() {
        var time = new Date().getTime() - startTime;
        gutil.log(cyan(task), 'Finished bundling', magenta('#' + count++), 'after', magenta(time + 'ms'));
      });
  };

  var bundler = browserify(config.js.src, {
      cache: {},
      packageCache: {},
      sourceMap: false,
    })
    .plugin(watchify)
    .transform(reactify, {es6: true})
    .transform(babelify.configure({
      compact: false,
    }));

  bundler.on('update', function() {
    bundle(bundler);
    runSequence('compile-html');
  });

  return bundle(bundler);
});

gulp.task('react-render', function() {
  return browserify(config.js.src)
    .transform(reactify, {es6: true})
    .transform(babelify.configure({
      compact: false
    }))
    .bundle()
    .pipe(source(config.js.outputFile))
    .pipe(gulp.dest(config.js.outputDir));
});

gulp.task('minify-js', function() {
  return pump([
    gulp.src(config.js.outputPath),
    uglify(),
    gulp.dest(config.js.outputDir)
  ]);
});

gulp.task('watch-css', function() {
  return watch(config.css.watch, function() {
    return gulp.start('sass');
  });
});

gulp.task('sass', function() {
  gulp.src(config.css.src)
    .pipe(sass())
    .pipe(gulp.dest(config.css.outputDir));
});

gulp.task('minify-css', function() {
  return gulp.src(config.css.outputPath)
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(config.css.outputDir));
});

gulp.task('clean', function(done) {
  return rimraf('./server/public/**/*', function() {
    done();
  });
});

gulp.task('img', function(done) {
  return gulp.src('./client/img/**/*')
    .pipe(minifyImg())
    .pipe(gulp.dest('./server/public/img'));
});

gulp.task('static', function(done) {
  return gulp.src('./client/static/**')
    .pipe(gulp.dest('./server/public'));
});
