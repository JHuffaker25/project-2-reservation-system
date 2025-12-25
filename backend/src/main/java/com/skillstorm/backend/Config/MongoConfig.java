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
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;

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
            // Load the AWS DocumentDB certificate
            CertificateFactory cf = CertificateFactory.getInstance("X.509");
            InputStream certInputStream = new ClassPathResource("global-bundle.pem").getInputStream();
            X509Certificate caCert = (X509Certificate) cf.generateCertificate(certInputStream);
            certInputStream.close();

            // Create a KeyStore containing the certificate
            KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
            keyStore.load(null, null);
            keyStore.setCertificateEntry("documentdb-ca", caCert);

            // Create a TrustManager that trusts the certificate
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
