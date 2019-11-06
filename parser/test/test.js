var assert = require('assert');
var lang=require('../lang.js');
var expressionFeatures=require('../lang.js')
var regexGrammar=require('../regex-rules.js')
var parse=require('../parser.js')
//We first test the sum of the parts because I wrote the code first like 10 years ago so it is easier for me for now
//
describe('parse expression features',function(){
   it('match strings verbatim',function(){
	  var a=parse(expressionFeatures, {grammar:"string"}, "string" ,null,false);
          assert.equal("string",a.result);
          assert.equal(false,a.fail);
          a=parse(expressionFeatures, {grammar:"string"}, "string" );
          assert.equal("string",a.result);
          assert.equal(false,a.fail);

   });
   it('match strings even when the given string is longer, it however says it failed to match',function(){
	  var a=parse(expressionFeatures, {grammar:"string"}, "stringbabalb" ,null,false);
          assert.equal("string",a.result);
          assert.equal(true,a.fail);
          a=parse(expressionFeatures, {grammar:"string"}, "stringsomething" );
          assert.equal("string",a.result);
          assert.equal(true,a.fail);
   });
   it('match every element of an array',function(){
	  var a=parse(expressionFeatures, {grammar:["s","t","r","i","n","g"]}, "string" ,null,false);
          assert.deepStrictEqual(["s","t","r","i","n","g"],a.result);
          assert.equal(false,a.fail);
          a=parse(expressionFeatures, {grammar:["s","t","r","i","n","g"]}, "string" );
          assert.deepStrictEqual(["s","t","r","i","n","g"],a.result);
          assert.equal(false,a.fail);

   });
   it('match a wildcard: a range of chars',function(){
	  var a=parse(expressionFeatures, {grammar:{type:"wildcard",value:[{from:0x30,to:0x39}]}}, "8" ,null,false);
	 //when the char is the same
          assert.equal(false,a.fail);
	  assert.equal("8",a.result);
	  //when is not.
          a=parse(expressionFeatures, {grammar:{type:"wildcard",value:[{from:0x30,to:0x39}],negative:true}}, "a" ,null,false);
          assert.equal(true,a.fail);


   });
   it('match a wildcard: anything but a range of chars',function(){
	  var a=parse(expressionFeatures, {grammar:{type:"wildcard",value:[{from:0x30,to:0x39}],negative:true}}, "a" ,null,false);
          assert.equal(false,a.fail);
	  assert.equal("a",a.result)
          a=parse(expressionFeatures, {grammar:{type:"wildcard",value:[{from:0x30,to:0x39}],negative:true}}, "8" ,null,false);
          assert.equal(true,a.fail);
	 
   });





})


describe('parse regex grammar', function() {
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
