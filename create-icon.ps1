Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 128, 128
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)
$font = New-Object System.Drawing.Font("Arial", 40, [System.Drawing.FontStyle]::Bold)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 91, 255))
$g.DrawString(">_", $font, $brush, 10, 10)
$font2 = New-Object System.Drawing.Font("Arial", 40, [System.Drawing.FontStyle]::Bold)
$brush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
$g.DrawString("T", $font2, $brush2, 10, 60)
$g.DrawString("env", $font, $brush, 30, 60)
$g.DrawString("y", $font2, $brush2, 90, 60)
$g.Dispose()
$bmp.Save("tenvy/images/icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
