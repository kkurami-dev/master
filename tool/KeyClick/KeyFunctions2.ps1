Add-Type -AssemblyName System.Core

[System.String]$currentPath=Split-Path ( & { $myInvocation.ScriptName } ) -parent

#
# 共通関数を使った操作関連
#
function TAB1-ON {
    $count = 1

    $ontab = check-Clip "TAB1"
    while($ontab -ne 1 -and $count -lt 3) {
        St-Sleep 50
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
        send-MouseLeft -posname "tab-update" -msg "StartConfirmation"
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
        send-MouseLeft -posname "tab-update" -msg "Confirm-Vitality"
        St-Sleep 200 "Confirm-Vitality ${i}"
    }

    1
}

function Attack-CloseEnemy {
    Send-MouseRight
    send-MouseLeft -posname "tab-1"
    send-KeyStr -Arg1 "1"
    send-KeyStr -Arg1 "f"
    #send-MouseLeft -posname "tab-update" -msg "CloseEnemy"
}

function War-ActSelection {
    $mode = $JSON.Action
    send-MouseLeft -posname "tab-1"
    if ((Confirm-HpLow) -ne 0) {
        $mode = 2
    }

    $mpOk = check-Clip "MP2"
    if ($mode -eq 2) {
        # 堅実な攻撃(単体)
        if ($mpOk -eq 1) {
            send-KeyStr -Arg1 "2"
            write-Log 201
        } else {
            send-KeyStr -Arg1 "e"
            Attack-CloseEnemy
            write-Log 202
        }
        TAB1-OFF 20 "attac before.(2)"

    } elseif ($mode -eq 99) {
        Attack-CloseEnemy

    } elseif ($mode -lt 8) {
        # メインの攻撃(範囲)
        if ($mpOk -eq 1) {
            send-KeyStr -Arg1 $mode
            St-Sleep 50
            send-MouseLeft -posname "tab-1"
            write-Log "${mode}01"
        } else {
            send-KeyStr -Arg1 "e"
            write-Log "${mode}02"
        }
        St-Sleep 300
        send-MouseLeft -posname "tab-1"
        TAB1-OFF 20 "attac before.(1)"

    } else {
        send-MouseLeft -posname "tab-1"
        write-Log 2
        TAB1-OFF 10 "attac before.(3)"
    }
}

function Get-EnemyDistance() {
    $Distance = 1
    for ($i = 0; $i -le 6; $i++) {
        $Distance = 1
        $ret = Get-OCRText "MOBDIS"
        $ret = "${ret}"
        $ret = $ret -replace 'O', '0'
        write-Log "EnemyDistance:${ret}:"
        if ($ret -cmatch "(\d+)m") {
            $ret = [int]($matches[1])
        } else {
            $Distance = 0
        }

        if ($Distance -eq 1 -and $JSON.EnemyDistance -and $ret -le $JSON.EnemyDistance){
            return 0
        } else {
            if ( $i -eq 1 -or $i -eq 3 -or $i -eq 5 ){
                send-MouseLeft -posname "tab-update" -msg "EnemyDistance:$ret"
            }
        }
    }

    1
}

function Check-MP() {
    if ((check-Clip "MP2") -ne 1 -and (check-Clip "CHARGE") -eq 1 ) {
        $mCount = 0
        while ((check-Clip "MP2") -ne 1) {
            send-KeyStr -Arg1 "e"
            St-Sleep 300 "CHARGE."
            $mCount += 1
            if ($mCount -gt 10) {
                break
            }
        }
        return 1
    }

    0
}

$scriptPath = "$currentPath\KeyFunctions.ps1"
$rTable = 0..255 | ForEach-Object { [byte]($_ * 0.3) }
$gTable = 0..255 | ForEach-Object { [byte]($_ * 0.59) }
$bTable = 0..255 | ForEach-Object { [byte]($_ * 0.11) }
$iss = [System.Management.Automation.Runspaces.InitialSessionState]::CreateDefault()
$iss.InitializationScripts.Add(
    [System.Management.Automation.Runspaces.SessionStateScriptEntry]::new(
        [System.IO.File]::ReadAllText($scriptPath)
    )
)
$iss.Commands.Add(
    [System.Management.Automation.Runspaces.SessionStateFunctionEntry]::new(
        "Confirm-Vitality", ((Get-Command Confirm-Vitality).ScriptBlock.ToString())
    )
)
$iss.Commands.Add(
    [System.Management.Automation.Runspaces.SessionStateFunctionEntry]::new(
        "Get-EnemyDistance", ((Get-Command Get-EnemyDistance).ScriptBlock.ToString())
    )
)
$iss.Commands.Add(
    [System.Management.Automation.Runspaces.SessionStateFunctionEntry]::new(
        "Check-MP", ((Get-Command Check-MP).ScriptBlock.ToString())
    )
)
$iss.Variables.Add(
    [System.Management.Automation.Runspaces.SessionStateVariableEntry]::new(
        "rTable", $rTable, "R LUT"
    )
)
$iss.Variables.Add(
    [System.Management.Automation.Runspaces.SessionStateVariableEntry]::new(
        "gTable", $gTable, "G LUT"
    )
)
$iss.Variables.Add(
    [System.Management.Automation.Runspaces.SessionStateVariableEntry]::new(
        "bTable", $bTable, "B LUT"
    )
)

$pool = [RunspaceFactory]::CreateRunspacePool(1, [Environment]::ProcessorCount, $iss, $Host)
$pool.Open()
$psInit = [PowerShell]::Create()
$psInit.RunspacePool = $pool
$psInit.Dispose()

function Start-BattleSub {
    $jobs = @()
    foreach ($i in 1..3) {
        $ps = [PowerShell]::Create()
        $ps.RunspacePool = $pool
        if($i -eq 1){
            $ps.AddScript({Confirm-Vitality}) | Out-Null
        } elseif($i -eq 2){
            $ps.AddScript({Get-EnemyDistance}) | Out-Null
        } elseif($i -eq 3){
            $ps.AddScript({Check-MP}) | Out-Null
        }
        $jobs += [PSCustomObject]@{
            PS = $ps
            Handle = $ps.BeginInvoke()
        }
    }

    # 結果取得
    foreach ($j in $jobs) {
        $result = 0
        if ($j.PS -ne $null){
            $result = $j.PS.EndInvoke($j.Handle)
            $j.PS.Dispose()
        }
        $result
    }
}

function Start-Battle01([int]$mode) {
    $mode = $JSON.Action

    # 画面の状態など開始できるか確認
    if ((War-StartConfirmation 1) -eq 1 ) {
        return 0
    }

    # 戦闘中か確認
    if ((TAB1-ON) -ne 1) {
        #send-MouseLeft -posname "tab-update"
        St-Sleep 50 "No battle."
    } else {
        War-ActSelection
        return 0
    }

    # 次の戦闘を開始できる状態か
    if ((Confirm-Vitality 1) -eq 1) {
        write-Log 7
        return 0
    }

    # 敵の状態を確認
    if (Get-EnemyDistance) {
        St-Sleep 500 "The enemy is far away."
        return 0
    }

    # MP確認
    if (Check-MP) {
        return 0
    }

    # 戦闘開始
    send-MouseLeft -posname "tab-1"
    St-Sleep 50
    War-ActSelection
    for ($i = 0; $i -le 20; $i++) {
        St-Sleep 30 "Battle wait(${i})."
        if ((check-Clip "TAB1") -eq 1){
            write-Log 1
            return 0
        }
    }

    0
}

function Start-Battle02 {
    # 画面の状態など開始できるか確認
    if ((War-StartConfirmation 1) -eq 1 ) {
        return 0
    }

    # 戦闘中か確認
    if ((TAB1-ON) -ne 1) {
        #send-MouseLeft -posname "tab-update"
        St-Sleep 50 "No battle."
    } else {
        War-ActSelection
        return 0
    }

    # 各種チェックの実行
    $result = Start-BattleSub
    St-Sleep 100 ("sub {0}/{1}/{2}" -f $result[0], $result[1], $result[2] )

    # 次の戦闘を開始できる状態か
    if ($result[0]) {
        write-Log 7
        return 0
    }

    # 敵の状態を確認
    if ($result[1]) {
        St-Sleep 500 "The enemy is far away."
        return 0
    }

    # MP確認
    if ($result[2]) {
        return 0
    }

    # 戦闘開始
    send-MouseLeft -posname "tab-1"
    send-MouseLeft -posname "tab-1"
    for ($i = 0; $i -le 20; $i++) {
        St-Sleep 30 "Battle wait."
        if ((check-Clip "TAB1") -eq 1){
            write-Log 1
            return 0
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
        0 | Out-File -FilePath "data\stop.txt"
    }
    St-Sleep 100 $msg

    $m_x = [int](([int]$pos.x + [int]$pos.w) * $LOGPIXELSX)
    $m_y = [int](([int]$pos.y + [int]$pos.h) * $LOGPIXELSX)
    Set-MousePos -posx ($m_x + 20) -posy $m_y
}

Function Get-CAP {
    0 | Out-File -FilePath "data\stop.txt"
    
    Param( [string]$file, $mous )
    $pos = Get-FileToPos $file
    $capkey = $pos.filename

    if ($mous -is [double]) {
        $LOGPIXELSX = $mous
    }
    Remove-Item "data\TMP#${capkey}-*.png"
    Remove-Item "data\${capkey}_*.png"
    $job = get-ScreenClip -x $pos.x -y $pos.y -width $pos.w -height $pos.h -name $capkey -mode $pos.mode
    
    $m_x = [int](([int]$pos.x + [int]$pos.w) * $LOGPIXELSX)
    $m_y = [int](([int]$pos.y + [int]$pos.h) * $LOGPIXELSX)
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
