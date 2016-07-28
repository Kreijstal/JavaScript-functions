//the other file got too big
//I  need help for someone to reorganize this
//I'm very disorganized!
    //This is one of the best ideas I've had
    //this swaps array values, and you can specify what matches what. and you don't even have to swap them anymore but execute random instructions
    //findValues is an array, it is either the element for comparison or a findFunction
    //usage:
    //mapValueWithInstructions(1,[1,2],[2,1]);-> 2
    //mapValueWithInstructions(2,[1,2],[2,1]);-> 1
    //mapValueWithInstructions("findThisElement",['in this list','findThisElement'],['and replace it or execute a function ','with the index it found']);
    //(doens't) swaps {object:"rock"} with {object:"cloud"}
    //it doesn't swap it, but it renames .object for the desired element;
    //mapValueWithInstructions({object:"rock"},[function(a){return a.object=="rock"},function(a){return a.object=="cloud"}],[function(a){a.object='cloud';return a},function(a){a.object='rock';return a}])
function mapValueWithInstructions(value,findValues,sortOrder){
    var x=sortOrder[findValues.findIndex(function(arg){return (typeof arg==="function")?arg(value):arg===value;})];
        if(x){if(typeof x=="function")
        return x(value);
        return x;
        }else return value;
}

function stretchTileFunction(callback,sx,sy){return function(x,y){return callback(Math.floor(x/sx),Math.floor(y/sy))}}

function coordinatesToIndex(x,y,width){return (x%width)+y*width;}
function indexToCoordinates(index,width){return [index%width,Math.floor(index/width)]}
