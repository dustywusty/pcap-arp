var event = require('events')
  , pcap = require('pcap')
  , util = require('util');

function Arp () {
  this.pcap_filter = 'arp';
  this.pcap_session = undefined;
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