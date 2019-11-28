1. 到 https://gethttpsforfree.com/ 申請免費ssl
2. 步驟一到步驟三 到newssl/ 底下跟著步驟操作即可...
3. 步驟四 

選擇file-based，根據 app.use(express.static(staticFilePath)) 指定的路徑，在底下新增資料夾

mkdir .well-known && cd .well-known
mkdir acme-challenge && cd acme-challenge

根據under this url 的路徑產生指定檔案並寫入指定內容
ex: 
echo -n "-lGVUbKRjUGiG8kEHhispLJXIfnTyKunpb5F7P3lmmM.rDVdgejGRioNO98HQFfrZB2CElCysLiZOU4iVKa0yao" > /path/to/www/.well-known/acme-challenge/-lGVUbKRjUGiG8kEHhispLJXIfnTyKunpb5F7P3lmmM

寫完後重啟服務器，點擊連結測試是否正確連到該檔案，成功即可按下"I'm now serving this file on xxx.com"

成功後再到newssl/ 底下操作顯示的命令。

第二個Domain的操作方式同上。

4. 步驟五

分兩段，先執行Nginx部分:
newssl/底下產生chained.pem，並寫入最下方密文內容

再執行Apache部分:
newssl/Apache/底下產生domain.crt，寫入最下方第一段密文內容。
newssl/Apache/底下產生intermediate.pem，寫入最下方第二段密文內容。



取得服務器https证书相关的两个文件（Apache 會將chained.pem 拆成簽名證書domain.crt 跟中級證書intermediate.pem）
# chained.pem, domain.key (Apache: domain.crt, intermediate.pem, domain.key)

(1)
copy Apache 的 domain.crt 跟 domain.key 至mobileconfig 資料夾
# ==> domain.crt, domain.key

(2)
通过在线openssl工具把domain.crt和domain.key合成为.pem文件，网站：
https://www.myssl.cn/tools/merge-pem-cert.html
.key 不用勾選對密鑰加密
.crt 勾選自動添加 中間證書
# => ssl.pem

(3)
执行如下命令：
openssl rsa -in domain.key -out ybsnopass.key
# => ybsnopass.key

(4)
此时文件夹下，共会有domain.crt, domain.key, ssl.pem, ybsnopass.key 四個檔案
终端执行命令：
openssl smime -sign -in getudid.mobileconfig -out signed.mobileconfig -signer domain.crt -inkey ybsnopass.key -certfile ssl.pem -outform der -nodetach
# => signed.mobileconfig