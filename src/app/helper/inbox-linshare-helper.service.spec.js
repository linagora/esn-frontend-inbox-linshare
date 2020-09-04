'use strict';

/* global chai: false */

const expect = chai.expect;

describe('The inboxLinshareHelper service', function() {
  let $q;
  let inboxLinshareHelper;

  beforeEach(angular.mock.module('linagora.esn.unifiedinbox.linshare'));

  beforeEach(angular.mock.inject(function(_$q_, _inboxLinshareHelper_) {
    $q = _$q_;
    inboxLinshareHelper = _inboxLinshareHelper_;
  }));

  describe('The documentToAttachment function', function() {
    it('should convert LinShare document to legal Inbox attachment', function() {
      const linshareDocument = {
        name: 'linshareDocument',
        size: 1000,
        uuid: '123',
        type: 'image/png'
      };
      const attachment = inboxLinshareHelper.documentToAttachment(linshareDocument);

      expect(attachment).to.deep.equal({
        attachmentType: 'linshare',
        name: 'linshareDocument',
        size: 1000,
        type: 'image/png',
        upload: {
          promise: $q.when(),
          cancel: angular.noop
        },
        uuid: '123',
        status: 'uploaded'
      });
    });
  });
});
