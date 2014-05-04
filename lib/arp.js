var _           = require('underscore')
  , events      = require('events')
  , interfaces  = require('interfaces')
  , pcap        = require('pcap')
  , util        = require('util')
  // ..
  , buffer      = require('./buffer.js');

// .. http://en.wikipedia.org/wiki/Address_Resolution_Protocol

function Arp () {
  this._interface = undefined;
  this._interfaceDetails = undefined;
  this._pcap_filter = 'arp';
  this._pcap_session = undefined;

  events.EventEmitter.call(this);
}
util.inherits(Arp, events.EventEmitter);

/**
 * Init helper sets up our pcap session and registers pcap session event handlers
 * @param device network interface to listen on
 */

Arp.prototype.init = function(interface) {
  var self = this;
  // device
  this._interface = interface;
  this._interfaceDetails = this._getInterface();
  // pcap session
  this._pcap_session = pcap.createSession(interface, this._pcap_filter);
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
 * ARP request
 * @param address protocol address
 */

Arp.prototype.request = function(address) {
  var arpBuffer = buffer.createBuffer();
  arpBuffer.setMacDestination('ff:ff:ff:ff:ff:ff');
  arpBuffer.setMacSource(this._getHardwareAddress());
  arpBuffer.setSourceHardwareAddress(this._getHardwareAddress());
  arpBuffer.setSourceProtocolAddress('10.56.1.125');
  arpBuffer.setOperationRequest();
  arpBuffer.setTargetProtocolAddress(address);
  this.sendPacket(arpBuffer);
};

/**
 * ARP reply
 * @param targetProtoAddress target ip address
 * @param targetHardwareAddress target hardware address
 */

Arp.prototype.reply = function(targetProtoAddress,
                               targetHardwareAddress) {
  var arpBuffer = buffer.createBuffer();
  arpBuffer.setMacDestination(destination);
  arpBuffer.setMacSource(this._getHardwareAddress());
  // ..
  arpBuffer.setSourceHardwareAddress(this._getHardwareAddress());
  arpBuffer.setSourceProtocolAddress(this._getIPv4ProtocolAddress());
  arpBuffer.setOperationReply();
  arpBuffer.setTargetHardwareAddress(targetHardwareAddress);
  arpBuffer.setTargetProtocolAddress(targetProtoAddress);

  this.sendPacket(arpBuffer);
};

/**
 * Send our packet
 * @param packet raw packet to send
 */

Arp.prototype.sendPacket = function(packet) {
  /**
   * TODO: dusty, this is gross. wrap my buffer as a buffer so it types as a buffer. yo dawg.
   * @see src/node_buffer.cc:86 -- bool HasInstance(Handle<Object> obj)
   */
  this._pcap_session.inject(new Buffer(packet));
};

/**
 *
 * @returns {address|*}
 * @private
 */

Arp.prototype._getIPv4ProtocolAddress = function() {
  return this._interfaceDetails.address;

};

/**
 *
 * @returns {mac|*}
 * @private
 */

Arp.prototype._getHardwareAddress = function() {
  return this._interfaceDetails.mac;
};

/**
 *
 * @returns {*}
 * @private
 */

Arp.prototype._getInterface = function() {
  var interface = _.findWhere(interfaces()[this._interface], {
    family:'IPv4'
  });
  return interface;
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

exports.Arp = Arp;

exports.createSession = function(device, interface) {
  var arpSession = new Arp();
  arpSession.init(device, interface);
  return arpSession;
};