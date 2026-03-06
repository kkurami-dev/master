[System.String]$currentPath=Split-Path ( & { $myInvocation.ScriptName } ) -parent

function Init-Runspace {
    # スレッドセーフな連想配列を作成
    # [string, object] は、キーが文字列、値がオブジェクトという意味
    $Script:sharedContainer = New-Object 'System.Collections.Concurrent.ConcurrentDictionary[string, object]'
    # 共通で使いたい初期データをセット
    $sharedContainer.TryAdd("Active", 1)
    $sharedContainer.TryAdd("Vitality", 0)
    $sharedContainer.TryAdd("EnemyDistance", 0)
    $sharedContainer.TryAdd("MP", 0)
    $sharedContainer.TryAdd("Log", (New-Object System.Collections.Generic.List[string]))
    # 変数名 "Data" として $sharedContainer を登録
    $entry = New-Object System.Management.Automation.Runspaces.SessionStateVariableEntry("Data", $sharedContainer, "Description")

    #
    $iss = [System.Management.Automation.Runspaces.InitialSessionState]::CreateDefault()
    $iss.ImportPSModule(@("$currentPath\KeyClickStart.ps1"));
    $iss.ImportPSModule(@("$currentPath\KeyClickStart2.ps1"));
    $iss.Variables.Add($entry)
    $Script:pool = [RunspaceFactory]::CreateRunspacePool(1, [Environment]::ProcessorCount, $iss, $Host)
    $pool.ApartmentState = "MTA"   # GUIを触らない処理なら必須級
    $pool.ThreadOptions = "ReuseThread"

    $pool.Open()
    $psInit = [PowerShell]::Create()
    $psInit.RunspacePool = $pool
    $psInit.Dispose()
}

function Start-BattleSub {
    $jobs = @()
    foreach ($i in 1..4) {
        if($i -eq 1){
            $ps = [PowerShell]::Create().AddScript(
                {
                    while($Data["Active"]){
                        $Data["Vitality"] = Confirm-HpLow
                    }
                }).AddArgument($i)
        } elseif($i -eq 2){
            $ps = [PowerShell]::Create().AddScript(
                {
                    while($Data["Active"]){
                        $Data["EnemyDistance"] = Get-EnemyDistance
                    }
                }).AddArgument($i)
        } elseif($i -eq 3){
            $ps = [PowerShell]::Create().AddScript(
                {
                    while($Data["Active"]){
                        $Data["MP"] = Check-MP
                    }
                }).AddArgument($i)
        } elseif($i -eq 4){
            $ps = [PowerShell]::Create().AddScript(
                {
                    while($Data["Active"]){
                        $Data["Confirmation"] = War-StartConfirmation
                    }
                }).AddArgument($i)
        }
        $ps.RunspacePool = $pool
        $jobs += [PSCustomObject]@{
            PS = $ps
            Handle = $ps.BeginInvoke()
        }
    }

    # 結果取得
    foreach ($j in $jobs) {
        if ($j.PS -ne $null){
            $result = $j.PS.EndInvoke($j.Handle)
            $j.PS.Dispose()
        }
    }
}

function Start-Battle02 {
    # 画面の状態など開始できるか確認
    if ((War-StartConfirmation 1) -eq 1 ) {
        return 0
    }

    # 戦闘中か確認
    if ((TAB1-ON) -ne 1) {
        #send-MouseLeft -posname "tab-update"
        write-Log "No battle."
    } else {
        War-ActSelection
        return 0
    }

    # 各種チェックの実行
    $result = Start-BattleSub
    St-Sleep 100 ("sub {0}/{1}/{2}" -f $sharedContainer["Vitality"], $sharedContainer["EnemyDistance"], $sharedContainer["MP"] )

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
