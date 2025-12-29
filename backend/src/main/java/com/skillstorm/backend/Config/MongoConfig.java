package com.skillstorm.backend.Config;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.security.KeyStore;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

import com.mongodb.ConnectionString;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

@Configuration
@Profile("!dev")
@SuppressWarnings("UnnecessaryReturnStatement")
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
            // Create truststore following official AWS DocumentDB approach
            String truststorePassword = "changeit";
            File truststoreFile = createTrustStore(truststorePassword);

            // Set system properties for SSL/TLS
            System.setProperty("javax.net.ssl.trustStore", truststoreFile.getAbsolutePath());
            System.setProperty("javax.net.ssl.trustStorePassword", truststorePassword);

            // Create MongoDB client with connection string
            return MongoClients.create(mongoUri);

        } catch (Exception e) {
            throw new RuntimeException("Failed to configure MongoDB SSL certificate", e);
        }
    }

    private File createTrustStore(String password) throws Exception {
        // Load certificate factory
        CertificateFactory cf = CertificateFactory.getInstance("X.509");

        // Start with the DEFAULT Java truststore (contains public CAs like DigiCert for Stripe)
        KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
        
        // Load the default cacerts truststore
        String javaHome = System.getProperty("java.home");
        File defaultTruststore = new File(javaHome, "lib/security/cacerts");
        if (!defaultTruststore.exists()) {
            // Fallback for some JDK distributions
            defaultTruststore = new File(javaHome, "jre/lib/security/cacerts");
        }
        
        if (defaultTruststore.exists()) {
            try (InputStream defaultCertsStream = new java.io.FileInputStream(defaultTruststore)) {
                keyStore.load(defaultCertsStream, "changeit".toCharArray());
            }
        } else {
            // If default truststore not found, start with empty (not ideal but fallback)
            keyStore.load(null, null);
        }

        // ADD the RDS/DocumentDB certificates to the existing truststore
        try (InputStream certInputStream = new ClassPathResource("global-bundle.pem").getInputStream()) {
            int certIndex = 0;
            for (Certificate cert : cf.generateCertificates(certInputStream)) {
                String alias = "rds-ca-" + certIndex++;
                keyStore.setCertificateEntry(alias, cert);
            }
        }

        // Save merged keystore to temporary file
        File truststoreFile = File.createTempFile("merged-truststore", ".jks");
        truststoreFile.deleteOnExit();

        try (FileOutputStream fos = new FileOutputStream(truststoreFile)) {
            keyStore.store(fos, password.toCharArray());
        }

        return truststoreFile;
    }
}
