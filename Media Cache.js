//How much should we love JScript?
//Seriously Tho, I never thought I would get this far with WSH.
var FSO=WScript.CreateObject("Scripting.FileSystemObject");
function readBinaryFile(filename){
//var bin=WScript.CreateObject("ADODB.Stream");
/*bin.Type=1;
bin.Open();
bin.LoadFromFile(filename);
return bin.Read();*/
var file=FSO.getFile(filename);
if(!file)return;
var ret=[];
var stream=file.OpenAsTextStream(),x,charLimit=100;
while(!stream.atEndOfStream&&charLimit--){
 ret.push(x=stream.read(1));
}
stream.close();
return ret;
}
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
	   strFileNames.push(strFileName);
	   if(match=readBinaryFile(strFileName).join('').match(/webm|ogg|riff|png|gif/i)){
	   if(currentFile.files){allFiles.push(currentFile);}
	   currentFile={files:[strFileName],ext:match[0]};
	   }else{currentFile.files.push(strFileName);}
	   };
	}
function StringToArray(str){
for(var arr=[],i=0,l=str.length;i<l;i++){
arr[i]=str[i];
}
return arr;
}
//WScript.Echo(readBinaryFile(strFileNames[0]).join('').match(/webm|ogg/));
var sav;
for(var i=0,commands=[];i<allFiles.length;i++){
commands.push("copy /b \""+allFiles[i].files.join('" + "')+'" ' +
allFiles[i].files[0].match(/[\da-f]+$/i)[0]+
'_'+
allFiles[i].files[allFiles[i].files.length-1].match(/[\da-f]+$/i)[0]+
'.'+allFiles[i].ext);
}
function ASCIIToEncodedBatch(str){
return str.replace(/%/g,'%%').replace(/\^/g,'^^').replace(/[&\|<>"'`\=\\\/,;\(!\)0-9]/g,function(a){return '^'+a;}).replace(/[\n\r]/g,function(a){return '^'+a+a})
}

for(var i=0;i<commands.length;i++){
WScript.Echo("cmd /c "+ASCIIToEncodedBatch(commands[i]));
WshShell.Run("cmd /c "+ASCIIToEncodedBatch(commands[i]));
}

WScript.Echo((commands));
