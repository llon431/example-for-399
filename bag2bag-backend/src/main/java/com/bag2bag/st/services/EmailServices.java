package com.bag2bag.st.services;

public interface EmailServices {
    void sendCode(String upi);
    boolean verifyCode(String upi, String code);
}
