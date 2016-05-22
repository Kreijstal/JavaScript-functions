var k,Shell=WScript.CreateObject("WScript.Shell")
function print(text){
    WScript.StdOut.WriteLine(text);
};
function quit(){
    WScript.quit(1);
};
WScript.StdOut.Write("JS "+Shell.CurrentDirectory+">")
while(!WScript.StdIn.AtEndOfStream){
    try{
	k=eval(WScript.StdIn.ReadLine())
        print("JS "+(typeof k)+">"+k);
        WScript.StdOut.Write("JS "+Shell.CurrentDirectory+">");
    }catch(e){
        print(e.name+":"+e.message);
    };
};
WScript.StdOut.WriteLine("bye!" + "\r\n");
