'use strict';

/* global chai: false */
/* global sinon: false */

const expect = chai.expect;

describe('The inboxLinshareAttachmentProvider service', function() {
  let $rootScope, $q;
  let inboxLinshareAttachmentProvider, notificationFactory;
  let INBOX_LINSHARE_ATTACHMENT_TYPE;

  beforeEach(function() {
    angular.mock.module('linagora.esn.unifiedinbox.linshare', function($provide) {
      $provide.value('notificationFactory', {
        weakError: sinon.spy()
      });
    });

    angular.mock.inject(function(_$rootScope_, _$q_, _inboxLinshareAttachmentProvider_, _notificationFactory_, _INBOX_LINSHARE_ATTACHMENT_TYPE_) {
      $rootScope = _$rootScope_;
      $q = _$q_;
      inboxLinshareAttachmentProvider = _inboxLinshareAttachmentProvider_;
      notificationFactory = _notificationFactory_;
      INBOX_LINSHARE_ATTACHMENT_TYPE = _INBOX_LINSHARE_ATTACHMENT_TYPE_;
    });
  });

  describe('The upload fn', function() {
    let fileUploadService;
    let uploaderMock;

    beforeEach(inject(function(_fileUploadService_) {
      fileUploadService = _fileUploadService_;

      uploaderMock = {
        addFile: sinon.stub(),
        start: sinon.spy()
      };
      fileUploadService.get = function() {
        return uploaderMock;
      };
    }));

    it('should use fileUploadService to upload file', function() {
      const file = { name: 'Learn_JS_in_6_hours.pdf', size: 12345 };
      const attachment = {
        getFile: function() {
          return file;
        }
      };

      uploaderMock.addFile.returns({
        defer: $q.defer()
      });

      inboxLinshareAttachmentProvider.upload(attachment);

      expect(uploaderMock.addFile).to.have.been.calledWith(file);
      expect(uploaderMock.start).to.have.been.calledWith();
    });

    it('should assign document UUID to the attachment object on success', function() {
      const file = { name: 'Learn_JS_in_6_hours.pdf', size: 12345 };
      const attachment = {
        getFile: function() {
          return file;
        }
      };
      const document = { uuid: '1212' };
      const defer = $q.defer();

      uploaderMock.addFile.returns({ defer: defer });

      inboxLinshareAttachmentProvider.upload(attachment);
      defer.resolve({ response: document });

      $rootScope.$digest();

      expect(attachment.uuid).to.equal(document.uuid);
    });

    it('should return promise that resolve on success', function() {
      const file = { name: 'Learn_JS_in_6_hours.pdf', size: 12345 };
      const attachment = {
        getFile: function() {
          return file;
        }
      };
      const document = { uuid: '1212' };
      const defer = $q.defer();
      const successSpy = sinon.spy();

      uploaderMock.addFile.returns({ defer: defer });

      inboxLinshareAttachmentProvider.upload(attachment).promise.then(successSpy);
      defer.resolve({ response: document });

      $rootScope.$digest();

      expect(successSpy).to.have.been.calledWith();
    });

    it('should return promise that reject on failure', function() {
      const file = { name: 'Learn_JS_in_6_hours.pdf', size: 12345 };
      const attachment = {
        getFile: function() {
          return file;
        }
      };
      const defer = $q.defer();
      const catchSpy = sinon.spy();
      const error = new Error('an_error');

      uploaderMock.addFile.returns({ defer: defer });

      inboxLinshareAttachmentProvider.upload(attachment).promise.then(null, catchSpy);
      defer.reject(error);

      $rootScope.$digest();

      expect(catchSpy).to.have.been.calledWith(error);
    });

    it('should return promise to be notified the upload progress', function() {
      const file = { name: 'Learn_JS_in_6_hours.pdf', size: 12345 };
      const attachment = {
        getFile: function() {
          return file;
        }
      };
      const defer = $q.defer();
      const notifySpy = sinon.spy();

      uploaderMock.addFile.returns({ defer: defer });

      inboxLinshareAttachmentProvider.upload(attachment).promise.then(null, null, notifySpy);

      defer.notify({ progress: 70 });
      $rootScope.$digest();
      expect(notifySpy).to.have.been.calledWith(70);

      defer.notify({ progress: 80 });
      $rootScope.$digest();
      expect(notifySpy).to.have.been.calledWith(80);
    });

    it('should return cancel function of the upload promise', function() {
      const file = { name: 'Learn_JS_in_6_hours.pdf', size: 12345 };
      const attachment = {
        getFile: function() {
          return file;
        }
      };
      const cancelSpy = sinon.spy();

      uploaderMock.addFile.returns({ defer: $q.defer(), cancel: cancelSpy });

      inboxLinshareAttachmentProvider.upload(attachment).cancel();

      expect(cancelSpy).to.have.been.calledWith();
    });
  });

  describe('The fileToAttachment fn', function() {
    it('should return the LinShare virtual attachment', function() {
      const file = { name: 'Learn_JS_in_6_hours.pdf', size: 12345 };
      const attachment = inboxLinshareAttachmentProvider.fileToAttachment(file);

      expect(attachment).to.shallowDeepEqual({
        attachmentType: INBOX_LINSHARE_ATTACHMENT_TYPE,
        name: file.name,
        size: file.size
      });
      expect(attachment.getFile()).to.deep.equal(file);
    });
  });

  describe('The #removeAttachment function', function() {
    it('should remove the corresponding attachment uuid in the list LinShareAttachmentUUIDs in email header', function() {
      const attachment = {
        uuid: 'uuid1'
      };
      const email = {
        headers: {
          LinShareAttachmentUUIDs: 'uuid1,uuid2'
        }
      };

      inboxLinshareAttachmentProvider.removeAttachment(email, attachment);

      expect(email.headers.LinShareAttachmentUUIDs).to.equal('uuid2');
    });

    it('should do nothing if the removed attachment uuid is not in the list LinShareAttachmentUUIDs in email header', function() {
      const attachment = {
        uuid: 'abc'
      };
      const email = {
        headers: {
          LinShareAttachmentUUIDs: 'uuid1,uuid2'
        }
      };

      inboxLinshareAttachmentProvider.removeAttachment(email, attachment);

      expect(email.headers.LinShareAttachmentUUIDs).to.equal('uuid1,uuid2');
    });
  });

  describe('The handleErrorOnUploading function', function() {
    it('should call notification for warning to user if file size is reached LinShare max size', function() {
      const error = {
        status: 403,
        data: { errCode: 46010 }
      };

      inboxLinshareAttachmentProvider.handleErrorOnUploading(error);

      expect(notificationFactory.weakError).to.have.been.called;
    });

    it('should call notification for warning to user if LinShare account quota is reached', function() {
      const error = {
        status: 403,
        data: { errCode: 46011 }
      };

      inboxLinshareAttachmentProvider.handleErrorOnUploading(error);

      expect(notificationFactory.weakError).to.have.been.called;
    });
  });
});
