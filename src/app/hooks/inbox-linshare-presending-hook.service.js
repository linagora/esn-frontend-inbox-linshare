'use strict';

const _ = require('lodash');

require('../app.constants');

angular.module('linagora.esn.unifiedinbox.linshare')
  .factory('inboxLinsharePresendingHook', function(
    $q,
    esnI18nService,
    linshareApiClient,
    emailSendingService,
    INBOX_LINSHARE_ATTACHMENT_TYPE,
    INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES
  ) {
    return function(email) {
      const documents = _.remove(email.attachments, function(attachment) {
        return attachment.attachmentType === INBOX_LINSHARE_ATTACHMENT_TYPE;
      }).map(function(attachment) {
        return attachment.uuid;
      }).filter(Boolean);
      const recipients = emailSendingService.getAllRecipientsExceptSender(email).map(function(recipient) {
        return { mail: recipient.email };
      });

      if (!documents.length || !recipients.length) {
        return $q.when();
      }

      const message = documents.length > 1 ?
        esnI18nService.translate(INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.plural, documents.length).toString() :
        esnI18nService.translate(INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.singular).toString();

      const htmlMessage =
        '<br />' +
        '<p style="font-family: Roboto; font-size: 12px; color: rgba(0,0,0,0.65); text-align: center">' +
          '<i>' + message + '</i>' +
        '</p>';
      const textMessage = '\n\n-----------------------------------\n' + message;

      return linshareApiClient.shareDocuments({
        documents: documents,
        recipients: recipients
      }).then(function() {
        email.htmlBody = email.htmlBody ? email.htmlBody += htmlMessage : htmlMessage;
        email.textBody = email.textBody ? email.textBody += textMessage : textMessage;
      });
    };
  });
