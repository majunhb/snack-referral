#!/bin/bash
# 🚀 一键配置微信支付密钥（Linux / macOS）

set -e

echo "========================================"
echo "  snack-referral 密钥配置脚本"
echo "========================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

echo "[1/5] 创建密钥目录..."
mkdir -p "$PROJECT_ROOT/server/keys/wechat"
echo "      已创建: $PROJECT_ROOT/server/keys/wechat"
echo ""

echo "[2/5] 放置微信小程序私钥..."
PRIVATE_KEY_SRC="$HOME/Downloads/private.wxdc45c83956b489e9.key"
PRIVATE_KEY_DST="$PROJECT_ROOT/server/keys/wechat/private.wxdc45c83956b489e9.key"
if [ -f "$PRIVATE_KEY_SRC" ]; then
    cp "$PRIVATE_KEY_SRC" "$PRIVATE_KEY_DST"
    echo "      已复制私钥到: $PRIVATE_KEY_DST"
else
    echo "      警告: 未找到私钥文件 $PRIVATE_KEY_SRC"
    echo "      请手动复制 private.wxdc45c83956b489e9.key 到 $PROJECT_ROOT/server/keys/wechat/"
fi
echo ""

echo "[3/5] 放置微信支付平台公钥..."
PUBLIC_KEY_SRC="$HOME/Downloads/非对称密钥.txt"
PUBLIC_KEY_DST="$PROJECT_ROOT/server/keys/wechat/wxpay_public_key.pem"
if [ -f "$PUBLIC_KEY_SRC" ]; then
    cp "$PUBLIC_KEY_SRC" "$PUBLIC_KEY_DST"
    echo "      已复制公钥到: $PUBLIC_KEY_DST"
else
    echo "      警告: 未找到公钥文件 $PUBLIC_KEY_SRC"
fi
echo ""

echo "[4/5] 创建 .env 配置文件..."
ENV_EXAMPLE="$PROJECT_ROOT/server/.env.example"
ENV_FILE="$PROJECT_ROOT/server/.env"
if [ -f "$ENV_EXAMPLE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "      已创建: $ENV_FILE"
    
    # 自动填入对称密钥
    SYMMETRIC_KEY=$(cat "$HOME/Downloads/对称密钥.txt" | tr -d '\n' | tr -d '\r')
    sed -i.bak "s|WX_APPID=.*|WX_APPID=wxdc45c83956b489e9|" "$ENV_FILE"
    sed -i.bak "s|WX_PAY_V3_KEY=.*|WX_PAY_V3_KEY=$SYMMETRIC_KEY|" "$ENV_FILE"
    rm -f "$ENV_FILE.bak"
    
    echo "      已自动填入 AppID 和 APIv3 密钥"
else
    echo "      错误: 未找到 .env.example 文件"
fi
echo ""

echo "[5/5] 安装后端依赖..."
cd "$PROJECT_ROOT/server"
npm install
echo "      依赖安装完成"
echo ""

echo "========================================"
echo "  ✅ 配置完成！"
echo "========================================"
echo ""
echo "📝 后续步骤："
echo "  1. 编辑 server/.env 填入微信支付商户号 (WX_MCHID)"
echo "  2. 编辑 server/.env 填入回调 URL (WX_NOTIFY_URL)"
echo "  3. 用微信开发者工具导入 miniprogram-user/ 目录"
echo "  4. 启动后端: cd server && npm run dev"
echo ""
