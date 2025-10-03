package ru.ifmo.se.web.fastcgi;

import java.util.Arrays;
import java.util.Properties;
import java.nio.ByteBuffer;

import com.fastcgi.FCGIInputStream;
import com.fastcgi.FCGIInterface;

import java.io.IOException;
import java.util.logging.Logger;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Server {
    private static Logger logger;

    public static void main(String[] args) throws IOException {
        logger = ServerLogger.getInstance();
        FCGIInterface fcgi = new FCGIInterface();
        logger.info("Server start...");
        while (fcgi.FCGIaccept() >= 0) {
            long start = System.nanoTime();
            String method = FCGIInterface.request.params.getProperty("REQUEST_METHOD");

            if (method == null) {
                logger.info("Method is null.");
                System.out.println(errorResult("Unsupported HTTP method: null"));
                continue;
            }

            if (method.equals("POST")) {
                logger.info("POST request processing.");
                String contentType = FCGIInterface.request.params.getProperty("CONTENT_TYPE");
                if (contentType == null) {
                    System.out.println(errorResult("Content-Type is null"));
                    continue;
                }

                if (!contentType.equals("application/x-www-form-urlencoded")) {
                    System.out.println(errorResult("Content-Type is not supported"));
                    continue;
                }

                Properties requestBody = formParser(readRequestBody());

                if (requestBody == null) {
                    System.out.println(errorResult("Bad request."));
                    continue;
                }

                var rStr = requestBody.get("R");
                var xStr = requestBody.get("X");
                var yStr = requestBody.get("Y");

                if (rStr == null || xStr == null || yStr == null) {
                    System.out.println(errorResult("R, X and Y must be provided as x-www-form-urlencoded params."));
                    continue;
                }

                double r, x, y;
                try {
                    r = Double.parseDouble(rStr.toString());
                    if (r < 2 || r > 5) {
                        System.out.println(errorResult("R must be in [2, 5]"));
                        continue;
                    }
                } catch (NumberFormatException e) {
                    System.out.println(errorResult("R must be a double"));
                    continue;
                }
                try {
                    x = Double.parseDouble(xStr.toString());
                    if (x < -2 || x > 2) {
                        System.out.println(errorResult("X must be in [-2, 2]"));
                        continue;
                    }
                } catch (NumberFormatException e) {
                    System.out.println(errorResult("X must be a double"));
                    continue;
                }
                try {
                    y = Double.parseDouble(yStr.toString());
                    if (y < -5 || y > 5) {
                        System.out.println(errorResult("R must be in [-5, 5]"));
                        continue;
                    }
                } catch (NumberFormatException e) {
                    System.out.println(errorResult("Y must be a double"));
                    continue;
                }

                result(r, x, y, status(r, x, y), (System.nanoTime() - start) / 1_000);
                continue;
            }

            System.out.println(errorResult("Unsupported HTTP method: " + method));

        }
    }

    private static void result(double r, double x, double y, boolean result, long nano) {
        String content = """
                <tr>
                    <td>%s</td>
                    <td>%s</td>
                    <td>%s</td>
                    <td>%s</td>
                    <td>%s</td>
                    <td>%sμs</td>
                </tr>
                """.formatted(r, x, y,
                result ? "Попадание" : "Промах",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss dd.MM.yyyy")),
                nano);
        System.out.println(echoPage(content));
    }

    private static boolean status(double r, double x, double y) {
        if (x > r / 2 || x < -r || y < -r || y > r / 2)
            return false;
        if (x > 0 && y > 0 && (x * x + y * y) > (r * r) / 4)
            return false; // 1 четверть
        if (x < 0 && y > 0 && x < -r && y > r / 2)
            return false; // 2 четверть
        if (x < 0 && y < 0 && y < (-0.5 * x - r))
            return false; // 3 четверть
        if (x > 0 && y < 0)
            return false; // 4 четверть
        return true;
    }

    private static String echoPage(String echo) {
        String content = """
                %s
                """.formatted(echo);
        return """
                HTTP/1.1 200 OK
                Content-Type: text/html
                Content-Length: %d


                %s
                """.formatted(content.getBytes(StandardCharsets.UTF_8).length, content);
    }

    private static String errorResult(String error) {
        String content = """
                <h1>Error</h1>
                <p>%s</p>
                """.formatted(error);
        return """
                HTTP/1.1 400 Bad Request
                Content-Type: text/html
                Content-Length: %d

                %s
                """.formatted(content.getBytes(StandardCharsets.UTF_8).length, content);
    }

    private static Properties formParser(String requestBodyStr) {
        var props = new Properties();
        Arrays.stream(requestBodyStr.split("&"))
                .forEach(keyValue -> props.setProperty(keyValue.split("=")[0], keyValue.split("=")[1]));
        return props;
    }

    private static String readRequestBody() throws IOException {
        FCGIInterface.request.inStream.fill();
        int contentLength = FCGIInterface.request.inStream.available();
        ByteBuffer buf = ByteBuffer.allocate(contentLength);
        var readBytes = FCGIInterface.request.inStream.read(buf.array(), 0, contentLength);

        byte[] requestBodyRaw = new byte[readBytes];
        buf.get(requestBodyRaw);
        buf.clear();

        return new String(requestBodyRaw, StandardCharsets.UTF_8);
    }

}