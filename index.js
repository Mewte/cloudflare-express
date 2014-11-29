var range_check = require('range_check');
var ipRanges = require('./cloudflare_ip.json');
function cloudflareExpress(){
	this.restore = function(options){
		return function(req,res,next){
			var remoteIP = {
				ip: req.ip, //app.set trust proxy could potentially modify this and cause issues
				v: "ip"+range_check.ver(req.ip)
			};
			req.cf_ip = remoteIP.ip;//override this if cloudflare present
			if (req.headers['cf-connecting-ip'] == undefined){
				return next(); //no cloudflare IP, continue on like this never happened. Shhhh!
			}
			if (range_check.in_range(remoteIP.ip, ipRanges[remoteIP.v])){
				req.cf_ip = req.headers['cf-connecting-ip'];
			}
			next();
		};
	};
}
module.exports = new cloudflareExpress();