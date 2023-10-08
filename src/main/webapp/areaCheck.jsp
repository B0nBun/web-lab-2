<%@page import="ru.ifmo.hitcheck.utils.HitcheckResult,java.util.Collection" contentType="text/html;charset=UTF-8" language="java" %>
<%@taglib prefix="t" tagdir="/WEB-INF/tags" %>

<% Collection<HitcheckResult> results = (Collection<HitcheckResult>) request.getAttribute("results"); %>

<template id="template-rows">
  <% for (HitcheckResult result : results) { %>
    <tr>
      <td><%= result.x() %></td>
      <td><%= result.y() %></td>
      <td><%= result.r() %></td>
      <td><%= result.hit() %></td>
      <td class="result-timestamp"><%= result.timestamp().getEpochSecond() %></td>
    </tr>
  <% } %>
</template>

<t:layout>
  <jsp:attribute name="headAddons">
    <script src="static/scripts/area-check.js" type="module"></script>
  </jsp:attribute>
  <jsp:body>
    <div class="grid">
      <table role="grid">
        <thead>
          <tr>
            <th>X</th>
            <th>Y</th>
            <th>R</th>
            <th>Hit</th>
            <th>Timestamp</th>
          </tr>
          <tbody>
            <tr data-use-template="template-rows"></tr>
          </tbody>
        </thead>
      </table>
    </div>
  </jsp:body>
</t:layout>