<%@tag description="Page layout template" pageEncoding="UTF-8"%>
<%@attribute name="headAddons" fragment="true" %>
<!DOCTYPE html>
<html data-theme="dark" lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" type="text/css" href="/static/styles/pico.css" />
  <title>Hit Check</title>
  <jsp:invoke fragment="headAddons" />
  <style>
    #header-container {
      font-size: 0.8rem;
      padding-bottom: 0px;
      padding-top: 2em;
    }

    #main-container {
      padding-top: 2em;
    }
  </style>
</head>

<body>
  <header id="header-container" class="container">
    <hgroup>
      <h1>Ratmir Gusyakov</h1>
      <h2>P3230, Variant 52186</h2>
    </hgroup>
    <nav>
      <ul>
        <li>
          <a href="/?view=form">Form</a>
        </li>
        <li>
          <a href="/?view=canvas">Area selection</a>
        </li>
        <li>
          <a href="/?results">Previous Results</a>
        </li>
      </ul>
    </nav>
  </header>
  <main id="main-container" class="container">
    <jsp:doBody />
  </main>
</body>

</html>