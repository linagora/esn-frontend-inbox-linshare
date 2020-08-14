'use strict';

require('./inbox-linshare-restangular.service');

angular.module('linagora.esn.unifiedinbox.linshare')
  .factory('inboxLinshareApiClient', function(inboxLinshareRestangular) {
    const API_PATH = 'attachments';

    return {
      createAttachment,
      getAttachments,
      updateAttachment
    };

    function createAttachment(data) {
      return inboxLinshareRestangular.all(API_PATH).post({
        blobId: data.blobId,
        asyncTaskId: data.asyncTaskId,
        documentId: data.documentId
      }).then(_stripAndReturnData);
    }

    function getAttachments(options) {
      return inboxLinshareRestangular.all(API_PATH).getList(options).then(_stripAndReturnData);
    }

    function updateAttachment(id, updateFields) {
      return inboxLinshareRestangular.one(API_PATH, id).customPOST(updateFields);
    }

    function _stripAndReturnData(resp) {
      return inboxLinshareRestangular.stripRestangular(resp.data);
    }
  });
