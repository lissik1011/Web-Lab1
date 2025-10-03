package ru.ifmo.se.web.fastcgi;

import java.util.logging.Logger;

public class ServerLogger {
    private static Logger instance;

    public static Logger getInstance() {
        if (instance == null) instance = Logger.getLogger(ServerLogger.class.getName());
        return instance;
    }
}