var session = require('..').Arp
  , arpSession = session.createSession('en0', 'b8:f6:b1:1c:2e:07');

arpSession.on('reply', function(reply) {
  console.log(reply.link.arp.sender_pa + ' is ' + reply.link.arp.sender_ha);
});

//arpSession.on('request', function(request) {
//  console.log('request for ' + request.link.arp.target_pa);
//});

for(var i = 0; i <= 255; i++) {
 // arpSession.whoHas('10.56.1.' + i);
}

console.log(arpSession._getProtocolAddress('en0'));

