' launch.vbs — Silent launcher for FocusFlow (no cmd window)
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\") - 1)
WshShell.Run "cmd /c run.bat", 0, False
