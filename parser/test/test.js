var assert = require('assert');
var expressionFeatures=require('../lang.js')
var regexGrammar=require('../regex-rules.js')
var parse=require('../parser.js')
const { Step, getType, ParseContext } = require("../Step.js");

describe("testing expression Features",function(){
    describe("strings stepper",function(){
        it("can match strings from an index",function(){
            var step=new Step("testing",new ParseContext,3)
            var stepperresult=expressionFeatures["string"](step,{textToParse:"ayytesting"});
           assert.equal(stepperresult[0],parse.STEP_OUT);
           //assert.equal(step.result,"testing");
           assert.equal(step.indexOf,"testing".length+3);

        });
        it("can match uncomplete strings",function(){
            var step=new Step("testing",new ParseContext,3)
            var stepperresult=expressionFeatures["string"](step,{textToParse:"ayytesti",isFinal:false});
            //console.log(stepperresult,step)
            assert.equal(stepperresult[0],parse.HALT);
           // assert.equal(step.result,"testing");
           assert.equal(step.indexOf,"testi".length+3);

        });
        it("can match strings in reverse",function(){
            var step=new Step("testing",new ParseContext,7)
            step.reverse=true;
            var stepperresult=expressionFeatures["string"](step,{textToParse:"testing",isFinal:false});
            //console.log(stepperresult,step)
            assert.equal(stepperresult[0],parse.STEP_OUT);
           // assert.equal(step.result,"testing");
           assert.equal(step.indexOf,0);

        });
        it("stops when the final is true ",function(){
            var step=new Step("testing",new ParseContext,3)
            var stepperresult=expressionFeatures["string"](step,{textToParse:"ayytesti",isFinal:true});
            //console.log(stepperresult,step)
            assert.equal(stepperresult[0],parse.THROW);
           // assert.equal(step.result,"testing");
           //assert.equal(step.indexOf,"testi".length+3);

        });
    })

})

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
      a=parse(expressionFeatures, {grammar:{type:"wildcard",value:[{from:0x30,to:0x39}]}}, "a" ,null,false);
      assert.equal(true,a.fail);
      assert.equal(null,a.result);
      //assert.equal("a",a.result);


   });
   it('match a wildcard: anything but a range of chars',function(){
	  var a=parse(expressionFeatures, {grammar:{type:"wildcard",value:[{from:0x30,to:0x39}],negative:true}}, "a" ,null,false);
          assert.equal(false,a.fail);
	  assert.equal("a",a.result)
          a=parse(expressionFeatures, {grammar:{type:"wildcard",value:[{from:0x30,to:0x39}],negative:true}}, "8" ,null,false);
          assert.equal(true,a.fail);
   });
   it('it should match repetitions expressions',function(){
	  var a=parse(expressionFeatures, {grammar:{type:"repetition",to:5,from:0,quantifier:"greedy",child:"a"}}, "a" );
          assert.equal(false,a.fail);
	      assert.equal(a.result.toString(),"a")
   
   });






})


describe('parse regex grammar', function() {
  it('should fail when the output is not complete according to the rules', function(){
    assert.equal(true, parse(expressionFeatures, regexGrammar, "/hell" /*+ "o/"*/).fail);
  });
  it('should "parse" the given string', function(){
      //testing this made me realize the interface is very shitty
      var result=parse(expressionFeatures, regexGrammar, "/hell"+ "o/");
     // console.log(result.result)
    assert.equal("/,h,e,l,l,o,/", result.result.toString());
  });
  it('should stop when the output is not complete and the non complete flag is set to true', function(){
	  var a=parse(expressionFeatures, regexGrammar, "/hell" /*+ "o/"*/,null,false);
    assert.equal(false, a.fail);
    assert.equal(true, a.halted);
  });


});
