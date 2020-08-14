'use strict';

const _ = require('lodash');

angular.module('linagora.esn.unifiedinbox.linshare')
  .factory('inboxLinshareErrors', function() {
    const LINSHARE_ERRORS = [
      {
        status: 403,
        errCode: 46010,
        message: 'Your attachment size reaches the LinShare limitation'
      },
      {
        status: 403,
        errCode: 46011,
        message: 'Your LinShare account\'s quota has been reached'
      }
    ];

    return function(error) {
      return error.data && _.find(LINSHARE_ERRORS, function(e) {
        return e.status === error.status &&
          e.errCode === error.data.errCode;
      });
    };
  });
