'use strict';

/* global chai: false */

let expect = chai.expect;

describe('The inboxLinshareHelper service', function() {
  let $q;
  let inboxLinshareHelper;

  beforeEach(module('linagora.esn.unifiedinbox.linshare'));

  beforeEach(inject(function(_$q_, _inboxLinshareHelper_) {
    $q = _$q_;
    inboxLinshareHelper = _inboxLinshareHelper_;
  }));

  describe('The documentToAttachment function', function() {
    it('should convert LinShare document to legal Inbox attachment', function() {
      let linshareDocument = {
        name: 'linshareDocument',
        size: 1000,
        uuid: '123',
        type: 'image/png'
      };
      let attachment = inboxLinshareHelper.documentToAttachment(linshareDocument);

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
