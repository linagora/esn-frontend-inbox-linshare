'use strict';

/* global chai: false */

let expect = chai.expect;

describe('The inboxLinshareErrors service', function() {
  let inboxLinshareErrors;
  let error;
  let ERROR = {
    status: 403,
    errCode: 46010,
    message: 'Your attachment size reaches the LinShare limitation'
  };

  beforeEach(function() {
    module('linagora.esn.unifiedinbox.linshare');

    inject(function(_inboxLinshareErrors_) {
      inboxLinshareErrors = _inboxLinshareErrors_;
    });

    error = {
      status: 403,
      data: {
        errCode: 46010
      }
    };
  });

  it('should return undefined if error does not have data', function() {
    delete error.data;
    let result = inboxLinshareErrors(error);

    expect(result).to.be.undefined;
  });

  it('should return undefined if error does not have data', function() {
    error.status = 1;
    let result = inboxLinshareErrors(error);

    expect(result).to.be.undefined;
  });

  it('should return undefined if error does not have detected errCode', function() {
    error.data.errCode = 1;
    let result = inboxLinshareErrors(error);

    expect(result).to.be.undefined;
  });

  it('should return the error on the list if error is satisfied', function() {
    let result = inboxLinshareErrors(error);

    expect(result).to.deep.equals(ERROR);
  });
});
