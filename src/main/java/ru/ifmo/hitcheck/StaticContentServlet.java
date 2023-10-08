package ru.ifmo.hitcheck;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;

@WebServlet(urlPatterns = "static/*", name = "staticContentServlet")
public class StaticContentServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        String staticPath = request.getRequestURI().replaceFirst("/static", "");
        String extension = extensionFromPath(staticPath);
        String mimeType = mimeTypeFromExtension(extension);
        response.setContentType(mimeType);
        InputStream stream = getClass().getClassLoader().getResourceAsStream(staticPath);
        if (stream == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        try {
            stream.transferTo(response.getOutputStream());
        } catch (IOException err) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
    }

    private static String extensionFromPath(String path) {
        String[] split = path.split("\\.");
        if (split.length == 0) {
            return "";
        }
        return split[split.length - 1];
    }

    private static String mimeTypeFromExtension(String fileExtension) {
        switch (fileExtension) {
            case "js":
                return "text/javascript";
            case "css":
                return "text/css";
        }
        return "";
    }
}
