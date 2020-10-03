package com.zaki.zecbot.ui;

import com.zaki.zecbot.server.ZecServer;
import com.zaki.zecbot.server.util.Utils;

public class ServerController {

    private ZecServer s;

    public ServerController() throws Exception {
        s = new ZecServer();
    }

    public void start() {
        try {
            s.start();
        } catch (Exception e) {
            Utils.noop();
        }
    }

    public void stop() {
        s.stop();
    }
}
