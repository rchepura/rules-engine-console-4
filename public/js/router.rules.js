define(['jquery', 'backbone', 'views.rules/login.view', 'views.rules/main.view', 'views.rules/rule.view', 'views.rules/action.view', "views.rules/alert.general.view", "views.rules/alert.confirm.view", "views.rules/alert.error.view"],
    function($, Backbone, LoginView, MainView, RuleView, ActionView, AlertGeneralView, AlertConfirmView, AlertErrorView) {
        // bind alerts
        Alerts.General = new AlertGeneralView();
        Alerts.Confirm = new AlertConfirmView();
        Alerts.Error = new AlertErrorView();
        // login router
        var Router = Backbone.Router.extend({
            clientData: {},
            initialize: function() {
                var me = this;
                $.browser = {msie: (navigator.appName == 'Microsoft Internet Explorer') ? true : false};
                $('input, textarea').val('');
                $('#branding-logo').on('click', function() {
                    Backbone.history.navigate('#/main');
                });
                
                this.eventPubSub = _.extend({}, Backbone.Events);
                
                
                new LoginView({eventPubSub: this.eventPubSub});
                new MainView({eventPubSub: this.eventPubSub});
                new RuleView({eventPubSub: this.eventPubSub});
                new ActionView({eventPubSub: this.eventPubSub});
                
                Backbone.history.start();
            },
            routes: {
                ''                  : 'main',
                'main'              : 'main',
                'logout'            : 'logout',
                '*notFound'         : 'main'
            },
            main: function() {
                var me = this;
                me.auth(function() {
                    if ( '/main' != Backbone.history.getHash() ) {
                        Backbone.history.navigate('#/main');
                    } else {
                        me.eventPubSub.trigger("initMain");
                    }
                });
            },
            auth: function(callback) {
                var me = this,
                    userInfo = JSON.parse($.cookie('UserInfo'));

                callback();
                return;
                if ( !userInfo ) {
//                    $('#id-user').text('');
//                    $('.wrapper-login').show();
//                    $('#id-estee-signout').hide();
//                    $('#id-estee-wrapper').hide();
                } else {
//                    $('#id-user').text('Hello, ' + userInfo.firstName + ' ' + userInfo.lastName + ',');
//                    $('.wrapper-login').hide();
//                    $('#id-estee-signout').show();
//                    $('#id-estee-wrapper').fadeIn('fast');
                }
            },
            logout: function() {
                Util.showSpinner();
                $.ajax({
                    url: 'logout',
                    dataType: 'json',
                    type: 'GET',
                    complete: function (data) {
                        Util.hideSpinner();
                        $.removeCookie('UserInfo');
                        Backbone.history.navigate('#/main');
                    }
                });
            }
        });
        return Router;
    });
    var Alerts = {};