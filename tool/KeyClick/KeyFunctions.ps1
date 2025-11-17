#
# キーボード、マウス操作のライブラリ
#
Add-Type -TypeDefinition @"
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
    public static extern bool SetCursorPos(int X, int Y);

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
"@  -Language CSharp
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Runtime

# C# 実装（Parallel.For を使って行ごとに処理）
Add-Type -TypeDefinition @"
using System;
using System.Threading.Tasks;

public static class ImgParallel {
    // buf: BGR BGR ... (stride-aligned)
    public static void GrayContrastParallel(byte[] buf, int stride, int width, int height,
                                            byte[] rTable, byte[] gTable, byte[] bTable, byte[] contrastTable) {
        Parallel.For(0, height, y => {
            int rowStart = y * stride;
            int end = rowStart + width * 3;
            for (int i = rowStart; i < end; i += 3) {
                byte b = buf[i];
                byte g = buf[i + 1];
                byte r = buf[i + 2];
                int gray = rTable[r] + gTable[g] + bTable[b];
                byte c = contrastTable[gray];
                buf[i] = c;
                buf[i + 1] = c;
                buf[i + 2] = c;
            }
        });
    }
}
"@ -Language CSharp

$KEYEVENTF_KEYUP = 0x2
[System.String]$currentPath=Split-Path ( & { $myInvocation.ScriptName } ) -parent

$setting = "data\stop.txt"
$logpath = "data\log.txt"

Function Get-FileToPos {
    Param( [string]$fileName )
    if ($file -cmatch "(.+?)_(\d+)x(\d+)x(\d+)x(\d+)x(\d+)") {
        $mode = $matches[6]
    } elseif ($file -cmatch "(.+?)_(\d+)x(\d+)x(\d+)x(\d+)") {
        $mode = 0
    }
    return @{
        key = $matches[1]
        filename = $matches[1]
        x = $matches[2]
        y = $matches[3]
        w = $matches[4]
        h = $matches[5]
        mode = $mode
    }
}

$JsonSetting = $null;
Function Read-Setting($param) {
    $settingFile = "data\setting.json"
    if (Test-Path $settingFile) {
    } else {
        '{"action":1}' | Out-File -FilePath $settingFile
    }
    if ($param.init) {
        $json = Get-Content $settingFile -Raw
        $utf8 = [System.Text.Encoding]::UTF8.GetBytes($json)
        $JsonSetting = [System.Text.Json.JsonDocument]::Parse($utf8)
    }
}

# 単純なキーを送信する
Function send-KeyStr {
    Param($Arg1, $nowait)
    [Windows.Forms.SendKeys]::SendWait($Arg1)
    if ($nowait -is [int]) {
        return
    }
    Start-Sleep -Milliseconds 10
}

# 指定のキーを押して、離す操作を行う
# カーソルキー、TABなどの特殊キーに対応
$KEY_CODE = @{
    "VK_A" = 0xBC
    "TAB" = 0x09
    "LEFT" = 0x25
    "UP" = 0x26
    "RIGHT" = 0x27
    "DOWN" = 0x28
}
Function send-KeyCode {
    Param($vk_key, $wait, $name)

    if ($name -is [string]) {
        $vk_key = $KEY_CODE[$name]
    }
    
    [Keyboard]::keybd_event($vk_key, 0, 0, 0)
    Start-Sleep -Milliseconds $wait
    [Keyboard]::keybd_event($vk_key, 0, $KEYEVENTF_KEYUP, 0)
}

# 指定位置をマウスの左クリックを行う
Function send-MouseLeft {
    Param($posx, $posy, $posname)

    if ($posname -is [string]) {
        if ($posname -eq "tab-update") {
            St-Sleep 80 "#  TAB Update."
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
    Start-Sleep -Milliseconds 10
}

# 指定位置にマウスカーソルを移動させる
Function Set-MousePos {
    Param($posx, $posy, $posname)
    [MouseInput]::SetCursorPos($posx, $posy)
}

# x:0, y:0 の位置工程で右クリックを実施
Function Send-MouseRight {
    [MouseSimulator]::mouse_event([MouseSimulator]::RIGHTDOWN, 0, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 100
    [MouseSimulator]::mouse_event([MouseSimulator]::RIGHTUP, 0, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 10
}

Function send-TimeKeys {
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

Function send-TimePrint {
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

Function B-B($bit) {
    if ($bit -ge 180) {
        [byte]255
    } else {
        [byte]0
    }
}

# 画像処理関連の変更がないデータをグローバルに作成
if (-not $rTable) {
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
    $Global:contrastTableB = @(
        0..255 | ForEach-Object {
            if ($_ -ge 128) {
                [byte]255
            } else {
                [byte]0
            }
        }
    )
    $Global:contrastTableBB = @(
        0..255 | ForEach-Object { B-B $_ }
    )

    $Global:shpool = [System.Buffers.ArrayPool[byte]]::Shared
    $Global:pixelFormat = [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
    $Global:pixelFormat8 = [System.Drawing.Imaging.PixelFormat]::Format8bppIndexed
    $Global:imgRWf = [System.Drawing.Imaging.ImageLockMode]::ReadWrite
    $Global:imageFormat = [System.Drawing.Imaging.ImageFormat]::Png
    #$Global:MarshalCopy = [System.Runtime.InteropServices.Marshal]::GetMethod('Copy', [type[]]@([byte[]], [int], [intptr], [int]))
}

# 指定位置の画面キャプチャを行う
#  画像ファイルは下記の形式で作成される
#    ・ファイルの形式： <ファイル名>_<x座標>x<y座標>x<幅>x<高さ>x<白黒 or グレー>.png
#    ・最後の白黒orグレーしてはない場合はグレースケール
#    ・<ファイル名>_ と <ファイル名>s1_ <ファイル名>s2_ <ファイル名>s3_があれば、
#      同一画像として比較対象にできる。
Function get-ScreenClip{
    Param ([int]$x, [int]$y, [int]$width, [int]$height, [string]$name, [string]$posname, [int]$mode)
    if ($posname -is [string]) {
        if ($posname -eq "tab-1") {
            $x = 2587
            $y = 355
            $width = 5
            $height = 10
        }
    }
    $Local:ToContrastTable = $contrastTable
    $Local:file = "{0}_{1}x{2}x{3}x{4}.png" -f $name, $x, $y, $width, $height
    if ($mode -gt 1) {
        $file = "{0}_{1}x{2}x{3}x{4}x{5}.png" -f $name, $x, $y, $width, $height, $mode
    }
    if ($mode -eq 2){
        $ToContrastTable = $contrastTableB
    }
    if ($mode -eq 4){
        $ToContrastTable = $contrastTableBB
    }
    $output = "$currentPath\data\$file"

    # 現在位置にマウスカーソルがあればずらす
    $NowPos = [System.Windows.Forms.Cursor]::Position
    $NowX = $NowPos.X / 0.66
    $NowY = $NowPos.Y / 0.66
    if (($x -lt $NowX -and $NowX -lt ($x + $width)) -or
        ($y -lt $NowY -and $NowY -lt ($y + $height)))
    {
        $m_x = $NowPos.X + $width
        $m_y = $NowPos.Y + $height
        Set-MousePos -posx $m_x -posy $m_y
        Start-Sleep -Milliseconds 20
    }

    # 画面キャプチャ
    $Local:bmp = New-Object System.Drawing.Bitmap $width, $height
    $Private:graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.CopyFromScreen($x, $y, 0, 0, $bmp.Size)
    $graphics.Dispose()

    # 原色で保存
    if ($mode -eq 3){
    # DPIを設定（縦横）
        $bmp.SetResolution(300, 300)
        $bmp.Save($output, $imageFormat)
        $bmp.Dispose()
        return $file
    }

    # コントラスト変換
    $Private:rect = New-Object System.Drawing.Rectangle 0,0,$width,$height
    $bmpData = $bmp.LockBits($rect, $imgRWf, $pixelFormat)
    try {
        $stride = $bmpData.Stride
        $len = [Math]::Abs($stride) * $height
        $buf = New-Object byte[] $len
        [System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $buf, 0, $len)

        [ImgParallel]::GrayContrastParallel($buf, $stride, $width, $height, ($rTable), ($gTable), ($bTable), ($ToContrastTable))

        [System.Runtime.InteropServices.Marshal]::Copy($buf, 0, $bmpData.Scan0, $len)
    } finally {
        $bmp.UnlockBits($bmpData)
    }
    $bmp.Save($output, $imageFormat)
    $bmp.Dispose()

    #write-Log "get-ScreenClip $file"
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

Function Get-TmpClip([string]$FileName) {
    $Local:key = $fileName.Split("_")
    $key = $fileName.Split("_")[0]
    if ($key -eq $null -or $key.length -lt 1 ){
        Write-Host "tmp2 $key"
        return "0"
    }

    if ($fileName -cmatch "_(\d+)x(\d+)x(\d+)x(\d+)x(\d+)\."){
    } elseif ($fileName -cmatch "_(\d+)x(\d+)x(\d+)x(\d+)\."){
        $matches[5] = 1
    } else {
        write-Log "no match $fileName"
        return "0"
    }

    $capfile = get-ScreenClip -x $matches[1] -y $matches[2] -width $matches[3] -height $matches[4] -name "TMP-${key}" -posname "nop" -mode $matches[5]
    for ($i = 0; $i -lt 3; $i++) {
        if (Test-Path "data\$capfile"){
            return $capfile
        }
        Start-Sleep -Milliseconds 10
    }
    return $capfile
}

Function Get-KeyToFilename {
    Param([string]$key)

    $fileName = "0"
    Get-ChildItem -Path "$currentPath\data" -File | ForEach-Object {
        if ($_.Name.StartsWith("${key}_")) {
            $fileName = $_.Name
            return
        }
    }

    $fileName
}


# 指定ファイルの画像と現在の画面表示の内容が同一か比較する
Function check-Clip {
    Param($cParam)
    $key = $cParam
    if ($cParam -is [string]){
        $key = $cParam
        $cParam = @{ key = $key }
    } else {
        $key = $cParam.key
    }

    $fileName = Get-KeyToFilename $key
    $hash1 = Get-FileMD5 $fileName
    $Tmpfile = Get-TmpClip $fileName
    $hash2 = Get-FileMD5 $Tmpfile
    #St-Sleep 100 "co1 $Tmpfile $hash2"
    if($cParam.tmpDel -ne 1) {
        $DelTmpfile = "data\$Tmpfile"
        if ($DelTmpfile -cmatch " (TMP.*)") {
            $DelTmpfile = "data\" + $matches[1]
        }
        Remove-Item $DelTmpfile
    }

    for ($i = 1; $i -le 4; $i++) {
        if ($hash1 -eq $hash2) {
            if ($cParam.okAct -is [int]) {
                send-KeyCode -vk_key $cParam.okAct -wait $cParam.wait
            } elseif ($cParam.okAct -is [string]) {
                send-TimeKeys -key $cParam.okAct -time $cParam.time
            }
            return 1
        }

        $sub_file = $fileName.Replace("${key}", "${key}s$i" )
        $hash1 = Get-FileMD5 $sub_file
        if ($hash1 -eq 0){
            return 2
        }
    }

    if ($cParam.ngAct -is [int]) {
        send-KeyCode -vk_key $cParam.ngAct -wait $cParam.wait
    } elseif ($cParam.ngAct -is [string]) {
        send-TimeKeys -key $cParam.ngAct -time $cParam.time
    }

    0
}

function Get-OCRText {
    param([string]$key)
    $FileName = Get-KeyToFilename $key
    $ImagePath = Get-TmpClip $FileName
    $text = (tesseract ".\data\$ImagePath" stdout)
    Remove-Item "data\$ImagePath"

    if ($text -eq $null) {
        return 0
    }
    return $text
}

# ログの書き込み、初期設定ファイルの作成を行う
Function write-Log {
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

Function St-Sleep {
    Param ([int]$time, [string]$msg)

    if ($null -ne $msg -and $msg.Length -gt 1) {
        $str = "{0} $msg" -f ($time / 1000)
        write-Log $str
    }
    Start-Sleep -Milliseconds $time
}


# ログ最終行を読み込み不動小数点と整数で読み取り結果を返す
Function Get-LogWithNumber {
    $lastLine = Get-Content $logpath -Tail 1
    $li = 0
    $ld = 0
    if ($lastLine -match "(-?[0-9\.]+)") {
        $number = $matches[1]
        $li = [int]$number
        $ld = [double]$number
    } else {
        return @(-1, -1, -1)
    }

    return @($ld, $li, $lastLine)
}

write-Log "s" -init 1
