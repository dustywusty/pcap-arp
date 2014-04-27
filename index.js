var raw = require('raw-socket');

// - http://www.scs.stanford.edu/histar/src/uinc/linux/if_ether.h

var options = {
  protocol: 2054
};

var socket = raw.createSocket (options);
socket.setOption (raw.SocketLevel.IPPROTO_IP, raw.SocketOption.IP_HDRINCL,
  new Buffer ([0x00, 0x00, 0x00, 0x01]), 4);

var buffer = new Buffer([
  0x00, 0x01, //HTYPE
  0x08, 0x00, //PTYPE
  0x06, 0x04, //HLEN - PLEN
  0x00, 0x01, //OPER

  0xb8, 0xf6, //SENDER MAC first 2 bytes
  0xb1, 0x1c, //NEXT 2 bytes
  0x2e, 0x07, //LAST 2 bytes

  0x0a, 0x00, //SENDER IP first 2 bytes
  0x01, 0x07, //LAST 2 bytes

  0x00, 0x00, //TARGET MAC (ignored for request) first 2 bytes
  0x00, 0x00, //NEXT 2 bytes
  0x00, 0x00, //LAST 2 bytes

  0x0a, 0x00, //TARGET IP first 2 bytes
  0x01, 0x7c  //LAST 2 bytes
]);

socket.on ("close", function () {
  console.log ("socket closed");
  process.exit (-1);
});

socket.on ("error", function (error) {
  console.log ("error: " + error.toString ());
  process.exit (-1);
});

socket.on ("message", function (buffer, source) {
  console.log ("received " + buffer.length + " bytes from " + source);
  console.log ("data: " + buffer.toString ("hex"));
});

function foo () {
  target = "255.255.255.255";
  socket.send (buffer, 0, buffer.length, target, function (error, bytes) {
    if (error) {
      console.log (error.toString ());
    } else {
      console.log ("sent " + bytes + " bytes to " + target);
    }
  });

  setTimeout (foo, 1000);
}

foo();
