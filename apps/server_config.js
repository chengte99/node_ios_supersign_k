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

    center_database: {
        host: "127.0.0.1",
        port: 3306,
        db_name: "mytest_supersign",
        user: "root",
        password: "asd12345"
    },
    
    center_redis: {

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

    appfile_config: {
        appfile_download_scheme: "itms-services://?action=download-manifest&url=",
        appfile_domain: "https://apple.bckappgs.info/", // kritars 自己測試用的ftp server
    },

    rundown_config: {
        api_with_system: true,
        api_success_with_system_config: {
            hostname: "api-518.webpxy.info",
            port: 443,
            url: "/api/v1/request/sign_complete",
        },
        api_fail_with_system_config: {
            hostname: "api-518.webpxy.info",
            port: 443,
            url: "/api/v1/request/sign_fail",
        },
        appfile_domain: "https://appdownload.webpxy.info/", // 與內部組對接用的ftp server
    },
}

module.exports = server_config;