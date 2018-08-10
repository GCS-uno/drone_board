const config = require('./config');

const dgram = require('dgram');
const udp_server = dgram.createSocket('udp4');

const io = require('socket.io-client');
const mav_socket = io.connect(config.MAVLINK_SERVER + '?me=drone&drone_id=' + config.DRONE_ID);


let io_connected = false;
let udp_out_msgs = [];
let mav_messages = 0;

mav_socket.on('connect', () => {
    console.log("Connected to MAVLink server");
    io_connected = true;
});

mav_socket.on('disconnect', () => {
    console.log("Disconnected from MAVLink server");
    io_connected = false;
});

mav_socket.on('error', () => {
    console.log('MAVLink server error');
    io_connected = false;
});

mav_socket.on('connect_error', () => {
    console.log('MAVLink server connect error');
    io_connected = false;
});

mav_socket.on('mav', (data) => {
    udp_out_msgs.push(data);
});


udp_server.bind(config.MAVLINK_LOCAL_UDP_PORT, config.MAVLINK_LOCAL_UDP_HOST);

udp_server.on('listening', function () {
    const address = udp_server.address();
    console.log('UDP server on ' + address.address + ":" + address.port);
});

udp_server.on('close', function () {
    console.log('UDP closed');
});

udp_server.on('message', function (message, remote) {
    mav_messages++;

    let msg_to_board = udp_out_msgs.shift();
    if( msg_to_board ){
        udp_server.send(msg_to_board, 0, msg_to_board.length, remote.port, remote.address, function(err){
            if( err ) console.log('UDP send error ' + err);
        });
    }

    if( io_connected  ) mav_socket.emit('mav', message);

});

setInterval(function(){
    console.log('received msgs for last 10sec: ' + mav_messages);
    mav_messages = 0;
}, 10000);