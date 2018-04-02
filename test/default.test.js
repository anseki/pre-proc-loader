'use strict';

let pickTagRturnsNull;
const expect = require('chai').expect,
  sinon = require('sinon'),
  proxyquire = require('proxyquire').noPreserveCache(),
  preProc = {
    pickTag: sinon.spy((tag, content) => (pickTagRturnsNull ? null : `${content}<pickTag>`)),
    replaceTag: sinon.spy((tag, replacement, content) => `${content}<replaceTag>`),
    removeTag: sinon.spy((tag, content) => `${content}<removeTag>`)
  },
  loader = proxyquire('../', {'pre-proc': preProc}),

  CONTENTS = 'content';

function resetAll() {
  preProc.pickTag.resetHistory();
  preProc.replaceTag.resetHistory();
  preProc.removeTag.resetHistory();
}

describe('implements a basic flow as loader', () => {
  const OPTS_REPLACETAG = {tag: 'TAG1'};

  it('should return processed value', () => {
    const RES_REPLACETAG = `${CONTENTS}<replaceTag>`,
      RES_REPLACETAG_CNV = `module.exports = "${RES_REPLACETAG}";`;

    pickTagRturnsNull = false;
    resetAll();
    expect(loader.call(
      {loaderIndex: 1, query: {replaceTag: OPTS_REPLACETAG, toCode: true}}, CONTENTS))
      .to.equal(RES_REPLACETAG);
    expect(preProc.pickTag.notCalled).to.be.true;
    expect(preProc.replaceTag
      .calledOnceWithExactly(OPTS_REPLACETAG.tag, void 0, CONTENTS, null, void 0))
      .to.be.true;
    expect(preProc.removeTag.notCalled).to.be.true;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(loader.call(
      {loaderIndex: 0, query: {replaceTag: OPTS_REPLACETAG, toCode: true}}, CONTENTS))
      .to.equal(RES_REPLACETAG_CNV);
    expect(preProc.pickTag.notCalled).to.be.true;
    expect(preProc.replaceTag
      .calledOnceWithExactly(OPTS_REPLACETAG.tag, void 0, CONTENTS, null, void 0))
      .to.be.true;
    expect(preProc.removeTag.notCalled).to.be.true;
  });

  it('should return a null if a null is input', () => {
    pickTagRturnsNull = false;
    resetAll();
    expect(loader.call(
      {loaderIndex: 1, query: {replaceTag: OPTS_REPLACETAG, toCode: true}}, null)).to.be.null;
    expect(preProc.pickTag.notCalled).to.be.true;
    expect(preProc.replaceTag.notCalled).to.be.true;
    expect(preProc.removeTag.notCalled).to.be.true;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(loader.call(
      {loaderIndex: 0, query: {replaceTag: OPTS_REPLACETAG, toCode: true}}, null))
      .to.equal('module.exports = null;');
    expect(preProc.pickTag.notCalled).to.be.true;
    expect(preProc.replaceTag.notCalled).to.be.true;
    expect(preProc.removeTag.notCalled).to.be.true;
  });

});

describe('when option for each method is passed', () => {
  const OPTS_PICKTAG = {tag: 'TAG1'},
    OPTS_REPLACETAG = {tag: 'TAG2'};

  it('should call only pickTag', () => {
    pickTagRturnsNull = false;
    resetAll();
    expect(loader.call({query: {pickTag: OPTS_PICKTAG}}, CONTENTS)).to.equal(`${CONTENTS}<pickTag>`);
    expect(preProc.pickTag.calledOnceWithExactly(OPTS_PICKTAG.tag, CONTENTS)).to.be.true;
    expect(preProc.replaceTag.notCalled).to.be.true;
    expect(preProc.removeTag.notCalled).to.be.true;
  });

  it('should call pickTag and replaceTag', () => {
    pickTagRturnsNull = false;
    resetAll();
    expect(loader.call({query: {pickTag: OPTS_PICKTAG, replaceTag: OPTS_REPLACETAG}}, CONTENTS))
      .to.equal(`${CONTENTS}<pickTag><replaceTag>`);
    expect(preProc.pickTag.calledOnceWithExactly(OPTS_PICKTAG.tag, CONTENTS)).to.be.true;
    expect(preProc.replaceTag
      .calledOnceWithExactly(OPTS_REPLACETAG.tag, void 0, `${CONTENTS}<pickTag>`, null, void 0))
      .to.be.true;
    expect(preProc.removeTag.notCalled).to.be.true;
  });

});

describe('converts output as code', () => {
  const RES = CONTENTS,
    RES_CNV = `module.exports = "${RES}";`;

  it('should not convert content when loaderIndex: 1 / toCode: false', () => {
    expect(loader.call({loaderIndex: 1, query: {toCode: false}}, CONTENTS)).to.equal(RES);
  });

  it('should not convert content when loaderIndex: 1 / toCode: true', () => {
    expect(loader.call({loaderIndex: 1, query: {toCode: true}}, CONTENTS)).to.equal(RES);
  });

  it('should not convert content when loaderIndex: 0 / toCode: false', () => {
    expect(loader.call({loaderIndex: 0, query: {toCode: false}}, CONTENTS)).to.equal(RES);
  });

  it('should convert content when loaderIndex: 0 / toCode: true', () => {
    expect(loader.call({loaderIndex: 0, query: {toCode: true}}, CONTENTS)).to.equal(RES_CNV);
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
        pickTagRturnsNull = false;
        resetAll();
        loader.call(test.context, CONTENTS);
        expect(preProc.pickTag.calledOnceWithExactly(test.expectedTag, CONTENTS)).to.be.true;
        expect(preProc.replaceTag.notCalled).to.be.true;
        expect(preProc.removeTag.notCalled).to.be.true;
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
        pickTagRturnsNull = false;
        resetAll();
        test.context.query.replaceTag.replacement = 'replacement';
        loader.call(test.context, CONTENTS);
        expect(preProc.pickTag.notCalled).to.be.true;
        expect(preProc.replaceTag
          .calledOnceWithExactly(test.expectedTag, 'replacement', CONTENTS, null, void 0))
          .to.be.true;
        expect(preProc.removeTag.notCalled).to.be.true;
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
        pickTagRturnsNull = false;
        resetAll();
        test.context.query.replaceTag.tag = 'TAG';
        test.context.query.replaceTag.replacement = 'replacement';
        loader.call(test.context, CONTENTS);
        expect(preProc.pickTag.notCalled).to.be.true;
        expect(preProc.replaceTag
          .calledOnceWithExactly('TAG', 'replacement', CONTENTS,
            test.expected.srcPath, test.expected.pathTest)).to.be.true;
        expect(preProc.removeTag.notCalled).to.be.true;
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
        pickTagRturnsNull = false;
        resetAll();
        loader.call(test.context, CONTENTS);
        expect(preProc.pickTag.notCalled).to.be.true;
        expect(preProc.replaceTag.notCalled).to.be.true;
        expect(preProc.removeTag
          .calledOnceWithExactly(test.expectedTag, CONTENTS, null, void 0)).to.be.true;
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
        pickTagRturnsNull = false;
        resetAll();
        test.context.query.removeTag.tag = 'TAG';
        loader.call(test.context, CONTENTS);
        expect(preProc.pickTag.notCalled).to.be.true;
        expect(preProc.replaceTag.notCalled).to.be.true;
        expect(preProc.removeTag
          .calledOnceWithExactly('TAG', CONTENTS, test.expected.srcPath, test.expected.pathTest))
          .to.be.true;
      });
    });
  });

});

describe('passed/returned value', () => {
  const OPTS_ALL = {pickTag: {}, replaceTag: {}, removeTag: {}, tag: 'TAG1', toCode: true},
    RES_ALL = `${CONTENTS}<pickTag><replaceTag><removeTag>`,
    RES_ALL_CNV = `module.exports = "${RES_ALL}";`,
    RES_NULL_CNV = 'module.exports = null;';

  it('should return processed value by all required methods', () => {
    pickTagRturnsNull = false;
    resetAll();
    expect(loader.call({loaderIndex: 1, query: OPTS_ALL}, CONTENTS)).to.equal(RES_ALL);
    expect(preProc.pickTag.calledOnceWithExactly(OPTS_ALL.tag, CONTENTS)).to.be.true;
    expect(preProc.replaceTag
      .calledOnceWithExactly(OPTS_ALL.tag, void 0, `${CONTENTS}<pickTag>`, null, void 0))
      .to.be.true;
    expect(preProc.removeTag
      .calledOnceWithExactly(OPTS_ALL.tag, `${CONTENTS}<pickTag><replaceTag>`, null, void 0))
      .to.be.true;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(loader.call({loaderIndex: 0, query: OPTS_ALL}, CONTENTS)).to.equal(RES_ALL_CNV);
    expect(preProc.pickTag.calledOnceWithExactly(OPTS_ALL.tag, CONTENTS)).to.be.true;
    expect(preProc.replaceTag
      .calledOnceWithExactly(OPTS_ALL.tag, void 0, `${CONTENTS}<pickTag>`, null, void 0))
      .to.be.true;
    expect(preProc.removeTag
      .calledOnceWithExactly(OPTS_ALL.tag, `${CONTENTS}<pickTag><replaceTag>`, null, void 0))
      .to.be.true;
  });

  it('should return a null if a null is input', () => {
    pickTagRturnsNull = false;
    resetAll();
    expect(loader.call({loaderIndex: 1, query: OPTS_ALL}, null)).to.be.null;
    expect(preProc.pickTag.notCalled).to.be.true;
    expect(preProc.replaceTag.notCalled).to.be.true;
    expect(preProc.removeTag.notCalled).to.be.true;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(loader.call({loaderIndex: 0, query: OPTS_ALL}, null)).to.equal(RES_NULL_CNV);
    expect(preProc.pickTag.notCalled).to.be.true;
    expect(preProc.replaceTag.notCalled).to.be.true;
    expect(preProc.removeTag.notCalled).to.be.true;
  });

  it('should throw an error if pickTag returned a null', () => {
    const OPTS_PICKTAG = {pickTag: {}, tag: 'TAG1', toCode: true},
      RES_PICKTAG = `${CONTENTS}<pickTag>`,
      RES_PICKTAG_CNV = `module.exports = "${RES_PICKTAG}";`,
      ERR_MSG = `Not found tag: ${OPTS_PICKTAG.tag}`;

    pickTagRturnsNull = false;
    resetAll();
    expect(loader.call({loaderIndex: 1, query: OPTS_PICKTAG}, CONTENTS)).to.equal(RES_PICKTAG);
    expect(preProc.pickTag.calledOnceWithExactly(OPTS_PICKTAG.tag, CONTENTS)).to.be.true;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(loader.call({loaderIndex: 0, query: OPTS_PICKTAG}, CONTENTS)).to.equal(RES_PICKTAG_CNV);
    expect(preProc.pickTag.calledOnceWithExactly(OPTS_PICKTAG.tag, CONTENTS)).to.be.true;

    // Returns null
    pickTagRturnsNull = true;
    resetAll();
    expect(() => { loader.call({loaderIndex: 1, query: OPTS_PICKTAG}, CONTENTS); })
      .to.throw(ERR_MSG);
    expect(preProc.pickTag.calledOnceWithExactly(OPTS_PICKTAG.tag, CONTENTS)).to.be.true;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(() => { loader.call({loaderIndex: 0, query: OPTS_PICKTAG}, CONTENTS); })
      .to.throw(ERR_MSG);
    expect(preProc.pickTag.calledOnceWithExactly(OPTS_PICKTAG.tag, CONTENTS)).to.be.true;
  });

  it('should control an error by allowErrors', () => {
    const
      OPTS1 = {tag: 'TAG1', pickTag: {}},
      OPTS2 = {tag: 'TAG1', pickTag: {allowErrors: false}},
      OPTS3 = {tag: 'TAG1', pickTag: {allowErrors: true}},
      ERR_MSG = `Not found tag: ${OPTS1.tag}`;

    pickTagRturnsNull = true;
    expect(() => { loader.call({loaderIndex: 1, query: OPTS1}, CONTENTS); }).to.throw(ERR_MSG);
    expect(() => { loader.call({loaderIndex: 1, query: OPTS2}, CONTENTS); }).to.throw(ERR_MSG);
    expect(loader.call({loaderIndex: 1, query: OPTS3}, CONTENTS)).to.be.null;
  });

  it('should return a null if pickTag returned a null with allowErrors', () => {
    const OPTS_PICKTAG = {pickTag: {allowErrors: true}, tag: 'TAG1', toCode: true},
      RES_PICKTAG = `${CONTENTS}<pickTag>`,
      RES_PICKTAG_CNV = `module.exports = "${RES_PICKTAG}";`;

    pickTagRturnsNull = false;
    resetAll();
    expect(loader.call({loaderIndex: 1, query: OPTS_PICKTAG}, CONTENTS)).to.equal(RES_PICKTAG);
    expect(preProc.pickTag.calledOnceWithExactly(OPTS_PICKTAG.tag, CONTENTS)).to.be.true;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(loader.call({loaderIndex: 0, query: OPTS_PICKTAG}, CONTENTS)).to.equal(RES_PICKTAG_CNV);
    expect(preProc.pickTag.calledOnceWithExactly(OPTS_PICKTAG.tag, CONTENTS)).to.be.true;

    // Returns null
    pickTagRturnsNull = true;
    resetAll();
    expect(loader.call({loaderIndex: 1, query: OPTS_PICKTAG}, CONTENTS)).to.be.null;
    expect(preProc.pickTag.calledOnceWithExactly(OPTS_PICKTAG.tag, CONTENTS)).to.be.true;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(loader.call({loaderIndex: 0, query: OPTS_PICKTAG}, CONTENTS)).to.equal(RES_NULL_CNV);
    expect(preProc.pickTag.calledOnceWithExactly(OPTS_PICKTAG.tag, CONTENTS)).to.be.true;
  });

  it('should not call other methods when pickTag returned a null', () => {
    const OPTS_ALL =
      {pickTag: {allowErrors: true}, replaceTag: {}, removeTag: {}, tag: 'TAG1', toCode: true};

    pickTagRturnsNull = false;
    resetAll();
    expect(loader.call({loaderIndex: 1, query: OPTS_ALL}, CONTENTS)).to.equal(RES_ALL);
    expect(preProc.pickTag.calledOnceWithExactly(OPTS_ALL.tag, CONTENTS)).to.be.true;
    expect(preProc.replaceTag
      .calledOnceWithExactly(OPTS_ALL.tag, void 0, `${CONTENTS}<pickTag>`, null, void 0))
      .to.be.true;
    expect(preProc.removeTag
      .calledOnceWithExactly(OPTS_ALL.tag, `${CONTENTS}<pickTag><replaceTag>`, null, void 0))
      .to.be.true;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(loader.call({loaderIndex: 0, query: OPTS_ALL}, CONTENTS)).to.equal(RES_ALL_CNV);
    expect(preProc.pickTag.calledOnceWithExactly(OPTS_ALL.tag, CONTENTS)).to.be.true;
    expect(preProc.replaceTag
      .calledOnceWithExactly(OPTS_ALL.tag, void 0, `${CONTENTS}<pickTag>`, null, void 0))
      .to.be.true;
    expect(preProc.removeTag
      .calledOnceWithExactly(OPTS_ALL.tag, `${CONTENTS}<pickTag><replaceTag>`, null, void 0))
      .to.be.true;

    // Returns null
    pickTagRturnsNull = true;
    resetAll();
    expect(loader.call({loaderIndex: 1, query: OPTS_ALL}, CONTENTS)).to.be.null;
    expect(preProc.pickTag.calledOnceWithExactly(OPTS_ALL.tag, CONTENTS)).to.be.true;
    expect(preProc.replaceTag.notCalled).to.be.true;
    expect(preProc.removeTag.notCalled).to.be.true;
    // Converted (loaderIndex: 0)
    resetAll();
    expect(loader.call({loaderIndex: 0, query: OPTS_ALL}, CONTENTS)).to.equal(RES_NULL_CNV);
    expect(preProc.pickTag.calledOnceWithExactly(OPTS_ALL.tag, CONTENTS)).to.be.true;
    expect(preProc.replaceTag.notCalled).to.be.true;
    expect(preProc.removeTag.notCalled).to.be.true;
  });

});
