package com.example.demo.dao;

import org.springframework.data.jpa.repository.JpaRepository;

/*
③ Repository を作成（CRUD 自動生成）
*/

public interface UserRepository extends JpaRepository<User, Long> {
}