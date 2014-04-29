var _       = require('underscore')
  , buffer  = require('buffer')
  , util    = require('util');

// Extend buffer and add some helpers to fill out our requests

function ArpBuffer () {
  buffer.Buffer.call(this,
    [
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
    ]
  );
}
util.inherits(ArpBuffer, buffer.Buffer);

/**
 * l2 request destination MAC address
 * @param destination
 * @private
 */

ArpBuffer.prototype._setMacDestination = function(destination) {
  var self = this;
  _.each(destination.split(':'), function(tuple, index) {
    self.write(tuple, index, index+1, 'hex');
  });
};

/**
 * l2 request source MAC address
 * @param source
 * @private
 */

ArpBuffer.prototype._setMacSource = function(source) {
  var offset = 6
    , self = this;
  _.each(source.split(':'), function(tuple, index) {
    self.write(tuple, offset + index, offset + index, 'hex');
  });
};

/**
 * set ARP operation for request 0x00 0x01
 * @private
 */

ArpBuffer.prototype._setOperationRequest = function() {
  var offset = 21;
  this.writeInt8(1, offset, offset);
};

/**
 * set ARP operation for reply 0x00 0x02
 * @private
 */

ArpBuffer.prototype._setOperationReply = function() {
  var offset = 21;
  this.writeInt8(2, offset, offset);
};

/**
 *
 * @param sha source hardware address
 * @private
 */

ArpBuffer.prototype._setSourceHardwareAddress = function(sha) {
  var offset = 22
    , self = this;
  _.each(sha.split(':'), function(tuple, index) {
    self.write(tuple, offset + index, offset + index, 'hex');
  });
};

/**
 *
 * @param spa source physical address
 * @private
 */

ArpBuffer.prototype._setSourcePhysicalAddress = function(spa) {
  var offset = 28
    , self = this;
  _.each(spa.split('.'), function(tuple, index) {
    self.writeInt8(tuple, offset + index, offset + index);
  });
};

/**
 *
 * @param tha target hardware address
 * @private
 */

ArpBuffer.prototype._setTargetHardwareAddress = function(tha) {
  var offset = 32
    , self = this;
  _.each(tha.split(':'), function(tuple, index) {
    self.write(tuple, offset + index, offset + index, 'hex');
  });
};

/**
 *
 * @param tpa target physical address
 * @private
 */

ArpBuffer.prototype._setTargetPhysicalAddress = function(tpa) {
  var offset = 38
    , self = this;
  _.each(tpa.split('.'), function(tuple, index) {
    self.writeInt8(tuple, offset + index, offset + index);
  });
};

module.exports = ArpBuffer;