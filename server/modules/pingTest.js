const ping = require('ping');

async function pingTestServers (server) {

    return new Promise((resolve, reject) => {
        ping.sys.probe(server, (isAlive) => {
          if (isAlive) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
}

module.exports = pingTestServers;




