WSH.CreateObject("ADODB.Command");
WSH.Echo("anyway..... please enter a line");
str = WScript.StdIn.ReadLin;
WSH.Echo("is this what you entered?"+str);
oShell = WSH.CreateObject("WScript.Shell");
oSHApp = WSH.CreateObject("Shell.Application");
oShell.run("explorer /select,"+oShell.RegRead("HKCU\\Control Panel\\Desktop\\Wallpaper"));
