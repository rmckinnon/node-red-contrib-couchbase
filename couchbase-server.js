module.exports = function(RED) {
    function server(config) {
        RED.nodes.createNode(this, config);

        this.host = config.host;
        this.username = this.credentials.username;
        this.password = this.credentials.password;
    }
    RED.nodes.registerType('server', server,{
        credentials: {
            username: {type: "text"},
            password: {type: "password"}
        }
    });
}
