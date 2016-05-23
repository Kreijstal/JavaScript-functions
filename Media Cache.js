//How much should we love JScript?
//Seriously Tho, I never thought I would get this far with WSH.
//windows1252
;(function(root) {

	// Detect free variables `exports`.
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`.
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js/io.js or Browserified code,
	// and use it as `root`.
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var object = {};
	var hasOwnProperty = object.hasOwnProperty;
	var stringFromCharCode = String.fromCharCode;

	var INDEX_BY_CODE_POINT = {'129':1,'141':13,'143':15,'144':16,'157':29,'160':32,'161':33,'162':34,'163':35,'164':36,'165':37,'166':38,'167':39,'168':40,'169':41,'170':42,'171':43,'172':44,'173':45,'174':46,'175':47,'176':48,'177':49,'178':50,'179':51,'180':52,'181':53,'182':54,'183':55,'184':56,'185':57,'186':58,'187':59,'188':60,'189':61,'190':62,'191':63,'192':64,'193':65,'194':66,'195':67,'196':68,'197':69,'198':70,'199':71,'200':72,'201':73,'202':74,'203':75,'204':76,'205':77,'206':78,'207':79,'208':80,'209':81,'210':82,'211':83,'212':84,'213':85,'214':86,'215':87,'216':88,'217':89,'218':90,'219':91,'220':92,'221':93,'222':94,'223':95,'224':96,'225':97,'226':98,'227':99,'228':100,'229':101,'230':102,'231':103,'232':104,'233':105,'234':106,'235':107,'236':108,'237':109,'238':110,'239':111,'240':112,'241':113,'242':114,'243':115,'244':116,'245':117,'246':118,'247':119,'248':120,'249':121,'250':122,'251':123,'252':124,'253':125,'254':126,'255':127,'338':12,'339':28,'352':10,'353':26,'376':31,'381':14,'382':30,'402':3,'710':8,'732':24,'8211':22,'8212':23,'8216':17,'8217':18,'8218':2,'8220':19,'8221':20,'8222':4,'8224':6,'8225':7,'8226':21,'8230':5,'8240':9,'8249':11,'8250':27,'8364':0,'8482':25};
	var INDEX_BY_POINTER = {'0':'\u20AC','1':'\x81','2':'\u201A','3':'\u0192','4':'\u201E','5':'\u2026','6':'\u2020','7':'\u2021','8':'\u02C6','9':'\u2030','10':'\u0160','11':'\u2039','12':'\u0152','13':'\x8D','14':'\u017D','15':'\x8F','16':'\x90','17':'\u2018','18':'\u2019','19':'\u201C','20':'\u201D','21':'\u2022','22':'\u2013','23':'\u2014','24':'\u02DC','25':'\u2122','26':'\u0161','27':'\u203A','28':'\u0153','29':'\x9D','30':'\u017E','31':'\u0178','32':'\xA0','33':'\xA1','34':'\xA2','35':'\xA3','36':'\xA4','37':'\xA5','38':'\xA6','39':'\xA7','40':'\xA8','41':'\xA9','42':'\xAA','43':'\xAB','44':'\xAC','45':'\xAD','46':'\xAE','47':'\xAF','48':'\xB0','49':'\xB1','50':'\xB2','51':'\xB3','52':'\xB4','53':'\xB5','54':'\xB6','55':'\xB7','56':'\xB8','57':'\xB9','58':'\xBA','59':'\xBB','60':'\xBC','61':'\xBD','62':'\xBE','63':'\xBF','64':'\xC0','65':'\xC1','66':'\xC2','67':'\xC3','68':'\xC4','69':'\xC5','70':'\xC6','71':'\xC7','72':'\xC8','73':'\xC9','74':'\xCA','75':'\xCB','76':'\xCC','77':'\xCD','78':'\xCE','79':'\xCF','80':'\xD0','81':'\xD1','82':'\xD2','83':'\xD3','84':'\xD4','85':'\xD5','86':'\xD6','87':'\xD7','88':'\xD8','89':'\xD9','90':'\xDA','91':'\xDB','92':'\xDC','93':'\xDD','94':'\xDE','95':'\xDF','96':'\xE0','97':'\xE1','98':'\xE2','99':'\xE3','100':'\xE4','101':'\xE5','102':'\xE6','103':'\xE7','104':'\xE8','105':'\xE9','106':'\xEA','107':'\xEB','108':'\xEC','109':'\xED','110':'\xEE','111':'\xEF','112':'\xF0','113':'\xF1','114':'\xF2','115':'\xF3','116':'\xF4','117':'\xF5','118':'\xF6','119':'\xF7','120':'\xF8','121':'\xF9','122':'\xFA','123':'\xFB','124':'\xFC','125':'\xFD','126':'\xFE','127':'\xFF'};

	// https://encoding.spec.whatwg.org/#error-mode
	var error = function(codePoint, mode) {
		if (mode == 'replacement') {
			return '\uFFFD';
		}
		if (codePoint != null && mode == 'html') {
			return '&#' + codePoint + ';';
		}
		// Else, `mode == 'fatal'`.
		throw Error();
	};

	// https://encoding.spec.whatwg.org/#single-byte-decoder
	var decode = function(input, options) {
		var mode;
		if (options && options.mode) {
			mode = options.mode.toLowerCase();
		}
		// “An error mode […] is either `replacement` (default) or `fatal` for a
		// decoder.”
		if (mode != 'replacement' && mode != 'fatal') {
			mode = 'replacement';
		}
		var length = input.length;
		var index = -1;
		var byteValue;
		var pointer;
		var result = '';
		while (++index < length) {
			byteValue = input.charCodeAt(index);
			// “If `byte` is in the range `0x00` to `0x7F`, return a code point whose
			// value is `byte`.”
			if (byteValue >= 0x00 && byteValue <= 0x7F) {
				result += stringFromCharCode(byteValue);
				continue;
			}
			// “Let `code point` be the index code point for `byte − 0x80` in index
			// `single-byte`.”
			pointer = byteValue - 0x80;
			if (hasOwnProperty.call(INDEX_BY_POINTER, pointer)) {
				// “Return a code point whose value is `code point`.”
				result += INDEX_BY_POINTER[pointer];
			} else {
				// “If `code point` is `null`, return `error`.”
				result += error(null, mode);
			}
		}
		return result;
	};

	// https://encoding.spec.whatwg.org/#single-byte-encoder
	var encode = function(input, options) {
		var mode;
		if (options && options.mode) {
			mode = options.mode.toLowerCase();
		}
		// “An error mode […] is either `fatal` (default) or `HTML` for an
		// encoder.”
		if (mode != 'fatal' && mode != 'html') {
			mode = 'fatal';
		}
		var length = input.length;
		var index = -1;
		var codePoint;
		var pointer;
		var result = '';
		while (++index < length) {
			codePoint = input.charCodeAt(index);
			// “If `code point` is in the range U+0000 to U+007F, return a byte whose
			// value is `code point`.”
			if (codePoint >= 0x00 && codePoint <= 0x7F) {
				result += stringFromCharCode(codePoint);
				continue;
			}
			// “Let `pointer` be the index pointer for `code point` in index
			// `single-byte`.”
			if (hasOwnProperty.call(INDEX_BY_CODE_POINT, codePoint)) {
				pointer = INDEX_BY_CODE_POINT[codePoint];
				// “Return a byte whose value is `pointer + 0x80`.”
				result += stringFromCharCode(pointer + 0x80);
			} else {
				// “If `pointer` is `null`, return `error` with `code point`.”
				result += error(codePoint, mode);
			}
		}
		return result;
	};

	var windows1252 = {
		'encode': encode,
		'decode': decode,
		'labels': [
			'ansi_x3.4-1968',
			'ascii',
			'cp1252',
			'cp819',
			'csisolatin1',
			'ibm819',
			'iso-8859-1',
			'iso-ir-100',
			'iso8859-1',
			'iso88591',
			'iso_8859-1',
			'iso_8859-1:1987',
			'l1',
			'latin1',
			'us-ascii',
			'windows-1252',
			'x-cp1252'
		],
		'version': '0.1.2'
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return windows1252;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js, io.js or RingoJS v0.8.0+
			freeModule.exports = windows1252;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in windows1252) {
				windows1252.hasOwnProperty(key) && (freeExports[key] = windows1252[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.windows1252 = windows1252;
	}

}(this));

if (!Array.prototype.map) {

  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| 
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal 
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let A be a new array created as if by the expression new Array(len) 
    //    where Array is the standard built-in constructor with that name and 
    //    len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal 
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal 
        //    method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal 
        //     method of callback with T as the this value and argument 
        //     list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor
        // { Value: mappedValue,
        //   Writable: true,
        //   Enumerable: true,
        //   Configurable: true },
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, k, {
        //   value: mappedValue,
        //   writable: true,
        //   enumerable: true,
        //   configurable: true
        // });

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
}
var FSO=WScript.CreateObject("Scripting.FileSystemObject");
function readBinaryFile(filename){
var bin=WScript.CreateObject("ADODB.Stream");
bin.Type=1;
bin.Open();
bin.Charset="iso-8859-1";
bin.LoadFromFile(filename);
return bin.Read();
/*var file=FSO.getFile(filename);
if(!file)return;
var ret=[];
var stream=file.OpenAsTextStream(),x,charLimit=4000;
while(!stream.atEndOfStream&&charLimit--){
 ret.push(x=stream.read(1));
}
stream.close();
return ret;*/
}
function replaxe(matchy,extensions){
	var v;
	if(v=extensions[matchy]){return v;}
	return matchy
}
var extensions={JFIF:"jpg","\x1f\x8b":"gz",lame:"mp3"}
function saveBinaryFile(filename,bytearray){
var stream=FSO.createTextFile(filename);
stream.Write(bytearray);
stream.Close();
}
var WshShell = WScript.CreateObject("WScript.Shell");
var folder=FSO.GetFolder(WshShell.CurrentDirectory);
WScript.Echo(WshShell.CurrentDirectory);
// Reference the File collection of the Text directory
  	var FileCollection = folder.Files;
var strFileNames=[],strFileName,r=/f_(?:\d|[A-F])+/i,allFiles=[],currentFile={};
	for(var match,objEnum=new Enumerator(FileCollection);!objEnum.atEnd();objEnum.moveNext()) {
	
	  if(/\\f_\d+/.test(strFileName=FSO.GetAbsolutePathName(objEnum.item()))){
	  //WScript.Echo("Ehhh? "+objEnum.item());
	   strFileNames.push(strFileName);
	   if(match=(readBinaryFile(strFileName).join('')).match(/\x1f\x8b|webm|ogg|riff|png|gif|lame|mp4|jfif/i)){
//	   if(match[0]!=="PNG"&&match[0]!=="JFIF")WScript.Echo(strFileName);
	   if(currentFile.files){allFiles.push(currentFile);}
	   currentFile={files:[strFileName],ext:replaxe(match[0],extensions)};
	   }else{if(!currentFile.files)continue;currentFile.files.push(strFileName);}
	   };
	}
allFiles.push(currentFile);
function StringToArray(str){
for(var arr=[],i=0,l=str.length;i<l;i++){
arr[i]=str[i];
}
return arr;
}
//WScript.Echo(readBinaryFile(strFileNames[0]).join('').match(/webm|ogg/));
var sav;
/*WScript.Echo(allFiles);
WScript.Echo("lel");*/
for(var i=0,commands=[];i<allFiles.length;i++){
	if(allFiles[i].files[0].match(/[\da-f]+$/i)){
commands.push("copy /b \""+allFiles[i].files.join('" + "')+'" ' +
allFiles[i].files[0].match(/[\da-f]+$/i)[0]+
'_'+
allFiles[i].files[allFiles[i].files.length-1].match(/[\da-f]+$/i)[0]+
'.'+allFiles[i].ext);
	}
//WScript.Echo(commands[commands.length-1]);
}
function ASCIIToEncodedBatch(str){
return str.replace(/%/g,'%%').replace(/\^/g,'^^').replace(/[&\|<>"'`\=\\\/,;\(!\)0-9]/g,function(a){return '^'+a;}).replace(/[\n\r]/g,function(a){return '^'+a+a})
}

for(var i=0;i<commands.length;i++){
//WScript.Echo("cmd /c "+ASCIIToEncodedBatch(commands[i]));
WshShell.Run("cmd /c "+ASCIIToEncodedBatch(commands[i]),0);
}

WScript.Echo((commands));
