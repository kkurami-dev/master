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
    CommandLineRunner init(UserRepository userRepository, TicketRepository ticketRepository) {
        return args -> {
            Ticket ticketA = new Ticket("TicketA", 600);
            Ticket ticketB = new Ticket("TicketB", 500);

            ticketRepository.save(ticketA);
            ticketRepository.save(ticketB);

            User alice = new User("Alice");
            alice.addTicket(ticketA);
            alice.addTicket(ticketB);

            User bob = new User("Bob");
            bob.addTicket(ticketA);

            userRepository.save(alice);
            userRepository.save(bob);
        };
    }
}