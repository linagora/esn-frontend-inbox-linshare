'use strict';

angular.module('linagora.esn.unifiedinbox.linshare')

.factory('inboxLinshareRestangular', function(Restangular, httpErrorHandler) {
  return Restangular.withConfig(function(RestangularConfigurer) {
    RestangularConfigurer.setFullResponse(true);
    RestangularConfigurer.setBaseUrl('/linagora.esn.unifiedinbox.linshare/api');
    RestangularConfigurer.setErrorInterceptor(function(response) {
      if (response.status === 401) {
        httpErrorHandler.redirectToLogin();
      }

      return true;
    });
  });
});
