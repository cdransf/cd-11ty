---
layout: null
---
<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet
  version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="4.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>
          <xsl:value-of select="atom:feed/atom:title"/>
        </title>
        <link href="/assets/styles/tailwind.css" rel="stylesheet"/>
        <link href="/assets/styles/index.css" rel="stylesheet"/>
        <link href="/assets/img/favicon/favicon-16x16.png" rel="icon" type="image/x-icon"/>
        <link href="/assets/img/favicon/favicon-32x32.png" rel="icon" type="image/png" sizes="32x32"/>
        <link href="/assets/img/favicon/apple-touch-icon.png" rel="apple-touch-icon"/>
        <script src="/_vercel/insights/script.js">''</script>
        <script src="/assets/scripts/isDarkMode.js">''</script>
        <link rel="me" href="https://social.lol/@cory"/>
      </head>
      <body class="dark:text-white dark:bg-gray-900 font-sans text-gray-800">
        <div class="min-h-screen flex flex-col">
          <main class="flex-1 w-10/12 max-w-screen-sm md:max-w-screen-md mx-auto">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between md:pt-10 pt-5">
              <a class="text-gray-800 dark:text-gray-200 dark:hover:text-purple-400 hover:text-purple-500" href="/">
                <h1 class="font-black leading-tight md:pb-0 md:text-3xl pb-5 text-2xl">Cory Dransfeldt</h1>
              </a>
              <a href="/">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                     class="inline w-6 h-6 fill-current text-gray-700 hover:text-purple-500 dark:text-gray-200 dark:hover:text-purple-400">
                  <path
                    d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"/>
                  <path
                    d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z"/>
                </svg>
              </a>
            </div>