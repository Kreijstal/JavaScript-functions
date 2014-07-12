//My first Script.

/*This runs on WSH Which is Windows Script Host Object Model.
Currently I only know These Global Objects.

ActiveXObject
WSH

WScript
	WScript.CreateObject
 This basically uses some CLID program using HCKR\ keys, it instantaniates
 a COM \ ActiveX Object.

WshArguments 
WshNamed 
WshNetwork 
WshUnnamed 
WshController 
WshRemote 
WshRemoteError 
WshShell
WshShortcut 
WshSpecialFolders 
WshUrlShortcut 
WshEnvironment 
WshScriptExec 
*/
var obj1=WScript.CreateObject('Wscript.shell'),str='';
for(var x in obj1){str+=x+"\n";}
WScript.Echo(str);
//Inputbox("come here faggot.");
var vbe=new ActiveXObject("ScriptControl");
vbe.Language = "VBScript";
vbe.AllowUI = true;
vbe.eval("InputBox(\"Huehueuhe?\")");
//Output
/*WScript.Echo("Hue");
WScript.Echo(new Date);
WScript.sleep(100);
WScript.Echo(new Date);
WScript.Echo(new Date);
*/


//Input