'use strict';

/* global chai: false */
/* global sinon: false */

const expect = chai.expect;

describe('The inboxLinshareAttachmentSaveAction component', function() {
  let $rootScope, $compile;
  let inboxLinshareAttachmentSaveActionService, linshareApiClient;
  let scope, attachmentMock, configMock;

  beforeEach(function() {
    angular.mock.module('esn.configuration', function($provide) {
      $provide.constant('esnConfig', function() {
        return $q.when(configMock);
      });
    });
  });

  beforeEach(function() {
    angular.mock.module('linagora.esn.unifiedinbox.linshare');

    angular.mock.inject(function(
      _$compile_,
      _$rootScope_,
      _linshareApiClient_,
      _inboxLinshareAttachmentSaveActionService_
    ) {
      $rootScope = _$rootScope_;
      $compile = _$compile_;
      inboxLinshareAttachmentSaveActionService = _inboxLinshareAttachmentSaveActionService_;
      linshareApiClient = _linshareApiClient_;

      inboxLinshareAttachmentSaveActionService.getAttachmentMapping = sinon.stub();
      inboxLinshareAttachmentSaveActionService.watch = sinon.stub();
      inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare = sinon.stub();
      linshareApiClient.getDocument = sinon.stub();
    });

    attachmentMock = {};
  });

  function initComponent() {
    scope = $rootScope.$new();

    scope.attachment = attachmentMock;

    const element = $compile('<inbox-linshare-attachment-save-action attachment="attachment" />')(scope);

    scope.$digest();

    return element;
  }

  it('should show Checking label while getting attachment mapping', function() {
    inboxLinshareAttachmentSaveActionService.getAttachmentMapping.returns($q.defer().promise);

    const element = initComponent();

    expect(element.find('span.label').text()).to.equal('Checking...');
  });

  it('should show Save label when attachment mapping is not found', function() {
    inboxLinshareAttachmentSaveActionService.getAttachmentMapping.returns($q.when());

    const element = initComponent();

    expect(element.find('span.label').text()).to.equal('Save');
  });

  it('should show Save label if the attachment saved once but then removed from Linshare', function() {
    linshareApiClient.getDocument.returns($q.reject());
    inboxLinshareAttachmentSaveActionService.getAttachmentMapping.returns($q.when({ documentId: '123' }));

    const element = initComponent();

    expect(element.find('span.label').text()).to.equal('Save');
  });

  it('should show Save label when it fails to get mapping', function() {
    inboxLinshareAttachmentSaveActionService.getAttachmentMapping.returns($q.reject());

    const element = initComponent();

    expect(element.find('span.label').text()).to.equal('Save');
  });

  it('should show Saved label when attachment is saved to LinShare', function() {
    linshareApiClient.getDocument.returns($q.when({ documentId: '1234' }));
    inboxLinshareAttachmentSaveActionService.getAttachmentMapping.returns($q.when({
      documentId: '1234'
    }));

    const element = initComponent();

    expect(element.find('span.label').text()).to.equal('Saved');
  });

  it('should show Saving label and watch the mapping when attachment is being saved to LinShare', function() {
    const mapping = { asyncTaskId: '123' };

    inboxLinshareAttachmentSaveActionService.getAttachmentMapping.returns($q.when(mapping));
    inboxLinshareAttachmentSaveActionService.watch.returns($q.defer().promise);

    const element = initComponent();

    expect(element.find('span.label').text()).to.equal('Saving...');
    expect(inboxLinshareAttachmentSaveActionService.watch).to.have.been.calledWith(mapping);
  });

  it('should show Saved label when mapping watcher is resolved', function() {
    const mapping = { asyncTaskId: '123' };

    inboxLinshareAttachmentSaveActionService.getAttachmentMapping.returns($q.when(mapping));
    inboxLinshareAttachmentSaveActionService.watch.returns($q.when());

    const element = initComponent();

    expect(element.find('span.label').text()).to.equal('Saved');
  });

  it('should show Saved button with the link to open file in LinShare when mapping watcher is resolved', function() {
    configMock = 'http://linshare.org';
    const mapping = { asyncTaskId: '123', documentId: '456' };
    const expectUrl = configMock + '#/files/list?fileUuid=' + mapping.documentId;

    linshareApiClient.getDocument.returns($q.when({ documentId: '456' }));
    inboxLinshareAttachmentSaveActionService.getAttachmentMapping.returns($q.when(mapping));
    inboxLinshareAttachmentSaveActionService.watch.returns($q.when());

    const element = initComponent();

    expect(element.find('a').attr('target')).to.equal('_blank');
    expect(element.find('a').attr('href')).to.equal(expectUrl);
    expect(element.find('span.label').text()).to.equal('Saved');
  });

  it('should show Save label when mapping watcher is rejected', function() {
    const mapping = { asyncTaskId: '123' };

    inboxLinshareAttachmentSaveActionService.getAttachmentMapping.returns($q.when(mapping));
    inboxLinshareAttachmentSaveActionService.watch.returns($q.reject());

    const element = initComponent();

    expect(element.find('span.label').text()).to.equal('Save');
  });

  describe('when click on', function() {
    beforeEach(function() {
      inboxLinshareAttachmentSaveActionService.getAttachmentMapping.returns($q.when());
    });

    it('should save attachment to LinShare mark label as Saving while waiting', function() {
      inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare.returns($q.defer().promise);

      const element = initComponent();

      element.find('a').click();

      expect(element.find('span.label').text()).to.equal('Saving...');
      expect(inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare).to.have.been.calledWith(attachmentMock);
    });

    it('should show Save label again when it fails to save attachment (error occurs)', function() {
      inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare.returns($q.reject());

      const element = initComponent();

      element.find('a').click();

      expect(element.find('span.label').text()).to.equal('Save');
    });

    it('should show Save label again when it fails to save attachment (no mapping created)', function() {
      inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare.returns($q.when());

      const element = initComponent();

      element.find('a').click();

      expect(element.find('span.label').text()).to.equal('Save');
    });

    it('should show Saved label when attachment is saved to LinShare immediately', function() {
      const mapping = { documentId: '123' };

      linshareApiClient.getDocument.returns($q.when({ documentId: '123' }));
      inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare.returns($q.when(mapping));

      const element = initComponent();

      element.find('a').click();

      expect(element.find('span.label').text()).to.equal('Saved');
    });

    it('should show Saving label and watch the mapping while attachment is being saved', function() {
      const mapping = { asyncTaskId: '123' };

      inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare.returns($q.when(mapping));
      inboxLinshareAttachmentSaveActionService.watch.returns($q.defer().promise);

      const element = initComponent();

      element.find('a').click();

      expect(element.find('span.label').text()).to.equal('Saving...');
      expect(inboxLinshareAttachmentSaveActionService.watch).to.have.been.calledWith(mapping);
    });

    it('should show Saved label and when watcher is resolved', function() {
      const mapping = { asyncTaskId: '123' };

      inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare.returns($q.when(mapping));
      inboxLinshareAttachmentSaveActionService.watch.returns($q.when());

      const element = initComponent();

      element.find('a').click();

      expect(element.find('span.label').text()).to.equal('Saved');
    });

    it('should show Saved button with the link to open file in LinShare when mapping watcher is resolved', function() {
      configMock = 'http://linshare.org';
      const documentId = '456';
      const mapping = { asyncTaskId: '123' };
      const expectUrl = configMock + '#/files/list?fileUuid=' + documentId;

      inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare.returns($q.when(mapping));
      inboxLinshareAttachmentSaveActionService.watch = function() {
        return $q.when(documentId);
      };

      const element = initComponent();

      element.find('a').click();

      expect(element.find('a').attr('target')).to.equal('_blank');
      expect(element.find('a').attr('href')).to.equal(expectUrl);
      expect(element.find('span.label').text()).to.equal('Saved');
    });

    it('should show Save label and when watcher is reject', function() {
      const mapping = { asyncTaskId: '123' };

      inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare.returns($q.when(mapping));
      inboxLinshareAttachmentSaveActionService.watch.returns($q.reject());

      const element = initComponent();

      element.find('a').click();

      expect(element.find('span.label').text()).to.equal('Save');
    });
  });
});
