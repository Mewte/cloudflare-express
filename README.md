CloudFlare Express
=========

Express middleware for restoring visitors IP after being proxied through cloudflare.

I couldn't find a simple cloudflare module so I made one instead.

## Usage

```sh
$ npm install cloudflare-express --save
```

```javascript
var cloudflare = require('cloudflare-express');
```
Assuming: 
```javascript
var express = require('express');
var app = express();
```
Then you just need to use this as a middleware, (preferably before any other middleware is used.)
```javascript
  app.use(cloudflare.restore());
```

You can access the users original ip address by using the default ip property. The CloudFlare IP and CloudFlare scheme protocol used are set to the cf_ip and cf_protocol properties.

```javascript
router.get('/test', function(req,res,next){
  res.send("Origin IP: " + req.ip);
  res.send("Origin Protocol: " + req.protocol);
  res.send("CloudFlare IP: " + req.cf_ip);
  res.send("CloudFlare Protocol: " + req.cf_protocol);
});
```

## Error Handling
`cloudflare-express` fetches the latest IP address ranges from CloudFlare using the [IPV4](https://www.cloudflare.com/ips-v4) and [IPV6](https://www.cloudflare.com/ips-v4) endpoints. These requests are performed ONCE when your application starts. If these requests have not finished, options.error(req, res, next) is called if the `error` option is present. Otherwise, an HTTP 503 Service Unavailable with a "Retry-After: 1" header and the following JSON response is sent:
```javascript
{
    error: {
        status: 503,
        title: "Waiting for CloudFlare",
        detail: "A request for the up-to-date CloudFlare IP address ranges is still processing. Please try this requestion again."
    }
}
```

If the request for CloudFlare's IPs fails entirely, the application will `throw "Unable to access CloudFlare!"`. This will happen in cases when your server is unable to connect to the internet or rare instances where CloudFlare returns an error. Some better error handling should be done here such as retrying requests but I don't have time.

## Notes 
* If you're running behind an additional reverse proxy such an nginx, you may need to pass the trust proxy option to the express app. You can see more on how to do this at: http://expressjs.com/api.html#app-settings. This must be done BEFORE the `cloudflare-express` middleware!!

## Dependencies
* range_check@0.0.4 https://github.com/keverw/range_check


