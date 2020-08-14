'use strict';

angular.module('linagora.esn.unifiedinbox.linshare')
  .controller('inboxLinshareFilesInserterController', inboxLinshareFilesInserterController);

function inboxLinshareFilesInserterController(onInsert) {
  let self = this;

  self.insert = insert;

  function insert() {
    onInsert(self.selectedNodes);
  }
}
