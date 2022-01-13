'use strict';

/* global chai: false */
/* global sinon: false */

const expect = chai.expect;

describe('The inboxLinsharePresendingHook service', function() {
  let $q, $rootScope;
  let linshareApiClient, inboxLinsharePresendingHook;
  let linshareAttachment, jmapAttachment;
  let INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES;

  beforeEach(angular.mock.module('linagora.esn.unifiedinbox.linshare'));

  beforeEach(angular.mock.inject(function(
    _$q_,
    _$rootScope_,
    _linshareApiClient_,
    _inboxLinsharePresendingHook_,
    _INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES_
  ) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    inboxLinsharePresendingHook = _inboxLinsharePresendingHook_;
    linshareApiClient = _linshareApiClient_;
    INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES = _INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES_;

    linshareAttachment = {
      uuid: '123',
      name: 'linshareAttachment',
      attachmentType: 'linshare'
    };
    jmapAttachment = {
      blobId: '456',
      name: 'jmapAttachment',
      attachmentType: 'jmap'
    };

    linshareApiClient.shareDocuments = sinon.spy(function() {
      return $q.when();
    });
  }));

  it('should call the LinShare API with only linshare attachments', function() {
    const email = {
      to: [{ email: 'user1@open-paas.org' }],
      attachments: [linshareAttachment, jmapAttachment]
    };

    inboxLinsharePresendingHook(email);
    expect(linshareApiClient.shareDocuments).to.have.been.calledWith({
      documents: [linshareAttachment.uuid],
      recipients: [{ mail: 'user1@open-paas.org' }]
    });
  });

  it('should not call the LinShare API if there is no LinShare attachment', function() {
    const email = {
      to: [{ email: 'user1@open-paas.org' }],
      attachments: [jmapAttachment]
    };

    inboxLinsharePresendingHook(email);
    expect(linshareApiClient.shareDocuments).not.to.have.been.called;
  });

  it('should not call the LinShare API if there is no recipient', function() {
    const email = {
      attachments: [linshareAttachment, jmapAttachment]
    };

    inboxLinsharePresendingHook(email);
    expect(linshareApiClient.shareDocuments).not.to.have.been.called;
  });

  it('should not call the LinShare API with attachments that do not have uuid', function() {
    const linshareAttachmentWithoutUuid = {
      name: 'attachmentWithoutUuid',
      attachmentType: 'linshare'
    };
    const email = {
      to: [{ email: 'user1@open-paas.org' }],
      attachments: [linshareAttachmentWithoutUuid, linshareAttachment, jmapAttachment]
    };

    inboxLinsharePresendingHook(email);
    expect(linshareApiClient.shareDocuments).to.have.been.calledWith({
      documents: [linshareAttachment.uuid],
      recipients: [{ mail: 'user1@open-paas.org' }]
    });
  });

  it('should remove all the attachment with type of linshare from input email ', function() {
    const email = {
      to: [{ email: 'user1@open-paas.org' }],
      attachments: [linshareAttachment, jmapAttachment]
    };

    inboxLinsharePresendingHook(email);
    expect(email.attachments).to.deep.equal([jmapAttachment]);
  });

  it('should append notify message if the email contains LinShare attachment', function() {
    const email = {
      to: [{ email: 'user1@open-paas.org' }],
      attachments: [linshareAttachment, linshareAttachment],
      htmlBody: '<p>email content</p>',
      textBody: 'email content'
    };

    inboxLinsharePresendingHook(email);
    $rootScope.$digest();

    expect(email.htmlBody).to.contain(INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.plural);
    expect(email.textBody).to.contain(INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.plural);
  });

  it('should append notify message even email does not have body', function() {
    const email = {
      to: [{ email: 'user1@open-paas.org' }],
      attachments: [linshareAttachment]
    };

    inboxLinsharePresendingHook(email);
    $rootScope.$digest();

    expect(email.htmlBody).to.equal('<br />' +
      '<p style="font-family: Roboto; font-size: 12px; color: rgba(0,0,0,0.65); text-align: center">' +
        '<i>' + INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.singular + '</i>' +
      '</p>');
    expect(email.textBody).to.equal('\n\n-----------------------------------\n' +
      INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.singular);
  });

  it('should not append notify message if the email does not contain LinShare attachment', function() {
    const email = {
      to: [{ email: 'user1@open-paas.org' }],
      attachments: [jmapAttachment],
      htmlBody: '<p>email content</p>',
      textBody: 'email content'
    };

    inboxLinsharePresendingHook(email);
    $rootScope.$digest();

    expect(email.htmlBody).not.to.contain(INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.plural);
    expect(email.textBody).not.to.contain(INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.plural);
    expect(email.htmlBody).not.to.contain(INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.singular);
    expect(email.textBody).not.to.contain(INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.singular);
  });
});
