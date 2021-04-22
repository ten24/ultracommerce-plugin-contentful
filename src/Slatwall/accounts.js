var qs = require("querystring");
var http = require("http");

function create(app, userDetails) {
    return new Promise((resolve, reject) => {
        var options = {
            "method": "POST",
            "hostname": app.hostname,
            "port": null,
            "path": "/api/scope/createAccount",
            "headers": {
                "content-type": "application/x-www-form-urlencoded",
            }
        };

        var req = http.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                var body = Buffer.concat(chunks);
                resolve(body.toString())
            });
        });

        req.write(qs.stringify({
            emailAddress: userDetails.emailAddress,
            emailAddressConfirm: userDetails.emailAddress,
            password: userDetails.password,
            passwordConfirm: userDetails.password,
            firstName: userDetails.firstName,
            lastName: userDetails.lastName
        }));
        req.end();
    })
}

function login(app, data) {
    return new Promise((resolve, reject) => {
        var options = {
            "method": "POST",
            "hostname": app.hostname,
            "port": null,
            "path": "/api/auth/login",
            "headers": {
                "content-type": "application/x-www-form-urlencoded",
            }
        };
        var req = http.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                var body = Buffer.concat(chunks);
                resolve(body.toString())
            });
            res.on('error', function (error) {
                reject(error)
            })
        });

        req.write(qs.stringify({
            emailAddress: data.emailAddress,
            password: data.password
        }));
        req.end();
    })

}


module.exports = {
    create,
    login
};