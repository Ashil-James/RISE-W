const dns = require('dns');

console.log('Testing DNS resolution for _mongodb._tcp.cluster0.tyrdwsw.mongodb.net');

dns.resolveSrv('_mongodb._tcp.cluster0.tyrdwsw.mongodb.net', (err, addresses) => {
    if (err) {
        console.error('DNS Resolution Error:', err);
    } else {
        console.log('SRV Records found:', addresses);
    }
});
