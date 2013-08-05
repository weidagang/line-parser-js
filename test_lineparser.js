#!/usr/bin/env node

var meta = {
    program : 'adb',
    name : 'Android Debug Bridge',
    version : '1.0.3',
    options : {
        subcommands : [ 'connect', 'disconnect', 'shell', 'push', 'pull' ], 
        flags : [
            [ 'h', 'help', 'print program usage' ],
            [ 'v', 'version', 'print program version' ],
            [ 'l', 'localhost', 'localhost' ]
        ],
        parameters : [
            [ null, 'host', 'adb server hostname or IP address', null ],
            [ 'p', 'port', 'adb server port', 5037 ]
        ]
    },
    usages : [
        [ 'connect', ['host', '[port]'], null, 'connect to adb server on host:port', adb_connect ],
        [ 'connect', [ 'l' ], null, 'connect to adb server on localhost:5037', adb_connect ],
        [ 'disconnect', null, null, 'disconnect from adb server', adb_disconnect ],
        [ 'shell', null, ['[cmd]'], 'run shell commands', adb_shell ],
        [ 'push', null, ['src', 'dest'], 'push file to adb server', adb_push ],
        [ 'pull', null, ['src', 'dest'], 'pull file from adb server', adb_pull ],
        [ 'install', ['r'], ['package'], 'install package', adb_install ],
        [ 'uninstall', null, ['pkg-name'], 'uninstall package', adb_uninstall ],
        [ null, ['h'], null, adb_help, 'help' ],
        [ null, null, null, adb_help, 'help' ]
    ]
};

try {
    var lineparser = require('./lineparser');
    var parser = lineparser.lineparser(meta);

    //var help = parser.help();
    //console.log(help);

    //parser.parse(['-h']);

    //parser.parse(['connect', '--host', '10.69.2.186', '--port', '5036']);
    //parser.parse(['connect', '--host', '10.69.2.186', '-p', '5036']);
    parser.parse(['connect', '--host', '10.69.2.186']);

    //parser.parse(['install', '-r', '/pkgs/bird.apk']);

    //parser.parse(['push', '/pkgs/bird.apk', '/data/tmp']);
}
catch (e) {
    console.error(e);
    console.error(e.stack);
}

return 0;

var rc = parser.parse(['-h']);

// usage handlers
function adb_help(r) {
    console.log(r.help());
}

function adb_connect(r) {
    if (r.flags.l) {
        console.log('Connect to localhost'); 
    }
    else {
        console.log('Connect to ' + r.parameters.host + ':' + r.parameters.p); 
    }
}

function adb_logcat(r) {
    console.log('Logcat'); 
}

function adb_disconnect(r) {
    console.log('Disconnect'); 
}

function adb_shell(r) {
    var cmd = 'Execute command:'
    for (var i = 0; i < r.args.length; ++i) {
        cmd += ' ' + r.args[i]; 
    }
    console.log(cmd);
}

function adb_push(r) {
    console.log('Push file ' + r.args[0] + ' to ' + r.args[1]); 
}

function adb_pull(r) {
    console.log('Pull file ' + r.args[0] + ' to ' + r.args[1]); 
}

function adb_install(r) {
    console.log('Install package ' + r.args[0] + ', reinstall: ' + r.flags.r); 
}

function adb_uninstall(r) {
    console.log('Uninstall package ' + r.args[0]); 
}

