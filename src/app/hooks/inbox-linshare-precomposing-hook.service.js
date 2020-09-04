'use strict';

const _ = require('lodash');

require('../helper/inbox-linshare-helper.service');
require('../app.constants');

angular.module('linagora.esn.unifiedinbox.linshare')
  .factory('inboxLinsharePrecomposingHook', function(
    linshareApiClient,
    inboxLinshareHelper,
    INBOX_LINSHARE_ATTACHMENT_TYPE
  ) {
    return function(email) {
      const linShareAttachmentUUIDs = inboxLinshareHelper.getLinShareAttachmentUUIDsFromEmailHeader(email);

      if (!linShareAttachmentUUIDs.length) {
        return;
      }

      linShareAttachmentUUIDs.forEach(function(uuid) {
        const documentToAttach = {
          uuid: uuid,
          attachmentType: INBOX_LINSHARE_ATTACHMENT_TYPE,
          status: 'loading'
        };

        _fetchLinShareDocument(documentToAttach);

        email.attachments.push(documentToAttach);
      });
    };

    function _fetchLinShareDocument(document) {
      linshareApiClient.getDocument(document.uuid)
        .then(function(linShareDocument) {
          _.assign(document, inboxLinshareHelper.documentToAttachment(linShareDocument));
        })
        .catch(function() {
          document.status = 'load-error';
        });
    }
  });
