class ApiError extends Error {
    constructor(
        statusCode,
        message= 'Somthin Went Wrong',
        error = [],
        statck = ""
    ){
        super (message)
        this.statusCode = statusCode
        this.Data = null
        this.message = message
        this.success = false;
        this.error = this.error

        if(statck){
            this.stack = statck
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}