'use strict';

const _ = require('lodash');

require('../app.constants');

angular.module('linagora.esn.unifiedinbox.linshare')
  .factory('inboxLinsharePresendingHook', function(
    $q,
    session,
    esnI18nService,
    linshareApiClient,
    INBOX_LINSHARE_ATTACHMENT_TYPE,
    INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES
  ) {
    // From esn-frontend-inbox/src/esn.inbox.libs/app/services/send-email/email-sending.service.js
    function getEmailAddress(recipient) {
      if (recipient) {
        return recipient.email || recipient.preferredEmail;
      }
    }

    // From esn-frontend-inbox/src/esn.inbox.libs/app/services/send-email/email-sending.service.js
    function getAllRecipientsExceptSender(email) {
      const sender = session.user;

      return [].concat(email.to || [], email.cc || [], email.bcc || []).filter(function(recipient) {
        return recipient.email !== getEmailAddress(sender);
      });
    }

    return function(email) {
      const documents = _.remove(email.attachments, function(attachment) {
        return attachment.attachmentType === INBOX_LINSHARE_ATTACHMENT_TYPE;
      }).map(function(attachment) {
        return attachment.uuid;
      }).filter(Boolean);
      const recipients = getAllRecipientsExceptSender(email).map(function(recipient) {
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
