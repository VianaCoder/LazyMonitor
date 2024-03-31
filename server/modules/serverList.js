class ServerMonitoringList {

    constructor() {
        this.servers = []
        console.log(this.servers)
    }

    static instance = null;

    static getInstance() {
        if (!ServerMonitoringList.instance) {
            ServerMonitoringList.instance = new ServerMonitoringList();
        }
        return ServerMonitoringList.instance;
    }

    removeServer(serverId) {
        const initialLength = this.servers.length;
        if (this.servers.length < 1) {
            return false
        }
        this.servers = this.servers.filter(server => server.id !== serverId);
        return this.servers.length !== initialLength;
    }

    getAllServers() {
        return this.servers !== undefined ? this.servers : false;
    }

    getServer(serverId) {
        if (this.servers.length < 1) {
            return false
        }
        const server = this.servers.find(server => server.id === serverId);
        return server !== undefined ? server : false;
    }

    async updateServer(serverId, newData) {
        const index = this.servers.findIndex(server => server.id === serverId);
        if (index !== -1) {
            this.servers[index] = { ...this.servers[index], ...newData };
            return true; 
        }
        else {
            this.servers.push(newData);
        }
        return false; 
    }
}

module.exports = ServerMonitoringList;