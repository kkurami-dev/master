package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.demo.dao.User;
import com.example.demo.service.UserService;

/*
コントローラー：DB から取得して HTML に表示
*/

@Controller
@RequestMapping("/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    /**
     * GET /users を処理するハンドラ
     *
     * 処理の流れ:
     * - `service.findAll()` で DB からユーザー一覧を取得する
     * - 取得したリストを Model に `users` という属性名で格納する
     * - return "users" は ViewResolver により templates/users.html を指すビュー名になる
     *
     * テンプレート側 (users.html) では `th:each="user : ${users}"` のように
     * Model の `users` を参照して各ユーザーを表示します。
     */
    @GetMapping
    public String getUsers(Model model) {
        model.addAttribute("users", service.findAll());
        return "users";
    }

    /* POST リクエストを処理するハンドラ */
    @PostMapping
    public String addUser(@RequestParam String name) {
        service.save(new User(name));
        return "redirect:/users";
    }
}
