var couchbase = require('couchbase');

module.exports = function(RED) {
    function couchbaseN1ql(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var n1ql = config.n1ql;
        var bucket = config.bucket;

        this.server = RED.nodes.getNode(config.server)
        var host = this.server.host;
        var username = this.server.credentials.username;
        var password = this.server.credentials.password;

        var cluster = new couchbase.Cluster('couchbase://' + host + '/');
        cluster.authenticate(username, password);
        var activeBucket = cluster.openBucket(bucket, function(err) {
            if (err) {
                node.log(err);
                node.status({fill: 'red', shape: 'ring', text: 'disconnected'});
            } else {
                node.status({fill: 'green', shape: 'dot', text: 'connected'});
            }
        });

        this.activeBucket = activeBucket;
        node.on('input', function(msg) {

            var n1qlQuery = couchbase.N1qlQuery;

            activeBucket.query(
                n1qlQuery.fromString(n1ql),
                function (err, rows) {
                    if (!err) {
                        node.send({
                            payload: rows,
                            original: msg.payload
                        });
                    } else {
                        throw "error " + err;
                    }
                }
            );
        });
    }
    RED.nodes.registerType('n1ql', couchbaseN1ql,{
        credentials: {
            username: {type: "text"},
            password: {type: "password"}
        }
    });
}
