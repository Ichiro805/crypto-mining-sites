package com.zaki.bot.ui;

import com.zaki.bot.server.ZecServer;
import com.zaki.bot.server.util.Utils;

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
