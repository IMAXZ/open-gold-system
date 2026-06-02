package com.gold.collector.config;

import lombok.Data;
import lombok.NonNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 跨域配置
 *
 * @author max
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "cors")
public class CorsConfig implements WebMvcConfigurer {

    /**
     * 是否启用跨域
     */
    private boolean enabled = true;

    /**
     * 允许的来源域名
     */
    private String allowedOriginPatterns = "*";

    /**
     * 允许的 HTTP 方法
     */
    private String allowedMethods = "GET,POST,PUT,DELETE,OPTIONS,PATCH";

    /**
     * 是否允许携带 Cookie
     */
    private boolean allowCredentials = true;

    /**
     * 允许的请求头
     */
    private String allowedHeaders = "*";

    /**
     * 暴露的响应头
     */
    private String exposedHeaders = "*";

    /**
     * 预检请求的缓存时间（秒）
     */
    private long maxAge = 3600;

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        // 如果未启用跨域，直接返回
        if (!enabled) {
            return;
        }

        // 添加跨域映射规则
        registry.addMapping("/**")
                // 允许的来源域名
                .allowedOriginPatterns(allowedOriginPatterns)
                // 允许的 HTTP 方法
                .allowedMethods(allowedMethods.split(","))
                // 是否允许携带 Cookie
                .allowCredentials(allowCredentials)
                // 允许的请求头
                .allowedHeaders(allowedHeaders.split(","))
                // 暴露的响应头（前端可以访问的响应头）
                .exposedHeaders(exposedHeaders.split(","))
                // 预检请求的缓存时间（秒）
                .maxAge(maxAge);
    }
}
