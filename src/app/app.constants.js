angular.module('linagora.esn.unifiedinbox.linshare')
  .constant('INBOX_LINSHARE_ATTACHMENT_TYPE', 'linshare')
  .constant('INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES', {
    plural: 'This email contains %s LinShare attachments.',
    singular: 'This email contains a LinShare attachment.'
  })
  .constant('INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL', 1000)
  .constant('INBOX_LINSHARE_ATTACHMENT_MAPPING_STATUS', {
    checking: 'checking',
    not_saved: 'not_saved',
    saving: 'saving',
    saved: 'saved',
    error: 'error'
  });
