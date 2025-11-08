#
# 共通関数を使った操作関連
#
function TAB1-ON {
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

##
#  -1: 戦闘不可
#  -2: 戦闘準備前(TAB表示していない)
#  -3: 戦闘準備前(TAB表示していない)
#   0: 戦闘開始できなかった
#   1: 戦闘開始
#   2: 戦闘継続
#   3: 戦闘中
#   4: HP低下(回復開始)
#   5: 直近がモブではない
# 以降は拡張し、その戦闘モードでの個別選択
# x0x:
#
function War-StartConfirmation( $id ) {
    $stopLine = Get-Content "data\stop.txt" -Tail 1
    if ($stopLine -eq 0 -or (check-Clip -key "ACTOK") -ne 1) {
        # 操作できない状態
        write-Log -1
        Start-Sleep -Milliseconds 1000
        return 1
    }
    if ((check-Clip -key "TAB0") -ne 1) {
        # TAB表示していない
        Send-MouseRight
        send-KeyCode -name "TAB" -wait 300
        if ((check-Clip -key "TAB1") -ne 1) {
            write-Log -2
            return 1
        }
    }

    if ((check-Clip -key "MOB01") -ne 1) {
        # 直近が艇ではない
        send-MouseLeft -posname "tab-update"
        if ((check-Clip -key "TAB1") -ne 1) {
            write-Log "-3.$id"
            return 1
        }
    }

    0
}

function Confirm-Vitality {
    $down = 0
    for ($i = 1; $i -le 20; $i++) {
        if ((War-StartConfirmation 2) -eq 1) {
            return 1
        }
        if ((check-Clip -key "TAB1") -eq 1 -or
            ((check-Clip -key "HPOK") -eq 1 -and (check-Clip -key "SUBHPok") -eq 1))
        {
            return 0
        }
        if ((check-Clip -key "HPON") -ne 1) {
            Send-MouseRight
            send-MouseLeft -posname "tab-1"
            write-Log 4
        } elseif ($down -gt 4) {
            write-Log 3.2
        } elseif ($down -eq 4 ) {
            send-KeyStr -Arg1 "x"
            write-Log 5
        } else {
            write-Log 3.1
        }
        $down++
        send-MouseLeft -posname "tab-update"
        Start-Sleep -Milliseconds 200
    }

    1
}

function War-ActSelection([int]$mode) {
    send-MouseLeft -posname "tab-1"
    if ((check-Clip -key "HPOK") -ne 1 -or (check-Clip -key "SUBHPok") -ne 1) {
        $mode = 2
    }

    # メインの攻撃(範囲)
    if ($mode -eq 1) {
        if ((check-Clip -key "MP2") -eq 1) {
            send-KeyStr -Arg1 "1"
            Start-Sleep -Milliseconds 100
            send-MouseLeft -posname "tab-1"
            write-Log ($mode * 100 + 1)
        } else {
            send-KeyStr -Arg1 "e"
            write-Log ($mode * 100 + 2)
        }
        Start-Sleep -Milliseconds 500
        send-MouseLeft -posname "tab-1"
        Start-Sleep -Milliseconds 1000
        return
    }

    # 堅実な攻撃(単体)
    if ($mode -eq 2){
        if ((check-Clip -key "MP2") -eq 1) {
            send-KeyStr -Arg1 "2"
            write-Log ($mode * 100 + 1)
        } else {
            send-KeyStr -Arg1 "e"
            write-Log ($mode * 100 + 2)
        }
        Start-Sleep -Milliseconds 1000
        return
    }

    send-MouseLeft -posname "tab-1"
    write-Log 2
    Start-Sleep -Milliseconds 500
    return
}

function Start-Battle01([int]$mode) {
    $astr, $sstr, $istr = Get-LogWithNumber
    if ((War-StartConfirmation 1) -eq 1 ) {
        return 0
    }

    if ((check-Clip -key "TAB1") -ne 1) {
        send-MouseLeft -posname "tab-update"
        Start-Sleep -Milliseconds 100
    } else {
        War-ActSelection($mode)
        return 0
    }
    if ((check-Clip -key "MOB01") -ne 1) {
        write-Log 6
        Start-Sleep -Milliseconds 1000
        return 0
    }

    if ((check-Clip -key "TAB1") -eq 1) {
        War-ActSelection($mode)
        return
    }

    if ((Confirm-Vitality 1) -eq 1) {
        write-Log 7
        return 0
    }

    # 戦闘開始
    Send-MouseRight
    send-MouseLeft -posname "tab-1"
    send-MouseLeft -posname "tab-1"
    Start-Sleep -Milliseconds 100
    if ((check-Clip -key "TAB1") -eq 1){
        write-Log 1.0
    } elseif ($sstr -eq 0) {
        send-KeyStr -Arg1 "f"
        write-Log 1.1
    } else {
        write-Log 0
    }

    0
}


function Start-Fall([int]$fast) {
    1..2 | ForEach-Object {
        send-KeyStr -Arg1 "f"
        send-KeyStr -Arg1 "f"
        Start-Sleep -Milliseconds 1000
    }
}

function Start-Tab1All([int]$fast) {
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


$LOGPIXELSX = 0.66
Function Check-CAP {
    Param( $c_x, $c_y, $c_w, $c_h, $capkey, $mode, $act)
    if ($capkey -is [string]) {
    } else {
        write-Log "no capkey"
        Start-Sleep -Milliseconds 3000
        return
    }
    if($act -eq 1){
        send-MouseLeft -posname "tab-update"
        Start-Sleep -Milliseconds 80
        send-MouseLeft -posname "tab-1"
        send-KeyStr -Arg1 "f"
        Start-Sleep -Milliseconds 80
    }

    $rand = Get-Random -Minimum 1 -Maximum 90
    $capkey1 = "TMP#${capkey}-${rand}"
    $job = get-ScreenClip -x $c_x -y $c_y -width $c_w -height $c_h -name $capkey1 -mode $mode

    $ret = check-Clip -key $capkey
    if ($ret -eq 1) {
        Remove-Item "data\TMP#${capkey}-${rand}_*.png"
        write-Log "no diff"
    } else {
        write-Log "write $capkey1 $ret"
    }

    $m_x = [int](([int]$c_x + [int]$c_w) * $LOGPIXELSX)
    $m_y = [int](([int]$c_y + [int]$c_h) * $LOGPIXELSX)
    Set-MousePos -posx ($m_x + 20) -posy $m_y
    Start-Sleep -Milliseconds 3000

    return
}
Function Get-CAP {
    Param( $c_x, $c_y, $c_w, $c_h, $capkey, $mode, $mous)
    if ($capkey -is [string]) {
    } else {
        write-Log "no capkey"
        Start-Sleep -Milliseconds 3000
        return
    }
    if ($mous -is [double]) {
        $LOGPIXELSX = $mous
    }
    Remove-Item "data\TMP#${capkey}-*.png"
    Remove-Item "data\${capkey}_*.png"
    get-ScreenClip -x $c_x -y $c_y -width $c_w -height $c_h -name $capkey -mode $mode
    $m_x = [int](([int]$c_x + [int]$c_w) * $LOGPIXELSX)
    $m_y = [int](([int]$c_y + [int]$c_h) * $LOGPIXELSX)
    # $m_x = (($c_x + $c_w) * $LOGPIXELSX)
    # $m_y = (($c_y + $c_h) * $LOGPIXELSX)
    write-Log ("update {0} - pos: {1} {2}" -f $job, $m_x, $m_y)
    Set-MousePos -posx $m_x -posy $m_y
    Start-Sleep -Milliseconds 3000
}

# offset=92

# if ($SpeedAVG -eq 0){
#     $SpeedAVG = $diff
# } elseif ($diff -lt 1){
# } else {
#     $Private:inavg = $SpeedAVG + $diff
#     $SpeedAVG = [int]($inavg / 2)
# } 
# Write-Log "result ${diff} ms avg: ${SpeedAVG}"

# HPNG_1520x1380x10x20.png
# TAB9_2284x353x8x15.png

# ACTOK_2491x1526x35x35x2.png

# HPOK_1520x1380x15x20.png
# HPON_1271x1390x20x4x2.png
# SUBHPok_271x251x20x13.png

# MOB01_2218x328x15x15x2.png
# MP2_1262x1435x7x17x2.png
# TAB0_2200x185x60x25x2.png
# TAB1_2284x353x8x15x2.png


# param(
#     [int]$X = 0,
#     [int]$Y = 0,
#     [int]$Width = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Width,
#     [int]$Height = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Height
# )
