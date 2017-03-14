'use strict';

var preProc = require('pre-proc'),
  loaderUtils = require('loader-utils'),
  parseQuery = (function() { // loader-utils@1 doesn't export `parseQuery`.
    var path = require('path');
    return require(path.resolve(path.dirname(require.resolve('loader-utils')), 'parseQuery.js'));
  })();

module.exports = function(content) {
  var options = loaderUtils.getOptions(this) || {},
    resourceTag, pathTest;

  resourceTag = typeof this.resourceQuery === 'string' && this.resourceQuery &&
      (resourceTag = parseQuery(this.resourceQuery)) && resourceTag.tag ?
    (resourceTag.tag + '').split(/[,\s]+/) : null;

  // pickTag
  if (options.pickTag) {
    content = preProc.pickTag(resourceTag || options.pickTag.tag || options.tag, content);
  }

  // replaceTag
  if (options.replaceTag) {
    pathTest = options.replaceTag.pathTest || options.pathTest;
    content = preProc.replaceTag(resourceTag || options.replaceTag.tag || options.tag,
      options.replaceTag.replacement, content, pathTest ? this.resourcePath : null, pathTest);
  }

  // removeTag
  if (options.removeTag) {
    pathTest = options.removeTag.pathTest || options.pathTest;
    content = preProc.removeTag(resourceTag || options.removeTag.tag || options.tag,
      content, pathTest ? this.resourcePath : null, pathTest);
  }

  this.cacheable && this.cacheable();
  return this.loaderIndex === 0 && options.toCode ?
    'module.exports = ' + JSON.stringify(content) + ';' :
    content;
};
