[System.String]$currentPath=Split-Path ( & { $myInvocation.ScriptName } ) -parent
. "$($currentPath)\KeyFunctions.ps1"

$VK_TAB = 0x09
$VK_A = 0xBC

Start-Sleep -Milliseconds 1000
sendTimePrint -Arg1 360 -Arg2 "n"

# WAIT
# sendMouseLeft -posname "tab-update"
# sendMouseLeft -posname "tab-1"
# sendMouseRight
#return

# sendMouseLeft -posname "tab-update"
# sendMouseLeft -posname "tab-1"
# sendMouseLeft -posname "tab-1"
# Start-Sleep -Milliseconds 500

# Full
#getScreenClip -x 0 -y 0 -width 2732 -height 1824 -name "MP"
#getScreenClip -x 1312 -y 1435 -width 5 -height 17 -name "MP5-3"
# return

# sendKeyStr -Arg1 "f"
# Start-Sleep -Milliseconds 400
#getScreenClip -x 1220 -y 1440 -width 40 -height 15 -name "MP"
# sendKeyCode -vk_key $VK_A -wait 300
# sendMouseRight
# return

if ((checkClip -key "ACTOK") -ne 1){
    return;
} elseif ((checkClip -key "TAB") -ne 1) {
    sendKeyCode -vk_key $VK_TAB -wait 300
    return;
} elseif ((checkClip -key "TAB1") -ne 1) {
    if ((checkClip -key "SUBHPok") -ne 1){
        return;
    }
    sendMouseLeft -posname "tab-update"
    Start-Sleep -Milliseconds 200
    sendMouseLeft -posname "tab-1"
    Start-Sleep -Milliseconds 200
    if ((checkClip -key "HPOK") -eq 1) {
        # 戦闘開始
        #sendMouseLeft -posname "tab-1"
        Start-Sleep -Milliseconds 500
    } elseif ((checkClip -key "HPNG") -eq 1) {
        # 戦闘保留
        sendMouseRight
        Start-Sleep -Milliseconds 3000
    } else {
        # 敵選択できなかった
        sendKeyCode -name "UP" -wait 300
        sendKeyCode -name "DOWN" -wait 300
        Start-Sleep -Milliseconds 1000
    }
    return
}

if ((checkClip -key "MP5") -eq 1) {
    sendKeyStr -Arg1 "1"
    Start-Sleep -Milliseconds 3000
} else {
    # MP回復
    sendKeyStr -Arg1 "e"
    Start-Sleep -Milliseconds 3200
    sendMouseLeft -posname "tab-1"
}
return

# getScreenCap -h 1824 -w 2732
# Start-Sleep -Milliseconds 1000
# return
# getScreenClip -x 1233 -y 1440 -width 30 -height 20 -name "MPOK"
# Start-Sleep -Milliseconds 3000
# return

# 0: 操作不可
# 1: HP OK
# 2: HP NG
# 3: 非戦闘中
Function hpget {
    if ((checkClip -key "ACTOK") -ne 1){
        return 0;
    }

    if ((checkClip -key "HPOK") -eq 1){
        return 1;
    }
    if ((checkClip -key "HPNG") -eq 1) {
        return 2;
    }
    return 3
}
Function mpget {
    if ((checkClip -key "ACTOK") -ne 1){
        return 0;
    }

    if ((checkClip -key "MPOK") -eq 1){
        return 1;
    }
    if ((checkClip -key "MPNG") -eq 1) {
        return 2;
    }
    return 3
}

$hp = hpget
if($hp -eq 0){
    Start-Sleep -Milliseconds 3000
    return;
} elseif ($hp -eq 3){
    sendKeyCode -vk_key $VK_A -wait 300
    sendKeyStr -Arg1 "f"
    Start-Sleep -Milliseconds 200
    return;
}
sendKeyStr -Arg1 "f"
Start-Sleep -Milliseconds 1000

$mp = mpget
if ($mp -eq 2) {
    # MP回復
    sendKeyStr -Arg1 "e"
    Start-Sleep -Milliseconds 3200
} elseif ($mp -eq 1) {
    sendKeyCode -vk_key $VK_A -wait 100
}

# スキル発動
sendKeyStr -Arg1 "1"

# 終了処理
sendTimePrint -Arg1 360 -Arg2 "n"
Start-Sleep -Milliseconds 500
sendMouseRight
