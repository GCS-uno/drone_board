const config = {

    // GCS.uno MAVLink server
    MAVLINK_SERVER: 'http://192.168.1.100:8091'

    // UDP хост и порт куда приходят сообщения mavlink
    , MAVLINK_LOCAL_UDP_HOST: '127.0.0.1'
    , MAVLINK_LOCAL_UDP_PORT: 15001

};

module.exports = config;