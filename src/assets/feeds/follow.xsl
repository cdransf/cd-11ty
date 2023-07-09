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
              <h1 class="font-black leading-tight md:pb-0 md:text-3xl pb-5 text-2xl">Follow • Cory Dransfeldt</h1>
              <a href="/">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                     stroke="currentColor"
                     class="inline w-6 h-6 outline-current text-gray-700 hover:text-purple-500 dark:text-gray-200 dark:hover:text-purple-400">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                </svg>
              </a>
            </div>
            <div class="pt-8 prose dark:prose-invert hover:prose-a:text-blue-500 max-w-full">
              <div class="dark:text-white text-gray-800">
                <h2
                  class="font-black leading-tight m-0 md:text-2xl text-xl tracking-normal mb-4 flex flex-row items-center text-gray-800 dark:text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                       stroke="currentColor" class="w-10 h-10 mr-1">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
                  </svg>
                  Feed preview • follow
                </h2>
                <p>My activity from around the web.</p>
                <p>
                  <xsl:value-of select="atom:feed/atom:description"/>
                </p>
              </div>
              <ul class="mb-8">
                <xsl:apply-templates select="atom:feed/atom:entry"/>
              </ul>
            </div>
            <footer class="prose pb-8 mt-4 text-gray-800 dark:text-white border-t border-gray-200 dark:border-gray-700 max-w-full">
              <div>
                <p class="mb-0">
                  <strong class="text-gray-800 dark:text-gray-200">This is a web feed,</strong>
                  also known as an RSS or Atom feed.
                </p>
                <p class="mt-0">
                  <strong class="text-gray-800 dark:text-gray-200">Subscribe</strong>
                  by copying the URL from the address bar into your newsreader.
                </p>
              </div>
              <small>Visit <a href="https://aboutfeeds.com">About Feeds</a> to get started with newsreaders and
                subscribing. It's free.
              </small>
            </footer>
          </main>
        </div>
      </body>
    </html>
  </xsl:template>
  <xsl:template match="atom:feed/atom:entry">
    <li>
      <a
        class="no-underline text-gray-800 hover:text-purple-400 dark:text-gray-200 dark:hover:text-purple-400 leading-tight m-0 cursor-pointer">
        <xsl:attribute name="href">
          <xsl:value-of select="atom:link/@href"/>
        </xsl:attribute>
        <xsl:value-of select="atom:title"/>
      </a>
      •
      <xsl:value-of select="atom:updated"/>
    </li>
  </xsl:template>
</xsl:stylesheet>