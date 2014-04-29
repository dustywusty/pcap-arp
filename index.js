var arp = require('./lib/arp.js')
  , buffer = require('buffer')
  , ArpBuffer = require('./lib/buffer.js')
  , arpSession = arp.createSession('en0');

var arpBuffer = new ArpBuffer();
arpBuffer._setMacDestination('ff:ff:ff:ff:ff:ff');
arpBuffer._setMacSource('b8:f6:b1:1c:2e:07');
arpBuffer._setSourceHardwareAddress('b8:f6:b1:1c:2e:07');
arpBuffer._setSourcePhysicalAddress('10.0.1.7');
arpBuffer._setOperationRequest();
arpBuffer._setTargetPhysicalAddress('10.0.1.1');

arpSession.on('reply', function(reply) {
  console.log(reply.link.arp.sender_pa + " is " + reply.link.arp.sender_ha);
});

arpSession.sendPacket(arpBuffer);
