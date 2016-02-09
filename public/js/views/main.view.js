define(['jquery', 'backbone', 'moment'], function($, Backbone, Moment) {
    return Backbone.View.extend({
        el: '#id-rules-wrapper',
        Model: Backbone.Model.extend({urlRoot : 'api'}),
        moment: Moment,
        initialize: function() {
            var me = this;
            
            window.MAIN_VIEW = me;

            me.options.eventPubSub.bind("initMain", function() {
                me.init();
            });
            
            $('#new-rule .save-rule').off().on('click', function(e) {
                me.saveRule(e);
            });
            $('#new-action .save-action').off().on('click', function(e) {
                me.saveAction(e);
            });
            
//            me.$el.find('input[name="timeCreated"]').datepick({
//                inline: true,
////                showOnFocus: false,
////                showTrigger: '<img src="images/assets/ic_calendar.png" class="datepick-trigger exp-col-edit">',
////                minDate: new Date(),
//                onSelect: function (date) {
//                    me.$el.find('input[name="timeCreated"]').val($.datepick.formatDate("mm/dd/yyyy", date[0]));
//                }
//            });
        },
        events: {
            'click .add-rule': "onAddRule",
            'click .remove-rule': "removeRule",
            'click .add-action': "onAddAction",
            'click .remove-action': "removeAction",
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
                $elParent.find('.remove-rule, .remove-action').attr('disabled', false);

                if ( me.AllRules[itemId] ) {
//                    me.$el.find('.new-action-container .new-window-box').fadeOut();
                    me.$el.find('.new-rule-container .new-window-box').fadeIn();
                    cData = me.AllRules[itemId];
                    for ( var d in cData ) {
                        if ( 'action' == d ) {
                            for ( var a in cData[d] ) {
                                $('#rule-action-' + a).text(cData[d][a]);
                            }
                        } else {
                            if ( 'conditionJexl' == d ) {
                                $('#rule-' + d).text(unescape(cData[d]));
                            } else {
                                $('#rule-' + d).text(cData[d]);
                            }
                        }
                    }
                    
                } else if ( me.AllActions[itemId] ) {
//                    me.$el.find('.new-rule-container .new-window-box').fadeOut();
                    me.$el.find('.new-action-container .new-window-box').fadeIn();
                    cData = me.AllActions[itemId];
                    for ( var d in cData ) {
                        $('#action-' + d).text(cData[d]);
                    }
                }
                
            } else {
                $elem.removeClass('active');
                $elParent.find('.remove-rule, .remove-action').attr('disabled', true);
                
                if ( me.AllRules[itemId] ) {
                    me.$el.find('.new-rule-container .new-window-box').fadeOut();
                } else if ( me.AllActions[itemId] ) {
                    me.$el.find('.new-action-container .new-window-box').fadeOut();
                }
            }
        },
        onAddRule: function(e) {
            var me = this;
            
            $('#new-rule').modal('show');
//            me.$el.find('.new-rule-container .new-window-box').fadeIn();
        },
        addRule: function(text) {
            var me = this,
                $container = me.$el.find('.rules-container .item-list'),
                listSize = $container.find('.list-row').length;
        
            if ( 0 !== listSize ) {
                $container.find('.list-row').last().after(_.template($('#templateRoleRow').html(), {model: {title: text}}));
            } else {
                $container.prepend(_.template($('#templateRoleRow').html(), {model: {title: text}}));
            }
        },
        getRules: function(cb) {
            var me = this,
                rule = new me.Model();
            
            Util.showSpinner();
            rule.fetch({
                url: 'api/rules/rules',
                success: function(model, res) {
                    if ( res && false !== res.success ) {
                        me.currRules = res || [];
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
        getActions: function(cb) {
            var me = this,
                rule = new me.Model();
            
            Util.showSpinner();
            rule.fetch({
                url: 'api/rules/actions',
                success: function(model, res) {
                    if ( res && false !== res.success ) {
                        me.currRules = res || [];
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
        saveRule: function(e) {
            var me = this,
                $elem = $(e.currentTarget),
                $parent = $elem.closest('.modal-content'),
                $inputFields = $parent.find('input.rule-field'),
                $inputActionFields = $parent.find('.rule-action-pane input'),
                model = new me.Model(),
                data = {};
                
                $inputFields.each(function() {
                    var $this = $(this);
                    data[$this.attr('name')] = $.trim($this.val());
                });
                data.action = {};
                $inputActionFields.each(function() {
                    var $this = $(this);
                    
                    if ( 'checkbox' == $this.attr('type') ) {
                        data.action[$this.attr('name')] = $this.get(0).checked;
                    } else {
                        data.action[$this.attr('name')] = $.trim($this.val());
                    }
                });
                
                data.conditionJexl = escape($('code.condition-jexl').text());
                
                top.RULESDATA = data;
                
                if ( !data.ruleName ) {
                    Alerts.Error.display({title: 'Error', content: "Rule name cannot be empty"});
                    return;
                }
                
            me.showLoader();
            
            model.save(data, {
                url: 'api/rules/rule',
                success: function (model, res) {
                    me.hideLoader();
                    if ( _.isObject(res) ) {
                        if ( !_.isEmpty(res) ) {
                            me.getRules(function(rules) {
                                me.renderRules(rules);
                            });
                            me.$el.find('.new-rule-container .new-window-box').fadeOut();
                        } else {
                            Alerts.Error.display({title: 'Error', content: "Failed during create Rule"});
                        }
                    }
                },
                error: function () {
                    Alerts.Error.display({title: 'Error', content: "Failed during generate report"});
                    me.hideLoader();
                }
            });
            return false;
        },
        removeRule: function(e) {
            var me = this,            
                model = new me.Model({id: 'del'}),
                $elem = $(e.currentTarget),
                $container = $elem.closest('.item-list'),
                ruleID = $container.find('.list-row.active').attr('did');
        
            if ( ruleID ) {
                Util.showSpinner();
                model.destroy({
                    url: 'api/rules/rule/' + ruleID,
                    complete: function(res) {
                        if ( 200 == (res || {}).status ) {
                            me.getRules(function(rules) {
                                me.renderRules(rules);
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
        onAddAction: function(e) {
            var me = this;

            $('#new-action').modal('show');
//            me.$el.find('.new-action-container .new-window-box').fadeIn();
        },
        saveAction: function(e) {
            var me = this,
                $elem = $(e.currentTarget),
                $inputFields = $elem.closest('.modal-content').find('input'),
                model = new me.Model(),
                data = {};
                
                $inputFields.each(function() {
                    var $this = $(this);
                    
                    if ( 'checkbox' == $this.attr('type') ) {
                        data[$this.attr('name')] = $this.get(0).checked;
                    } else {
                        data[$this.attr('name')] = $.trim($this.val());
                    }                    
                });
                
                data.timeCreated = (new Date()).getTime();
                
                top.NEW_ACTION_DATA = data;
                
                
                if ( !data.actionTemplateName ) {
                    Alerts.Error.display({title: 'Error', content: "Rule Action Name cannot be empty"});
                    return;
                }
                
//                data = {
////                    "actionTemplateName" : "Camera Action Template",
//                    "actionTemplateName" : ruleActionName,
//                    "actionTemplateDescription" : "this is camera card template",
//                    "type" : "GAMERA",
//                    "push" : true,
//                    "pushPayload" : "this is test card push",
//                    "expirationHour" : 20,
//                    "expirationMin" : 0,
//                    "expirationDays" : 0
//                };
 
            me.showLoader();
            
            model.save(data, {
                url: 'api/rules/action',
                success: function (model, res) {
                    me.hideLoader();
                    if ( _.isObject(res) ) {
                        if ( !_.isEmpty(res) ) {
                            me.getActions(function(actions) {
                                me.renderActions(actions);
                            });
                            me.$el.find('.new-action-container .new-window-box').fadeOut();
                        } else {
                            Alerts.Error.display({title: 'Error', content: "Failed during create Rule"});
                        }
                    }
                },
                error: function () {
                    Alerts.Error.display({title: 'Error', content: "Failed during generate report"});
                    me.hideLoader();
                }
            });
            return false;

        },
        addAction: function(text) {
            var me = this,
                $container = me.$el.find('.actions-container .item-list'),
                listSize = $container.find('.list-row').length;
        
            if ( 0 !== listSize ) {
                $container.find('.list-row').last().after(_.template($('#templateActionRow').html(), {model: {title: text}}));
            } else {
                $container.prepend(_.template($('#templateActionRow').html(), {model: {title: text}}));
            }
        },
        removeAction: function(e) {            
            var me = this,            
                model = new me.Model({id: 'del'}),
                $elem = $(e.currentTarget),
                $container = $elem.closest('.item-list'),
                actionID = $container.find('.list-row.active').attr('did');
        
            if ( actionID ) {
                Util.showSpinner();
                model.destroy({
                    url: 'api/rules/action/' + actionID,
                    complete: function(res) {
                        if ( 200 == (res || {}).status ) {
                            me.getActions(function(actions) {
                                me.renderActions(actions);
                            });
                        } else {
                            Alerts.Error.display({
                                title: 'Error',
                                content: 'Failed Delete Action'
                            });
                        }
                        Util.hideSpinner();
                    }
                });
            }       
        },
        renderRules: function(rules) {
            var me = this,
                template = _.template($('#templateRulesView').html(), {data: rules});

            me.$el.find('.new-rule-container .new-window-box').fadeOut();
            me.AllRules = {};

            _.each(rules, function (model, key) {
                me.AllRules[model.hotpotCardsRuleId] = model;
            });
            
            me.$el.find('.rules-container .item-list').html(template);
        },
        renderActions: function(actions) {
            var me = this,
                template = _.template($('#templateActionsView').html(), {data: actions}),
                $actionSelect = $('#new-rule .new-rule-container select[name="action"]').empty();

            me.$el.find('.new-action-container .new-window-box').fadeOut();
            me.AllActions = {};
            
            _.each(actions, function (model, key) {
                me.AllActions[model.actionTemplateId] = model;
                $actionSelect.append('<option value="' + model.actionTemplateId + '">' + model.actionTemplateName + '</option>');
            });
            
            me.$el.find('.actions-container .item-list').html(template);
            $actionSelect.on('change', function() {
                me.renderNewRuleActions($(this).val());
            });
            me.renderNewRuleActions($actionSelect.val());
        },
        renderNewRuleActions: function(actionTemplateId) {
            var me = this,                
                template = _.template($('#templateActionFormView').html(), {model: me.AllActions[actionTemplateId] || {}});            
            
            $('#new-rule .new-rule-container .rule-action-pane').html(template);
        },        
        init: function() {
            var me = this,
                templateHours = _.template($('#templateHoursView').html(), {model: {}}),
                templateMins = _.template($('#templateMinsView').html(), {model: {}}),
                $startHour1 = $('#start-hour-1').html(templateHours),
                $endHour1 = $('#end-hour-1').html(templateHours),
                $startHour2 = $('#start-hour-2').html(templateHours),
                $endMin1 = $('#end-min-1').html(templateMins),
                $startHour3 = $('#start-hour-3').html(templateHours),
                $endMin2 = $('#end-min-2').html(templateMins),
                $ruleType = $('input[name="condition-type"]').val(''),
                $selectDays = $('select[name="rule-day"]').html(templateHours),
                $selectDaysCond = $('select[name="condition-day"]'),
                $selectMinsCond = $('select[name="condition-min"]'),
                $selectMins = $('select[name="rule-min"]').html(templateMins),
                updateRules = function($elem) {
                    
                    if ( 'start-hour-1' == $elem.attr('id') && parseInt($elem.val()) > parseInt($endHour1.val()) ) {
                        $endHour1 = $('#end-hour-1').html(_.template($('#templateHoursView').html(), {model: {start: parseInt($elem.val()) || 0}}));
                    }

                    $('code.condition-jexl').text(
                        '( (time.hourOfDay > ' + $startHour1.val() + ' && time.hourOfDay < ' + $endHour1.val() + ') || '
                        + '(time.hourOfDay > ' + $startHour2.val() + ' && time.hourOfDay < ' + $endMin1.val() + ') || '
                        + '(time.hourOfDay > ' + $startHour3.val() + ' && time.hourOfDay < ' + $endMin2.val() + ') ) && '
                        + 'type == \'' + $ruleType.val() + '\''
                        + ' && time.hourOfDay() ' + $selectDaysCond.val() + ' ' + $selectDays.val() 
                        + ' &&  time.minuteOfHour() ' + $selectMinsCond.val()  + ' ' + $selectMins.val());
                    
                };
            
            
//            for ( var i = 0; i <= 23; i++ ) {
//                $selectDays.append('<option value="' + i + '">' + i + '</option>');
//            }
            
            
            
//            for ( i = 0; i <= 59; i++ ) {
//                $selectMins.append('<option value="' + i + '">' + i + '</option>');
//            }
//            type == movement && time.hourOfDay() < 20 && time.minuteOfHour() < 30


            $('.condition-jexl-box').off().on('change', 'select', function () {
                updateRules($(this));                
            });
            
            $ruleType.on('keypress', function () {
                updateRules($(this));
            })
            
            
            me.getRules(function(rules) {
                me.renderRules(rules);
            });            
            me.getActions(function(actions) {
                me.renderActions(actions);
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