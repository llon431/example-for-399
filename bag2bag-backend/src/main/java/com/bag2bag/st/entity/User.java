package com.bag2bag.st.entity;

import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 用户 实体对象
 *
 * @author: ShanZhu
 * @date: 2024-01-05
 */
@Data
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String accountNumber;

    private String userPassword;

    private String nickname;

    private String avatar;

    private Date signInTime;

    private Byte userStatus;

}