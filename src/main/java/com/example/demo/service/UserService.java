package com.example.demo.service;

import org.springframework.stereotype.Service;

import com.example.demo.dao.User;
import com.example.demo.dao.UserRepository;

import java.util.List;

/*
⑤ データを取得する
サービス層（任意だが実務では推奨）
*/

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public List<User> findAll() {
        return repository.findAll();
    }

    public User save(User user) {
        return repository.save(user);
    }
}