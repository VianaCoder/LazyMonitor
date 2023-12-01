const normalizerServerData = (serverData) => {

    serverData.monitoringURI = serverData.monitoring_uri
    serverData.monitoringPing = serverData.monitoring_ping
    serverData.monitoringHTTP = serverData.monitoring_http
    serverData.healthStatusHTTP = serverData.healthstatus_http
    serverData.healthStatusPing = serverData.healthstatus_ping

    delete serverData.monitoring_uri
    delete serverData.monitoring_ping
    delete serverData.monitoring_http
    delete serverData.healthstatus_http
    delete serverData.healthstatus_ping

    return serverData

}

module.exports = { normalizerServerData };