# node_ios_supersign_k

啟動前根據機器調整部分:
1. server_config.js -> rundown_config.api_with_system: true
2. server_config.js -> local_mac_config.m_code: 0,1,2
3. server_config.js -> local_mac_config.acc_group: 1,2
4. server_config.js -> local_mac_config.balance_switch_acc: true
5. server_config.js -> backup_mac_server_config.hostname: ip_address
6. ios_sign/check2FA_valid.rb -> uri = URI('https://IP/acc_login_return')
7. ios_sign/reg_to_acc.rb -> uri = URI('https://IP/reg_to_acc_return')
8. ios_sign/add_new_acc.sh -> "liaoyanchi3@gmail.com"（更改要檢查的帳號）
9. 確認redis-server 啟動 (系統服務的為brew services restart redis)
10. server_config.js -> server_type 