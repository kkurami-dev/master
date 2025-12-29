package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.demo.service.HelloService;
import com.example.demo.dao.UserRepository;
import com.example.demo.dao.User;

import java.util.Optional;

@Controller
@RequestMapping("/api")
public class HelloController {

    private final HelloService helloService;
    private final UserRepository userRepository;

    @Autowired
    public HelloController(HelloService helloService, UserRepository userRepository) {
        this.helloService = helloService;
        this.userRepository = userRepository;
    }

    @GetMapping("/hello")
    public String sayHello(@RequestParam(name = "userId", required = false) Long userId, Model model) {
        model.addAttribute("message", helloService.getHelloMessage());
        if (userId != null) {
            Optional<User> userOpt = userRepository.findById(userId);
            userOpt.ifPresent(user -> model.addAttribute("user", user));
        }
        return "hello";
    }
}