# 🚀 一键配置微信支付密钥（Windows PowerShell）

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  snack-referral 密钥配置脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 获取脚本所在目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = $ScriptDir

Write-Host "[1/5] 创建密钥目录..." -ForegroundColor Yellow
$KeysDir = Join-Path $ProjectRoot "server\keys\wechat"
New-Item -ItemType Directory -Force -Path $KeysDir | Out-Null
Write-Host "      已创建: $KeysDir" -ForegroundColor Green

Write-Host ""
Write-Host "[2/5] 放置微信小程序私钥..." -ForegroundColor Yellow
$PrivateKeySrc = "C:\Users\Administrator\Downloads\private.wxdc45c83956b489e9.key"
$PrivateKeyDst = Join-Path $KeysDir "private.wxdc45c83956b489e9.key"
if (Test-Path $PrivateKeySrc) {
    Copy-Item $PrivateKeySrc $PrivateKeyDst
    Write-Host "      已复制私钥到: $PrivateKeyDst" -ForegroundColor Green
} else {
    Write-Host "      警告: 未找到私钥文件 $PrivateKeySrc" -ForegroundColor Red
    Write-Host "      请手动复制 private.wxdc45c83956b489e9.key 到 $KeysDir" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[3/5] 放置微信支付平台公钥..." -ForegroundColor Yellow
$PublicKeySrc = "C:\Users\Administrator\Downloads\非对称密钥.txt"
$PublicKeyDst = Join-Path $KeysDir "wxpay_public_key.pem"
if (Test-Path $PublicKeySrc) {
    Copy-Item $PublicKeySrc $PublicKeyDst
    Write-Host "      已复制公钥到: $PublicKeyDst" -ForegroundColor Green
} else {
    Write-Host "      警告: 未找到公钥文件 $PublicKeySrc" -ForegroundColor Red
}

Write-Host ""
Write-Host "[4/5] 创建 .env 配置文件..." -ForegroundColor Yellow
$EnvExample = Join-Path $ProjectRoot "server\.env.example"
$EnvFile = Join-Path $ProjectRoot "server\.env"
if (Test-Path $EnvExample) {
    Copy-Item $EnvExample $EnvFile
    Write-Host "      已创建: $EnvFile" -ForegroundColor Green
    
    # 自动填入对称密钥
    $SymmetricKey = Get-Content "C:\Users\Administrator\Downloads\对称密钥.txt" -Raw
    $SymmetricKey = $SymmetricKey.Trim()
    
    (Get-Content $EnvFile) | ForEach-Object {
        $_ -replace 'WX_APPID=.*', 'WX_APPID=wxdc45c83956b489e9' `
           -replace 'WX_PAY_V3_KEY=.*', "WX_PAY_V3_KEY=$SymmetricKey"
    } | Set-Content $EnvFile -Encoding UTF8
    
    Write-Host "      已自动填入 AppID 和 APIv3 密钥" -ForegroundColor Green
} else {
    Write-Host "      错误: 未找到 .env.example 文件" -ForegroundColor Red
}

Write-Host ""
Write-Host "[5/5] 安装后端依赖..." -ForegroundColor Yellow
$ServerDir = Join-Path $ProjectRoot "server"
Set-Location $ServerDir
npm install
Write-Host "      依赖安装完成" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ 配置完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 后续步骤：" -ForegroundColor Yellow
Write-Host "  1. 编辑 server\.env 填入微信支付商户号 (WX_MCHID)"
Write-Host "  2. 编辑 server\.env 填入回调 URL (WX_NOTIFY_URL)"
Write-Host "  3. 用微信开发者工具导入 miniprogram-user\ 目录"
Write-Host "  4. 启动后端: cd server && npm run dev"
Write-Host ""
Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
