package com.zaki.zecbot.server;

import com.sun.net.httpserver.HttpsConfigurator;
import com.sun.net.httpserver.HttpsParameters;
import com.sun.net.httpserver.HttpsServer;

import javax.net.ssl.*;
import java.io.FileInputStream;
import java.net.InetSocketAddress;
import java.security.KeyStore;

public class ZecServer {

    private HttpsServer instance;

    private CommandHandler handler;

    private boolean isRunning;

    public ZecServer() {

    }

    private void init() throws Exception {
        // setup the socket address
        InetSocketAddress address = new InetSocketAddress(8080);

        // initialise the HTTPS server
        instance = HttpsServer.create(address, 0);
        SSLContext sslContext = SSLContext.getInstance("TLS");

        // initialise the keystore
        char[] password = "14eiuqhwdyeuq*".toCharArray();
        KeyStore ks = KeyStore.getInstance("JKS");
        FileInputStream fis = new FileInputStream("zecbot.jks");
        ks.load(fis, password);

        // setup the key manager factory
        KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509");
        kmf.init(ks, password);

        // setup the trust manager factory
        TrustManagerFactory tmf = TrustManagerFactory.getInstance("SunX509");
        tmf.init(ks);

        // setup the HTTPS context and parameters
        sslContext.init(kmf.getKeyManagers(), tmf.getTrustManagers(), null);
        instance.setHttpsConfigurator(new HttpsConfigurator(sslContext) {
            public void configure(HttpsParameters params) {
                try {
                    // initialise the SSL context
                    SSLContext context = getSSLContext();
                    SSLEngine engine = context.createSSLEngine();
                    params.setNeedClientAuth(false);
                    params.setCipherSuites(engine.getEnabledCipherSuites());
                    params.setProtocols(engine.getEnabledProtocols());

                    // Set the SSL parameters
                    SSLParameters sslParameters = context.getSupportedSSLParameters();
                    params.setSSLParameters(sslParameters);

                } catch (Exception ex) {
                    System.out.println("Failed to create HTTPS port");
                }
            }
        });
        handler = new CommandHandler();
        instance.createContext("/", handler);
        instance.setExecutor(null); // creates a default executor
    }

    public void start() throws Exception {
        if (!isRunning) {
            isRunning = true;
            init();
            instance.start();
        }
    }

    public void stop() {
        if (instance != null) {
            instance.stop(0);
        }
        if (handler != null) {
            handler.stop();
        }
        isRunning = false;
    }
}