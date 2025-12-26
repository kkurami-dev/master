package com.example.demo.dao;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/*
④ データを保存する（起動時）
CommandLineRunner を使う方法
*/

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner init(UserRepository repository) {
        return args -> {
            repository.save(new User("Alice"));
            repository.save(new User("Bob"));
        };
    }
}