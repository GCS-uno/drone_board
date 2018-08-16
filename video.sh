#!/usr/bin/env bash

gst-launch-1.0 rpicamsrc bitrate=1000000 ! video/x-h264,width=320,height=240,framerate=30/1 ! h264parse ! flvmux ! rtmpsink location="rtmp://video.gcs.uno:1935/drone/$DRONE_VIDEO_KEY"
