# pre-proc-loader


[preProc](https://github.com/anseki/pre-proc) loader module for [webpack](https://webpack.js.org/).

The super simple preprocessor for front-end development.  
See [preProc](https://github.com/anseki/pre-proc) for options and more information about preProc.

## Installation

```
npm install --save-dev pre-proc-loader pre-proc
```

## Usage

[Documentation: Loaders](https://webpack.js.org/concepts/loaders/)

For example:

```js
// app.js
TEST_MODE = true; // [DEBUG/]
var buttonA = require('./buttons.html?tag=BUTTON-A');
document.getElementById('panel').innerHTML = buttonA;
```

**webpack v2**

```js
// webpack.config.js
module.exports = {
  entry: './app.js',
  output: {
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [{
          loader: 'pre-proc-loader',
          options: {removeTag: {tag: 'DEBUG'}}
        }]
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'pre-proc-loader',
          options: {pickTag: {}} // `tag` is specified via query string
        }]
      }
    ]
  }
};
```

**webpack v1**

```js
// webpack.config.js
module.exports = {
  entry: './app.js',
  output: {
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'pre-proc-loader'},
      {test: /\.html$/, loader: 'pre-proc-loader'}
    ]
  },
  // pre-proc-loader options
  preProcLoader: {
    removeTag: {tag: 'DEBUG'},
    pickTag: {}
  }
};
```

## Options

### `removeTag`

If `removeTag` option is specified, call [`removeTag`](https://github.com/anseki/pre-proc#removetag) method with current content.

You can specify an object that has properties as arguments of the method.  
Following properties are accepted:

- `tag`
- `pathTest`

Also, you can specify common values for the arguments into upper layer. That is, the `options.pathTest` is used when `options.removeTag.pathTest` is not specified.  
And also, you can specify values for `tag` argument via a query string with the resource file like `?tag=TAG`, and it is the first-priority value. An array also can be specified, like `?tag[]=TAG1,tag[]=TAG2`, `?{tag:[TAG1,TAG2]}` or `?tag=TAG1%2CTAG2` (or `?tag=TAG1%20TAG2`, i.e. the values separated by space or comma).

For example:

```js
// webpack.config.js
// ...
// pre-proc-loader options
{
  tag: 'DEBUG',           // common
  pathTest: '/path/to',   // common

  removeTag: {},                            // tag: 'DEBUG', pathTest: '/path/to'
  replaceTag: {tag: ['SPEC1', 'SPEC2']},    // tag: ['SPEC1', 'SPEC2'], pathTest: '/path/to'
  pickTag: {}                               // tag: 'DEBUG', pathTest: '/path/to'
}
// For `file.html?tag=SPEC3` resource, the `SPEC3` is used for all method.
```

### `replaceTag`

If `replaceTag` option is specified, call [`replaceTag`](https://github.com/anseki/pre-proc#replacetag) method with current content.

You can specify arguments by the same way as the [`removeTag`](#removetag).  
Following arguments are accepted:

- `tag`
- `pathTest`

And the `options.replaceTag.replacement` also is accepted. (Not `options.replacement`)

### `pickTag`

If `pickTag` option is specified, call [`pickTag`](https://github.com/anseki/pre-proc#picktag) method with current content.

You can specify arguments by the same way as the [`removeTag`](#removetag).  
Following arguments are accepted:

- `tag`
