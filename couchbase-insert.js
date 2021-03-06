var couchbase = require('couchbase');
const uuidv1 = require('uuid/v1');

module.exports = function(RED) {
    function couchbaseInsert(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var bucket = config.bucket;

        this.server = RED.nodes.getNode(config.server)
        var host = this.server.host;
        var username = this.server.credentials.username;
        var password = this.server.credentials.password;

        var cluster = new couchbase.Cluster('couchbase://' + host + '/');
        cluster.authenticate(username, password);
        var activeBucket = cluster.openBucket(bucket, function(err) {
            if (err) {
                node.status({fill: 'red', shape: 'ring', text: 'disconnected'});
            } else {
                node.status({fill: 'green', shape: 'dot', text: 'connected'});
            }
        });

        activeBucket.setTimeout = 60000;
        this.activeBucket = activeBucket;

        node.on('input', function(msg) {
            var record_id = null;
            if (msg.record_id) {
                record_id = msg.record_id.toString();
            } else {
                record_id = uuidv1();
            }
            
            try {

            this.activeBucket.insert(record_id, msg.payload, function(err, result) {
                if (!err) {
                    node.send({
                        payload: result.cas,
                        original: msg.payload
                    });
                } else {
                   throw "error " + err;
                }
            });

            } catch (e) {
                this.error('error');
                this.error(e);
            }
        });
    }
    RED.nodes.registerType('insert', couchbaseInsert,{
        credentials: {
            username: {type: "text"},
            password: {type: "password"}
        }
    });
}
