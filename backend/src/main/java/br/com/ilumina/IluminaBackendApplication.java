package br.com.ilumina;

import br.com.ilumina.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@EnableConfigurationProperties(JwtProperties.class)
@SpringBootApplication
public class IluminaBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(IluminaBackendApplication.class, args);
	}

}
