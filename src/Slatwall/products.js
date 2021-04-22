const http = require('http');

function get(app, data) {

    return new Promise((resolve, reject) => {

        var options = {
            "method": "GET",
            "hostname": app.hostname,
            "port": null,
            "path": "/api/product/",
            "headers": {
                "Access-key": app.AccessKey,
                "Access-key-secret": app.AccessKeySecret,
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
        req.end();
    })
}

module.exports = {
    get,
};