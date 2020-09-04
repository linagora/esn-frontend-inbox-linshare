'use strict';

require('../../errors/inbox-linshare-errors.service');
require('../../helper/inbox-linshare-helper.service');
require('../../app.constants');

angular.module('linagora.esn.unifiedinbox.linshare')
  .factory('inboxLinshareAttachmentProvider', function(
    $q,
    fileUploadService,
    inboxLinshareErrors,
    inboxLinshareHelper,
    linshareFileUpload,
    notificationFactory,
    DEFAULT_FILE_TYPE,
    INBOX_LINSHARE_ATTACHMENT_TYPE
  ) {
    return {
      name: 'Linshare',
      type: INBOX_LINSHARE_ATTACHMENT_TYPE,
      icon: 'linshare-icon linshare-desktop-icon',
      upload,
      fileToAttachment,
      removeAttachment,
      handleErrorOnUploading
    };

    function upload(attachment) {
      const deferred = $q.defer();
      const uploader = fileUploadService.get(linshareFileUpload);
      const uploadTask = uploader.addFile(attachment.getFile());

      uploadTask.defer.promise.then(function(task) {
        attachment.uuid = task.response.uuid;
        deferred.resolve();
      }, deferred.reject, function(uploadTask) {
        deferred.notify(uploadTask.progress);
      });

      uploader.start();

      return {
        cancel: uploadTask.cancel,
        promise: deferred.promise
      };
    }

    function fileToAttachment(file) {
      return {
        attachmentType: INBOX_LINSHARE_ATTACHMENT_TYPE,
        name: file.name,
        size: file.size,
        type: file.type || DEFAULT_FILE_TYPE,
        isInline: false,
        getFile: function() {
          return file;
        }
      };
    }

    function removeAttachment(email, attachment) {
      const linShareAttachmentUUIDs = inboxLinshareHelper.getLinShareAttachmentUUIDsFromEmailHeader(email);
      const removedAttachmentIndex = linShareAttachmentUUIDs.indexOf(attachment.uuid);

      if (removedAttachmentIndex !== -1) {
        linShareAttachmentUUIDs.splice(removedAttachmentIndex, 1);
      }

      inboxLinshareHelper.setLinShareAttachmentUUIDsToEmailHeader(email, linShareAttachmentUUIDs);
    }

    function handleErrorOnUploading(e) {
      const error = inboxLinshareErrors(e);

      return error && notificationFactory.weakError('Upload failed', error.message);
    }
  });
