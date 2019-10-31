# !/bin/bash
APP_NAME="$1"
ORI_FILE_NAME="$2"
PROVIS_FILE_NAME="$3"
CERT_NAME="$4"
RESIGNED_APP_NAME="$5"

echo $APP_NAME
echo $ORI_FILE_NAME
echo $PROVIS_FILE_NAME
echo $CERT_NAME
echo $RESIGNED_APP_NAME

PROVIS_PATH="./ios_sign/account/"$PROVIS_FILE_NAME".mobileprovision"
# NEW_PROVISIONING_PATH="./ios_sign/"$APP_NAME"/embedded.mobileprovision"

echo $PROVIS_PATH
# echo $NEW_PROVISIONING_PATH

ORI_APP_PATH="./ios_sign/"$APP_NAME"/"$ORI_FILE_NAME".ipa"
RESIGNED_APP_PATH="./ios_sign/"$APP_NAME"/"$RESIGNED_APP_NAME".ipa"
echo $ORI_APP_PATH
echo $RESIGNED_APP_PATH

# provisioning 改名
# cp $PROVIS_PATH $NEW_PROVISIONING_PATH

# ./ios_resign_with_ipa $ORI_APP_PATH "$CERT_NAME" $NEW_PROVISIONING_PATH $RESIGNED_APP_PATH
./ios_sign/ios_resign_with_ipa $ORI_APP_PATH "$CERT_NAME" $PROVIS_PATH $RESIGNED_APP_PATH $APP_NAME $RESIGNED_APP_NAME

# /Applications/AppDeploy.app/Contents/MacOS/AppDeploy --file=$RESIGNED_APP_PATH --serverkey=$APP_NAME --ftp

# rm -rf $PROVIS_PATH