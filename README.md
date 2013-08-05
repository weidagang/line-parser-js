line-parser-js
==============

A meta driven command line parser for Node.js

```javascript
#!/usr/bin/env node

var meta = {
    program : 'adb',
    name : 'Android Debug Bridge',
    version : '1.0.3',
    subcommands : [ 'connect', 'disconnect', 'shell', 'push', 'pull', 'install', 'uninstall' ], 
    options : {
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
        [ 'connect', ['host', '[port]'], null, 'connect to adb server', adb_connect ],
        [ 'connect', [ 'l' ], null, 'connect to adb server on localhost', adb_connect ],
        [ 'disconnect', null, null, 'disconnect from adb server', adb_disconnect ],
        [ 'shell', null, ['[cmd]'], 'run shell commands', adb_shell ],
        [ 'push', null, ['src', 'dest'], 'push file to adb server', adb_push ],
        [ 'pull', null, ['src', 'dest'], 'pull file from adb server', adb_pull ],
        [ 'install', ['r'], ['package'], 'install package', adb_install ],
        [ 'uninstall', null, ['pkg-name'], 'uninstall package', adb_uninstall ],
        [ null, ['h'], null, 'help', adb_help ],
        [ null, null, null, 'help', adb_help ]
    ]
};

try {
    var lineparser = require('lineparser');
    var parser = lineparser.init(meta);

    // print help
    var help = parser.help();
    console.log(help);

    // the handler adb_connect will be invoked
    parser.parse(['connect', '--host', '10.69.2.186', '--port', '5036']);

    
    // the handler adb_install will be invoked
    parser.parse(['install', '-r', '/pkgs/bird.apk']);

    // the handler adb_push will be invoked
    parser.parse(['push', '/pkgs/bird.apk', '/data/tmp']);
}
catch (e) {
    // exception will be thrown if there're errror with the meta data
    console.error(e);
}


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

```
