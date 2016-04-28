'use strict';
const gulp = require('gulp');
const path = require('path');
const fs = require('fs');

const runSequence = require('run-sequence');
const plugins = require('gulp-load-plugins')();
const vipConfig = require('./config/vipConfig');
const buildTmpl = require('./tasks/buildTmpl');

const Engine = require('velocity').Engine;
const parser = require('velocity').parser;
const Data = require('velocity').Data;

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
    .pipe(gulp.dest(path.join(config.dist,'styles')));
});

gulp.task('tmpl2js', function () {
  var text = '/* 该模块是由gulp任务自动生成，请不要直接改动！\r\n'
    + ' * 如需改动，请联系zhaojianfei@58.com、xujiao01@58.com、mulina@58.com或zhongweijia@58.com\r\n'
    + ' * 或模块命名规范参考文档http://fedoc.58corp.com/Public/fedoc/%E6%8B%9B%E8%81%98/\r\n'
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

gulp.task('copy:image', function () {
  gulp.src(path.join(config.src, 'images/*'))
    .pipe(gulp.dest(path.join(config.dist, 'images')));
});
gulp.task('start', ['sass','copy:image','velocity'],function () {
  gulp.watch('src/styles/**/*.scss', ['sass']);
  //gulp.watch('src/snippets/*.html', ['tmpl2js']);
  gulp.watch('src/images/*.scss', ['sass']);
  gulp.watch('./*.vm', ['velocity']);
});
