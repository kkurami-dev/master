[System.String]$currentPath=Split-Path ( & { $myInvocation.ScriptName } ) -parent
. "$($currentPath)\KeyFunctions.ps1"
. "$($currentPath)\KeyFunctions2.ps1"

$count = 0
while ($count -lt 200) {
    .\KeyClick.ps1 $count
    $count++
}

return
