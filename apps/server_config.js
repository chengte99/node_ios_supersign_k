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
        username: "brilliantkevin99",
        password: "qaz123"
    },
}

module.exports = server_config;