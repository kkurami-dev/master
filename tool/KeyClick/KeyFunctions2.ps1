#
# 共通関数を使った操作関連
#
function Global:TAB1-ON {
    Param([int]$max)
    $count = 1

    $ontab = check-Clip -key "TAB1"
    while($ontab -eq 1 -and $count -lt $max) {
        Start-Sleep -Milliseconds 100
        $ontab = check-Clip -key "TAB1"
        $count += 100
    }

    return $ontab
}

function Global:Start-Check([int]$fast) {
    $stopLine = Get-Content "data\stop.txt" -Tail 1
    $lastLine = Get-Content "data\log.txt" -Tail 1
    $sstr = $lastLine.Substring(0,1)
    if ($stopLine -eq 1 -or (check-Clip -key "ACTOK") -ne 1) {
        # 操作できない状態
        Start-Sleep -Milliseconds 3000
        $ErrorActionPreference = "SilentlyContinue"
        return -1
    }
    if ((check-Clip -key "TAB0") -ne 1) {
        # TAB表示していない
        send-KeyStr -Arg1 "f"
        send-MouseRight
        send-KeyCode -name "TAB" -wait 300
        return -2
    }

    if ((check-Clip -key "TAB1") -eq 1) {
        # 戦闘中
        if ($sstr -ne 1 -and $sstr -ne 3) {
            send-MouseLeft -posname "tab-1"
        }
        return 1
    }

    if ($sstr -ne 3 -and $sstr -ne 4){
        send-MouseLeft -posname "tab-update"
        Start-Sleep -Milliseconds 30
    }

    $res = 0
    if ((check-Clip -key "MOB01") -ne 1) {
        # 先頭がモブではない
        send-KeyCode -name "DOWN" -wait 200
        $res = -3
    } elseif ((check-Clip -key "TAB1") -eq 1) {
        # 攻撃を受けている
        send-MouseLeft -posname "tab-1"
        send-KeyStr -Arg1 "f"
        return 2
    } elseif ((check-Clip -key "SUBHPok") -ne 1) {
        # 仲間のHP低下で戦闘保留
        $res = -4
    } elseif ((check-Clip -key "HPOK") -eq 1) {
        [int]$istr = $lastLine.Substring(2,2)
        if ($istr -gt 20) {
            send-MouseRight
            send-KeyCode -name "UP" -wait 500
            send-KeyCode -name "DOWN" -wait 500
            send-MouseLeft -posname "tab-1"
            $sstr = 3
        }
        if ($sstr -eq 3) {
            send-KeyStr -Arg1 "f"
            return 4.01
        }
        if ($sstr -eq 4) {
            # 戦闘開始後の移動中など
            [double]$astr = $lastLine.Substring(0,4)
            $lstr = $astr + 0.01
            send-KeyStr -Arg1 "f"
            return $lstr
        }

        # 戦闘開始
        #send-MouseRight
        send-MouseLeft -posname "tab-1"
        send-KeyStr -Arg1 "f"
        Start-Sleep -Milliseconds 30
        send-KeyStr -Arg1 "f"
        return 3
    } elseif ((check-Clip -key "HPNG") -eq 1) {
        # HP 低下で戦闘保留
        if ($lastLine -ne -5) {
            Start-Sleep -Milliseconds 500
            send-KeyStr -Arg1 "x"
        }
        Start-Sleep -Milliseconds 1000
        return -5
    } else {
        # 敵選択できなかった
        # send-MouseLeft -posname "tab-1"
        # send-KeyCode -name "UP" -wait 400
        # send-KeyCode -name "DOWN" -wait 400
        #send-MouseRight
        Start-Sleep -Milliseconds 100
        send-KeyStr -Arg1 "f"
        Start-Sleep -Milliseconds 100
        return -6
    }

    Start-Sleep -Milliseconds 500
    #send-MouseRight
    return $res
}
