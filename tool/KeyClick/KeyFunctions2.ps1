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

function Global:Start-Battle01([int]$fast) {
    $stopLine = Get-Content "data\stop.txt" -Tail 1
    $astr, $sstr, $istr = Get-LogWithNumber
    if ($stopLine -eq 1 -or (check-Clip -key "ACTOK") -ne 1) {
        # 操作できない状態
        Start-Sleep -Milliseconds 10000
        write-Log -1
        return
    }
    if ((check-Clip -key "TAB0") -ne 1) {
        # TAB表示していない
        Send-MouseRight
        send-KeyCode -name "TAB" -wait 300
        write-Log -2
        Start-Sleep -Milliseconds 3000
        return
    }

    if ((check-Clip -key "TAB1") -eq 1) {
        # 戦闘中
        if ((check-Clip -key "MP2") -eq 1) {
            send-KeyStr -Arg1 "1"
            write-Log 5
            Start-Sleep -Milliseconds 1000
            return
        }

        Send-MouseRight
        send-MouseLeft -posname "tab-1"
        write-Log 4
        Start-Sleep -Milliseconds 1000
        return
    }

    if ((check-Clip -key "MOB01") -ne 1) {
        # 直近が艇ではない
        send-MouseLeft -posname "tab-update"
        write-Log 3
        return
    }
    if ((check-Clip -key "HPOK") -ne 1 -or (check-Clip -key "SUBHPok") -ne 1) {
        if ((check-Clip -key "HPON") -eq 1) {
            # HP低下
            send-KeyStr -Arg1 "x"
            write-Log -3
            Start-Sleep -Milliseconds 5000
            return
        } 

        # 敵未選択
        send-MouseLeft -posname "tab-1"
        write-Log -4
        return
    }
    if ($sstr -eq 1) {
        write-Log 2
        Start-Sleep -Milliseconds 1000
        return
    }

    send-MouseLeft -posname "tab-update"
    send-MouseLeft -posname "tab-1"
    send-MouseLeft -posname "tab-1"
    Start-Sleep -Milliseconds 200
    if ((check-Clip -key "TAB1") -eq 1) {
        write-Log 1
        Start-Sleep -Milliseconds 500
        return
    }

    write-Log 0
    return
}


function Global:Start-Fall([int]$fast) {
    1..2 | ForEach-Object {
        send-KeyStr -Arg1 "f"
        send-KeyStr -Arg1 "f"
        Start-Sleep -Milliseconds 1000
    }
}

function Global:Start-Tab1All([int]$fast) {
    Send-MouseRight
    if ((check-Clip -key "TAB1") -ne 1) {
        send-MouseLeft -posname "tab-update"
    }
    send-MouseLeft -posname "tab-1"
    send-MouseLeft -posname "tab-1"
    #$job = get-ScreenClip -x 0 -y 0 -width 2732 -height 1824 -name "FULL-${rand}"
    #Start-Sleep -Milliseconds 1000
    return
}

# $sw = [System.Diagnostics.Stopwatch]::StartNew()
# $sw.Stop()
# write-Log ("{0}" -f $sw.ElapsedMilliseconds)


$LOGPIXELSX = 0.665;
Function Global:Check-CAP {
    Param( $c_x, $c_y, $c_w, $c_h, $capkey)
    $rand = Get-Random -Minimum 1 -Maximum 90
    $capkey1 = "${capkey}-${rand}"
    $job = get-ScreenClip -x $c_x -y $c_y -width $c_w -height $c_h -name $capkey1

    if ((check-Clip -key $capkey) -eq 1) {
        Remove-Item "data\${capkey1}_*.png"
        write-Log "no diff"
    } else {
        write-Log "write $capkey1"
    }

    Send-MouseRight
    $m_x = $c_x * $LOGPIXELSX;
    $m_y = $c_y * $LOGPIXELSX;
    send-MouseLeft -posx ($m_x + 20) -posy $m_y
    Start-Sleep -Milliseconds 5000
}
Function Global:Get-CAP {
    Param( $c_x, $c_y, $c_w, $c_h, $capkey)
    Remove-Item "data\${capkey}*.png"
    $job = get-ScreenClip -x $c_x -y $c_y -width $c_w -height $c_h -name $capkey
    Write-Host ("[{0}] update {1}" -f (Get-Date -Format "HH:mm:ss"), $job)
    $m_x = $c_x * $LOGPIXELSX;
    $m_y = $c_y * $LOGPIXELSX;
    Send-MouseRight
    Start-Sleep -Milliseconds 200
    send-MouseLeft -posx $m_x -posy $m_y
    Start-Sleep -Milliseconds 5000
}

# offset=92

# if ($SpeedAVG -eq 0){
#     $Global:SpeedAVG = $diff
# } elseif ($diff -lt 1){
# } else {
#     $Private:inavg = $SpeedAVG + $diff
#     $Global:SpeedAVG = [int]($inavg / 2)
# } 
# Write-Log "result ${diff} ms avg: ${Global:SpeedAVG}"

# ACTOK_2491x1526x35x35.png
# HPNG_1520x1380x10x20.png
# HPOK_1520x1380x15x20.png
# HPON_1271x1390x20x4.png
# MOB01_2218x328x15x15.png
# MP2_1262x1435x7x17.png
# SUBHPok_271x251x20x13.png
# TAB0_2200x185x60x25.png
# TAB1_2284x353x8x15.png
# TAB9_2284x353x8x15.png
# TMP-TAB1_2284x352x8x17.png
# 
