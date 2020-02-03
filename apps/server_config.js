var server_config = {
    gateway: {

    },

    center_server: {

    },

    system_server: {
        host: "127.0.0.1",
        port: 6081,
    },

    webserver: {
        http_config: {
            host: "127.0.0.1",
            port: 80,
        },
    
        https_config: {
            host: "127.0.0.1",
            port: 443,
        },
    },

    // center_database: {
    //     host: "127.0.0.1",
    //     port: 3306,
    //     db_name: "mytest_supersign",
    //     user: "root",
    //     password: "asd12345",
    // },

    // test_site
    center_database: {
        host: "192.168.20.203",
        port: 3306,
        db_name: "supersign",
        user: "w_supersign",
        password: "Gfd^&12FV",
    },
    
    center_redis: {
        host: "127.0.0.1",
        port: 6379,
        db_index: 0,
    },

    sftp_file_server: {
        host: "210.68.95.161",
        port: 4005,
        username: "brilliantkevin99",
        password: "qaz123"
    },

    ftp_file_server: {
        host: "192.168.20.8", // 210.68.95.166 (192.168.20.8)
        port: 4428,
        username: "supersign",
        password: "8yxRPG7C5k"
    },

    local_mac_config: {
        acc_group: 0, // 0-> 本機測試用, 1-> imac-04, 2-> imac-01, 3-> 特殊
        balance_switch_acc: false, // 是否啟用平衡帳號註冊udid，不啟用則塞滿95後再換下一個帳號
    },

    backup_mac_server_config: {
        hostname: "10.159.5.141", //imac-04: 10.159.5.141, imac-01: 10.159.5.114
        port: 80,
        url: "/sync_local_file",
    },

    appfile_config: {
        appfile_download_scheme: "itms-services://?action=download-manifest&url=",
        appfile_domain: "https://apple.bckappgs.info/", // kritars 自己測試用的ftp server
    },

    rundown_config: {
        api_with_system: true,
        api_system_config: {
            hostname: "api-518.webpxy.info",
            port: 443,
            url: "/api/v1/request/sign_notify",
        },
        appfile_domain: "https://appdownload.webpxy.info/", // 與內部組對接用的ftp server
    },
}

module.exports = server_config;