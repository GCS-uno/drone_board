#!/usr/bin/env bash

# Uncomment desired option

# # UDP port source
mavproxy.py --master=udp:127.0.0.1:14550 --out=tcpin:0.0.0.0:5762 --out=udpout:127.0.0.1:15001 --daemon

# # Serial port source
# mavproxy.py --master=/dev/ttyAMA0 --baudrate 57600  --out=tcpin:0.0.0.0:5762 --out=udpout:127.0.0.1:15001 --daemon

# # USB port source
# mavproxy.py --master=/dev/ttyUSB0 --baudrate 57600  --out=tcpin:0.0.0.0:5762 --out=udpout:127.0.0.1:15001 --daemon

