'use strict';
const gulp = require('gulp');
const path = require('path');
const fs = require('fs');
const del = require('del');

const runSequence = require('run-sequence');
const plugins = require('gulp-load-plugins')();
const vipConfig = require('./config/vipConfig');
const buildTmpl = require('./tasks/buildTmpl');

const Engine = require('velocity').Engine;
const parser = require('velocity').parser;
const Data = require('velocity').Data;

const pngquant = require('imagemin-pngquant');
const browserSync = require('browser-sync').create();
const reload      = browserSync.reload;

const config = {
  'dist': path.join(__dirname, 'dist'),
  'src': path.join(__dirname, 'src'),
  'js': vipConfig.jsModule,
  'jsTmpName':vipConfig.tmplateName,
  'jsTmpPath':vipConfig.tmplatePath,
  'cssPath':vipConfig.cssPath
};

gulp.task('sass', function () {
  gulp.src(path.join(config.src,'styles',config.cssPath,'*.scss'))
    .pipe(plugins.sass.sync().on('error', function (err) {
      console.log(err)
    }))
    .pipe(plugins.autoprefixer([
     'Chrome >= 20',
     'Firefox >= 24',
     'Explorer >= 6',
     'Opera >= 12',
     'Safari >= 6',
      'iOS >= 6',
      'Android 2.3',
      'Android >= 4'
     ]))
    .pipe(plugins.importCss())
    .pipe(plugins.csscomb())
    .pipe(gulp.dest(path.join(config.dist,'styles')))
    .pipe(reload({stream: true}));
});

gulp.task('tmpl2js', function () {
  var text = '/* 该模块是由gulp任务自动生成，请不要直接改动！\r\n'
    + ' */\r\n'
    + 'var templates = {};\r\n';
  gulp.src([path.join(config.src, 'snippets/',config.jsTmpPath,'/**/*.html'),path.join(config.src,'snippets/common/*.html')])
    .pipe(plugins.tmpl2js({
      mode: 'compress',
      ignoreScriptTag: true
    }))
    .pipe(buildTmpl({
      'base': path.join(config.src, 'snippets')
    }))
    .pipe(plugins.concat(config.jsTmpName))
    .pipe(plugins.insert.prepend(text))
    .pipe(plugins.wrapAmd({
      'exports': 'templates',
      'deps': [],
      'params': []
    }))
    .pipe(plugins.esformatter({
      indent: {
        value: '    '
      }
    }))
    .pipe(gulp.dest(path.join(config.js)))
});

gulp.task('velocity', function (callback) {
    var context = fs.readFileSync(path.join(config.src, 'data/index/index.json'), {
    encoding: 'utf8'
    });
    var engine = new Engine({
        root:path.join(__dirname,''),
        template:path.join(__dirname, '/index.vm'),
        output:path.join(__dirname, '/index.html')
    });
    var result = '';
    try {
    result = engine.render(JSON.parse(context));
    } catch (err) {
    plugins.util.log('Velocitycity Render Error!', err.message)
    }
    callback();
});

gulp.task('copy:js', function () {
  gulp.src(path.join(config.src, 'js/*'))
      .pipe(gulp.dest(path.join(config.dist, 'js')));
});
gulp.task('copy:html', function () {
  gulp.src(path.join(__dirname, '*.html'))
      .pipe(gulp.dest(config.dist));
});
gulp.task('copy:fonts', function () {
  gulp.src(path.join(config.src, 'fonts/*'))
      .pipe(gulp.dest(path.join(config.dist, 'styles/fonts')));
});
gulp.task('clean:dist', function () {
 	 del([config.dist],function(){
     plugins.util.log('dist clean')
   });
});

gulp.task('minimages', function() {
    return gulp.src(path.join(config.src, 'images/**[!sprite]/*'))
        .pipe(plugins.imagemin({
            progressive: true,
            svgoPlugins: [
                {removeViewBox: false},
                {cleanupIDs: false}
            ],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(path.join(config.dist,'images')));
});

gulp.task('server',['build'],function () {
  browserSync.init({
    port: 9000,
    startPath: '/?debug',
    server: {
      baseDir: './'
    }
  })
  gulp.watch("./*.html").on('change',reload);
});

gulp.task('build',['sass','velocity','minimages','copy:js','copy:fonts'],function () {
  gulp.watch('src/styles/**/*.+(scss|sass|css)', ['sass']);
  gulp.watch('src/snippets/*.html', ['tmpl2js']);
  gulp.watch('./*.vm', ['velocity']);
  gulp.watch('src/template/**/*.html', ['velocity']);
});

gulp.task('default',function(){
  runSequence('server')
});