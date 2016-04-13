var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');

var PLUGIN_NAME = 'buildTmpl';

module.exports = function (options) {
  return through.obj(function (file, encoding, cb) {
    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return cb();
    }

    var content = file.contents.toString();
    var identifier = '';
    var relativePath = file.path.replace(options.base, '');
    identifier = relativePath.substring(1, relativePath.indexOf('.js'));
    content = content.replace(/(^[\'\"]<script[^>]+>)|(<\/script>[\'\"]$)/g, '\'');
    content = 'templates[\'' + identifier.replace(/\\/g, '/') + '\'] = ' + content + ';';
    file.contents = new Buffer(content);
    this.push(file);
    cb();
  });
};
