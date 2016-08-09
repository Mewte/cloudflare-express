var range_check = require('range_check');
var ipRanges = require('./cloudflare_ip.json');
var fs = require('fs');
function cloudflareExpress(){
	this.restore = function(options){
		if (!options){
			options = {};
		}
		if (options.update_on_start){
			getIPs(function(list){
				ipRanges = list;
				fs.writeFile('cloudflare_ip.json', JSON.stringify(list), function(err){});
			});
		}
		return function(req,res,next){
			var remoteIP = {
				ip: range_check.storeIP(req.ip), //app.set trust proxy could potentially modify this and cause issues
				v: "ip"+range_check.ver(range_check.storeIP(req.ip))
			};
			req.cf_ip = remoteIP.ip;//override this if cloudflare present
			if (req.headers['cf-connecting-ip'] == undefined){
				return next(); //no cloudflare IP, continue on like this never happened. Shhhh!
			}
			if (range_check.inRange(remoteIP.ip, ipRanges[remoteIP.v])){
				req.cf_ip = req.headers['cf-connecting-ip'];
			}
			next();
		};
	};
}
module.exports = new cloudflareExpress();

var request = require('request');
function getIPs(callback){
	var list = {};
	var cf_callback = function(version) {
		return function(err,resp,body) {
			if (!err && resp.statusCode == 200) {
				list[version] = body.slice(0, -1).split("\n");
				if (list["ip4"] && list["ip6"]){
					callback(list);
				}
			}
		}
	}
	var urls = {
		ip4:"https://www.cloudflare.com/ips-v4",
		ip6:"https://www.cloudflare.com/ips-v6"
	}
	request(urls.ip4, cf_callback("ip4"));
	request(urls.ip6, cf_callback("ip6"));
}
