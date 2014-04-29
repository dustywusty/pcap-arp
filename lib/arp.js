var events = require('events')
  , pcap  = require('pcap')
  , util  = require('util');

// ..

function Arp () {
  this.pcap_filter = 'arp';
  this.pcap_session = undefined;

  events.EventEmitter.call(this);
}
util.inherits(Arp, events.EventEmitter);

/**
 * Init helper sets up our pcap session and registers pcap session event handlers
 * @param interface network interface to listen on
 */

Arp.prototype.init = function(interface) {
  var self = this;
  // ..
  this.pcap_session = pcap.createSession(interface, this.pcap_filter);
  // ..
  this.pcap_session.on('packet', function (raw_packet) {
    var packet = pcap.decode.packet(raw_packet)
      , operation = packet.link.arp.operation;
    switch (operation) {
      case 'reply':
        self._handlePcapReply(packet);
        break;
      case 'request':
        self._handlePcapRequest(packet);
        break;
      default:
        //negative, i am a meat popsicle
        break;
    }
  });
};

/**
 * Emit 'request' event to our listeners for ARP request broadcasts
 * @param packet decoded request packet
 * @private
 */

Arp.prototype._handlePcapRequest = function(packet) {
  this.emit('request', packet);
};

/**
 * Emit 'reply' event to our listeners for ARP replies to us
 * @param packet decoded reply packet
 * @private
 */

Arp.prototype._handlePcapReply = function(packet) {
  this.emit('reply', packet);
};

/**
 * Helper returns a virgin packet for ARP traffic
 * @returns {Buffer} packet
 * @private
 */

Arp.prototype._getNewArpBuffer = function() {
  return new Buffer([
  /**
   * L2 Ethernet Frame
   */
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, //MAC DESTINATION 0 - 5
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, //MAC SRC 6 - 11
    0x08, 0x06, //EtherType 12 - 13
  /**
   * ARP Payload
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

/**
 *
 * @param buffer
 * @param destination
 * @returns {Buffer}
 * @private
 */

Arp.prototype._setMacDestination = function(buffer, destination) {
  return buffer;
};

/**
 *
 * @param buffer
 * @param source
 * @returns {Buffer}
 * @private
 */

Arp.prototype._setMacSource = function(buffer, source) {
  return buffer;
};

exports.Arp = Arp;