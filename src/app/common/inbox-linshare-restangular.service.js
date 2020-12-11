'use strict';

angular.module('linagora.esn.unifiedinbox.linshare')

  .factory('inboxLinshareRestangular', function(Restangular, httpConfigurer, httpErrorHandler) {
    const apiBaseUrl = '/linagora.esn.unifiedinbox.linshare/api';

    const restangularInstance = Restangular.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setFullResponse(true);
      RestangularConfigurer.setBaseUrl(apiBaseUrl);
      RestangularConfigurer.setErrorInterceptor(function(response) {
        if (response.status === 401) {
          httpErrorHandler.redirectToLogin();
        }

        return true;
      });
    });

    httpConfigurer.manageRestangular(restangularInstance, apiBaseUrl);

    return restangularInstance;
  });
