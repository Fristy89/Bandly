package com.bandly.backend

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Testcontainers

/**
 * Boots the full Spring context against a real, ephemeral Postgres via
 * Testcontainers (blueprint §18) — requires a local Docker daemon.
 */
@Testcontainers
@SpringBootTest
class BackendApplicationTests {

    @TestConfiguration(proxyBeanMethods = false)
    class TestcontainersConfig {
        @Bean
        @ServiceConnection
        fun postgresContainer(): PostgreSQLContainer<*> =
            PostgreSQLContainer("postgres:16-alpine")
    }

    @Test
    fun contextLoads() {
    }
}
