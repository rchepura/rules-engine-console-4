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
            'click .remove-device': "removeDevice",
            'click .remove-key': "removeKey",
            'click .list-row': "selectListRow",
            'click .tab-row-collaps': "openDetails",
            'click #id-search-device-btn-search': "onSearch",
            'click span.icon-search-reset': "onSearchReset",
            'click .js-del-device': "removeDevice",
            'click .js-save-device': "saveDevice",
            'click .add-device-key': "addKeyDevice"
        },
        openDetails: function(e) {
            var me = this,
                $elem = $(e.currentTarget).closest('.tab-row'),
                template;
            
            me.closeNewDevice();
        
            if ( !$elem.hasClass('active') ) {
                $elem.parent().find('> .active .exp-col-edit').hide();
                $elem.parent().find('> .active .exp-col-read').show();
                $elem.parent().find('> .active').removeClass('active').find('.tab-box').slideUp('fast');
                
                template = $(_.template($('#templateDeviceDetailsView').html(), {model: (me.AllDevices[$elem.attr('did')] || {})}));
                $elem.find('.tab-box').html(template);
                
                $elem.addClass('active').find('.tab-box').slideDown('fast');
                $elem.find('.exp-col-edit').show();
                $elem.find('.exp-col-read').hide();
            } else {
                $elem.find('.exp-col-edit').hide();
                $elem.find('.exp-col-read').show();
                $elem.removeClass('active').find('.tab-box').slideUp('fast', function() {
                    me.$el.find('.tab-box').empty();
                });
            }
        },
        addKeyDevice: function(e) {
            var me = this,
                $currRow =  $(e.currentTarget).closest('.tab-box').find('.js-new-data'),
                keyText = $.trim($currRow.find('input').val()),
                $cpKeyRow;
            
            if ( $currRow.find('input').validationEngine('validate') ) {
                $cpKeyRow = $currRow.clone().toggleClass('js-new-data js-data-row');
                $cpKeyRow.find('div').first().empty().addClass('js-data-key').text(keyText);
                $cpKeyRow.find('select').get(0).selectedIndex =  $currRow.find('select').get(0).selectedIndex;
                $cpKeyRow.find('div').last().append('<span class="remove-key">X</span>');
                $currRow.before($cpKeyRow);
                $currRow.find('input').val('');
                $currRow.find('select').get(0).selectedIndex = 0;
            }
        },
        removeKey: function(e) {
            var me = this,
                $elem = $(e.currentTarget);        
            
            $elem.closest('.key-row').remove();
        },
        closeNewDevice: function() {
            var me = this,
                $elem = me.$el.find('.js-new-device');
            
            if ( $elem.hasClass('active') ) {
                $elem.find('.tab-box').slideUp('fast', function() {
                    $elem.remove();
                });
            }
        },
        onSearch: function() {
            var me = this,
                strSearch = $.trim(me.$el.find('input#id-search-device').val()).toLowerCase(),
                res = [];

            if ( me.AllDeviceList ) {

                if ( '' !== strSearch ) {
                    for ( var i = 0, len = me.AllDeviceList.length; i < len; i++ ) {
                        if ( 0 === (me.AllDeviceList[i].name || '').toLowerCase().indexOf(strSearch) ) {
                            res.push(me.AllDeviceList[i]);
                        }
                    }
                } else {
                    res = me.AllDeviceList;
                }
                me.render(res);
            }
        },
        onSearchReset: function() {
            var me = this;

            me.$el.find('input#id-search-device').val('');
            me.render(me.AllDeviceList);
        },
        selectListRow: function(e) {
            var me = this,
                $elem = $(e.currentTarget),
                $elParent = $elem.parent(),
                $cKeys = me.$el.find('.new-device-container .capability-keys').empty(),
                itemId = $elem.attr('did'),
                cData = {};
            
            if ( !$elem.hasClass('active') ) {
                $elParent.find('.list-row.active').removeClass('active');
                $elem.addClass('active');
                $elParent.find('.remove-device').attr('disabled', false);
                if ( me.AllDevices[itemId] ) {
                    me.$el.find('.new-device-container .new-window-box').fadeIn();
                    cData = me.AllDevices[itemId];
                    
                    $('#device-name').text(cData.name);
                    
                    $cKeys.html(_.template($('#templateCapabilityKeysView').html(), {data: (cData.capability || {}) }));
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
            var me = this,
                template = $(_.template($('#templateDeviceView').html(), {data: [{name: ''}]}));
            
            me.$el.find('.js-new-device').remove();
            
            template.addClass('js-new-device');
            
            me.$el.find('.content-device-list').prepend(template);
            me.$el.find('.content-device-list .js-new-device .tab-row-collaps').click();
        },
        onAddDeviceOLD: function(e) {
            var me = this,
                modalNewDevice = $('#new-device'),
                keysBox = modalNewDevice.find('.capability-keys').empty();

            keysBox.append(_.template($('#templateCapabilityKeyView').html(), {}));
            keysBox.off().on('click', '.remove-capability', function() {
                $(this).closest('.form-group').remove();
            });
            modalNewDevice.find('.add-capability').off().on('click', function() {
                keysBox.append(_.template($('#templateCapabilityKeyView').html(), {}));
            });
            $('#new-device').modal('show');
        },
        getDevices: function(cb) {
            var me = this,
                device = new me.Model();

            me.AllDevices = {};
            me.AllDeviceList = [];
            
            Util.showSpinner();
            device.fetch({
                url: 'api/dtcontroller/device/type',
                success: function(model, res) {
                    if ( res && false !== res.success ) {
                        me.AllDeviceList = res || [];
                        
                        me.AllDeviceList.forEach(function(item) {
                            me.AllDevices[item.name] = item;
                        });
                        
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
        saveDevice: function(e) {
            var me = this,
                $elem = $(e.currentTarget),
                deviceName = $elem.attr('did'),
                $parent = $elem.closest('.tab-row'),
                model = new me.Model(),
                data = {},
                loc = 'api/dtcontroller/device/type';
            
                if ( !$parent.find('input.js-select-edit-device-title').validationEngine('validate') ) {
//                    Alerts.Error.display({title: 'Error', content: "Device name cannot be empty"});
                    return false;
                }
                
                if ( deviceName ) {
                    loc += '/' + deviceName;
                } else {
                    data.id = 1;
                }
                data.name = $.trim($parent.find('input.js-select-edit-device-title').val());
                data.created = (new Date().getTime());
                data.capability = {};
                
                $parent.find('.device-details-list .js-data-row').each(function() {
                    var cKey = $.trim($(this).find('.js-data-key').text()),
                        cVal = $.trim($(this).find('select').val());
                    if ( cKey  ) {
                        data.capability[cKey] = cVal;
                    }
                });

                
                
//                top.DEVICESSDATA = data; return;
                
            me.showLoader();
            
            model.save(data, {
                url: loc,
                dataType: 'text',
                success: function (model, res) {
                    me.hideLoader();
                    if ( res && /SUCCESS/.test(res) ) {
                        me.getDevices(function(devices) {
                            me.render(devices);
                        });
                        me.$el.find('.new-device-container .new-window-box').fadeOut();
                        $('#new-device').modal('hide');
                    } else {
                        Alerts.Error.display({title: 'Error', content: 'Failed during save Davice Type (' + res + ')'});
                    }
                },
                error: function () {
                    Alerts.Error.display({title: 'Error', content: "Failed during save Davice Type"});
                    me.hideLoader();
                }
            });
            return false;
        },
        removeDevice: function(e) {
            var me = this,            
                model = new me.Model({id: 'del'}),
                $elem = $(e.currentTarget),
                deviceTypeName = $elem.attr('did');
        
            if ( deviceTypeName ) {
                Util.showSpinner();
                model.destroy({
                    url: 'api/dtcontroller/device/type/' + deviceTypeName,
                    complete: function(res) {
                        if ( 200 == (res || {}).status ) {
                            me.getDevices(function(devices) {
                                me.render(devices);
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
                template = _.template($('#templateDevicesView').html(), {data: devices}),
                $deviceSelect = $('#new-action .new-action-container select[name="deviceType"]').empty();

            me.$el.find('.new-device-container .new-window-box').fadeOut();

            _.each(devices, function (model, key) {
                $deviceSelect.append('<option value="' + model.name + '">' + model.name + '</option>');
            });
            
            me.$el.find('.devices-container .item-list').html(template);
            $deviceSelect.on('change', function() {
                me.renderNewActionDeviceTypes($(this).val());
            });
            me.renderNewActionDeviceTypes($deviceSelect.val());
        },
        renderNewActionDeviceTypes: function(deviceType) {
            var me = this,                
                template = _.template($('#templateActionDeviceTypeFormView').html(), {model: me.AllDevices[deviceType] || {}});            
            
            $('#new-action .new-action-container .action-device-type-pane').html(template);
        },
        render: function(data) {
            var me = this,
                template = $(_.template($('#templateDeviceView').html(), {data: data}));
            
            me.$el.find('.content-device-list').html(template);
        },
        init: function() {
            var me = this;
            
            me.getDevices(function(devices) {
                me.render(devices);
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