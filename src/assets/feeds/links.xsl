---
layout: null
---
{% include partials/header.xsl %}
<div class="pt-12 prose dark:prose-invert hover:prose-a:text-blue-500 max-w-full">
  <div class="dark:text-white text-gray-800">
    <h2
      class="font-black leading-tight m-0 md:text-2xl text-xl tracking-normal mb-4 flex flex-row items-center text-gray-800 dark:text-gray-200">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
           class="w-10 h-10 mr-1">
        <path fill-rule="evenodd"
              d="M3.75 4.5a.75.75 0 01.75-.75h.75c8.284 0 15 6.716 15 15v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75C18 11.708 12.292 6 5.25 6H4.5a.75.75 0 01-.75-.75V4.5zm0 6.75a.75.75 0 01.75-.75h.75a8.25 8.25 0 018.25 8.25v.75a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75v-.75a6 6 0 00-6-6H4.5a.75.75 0 01-.75-.75v-.75zm0 7.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
              clip-rule="evenodd"/>
      </svg>
      Feed preview • links
    </h2>
    <p>Recently read and favorited links
      <a href="https://www.pinboard.in/api/">sourced from my Instapaper likes.</a>
    </p>
    <p>
      <xsl:value-of select="atom:feed/atom:description"/>
    </p>
  </div>
  <ul class="mb-8">
    <xsl:apply-templates select="atom:feed/atom:entry"/>
  </ul>
</div>
{% include partials/footer.xsl %}