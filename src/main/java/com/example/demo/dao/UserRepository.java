package com.example.demo.dao;

import org.springframework.data.jpa.repository.JpaRepository;

/*
③ リポジトリを作成（CRUD は自動生成）
*/

public interface UserRepository extends JpaRepository<User, Long> {
}