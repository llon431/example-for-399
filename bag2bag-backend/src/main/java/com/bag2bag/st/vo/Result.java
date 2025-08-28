package com.bag2bag.st.vo;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Result<T> {
    private int code;
    private String msg;
    private T data;


    public Result(int code, String msg, T data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    // 工廠方法
    public static <T> Result<T> ok(T data) {
        return new Result<>(200, "OK", data);
    }

}
