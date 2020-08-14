angular
  .module('linagora.esn.unifiedinbox.linshare')
  .factory('linshareConfigurationService', function(esnConfig) {
    return {
      isConfigured
    };

    function isConfigured() {
      return esnConfig('linagora.esn.linshare.instanceURL').then(function(config) {
        return config && config.length > 0;
      });
    }
  });
