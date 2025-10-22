[System.String]$currentPath=Split-Path ( & { $myInvocation.ScriptName } ) -parent
. "$($currentPath)\KeyFunctions.ps1"

$VK_TAB = 0x09
$VK_A = 0xBC

# getScreenCap -h 1824 -w 2732
# getScreenClip -x 2491 -y 1526 -width 35 -height 35 -name "ACTOK"
# Start-Sleep -Milliseconds 3000
# return

Function hpCheck {
    $hplow = checkClip -key "HPOK"
    if ($hplow -ne 1) {
        Start-Sleep -Milliseconds 200
    } else {
        return 1
    }

    # îOÇÃÇΩÇﬂçƒämîF
    $hplow = checkClip -key "HPOK"
    if ($hplow -ne 1) {
        sendMouseRight
        Start-Sleep -Milliseconds 5000
        return 0
    }
    return 1
}

if((checkClip -key "ACTOK") -ne 1){
    Start-Sleep -Milliseconds 3000
    return
}

sendKeyStr -Arg1 "f"
if ((hpCheck) -eq 1){
    sendKeyStr -Arg1 "f"
    Start-Sleep -Milliseconds 500
}

sendKeyCode -vk_key $VK_A -wait 300
sendKeyCode -vk_key $VK_TAB -wait 50

sendTimeKeys -time 6 -key "1"
sendTimeKeys -time 802 -key "8"

sendTimePrint -Arg1 360 -Arg2 "n"
Start-Sleep -Milliseconds 500
sendMouseRight

