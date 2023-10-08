package ru.ifmo.hitcheck.utils;

import jakarta.json.JsonObject;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Utils {

    public static void sendJson(HttpServletResponse response, JsonObject object)
        throws IOException {
        response.setContentType("application/json");
        response.getWriter().append(object.toString());
    }

    public static List<Float> range(float min, float max, float step) {
        return Stream
            .iterate(min, v -> v + step)
            .takeWhile(v -> v <= max)
            .collect(Collectors.toList());
    }
}
