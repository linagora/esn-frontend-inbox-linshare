'use strict';

angular.module('linagora.esn.unifiedinbox.linshare')
  .component('inboxLinshareAttachmentSaveAction', {
    templateUrl: require('./inbox-linshare-attachment-save-action.pug'),
    controller: 'inboxLinshareAttachmentSaveActionController',
    bindings: {
      attachment: '<'
    }
  });
