
//Step constructor
/**
 * This Step object is stored in a tree, the reason states are stored in a tree is that the parser must backtrack when it thinks it has found something but it hasnt, I can give you an example
 * imagine the words "complete" and "complicated", the parser will see c,o,m and it will try to match complete, but if the word is complicated, it has to backtrack, this parser is a dumb parser, but powerful, if you want to squeeze performance out of it, you should optimize your queries.
 * Okay, parse function is called with a grammar argument, this contains an object that have rules explaining how to parse the text given by textToPArse
 * context in this case is just one of those objects/patterns, index is the index.
 * A step is an object that contains all the information necessary for a stepper to procceed. They also work as snapshots of the parse state.
 * OK, steps should have information that must be preserved when parse exits
 * For example
 */
function Step(pattern, parseContext,index) {
    if (!(pattern instanceof this.constructor)) {
        this.pattern = pattern;
        this.indexOf = index;
        this.startIndexOf = index; //ok so basically, stepper functions modify this Step object, It's then necessary to know when the curring parsing step started
        this.result = null; //result returns an object containing what has been found, for example, if your  pattern says it wants a number between 2 and 8, then the result is the number that appeared in the textToParse
    }
    else {
        Object.assign(this, pattern);
        console.log("Assigning this.result the first value of the this.result array", this.result);
        this.result = this.result && this.result.slice(0);
        if (this.matches)
            this.matches = this.matches.slice(0);
    }
    this.restore = parseContext.restore;
    this.reverse = parseContext.reverse;
    //if(!this.context){throw new Error('No context given!')}
} //Forgiven :')


  function getType(value) { //returns a string getting the type of the object: array, object, integer, etc. Taken from Chrome's code.
  var s = typeof value;
  if (s == "object") {
    if (value === null) {
      return "null";
    } else if (Object.prototype.toString.call(value) == "[object Array]") {
      return "array";
    } else if (typeof(ArrayBuffer) != "undefined" &&
      value.constructor == ArrayBuffer) {
      return "binary";
    }
  } else if (s == "number") {
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
    } else {
      k = len + n;
      if (k < 0) {
        k = 0;
      }
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

function ParseContext(){


}
exports.Step = Step;
exports.getType = getType;
exports.ParseContext = ParseContext;
