---
layout: null
---
  <footer class="prose pb-8 mt-4 text-gray-800 dark:text-white">
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
  <div class="pb-4 border-b border-gray-200 dark:border-gray-700 mb-8">
    <h3 class="mb-0">
      <a
        class="no-underline text-gray-800 hover:text-purple-400 dark:text-gray-200 dark:hover:text-purple-400 leading-tight m-0 cursor-pointer">
        <xsl:attribute name="href">
          <xsl:value-of select="atom:link/@href"/>
        </xsl:attribute>
        <xsl:value-of select="atom:title"/>
      </a>
    </h3>
    <div class="h-14 flex items-center text-sm">
      <span>
        <xsl:value-of select="atom:updated"/>
      </span>
      <span class="mx-1">•</span>
      <a>
        <xsl:attribute name="href">
          <xsl:value-of select="atom:link/@href"/>
        </xsl:attribute>
        Read more &#x2192;
      </a>
    </div>
  </div>
  </xsl:template>
</xsl:stylesheet>
