# Let's Encrypt Service for App Engine

[![Build Status](https://travis-ci.org/hollowverse/lets-encrypt.svg?branch=master)](https://travis-ci.org/hollowverse/lets-encrypt)

An App Engine [service](https://cloud.google.com/appengine/docs/standard/python/an-overview-of-app-engine) that fully automates SSL certificate management tasks for https://hollowverse.com, including:

* Domain-validation using the HTTP challenge
* Obtaining a certificate from Let's Encrypt
* Configuring App Engine to use the obtained certificate
* Updating the certificate before it expires
* Configuring App Engine to use the updated certificate

In order to validate the domain successfully, the Google Cloud Platform project must be configured to route traffic incoming to `/.well-known/acme-challenge/*` to this service. This is configured via [the `dispatch.yaml` file](https://github.com/hollowverse/hollowverse/blob/master/dispatch.yaml) in [hollowverse/hollowverse](https://github.com/hollowverse/hollowverse).

Further details on custom routing rules can be found in [App Engine docs](https://cloud.google.com/appengine/docs/flexible/python/how-requests-are-routed#routing_with_a_dispatch_file).