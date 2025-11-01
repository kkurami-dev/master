#
# キーボード、マウス操作のライブラリ
#
Add-Type @"
using System;
using System.Runtime.InteropServices;

public class Keyboard {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern void keybd_event(byte bVk, byte bScan, int dwFlags, int dwExtraInfo);

    public const int KEYEVENTF_KEYDOWN = 0x0000;
    public const int KEYEVENTF_KEYUP   = 0x0002;
}

public class MouseSimulator {
    [DllImport("user32.dll", CharSet = CharSet.Auto, CallingConvention = CallingConvention.StdCall)]
    public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, UIntPtr dwExtraInfo);

    public const int LEFTDOWN  = 0x0002;
    public const int LEFTUP    = 0x0004;
    public const int RIGHTDOWN = 0x0008;
    public const int RIGHTUP   = 0x0010;
}

public class MouseInput {
    [StructLayout(LayoutKind.Sequential)]
    struct INPUT {
        public uint type;
        public MOUSEINPUT mi;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct MOUSEINPUT {
        public int dx;
        public int dy;
        public uint mouseData;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [DllImport("user32.dll", SetLastError = true)]
    static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    [DllImport("user32.dll")]
    static extern bool SetCursorPos(int X, int Y);

    const int INPUT_MOUSE = 0;
    const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
    const uint MOUSEEVENTF_LEFTUP   = 0x0004;

    public static void ClickAt(int x, int y) {
        SetCursorPos(x, y);

        INPUT[] inputs = new INPUT[2];
        inputs[0].type = INPUT_MOUSE;
        inputs[0].mi.dwFlags = MOUSEEVENTF_LEFTDOWN;

        inputs[1].type = INPUT_MOUSE;
        inputs[1].mi.dwFlags = MOUSEEVENTF_LEFTUP;

        SendInput((uint)inputs.Length, inputs, Marshal.SizeOf(typeof(INPUT)));
    }
}
"@
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Drawing.Common
Add-Type -AssemblyName System.Runtime

$KEYEVENTF_KEYUP = 0x2
[System.String]$currentPath=Split-Path ( & { $myInvocation.ScriptName } ) -parent

$setting = "data\stop.txt"
$logpath = "data\log.txt"

Function Global:send-KeyStr {
    Param($Arg1, $nowait)
    [Windows.Forms.SendKeys]::SendWait($Arg1)
    if ($nowait -is [int]) {
        return
    }
    Start-Sleep -Milliseconds 50
}

$KEY_CODE = @{
    "VK_A" = 0xBC
    "TAB" = 0x09
    "LEFT" = 0x25
    "UP" = 0x26
    "RIGHT" = 0x27
    "DOWN" = 0x28
}
Function Global:send-KeyCode {
    Param($vk_key, $wait, $name)

    if ($name -is [string]) {
        $vk_key = $KEY_CODE[$name]
    }
    
    [Keyboard]::keybd_event($vk_key, 0, 0, 0)
    Start-Sleep -Milliseconds $wait
    [Keyboard]::keybd_event($vk_key, 0, $KEYEVENTF_KEYUP, 0)
}

Function Global:send-MouseLeft {
    Param($posx, $posy, $posname)

    if ($posname -is [string]) {
        if ($posname -eq "tab-update") {
            $posx = 1740
            $posy = 800
        } elseif ($posname -eq "tab-1") {
            $posx = 1740
            $posy = 240
        } elseif ($posname -eq "tab-update") {
            $posx = 1740
            $posy = 700
        } elseif ($posname -eq "tab-1") {
            $posx = 1740
            $posy = 145
        }
    }

    # [MouseSimulator]::mouse_event([MouseSimulator]::LEFTDOWN, 0, 0, 0, [UIntPtr]::Zero)
    # Start-Sleep -Milliseconds 60
    # [MouseSimulator]::mouse_event([MouseSimulator]::LEFTUP, 0, 0, 0, [UIntPtr]::Zero)
    [MouseInput]::ClickAt($posx, $posy)
    Start-Sleep -Milliseconds 50
}

Function Global:Send-MouseRight {
    [MouseSimulator]::mouse_event([MouseSimulator]::RIGHTDOWN, 0, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 100
    [MouseSimulator]::mouse_event([MouseSimulator]::RIGHTUP, 0, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 50
}

Function Global:send-TimeKeys {
    Param($time, $key)
    $mit = (Get-Date).Minute
    $s = (Get-Date).Second
    $totalSeconds = $mit * 60 + $s

    $diffTime1 = $totalSeconds % $time
    if ($diffTime1 -gt 2) {
        return
    }
    if ($key -is [string]) {
        [Windows.Forms.SendKeys]::SendWait($key)
    }
    return 1
}

Function Global:send-TimePrint {
    Param($Arg1, $Arg2)
    $mit = (Get-Date).Minute
    $s = (Get-Date).Second
    $totalSeconds = $mit * 60 + $s

    $diffTime1 = $totalSeconds % $Arg1
    if ($diffTime1 -le 3) {
        Write-Output "$Arg2"
        return 1
    }
}

if (-not $Global:rTable) {
    # 事前計算テーブル作成
    $Global:contrast = 1.85 # 1.0 = 通常, >1.0 = コントラスト強調, <1.0 = 低下

    # R,G,Bそれぞれのグレースケール係数テーブル
    $Global:rTable = @(0..255 | ForEach-Object { [byte]($_ * 0.3) })
    $Global:gTable = @(0..255 | ForEach-Object { [byte]($_ * 0.59) })
    $Global:bTable = @(0..255 | ForEach-Object { [byte]($_ * 0.11) })

    # コントラスト補正テーブル
    $Global:contrastTable = @(
        0..255 | ForEach-Object {
            $v = ((($_ / 255.0) - 0.5) * $contrast + 0.5) * 255.0
            [byte]([Math]::Max(0, [Math]::Min(255, $v)))
        }
    )
    $Global:shpool = [System.Buffers.ArrayPool[byte]]::Shared
    $Global:pixelFormat = [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
    $Global:imgRWf = [System.Drawing.Imaging.ImageLockMode]::ReadWrite
    $Global:imageFormat = [System.Drawing.Imaging.ImageFormat]::Png
    #$Global:MarshalCopy = [System.Runtime.InteropServices.Marshal]::GetMethod('Copy', [type[]]@([byte[]], [int], [intptr], [int]))
}

Function Global:get-ScreenClip{
    Param ([int]$x, [int]$y, [int]$width, [int]$height, $name, $posname)
    if ($posname -is [string]) {
        if ($posname -eq "tab-1") {
            $x = 2587
            $y = 355
            $width = 5
            $height = 10
        }
    }
    $file = "{0}_{1}x{2}x{3}x{4}.png" -f $name, $x, $y, $width, $height
    $output = "$currentPath\data\$file"

    # 画面キャプチャ
    $Local:bitmap = New-Object System.Drawing.Bitmap $width, $height
    $Private:graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CopyFromScreen($x, $y, 0, 0, $bitmap.Size)

    # グレースケール変換（ピクセルごと処理）
    $Private:rect = [System.Drawing.Rectangle]::FromLTRB(0, 0, $width, $height)
    $Local:bmpData = $bitmap.LockBits($rect, $imgRWf, $pixelFormat)
    $Local:ptr = $bmpData.Scan0
    $Local:bytes = [Math]::Abs($bmpData.Stride) * $Height
    $Local:rgbValues = $Global:shpool.Rent($bytes)
    try {
        [System.Runtime.InteropServices.Marshal]::Copy($ptr, $rgbValues, 0, $bytes)
        for ($Local:idx = 0; $idx -lt $bytes; $idx += 3) {
            $Private:rgb_b = $rgbValues[$idx]
            $Private:rgb_g = $rgbValues[$idx + 1]
            $Private:rgb_r = $rgbValues[$idx + 2]
            $Private:rgb_gray = $rTable[$rgb_r] + $gTable[$rgb_g] + $bTable[$rgb_b]

            $Private:rgb_c = $contrastTable[$rgb_gray]
            $rgbValues[$idx] = $rgb_c
            $rgbValues[$idx + 1] = $rgb_c
            $rgbValues[$idx + 2] = $rgb_c
        }
        [System.Runtime.InteropServices.Marshal]::Copy($rgbValues, 0, $ptr, $bytes)
    }
    finally {
        $Global:shpool.Return($rgbValues)
        $bitmap.UnlockBits($bmpData)
    }

    # 保存
    $bitmap.Save($output, $imageFormat)

    $graphics.Dispose()
    $bitmap.Dispose()
    return $file
}

Function Global:get-ScreenClip1{
    Param ([int]$x, [int]$y, [int]$width, [int]$height, $name, $posname)
    if ($posname -is [string]) {
        if ($posname -eq "tab-1") {
            $x = 2587
            $y = 355
            $width = 5
            $height = 10
        }
    }
    $file = "{0}_{1}x{2}x{3}x{4}.png" -f $name, $x, $y, $width, $height
    $output = "$currentPath\data\$file"

    # 画面キャプチャ
    $bitmap = New-Object System.Drawing.Bitmap $width, $height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CopyFromScreen($x, $y, 0, 0, $bitmap.Size)
    $graphics.Dispose()

    # グレースケール変換（ピクセルごと処理）
    for ($yy = 0; $yy -lt $height; $yy++) {
        for ($xx = 0; $xx -lt $width; $xx++) {
            $c = $bitmap.GetPixel($xx, $yy)
            $gray = $rTable[$c.R] + $gTable[$c.G] + $bTable[$c.B]
            $grayByte = $contrastTable[$gray]
            $grayColor = [System.Drawing.Color]::FromArgb($grayByte, $grayByte, $grayByte)
            $bitmap.SetPixel($xx, $yy, $grayColor)
        }
    }

    # 保存
    $bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
    return $file
}

# MD5ハッシュを計算する関数
function Get-FileMD5($file) {
    $path = "$currentPath\data\$file"
    if (Test-Path $path){
    } else {
        return 0
    }

    $md5 = [System.Security.Cryptography.MD5]::Create()
    $stream = [System.IO.File]::OpenRead($path)
    $hashBytes = $md5.ComputeHash($stream)
    $stream.Close()
    # バイト配列を16進数文字列に変換
    return ([BitConverter]::ToString($hashBytes) -replace "-", "")
}

Function Global:check-Clip{
    Param ([string]$key, $okAct, $ngAct, [int]$time, [int]$wait, [int]$tmpDel)

    $fileName = ""
    Get-ChildItem -Path "$currentPath\data" -File | ForEach-Object {
        if ($_.Name.StartsWith("${key}_")) {
            $fileName = $_.Name
            return
        }
    }
    if ($fileName -eq "") {
        return 0
    }
    $hash1 = Get-FileMD5 $fileName

    $fileName -match "_(\d+)x(\d+)x(\d+)x(\d+)\." | Out-Null
    $Tmpfile = (get-ScreenClip -x $matches[1] -y $matches[2] -width $matches[3] -height $matches[4] -name "TMP-$key")
    $hash2 = Get-FileMD5 $Tmpfile
    if($tmpDel -ne 1) {
        Remove-Item "$currentPath\data\$Tmpfile"
    }

    $Local:ret = 0
    1..4 | ForEach-Object {
        if ($ret -ne 0) {
            return
        }
        
        if ($hash1 -eq $hash2) {
            if ($okAct -is [int]) {
                send-KeyCode -vk_key $okAct -wait $wait
            } elseif ($okAct -is [string]) {
                send-TimeKeys -key $okAct -time $time
            }
            $ret = 1
        }

        $sub_file = $fileName.Replace("${key}", "${key}s$_" )
        $hash1 = Get-FileMD5 $sub_file
    }
    if ($ret -ne 0) {
        return $ret
    }

    if ($ngAct -is [int]) {
        send-KeyCode -vk_key $ngAct -wait $wait
    } elseif ($ngAct -is [string]) {
        send-TimeKeys -key $ngAct -time $time
    }
    return 2
}

Function Global:write-Log {
    param ($msg, [int]$init, $Lf)

    # 初期設定確認
    if ($init -is [int] -and $init -eq 1){
        $exists = Test-Path $logpath
        if ($exists) {
            $tail = Get-Content $logpath -Tail 1
            $tail | Out-File -FilePath $logpath
        } else {
            $msg | Out-File -FilePath $logpath
        }

        $exists = Test-Path $setting
        if ($exists) {
        } else {
            0 | Out-File -FilePath $setting
        }
        return
    }

    # コンソールへの出力状態判定
    $stopLine = Get-Content $setting -Tail 1
    if ($stopLine -is [int] -and $stopLine -eq 2){
        if ($PSBoundParameters.ContainsKey("Lf")){
            Write-Host $msg
        } else {
            Write-Host $msg -NoNewline
        }
    }
    $msg | Out-File -FilePath $logpath -Append
}

Function Global:Get-LogWithNumber {
    $lastLine = Get-Content $logpath -Tail 1
    if (($lastLine -as [int]) -eq $null){
        return @(-1, -1, -1)
    }

    $minus = 0
    $dub = 0
    $len = $lastLine.length
    $lstr = 0
    if ($lastLine -like "*-*") {
        $minus = 1
    }
    if ($lastLine -like "*.*") {
        $dub = 1
    }
    if ($dub -eq 1 -and $len -gt 3) {
        if ($minus -eq 1) {
            $lstr = $lastLine.Substring(3,2)
        } else {
            $lstr = $lastLine.Substring(2,2)
        }
    }

    return @([double]$lastLine, [int]$lastLine, [int]$lstr)
}

write-Log "s" -init 1
