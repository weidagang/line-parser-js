lineparser.js: A meta driven command line parser for Node.js
===========================================================

```javascript
#!/usr/bin/env node

// use DSL in JSON to define the command line specification
var meta = {
    program : 'adb',
    name : 'Android Debug Bridge',
    version : '1.0.3',
    subcommands : [ 'connect', 'disconnect', 'shell', 'push', 'install' ], 
    options : {
        flags : [
            [ 'h', 'help', 'print program usage' ],
            [ 'r', 'reinstall', 'reinstall package' ],
            [ 'l', 'localhost', 'localhost' ]
        ],
        parameters : [
            [ null, 'host', 'adb server hostname or IP address', null ],
            [ 'p', 'port', 'adb server port', 5037 ]
        ]
    },
    usages : [
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

// parse command line args based on the meta data 
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

    // the handler adb_shell will be invoked
    parser.parse(['shell', 'ls', '-l', '/data/data/']);
}
catch (e) {
    // exception will be thrown if there's an error with the meta data
    console.error(e);
}

// callbacks for various usages
function adb_help(r) {
    console.log(r.help());
}

function adb_connect(r) {
    if (r.flags.l) {
        console.log('Connect to localhost:5037'); 
    }
    else {
        console.log('Connect to ' + r.parameters.host + ':' + r.parameters.p); 
    }
}

function adb_disconnect(r) {
    console.log('Disconnect'); 
}

function adb_shell(r) {
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

function adb_push(r) {
    console.log('Push file ' + r.args[0] + ' to ' + r.args[1]); 
}

function adb_install(r) {
    console.log('Install package ' + r.args[0] + ', reinstall: ' + r.flags.r); 
}
```
