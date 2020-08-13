angular.module('linagora.esn.unifiedinbox.linshare', [
  'restangular',
  'esn.async-action',
  'esn.http',
  'esn.background',
  'esn.core',
  'esn.file',
  'esn.i18n',
  'esn.lodash-wrapper',
  'esn.configuration',
  'linagora.esn.unifiedinbox',
  'linagora.esn.linshare'
]);

require('esn-frontend-common-libs/src/frontend/js/modules/async-action');
require('esn-frontend-common-libs/src/frontend/js/modules/background');
require('esn-frontend-common-libs/src/frontend/js/modules/core');
require('esn-frontend-common-libs/src/frontend/js/modules/file');
require('esn-frontend-common-libs/src/frontend/js/modules/http');
require('esn-frontend-common-libs/src/frontend/js/modules/i18n/i18n.module');
require('esn-frontend-common-libs/src/frontend/js/modules/lodash-wrapper');

require('./app.constants');
require('./app.run');
require('./attachment/provider/inbox-linshare-attachment-provider.service')
require('./attachment/save-action/inbox-linshare-attachment-save-action.component');
require('./attachment/save-action/inbox-linshare-attachment-save-action.controller');
require('./attachment/save-action/inbox-linshare-attachment-save-action.service');
require('./common/inbox-linshare-api-client.service');
require('./common/inbox-linshare-restangular.service');
require('./composer-select-attachment/composer-select-attachment.component')
require('./composer-select-attachment/composer-select-attachment.controller');
require('./configuration/linshare-configuration.service');
require('./errors/inbox-linshare-errors.service');
require('./files-inserter/inbox-linshare-files-inserter.controller');
require('./helper/inbox-linshare-helper.service');
require('./hooks/inbox-linshare-precomposing-hook.service')
require('./hooks/inbox-linshare-presending-hook.service')
