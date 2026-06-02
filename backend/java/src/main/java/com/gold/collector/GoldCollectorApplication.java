package com.gold.collector;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * @author max
 */
@EnableRetry
@EnableScheduling
@SpringBootApplication
public class GoldCollectorApplication {
    public static void main(String[] args) {
        SpringApplication.run(GoldCollectorApplication.class, args);
    }
}