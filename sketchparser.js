var SketchParser = (function() {
    var source, index;
    var treeRewrite = {
            unknown: function(a) {
                return a.name ? this[a.name](a) : a;
            },
            command: function(a) {
                var l = {},
                    d;
                l.command = a.content[0];
                if (d = a.content[2]) {
                    l.subcommand = this.unknown(d)
                }
                return l;
            },
            command2: function(a) {
                var l = {},
                    d;
                l.name = a.content[0];
                if (d = a.content[2]) {
                    l.data = d;
                }
                return l;
            },
            unescape: function(string) {
                var replacement, string2 = string,
                    func;
                if ((string[0] == '"' || string[0] == "'") && (string[0] === string[string.length - 1])) {
                    string2 = string.substring(1, string.length - 1)
                }
                for (var i = 0; i < unescape.length; i++) {
                    if ((func = unescape[i].replace.f) === undefined) {
                        replacement = "$" + unescape[i].replace.for
                    } else {
                        if (func == "hexadecimal") replacement = function(s) {
                            return String.fromCharCode(parseInt(arguments[unescape[i].replace.for], 16))
                        }
                    }
                    string2 = string2.replace(unescape[i].search, replacement)
                }
                return string2;
            }
        },
        unescape = [{
            search: /\\([0-9A-fa-f]{1,6} ?)/g,
            replace: {
                f: "hexadecimal",
                for: 1
            }
        }, {
            search: /\\(.)/g,
            replace: {
                for: 1
            }
        }]
        //Apparently, you don't tokenize and then parse, you do it on the go, but with more specific techniques which people call grammars, oh well, how was I suppesd to know that anyway.
        //reference {type:"type",is:"type"} "hue"
        //repetition {type:"repeat",optional:false,from:1,to:Infinity,contains:{},delimiting:null,multipleDelimeters:null} optional to and from are defaulted, delimiters can be used for lists like a,b,c and stuff
        //array {type:"tyArray",contains:[]}
        //alternate  {type:"alternate",contains:[]}
        //Expression {type:"expression",contains:{},operators:[{precedence:1,rightAssociative:false,tokens:[]}}],delimeters=[["(",")"]],whiteSpaceIgnore:null}
    var tys =
        var mains = { //START PARSE
                type: "type",
                is: "command"
            }
            //yay extendibility
    var funcs = { //funcions/types used, hue
        expression: function(o) { //parse it like an expression
            //this is probably a little bit hard to understand
            var r = {
                    type: "alternate",
                    contains: [o.contains]
                }, //is it a token, an operator, or a parenthesis?
                opers = {
                    type: "alternate",
                    contains: []
                },
                delims = {
                    type: "alternate",
                    contains: []
                },
                i, I, l, L, props, t, n, ret = {},
                _ind = index,
                EXPRS = [],
                OPERATORS = [],
                O, precedence, rightAssociative, arg1, arg2, k; //I use and reuse most variables I can, damn
            if (O = o.operators) {
                for (i = 0, l = O.length; i < l; i++) {
                    for (I = 0, L = O[i].tokens.length; I < L; I++) {
                        t = O[i].tokens[I];
                        if (o.whiteSpaceIgnore) {
                            if (typeof t === "string") {
                                opers.contains.push(new RegExp("\\s*(?:" + t.replace(/([-+\\?.!$^&*(){}[\]])/g, "\\$1") + ")\\s*"));
                            } else if (t instanceof RegExp) {
                                opers.contains.push(new RegExp("\\s*(?:" + t.source + ")\\s*", (t.multiline ? "m" : "") + (t.ignoreCase ? "i" : "")))
                            } else {
                                opers.contains.push({
                                    type: "tyArray",
                                    contains: [/\s*/, t, /\s*/]
                                }); /*Ahh I HATE THIS! D:*/
                            }
                        } else {
                            opers.contains.push(t);
                        }
                    }
                }
                r.contains[1] = opers; //ADD THEM TO THE LIST
            }
            if (O = o.delimeters) { //this is like a carbon copy of the previous if, should I try to make it a function? Don't repeat yourself
                for (i = 0, l = O.length; i < l; i++) {
                    for (I = 0, L = O[i].length; I < L; I++) {
                        t = O[i][I];
                        if (o.whiteSpaceIgnore) {
                            if (typeof t === "string") {
                                delims.contains.push(new RegExp("\s*(?:" + t + ")\s*"));
                            } else if (t instanceof RegExp) {
                                delims.contains.push(new RegExp("\s*(?:" + t.source + ")\s*", (t.multiline ? "m" : "") + (t.ignoreCase ? "i" : "")))
                            } else {
                                delims.contains.push({
                                    type: "tyArray",
                                    contains: [/\s*/, t, /\s*/]
                                }); /*Ahh I HATE THIS! D:*/
                            }
                        } else {
                            delims.contains.push(t);
                        }
                    }
                }
                r.contains[2] = delims;
            }
            /*Shunting Yard Algorithm*/
            while (n = isIndexItem(r, props = {})) { //While there are tokens to be read
                //read a token
                if (props._matched === r.contains[0]) { //If the token is a number, then add it to the output queue.
                    EXPRS.push(n);
                } else
                if (props._matched === opers) { //If the token is an operator, o1, then
                    if ((I = opers.contains.indexOf(props.props._matched)) !== -1) {
                        for (i = 0, l = (O = o.operators).length, k = 0; i < l; i++) { //
                            if ((k += O[i].tokens.length) > I) {
                                precedence = O[i].precedence;
                                rightAssociative = O[i].rightAssociative;
                                break;
                            }
                        }
                    } else {
                        throw new Error("props.props._matched not found at oper.contains, This is impossible.. or is it?");
                    }
                    while ((L = OPERATORS.length) && (((!rightAssociative) && precedence === OPERATORS[L - 1][1]) || precedence < OPERATORS[L - 1][1])) { //while there is an operator token, o2, at the top of the stack, and
                        //either o1 is left-associative and its precedence is equal to that of o2,
                        //or o1 has precedence less than that of o2,
                        /*POPPINGG!!*/
                        //pop o2 off the stack, onto the output queue;
                        //This popping is also a bit of PRN execution, basically it is shunting yard and prn, or something weird
                        arg2 = EXPRS.pop();
                        arg1 = EXPRS.pop();
                        if (!(EXPRS.length || arg1)) {
                            console.warn("NOT ENOUGH TERMS");
                        }
                        t = OPERATORS.pop();
                        for (i = 0, l = (O = o.operators).length, k = 0; i < l; i++) {
                            if ((k += O[i].tokens.length) > t[2]) {
                                EXPRS.push({
                                    operation: O[i].tokens[t[2] - (k - O[i].tokens.length)],
                                    op: t[0],
                                    arguments: [arg1, arg2],
                                    name: "operator"
                                });
                                break;
                            }
                        }
                    }
                    OPERATORS.push([n, precedence, I]);
                } else
                if (props._match === delims) {} else {
                    throw Error("This is impossible! It has matched an unknown value..???");
                }
            }
            //When there are no more tokens to read
            while (L = OPERATORS.length) { //While there are still operator tokens in the stack
                //Pop the operator onto the output queue.
                arg2 = EXPRS.pop();
                arg1 = EXPRS.pop();
                if (!(EXPRS.length || arg1)) {
                    console.warn("NOT ENOUGH TERMS");
                }
                t = OPERATORS.pop();
                for (i = 0, l = (O = o.operators).length, k = 0; i < l; i++) {
                    if ((k += O[i].tokens.length) > t[2]) {
                        EXPRS.push({
                            operation: O[i].tokens[t[2] - (k - O[i].tokens.length)],
                            op: t[0],
                            arguments: [arg1, arg2],
                            name: "operator"
                        });
                        break;
                    }
                }
            }
            if (EXPRS.length < 1) {
                return null;
            }
            if (EXPRS.length !== 1) {
                throw new Error("Operators and expressions mismatch!!");
            }
            return EXPRS[0];
        },
        type: function(o) { //get type and parse it
            var props = {},
                a = isIndexItem(tys[o.is], props),
                t, ret; //this is where props originally started, in short words, it is used to pass properties from other functions to here 
            if (a === null) return null;
            //console.log()
            ret = {
                type: (t = tys[o.is]) && (t.delimiting ? "list" : t.type || ((typeof t === "string" || t instanceof RegExp) ? "String" : undefined)),
                name: o.is,
                content: a
            }
            for (var k in props) {
                if (props.hasOwnProperty(k) && (!ret[k])) {
                    ret[k] = props[k];
                }
            }
            return ret;
        },
        repeat: function(o, props) { //repeat
            var reto = [],
                e, d, _ind = index,
                l, p, D = o.delimiting,
                i = 0,
                p = D && o.multipleDelimeters, //say, if the delimeter is just once, there is no point in putting it each time it appears.. right? so an CSV like "abc,dfe,ege" will appear as ["abc","dfe","ege"] instead of ["abc",',',"dfe",',',"ege"]
                props2;
            d = o.contains;
            props.props = [];
            do {
                e = isIndexItem(D ? i & 1 ? D : d : d, props2 = {});
                if ((!p) && D && i & 1) {
                    i++;
                    if (e !== null) {
                        continue;
                    } else {
                        break;
                    }
                }
                i++;
                if (e !== null) {
                    reto.push(e)
                    props.props.push(props2)
                }
            } while (e !== null && i !== o.to);
            l = reto.length;
            if (((!o.optional) && l == 0) || ((!isNaN(p = o.from)) && l < p)) {
                index = _ind;
                return null;
            }
            if (D && !p) {
                props.delimeter = D
            }
            return reto;
        },
        tyArray: function(o, props) { //tokens are in some order
            var reto = [],
                e, _ind = index,
                opt = o.optional || [],
                props2;
            props.props = [];
            for (var i = 0, l = o.contains.length, d; i < l; i++) {
                d = o.contains[i];
                e = isIndexItem(d, props2 = {});
                if (e === null && (opt.indexOf(i) < 0)) {
                    index = _ind;
                    return null;
                }
                if (e !== null)
                    props.props.push(props2);
                reto.push(e);
            }
            return reto;
        },
        alternate: function(o, props) { //It alternates 
            var reto = null,
                e, props2 = {};
            for (var i = 0, l = o.contains.length, d; i < l; i++) {
                d = o.contains[i];
                e = isIndexItem(d, props2);
                if (e !== null) {
                    reto = e;
                    props.props = props2;
                    props._matched = d;
                    break;
                }
            }
            return reto;
        }
    }

    function isIndexItem(item, props) { //recursive
        //returns item or null
        var s, t, r,
            f;
        if (!item) {
            return null
        } else
        if (item instanceof RegExp) {
            r = new RegExp
            r.compile("^(?:" + item.source + ")", (item.multiline ? "m" : "") + (item.eturnignoreCase ? "i" : ""))
                //r.lastIndex = index;
            s = r.exec(source.substr(index)); //RAAAWR damn it
            t = s && s[0];
            if (t === null) return null;
            index += t.length;
            return t;
        } else if (typeof item == "string") { //literal match
            //console.log("DOES "+item+" and"+source.substr(index,item.length)+" MATCHES??");
            if (item === source.substr(index, item.length))
                return (index += item.length), item;
            return null;
        } else {
            t = item.type;
            f = funcs[t];
            s = f(item, props);
            if (f) return s;
            else return null;
        }
    }

    function selectorParser(arg) {
        source = arg,
            index = 0; //index is 0!!!
        return treeRewrite.unknown(isIndexItem(mains)); //wasn't that just pretty understandable?
    }
    return selectorParser;
})();
