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
import java.math.BigDecimal;
import java.math.RoundingMode;

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

                BigDecimal r, x, y;
                try {
                    r = new BigDecimal(rStr.toString());
                    if (r.compareTo(new BigDecimal("2.0")) < 0 || r.compareTo(new BigDecimal("5.0")) > 0) {
                        System.out.println(errorResult("R must be in [2, 5]"));
                        continue;
                    }
                } catch (NumberFormatException e) {
                    System.out.println(errorResult("R must be a double"));
                    continue;
                }
                try {
                    x = new BigDecimal(xStr.toString());
                    if (x.compareTo(new BigDecimal("-2.0")) < 0 || x.compareTo(new BigDecimal("2.0")) > 0) {
                        System.out.println(errorResult("X must be in [-2, 2]"));
                        continue;
                    }
                } catch (NumberFormatException e) {
                    System.out.println(errorResult("X must be a double"));
                    continue;
                }
                try {
                    y = new BigDecimal(yStr.toString());
                    if (y.compareTo(new BigDecimal("-5.0")) < 0 || y.compareTo(new BigDecimal("5.0")) > 0) {
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

    private static void result(BigDecimal r, BigDecimal x, BigDecimal y, boolean result, long nano) {
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
        logger.info(("Success request! R = %s, X = %s, Y = %s. Result: %s").formatted(r, x, y, result ? "Попадание" : "Промах"));
        System.out.println(echoPage(content));
    }

    private static boolean status(BigDecimal r, BigDecimal x, BigDecimal y) {
        BigDecimal zero = BigDecimal.ZERO;
        BigDecimal half = new BigDecimal("0.5");
        BigDecimal two = new BigDecimal("2");
        BigDecimal four = new BigDecimal("4");

        if (x.compareTo(r.divide(two, RoundingMode.HALF_UP)) > 0 ||
                x.compareTo(r.negate()) < 0 ||
                y.compareTo(r.negate()) < 0 ||
                y.compareTo(r.divide(two, RoundingMode.HALF_UP)) > 0) {
            return false;
        }

        BigDecimal xSquared = x.multiply(x);
        BigDecimal ySquared = y.multiply(y);
        BigDecimal sumSquares = xSquared.add(ySquared);
        BigDecimal rSquared = r.multiply(r);
        BigDecimal quarterCircle = rSquared.divide(four, RoundingMode.HALF_UP);

        if (x.compareTo(zero) > 0 && y.compareTo(zero) > 0 &&
                sumSquares.compareTo(quarterCircle) > 0) {
            return false; // 1 четверть — вне круга
        }

        if (x.compareTo(zero) < 0 && y.compareTo(zero) < 0) {
            BigDecimal halfX = x.multiply(half);
            BigDecimal lineValue = halfX.negate().subtract(r);
            if (y.compareTo(lineValue) < 0) {
                return false; // точка ниже линии — вне области
            }
        }

        if (x.compareTo(zero) > 0 && y.compareTo(zero) < 0) {
            return false; // 4 четверть — всегда вне области
        }
        return true;
    }

    private static String echoPage(String echo) {
        String content = """
                %s
                """.formatted(echo);
        return """
                HTTP/1.1 200 OK
                Content-Type: text/html
                Access-Control-Allow-Origin: *
                Content-Length: %d


                %s
                """.formatted(content.getBytes(StandardCharsets.UTF_8).length, content);
    }

    private static String errorResult(String error) {
        String content = """
                <h1>Error</h1>
                <p>%s</p>
                """.formatted(error);
        logger.info("Error: \n%s\n".formatted(error));
        return """
                HTTP/1.1 400 Bad Request
                Content-Type: text/html
                Access-Control-Allow-Origin: *
                Content-Length: %d

                %s
                """.formatted(content.getBytes(StandardCharsets.UTF_8).length, content);
    }

    private static Properties formParser(String requestBodyStr) {
        var props = new Properties();
        try {
            Arrays.stream(requestBodyStr.split("&"))
                    .forEach(keyValue -> props.setProperty(keyValue.split("=")[0], keyValue.split("=")[1]));
            return props;
        } catch (Exception e) {
            return null;
        }
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