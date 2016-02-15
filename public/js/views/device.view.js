define(['jquery', 'backbone', 'moment'], function($, Backbone, Moment) {
    return Backbone.View.extend({
        el: '#id-devices-container',
        Model: Backbone.Model.extend({urlRoot : 'api'}),
        moment: Moment,
        initialize: function() {
            var me = this;
            
            window.DEVICE_VIEW = me;

            me.options.eventPubSub.bind("initDevice", function() {
                me.init();
            });
            $('#new-device .save-device').off().on('click', function(e) {
                me.saveDevice(e);
            });
        },
        events: {
            'click .add-device': "onAddDevice",
            'click .update-device': "onUpdateDevice",
            'click .remove-device': "removeDevice",
            'click .list-row': "selectListRow"
        },
        selectListRow: function(e) {
            var me = this,
                $elem = $(e.currentTarget),
                $elParent = $elem.parent(),
                itemId = $elem.attr('did'),
                cData = {};
            
            if ( !$elem.hasClass('active') ) {
                $elParent.find('.list-row.active').removeClass('active');
                $elem.addClass('active');
                $elParent.find('.remove-device').attr('disabled', false);
                if ( me.AllDevices[itemId] ) {
                    me.$el.find('.new-device-container .new-window-box').fadeIn();
                    cData = me.AllDevices[itemId];
                    $('#device-name').val(cData.name);
                    if ( 'NO' == (cData.capability || {}).Storage ) {
                        $('#device-Storage').get(0).selectedIndex = 1;
                    }
                    if ( 'NO' == (cData.capability || {}).Recording ) {
                        $('#device-Recording').get(0).selectedIndex = 1;
                    }
                }
                
            } else {
                $elem.removeClass('active');
                $elParent.find('.remove-device').attr('disabled', true);
                
                if ( me.AllDevices[itemId] ) {
                    me.$el.find('.new-device-container .new-window-box').fadeOut();
                }
            }
        },
        onAddDevice: function(e) {
            var me = this;

            $('#new-device').modal('show');
        },
        getDevices: function(cb) {
            var me = this,
                device = new me.Model();
            
            Util.showSpinner();
            device.fetch({
                url: 'api/dtcontroller/device/type',
                success: function(model, res) {
                    if ( res && false !== res.success ) {
                        me.currDevices = res || [];
                        if ( cb ) {
                            cb(res || []);
                        }
                    } else {
                        Alerts.Error.display({
                            title: 'Error',
                            content: 'Authorization Failed.'
                        });
//                        Backbone.history.navigate('#/logout');
                    }
                },
                complete: function(res) {
                    if ( 401 == (res || {}).status ) {
                        Alerts.Error.display({
                            title: 'Error',
                            content: 'Authorization Failed.'
                        });
//                        Backbone.history.navigate('#/logout');
                    }
                    Util.hideSpinner();
                }
            });
        },
        saveDevice: function(e, update) {
            var me = this,
                $elem = $(e.currentTarget),
                $parent = $elem.closest('.new-device-container'),
                model = new me.Model(),
                data = {
                    name: $.trim($parent.find('input[name="name"]').val()), 
                    capability: {
                        Storage: $parent.find('select[name="Storage"]').val(),
                        Recording: $parent.find('select[name="Recording"]').val()
                    }
                },
                loc = 'api/dtcontroller/device/type';
                
                
                if ( !update ) {
                    data.id = 1;
                } else {
                    loc += '/' + data.name;
                }
                
                top.DEVICESSDATA = data;
                
                if ( !data.name ) {
                    Alerts.Error.display({title: 'Error', content: "Device name cannot be empty"});
                    return;
                }
                
            me.showLoader();
            
            model.save(data, {
                url: loc,
                dataType: 'text',
                success: function (model, res) {
                    me.hideLoader();
                    if ( res && /SUCCESS/.test(res) ) {
                        me.getDevices(function(devices) {
                            me.renderDevices(devices);
                        });
                        me.$el.find('.new-device-container .new-window-box').fadeOut();
                    } else {
                        Alerts.Error.display({title: 'Error', content: "Failed during create Rule"});
                    }
                },
                error: function () {
                    Alerts.Error.display({title: 'Error', content: "Failed during generate report"});
                    me.hideLoader();
                }
            });
            return false;
        },
        onUpdateDevice: function(e) {
            var me = this;
            me.saveDevice(e, true);
        },
        removeDevice: function(e) {
            var me = this,            
                model = new me.Model({id: 'del'}),
                $elem = $(e.currentTarget),
                $container = $elem.closest('.item-list'),
                deviceTypeName = $container.find('.list-row.active').attr('did');
        
            if ( deviceTypeName ) {
                Util.showSpinner();
                model.destroy({
                    url: 'api/dtcontroller/device/type/' + deviceTypeName,
                    complete: function(res) {
                        if ( 200 == (res || {}).status ) {
                            me.getDevices(function(devices) {
                                me.renderDevices(devices);
                            });
                        } else {
                            Alerts.Error.display({
                                title: 'Error',
                                content: 'Failed Delete'
                            });
                        }
                        Util.hideSpinner();
                    }
                });
            }       
        },
        renderDevices: function(devices) {
            var me = this,
                template = _.template($('#templateDevicesView').html(), {data: devices});

            me.$el.find('.new-device-container .new-window-box').fadeOut();
            me.AllDevices = {};

            _.each(devices, function (model, key) {
                me.AllDevices[model.name] = model;
            });
            
            me.$el.find('.devices-container .item-list').html(template);
        },
        init: function() {
            var me = this;
            
            me.getDevices(function(devices) {
                me.renderDevices(devices);
            });
        },
        showLoader: function() {
            Util.showSpinner();
        },
        hideLoader: function() {
            Util.hideSpinner();
        }
    });
});