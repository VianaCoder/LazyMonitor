const validateHostnameAddress = (hostname) => {
    const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    const hostnamePattern = /^[a-z0-9-]+(\.[a-z0-9-]+)*$/;
  
    if (ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname) || hostnamePattern.test(hostname)) {
      return true;
    } else {
      throw new Error('Hostname Invalited');
    }
  };

module.exports = { validateHostnameAddress };
