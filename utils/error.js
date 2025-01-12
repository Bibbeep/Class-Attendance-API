class HttpRequestError extends Error {
    constructor(status_code, message, details = []) {
        super(message);
        this.status_code = status_code;
        this.details = details;
    }
}

module.exports = HttpRequestError;
