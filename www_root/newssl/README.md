取得服務器https证书相关的两个文件（Apache 會將chained.pem 拆成簽名證書domain.crt 跟中級證書intermediate.pem）
# chained.pem, domain.key (Apache: domain.crt, intermediate.pem, domain.key)

(1)
copy Apache 的 domain.crt 跟 domain.key 至mobileconfig 資料夾
# ==> domain.crt, domain.key

(2)
通过在线openssl工具把.crt和.key合成为.pem文件，网站：
https://www.myssl.cn/tools/merge-pem-cert.html
# => ssl.pem

(3)
执行如下命令：
openssl rsa -in domain.key -out ybsnopass.key
# => ybsnopass.key

(4)
此时文件夹下，共会有domain.crt, domain.key, ssl.pem, ybsnopass.key 四個檔案
终端执行命令：
openssl smime -sign -in xxx.mobileconfig -out signed.mobileconfig -signer domain.crt -inkey ybsnopass.key -certfile ssl.pem -outform der -nodetach
# => signed.mobileconfig