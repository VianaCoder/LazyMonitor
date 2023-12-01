const axios = require('axios');

async function httpTestServers (server) {

    return new Promise ((resolve, reject) => {

        const url = `https://${server.hostname}${server.monitoringURI}`
        const headers = {'User-Agent': 'LazyMonitor:1.0.0'}

        console.log(`Testing - ${server.name}`)

        axios.get(url, {headers})
            .then(function(response) {
                resolve("Success")
            })
            .catch(function(error) {
                if (error.response) {
                    if ( error.response.status === 403 | error.response.status === 429 ) {
                        resolve("Blocked")
                    }
                    else {
                        resolve("Problem")
                    }
                }
                else if (error.request) {
                    resolve("Problem")
                }
            })
        })

}

module.exports = httpTestServers;
