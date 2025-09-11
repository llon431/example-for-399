package com.bag2bag.st.service.impl;

import com.bag2bag.st.entity.User;
import com.bag2bag.st.mapper.UserMapper;
import com.bag2bag.st.service.UserService;
import com.bag2bag.st.vo.PageVo;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;


@Service
public class UserServiceImpl implements UserService {

    @Resource
    private UserMapper userMapper;

    public User getUser(Long id) {
        return userMapper.selectByPrimaryKey(id);
    }

    public User userLogin(String UPI, String userPassword) {
        return userMapper.userLogin(UPI, userPassword);
    }

    public boolean userSignIn(User user) {
        return userMapper.insert(user) == 1;
    }

    public boolean updateUserInfo(User user) {
        if (user == null || user.getId() == null) return false;

        // 仅允许修改公开资料字段，避免越权更新敏感列
        User patch = new User();
        patch.setId(user.getId());
        patch.setNickname(user.getNickname());
        patch.setAvatar(user.getAvatar());
        patch.setCountry(user.getCountry());
        patch.setMajor(user.getMajor());
        patch.setDegree(user.getDegree());

        return userMapper.updateByPrimaryKeySelective(patch) > 0;
    }

    public boolean updatePassword(String newPassword, String oldPassword, Long id) {
        return userMapper.updatePassword(newPassword, oldPassword, id) == 1;
    }

    public PageVo<User> getUserByStatus(int status, int page, int nums) {
        List<User> list;
        int count = 0;
        if (status == 0) {
            count = userMapper.countNormalUser();
            list = userMapper.getNormalUser((page - 1) * nums, nums);
        } else {
            count = userMapper.countBanUser();
            list = userMapper.getBanUser((page - 1) * nums, nums);
        }
        return new PageVo<>(list, count);
    }

    @Override
    public User getPublicUserById(Long id) {
        // 可直接複用 selectByPrimaryKey；或用 selectPublicById（見下）
        return userMapper.selectByPrimaryKey(id);
    }

}
