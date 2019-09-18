# !/bin/bash
IPA_NAME="$1"
PROVISIONING_FILE="$2"
RESIGNED_IPA_NAME="resigned_"$IPA_NAME

ORI_PROVISIONING_PATH="../"$IPA_NAME"/"$PROVISIONING_FILE
NEW_PROVISIONING_PATH="../"$IPA_NAME"/embedded.mobileprovision"

echo $IPA_NAME
echo $RESIGNED_IPA_NAME

echo $PROVISIONING_FILE
echo $ORI_PROVISIONING_PATH
echo $NEW_PROVISIONING_PATH


IPA_PATH="../"$IPA_NAME"/"$IPA_NAME".ipa"
RESIGNED_IPA_PATH="../"$IPA_NAME"/"$RESIGNED_IPA_NAME".ipa"
echo $IPA_PATH
echo $RESIGNED_IPA_PATH

# SERVERKEY="Test"

# provisioning 改名
cp $ORI_PROVISIONING_PATH $NEW_PROVISIONING_PATH

openssl x509 -in ../cert_file/pro_cert.cer -inform der -out ../cert_file/pro_cert.pem

openssl x509 -noout -fingerprint -sha1 -in ../cert_file/pro_cert.pem > ../cert_file/fingerprint

while IFS='=' read -r name role
do
  echo $role > ../cert_file/fingerprint
done < ../cert_file/fingerprint

sed 's/://g' ../cert_file/fingerprint > ../cert_file/fingerprint_sha1

DEVELOPER=$(cat ../cert_file/fingerprint_sha1)

echo $DEVELOPER

sh ../ios_resign_with_ipa $IPA_PATH "$DEVELOPER" $NEW_PROVISIONING_PATH $RESIGNED_IPA_PATH

rm -rf $ORI_PROVISIONING_PATH

#/Applications/AppDeploy.app/Contents/MacOS/AppDeploy --file=$RESIGNED_IPA_PATH --serverkey=$SERVERKEY --ftp