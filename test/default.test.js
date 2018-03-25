'use strict';

let pickTagRturnsNull;
const proxyquire = require('proxyquire').noPreserveCache(),
  sinon = require('sinon'),
  preProc = {
    replaceTag: sinon.spy((tag, replacement, content) => `${content}<replaceTag>`),
    removeTag: sinon.spy((tag, content) => `${content}<removeTag>`),
    pickTag: sinon.spy((tag, content) => (pickTagRturnsNull ? null : `${content}<pickTag>`))
  },
  loader = proxyquire('../', {'pre-proc': preProc}),
  expect = require('chai').expect;

function resetAll() {
  preProc.replaceTag.resetHistory();
  preProc.removeTag.resetHistory();
  preProc.pickTag.resetHistory();
}

describe('when option for each method is passed', () => {

  it('should call only pickTag', () => {
    resetAll();
    loader.call({query: {pickTag: {}}}, 'content');
    expect(preProc.replaceTag.calledOnce).to.be.false;
    expect(preProc.removeTag.calledOnce).to.be.false;
    expect(preProc.pickTag.calledOnce).to.be.true;
  });

  it('should call replaceTag and pickTag', () => {
    resetAll();
    loader.call({query: {replaceTag: {}, pickTag: {}}}, 'content');
    expect(preProc.replaceTag.calledOnce).to.be.true;
    expect(preProc.removeTag.calledOnce).to.be.false;
    expect(preProc.pickTag.calledOnce).to.be.true;
  });

});

describe('options.toCode', () => {
  const CONVERTED = 'module.exports = "content";',
    NOT_CONVERTED = 'content';

  it('should not convert content when loaderIndex: 1 / toCode: false', () => {
    expect(loader.call({loaderIndex: 1, query: {toCode: false}}, 'content')).to.equal(NOT_CONVERTED);
  });

  it('should not convert content when loaderIndex: 1 / toCode: true', () => {
    expect(loader.call({loaderIndex: 1, query: {toCode: true}}, 'content')).to.equal(NOT_CONVERTED);
  });

  it('should not convert content when loaderIndex: 0 / toCode: false', () => {
    expect(loader.call({loaderIndex: 0, query: {toCode: false}}, 'content')).to.equal(NOT_CONVERTED);
  });

  it('should convert content when loaderIndex: 0 / toCode: true', () => {
    expect(loader.call({loaderIndex: 0, query: {toCode: true}}, 'content')).to.equal(CONVERTED);
  });

});

describe('pickTag()', () => {

  describe('should call the method with preferred tag', () => {
    [
      {
        context: {/* resourceQuery: '?tag=RES', */query: {pickTag: {/* tag: 'SPEC'*/}/* , tag: 'SHARE'*/}},
        expectedTag: void 0
      },
      {
        context: {/* resourceQuery: '?tag=RES', */query: {pickTag: {/* tag: 'SPEC'*/}, tag: 'SHARE'}},
        expectedTag: 'SHARE'
      },
      {
        context: {/* resourceQuery: '?tag=RES', */query: {pickTag: {tag: 'SPEC'}/* , tag: 'SHARE'*/}},
        expectedTag: 'SPEC'
      },
      {
        context: {/* resourceQuery: '?tag=RES', */query: {pickTag: {tag: 'SPEC'}, tag: 'SHARE'}},
        expectedTag: 'SPEC'
      },
      {
        context: {resourceQuery: '?tag=RES', query: {pickTag: {/* tag: 'SPEC'*/}/* , tag: 'SHARE'*/}},
        expectedTag: ['RES']
      },
      {
        context: {resourceQuery: '?tag=RES', query: {pickTag: {/* tag: 'SPEC'*/}, tag: 'SHARE'}},
        expectedTag: ['RES']
      },
      {
        context: {resourceQuery: '?tag=RES', query: {pickTag: {tag: 'SPEC'}/* , tag: 'SHARE'*/}},
        expectedTag: ['RES']
      },
      {
        context: {resourceQuery: '?tag=RES', query: {pickTag: {tag: 'SPEC'}, tag: 'SHARE'}},
        expectedTag: ['RES']
      }
    ].forEach(test => {
      it(`query: ${test.context.resourceQuery || 'NONE'}` +
          ` / options.pickTag.tag: ${test.context.query.pickTag.tag || 'NONE'}` +
          ` / options.tag: ${test.context.query.tag || 'NONE'}`, () => {
        resetAll();
        loader.call(test.context, 'content');
        expect(preProc.replaceTag.calledOnce).to.be.false;
        expect(preProc.removeTag.calledOnce).to.be.false;
        expect(preProc.pickTag.calledOnce).to.be.true;
        expect(preProc.pickTag.calledWithExactly(test.expectedTag, 'content')).to.be.true;
      });
    });
  });

});

describe('replaceTag()', () => {

  describe('should call the method with preferred tag', () => {
    [
      {
        context: {/* resourceQuery: '?tag=RES', */query: {replaceTag: {/* tag: 'SPEC'*/}/* , tag: 'SHARE'*/}},
        expectedTag: void 0
      },
      {
        context: {/* resourceQuery: '?tag=RES', */query: {replaceTag: {/* tag: 'SPEC'*/}, tag: 'SHARE'}},
        expectedTag: 'SHARE'
      },
      {
        context: {/* resourceQuery: '?tag=RES', */query: {replaceTag: {tag: 'SPEC'}/* , tag: 'SHARE'*/}},
        expectedTag: 'SPEC'
      },
      {
        context: {/* resourceQuery: '?tag=RES', */query: {replaceTag: {tag: 'SPEC'}, tag: 'SHARE'}},
        expectedTag: 'SPEC'
      },
      {
        context: {resourceQuery: '?tag=RES', query: {replaceTag: {/* tag: 'SPEC'*/}/* , tag: 'SHARE'*/}},
        expectedTag: ['RES']
      },
      {
        context: {resourceQuery: '?tag=RES', query: {replaceTag: {/* tag: 'SPEC'*/}, tag: 'SHARE'}},
        expectedTag: ['RES']
      },
      {
        context: {resourceQuery: '?tag=RES', query: {replaceTag: {tag: 'SPEC'}/* , tag: 'SHARE'*/}},
        expectedTag: ['RES']
      },
      {
        context: {resourceQuery: '?tag=RES', query: {replaceTag: {tag: 'SPEC'}, tag: 'SHARE'}},
        expectedTag: ['RES']
      }
    ].forEach(test => {
      it(`query: ${test.context.resourceQuery || 'NONE'}` +
          ` / options.replaceTag.tag: ${test.context.query.replaceTag.tag || 'NONE'}` +
          ` / options.tag: ${test.context.query.tag || 'NONE'}`, () => {
        resetAll();
        test.context.query.replaceTag.replacement = 'replacement';
        loader.call(test.context, 'content');
        expect(preProc.replaceTag.calledOnce).to.be.true;
        expect(preProc.removeTag.calledOnce).to.be.false;
        expect(preProc.pickTag.calledOnce).to.be.false;
        expect(preProc.replaceTag.calledWithExactly(test.expectedTag,
          'replacement', 'content', null, void 0)).to.be.true;
      });
    });
  });

  describe('should call the method with preferred srcPath and pathTest', () => {
    [
      {
        context: {resourcePath: 'SRCPATH', query: {replaceTag: {/* pathTest: 'SPEC'*/}/* , pathTest: 'SHARE'*/}},
        expected: {srcPath: null, pathTest: void 0}
      },
      {
        context: {resourcePath: 'SRCPATH', query: {replaceTag: {/* pathTest: 'SPEC'*/}, pathTest: 'SHARE'}},
        expected: {srcPath: 'SRCPATH', pathTest: 'SHARE'}
      },
      {
        context: {resourcePath: 'SRCPATH', query: {replaceTag: {pathTest: 'SPEC'}/* , pathTest: 'SHARE'*/}},
        expected: {srcPath: 'SRCPATH', pathTest: 'SPEC'}
      },
      {
        context: {resourcePath: 'SRCPATH', query: {replaceTag: {pathTest: 'SPEC'}, pathTest: 'SHARE'}},
        expected: {srcPath: 'SRCPATH', pathTest: 'SPEC'}
      }
    ].forEach(test => {
      it(`options.replaceTag.pathTest: ${test.context.query.replaceTag.pathTest || 'NONE'}` +
          ` / options.pathTest: ${test.context.query.pathTest || 'NONE'}`, () => {
        resetAll();
        test.context.query.replaceTag.tag = 'TAG';
        test.context.query.replaceTag.replacement = 'replacement';
        loader.call(test.context, 'content');
        expect(preProc.replaceTag.calledOnce).to.be.true;
        expect(preProc.removeTag.calledOnce).to.be.false;
        expect(preProc.pickTag.calledOnce).to.be.false;
        expect(preProc.replaceTag.calledWithExactly('TAG', 'replacement', 'content',
          test.expected.srcPath, test.expected.pathTest)).to.be.true;
      });
    });
  });

});

describe('removeTag()', () => {

  describe('should call the method with preferred tag', () => {
    [
      {
        context: {/* resourceQuery: '?tag=RES', */query: {removeTag: {/* tag: 'SPEC'*/}/* , tag: 'SHARE'*/}},
        expectedTag: void 0
      },
      {
        context: {/* resourceQuery: '?tag=RES', */query: {removeTag: {/* tag: 'SPEC'*/}, tag: 'SHARE'}},
        expectedTag: 'SHARE'
      },
      {
        context: {/* resourceQuery: '?tag=RES', */query: {removeTag: {tag: 'SPEC'}/* , tag: 'SHARE'*/}},
        expectedTag: 'SPEC'
      },
      {
        context: {/* resourceQuery: '?tag=RES', */query: {removeTag: {tag: 'SPEC'}, tag: 'SHARE'}},
        expectedTag: 'SPEC'
      },
      {
        context: {resourceQuery: '?tag=RES', query: {removeTag: {/* tag: 'SPEC'*/}/* , tag: 'SHARE'*/}},
        expectedTag: ['RES']
      },
      {
        context: {resourceQuery: '?tag=RES', query: {removeTag: {/* tag: 'SPEC'*/}, tag: 'SHARE'}},
        expectedTag: ['RES']
      },
      {
        context: {resourceQuery: '?tag=RES', query: {removeTag: {tag: 'SPEC'}/* , tag: 'SHARE'*/}},
        expectedTag: ['RES']
      },
      {
        context: {resourceQuery: '?tag=RES', query: {removeTag: {tag: 'SPEC'}, tag: 'SHARE'}},
        expectedTag: ['RES']
      }
    ].forEach(test => {
      it(`query: ${test.context.resourceQuery || 'NONE'}` +
          ` / options.removeTag.tag: ${test.context.query.removeTag.tag || 'NONE'}` +
          ` / options.tag: ${test.context.query.tag || 'NONE'}`, () => {
        resetAll();
        loader.call(test.context, 'content');
        expect(preProc.replaceTag.calledOnce).to.be.false;
        expect(preProc.removeTag.calledOnce).to.be.true;
        expect(preProc.pickTag.calledOnce).to.be.false;
        expect(preProc.removeTag.calledWithExactly(test.expectedTag,
          'content', null, void 0)).to.be.true;
      });
    });
  });

  describe('should call the method with preferred srcPath and pathTest', () => {
    [
      {
        context: {resourcePath: 'SRCPATH', query: {removeTag: {/* pathTest: 'SPEC'*/}/* , pathTest: 'SHARE'*/}},
        expected: {srcPath: null, pathTest: void 0}
      },
      {
        context: {resourcePath: 'SRCPATH', query: {removeTag: {/* pathTest: 'SPEC'*/}, pathTest: 'SHARE'}},
        expected: {srcPath: 'SRCPATH', pathTest: 'SHARE'}
      },
      {
        context: {resourcePath: 'SRCPATH', query: {removeTag: {pathTest: 'SPEC'}/* , pathTest: 'SHARE'*/}},
        expected: {srcPath: 'SRCPATH', pathTest: 'SPEC'}
      },
      {
        context: {resourcePath: 'SRCPATH', query: {removeTag: {pathTest: 'SPEC'}, pathTest: 'SHARE'}},
        expected: {srcPath: 'SRCPATH', pathTest: 'SPEC'}
      }
    ].forEach(test => {
      it(`options.removeTag.pathTest: ${test.context.query.removeTag.pathTest || 'NONE'}` +
          ` / options.pathTest: ${test.context.query.pathTest || 'NONE'}`, () => {
        resetAll();
        test.context.query.removeTag.tag = 'TAG';
        loader.call(test.context, 'content');
        expect(preProc.replaceTag.calledOnce).to.be.false;
        expect(preProc.removeTag.calledOnce).to.be.true;
        expect(preProc.pickTag.calledOnce).to.be.false;
        expect(preProc.removeTag.calledWithExactly('TAG', 'content',
          test.expected.srcPath, test.expected.pathTest)).to.be.true;
      });
    });
  });

});

describe('passed/returned value', () => {
  const Q_METHODS = {pickTag: {}, replaceTag: {}, removeTag: {}, toCode: true, tag: 'TAG1'},
    R_METHODS = 'content<pickTag><replaceTag><removeTag>',
    R_METHODS_CNV = `module.exports = "${R_METHODS}";`,
    R_NULL_CNV = 'module.exports = null;';

  it('should return processed value by all required methods', () => {
    pickTagRturnsNull = false;

    resetAll();
    expect(loader.call({loaderIndex: 1, query: Q_METHODS}, 'content')).to.equal(R_METHODS);
    expect(preProc.replaceTag.calledOnce).to.be.true;
    expect(preProc.removeTag.calledOnce).to.be.true;
    expect(preProc.pickTag.calledOnce).to.be.true;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(loader.call({loaderIndex: 0, query: Q_METHODS}, 'content')).to.equal(R_METHODS_CNV);
    expect(preProc.replaceTag.calledOnce).to.be.true;
    expect(preProc.removeTag.calledOnce).to.be.true;
    expect(preProc.pickTag.calledOnce).to.be.true;
  });

  it('should return null when passed value is null', () => {
    pickTagRturnsNull = false;

    resetAll();
    expect(loader.call({loaderIndex: 1, query: Q_METHODS}, null)).to.be.null;
    expect(preProc.replaceTag.calledOnce).to.be.false;
    expect(preProc.removeTag.calledOnce).to.be.false;
    expect(preProc.pickTag.calledOnce).to.be.false;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(loader.call({loaderIndex: 0, query: Q_METHODS}, null)).to.equal(R_NULL_CNV);
    expect(preProc.replaceTag.calledOnce).to.be.false;
    expect(preProc.removeTag.calledOnce).to.be.false;
    expect(preProc.pickTag.calledOnce).to.be.false;
  });

  it('should throw an error if pickTag returned null', () => {
    const Q_PICKTAG = {pickTag: {}, toCode: true, tag: 'TAG1'},
      R_PICKTAG = 'content<pickTag>',
      R_PICKTAG_CNV = `module.exports = "${R_PICKTAG}";`,
      ERR_MSG = `Not found tag: ${Q_PICKTAG.tag}`;
    pickTagRturnsNull = false;

    resetAll();
    expect(loader.call({loaderIndex: 1, query: Q_PICKTAG}, 'content')).to.equal(R_PICKTAG);
    expect(preProc.pickTag.calledOnce).to.be.true;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(loader.call({loaderIndex: 0, query: Q_PICKTAG}, 'content')).to.equal(R_PICKTAG_CNV);
    expect(preProc.pickTag.calledOnce).to.be.true;

    // Returns null
    pickTagRturnsNull = true;

    resetAll();
    expect(() => { loader.call({loaderIndex: 1, query: Q_PICKTAG}, 'content'); }).to.throw(ERR_MSG);
    expect(preProc.pickTag.calledOnce).to.be.true;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(() => { loader.call({loaderIndex: 0, query: Q_PICKTAG}, 'content'); }).to.throw(ERR_MSG);
    expect(preProc.pickTag.calledOnce).to.be.true;
  });

  it('should control an error by allowErrors', () => {
    const
      Q1 = {tag: 'TAG1', pickTag: {}},
      Q2 = {tag: 'TAG1', pickTag: {allowErrors: false}},
      Q3 = {tag: 'TAG1', pickTag: {allowErrors: true}},
      ERR_MSG = `Not found tag: ${Q1.tag}`;
    pickTagRturnsNull = true;

    expect(() => { loader.call({loaderIndex: 1, query: Q1}, 'content'); }).to.throw(ERR_MSG);
    expect(() => { loader.call({loaderIndex: 1, query: Q2}, 'content'); }).to.throw(ERR_MSG);
    expect(loader.call({loaderIndex: 1, query: Q3}, 'content')).to.be.null;
  });

  it('should return value from pickTag with allowErrors even if it is null', () => {
    const Q_PICKTAG = {pickTag: {allowErrors: true}, toCode: true, tag: 'TAG1'},
      R_PICKTAG = 'content<pickTag>',
      R_PICKTAG_CNV = `module.exports = "${R_PICKTAG}";`;
    pickTagRturnsNull = false;

    resetAll();
    expect(loader.call({loaderIndex: 1, query: Q_PICKTAG}, 'content')).to.equal(R_PICKTAG);
    expect(preProc.pickTag.calledOnce).to.be.true;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(loader.call({loaderIndex: 0, query: Q_PICKTAG}, 'content')).to.equal(R_PICKTAG_CNV);
    expect(preProc.pickTag.calledOnce).to.be.true;

    // Returns null
    pickTagRturnsNull = true;

    resetAll();
    expect(loader.call({loaderIndex: 1, query: Q_PICKTAG}, 'content')).to.be.null;
    expect(preProc.pickTag.calledOnce).to.be.true;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(loader.call({loaderIndex: 0, query: Q_PICKTAG}, 'content')).to.equal(R_NULL_CNV);
    expect(preProc.pickTag.calledOnce).to.be.true;
  });

  it('should not call other methods when pickTag returned null', () => {
    const Q_METHODS_ARR =
      {pickTag: {allowErrors: true}, replaceTag: {}, removeTag: {}, toCode: true, tag: 'TAG1'};
    pickTagRturnsNull = false;

    resetAll();
    expect(loader.call({loaderIndex: 1, query: Q_METHODS_ARR}, 'content')).to.equal(R_METHODS);
    expect(preProc.replaceTag.calledOnce).to.be.true;
    expect(preProc.removeTag.calledOnce).to.be.true;
    expect(preProc.pickTag.calledOnce).to.be.true;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(loader.call({loaderIndex: 0, query: Q_METHODS_ARR}, 'content')).to.equal(R_METHODS_CNV);
    expect(preProc.replaceTag.calledOnce).to.be.true;
    expect(preProc.removeTag.calledOnce).to.be.true;
    expect(preProc.pickTag.calledOnce).to.be.true;

    // Returns null
    pickTagRturnsNull = true;

    resetAll();
    expect(loader.call({loaderIndex: 1, query: Q_METHODS_ARR}, 'content')).to.be.null;
    expect(preProc.replaceTag.calledOnce).to.be.false;
    expect(preProc.removeTag.calledOnce).to.be.false;
    expect(preProc.pickTag.calledOnce).to.be.true;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(loader.call({loaderIndex: 0, query: Q_METHODS_ARR}, 'content')).to.equal(R_NULL_CNV);
    expect(preProc.replaceTag.calledOnce).to.be.false;
    expect(preProc.removeTag.calledOnce).to.be.false;
    expect(preProc.pickTag.calledOnce).to.be.true;
  });

});
