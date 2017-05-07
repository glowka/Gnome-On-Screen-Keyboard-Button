// Copyright (c) 2017 Tomasz Główka
// Copyright (c) 2016 Daniel Brall
// Licensed under GPLv2 (gnome shell is in this license)

const St = imports.gi.St;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const A11Y_APPLICATIONS_SCHEMA = 'org.gnome.desktop.a11y.applications';
const SHOW_KEYBOARD = 'screen-keyboard-enabled';

let _oskButton;
let _rotateHorizontalButton;
let _rotateVerticalButton;
let _oskButtonEventHandler;
let _rotateHorizontalButtonEventHandler;
let _rotateVerticalButtonEventHandler;
let _oskA11yApplicationsSettings;



function _toggleKeyboard() {
    if (Main.keyboard._keyboardVisible) {
        Main.keyboard.Hide();

        // Deactivate OSK after five minutes - it will take a bit longer to appear,
        // but no false appearances due to the changed setting
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000 * 60 * 5, function() {
            print('doing');
            _oskA11yApplicationsSettings.set_boolean(SHOW_KEYBOARD, false);
            Main.keyboard._sync();
            print('done');
        }, null);

    } else {
        // Make sure appropriate setting is set
        _oskA11yApplicationsSettings.set_boolean(SHOW_KEYBOARD, true);
        Main.keyboard._sync();
        Main.keyboard.Show();
    }
}

function _rotateHorizontal() {
    const Util = imports.misc.util;
    Util.spawn(['/bin/bash', '-c', 'xrandr --output eDP-1 --rotate normal']);
}

function _rotateVertical() {
    const Util = imports.misc.util;
    Util.spawn(['/bin/bash', '-c', 'xrandr --output eDP-1 --rotate right']);
}

function init() {
}

function enable() {
    _oskA11yApplicationsSettings = new Gio.Settings({ schema_id: A11Y_APPLICATIONS_SCHEMA });

    _oskButton = new St.Bin({
        style_class: 'panel-button',
        reactive: true,
        can_focus: true,
        x_fill: true,
        y_fill: false,
        track_hover: true
    });

    _rotateHorizontalButton = new St.Bin({
        style_class: 'panel-button',
        reactive: true,
        can_focus: true,
        x_fill: true,
        y_fill: false,
        track_hover: true
    });

    _rotateVerticalButton = new St.Bin({
        style_class: 'panel-button',
        reactive: true,
        can_focus: true,
        x_fill: true,
        y_fill: false,
        track_hover: true
    });

    const icon = new St.Icon({
        icon_name: 'preferences-desktop-keyboard-shortcuts',
        style_class: 'system-status-icon'
    });

    const rotateHorizontalIcon = new St.Icon({
        icon_name: 'video-display',
        style_class: 'system-status-icon'
    });

    const rotateVerticalIcon = new St.Icon({
        icon_name: 'pda',
        style_class: 'system-status-icon'
    });


    _oskButton.set_child(icon);
    _rotateHorizontalButton.set_child(rotateHorizontalIcon);
    _rotateVerticalButton.set_child(rotateVerticalIcon);
    _oskButtonEventHandler = _oskButton.connect('button-press-event', _toggleKeyboard);
    _rotateHorizontalButtonEventHandler = _rotateHorizontalButton.connect('button-press-event', _rotateHorizontal);
    _rotateVerticalButtonEventHandler = _rotateVerticalButton.connect('button-press-event', _rotateVertical);

    Main.panel._rightBox.insert_child_at_index(_oskButton, 0);
    Main.panel._rightBox.insert_child_at_index(_rotateHorizontalButton, 0);
    Main.panel._rightBox.insert_child_at_index(_rotateVerticalButton, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(_oskButton);

    _oskButton.disconnect(_oskButtonEventHandler);
    _oskButton = null;
    _oskButtonEventHandler = null;

    _oskA11yApplicationsSettings = null;

    _rotateHorizontalButton.disconnect(_rotateHorizontalButtonEventHandler);
    _rotateHorizontalButton = null;
    _rotateHorizontalButtonEventHandler = null;

    _rotateVerticalButton.disconnect(_rotateVerticalButtonEventHandler);
    _rotateVerticalButton = null;
    _rotateVerticalButtonEventHandler = null;
}
