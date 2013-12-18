// meta data schema
var flag_attrs = ['short_name', 'name', 'description'];
var param_attrs = ['short_name', 'name', 'description', 'default'];
var usage_attrs = ['subcommand', 'options', 'args', 'description', 'handler'];

// meta manager
function meta_manager(meta) {
    // init
    flag_attr_idx = {};
    for (var i = 0; i < flag_attrs.length; ++i) {
        flag_attr_idx[flag_attrs[i]] = i;
    }

    param_attr_idx = {};
    for (var i = 0; i < param_attrs.length; ++i) {
        param_attr_idx[param_attrs[i]] = i;
    }

    usage_attr_idx = {};
    for (var i = 0; i < usage_attrs.length; ++i) {
        usage_attr_idx[usage_attrs[i]] = i;
    }

    // internal functions definitions
    function _flag_attr_value(flag, attr_name) {
        return flag_attr_idx[attr_name] >= 0 ? flag[flag_attr_idx[attr_name]] : null;
    }

    function _param_attr_value(param, attr_name) {
        return param_attr_idx[attr_name] >= 0 ? param[param_attr_idx[attr_name]] : null;
    }

    function _usage_attr_value(usage, attr_name) {
        return usage_attr_idx[attr_name] >= 0 ? usage[usage_attr_idx[attr_name]] : null;
    }

    function _get_opt_by_attr(attr_name, attr_value) {
        for (var i = 0; i < meta.options.flags.length; ++i) {
            var flag = meta.options.flags[i];
            if (attr_value == _flag_attr_value(flag, attr_name)) {
                return { type : 'flag', data : flag };
            }
        };

        for (var i = 0; i < meta.options.parameters.length; ++i) {
            var param = meta.options.parameters[i];
            if (attr_value == _param_attr_value(param, attr_name)) {
                return { type : 'parameter', data : param };
            }
        };

        return null;
    }

    function _query_attr_value(select_attr_name, where_attr_name, where_attr_value) {
        var opt = _get_opt_by_attr(where_attr_name, where_attr_value);
        if (null != opt) {
            if ('parameter' == opt.type) {
                return _param_attr_value(opt.data, select_attr_name);
            }
            else if ('flag' == opt.type) {
                return _flag_attr_value(opt.data, select_attr_name);
            }
        }
        return null;
    }

    function _get_opt(name) {
        return (1 == name.length ? _get_opt_by_attr('short_name', name) : _get_opt_by_attr('name', name));
    }

    function _is_flag(name) {
        if (null == name) return false;
        var opt = _get_opt(name);
        return null != opt && 'flag' == opt.type;
    }

    function _is_param(name) {
        if (null == name) return false;
        var opt = _get_opt(name);
        return null != opt && 'parameter' == opt.type;
    }

    function _opt_full_name(name) {
        var opt = _get_opt(name);
        var full_name = null;

        if (null != opt) {
            if ('flag' == opt.type) {
                full_name =_flag_attr_value(opt.data, 'name');
            }
            else if ('parameter' == opt.type) {
                full_name = _param_attr_value(opt.data, 'name');
            }
        }

        return full_name;
    }

    function _opt_short_name(name) {
        var opt = _get_opt(name);
        var short_name = null;

        if (null != opt) {
            if ('flag' == opt.type) {
                short_name =_flag_attr_value(opt.data, 'short_name');
            }
            else if ('parameter' == opt.type) {
                short_name = _param_attr_value(opt.data, 'short_name');
            }
        }

        return short_name;
    }

    function _opt_alias(name) {
        if (null == name) {
            return name;
        }
        if (1 == name.length) {
            return _opt_full_name(name);
        }
        else {
            return _opt_short_name(name);
        }
    }

    return {
        flag_attr_value : _flag_attr_value,
        param_attr_value : _param_attr_value,
        usage_attr_value : _usage_attr_value,
        get_opt : _get_opt,
        query_attr_value : _query_attr_value,
        is_flag : _is_flag,
        is_param : _is_param,
        opt_full_name : _opt_full_name,
        opt_short_name : _opt_short_name,
        opt_alias : _opt_alias
    };
}

// lineparser
function init(meta) {
    var mm = meta_manager(meta);

    function _is_blank(str) {
        for (var i = 0; null != str && i < str.length; ++i) {
            if (' ' != str.charAt(i)) {
                return false;
            }
        }
        return true;
    }

    function _check_meta_subcmds() {
        if (null == meta.subcommands) {
            meta.subcommands = [];
        }

        if (! meta.subcommands instanceof Array) {
            throw new Error('Invalid subcommands definition, type: ' + typeof(meta.subcommands));
        }

        for (var i = 0; i < meta.subcommands.length; ++i) {
            var subcmd = meta.subcommands[i];
            if (_is_blank(subcmd)) {
                throw new Error('Invalid subcommand "' + subcmd + '"');
            }
        }

        return true;
    }

    function _check_meta_options() {
        if (null == meta.options) meta.options = {};
        if (null == meta.options.flags) meta.options.flags = [];
        if (null == meta.options.parameters) meta.options.parameters = [];

        // options.flags
        for (var i = 0; i < meta.options.flags.length; ++i) {
            var flag = meta.options.flags[i];

            // check flag type
            if (! flag instanceof Array) {
                throw new Error('Invalid flag definition, type: ' + typeof(flag));
            }

            // check name
            var short_name = mm.flag_attr_value(flag, 'short_name');
            var name = mm.flag_attr_value(flag, 'name');
            if (_is_blank(short_name) && _is_blank(name)) {
                throw new Error("Flag name can't be empty");
            }
            if (null != short_name && 1 != short_name.length) {
                throw new Error('Invalid flag short name: ' + short_name);
            }
            if (null != name && name.length <= 1) {
                throw new Error('Invalid flag name: ' + name);
            }
        }

        // options.parameters
        for (var i = 0; i < meta.options.parameters.length; ++i) {
            var param = meta.options.parameters[i];

            // check flag type
            if (! param instanceof Array) {
                throw new Error('Invalid parameter definition, type: ' + typeof(param));
            }

            // check name
            var short_name = mm.param_attr_value(param, 'short_name');
            var name = mm.param_attr_value(param, 'name');
            if (null == short_name && null == name) {
                throw new Error("Parameter name must not be empty");
            }
            if (null != short_name && 1 != short_name.length) {
                throw new Error('Invalid parameter short name: ' + short_name);
            }
            if (null != name && name.length <= 1) {
                throw new Error('Invalid parameter name: ' + name);
            }
        }
    }

    function _check_meta_usages() {
        if (null == meta.usages || 0 == meta.usages.length) {
            throw new Error("Usages can't be null or empty");
        }

        for (var i = 0; i < meta.usages.length; ++i) {
            var usage = meta.usages[i];
            var subcmd = mm.usage_attr_value(usage, 'subcommand');
            if (null != subcmd && -1 == meta.subcommands.indexOf(subcmd)) {
                throw new Error('Undefined subcommand "' + subcmd + '"');
            }
        }
    }

    function _validate(meta) {
        if (null == meta) {
            throw new Error('Meta data is ' + meta);
        }

        if (null == meta.program) meta.program = process.argv[1];
        if (null == meta.name) meta.name = meta.program;

        _check_meta_subcmds();
        _check_meta_options();
        _check_meta_usages();

        return true
    }

    function _help() {
        var s = meta.name;
        if (meta.version) {
            s += ' ' + meta.version
        }
        s += '\n\n';
        s += 'Usage: ' + meta.program + ' [<subcommand>] [options...] [args...]\n\n';

        meta.usages.forEach(function(u, i, usages) {
            var descr = mm.usage_attr_value(u, 'description');
            var subcmd = mm.usage_attr_value(u, 'subcommand');
            var options = mm.usage_attr_value(u, 'options');
            var args = mm.usage_attr_value(u, 'args');

            s += '' + (i + 1) + ". " + (null != descr ? descr : '') + '\n';
            s += meta.program;

            if (subcmd) {
                s += ' ' + subcmd;
            }

            if (options && options.length > 0) {
                options.forEach(function(opt_name, i) {
                    var optional = ('[' == opt_name.charAt(0) && ']' == opt_name.charAt(opt_name.length-1));
                    optional && (opt_name = opt_name.substr(1, opt_name.length - 2));
                    if (null == opt_name) {
                        throw new Error('Undefined option "' + opt_name + '"');
                    }
                    else {
                        var str = (opt_name.length > 1 ? '--' : '-');
                        if (mm.is_flag(opt_name)) {
                            str += opt_name;
                        }
                        else if (mm.is_param(opt_name)) {
                            if (1 == opt_name.length) {
                                full_name = mm.opt_full_name(opt_name);
                                (null == full_name) && (full_name = opt_name);
                            }
                            else {
                                full_name = opt_name;
                            }
                            str += opt_name + ' <' + full_name + '>';
                        }
                        else {
                            throw new Error('Undefined option "' + opt_name + '"');
                        }
                        optional ? (s += ' [' + str + ']') : (s += ' ' + str);
                    }
                });
            }

            if (args && args.length > 0) {
                args.forEach(function(arg, i) {
                    s += ' <' + arg + '>';
                });
            }

            s += '\n\n';
        });
        return s;
    }

    function _parse(argv, token) {
        var i;

        // use command line args by default
        if (null == argv) {
            argv = process.argv.slice(2);
        }

        if (! argv instanceof Array) {
            throw new Error('Invalid arguments type: ' + typeof(argv));
        }

        for (i = 0; i < meta.usages.length; ++i) {
            var usage = meta.usages[i];
            var r = _match_usage(usage, argv);
            if (r.matched) {
                var handler = mm.usage_attr_value(usage, 'handler');
                r.help = _help;
                handler(r, token);
                break;
            }
        }

        function _is_optional(name) {
            return '[' == name.charAt(0) && ']' == name.charAt(name.length-1);
        }

        function unwrap_name(name) {
            if (_is_optional(name)) {
                return name.substr(1, name.length - 2);
            }
            if (name.length > 2 && '-' == name.charAt(0) && '-' == name.charAt(1)) {
                return name.substr(2);
            }
            if (name.length > 1 && '-' == name.charAt(0)) {
                return name.substr(1);
            }
            return name;
        }

        function _match_usage(usage, argv) {
            var r = { matched : false, subcommand : null, flags : {}, parameters : {}, args : [] };

            var has_subcmd = false;
            var subcmd = mm.usage_attr_value(usage, 'subcommand');
            if (null != subcmd) {
                // match subcommand
                if (0 == argv.length || subcmd != argv[0]) {
                    return r;
                }
                r.subcommand = subcmd;
                has_subcmd = true;
            }

            // parse command line argv
            var is_arg = false;
            for (var i = (has_subcmd ? 1 : 0); i < argv.length; ++i) {
                if (is_arg) {
                    r.args.push(argv[i]);
                }
                else {
                    // check if argv[i] is an option
                    var opt_name = null;
                    if (argv[i].length > 2 && 0 == argv[i].indexOf('--')) {
                        opt_name = argv[i].substr(2);
                    }
                    else if (argv[i].length > 1 && 0 == argv[i].indexOf('-')) {
                        opt_name = argv[i].substr(1);
                    }

                    if (null != opt_name) {
                        var alias = mm.opt_alias(opt_name);
                        if (mm.is_param(opt_name)) {
                            if (i + 1 < argv.length) {
                                if (null == r.parameters[opt_name]) {
                                    r.parameters[opt_name] = argv[i+1];
                                    if (alias) {
                                        r.parameters[alias] = argv[i+1];
                                    }
                                }
                                else if (r.parameters[opt_name] instanceof Array) {
                                    r.parameters[opt_name].push(argv[i+1]);
                                    if (alias) {
                                        r.parameters[alias].push(argv[i+1]);
                                    }
                                }
                                else {
                                    r.parameters[opt_name] = [r.parameters[opt_name], argv[i+1]];
                                    if (alias) {
                                        r.parameters[alias] = [r.parameters[alias], argv[i+1]];
                                    }
                                }
                                ++i;
                            }
                        }
                        else if (mm.is_flag(opt_name)) {
                            r.flags[opt_name] = true;
                            if (alias) {
                                r.flags[alias] = true;
                            }
                        }
                    }
                    else {
                        r.args.push(argv[i]);
                        is_arg = true;
                    }
                }
            }

            // try to match args against the usage pattern
            var usage_options = (null == usage[1] ? [] : usage[1]);
            for (var i = 0; i < usage_options.length; ++i) {
                var usage_opt = usage_options[i];
                var optional = _is_optional(usage_opt);
                var opt_name = unwrap_name(usage_opt);
                var is_param = mm.is_param(opt_name);

                if (!optional) {
                    if (is_param) {
                        if (null == r.parameters[opt_name]) {
                            return r;
                        }
                    }
                    else {
                        if (null == r.flags[opt_name]) {
                            return r;
                        }
                    }
                }
                else {
                    if (is_param && null == r.parameters[opt_name]) {
                        var default_value = (1 == opt_name.length
                            ? mm.query_attr_value('default', 'short_name', opt_name)
                            : mm.query_attr_value('default', 'name', opt_name)
                        );
                        if (null != default_value) {
                            r.parameters[opt_name] = default_value;
                            var alias = mm.opt_alias(opt_name);
                            if (alias) {
                                r.parameters[alias] = default_value;
                            }
                        }
                    }
                }
            }

            r.matched = true;
            return r;
        }
    }

    return !_validate(meta) ? null : {
        help : _help,
        parse : _parse
    };
}


exports.init = init;
