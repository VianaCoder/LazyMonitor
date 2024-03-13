const ping = require('ping');

async function pingTestServers (hostname) {

    return new Promise((resolve, reject) => {
        ping.sys.probe(hostname, (isAlive) => {
          if (isAlive) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
}

module.exports = pingTestServers;




