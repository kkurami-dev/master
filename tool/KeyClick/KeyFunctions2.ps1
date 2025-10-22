#
# 共通関数を使った操作関連
#
function Global:TAB1ON {
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

function Global:StartCheck {
    sendTimePrint -Arg1 360 -Arg2 "n"
    if ((checkClip -key "ACTOK") -ne 1) {
        Start-Sleep -Milliseconds 200
    } elseif ((checkClip -key "TAB0") -ne 1) {
        sendKeyCode -name "TAB" -wait 200
        Start-Sleep -Milliseconds 100
    } elseif ((checkClip -key "TAB1") -ne 1) {
        if ((checkClip -key "SUBHPok") -ne 1) {
            return
        }
        sendMouseLeft -posname "tab-update"
        Start-Sleep -Milliseconds 100
        sendMouseLeft -posname "tab-1"
        Start-Sleep -Milliseconds 50
        if ((checkClip -key "HPOK") -eq 1) {
            # 戦闘開始
            sendMouseLeft -posname "tab-1"
            return
        } elseif ((checkClip -key "HPNG") -eq 1) {
            # 戦闘保留
            sendMouseRight
            Start-Sleep -Milliseconds 5000
        } else {
            # 敵選択できなかった
            sendKeyCode -name "UP" -wait 400
            sendKeyCode -name "DOWN" -wait 400
            Start-Sleep -Milliseconds 500
        }
    } else {
        # 戦闘中
        return
    }
    $ErrorActionPreference = "SilentlyContinue"
    throw "終了"
}
