package com.example.demo.dao;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/*
④ 起動時にデータを保存
CommandLineRunner を使用
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

            User alice = new User("Alice", 28, "女性", "東京都渋谷区", "150-0001", "日本");
            alice.addTicket(ticketA);
            alice.addTicket(ticketB);

            User bob = new User("Bob", 35, "男性", "大阪府大阪市", "530-0001", "アメリカ");
            bob.addTicket(ticketA);

            userRepository.save(alice);
            userRepository.save(bob);
        };
    }
}