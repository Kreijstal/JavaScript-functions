var assert = require('assert');
var lang=require('../lang.js');
var expressionFeatures=require('../lang.js')
var regexGrammar=require('../regex-rules.js')
var parse=require('../parser.js')
//We first test the sum of the parts because I wrote the code first like 10 years ago so it is easier for me for now
//
describe('parse', function() {
  it('should fail when the output is not complete according to the rules', function(){
    assert.equal(true, parse(expressionFeatures, regexGrammar, "/hell" /*+ "o/"*/).fail);
  });
  it('should "parse" the given string', function(){
	  //testing this made me realize the interface is very shitty
    assert.equal("/,h,e,l,l,o,/", parse(expressionFeatures, regexGrammar, "/hell"+ "o/").result.toString());
  });
  it('should stop when the output is not complete and the non complete flag is set to true', function(){
	  var a=parse(expressionFeatures, regexGrammar, "/hell" /*+ "o/"*/,null,false);
    assert.equal(false, a.fail);
    assert.equal(true, a.halted);
  });


});
