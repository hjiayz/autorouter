let jsonify = (o) => JSON.stringify(o);
class Router {
    constructor(optinfo, complist, mode, input_type) {
        this.run = (data) => {
            if (!input_type.is(data)) throw new TypeError("Type mismatch");
            let [param, result, opt, tag] = optinfo;
            if (mode == "view") {
                return complist[jsonify(result)][1](opt(data));
            }
            else {
                return complist[jsonify(param)][0](data, input_type, param, tag);
            }
        }
        this.tag = () => optinfo[3];
    }
}
class RouterList {
    constructor(t, debugmode) {
        let i = t.index;
        let lopt = {};
        let lcomp = {};
        let lresult = {};
        let lparam = {};
        let changed = false;
        this.typetag = t;
        this.index = i;
        this.bind = (type, inputcomp, viewcomp) => {
            t.type.assert(type);
            lcomp[jsonify(type)] = [inputcomp, viewcomp];
            changed = true;
            return this;
        }
        this.add = (param, result, opt, tag) => {
            t.type.assert(param).assert(result);
            lopt[tag] = [param, result, opt, tag];
            changed = true;
            return this;
        }
        this.get = (opt_tag) => lopt[opt_tag];
        this.update = () => {
            if (!changed) return;
            lresult = {};
            lparam = {};
            Object.values(lopt).map((v) => {
                let [param, result, opt, tag] = v;
                let [ptag, rtag] = [param, result].map(jsonify);
                lresult[rtag] = lresult[rtag] || [];
                lresult[rtag].push([tag, result == i.unit ? "view" : "input"]);
                let paramcheck = () => {
                    if (!!param.meta.name) {
                        return [[ptag, "view"]];
                    }
                    if (param.meta.type == t.vec) {
                        return [[ptag, "view"], [jsonify(param.meta.param), "input"]];
                    }
                    if (param.meta.type == t.tuple) {
                        let len = param.meta.param.length;
                        if ((debugmode) && (len == 0)) throw new Error("please use unit type");
                        if (len == 1) return [[jsonify(param.meta.param[0]), "view"]]
                        let table = {};
                        param.meta.param.forEach((v) => {
                            let tbtag = jsonify(v);
                            table[tbtag] = table[tbtag] || [tbtag, "input"];
                        })
                        return Object.values(table);
                    }
                    if (param.meta.type == t.struct) {
                        let table = {};
                        Object.values(param.meta.param).forEach((v) => {
                            let tbtag = jsonify(v);
                            table[tbtag] = table[tbtag] || [tbtag, "input"];
                        })
                        return Object.values(table);
                    }
                }
                paramcheck().forEach((v) => {
                    lparam[v[0]] = lparam[v[0]] || [];
                    lparam[v[0]].push([tag, v[1]]);
                });
            })
            changed = false;
        }
        let output = (v, tp) => new Router(lopt[v[0]], lcomp, v[1], tp);
        this.want = (what) => {
            t.type.assert(what);
            this.update();
            return lresult[jsonify(what)].map((v) => output(v, i.unit));
        }
        this.cando = (has) => {
            t.type.assert(has);
            this.update();
            return lparam[jsonify(has)].map((v) => output(v, has));
        }
    }
}
module.exports = RouterList