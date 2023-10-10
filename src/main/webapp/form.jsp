<%@page import="ru.ifmo.hitcheck.utils.HitcheckInput" contentType="text/html;charset=UTF-8" language="java" %>
<%@taglib prefix="t" tagdir="/WEB-INF/tags" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<%
  String viewType = request.getParameter("view");
  if (viewType == null) {
    viewType = "form";
  }
  pageContext.setAttribute("viewType", viewType);
%>

<t:layout>
  <jsp:attribute name="headAddons">
    <link rel="stylesheet" href="static/styles/form.css" />
    <script src="static/scripts/form.js" type="module"></script>
  </jsp:attribute>
  <jsp:body>
    <div id="formtype-wrapper" data-formtype="${viewType}">
      <!-- view=form -->
      <form id="form" method="POST" action="/">
        <fieldset id="x-fieldset">
          <legend><strong>X</strong></legend>
          <c:forEach var="value" items="${HitcheckInput.valuesX}">
            <label for="x-radio-${value}">
              <input type="radio" id="x-radio-${value}" name="x" value="${value}" />
              ${value}
            </label>
          </c:forEach>
          <small class="error" id="x-error"></small>
        </fieldset>
  
        <label for="y-input">
          <strong>Y</strong>
        </label>
        <input
          id="y-input"
          name="y"
          type="text"
          placeholder="Y"
          data-min-y="${HitcheckInput.minY}"
          data-max-y="${HitcheckInput.maxY}"
        />
        <small class="error" id="y-error"></small>
  
        <fieldset id="r-fieldset">
          <legend><strong>R</strong></legend>
          <c:forEach var="value" items="${HitcheckInput.valuesR}">
            <label for="r-radio-${value}">
              <input type="radio" id="r-radio-${value}" name="r" value="${value}" />
              ${value}
            </label>
          </c:forEach>
          <small class="error" id="r-error"></small>
        </fieldset>
  
        <input type="submit" value="Submit" />
      </form>

      <!-- view=canvas -->
      <div id="canvas-wrapper" class="grid">
        <canvas id="hitcheck-canvas" height="500" width="500"></canvas>

        <form id="canvas-form">
          <label for="canvas-x-input">
            <strong>X</strong>
          </label>
          <input
            id="canvas-x-input"
            name="x"
            type="text"
            placeholder="X"
            readonly
            disabled
          />

          <label for="canvas-y-input">
            <strong>Y</strong>
          </label>
          <input
            id="canvas-y-input"
            name="y"
            type="text"
            placeholder="Y"
            readonly
            disabled
          />

          <fieldset id="canvas-r-fieldset">
            <legend><strong>R</strong></legend>
              <c:forEach var="value" items="${HitcheckInput.valuesR}">
                <label for="r-radio-${value}">
                  <input type="radio" id="r-radio-${value}" name="r" value="${value}" />
                  ${value}
                </label>
              </c:forEach>
            <small class="error" id="canvas-r-error"></small>
          </fieldset>

          <fieldset>
            <label for="canvas-hit-checkbox">
              <input id="canvas-hit-checkbox" type="checkbox" readonly disabled />
              Hit?
            </label>
          </fieldset>
        </form>
      </div>
    </div>
  </jsp:body>
</t:layout>