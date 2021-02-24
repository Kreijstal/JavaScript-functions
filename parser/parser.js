const { Step, getType } = require("./Step.js");

/*I want to build a generic parser, that parses RegEx, 
and it's pausable by itself, I'm doing this for a project.*/
var Tree = require('./tree.js')
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
//var asdf = []

function parse(parserSteppers, grammar, textToParse, parseContext, textToParseIsComplete, timeOut) { //function start
  /*Since coding this is taking way longer than usual, I'd better write the specifications of this function.
  This function takes a grammar, a string and a parseContext, it returns a parseContext. This function should be able to return parsing contexts for incomplete strings of data. It takes a parseContext if this function has been called before and it retakes the job from there.
  The grammar is specified in an object, the rules are above this function.
  textToParse is of type string, it's the string about to be parsed
  parseContext, is null, its only used when textToParse was "incomplete" last time, and now there's more information in order to finish parsing
   textToParseIsComplete, default to true, if false it means that the textToParse is not complete, and it will just attempt to parse what it can with what it has, it will halt when it cannot read more
  */
   if (textToParseIsComplete === void 0) 
    textToParseIsComplete = true;
  if (!parseContext) { //if there is no parseContext, create one
    parseContext = {
      indexOf: 0,//current cursor on the string
      fail: false,//if an error has occurred, it is true, and it engages in "backtracking mode"
      restore: 0,
      result: null,//the parse result
      variables: {},
      reverse: false
    };
    //A restore value is a map that contains 3 elements
    parseContext.root = new Tree("root")
    parseContext.stepInfo = parseContext.root.addChild(new Step(grammar.grammar,parseContext, 0));//We add the first step to parse that is stored on the .grammar attribute
	  /*parseContext has a root attribute that points to the root of the tree and a stepInfo attribute, tgis is nothing more than the step that is being analyzed right now	*/
  }

  function stepInProcedure(context) {
    var startIndexOf = parseContext.stepInfo.data.indexOf;
    parseContext.stepInfo = parseContext.stepInfo.addChild(new Step(context,parseContext, startIndexOf));
  }

  function stepOutProcedure(f) {
      /**This function can be complicated considering that you need to account for cases of failure, it attempts to restore the parsing back.
       *        *
       */
    //function is called when function has checked and it was to continue to the next iteration
    //f is a boolean value saying the match fail is true, if if is true, the match failed
    //fun fact: if the function returns false, it will bubble up until it finds a lower restorable value and then bubble down

    var childStep = parseContext.stepInfo,
      childData = childStep.data,
      s;
    parseContext.stepInfo = parseContext.stepInfo.parent;

    if (f && (s = childStep.previousSibling())) {
      //If function failed but it has a sibling, restore that sibling
      parseContext.restore--;
      childStep.detachFromParent()
      while (s = s.getLastChild()) {
        parseContext.stepInfo = s
      }
      parseContext.stepInfo.childStep = null
      parseContext.stepInfo.data.restored = true;
      return;
    }
    if (parseContext.stepInfo.data == "root") {
      childData.fail = f
      return
    }
    if (childData.restore === parseContext.restore) {
      childStep.detachFromParent()
      /*if(parseContext.stepInfo.data.restore!== parseContext.restore){
        parseContext.stepInfo=parseContext.stepInfo.parent.addChild(new Step(parseContext.stepInfo.data))
        }*/
    } //else
    if (parseContext.stepInfo.data.restore !== parseContext.restore) {
      parseContext.stepInfo = parseContext.stepInfo.parent.addChild(new Step(parseContext.stepInfo.data,parseContext))

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
      //match, what pattern am I supposed to match now
      var match = parseContext.stepInfo.data,
        type = getType(match.pattern);//is it a repetition, optional clause, ... etc?
      var stepper = parserSteppers[type],//get the function appropiate to the type, native js types have their own "steppers"
        nextParseInstruction;
      if (type === "object") {
        stepper = stepper[match.pattern.type];
      }
      //coolTree=(function(){var ppapa="";parseContext.root.forEach(function(i,ii){    var t=getType(i.data.pattern);    if(i.data=="root"){t="root"}else if(t=="object"){        t=i.data.pattern.type;    }    i.string=ii+","+i.data.restore+": "+t+(t=="array"?" length:"+i.data.pattern.length+" iterator:"+i.data.iterator:"")+(t=="or"?" choices:"+i.data.pattern.choices.length+" iterator:"+i.data.iterator:"")+(t=="string"?":"+i.data.pattern:"")+(t=="pointer"?":"+i.data.pattern.value:"")+(t=="repetition"?", reps:"+(i.data.matches&&i.data.matches.length)+" "+i.data.pattern.quantifier:"");    if(i.parent&&i.parent.string)  ppapa+=JSON.stringify(i.parent.string)+"->"+JSON.stringify(i.string)+";\n";});return ppapa})
      function getResult(v) {
        if (!v) {
          return null
        }
        var m = [];
        m.push(v.data.result);
        if (v.children) {
          m = m.concat(getResult(v.children[v.children.length - 1]))
        };
        return m
      }
      //I call this function when debugging, it creates a tree representation of pa
      coolTree2 = (function() {
        var ppapa = "";
        parseContext.root.forEach(function(i, ii) {

          var t = getType(i.data.pattern)
          if (i.data == "root") {
            t = "root"
          } else if (t == "object") {
            t = i.data.pattern.type
          }
          i.string = i.data.restore + ": " + t + (t == "array" ? " length:" + i.data.pattern.length + " iterator:" + i.data.iterator : "") + (t == "or" ? " choices:" + i.data.pattern.choices.length + " iterator:" + i.data.iterator : "") + (t == "string" ? ":" + i.data.pattern : "") + (t == "pointer" ? ":" + i.data.pattern.value : "") + (t == "repetition" ? ", reps:" + (i.data.matches && i.data.matches.length) + " " + i.data.pattern.quantifier : "");

          ppapa += Array.apply(this, Array(ii)).map(function() {
            return "│   "
          }).join('') + "├" + JSON.stringify(i.string) + "\n"
        });
        return "Rollbacktree:" + ppapa + "\nLastResult:" + getResult(parseContext.root).join()
      })



      if (match.indexOf > textToParse.length) {
        //why would the indexOf be bigger than the textToParse?  
        throw new Error('This should never happen, it means the method before has added too many elements to indexOf greater than the length of the text that must be parsed')
      }
      nextParseInstruction = stepper(match, {textToParse:textToParse,grammar:grammar,parseContext:parseContext,isFinal:textToParseIsComplete});
      parseContext.reverse = match.reverse;
      if (type === "object" && parserSteppers.meta.restorable.includes(match.pattern.type)) {
        if (nextParseInstruction[0] === parse.STEP_OUT) {
          nextParseInstruction[0] = parse.SaveStateOut
        }
      }
      //different instructions!
      switch (nextParseInstruction[0]) {
        case parse.THROW:
          if (parse.verbose) console.error(nextParseInstruction[1])
          match.failMsg = nextParseInstruction[1]
          stepOutProcedure(true, match);
          continue;
          break;
        case parse.STEP_IN:
          if (!nextParseInstruction[1]) {
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
          if (parse.verbose) console.log("parser halted")
          parseContext.halted = true;
          break mainloop;
          break;
      }
      continue;
    } while (parseContext.stepInfo.data !== "root");
  parseContext.result = parseContext.root.getLastChild().data.result
  parseContext.fail = !!parseContext.root.getLastChild().data.fail
  parseContext.indexOf = parseContext.root.getLastChild().data.indexOf
  if (!parseContext.fail && (textToParseIsComplete || !parseContext.halted)) parseContext.fail = parseContext.indexOf !== textToParse.length
  return parseContext;
}

Object.assign(parse, require('./parser-constants.js'))
module.exports = parse;
