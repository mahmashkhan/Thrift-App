export const successResponse = (res, status, data) => {
    res.status(status).json({
        status: "success",
        responseCode: "00",
        data
    })
}

export const errorResponse = (res, status, error) => {
    res.status(status || 500).json({
        status: "fail",
        responseCode: "01",
        error
    })
}