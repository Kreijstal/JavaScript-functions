
var objMessage = WScript.CreateObject("CDO.Message") 
objMessage.Subject = "Aw shit, nigga."; 
objMessage.From = "president@whitehouse.gov"; 
objMessage.To = "elektrishrainbow@gmail.com"; 
objMessage.TextBody = "Welp, you've been requested."; 
objMessage.Configuration.Fields.Item("http://schemas.microsoft.com/cdo/configuration/sendusing")=2;
objMessage.Configuration.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpserver")="74.125.196.27"
objMessage.Configuration.Fields.Update();
objMessage.Send();
