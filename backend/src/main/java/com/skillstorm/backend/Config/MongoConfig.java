package com.skillstorm.backend.Config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import java.io.InputStream;
import java.security.KeyStore;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri:${spring.mongodb.uri}}")
    private String mongoUri;

    @Override
    protected String getDatabaseName() {
        ConnectionString connectionString = new ConnectionString(mongoUri);
        return connectionString.getDatabase();
    }

    @Override
    @Bean
    public MongoClient mongoClient() {
        try {
            // Load ALL AWS DocumentDB certificates from the bundle
            CertificateFactory cf = CertificateFactory.getInstance("X.509");

            // Create a KeyStore to hold all certificates from the bundle
            KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
            keyStore.load(null, null);

            // Load all certificates from the PEM bundle
            try (InputStream certInputStream = new ClassPathResource("global-bundle.pem").getInputStream()) {
                int certIndex = 0;
                for (Certificate cert : cf.generateCertificates(certInputStream)) {
                    keyStore.setCertificateEntry("documentdb-ca-" + certIndex++, cert);
                }
            }

            // Create a TrustManager that trusts all certificates in the keystore
            TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            tmf.init(keyStore);

            // Create an SSLContext that uses the TrustManager
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, tmf.getTrustManagers(), null);

            // Build MongoDB client settings with SSL context
            MongoClientSettings settings = MongoClientSettings.builder()
                    .applyConnectionString(new ConnectionString(mongoUri))
                    .applyToSslSettings(builder -> {
                        builder.enabled(true);
                        builder.invalidHostNameAllowed(true);
                        builder.context(sslContext);
                    })
                    .build();

            return MongoClients.create(settings);

        } catch (Exception e) {
            throw new RuntimeException("Failed to configure MongoDB SSL certificate", e);
        }
    }
}
