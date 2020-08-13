'use strict';

/* global chai: false */
/* global sinon: false */

let expect = chai.expect;

describe('The inboxLinshareAttachmentSaveActionService service', function() {
  let $rootScope, $q;
  let linshareApiClient, inboxLinshareApiClient, inboxLinshareAttachmentSaveActionService;

  beforeEach(module('linagora.esn.unifiedinbox.linshare'));

  beforeEach(inject(function(
    _$rootScope_,
    _$q_,
    _linshareApiClient_,
    _inboxLinshareApiClient_,
    _inboxLinshareAttachmentSaveActionService_
  ) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    linshareApiClient = _linshareApiClient_;
    inboxLinshareApiClient = _inboxLinshareApiClient_;
    inboxLinshareAttachmentSaveActionService = _inboxLinshareAttachmentSaveActionService_;

    linshareApiClient.ASYNC_TASK_STATUS = {
      PENDING: 'PENDING',
      FAILED: 'FAILED',
      SUCCESS: 'SUCCESS'
    };
  }));

  describe('The getAttachmentMapping fn', function() {
    it('should resolve the only one mapping filter by blobId', function(done) {
      let attachmentMappings = [{ blobId: 1 }];
      let attachment = { blobId: 1 };

      inboxLinshareApiClient.getAttachments = sinon.stub().returns($q.when(attachmentMappings));

      inboxLinshareAttachmentSaveActionService.getAttachmentMapping(attachment).then(function(mapping) {
        expect(mapping).to.deep.equal(attachmentMappings[0]);
        done();
      });

      $rootScope.$digest();
    });

    it('should resolve nothing when there is no mapping matched the blobId', function(done) {
      let attachmentMappings = [];
      let attachment = { blobId: 1 };

      inboxLinshareApiClient.getAttachments = sinon.stub().returns($q.when(attachmentMappings));

      inboxLinshareAttachmentSaveActionService.getAttachmentMapping(attachment).then(function(mapping) {
        expect(mapping).to.not.exist;
        done();
      });

      $rootScope.$digest();
    });
  });

  describe('The saveAttachmentToLinshare fn', function() {
    it('should create LinShare document by download URL of the attachment', function() {
      let downloadUrl = 'http://abc.com/download.pdf';
      let attachment = {
        name: 'my file.pdf',
        getSignedDownloadUrl: sinon.stub().returns($q.when(downloadUrl))
      };

      linshareApiClient.createDocumentFromUrl = sinon.stub().returns($q.when({
        status: linshareApiClient.ASYNC_TASK_STATUS.FAILED
      }));

      inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare(attachment);

      $rootScope.$digest();

      expect(linshareApiClient.createDocumentFromUrl).to.have.been.calledWith({
        url: downloadUrl,
        fileName: attachment.name
      }, { async: true });
    });

    it('should reject when the async task is marked as failed', function(done) {
      let downloadUrl = 'http://abc.com/download.pdf';
      let attachment = {
        name: 'my file.pdf',
        getSignedDownloadUrl: sinon.stub().returns($q.when(downloadUrl))
      };

      linshareApiClient.createDocumentFromUrl = sinon.stub().returns($q.when({
        status: linshareApiClient.ASYNC_TASK_STATUS.FAILED
      }));

      inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare(attachment).catch(function(err) {
        expect(err.message).to.equal('Cannot save attachment to LinShare');
        done();
      });

      $rootScope.$digest();
    });

    it('should create attachment mapping to track the async task', function() {
      let downloadUrl = 'http://abc.com/download.pdf';
      let attachment = {
        name: 'my file.pdf',
        getSignedDownloadUrl: sinon.stub().returns($q.when(downloadUrl))
      };
      let asyncTask = {
        status: linshareApiClient.ASYNC_TASK_STATUS.PENDING,
        async: { uuid: '123' }
      };

      linshareApiClient.createDocumentFromUrl = sinon.stub().returns($q.when(asyncTask));
      inboxLinshareApiClient.createAttachment = sinon.spy();

      inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare(attachment);
      $rootScope.$digest();

      expect(inboxLinshareApiClient.createAttachment).to.have.been.calledWith({
        blobId: attachment.blobId,
        asyncTaskId: asyncTask.async.uuid
      });
    });

    it('should create attachment mapping with documentId when async task is marked as SUCCESS right after creation', function() {
      let downloadUrl = 'http://abc.com/download.pdf';
      let attachment = {
        name: 'my file.pdf',
        getSignedDownloadUrl: sinon.stub().returns($q.when(downloadUrl))
      };
      let asyncTask = {
        uuid: '468',
        status: linshareApiClient.ASYNC_TASK_STATUS.SUCCESS,
        async: { uuid: '123', resourceUuid: '456' }
      };

      linshareApiClient.createDocumentFromUrl = sinon.stub().returns($q.when(asyncTask));
      inboxLinshareApiClient.createAttachment = sinon.spy();

      inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare(attachment);
      $rootScope.$digest();

      expect(inboxLinshareApiClient.createAttachment).to.have.been.calledWith({
        documentId: asyncTask.resourceUuid,
        blobId: attachment.blobId,
        asyncTaskId: asyncTask.async.uuid
      });
    });
  });

  describe('The watch fn', function() {
    let $interval;
    let INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL;

    beforeEach(inject(function(_$interval_, _INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL_) {
      $interval = _$interval_;
      INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL = _INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL_;
    }));

    it('should reject when async task is marked as FAILED', function(done) {
      let asyncTask = {
        status: linshareApiClient.ASYNC_TASK_STATUS.FAILED
      };
      let attachmentMapping = {
        asyncTaskId: '123'
      };
      let scope = $rootScope.$new();

      linshareApiClient.getDocumentAsyncTaskById = sinon.stub().returns($q.when(asyncTask));

      inboxLinshareAttachmentSaveActionService.watch(attachmentMapping, scope).catch(function(err) {
        expect(err.message).to.equal('Failed to save attachment to LinShare');
        done();
      });

      $interval.flush(INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL + 1);
    });

    it('should update attachment mapping when async task is marked as SUCCESS', function() {
      let asyncTask = {
        uuid: '456',
        resourceUuid: 'jqka',
        status: linshareApiClient.ASYNC_TASK_STATUS.SUCCESS
      };
      let attachmentMapping = {
        id: '789',
        asyncTaskId: '123'
      };
      let scope = $rootScope.$new();

      linshareApiClient.getDocumentAsyncTaskById = sinon.stub().returns($q.when(asyncTask));
      inboxLinshareApiClient.updateAttachment = sinon.stub().returns($q.when());

      inboxLinshareAttachmentSaveActionService.watch(attachmentMapping, scope);
      $interval.flush(INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL + 1);

      expect(inboxLinshareApiClient.updateAttachment).to.have.been.calledWith(attachmentMapping.id, {
        documentId: asyncTask.resourceUuid
      });
    });

    it('should skip interval when last step is not done', function() {
      let attachmentMapping = {
        id: '789',
        asyncTaskId: '123'
      };
      let scope = $rootScope.$new();

      linshareApiClient.getDocumentAsyncTaskById = sinon.stub().returns($q.defer().promise);

      inboxLinshareAttachmentSaveActionService.watch(attachmentMapping, scope);
      $interval.flush(INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL + 1);
      $interval.flush(INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL + 1);

      expect(linshareApiClient.getDocumentAsyncTaskById).to.have.been.calledOnce;
    });

    it('should try again when last step is done', function() {
      let attachmentMapping = {
        id: '789',
        asyncTaskId: '123'
      };
      let scope = $rootScope.$new();

      linshareApiClient.getDocumentAsyncTaskById = sinon.stub().returns($q.when({}));

      inboxLinshareAttachmentSaveActionService.watch(attachmentMapping, scope);
      $interval.flush(INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL + 1);
      $interval.flush(INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL + 1);

      expect(linshareApiClient.getDocumentAsyncTaskById).to.have.been.calledTwice;
    });

    it('should stop the poller when scope is destroyed', function() {
      let attachmentMapping = {
        id: '789',
        asyncTaskId: '123'
      };
      let scope = $rootScope.$new();

      linshareApiClient.getDocumentAsyncTaskById = sinon.stub().returns($q.when({}));

      inboxLinshareAttachmentSaveActionService.watch(attachmentMapping, scope);
      $interval.flush(INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL + 1);

      scope.$destroy();

      $interval.flush(INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL + 1);

      expect(linshareApiClient.getDocumentAsyncTaskById).to.have.been.calledOnce;
    });

    it('should resolve with the documentId when async task is marked as SUCCESS and success to update attachment mapping', function(done) {
      let asyncTask = {
        uuid: '456',
        resourceUuid: 'jqka',
        status: linshareApiClient.ASYNC_TASK_STATUS.SUCCESS
      };
      let attachmentMapping = {
        id: '789',
        asyncTaskId: '123'
      };
      let scope = $rootScope.$new();

      linshareApiClient.getDocumentAsyncTaskById = sinon.stub().returns($q.when(asyncTask));
      inboxLinshareApiClient.updateAttachment = sinon.stub().returns($q.when());

      inboxLinshareAttachmentSaveActionService.watch(attachmentMapping, scope)
        .then(function(documentId) {
          expect(linshareApiClient.getDocumentAsyncTaskById).to.have.been.calledOnce;
          expect(inboxLinshareApiClient.updateAttachment).to.have.been.calledWith(attachmentMapping.id, {
            documentId: asyncTask.resourceUuid
          });
          expect(documentId).to.equal(asyncTask.resourceUuid);
          done();
        });

      $interval.flush(INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL + 1);
    });
  });
});
