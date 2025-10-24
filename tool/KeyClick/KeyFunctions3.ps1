Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Threading.Tasks;
using System.Runtime.InteropServices;

public class FastBWCapture
{
    public static void Capture(
        string path,
        int xpos, int ypos, int width, int height,
        int threshold = 128
    )
    {
        using (var bmp = new Bitmap(width, height, PixelFormat.Format24bppRgb))
        using (var g = Graphics.FromImage(bmp))
        {
            g.CopyFromScreen(xpos, ypos, 0, 0, bmp.Size);

            var rect = new Rectangle(0,0,width,height);
            var data = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format24bppRgb);
            int stride = Math.Abs(data.Stride);
            int bytes = stride * height;
            byte[] buffer = new byte[bytes];
            Marshal.Copy(data.Scan0, buffer, 0, bytes);

            // 事前テーブル作成
            byte[] rTable = new byte[256];
            byte[] gTable = new byte[256];
            byte[] bTable = new byte[256];
            for(int i=0;i<256;i++){
                rTable[i] = (byte)(i * 0.3);
                gTable[i] = (byte)(i * 0.59);
                bTable[i] = (byte)(i * 0.11);
            }

            // 並列処理
            Parallel.For(0, height, y => {
                int offset = y * stride;
                for(int x=0; x<width; x++){
                    int i = offset + x*3;
                    byte gray = (byte)(rTable[buffer[i+2]] + gTable[buffer[i+1]] + bTable[buffer[i]]);
                    byte bw = (gray < threshold) ? (byte)0 : (byte)255;
                    buffer[i] = buffer[i+1] = buffer[i+2] = bw;
                }
            });

            Marshal.Copy(buffer, 0, data.Scan0, bytes);
            bmp.UnlockBits(data);

            bmp.Save(path, ImageFormat.Png);
        }
    }
}
"@ -ReferencedAssemblies "System.Drawing.dll","System.Windows.Forms.dll","System.Threading.Tasks.dll"

[System.String]$currentPath=Split-Path ( & { $myInvocation.ScriptName } ) -parent

Function Global:Get-ScreenClip{
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

    [FastBWCapture]::Capture($output, $x, $y, $width, $height, 128)

    return $file
}
