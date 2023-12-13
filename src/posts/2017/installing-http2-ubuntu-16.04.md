---
date: '2017-03-19'
title: 'Installing HTTP2 on Ubuntu 16.04 with virtual hosts'
description: "Now that HTTP/2 is fairly stable and widely available, I decided to try and install and run it on this server. I'm currently running the Ubuntu 16.04.2 LTS with virtual hosts configured, so I can serve a number of sites beyond this one. All the sites this server hosts are also served securely using certificates from LetsEncrypt."
draft: false
tags: ['Apache', 'development']
---

Now that HTTP/2 is fairly stable and widely available, I decided to try and install and run it on this server. I'm currently running the [Ubuntu 16.04.2](http://releases.ubuntu.com/16.04/) LTS with virtual hosts configured, so I can serve a number of sites beyond this one. All the sites this server hosts are also served securely using certificates from [LetsEncrypt](https://letsencrypt.org/).<!-- excerpt -->

To install HTTP/2 I SSH'd in to the server and ran the following commands:

```bash
# add the new apache repository to your server's sources

sudo add-apt-repository -y ppa:ondrej/apache2

# update apache

sudo apt-key update

sudo apt-get update

# WARNING: answering yes at the prompts following this command will overwrite your apache.conf file located in /etc/apache2

sudo apt-get --only-upgrade install apache2 -y

# enable http2

sudo a2enmod http2
```

Next, navigate to /etc/apache2/sites-available and edit a virtual file of your choice, adding the following line after the ServerName declaration:

`Protocols h2 h2c http/1.1`

Finally, restart apache:

`sudo service apache2 restart`

Your site should now be served using http2. You can verify this using the KeyCDN tool located [here](https://tools.keycdn.com/http2-test).

_Did I miss anything? [Let me know.](mailto:cory.dransfeldt@gmail.com)_
