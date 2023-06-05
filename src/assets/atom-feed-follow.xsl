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
        <title><xsl:value-of select="atom:feed/atom:title"/></title>
        <link href="/assets/styles/tailwind.css" rel="stylesheet" />
        <link href="/assets/styles/index.css" rel="stylesheet" />
        <link href="/assets/img/favicon/favicon-16x16.png" rel="icon" type="image/x-icon" />
        <link href="/assets/img/favicon/favicon-32x32.png" rel="icon" type="image/png" sizes="32x32" />
        <link href="/assets/img/favicon/apple-touch-icon.png" rel="apple-touch-icon" />
        <script src="/_vercel/insights/script.js">''</script>
        <script src="/assets/scripts/isDarkMode.js">''</script>
        <link rel="me" href="https://social.lol/@cory" />
      </head>
      <body class="dark:text-white dark:bg-gray-900 font-sans text-gray-800">
        <div class="min-h-screen flex flex-col">
          <main class="flex-1 w-10/12 max-w-screen-sm md:max-w-screen-md mx-auto">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between md:pt-10 pt-5">
              <a class="text-gray-800 dark:text-gray-200 dark:hover:text-purple-400 hover:text-purple-500" href="/">
                <h1 class="font-black leading-tight md:pb-0 md:text-3xl pb-5 text-2xl">Follow • Cory Dransfeldt</h1>
              </a>
              <a href="/">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="inline w-6 h-6 fill-current text-gray-700 hover:text-purple-500 dark:text-gray-200 dark:hover:text-purple-400">
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                </svg>
              </a>
            </div>
            <div class="pt-12 prose dark:prose-invert hover:prose-a:text-blue-500 max-w-full">
              <div class="dark:text-white text-gray-800">
                <h2 class="font-black leading-tight m-0 md:text-2xl text-xl tracking-normal mb-4 flex flex-row items-center text-gray-800 dark:text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 mr-1">
                    <path fill-rule="evenodd" d="M3.75 4.5a.75.75 0 01.75-.75h.75c8.284 0 15 6.716 15 15v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75C18 11.708 12.292 6 5.25 6H4.5a.75.75 0 01-.75-.75V4.5zm0 6.75a.75.75 0 01.75-.75h.75a8.25 8.25 0 018.25 8.25v.75a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75v-.75a6 6 0 00-6-6H4.5a.75.75 0 01-.75-.75v-.75zm0 7.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clip-rule="evenodd" />
                  </svg>
                  Feed preview • follow
                </h2>
                <p>My activity from around the web.</p>
                <p><xsl:value-of select="atom:feed/atom:description"/></p>
              </div>
              <ul class="mb-8">
                <xsl:apply-templates select="atom:feed/atom:entry" />
              </ul>
            </div>
            <footer class="prose pb-8 mt-4 text-gray-800 dark:text-white border-t border-gray-200 dark:border-gray-700 ">
              <div>
                <p class="mb-0"><strong class="text-gray-800 dark:text-gray-200">This is a web feed,</strong> also known as an RSS or Atom feed.</p>
                <p class="mt-0"><strong class="text-gray-800 dark:text-gray-200">Subscribe</strong> by copying the URL from the address bar into your newsreader.</p>
              </div>
              <small>Visit <a href="https://aboutfeeds.com">About Feeds</a> to get started with newsreaders and subscribing. It's free.</small>
            </footer>
          </main>
        </div>
      </body>
    </html>
  </xsl:template>
  <xsl:template match="atom:feed/atom:entry">
    <li>
      <a class="no-underline text-gray-800 hover:text-purple-400 dark:text-gray-200 dark:hover:text-purple-400 leading-tight m-0 cursor-pointer">
        <xsl:attribute name="href">
          <xsl:value-of select="atom:link/@href"/>
        </xsl:attribute>
        <xsl:value-of select="atom:title"/>
      </a> • <xsl:value-of select="atom:updated" />
    </li>
  </xsl:template>
</xsl:stylesheet>