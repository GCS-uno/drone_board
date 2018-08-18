const DRONE_MAVLINK_KEY = process.env.DRONE_MAVLINK_KEY;

if( !DRONE_MAVLINK_KEY ){
    console.log('DRONE_MAVLINK_KEY is not defined');
    process.exit();
}

console.log('MAVLink key: ' + DRONE_MAVLINK_KEY);

const config = require('./config');

const dgram = require('dgram');
const udp_server = dgram.createSocket('udp4');

const io = require('socket.io-client');
const mav_socket = io.connect(config.MAVLINK_SERVER + '?key=' + DRONE_MAVLINK_KEY);

let io_connected = false;
let udp_out_msgs = [];
let mav_messages = 0;

mav_socket.on('connect', () => {
    console.log("Successfully connected to MAVLink server");
    io_connected = true;
});

mav_socket.on('disconnect', () => {
    console.log("Disconnected from MAVLink server");
    io_connected = false;
});

mav_socket.on('error', () => {
    console.log('ERROR in MAVLink server connection 1');
    io_connected = false;
});

mav_socket.on('connect_error', () => {
    console.log('ERROR in MAVLink server connection 2');
    io_connected = false;
});

mav_socket.on('mav', (data) => {
    console.log('mav from server');
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
    console.log(mav_messages + ' messages received for last 10 seconds');
    mav_messages = 0;
}, 10000);


process.on('SIGINT', exit);
function exit() {
    process.exit();
}
