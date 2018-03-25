'use strict';

var preProc = require('pre-proc'),
  loaderUtils = require('loader-utils');

module.exports = function(content) {
  var options = loaderUtils.getOptions(this) || {},
    resourceTag, pathTest;

  if (content != null) {
    resourceTag = typeof this.resourceQuery === 'string' && this.resourceQuery &&
        (resourceTag = loaderUtils.parseQuery(this.resourceQuery)) && resourceTag.tag
      ? (resourceTag.tag + '').split(/[,\s]+/) : null;

    // pickTag
    if (options.pickTag) {
      content = preProc.pickTag(resourceTag || options.pickTag.tag || options.tag, content);
    }

    if (content != null) {
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

    } else if (!options.pickTag.allowErrors) { // The content was changed to null by pickTag.
      throw new Error('Not found tag: ' + (resourceTag || options.pickTag.tag || options.tag));
    }
  }

  this.cacheable && this.cacheable();
  return this.loaderIndex === 0 && options.toCode
    ? 'module.exports = ' + JSON.stringify(content) + ';' : content;
};
