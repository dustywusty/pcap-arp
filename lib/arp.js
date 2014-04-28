var event = require('events')
  , pcap  = require('pcap')
  , util  = require('util');

function Arp () {
  this.pcap_filter = 'arp';
  this.pcap_session = undefined;

  events.EventEmitter.call(this);
}
util.inherits(Arp, events.EventEmitter);

// ..

Arp.prototype.init = function(interface) {
  var self = this;

  this.pcap_session = pcap.createSession(interface, this.pcap_filter);

  pcap_session.on('packet', function (raw_packet) {
    var packet = pcap.decode.packet(raw_packet)
      , operation = packet.link.arp.operation;
    if (operation === 'request') { //opcode == 2
      self._handlePcapRequest(packet);
    } else if (operation === 'reply') { //opcode == 2
      self._handlePcapReply(packet);
    } else {
      //negative, i am a meat popsicle
    }
  });
};

// ..

Arp.prototype._handlePcapRequest = function(packet) {
  this.emit('request', packet);
};

Arp.prototype._handlePcapReply = function(packet) {
  this.emit('reply', packet);
};

// ..

Arp.prototype._getNewArpBuffer = function() {
  return new Buffer([
  /**
   * L2 Ethernet Frame
   */
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, //MAC DESTINATION 0 - 5
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, //MAC SRC 6 - 11
    0x08, 0x06, //EtherType 12 - 13
  /**
   * Arp Payload
   */
    0x00, 0x01, //Hardware type (HTYPE) 14 - 15
    0x08, 0x00, //Protocol type (PTYPE) 16 - 17

    0x06, //Hardware address length (HLEN) 18
    0x04, //Protocol address length (PLEN) 19

    0x00, 0x00, //Operation (OPER) 20 - 21

    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, //Sender hardware address (SHA)  22 - 27
    0x00, 0x00, 0x00, 0x00, //Sender protocol address (SPA) 28 - 31

    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, //Target hardware address (THA) 32 - 37
    0x00, 0x00, 0x00, 0x00  //Target protocol address (TPA) 38 - 41
  ]);
};

exports.Arp = Arp;