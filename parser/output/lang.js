define(function (require, exports, module) {var parse=require('./parser-constants.js')
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
 t},
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
       if(match.childStep.indexOf){
              match.indexOf=match.childStep.indexOf
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
            return [parse.STEP_OUT]
          }
          else { //requirements dont match
            return [parse.THROW, "Repetition ended at " + match.indexOf + " and either repetition exceeded bounds or failed matching a lazy pattern"]
          }
        }
      }
      //if iterator is bigger than from and it is lazy but its not lazypassed, then
      if ((match.matches.length > match.context.from) && (match.context.quantifier === "lazy") && (!match.lazypass)) {
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
      if(!t&&match.isFinal())    return [parse.THROW,"Wildcard can't match empty string"];
      v=match.context.value.find(function(a){if(typeof a==="object"){return a.to>=t.charCodeAt()&&t.charCodeAt()>=a.from}else{return a===t}})
      v=match.context.negative?(v?false:t):v;
      if(t===""){
        return [parse.HALT];
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
module.exports = expressionFeatures;

});
