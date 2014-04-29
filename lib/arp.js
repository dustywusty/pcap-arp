var _       = require('underscore')
  , events  = require('events')
  , pcap    = require('pcap')
  , util    = require('util');

// ..

function Arp () {
  this._pcap_filter = 'arp';
  this._pcap_session = undefined;

  events.EventEmitter.call(this);
}
util.inherits(Arp, events.EventEmitter);

/**
 * Init helper sets up our pcap session and registers pcap session event handlers
 * @param device network interface to listen on
 */

Arp.prototype.init = function(device) {
  var self = this;
  // pcap session
  this._pcap_session = pcap.createSession(device, this._pcap_filter);
  // event handlers
  this._pcap_session.on('packet', function (raw_packet) {
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
 *
 * @type {Arp}
 */

exports.Arp = Arp;

/**
 *
 * @param device
 * @returns {Arp}
 */

exports.createSession = function(device) {
  var arpSession = new Arp();
  arpSession.init(device);
  return arpSession;
};
