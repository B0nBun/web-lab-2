package ru.ifmo.hitcheck;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;
import ru.ifmo.hitcheck.exceptions.InvalidParamsException;
import ru.ifmo.hitcheck.utils.HitcheckInput;
import ru.ifmo.hitcheck.utils.HitcheckResult;
import ru.ifmo.hitcheck.utils.Utils;

@WebServlet(urlPatterns = "area-check", name = "areaCheckServlet")
public class AreaCheckServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        Collection<HitcheckResult> previousResults = getSessionResults(
            request.getSession()
        );
        request.setAttribute("results", previousResults);
        request.getRequestDispatcher("./areaCheck.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        try {
            Map<String, String[]> parameters = request.getParameterMap();
            ResponseType responseType = getResponseType(parameters);
            HitcheckInput input = HitcheckInput.fromParamsMap(parameters);
            HitcheckResult result = HitcheckResult.fromInput(input);
            Collection<HitcheckResult> results = getSessionResults(request.getSession());
            results.add(result);
            setSessionResults(request.getSession(), results);

            if (responseType == ResponseType.VIEW) {
                request.setAttribute("results", results);
                request
                    .getRequestDispatcher("./areaCheck.jsp")
                    .forward(request, response);
            } else {
                Utils.sendJson(response, result.toJson());
            }
        } catch (InvalidParamsException err) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            PrintWriter writer = response.getWriter();
            writer.append(err.getMessage());
        }
    }

    private static enum ResponseType {
        VIEW,
        API,
    }

    private static ResponseType getResponseType(Map<String, String[]> parameters) {
        String[] stringValue = parameters.get("response-type");
        if (
            stringValue != null && stringValue.length != 0 && stringValue[0].equals("api")
        ) {
            return ResponseType.API;
        }
        return ResponseType.VIEW;
    }

    private static final String RESULTS_SESSION_KEY = "HitcheckResults";

    private static Collection<HitcheckResult> getSessionResults(HttpSession session) {
            @SuppressWarnings("unchecked")
            var collection = (Collection<HitcheckResult>) session.getAttribute(
                RESULTS_SESSION_KEY
            );
            if (collection == null) return new ArrayList<>();
            return collection;
    }

    private static void setSessionResults(
        HttpSession session,
        Collection<HitcheckResult> results
    ) {
        session.setAttribute(RESULTS_SESSION_KEY, results);
    }
}
