#!/usr/bin/env node

var meta = {
    program : 'adb',
    name : 'Android Debug Bridge',
    version : '1.0.3',
    subcommands : [ 'connect', 'disconnect', 'shell', 'push', 'install' ], 
    options : {
        flags : [
            /*short_name, name, description*/
            [ 'h', 'help', 'print program usage' ],
            [ 'r', 'reinstall', 'reinstall package' ],
            [ 'l', 'localhost', 'localhost' ]
        ],
        parameters : [
            /*short_name, name, description, default_value*/
            [ null, 'host', 'adb server hostname or IP address', null ],
            [ 'p', 'port', 'adb server port', 5037 ]
        ]
    },
    usages : [
        /*subcommand, options, positional-arguments, description, handler*/
        [ 'connect', ['host', '[port]'], null, 'connect to adb server', adb_connect ],
        [ 'connect', [ 'l' ], null, 'connect to the local adb server', adb_connect ],
        [ 'disconnect', null, null, 'disconnect from adb server', adb_disconnect ],
        [ 'shell', null, ['[cmd]'], 'run shell commands', adb_shell ],
        [ 'push', null, ['src', 'dest'], 'push file to adb server', adb_push ],
        [ 'install', ['r'], ['package'], 'install package', adb_install ],
        [ null, ['h'], null, 'help', adb_help ],
        [ null, null, null, 'help', adb_help ]
    ]
};

try {
    var lineparser = require('../lineparser.js');
    var parser = lineparser.init(meta);

    // print help
    var help = parser.help();
    console.log(help);

    // the handler adb_connect will be invoked
    parser.parse(['connect', '--host', '10.69.2.186', '--port', '5036'], "I'm a token");
    
    // the handler adb_install will be invoked
    parser.parse(['install', '-r', '/pkgs/bird.apk'], null);

    // the handler adb_push will be invoked
    parser.parse(['push', '/pkgs/bird.apk', '/data/tmp'], null);

    // the handler adb_shell will be invoked
    parser.parse(['shell', 'ls', '-l', '/data/data/'], null);
}
catch (e) {
    // exception will be thrown if there're errror with the meta data
    console.error(e);
}


// usage handlers
function adb_help(r, token) {
    console.log(r.help());
}

function adb_connect(r, token) {
    if (r.flags.l) {
        console.log('Connect to localhost:5037'); 
    }
    else {
        console.log('Connect to ' + r.parameters.host + ':' + r.parameters.p); 
    }

    console.log('Token: ' + token);
}

function adb_disconnect(r, token) {
    console.log('Disconnect'); 
}

function adb_shell(r, token) {
    if (0 == r.args) {
        console.log('Enter adb shell');
    }
    else {
        var cmd = 'Run command: '
        for (var i = 0; i < r.args.length; ++i) {
            cmd += ' ' + r.args[i]; 
        }
        console.log(cmd);
    }
}

function adb_push(r, token) {
    console.log('Push file ' + r.args[0] + ' to ' + r.args[1]); 
}

function adb_install(r, token) {
    console.log('Install package ' + r.args[0] + ', reinstall: ' + r.flags.r); 
}

function adb_uninstall(r, token) {
    console.log('Uninstall package ' + r.args[0]); 
}
