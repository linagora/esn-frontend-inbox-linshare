'use strict';

/* global chai: false */

let expect = chai.expect;

describe('The inboxLinshareComposerSelectAttachmentController', function() {
  let $rootScope, $scope, $controller;
  let $modalMock, onInsertMock;

  beforeEach(function() {
    angular.mock.module('linagora.esn.unifiedinbox.linshare');

    angular.mock.module(function($provide) {
      $modalMock = function(options) {
        onInsertMock = options.locals.onInsert;
      };

      $provide.value('$modal', $modalMock);
    });

    angular.mock.inject(function(_$rootScope_, _$controller_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
    });
  });

  function initController(scope) {
    $scope = scope || $rootScope.$new();

    let controller = $controller('inboxLinshareComposerSelectAttachmentController', { $scope: $scope }, { email: {} });

    $scope.$digest();

    controller.$onInit();

    return controller;
  }

  describe('The #insertLinshareDocuments function', function() {
    it('should update LinShareAttachmentsUUIDs list', function() {
      let controller = initController();
      let attachments = [{
        attachmentType: 'linshare',
        uuid: 'attachment1'
      }, {
        attachmentType: 'linshare',
        uuid: 'attachment2'
      }];

      controller.openLinshareFilesBrowser();

      onInsertMock(attachments);

      expect(controller.email).to.shallowDeepEqual({
        headers: {
          LinShareAttachmentUUIDs: 'attachment1,attachment2'
        },
        attachments: attachments
      });
    });
  });
});
