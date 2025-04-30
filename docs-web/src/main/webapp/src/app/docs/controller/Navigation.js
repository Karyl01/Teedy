'use strict';

/**
 * Navigation controller.
 */
angular.module('docs').controller('Navigation', function($scope, $state, $stateParams, $rootScope, User, Restangular) {
  User.userInfo().then(function(data) {
    $rootScope.userInfo = data;
    if (data.anonymous) {
      if($state.current.name !== 'login') {
        $state.go('login', {
          redirectState: $state.current.name,
          redirectParams: JSON.stringify($stateParams),
        }, {
          location: 'replace'
        });
      }
    }
  });

  /**
   * User logout.
   */
  $scope.logout = function($event) {
    // 新增：向5173端口发送登出通知
    Restangular
    .withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl('http://localhost:5173');
    })
    .all('logout-notify')
    .customPOST({
      username: $rootScope.userInfo.username,
      timestamp: new Date().toISOString()
    });
  
    
    User.logout().then(function() {
      User.userInfo(true).then(function(data) {
        $rootScope.userInfo = data;
      });
      $state.go('main');
    });
    $event.preventDefault();
  };
});