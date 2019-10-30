var metachars = ["[", "(", ")", "+", "?", ".", "*"]
var regexGrammar = {
  regex: [{ type: "repetition", to: 1, from: 0, quantifier: "greedy", child: "^" },{ type: "repetition", to: Infinity, from: 0, quantifier: "lazy", child: { type: "or", choices: [{ type: "pointer", value: "group" }, { type: "pointer", value: "wildcard" }, { type: "pointer", value: "escape" }, { type: "pointer", value: "special" }, wildcardToken("Anything")] } }, { type: "repetition", to: 1, from: 0, quantifier: "greedy", child: "$" }],
  wildcard: ["[", {
    type: "repetition",
    to: Infinity,
    from: 0,
    quantifier: "greedy",
    child: {
      type: "or",
      child: [{ type: "pointer", value: "escape" },
        [{ type: "wildcard", value: ["]"], negative: true }, { type: "repetition", to: 1, from: 0, quantifier: "greedy", child: ['-', [{ type: "wildcard", value: ["]"], negative: true }]] }]
      ]
    }
  }, "]"],
  group: ['(', { type: "repetition", to: 1, from: 0, quantifier: "greedy", child: { type: "pointer", value: "groupTypes" } }, ')'],
  grammar: ['/', { type: "pointer", value: "regex" }, '/', { type: "pointer", value: "flags" }],
  escape: ["\\", wildcardToken("Anything")],
  special: { type: "or", choices: ["{", { type: "repetition", from: 1, to: Infinity, quantifier: "lazy", child: wildcardToken("Digit") }] },
  groupTypes: {},
  flags:{type:"repetition",from:0,to:5,quantifier:"greedy",child:[{type:"variable",key:"wildcardvalue",value:{type:"wildcard",value:["i","m","g","u","y"]}},{type:"assertion",look:"ahead",negative:true,value:[{type:"repetition",from:0,to:5,quantifier:"lazy",child:{type:"wildcard",value:["i","m","g","u","y"]}},{type:"variable",key:"wildcardvalue"}]}]}
};
function wildcardToken(type, negative) {
  negative = negative | false;
  switch (type) {
    case "Anything":
      return { type: "wildcard", value: [{ from: 0, to: Infinity }], negative: negative };
      break;
    case "Digit":
      return { type: "wildcard", value: [{ from: 0x30, to: 0x39 }], negative: negative };
      break;
    case "Whitespace":
      return { type: "wildcard", value: [{ from: "\u0009", to: "\u000D" }, " ", "", " ", " ", { from: "", to: "‍" }, " ", " ", "　", "᠎", "⁠", "﻿"], negative: negative };
      break;
    default:
      if (/[\s\S]-[\s\S]/.test(type)) {
        return { type: "wildcard", value: [{ from: type[0], to: type[2] }], negative: negative };
      }
      break;
  }
}
module.exports=regexGrammar;
