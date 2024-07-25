
export const RResult = (statusCode, body) => {
    if (body?.errorCode) {
        return {
            status: "fail",
            error: body.errorCode,
            errDev: body?.error || "",
            data: body?.data || "",
        };
    } else {
        return {
            status: "success",
            data: body,
        };
    }
};