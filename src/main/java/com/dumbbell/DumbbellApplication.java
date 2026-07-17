package com.dumbbell;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DumbbellApplication {
    public static void main(String[] args) {
        SpringApplication.run(DumbbellApplication.class, args);
    }
}
