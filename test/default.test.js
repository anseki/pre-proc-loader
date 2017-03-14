'use strict';

const proxyquire = require('proxyquire').noPreserveCache(),
  sinon = require('sinon'),
  preProc = {
    replaceTag: sinon.spy(),
    removeTag: sinon.spy(),
    pickTag: sinon.spy()
  },
  loader = proxyquire('../', {'pre-proc': preProc}),
  expect = require('chai').expect;

function resetAll() {
  preProc.replaceTag.reset();
  preProc.removeTag.reset();
  preProc.pickTag.reset();
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
  const CONVERTED = 'module.exports = "content";', NOT_CONVERTED = 'content';

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
      },
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
