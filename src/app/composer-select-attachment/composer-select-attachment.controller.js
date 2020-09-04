'use strict';

const _ = require('lodash');

require('../helper/inbox-linshare-helper.service');
require('../app.constants');

angular.module('linagora.esn.unifiedinbox.linshare')
  .controller('inboxLinshareComposerSelectAttachmentController', inboxLinshareComposerSelectAttachmentController);

function inboxLinshareComposerSelectAttachmentController(
  $modal,
  $scope,
  inboxLinshareHelper,
  INBOX_LINSHARE_ATTACHMENT_TYPE
) {
  const self = this;

  self.$onInit = $onInit;

  function $onInit() {
    self.email.attachments = self.email.attachments || [];
    self.openLinshareFilesBrowser = openLinshareFilesBrowser;
    self.linshareAttachmentsStatus = {};

    $scope.$watch(function() {
      return _.filter(self.email.attachments, { attachmentType: INBOX_LINSHARE_ATTACHMENT_TYPE }).length;
    }, function(newValue) {
      self.linshareAttachmentsStatus.number = newValue;
    });
    $scope.$watch(function() {
      return _.some(self.email.attachments, { status: 'uploading', attachmentType: INBOX_LINSHARE_ATTACHMENT_TYPE });
    }, function(newValue) {
      self.linshareAttachmentsStatus.uploading = newValue;
    });
    $scope.$watch(function() {
      return _.some(self.email.attachments, { status: 'error', attachmentType: INBOX_LINSHARE_ATTACHMENT_TYPE });
    }, function(newValue) {
      self.linshareAttachmentsStatus.error = newValue;
    });
  }

  function openLinshareFilesBrowser() {
    $modal({
      template: require('../files-inserter/inbox-linshare-files-inserter.pug'),
      placement: 'center',
      controllerAs: '$ctrl',
      controller: 'inboxLinshareFilesInserterController',
      locals: {
        onInsert: insertLinshareDocuments
      }
    });
  }

  function insertLinshareDocuments(documents) {
    const linShareAttachmentUUIDs = inboxLinshareHelper.getLinShareAttachmentUUIDsFromEmailHeader(self.email);

    documents.forEach(function(document) {
      const attachment = inboxLinshareHelper.documentToAttachment(document);

      self.email.attachments.push(attachment);

      if (linShareAttachmentUUIDs.indexOf(attachment.uuid) === -1) {
        linShareAttachmentUUIDs.push(attachment.uuid);
      }
    });

    inboxLinshareHelper.setLinShareAttachmentUUIDsToEmailHeader(self.email, linShareAttachmentUUIDs);
  }
}
