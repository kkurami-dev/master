[System.String]$currentPath=Split-Path ( & { $myInvocation.ScriptName } ) -parent
. "$($currentPath)\KeyFunctions.ps1"

Start-Sleep -Milliseconds 50
sendTimePrint -Arg1 360 -Arg2 "n"

# WAIT
#return

# Full
#getScreenClip -x 0 -y 0 -width 2732 -height 1824 -name "FULL"
#getScreenClip -x 75 -y 225 -width 13 -height 5 -name "SUB"
# if ((checkClip -key "MP5") -eq 1){
#     sendKeyCode -name "TAB" -wait 300
# }
# Remove-Item data\SUB_*.png
# Remove-Item data\TMP_*.png

# return

function TAB1ON {
    Param([int]$max)
    $count = 1

    $ontab = checkClip -key "TAB1"
    while($ontab -eq 1 -and $count -lt $max) {
        Start-Sleep -Milliseconds 100
        $ontab = checkClip -key "TAB1"
        $count += 100
    }

    return $ontab
}

if ((checkClip -key "ACTOK") -ne 1) {
    return;
} elseif ((checkClip -key "TAB") -ne 1) {
    sendKeyCode -name "TAB" -wait 300
    return;
} elseif ((checkClip -key "TAB1") -ne 1) {
    # if ((checkClip -key "SUBHPok") -ne 1) {
    #     return;
    # }
    sendMouseLeft -posname "tab-update"
    Start-Sleep -Milliseconds 100
    sendMouseLeft -posname "tab-1"
    Start-Sleep -Milliseconds 200
    if ((checkClip -key "HPOK") -eq 1) {
        # êÌì¨äJén
        sendMouseLeft -posname "tab-1"
    } elseif ((checkClip -key "HPNG") -eq 1) {
        # êÌì¨ï€óØ
        sendMouseRight
        Start-Sleep -Milliseconds 2500
        return
    } else {
        # ìGëIëÇ≈Ç´Ç»Ç©Ç¡ÇΩ
        sendKeyCode -name "UP" -wait 300
        sendKeyCode -name "DOWN" -wait 300
        Start-Sleep -Milliseconds 500
        return
    }
}

$ontab = TAB1ON( 700 )

if ($ontab -ne 1) {
    return
} elseif ((checkClip -key "MP5") -eq 1) {
    sendKeyStr -Arg1 "1"
    $ontab = TAB1ON( 2000 )
} else {
    # MPâÒïú
    sendKeyStr -Arg1 "e"
    Start-Sleep -Milliseconds 2200
    sendMouseLeft -posname "tab-1"
}
