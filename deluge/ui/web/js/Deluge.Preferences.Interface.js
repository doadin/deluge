/*
Script: Deluge.Preferences.Interface.js
    The interface preferences page.

Copyright:
	(C) Damien Churchill 2009 <damoxc@gmail.com>
	This program is free software; you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation; either version 3, or (at your option)
	any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, write to:
		The Free Software Foundation, Inc.,
		51 Franklin Street, Fifth Floor
		Boston, MA  02110-1301, USA.

    In addition, as a special exception, the copyright holders give
    permission to link the code of portions of this program with the OpenSSL
    library.
    You must obey the GNU General Public License in all respects for all of
    the code used other than OpenSSL. If you modify file(s) with this
    exception, you may extend this exception to your version of the file(s),
    but you are not obligated to do so. If you do not wish to do so, delete
    this exception statement from your version. If you delete this exception
    statement from all source files in the program, then also delete it here.
*/

Ext.namespace('Ext.deluge.preferences');
Ext.deluge.preferences.Interface = Ext.extend(Ext.form.FormPanel, {
	constructor: function(config) {
		config = Ext.apply({
			border: false,
			title: _('Interface'),
			layout: 'form'
		}, config);
		Ext.deluge.preferences.Interface.superclass.constructor.call(this, config);
	},
	
	initComponent: function() {
		Ext.deluge.preferences.Interface.superclass.initComponent.call(this);
		
		var optMan = this.optionsManager = new Deluge.OptionsManager();
		this.on('show', this.onShow, this);
		
		var fieldset = this.add({
			xtype: 'fieldset',
			border: false,
			title: _('Interface'),
			style: 'margin-bottom: 5px; padding-bottom: 5px; padding-top: 5px',
			autoHeight: true,
			labelWidth: 1,
			defaultType: 'checkbox'
		});
		optMan.bind('show_session_speed', fieldset.add({
			name: 'show_session_speed',
			fieldLabel: '',
			labelSeparator: '',
			boxLabel: _('Show session speed in titlebar')
		}));
		optMan.bind('sidebar_show_zero', fieldset.add({
			name: 'sidebar_show_zero',
			fieldLabel: '',
			labelSeparator: '',
			boxLabel: _('Show filters with zero torrents')
		}));
		optMan.bind('sidebar_show_trackers', fieldset.add({
			name: 'sidebar_show_trackers',
			fieldLabel: '',
			labelSeparator: '',
			boxLabel: _('Show trackers with zero torrents')
		}));
		
		fieldset = this.add({
			xtype: 'fieldset',
			border: false,
			title: _('Password'),
			style: 'margin-bottom: 0px; padding-bottom: 0px; padding-top: 5px',
			autoHeight: true,
			labelWidth: 110,
			defaultType: 'textfield',
			defaults: {
				width: 180,
				inputType: 'password'
			}
		});
		
		this.oldPassword = fieldset.add({
			name: 'old_password',
			fieldLabel: _('Old Password')
		});
		this.newPassword = fieldset.add({
			name: 'new_password',
			fieldLabel: _('New Password')
		});
		this.confirmPassword = fieldset.add({
			name: 'confirm_password',
			fieldLabel: _('Confirm Password')
		});
		
		var panel = fieldset.add({
			xtype: 'panel',
			autoHeight: true,
			border: false,
			width: 320,
			bodyStyle: 'padding-left: 230px'
		})
		panel.add({
			xtype: 'button',
			text: _('Change'),
			listeners: {
				'click': {
					fn: this.onPasswordChange,
					scope: this
				}
			}
		});
		
		fieldset = this.add({
			xtype: 'fieldset',
			border: false,
			title: _('Server'),
			style: 'margin-top: 5px; padding-top: 5px; margin-bottom: 0px; padding-bottom: 0px',
			autoHeight: true,
			labelWidth: 110,
			defaultType: 'uxspinner',
			defaults: {
				width: 80,
			}
		});
		optMan.bind('session_timeout', fieldset.add({
			name: 'session_timeout',
			fieldLabel: _('Session Timeout'),
			strategy: {
				xtype: 'number',
				decimalPrecision: 0,
				minValue: -1,
				maxValue: 99999
			}
		}));
		optMan.bind('port', fieldset.add({
			name: 'port',
			fieldLabel: _('Port'),
			strategy: {
				xtype: 'number',
				decimalPrecision: 0,
				minValue: -1,
				maxValue: 99999
			}
		}));
		this.httpsField = optMan.bind('https', fieldset.add({
			xtype: 'checkbox',
			name: 'https',
			hideLabel: true,
			width: 320,
			boxLabel: _('Use SSL (paths relative to the Deluge config folder)')
		}));
		this.httpsField.on('check', this.onSSLCheck, this);
		this.pkeyField = optMan.bind('pkey', fieldset.add({
			xtype: 'textfield',
			disabled: true,
			name: 'pkey',
			width: 180,
			fieldLabel: _('Private Key')
		}));
		this.certField = optMan.bind('cert', fieldset.add({
			xtype: 'textfield',
			disabled: true,
			name: 'cert',
			width: 180,
			fieldLabel: _('Certificate')
		}));
	},
	
	onApply: function() {
		var changed = this.optionsManager.getDirty();
		if (!Ext.isObjectEmpty(changed)) {
			Deluge.Client.web.set_config(changed, {
				success: this.onSetConfig,
				scope: this
			});
		}
	},
	
	onGotConfig: function(config) {
		this.optionsManager.set(config);
	},
	
	onPasswordChange: function() {
		var newPassword = this.newPassword.getValue();
		if (newPassword != this.confirmPassword.getValue()) {
			Ext.MessageBox.show({
				title: _('Invalid Password'),
				msg: _('Your passwords don\'t match!'),
				buttons: Ext.MessageBox.OK,
				modal: false,
				icon: Ext.MessageBox.ERROR,
				iconCls: 'x-deluge-icon-error'
			});
			return;
		}
		
		var oldPassword = this.oldPassword.getValue();
		Deluge.Client.auth.change_password(oldPassword, newPassword, {
			success: function(result) {
				if (!result) {
					Ext.MessageBox.show({
						title: _('Password'),
						msg: _('Your old password was incorrect!'),
						buttons: Ext.MessageBox.OK,
						modal: false,
						icon: Ext.MessageBox.ERROR,
						iconCls: 'x-deluge-icon-error'
					});
					this.oldPassword.setValue('');
				} else {
					Ext.MessageBox.show({
						title: _('Change Successful'),
						msg: _('Your password was successfully changed!'),
						buttons: Ext.MessageBox.OK,
						modal: false,
						icon: Ext.MessageBox.INFO,
						iconCls: 'x-deluge-icon-info'
					});
					this.oldPassword.setValue('');
					this.newPassword.setValue('');
					this.confirmPassword.setValue('');
				}
			},
			scope: this
		});
	},
	
	onSetConfig: function() {
		this.optionsManager.commit();
	},
	
	onShow: function() {
		Ext.deluge.preferences.Interface.superclass.onShow.call(this);
		Deluge.Client.web.get_config({
			success: this.onGotConfig,
			scope: this
		})
	},
	
	onSSLCheck: function(e, checked) {
		this.pkeyField.setDisabled(!checked);
		this.certField.setDisabled(!checked);
	}
});
Deluge.Preferences.addPage(new Ext.deluge.preferences.Interface());