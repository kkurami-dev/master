#
# 共通関数を使った操作関連
#
function TAB1-ON {
    Param([int]$max = 3)
    $count = 1

    $ontab = check-Clip "TAB1"
    while($ontab -ne 1 -and $count -lt $max) {
        St-Sleep 30
        $ontab = check-Clip "TAB1"
        $count += 1
    }

    return $ontab
}
function TAB1-OFF {
    Param([int]$max = 3, $msg)
    $count = 1

    $ontab = check-Clip "TAB1"
    while($ontab -eq 1 -and $count -lt $max) {
        St-Sleep 30 $msg
        $ontab = check-Clip "TAB1"
        $count += 1
        $msg = ""
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
    $stopLine = (Get-Content "data\stop.txt" -Tail 1)
    $wsret = (check-Clip "ACTOK")
    if ($stopLine -eq 0 -or $wsret -ne 1) {
        # 操作できない状態
        write-Log -1
        St-Sleep 1000 "act, ${stopLine}, ${wsret}"
        return 1
    }
    if ((check-Clip "TAB0") -ne 1) {
        # TAB表示していない
        Send-MouseRight
        send-KeyCode -name "TAB" -wait 300
        if ((check-Clip "TAB1") -ne 1) {
            write-Log -2
            return 1
        }
    }

    if ((check-Clip "MOB01") -ne 1) {
        # 直近が艇ではない
        send-MouseLeft -posname "tab-update"
        if ((check-Clip "TAB1") -ne 1) {
            write-Log "-3.$id"
            return 1
        }
    }
    0
}

function Confirm-HpLow {
    if ((check-Clip "HPOK") -ne 1) {
        return 1
    }
    if ((check-Clip "SUB1HPok") -ne 1){
        return 2
    }
    if ((check-Clip "SUB2HPok") -ne 1) {
        return 3
    }

    return 0
}

function Confirm-Vitality {
    $down = 0
    for ($i = 1; $i -le 20; $i++) {
        if ((War-StartConfirmation 2) -eq 1) {
            return 1
        }
        if ((check-Clip "TAB1") -eq 1 -or (Confirm-HpLow) -eq 0) {
            return 0
        }
        if ((check-Clip "HPON") -ne 1) {
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
        St-Sleep 200 "Confirm-Vitality ${i}"
    }

    1
}

function War-ActSelection([int]$mode) {
    send-MouseLeft -posname "tab-1"
    if ((Confirm-HpLow) -ne 0) {
        $mode = 2
    }

    if ($mode -eq 1) {
        # メインの攻撃(範囲)
        if ((check-Clip "MP2") -eq 1) {
            send-KeyStr -Arg1 "1"
            St-Sleep 100
            send-MouseLeft -posname "tab-1"
            write-Log ($mode * 100 + 1)
        } else {
            send-KeyStr -Arg1 "e"
            write-Log ($mode * 100 + 2)
        }
        St-Sleep 500
        send-MouseLeft -posname "tab-1"
        TAB1-OFF 20 "attac before.(1)"

    } elseif ($mode -eq 2) {
        # 堅実な攻撃(単体)
        if ((check-Clip "MP2") -eq 1) {
            send-KeyStr -Arg1 "2"
            write-Log ($mode * 100 + 1)
        } else {
            send-KeyStr -Arg1 "e"
            write-Log ($mode * 100 + 2)
        }
        TAB1-OFF 20 "attac before.(2)"

    } else {
        send-MouseLeft -posname "tab-1"
        write-Log 2
        TAB1-OFF 10 "attac before.(3)"
    }
}

function Get-EnemyDistance() {
    $ret = Get-OCRText "MOBDIS"
    if (-not ($ret -is [string])) {
        return 0
    }
    if ($ret -cmatch "^(\d+)m$") {
        return [int]$matches[1]
    } else {
        return 0
    }
}

function Start-Battle01([int]$mode) {
    $astr, $sstr, $istr = Get-LogWithNumber
    if ((War-StartConfirmation 1) -eq 1 ) {
        return 0
    }

    if ((TAB1-ON) -ne 1) {
        #send-MouseLeft -posname "tab-update"
        St-Sleep 100 "No battle."
    } else {
        War-ActSelection($mode)
        return 0
    }
    if ((check-Clip "MOB01") -ne 1) {
        write-Log 6
        St-Sleep 1000 "No MOB01"
        return 0
    }

    if ((check-Clip "TAB1") -eq 1) {
        War-ActSelection($mode)
        return
    }
    if ((Confirm-Vitality 1) -eq 1) {
        write-Log 7
        return 0
    }
    if (12 -lt (Get-EnemyDistance)) {
        St-Sleep 500 "The enemy is far away."
        return 0
    }

    # 戦闘開始
    send-MouseLeft -posname "tab-1"
    send-MouseLeft -posname "tab-1"
    for ($i = 0; $i -le 20; $i++) {
        St-Sleep 30 "Battle wait."
        if ((check-Clip "TAB1") -eq 1){
            write-Log 1
            break
        }
        write-Log 0
    }

    0
}


$LOGPIXELSX = 0.66

Function Check-CAP {
    Param( [string]$file, [int]$act = 0 )
    $pos = Get-FileToPos $file
    $capkey = $pos.key
    if($act -eq 1){
        send-MouseLeft -posname "tab-update"
        St-Sleep 80 "Check-Cap tab 1"
        send-MouseLeft -posname "tab-1"
        send-MouseLeft -posname "tab-1"
        St-Sleep 80 "Check-Cap tab 2"
    }

    $rand = Get-Random -Minimum 1 -Maximum 90
    $capkey1 = "TMP#${capkey}-${rand}"
    $job = get-ScreenClip -x $pos.x -y $pos.y -width $pos.w -height $pos.h -name $capkey1 -mode $pos.mode

    $ret = check-Clip $capkey
    $msg = ""
    if ($ret -eq 1) {
        Remove-Item "data\TMP#${capkey}-${rand}_*.png"
        $msg = "no diff"
    } else {
        $msg = "write $capkey $capkey1 $ret"
    }
    St-Sleep 100 $msg

    $m_x = [int](([int]$pos.x + [int]$pos.w) * $LOGPIXELSX)
    $m_y = [int](([int]$pos.y + [int]$pos.h) * $LOGPIXELSX)
    Set-MousePos -posx ($m_x + 20) -posy $m_y
}

Function Get-CAP {
    Param( [string]$file, $mous )
    $pos = Get-FileToPos $file
    $capkey = $pos.filename

    if ($mous -is [double]) {
        $LOGPIXELSX = $mous
    }
    Remove-Item "data\TMP#${capkey}-*.png"
    Remove-Item "data\${capkey}_*.png"
    $file = get-ScreenClip -x $c_x -y $c_y -width $c_w -height $c_h -name $capkey -mode $mode
    $m_x = [int](([int]$c_x + [int]$c_w) * $LOGPIXELSX)
    $m_y = [int](([int]$c_y + [int]$c_h) * $LOGPIXELSX)
    Set-MousePos -posx $m_x -posy $m_y
    write-Log ("update {0} - pos: {1} {2} {3}" -f $job, $m_x, $m_y, $file)
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
