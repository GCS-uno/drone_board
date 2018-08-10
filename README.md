
# GCS.uno drone_board

This scripts are used to connect board companion computers to web-based ground control station GCS.uno over 4G networks.


## Autopilot installation

Use original guides to set up your Navio autopilot board with Raspberry Pi computer

Hardware setup 
https://docs.emlid.com/navio2/ardupilot/hardware-setup/

Configuring Raspberry Pi 
https://docs.emlid.com/navio2/common/ardupilot/configuring-raspberry-pi/

Ardupilot installation and running 
https://docs.emlid.com/navio2/ardupilot/typical-setup-schemes/


## Connecting to GCS.uno

After you set up your drone and can connect with it using regular ground control software 
(such as QGroundControl or MissionPlanner), there are few steps left to control a drone remotely 
over 4G networks.


### How it works

Ardupilot is configured to stream its MAVLink telemetry messages to local (onboard) UDP port. 
A small script (written in JavaScript) listens to this UDP port and transmits messages to GCS.uno server. 
When you open GCS.uno in a web-browser, this telemetry is got from server and rendered to a screen almost in realtime. 
In opposite direction, you press an action button on a web-page, this magically tranforms to a MAVLink message 
and reaches onboard autopilot to be executed.

SSH to your board Raspberry and follow next steps.


### Configure Ardupilot

Depending on what frame you have configured using emlid-tool, the configuration file will be accordingly 
`arducopter`, `arduplane` or `ardurover`. Not **ardupilot**! Asuming you have *arducopter*, open config file:

    sudo nano /etc/default/arducopter 
    
Make sure these line are present or make copy-paste from here:

    TELEM1="-A udp:127.0.0.1:14550"
    ARDUPILOT_OPTS="$TELEM1"

Save it with `Ctrl+X`, `y` and restart Ardupilot:

    sudo systemctl daemon-reload
    sudo systemctl restart arducopter

Check status:

    sudo systemctl status arducopter
    
It should be active and running.


### Check MAVProxy

MAVProxy is used to be able to connect to autopilot using desktop GCS (over on-board or local WiFi) 
and our web-based GCS simultaneously. It is already installed in Emlid Raspbian image, just check it:

    mavproxy.py --master=udp:127.0.0.1:14550 --out=tcpin:0.0.0.0:5762
    
After entering this command you'll see your autopilot messages. Ctrl+C to exit.


### Video streaming

GCS.uno has a video server which can be used to stream realtime RTSP video to your web-based dashboard. 
Next steps describe how to configure on-board Raspicam camera module.

    sudo apt-get update
    sudo apt-get install autoconf automake libtool pkg-config libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev libraspberrypi-dev gstreamer1.0-tools gstreamer1.0-plugins-good gstreamer1.0-plugins-bad

If you have dependency warnings, try to solve them using following commands:

    sudo apt-get install --fix-broken --assume-yes
    sudo apt-get autoremove
    sudo apt-get install -f && sudo dpkg --configure -a

CD to your home dir and clone gst-rpicamsrc 
(this is a GStreamer wrapper around the raspivid/raspistill functionality of the RaspberryPi):

    cd
    git clone https://github.com/GCS-uno/gst-rpicamsrc.git

Compile it:

    cd rpicamsrc
    chmod +x autogen.sh
    ./autogen.sh --prefix=/usr --libdir=/usr/lib/arm-linux-gnueabihf/
    make
    sudo make install

Test it with Raspicam connected:

    gst-launch-1.0 rpicamsrc bitrate=1000000 ! filesink location=test.h264

Ctrl+C after 10 seconds and check if file `test.h264` exists and readable.


### Install Node JS

    curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
    sudo apt-get install -y nodejs build-essential


### Install PM2 process manager

    sudo npm install pm2 -g


### Install board scripts

    cd
    git clone https://github.com/GCS-uno/drone_board.git
    cd drone_board
    npm install

There you can find two shell scripts `mavproxy.sh` and `video.sh` which help running MAVProxy and video streaming.
If you are sure not to use them, just skip to next step, otherwise make them executable:

    chmod +x mavproxy.sh
    chmod +x video.sh


### Get your drone keys

Sign in to your GCS.uno dashboard (https://pilot.gcs.uno), add new drone and get its MAVLink and Video keys.
Then put them in following commands to be readable by scripts.
For MAVLink key (replace `abcd1234` with one copied from dashboard):

    MAVLINK_KEY=abcd1234; echo "export MAVLINK_KEY=$MAVLINK_KEY" >>~/.bash_profile && source ~/.bash_profile

The same for Video key (replace `abcd1234`):

    VIDEO_KEY=abcd1234; echo "export VIDEO_KEY=$VIDEO_KEY" >>~/.bash_profile && source ~/.bash_profile
    

### Test MAVLink connection

Check MAVProxy again:
    
    ./mavproxy.sh

If it looks good Ctrl+C to exit and run it in background with PM2 process manager

    pm2 start mavproxy.sh --name mavproxy

Now run `drone.js' to check connection with GCS.uno server

    node drone    
    
If it reports that connection is established, Ctrl+C to stop and run it again with PM2:

    pm2 start drone.js --name drone


### Enable scripts to start on system boot

Enable PM2 to start on boot:
    
    pm2 startup
    
This will prompt a sudo command which must be copied and executed to enable autostart.
Then save list of active processes:

    pm2 save
    
And check it:
    
    pm2 list

You'll see `mavproxy` and `drone` scripts running.

Check GCS.uno dashboard, you can see you drone's telemetry streaming.

