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
    
}

module.exports = server_config;