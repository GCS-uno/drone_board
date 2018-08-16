const config = {

    // GCS.uno MAVLink server
    MAVLINK_SERVER: 'https://mavlink.gcs.uno:443'

    // Local UDP host and port to which MAVProxy streams messages from Ardupilot
    , MAVLINK_LOCAL_UDP_HOST: '127.0.0.1'
    , MAVLINK_LOCAL_UDP_PORT: 15001

};

module.exports = config;