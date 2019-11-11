var Response = {
    OK: 1,
    INVAILD_PARAMS: -100, // 參數錯誤
    SYS_ERROR: -101, // 系統錯誤
    DB_SEARCH_EMPTY: -102, // db找不到資料
    FILE_NOT_EXIST: -103, // 檔案不存在
    NO_VALID_ACCOUNT: -104, // 無可用app帳號
    STILL_UPLOAD: -105, // 仍在上傳中
    UPLOAD_FAILED: -106, // 上傳失敗
    APP_IS_EXIST: -107, // app已存在且已簽過名

    RESIGN_QUEUE_IS_EMPTY: -108, // 目前佇列為空
    WRITESTREAM_ERROR: -109, // 文件寫入錯誤

    TIMESTAMP_INVALID: -110, // app下載期限已過一年
    GET_REMOTE_FAILED: -111, // 獲取遠端檔案失敗
    LOCAL_MKDIR_FAILED: -112, //本地創建目錄失敗
    NO_MAX_DEVICES_ACCOUNT: -113, // 無設備數達100的app帳號
};

module.exports = Response;