var cf_exp = require("../index.js");
var assert = require('chai').assert;
var fs = require('fs');
describe('CloudflareExpress - update_on_start: FALSE', function() {
	describe("Constructor Tests",function(){
		it ("should return function when passed no options",function(){
			var app = cf_exp.restore();
			assert.isFunction(app);
		})
		it ("should return function when passed empty object as options",function(){
			var app = cf_exp.restore({});
			assert.isFunction(app);
		})
	})
});
describe('CloudflareExpress - update_on_start: TRUE', function(){
	it("Creating blank cloudflare_ip.JSON to test update_on_start",function(done){
		fs.writeFile('cloudflare_ip.json', JSON.stringify({ip4:[],ip6:[]}), done);
	});
	it("should return function when passed update_on_start:true as options",function(){
		var app = cf_exp.restore({update_on_start:true});
		assert.isFunction(app);
	});
	it("waiting 1500s to update IP file",function(done){
		setTimeout(function(){
			done();
		},1500)
	});
	it("cloudflare_ip.json arrays should now be populated",function(done){
		fs.readFile('cloudflare_ip.json', function(err, data){
			if (err) return done(err);
			try{
				var body = JSON.parse(data);
				assert.isArray(body.ip4);
				assert.isArray(body.ip6);
				assert.isAbove(body.ip4.length,0);
				assert.isAbove(body.ip6.length,0);
				done();
			}
			catch (e){
				return done(e);
			}
		});
	});
});

describe("Actual Middleware Tests",function(){
	var app = cf_exp.restore();
	describe('No cf-connecting-ip header', function(){
		it("cf_ip should be equal to Remote IP which is 255.255.255.255", function(){
			var req = {ip:"255.255.255.255"};
			req.headers = {};
			app(req,{},function(err){
				assert.equal(req.cf_ip,"255.255.255.255");
				assert.equal(req.ip,req.cf_ip);
			});
		});
	});
	describe('cf-connecting-ip header but remote IP not owned by Cloudflare', function(){
		it("cf_ip should be equal to Remote IP which is 255.255.255.255", function(){
			var req = {ip:"255.255.255.255"};
			req.headers = {'cf-connect-ip':"not.trusted.IP"};
			app(req,{},function(err){
				assert.equal(req.cf_ip,"255.255.255.255");
				assert.equal(req.ip,req.cf_ip);
			});
		});
	});
	describe('cf-connecting-ip header set, connecting ip4 owned by Cloudflare',function(){
		it("cf_ip should be equal to cf-connecting-ip header which is 255.255.255.255", function(){
			var req = {ip:"173.245.48.0"};
			req.headers = {'cf-connecting-ip':"255.255.255.255"};
			app(req,{},function(err){
				assert.notEqual(req.ip,req.cf_ip,"Make sure req.ip test IP is actually a cloudflare IP");
				assert.equal(req.cf_ip, "255.255.255.255");
			});
		});
	});
	describe('cf-connecting-ip header set, connecting ip4 (mapped as IPv6) owned by Cloudflare',function(){
		it("cf_ip should be equal to cf-connecting-ip header which is 255.255.255.255", function(){
			var req = {ip:"::ffff:173.245.48.0"};
			req.headers = {'cf-connecting-ip':"255.255.255.255"};
			app(req,{},function(err){
				assert.notEqual(req.ip,req.cf_ip,"Make sure req.ip test IP is actually a cloudflare IP");
				assert.equal(req.cf_ip, "255.255.255.255");
			});
		});
	});
	describe('cf-connecting-ip header set, connecting ip6 owned by Cloudflare',function(){
		it("cf_ip should be equal to cf-connecting-ip header which is 255.255.255.255", function(){
			var req = {ip:"2405:8100:0:0:0:0:0:0"};
			req.headers = {'cf-connecting-ip':"255.255.255.255"};
			app(req,{},function(err){
				assert.notEqual(req.ip,req.cf_ip,"Make sure req.ip test IP is actually a cloudflare IP");
				assert.equal(req.cf_ip, "255.255.255.255");
			});
		});
	});

});
