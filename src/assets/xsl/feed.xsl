<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:feedpress="https://feed.press/xmlns" version="1.0">
  <xsl:template match="/">
    <html>
      <xsl:copy-of select="$html_TemplateHeader"/>
      <xsl:apply-templates select="rss/channel"/>
    </html>
  </xsl:template>
  <xsl:template match="channel">
    <body class="main-wrapper">
      <header class="main-title">
        <h1><xsl:value-of select="title"/></h1>
        <a href="{$feedUrl}" class="link-icon">
          <svg class="rss-icon" stroke="var(--brand-rss)"></svg>
        </a>
      </header>
      <main>
        <section class="posts-wrapper">
          <xsl:apply-templates select="item"/>
        </section>
      </main>
      <footer>
        <xsl:copy-of select="$html_FeedFooterScripts"/>
      </footer>
    </body>
  </xsl:template>
  <xsl:template match="item">
    <article class="home-status article">
      <header>
        <h2>
          <a href="{link}">
            <xsl:value-of select="title"/>
          </a>
        </h2>
      </header>
      <p><xsl:value-of select="description"/></p>
      <footer>
        <div class="time-wrapper">
          <time datetime="{pubDate}">
            <xsl:value-of select="pubDate"/>
          </time>
          <span rel="author">
            <xsl:value-of select="author"/>
          </span>
        </div>
      </footer>
    </article>
  </xsl:template>
</xsl:stylesheet>