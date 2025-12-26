package com.example.demo.service;

import org.springframework.stereotype.Service;

import com.example.demo.User;
import com.example.demo.UserRepository;

import java.util.List;

/*
⑤ データを取得する
Service（任意だが実務では推奨）
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
}