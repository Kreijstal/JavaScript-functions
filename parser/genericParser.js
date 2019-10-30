/*I want to build a generic parser, that parses RegEx, 
and it's pausable by itself, I'm doing this for a project.*/ 
//Helper functions
//Tree Implimentation from https://gist.github.com/RainbowDangerDash/e006151f60003487e208
function Tree(data) {
  this.data = data;
  this.children = [];
  this.parent = null;
  this.length = 0;
  this.level=0//useful for debugging how deep a node is
}
Tree.fromJSON = function(jsonTree) {
  var tree = JSON.parse(jsonTree),
    finalTree = tree.map(function(a) { return new Tree(a.data) });
  tree.forEach(function(a, i) { a.children.forEach(function(b) { finalTree[i].addChild(finalTree[b]) }) });
  return finalTree[0];
}
Tree.prototype.addChild = function(t) {
  if (!(t instanceof this.constructor)) { t = new Tree(t) }
  t.parent = this;
  this.length = this.children.push(t);
  t.level=this.level+1
  return t;
}
Tree.prototype.removeChild = function(i) {
  var c = this.children.splice(i, 1)[0];
  this.length = this.children.length;
  c && (c.parent = null);
  return c;
}
Tree.prototype.splice=function(start,end){
    var c = this.children.splice(start,end);
  this.length = this.children.length;
  return c;
}
Tree.prototype.detachFromParent = function() {
  var parent = this.parent;
  if (parent) {
    parent.removeChild(parent.children.indexOf(this));
  }
  return parent;
}
Tree.prototype.popChild = function() {
  var c = this.children.pop();
  c.detachFromParent && c.detachFromParent();
  return c;
}
Tree.prototype.previousSibling=function(){
  return this.parent&&this.parent.children[this.parent.children.indexOf(this)-1]
}
//Walk the tree
Tree.prototype.forEach = function(f, r, t, i) {
  //r is how deep you want to go, 0 for unlimited.
  //t is the level of the children you want, 0 for unlimited,
  //if you for example only want the children and beyond, but not the value itself, then t would be 1,
  //if you want the grandchildren and beyond but not the children, t would be 2
  //go back i number of steps to see if there are parents
  for (var ii = i, node = this; ii && node.parent && (t > 0 && r > 0); ii--) {
    node = node.parent;
    if (node == this) { //if parent node is equal to this node, then skip
      return this
    }
  }
  i = i | 0;
  r = r | 0;
  t = t | 0;
  if (t-- <= 0) {
    f(this, i);
  }
  if (--r) {
    this.children.forEach(function(a) { a.forEach(f, r, t, i + 1) });
  }
  return this;
}
Tree.prototype.forEachChild = function(f) {
  return this.forEach(f, 2, 1, 0);
};
(function() {
  var _find = function(f) {
    var c = this.children;
    if (!c) { return false }
    for (var d, i = 0, l = c.length; i < l; i++) {
      if (d = f.call(arguments[1], c[i], c)) {
        return d;
      }
    };
  }
  Tree.prototype._find = _find;
  Tree.prototype.find = function(f, r, t) {
    r = r | 0;
    t = t | 0
    return ((t-- <= 0) ? (f(this) && this) : false) || ((--r) ? this._find(function(a) { return a.find(f, r, t) }) : false);
  }
})();
Tree.prototype.findIndex = function(f) {
  return this.children.findIndex(f);
}
Tree.prototype.getChild = function(i) {
  return this.children[i];
}
Tree.prototype.getFirstChild = function() {
  return this.children[0];
}
Tree.prototype.getLastChild = function() {
  return this.children[this.children.length - 1];
}
Tree.prototype.toJSON = function() {
  var child = [];
  this.forEach(function(a) { child.push(a) });
  return JSON.stringify(child.map(function(a) {
    return {
      data: a.data,
      children: a.children.map(function(b) { return child.indexOf(b) })
    }
  }))
}
//Get Type
function getType(value) { //returns a string getting the type of the object: array, object, integer, etc. Taken from Chrome's code.
  var s = typeof value;
  if (s == "object") {
    if (value === null) {
      return "null";
    }
    else if (Object.prototype.toString.call(value) == "[object Array]") {
      return "array";
    }
    else if (typeof(ArrayBuffer) != "undefined" &&
      value.constructor == ArrayBuffer) {
      return "binary";
    }
  }
  else if (s == "number") {
    if (value % 1 == 0) {
      return "integer";
    }
  }
  return s;
};

if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    }
    else {
      k = len + n;
      if (k < 0) { k = 0; }
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
        (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}
/*
USAGE&EXAMPLES: 
This function accepts a grammar object, and a string to parse. Grammar objects contain the information needed to parse whichever the string contains.
A grammar object is a map (an associative array), in which it's keys are labels given by the programmer with the exception of the "grammar" label which is the initial/starting/main key, the values are patterns:
This is defined by expressionFeatures (parserSteppers), and behavour can be changed by so
A pattern/feautre is either an object, a native array or a string, they can be:

<pattern>:
def:(<pattern>[]|<string>|{type:"repetition",to:<int>,from:<int>,quantifier:("lazy"|"greedy"),child:<pattern>}|{type:"or",child:<pattern>[]}|{type:"wildcard",value:({from:<int>,to:<int>}|<char>)[][,negative:<boolean>]}|{type:"pointer",value:<string>}|{type:"var",key:<string>[,set:<pattern>]})

 #An array (basically a noncapturing group)
  Description: concantenated patterns, or a progression/sequence/continuum of patterns 
  def:<pattern>[]
  Usage example: [pattern1,pattern2]
   *they would be described in a native array of <pattern>s 

   *the result is an array of children results, if children don't result, no result is thrown.
   
 #A repetition/quantifier 
  Description: pattern, used in order to match repeated sequences*
  def:{type:"repetition",to:<int>,from:<int>,quantifier:("lazy"|"greedy"),child:<pattern>}
   *the result is an array of children results, if children don't result, no result is thrown.
  Well, I know this is a bit lazy, but I had to consider that repetitions could return two totally different results for alternation patterns
  TODO: indicate result repetition
  
 #(A choice|An alternation)
  Description: An alternation allows to match pattern or another pattern exclusively
  def:{type:"or",child:<pattern>[]}
  
#A (wildcard/range|character class)
  Description:allows a character to match the values given
  def:{type:"wildcard",value:({from:(<int>|<char>),to:(<int>|<char>)}|<char>)[][,negative:<boolean>]}
  Usage example: {type:"wildcard",value:[{from:5,to:7},"a","b"],negative:false}
  The range pattern value is an array which contains the desired characters to match, or an object containing a from, to. The latter is a range mathing the character codes.
  
  
#A pointer
  Description: a pointer allows recursiveness, so you can define many key patterns in grammar, and you switch to them
  def:  {type:"pointer",value:<string>}
  Usage example: {type:"pointer",value:"grammar"} //would point to the main key
 
#Variables
  def: {type:"variable",key:<string>[,value:<pattern>]}
  Usage example: {type:"var",key:"your key",set:node}
  When there is no "set" it will attempt to get the value of the variable.
 
#A string pattern 
  Description: matches a string literally
  def:<string>
  would be just described as a normal string
 
#An assertion (lookahead)
 def:{type:"assertion",value:<pattern>,[negative:<boolean>]}
 These are zero-length assertions like lookarounds or \b in regex, basically conditional expressions these are btw atomic
 
#A reverse statment
  Description: will start matching <pattern> in reverse, why would you do this? Doesn't reverse order of strings, so this will confuse you :)
  def:{type:"reverse",value:<pattern>}
  Usage example:{type:"reverse",value:["ab","ta"]}//will only match taab
  Normally matches are RTL but if you want to match it LTR that is fine too, please consider that this will just reverse the direction of the cursor, literal strings should work RTL just as fine, but arrays and other orbjects will be read as given
  (Nested reverses will match again RTL)
  
#An atomic node
  Description: makes a pattern atomic, Atomic nodes would disallow bakctracking when it does return.
  def: {type:"atomic",value:<pattern>} 
  
 
Note that regex /a?/ would be described as a quantifier pattern, like /a{0,1}/
for example, the pattern ["human",{type:"repetition",to:0,from:1,child:"s"}] would match "human" and "humans"
It's not intended for a programmer to write the pattern themselves, since they're mostly a translation of regex. a representation of em
*Alright but before we continue, we must first mention 2 patterns that can actually change its content, those are alternations and quantifiers.
because alternations and quantifiers can match before all their possibilities are tested, we need a way for them to store their state.

A restore triggers when parent expression indexOf is lesser than where restore is from.
*/

//So, this long expected "reader-macro begins"
var asdf=[]
function parse(parserSteppers, grammar, textToParse, parseContext, final, timeOut) { //function start
var counter=0
  /*Since coding this is taking way longer than usual, I'd better write the specifications of this function.
  This function takes a grammar, a string and a parseContext, it returns a parseContext. This function should be able to return parsing contexts for incomplete strings of data. It takes a parseContext if this function has been called before and it retakes the job from there.
  The grammar is specified in an object, the rules are above this function.
  textToParse is of type string, it's the string about to be parsed
  parseContext, is null, its only used when textToParse was "incomplete" last time, and now there's more information in order to finish parsing
  final, default to true, if false it means that the textToParse is not complete, and it will just attempt to parse what it can with what it has, it will halt when it cannot read more
  */
  /**/
  //Step constructor
  function Step(context, index) {
    if (!(context instanceof this.constructor)) { this.context = context;
    this.indexOf = index;
    this.startIndexOf = index;
    this.result = null }else{
      Object.assign(this,context)
      this.result=this.result&&this.result.slice(0)
      if(this.matches)this.matches=this.matches.slice(0)
    }
    this.restore = parseContext.restore;
    this.reverse = parseContext.reverse;
    //if(!this.context){throw new Error('No context given!')}
  }//This must be wrong, forgive me
    Step.prototype.grammarKey = function(val) {
      return grammar[val]
    }
    Step.prototype.variable = function() {
      return parseContext.variables
    }
    Step.prototype.isFinal=function(){
      return final;
    }
    if(final===void 0)final=true;
  if (!parseContext) { //if there is no parseContext, create one
    parseContext = { indexOf: 0, fail: false, restore: 0, result: null, variables:{},reverse:false };
    //A restore value is a map that contains 3 elements
    parseContext.root=new Tree("root")
    parseContext.stepInfo = parseContext.root.addChild(new Step(grammar.grammar, 0));
  }
  function stepInProcedure(context) {
    var startIndexOf = parseContext.stepInfo.data.indexOf;
    parseContext.stepInfo = parseContext.stepInfo.addChild(new Step(context, startIndexOf));
  }
  function stepOutProcedure(f) {
    //function is called when function has checked and it was to continue to the next iteration
    //f is a boolean value saying the match fail is true, if if is true, the match failed
    //fun fact: if the function returns false, it will bubble up until it finds a lower restorable value and then bubble down
    
    var childStep = parseContext.stepInfo, childData = childStep.data, s;
    parseContext.stepInfo = parseContext.stepInfo.parent;
    
      if (f&&(s=childStep.previousSibling())) {
        //If function failed but it has a sibling, restore that sibling
      parseContext.restore--;
      childStep.detachFromParent()
      while(s=s.getLastChild()){
        parseContext.stepInfo=s
      }
      parseContext.stepInfo.childStep=null
      parseContext.stepInfo.data.restored=true;
      return;
    } 
    if(parseContext.stepInfo.data=="root"){
        childData.fail = f
        return}
    if (childData.restore === parseContext.restore) {
      childStep.detachFromParent()
      /*if(parseContext.stepInfo.data.restore!== parseContext.restore){
        parseContext.stepInfo=parseContext.stepInfo.parent.addChild(new Step(parseContext.stepInfo.data))
        }*/
    }//else
       if(parseContext.stepInfo.data.restore!== parseContext.restore){
      parseContext.stepInfo=parseContext.stepInfo.parent.addChild(new Step(parseContext.stepInfo.data))
        
      }
      /*else {parseContext.stepInfo=new Step(parseContext.stepInfo.data);
      throw new Error('wait, no parent??');
      }*/
    
    parseContext.stepInfo.data.childStep = childData
    //THIS SHOULD BE SOME KIND OF PARENT FLAG
    childData.fail = f
    //NOOOOO parseContext.stepInfo.data.indexOf = childData.indexOf;
    return;
  }
  mainloop: //begins looping over grammar object
    do {
//console.log('executed mainloop');
      var match = parseContext.stepInfo.data,
        type = getType(match.context);
      var stepper = parserSteppers[type],
        nextParseInstruction;
      if (type === "object") {
        stepper = stepper[match.context.type];
      }
      //coolTree=(function(){var ppapa="";parseContext.root.forEach(function(i,ii){    var t=getType(i.data.context);    if(i.data=="root"){t="root"}else if(t=="object"){        t=i.data.context.type;    }    i.string=ii+","+i.data.restore+": "+t+(t=="array"?" length:"+i.data.context.length+" iterator:"+i.data.iterator:"")+(t=="or"?" choices:"+i.data.context.choices.length+" iterator:"+i.data.iterator:"")+(t=="string"?":"+i.data.context:"")+(t=="pointer"?":"+i.data.context.value:"")+(t=="repetition"?", reps:"+(i.data.matches&&i.data.matches.length)+" "+i.data.context.quantifier:"");    if(i.parent&&i.parent.string)  ppapa+=JSON.stringify(i.parent.string)+"->"+JSON.stringify(i.string)+";\n";});return ppapa})
      function getResult(v){if(!v){return null}var m=[];m.push(v.data.result);if(v.children){m=m.concat(getResult(v.children[v.children.length-1]))};return m}
      coolTree2=(function(){
var ppapa="";parseContext.root.forEach(function(i,ii){
    
    var t=getType(i.data.context)
    if(i.data=="root"){t="root"}else if(t=="object"){
        t=i.data.context.type
    }
    i.string=i.data.restore+": "+t+(t=="array"?" length:"+i.data.context.length+" iterator:"+i.data.iterator:"")+(t=="or"?" choices:"+i.data.context.choices.length+" iterator:"+i.data.iterator:"")+(t=="string"?":"+i.data.context:"")+(t=="pointer"?":"+i.data.context.value:"")+(t=="repetition"?", reps:"+(i.data.matches&&i.data.matches.length)+" "+i.data.context.quantifier:"");
    
    ppapa+=Array.apply(this,Array(ii)).map(function(){return "│   "}).join('')+"├"+JSON.stringify(i.string)+"\n"
});return "Rollbacktree:"+ppapa+"\nLastResult:"+getResult(parseContext.root).join()})



      if(match.indexOf>textToParse.length){
        //why would the indexOf be bigger than the textToParse?  
        throw new Error('This should never happen, it means the method before has added too many elements to indexOf greater than the length of the text that must be parsed')
      }

      nextParseInstruction = stepper(match, textToParse);
      parseContext.reverse=match.reverse;
      if (type === "object"&&parserSteppers.meta.restorable.includes(match.context.type)) {
        if (nextParseInstruction[0] === parse.STEP_OUT) { nextParseInstruction[0] = parse.SaveStateOut }
      }
      //different instructions!
      switch (nextParseInstruction[0]) {
        case parse.THROW:
          if(parse.verbose)console.error(nextParseInstruction[1])
          match.failMsg=nextParseInstruction[1]
          stepOutProcedure(true, match);
          continue;
          break;
        case parse.STEP_IN:
          if(!nextParseInstruction[1]){
            throw new Error("Step requested a step in but no declared instruction to step into.")
          }
          stepInProcedure(nextParseInstruction[1]);
          continue;
          break;
        case parse.SaveStateOut:
          parseContext.restore++;
          //parseContext.restore = parseContext.restore.parent;
        case parse.STEP_OUT:
          stepOutProcedure(false);
          break;
        case parse.HALT:
          if(parse.verbose)console.log("parser halted")
          break mainloop;
          break;
      }
      continue;
    } while (parseContext.stepInfo.data!=="root");
    parseContext.result=parseContext.root.getLastChild().data.result
    parseContext.fail=!!parseContext.root.getLastChild().data.fail
    //debugger;
  return parseContext;
}
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
      return { type: "wildcard", value: [{ from: "\u0009", to: "\u000D" }, " ", "", " ", " ", { from: "", to: "‍" }, "\
", "\
", " ", " ", "　", "᠎", "⁠", "﻿"], negative: negative };
      break;
    default:
      if (/[\s\S]-[\s\S]/.test(type)) {
        return { type: "wildcard", value: [{ from: type[0], to: type[2] }], negative: negative };
      }
      break;
  }
}
parse.verbose=false;
parse.STEP_OUT = 1
parse.STEP_IN = 2
parse.RemoveNode = 6;
parse.THROW = 0
parse.HALT = 3; //it haltes loop without going further in or out
parse.SaveStateOut = 4;
parse.SaveStateIn = 5;
/*
expressionFeatures is basically an object that defines how the grammar object should be interpreted BY STEPS!
*/
var expressionFeatures = {
  array: function sequence(match) {
    //check if child has errored, sequence ensures that everything should be matched, therefore error will bubble up, parse.THROW
    if (match.childStep) {
      if (match.childStep.fail) {
        return [parse.THROW, "Array Error: Sequence: didn't match completely. Children have errored. At index " + match.indexOf]
      }
      //If children returned result, then
      if (match.childStep.result) {
        //if local result doesn't exist, create one
        if (!match.result) { match.result = []; }
        //push result
        match.result.push(match.childStep.result);
        //clear global result
      }
      if(match.childStep.indexOf!==match.indexOf){
    	match.indexOf=match.childStep.indexOf
    }
    }
    //create iterator if not already created
    match.iterator|=0;
    //get next iteration
    var val = match.context[match.iterator++];
    //if iteration is not undefined parse.STEP_IN into next iteration
    if (val !== undefined) {
      return [parse.STEP_IN, val]
    }
    //otherwise parse.STEP_OUT
    else {
      return [parse.STEP_OUT];
    }
  },
  string: function literalmatch(match, textToParse) {
    //Note: I had to add comments because reading was truly a pain
    //trim text to parse to be as long as string to match (from indexOf), let that. be str
    var str = textToParse.substr(match.indexOf-(match.reverse?match.context.length:0), match.context.length),
      //trim string to match, to be as long as str is (from match.indexOf-parseContext.indexOf), let that be str2
      str2 = match.context.substr(match.indexOf - match.startIndexOf, str.length)
    //str2 is needed in order to match partial matches when the text to parse is incomplete
    //match.indexOf is local indexOf, this will be different from parseContext.indexOf (the expressionFeature indexOf) if parser has been halted before
    //if str equals str2
    if (str === str2) {
      //match.indexOf (cursor) is moved the str (or str2) distance
      match.indexOf += str.length*(match.reverse?-1:1);
      //if string to match is longer than str then HALT (assume that text to parse is not complete)
      if (match.context.length > str.length) {
        if(match.isFinal())return [parse.THROW,"String match: EOF Reached"]
        return [parse.HALT]
      }
      else {
        //else parse.STEP_OUT
        //no result because literal match is literal
        match.result=str2;//result because debugging.
        return [parse.STEP_OUT];
      }
    }
    //else parse.THROW
    else {
      //debugger
      return [parse.THROW, "String Error: expected \"" + match.context + "\", found \"" + str + "\" at index:" + match.indexOf]
    }
  },
  meta: { restorable: ["repetition", "or"] },
  object: {
    repetition: function quantifier(match) {
      //Repetitions can be greedy, lazy, possessive
      //if match.matches doesn't exist create one
      //match.matches is used to store the different matches that the repetition has caught.
      if (!match.matches) {
        match.matches = []
      }
            //if parse tree was restored
      //then keep trying to match another option, if greedy take 1 less, if lazy take 1 more
      if (match.restored) {
        match.restored = false;
        switch (match.context.quantifier) {
          case "greedy":
            //attempt to take 1 less unit, if there is less than from, repetition fails
            if (match.matches.length > match.context.from) {
              match.matches.pop();
              //match.result.pop();
              match.indexOf = match.matches[match.matches.length - 1]
              return [parse.STEP_OUT]
            }
            else {
              return [parse.THROW, "Attempted to take 1 less unit in greedy pattern, in " + match.indexOf + " but doing so exceeded the defined bounds."]
            }
            break;
          case "lazy":
            //attempt to take 1 more unit, if it fails, repetition fails
            if (match.matches.length < match.context.to) {
              match.lazypass = true;
              //despite the pattern is lazy, it has failed so it must take the following step
            }
            else {
              return [parse.THROW, "Attempted to take 1 more unit in lazy pattern, in " + match.indexOf + " but doing so exceeded the defined bounds."]
            }
            break;
        }
      }
      //if children returned result
      else if (match.childStep) {
        if (match.childStep.result) {
          if (!match.result) {
            match.result = [];
          }
          match.result.push(match.childStep.result);
          match.matches.push(match.indexOf)
        }
        //Reasons for Repetition to end
        //Repetition iteration threw error while trying to match next repetition item
        //Repetition reached maximum number of items
        if (match.childStep.fail || (match.matches.length === match.context.to)) { //could be restored, or could be group value was falsy
          //Not bubbling errors up.
          //if loop failed
          //check if loop requirements match or if its lazy (if it's lazy that means that an attempt to match failed therefore pattern failed to match)
          if ((match.context.quantifier !== "lazy") && (match.context.from <= match.matches.length && match.context.to >= match.matches.length)) {
            //requirements seem to fit!
            if(match.childStep.indexOf){
              match.indexOf=match.childStep.indexOf
            }
            return [parse.STEP_OUT]
          }
          else { //requirements dont match
            return [parse.THROW, "Repetition ended at " + match.indexOf + " and either repetition exceeded bounds or failed matching a lazy pattern"]
          }
        }
      }
      //if iterator is bigger than from and it is lazy but its not lazypassed, then
      if ((match.matches.length > match.context.from) && (match.context.quantifier === "lazy") && (!match.lazypass)) {
        if(match.childStep.indexOf){
              match.indexOf=match.childStep.indexOf
            }
        return [parse.STEP_OUT]
      }
      match.lazypass = false;
      return [parse.STEP_IN, match.context.child];
    },
    pointer: function(match, textToParse) {
      if (match.childStep) {
        if(match.childStep.fail)
        return [parse.THROW,"pointer failed"]
        match.result = match.childStep.result;
        match.indexOf=match.childStep.indexOf
        return [parse.STEP_OUT];
      }
      return [parse.STEP_IN, match.grammarKey(match.context.value)];
    },
    or: function alternation(match) { //well shit
      //{type:"or",child:node[]}
      if (match.childStep) {
        if ((match.childStep.fail||match.restored) && (match.context.choices.length === match.iterator)) { //none of the choices work
          return [parse.THROW, "Alternation Error: None of the options in the alternation match. At index " + match.indexOf]
        }
        else if ((!match.childStep.fail) && (match.iterator !== undefined)) {
          if(match.childStep.result){
          match.result = match.childStep.result;
          }else{
            match.result=match.iterator
          }
          match.indexOf=match.childStep.indexOf
          return [parse.STEP_OUT];
        }
      }

      match.iterator |=0;
      var v = match.context.choices[match.iterator++];
      if (v) {
        return [parse.STEP_IN, v];
      }
      else {
        return [parse.THROW, "Alternation Error: None of the options in the alternation match. At index " + match.indexOf]
      }
    },
    //wildcard always matches a character
    wildcard:function wildcard(match,text){
//{type:"wildcard",value:[{from:5,to:7},"a","b"],negative:false}
      var t=text[match.indexOf-match.reverse],v
      if(!t)    return [parse.THROW,"Wildcard can't match empty string"];
      v=match.context.value.find(function(a){if(typeof a==="object"){return a.to>=t.charCodeAt()>=a.from}else{return a===t}})
      v=match.context.negative?(v?false:t):v;
      if(t===""){
        if(match.isFinal()){
            return [parse.THROW,"Wildcard can't match empty string"];
        }else{
        return [parse.HALT];
        }
        
      }
      if (v) {
        match.result=t;
        //I SERIOUSLY CHANGING THE INDEXOF WHEN THE END OF 
        match.indexOf+=(match.reverse&&-1)|1;//match.reverse?-1:1
        return [parse.STEP_OUT];
      }
      else {
        return [parse.THROW, "No value for wildcard"]
      }
    },reverse:function(match){
      match.reverse=!match.reverse
      if(match.childStep){
        if(match.childStep.fail) return [parse.THROW,match.childStep.failMsg]
        match.result=match.childStep.result;
        match.indexOf=match.childStep.indexOf
        return [parse.STEP_OUT]
      }
      return [match.STEP_IN,match.context.value]
    },variable:function(match){
      var variables=match.variable();
      if(match.childStep){
        //I think most steps return a result and an indexOf to parent
        if(match.childStep.fail) return [parse.THROW,match.childStep.failMsg]
        match.result=variables[match.context.key]=match.childStep.result;
        match.indexOf=match.childStep.indexOf
        return [parse.STEP_OUT]
      }
      if(typeof match.context.value=="undefined"){
        match.result=variables[match.context.key]
        if(!match.result){
          throw new ReferenceError("Value is undefined, and there is no variableKey \""+match.context.key+"\" set.")
        }
        return [parse.STEP_IN,match.result]
      }else{
        return [parse.STEP_IN,match.context.value]
      }
    },assertion:function(match,text){
      //{type:"assertion",value:<pattern>,[negative:<boolean>]}
       if(match.childStep){
        if(match.childStep.fail!==match.negative) 
        return [parse.STEP_OUT]
      }
      //EOF assertions
      if(match.context.value===""){
        if(match.indexOf===text.length){
          return [parse.STEP_OUT]
        }else{
          return [parse.THROW,"Assertion failed"]
        }
      }
      return [match.STEP_IN,match.context.value]
      
    },atomic:function(match){
      match.atomicity=match.restore;
     if(match.childStep){
        if(match.childStep.fail) return [parse.THROW,match.childStep.failMsg]
        match.result=match.childStep.result;
        match.indexOf=match.childStep.indexOf
        return [parse.STEP_OUT]
      }
      return [match.STEP_IN,match.context.value]
    }
  },
  null: function() { return [parse.THROW, "attempted to match null"] }
}

parse(expressionFeatures, regexGrammar, "/hell" /*+ "o/"*/);

