[System.String]$currentPath=Split-Path ( & { $myInvocation.ScriptName } ) -parent
. "$($currentPath)\KeyFunctions.ps1"
. "$($currentPath)\KeyFunctions2.ps1"

#Start-Transcript -Path "$($currentPath)\data\log.txt"

$count = 0
while ($count -lt 100) {
    .\KeyClick.ps1
    $count++
}

return
