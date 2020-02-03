# node_ios_supersign_k

啟動前根據機器調整部分:
1. server_config.js -> rundown_config.api_with_system: true
2. server_config.js -> local_mac_config.acc_group: 0,1,2,3
3. server_config.js -> local_mac_config.balance_switch_acc: true
4. server_config.js -> backup_mac_server_config.hostname: ip_address
5. ios_sign/check2FA_valid.rb -> uri = URI('https://IP/acc_login_return')
6. ios_sign/reg_to_acc.rb -> uri = URI('https://IP/reg_to_acc_return')
7. ios_sign/add_new_acc.sh -> "liaoyanchi3@gmail.com"（更改要檢查的帳號）
8. 確認redis-server 啟動 (系統服務的為brew services restart redis)