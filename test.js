let assert = require("assert");
let t = new (require("typetag"))(true);
t.load(require("typetag-fn"));
t.load(require("typetag-rust"));
let i = t.index;
let rlist = new (require("./index.js"))(t, true);
let compu32input = (value, input_type, want_type, opt_tag) => {
    return `I am ${value}. type : ${JSON.stringify(input_type)} . want : ${JSON.stringify(want_type)} . do ${opt_tag}`;
}
let compu32view = (value) => {
    return value;
}
rlist.bind(i.u32, compu32input, compu32view);
rlist.add(i.u32, i.u32, (data) => data, "tag");
let [router] = rlist.want(i.u32);
assert(router.run([]) === "I am . type : \"unit\" . want : \"u32\" . do tag");
let [router2] = rlist.cando(i.u32);
assert(router2.run(100) === 100);