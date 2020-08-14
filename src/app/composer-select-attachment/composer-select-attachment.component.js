'use strict';

angular.module('linagora.esn.unifiedinbox.linshare')
  .component('inboxLinshareComposerSelectAttachment', {
    template: require('./composer-select-attachment.pug'),
    controller: 'inboxLinshareComposerSelectAttachmentController',
    bindings: {
      email: '<',
      isMobile: '<'
    }
  });
