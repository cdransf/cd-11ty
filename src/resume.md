---
layout: default
title: Resumé
meta:
  site:
    name: 'Cory Dransfeldt'
    description: "I'm a software developer in Camarillo, California. I enjoy hanging out with my beautiful family and 4 rescue dogs, technology, automation, music, writing, reading and tv and movies."
    url: https://coryd.dev
    logo:
      src: https://coryd.dev/assets/img/logo.webp
      width: 2000
      height: 2000
  language: en-US
  title: 'Cory Dransfeldt • Resumé'
  description: 'Software engineer with a wide range of experience covering frontend and mobile application development.'
  url: https://coryd.dev/resume
  image:
    src: https://coryd.dev/assets/img/avatar.webp
---
Software engineer with a wide range of experience covering frontend and mobile application development.

<div class="flex gap-3 not-prose">
  {% for link in nav.resume %}
    {% render "partials/linked-icon.liquid", name: link.name, link: link.url, icon: link.icon %}
  {% endfor %}
</div>

### Experience

**Senior Software Engineer, [HashiCorp](https://www.hashicorp.com)**<br/>
_June 2022 - present_

- Developed and led the implementation of log streaming UI for cloud insights, enhancing data visualization and analysis capabilities.
- Successfully migrated Ember apps to modern Typescript syntax, ensuring better maintainability and scalability of the codebase.
- Drive continuous improvement by optimizing existing code, actively participating in code reviews, and providing valuable feedback for team members' growth.

**Senior Software Engineer, [Eventbrite](https://www.eventbrite.com)**<br/>
_June 2021 - June 2022_

- Developed and launched React micro-applications for the search and discover team.
- Successfully migrated the largest application to Typescript, refactoring 450 files and ~15,000 lines of code within a 3-month timeframe. Also completed migrations for multiple smaller applications.
- Improved performance of existing applications by removing and replacing legacy code.

**Senior Software Engineer, [Patagonia](https://patagonia.com)**<br/>
_Jun 2019 - Jun 2021_

- Contributed to the maintenance of a legacy Salesforce Commerce Cloud application, ensuring its continued functionality and usability.
- Successfully rewrote and implemented core analytics and reporting data layer for SFRA implementation across all stores and regions, enabling better insights and decision-making.

**Frontend Web Developer, [Harbor Freight Tools](https://harborfreight.com)**<br/>
_Sep 2018 - Jun 2019_

- Developed and maintained custom e-commerce PWA using React, enhancing user experience and driving revenue growth
- Provided ongoing support for legacy Magento application, ensuring seamless operation and customer satisfaction

**Web developer; lead mobile developer, [Guitar Center](https://guitarcenter.com)**<br/>
_Nov 2015 - Sep 2018_

- Led the successful development and launch of the Musician's Friend mobile application.
- Developed, implemented, and maintained a customer lessons scheduling web application.
- Collaborated with cross-functional teams to achieve project goals across front end, back end, services, and QA.

**Quality Assurance Developer, Technicolor**<br/>
_Jun 2015 - Nov 2015_

- Developed and implemented an automated testing suite using Protractor, Jasmine, and Selenium to improve overall testing efficiency
- Effectively tracked and managed manual testing efforts for various functionality, ensuring thorough coverage

**Frontend Web Developer, [Pressed Juicery](https://pressed.com)**<br/>
_Dec 2014 - May 2015_

- Led the responsive/mobile redesign of company's website and custom ecommerce platform, resulting in improved user experience and increased online sales.
- Developed clean and reusable styling for the company's website, enhancing its visual appeal and brand consistency.

### Education

**[California State University Channel Islands](https://csuci.edu)**<br/>
_2008-2010_

- BS Business, minor economics
- Graduated Magna Cum Laude
