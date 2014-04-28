var pcap = require('pcap')
  , pcap_session = pcap.createSession('en0', 'arp');

var request = new Buffer([
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, //BROADCAST
  0xb8, 0xf6, 0xb1, 0x1c, 0x2e, 0x07, //SRC

  0x08, 0x06, //EtherType

  0x00, 0x01, //HTYPE
  0x08, 0x00, //PTYPE
  0x06, //HLEN
  0x04, //PLEN
  0x00, 0x01, //OPER

  0xb8, 0xf6, 0xb1, 0x1c, 0x2e, 0x07, //SHA
  0x0a, 0x00, 0x01, 0x07, //SPA

  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, //THA
  0x0a, 0x00, 0x01, 0x01  //TPA
]);

pcap_session.on('packet', function (raw_packet) {
  var packet = pcap.decode.packet(raw_packet);
  if (packet.link.arp.operation == 'request') { //opcode == 2
    return;
  }
  console.log(packet.link.arp.sender_pa + " is " + packet.link.arp.sender_ha);
});

for(var i = 0; i <= 255; i++) {
  request.fill(i, 41, request.length);
  pcap_session.inject(request);
}
