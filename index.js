'use strict';

var path = require('path');
module.exports = function(moduleCWD, fn) {
  if (typeof moduleCWD == 'function') {
    fn = moduleCWD;
    moduleCWD = null;
  }

  var parentCWD = process.cwd();
  moduleCWD = moduleCWD || path.dirname(module.parent.filename);
  if (parentCWD === moduleCWD) parentCWD = false;
  return function(grunt, overridecfg) {
    // Merge override with parent
    overridecfg = overridecfg || {};
    var parentcfg = grunt.config.getRaw();
    var args = [grunt, parentCWD].concat(Array.prototype.slice.call(arguments, 2));
    if (Object.keys(overridecfg).length > 0) {
      parentcfg = grunt.util._.merge(parentcfg, overridecfg);
      grunt.initConfig(parentcfg);
    }

    // In case initConfig is called within a module
    grunt.util.hooker.hook(grunt, 'initConfig', {
      pre: function(modulecfg) {
        if (parentCWD !== false) {
          modulecfg = grunt.util._.merge(modulecfg, grunt.config.getRaw());
        }
        return grunt.util.hooker.override(modulecfg);
      }
    });

    // Adjust CWD if has a parentCWD
    if (parentCWD) process.chdir(moduleCWD);
    var res = fn.apply(null, args);
    if (parentCWD) process.chdir(parentCWD);
    return (res != null) ? res : Object.keys(grunt.config.getRaw());
  };
};
