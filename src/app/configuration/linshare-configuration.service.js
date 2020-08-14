angular
  .module('linagora.esn.unifiedinbox.linshare')
  .factory('linshareConfigurationService', linshareConfigurationService);

function linshareConfigurationService(esnConfig) {
  return {
    isConfigured: isConfigured
  };

  function isConfigured() {
    return esnConfig('linagora.esn.linshare.instanceURL').then(function(config) {
      return config && config.length > 0;
    });
  }
}
