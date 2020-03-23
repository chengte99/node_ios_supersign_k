var server_config = {
    gateway: {

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

    // local
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

    // pro_site
    center_database_pro: {
        host: "192.168.20.81", // 192.168.20.80 only read
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

    // test_site
    ftp_file_server: {
        host: "192.168.20.8", // 210.68.95.166 (192.168.20.8)
        port: 4428,
        username: "supersign",
        password: "8yxRPG7C5k"
    },

    // pro_site
    ftp_file_server_pro: {
        host: "192.168.20.19",
        port: 21,
        username: "supersign",
        password: "8yxRPG7C5k"
    },

    local_mac_config: {
        acc_group: 1, // 1-> 正常群組, 2-> 特殊群組
        balance_switch_acc: true, // 是否啟用平衡帳號註冊udid，不啟用則塞滿95後再換下一個帳號
        m_code: 0, // 0-> 本機測試用, 1-> imac-01, 2-> imac-04, 3-> IMAC1804003
    },

    backup_mac_server_config: {
        hostname: "192.168.20.17", //imac-01: 192.168.20.18, imac-04: 192.168.20.17, IMAC1804003: 10.159.5.114
        port: 80,
        url: "/sync_local_file",
    },

    appfile_config: {
        appfile_download_scheme: "itms-services://?action=download-manifest&url=",
        appfile_domain: "https://apple.bckappgs.info/", // kritars 自己測試用的ftp server
    },

    rundown_config: {
        api_with_system: false,
        api_system_config: {
            hostname: "api-518.webpxy.info",
            port: 80,
            url: "/api/v1/request/sign_notify",
            appfile_domain: "https://appdownload.webpxy.info/", // 與內部組對接用的ftp server
        },

        api_system_config_pro: {
            hostname: "api-518.webpxy.org",
            // hostname: "api.xkmmy.com", // 正式站
            port: 80,
            url: "/api/v1/request/sign_notify",
            appfile_domain: "https://appdownload.webpxy.org/", // 與內部組對接用的ftp server pro
            // appfile_domain: "https://appdownload.zzzhub.com/", // 正式站
        },
    },

    server_type: 0, // 0-> 開發(測試)站，1-> 正測站，2-> 正式站
}

module.exports = server_config;