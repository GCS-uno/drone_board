#!/usr/bin/env bash

mavproxy.py --master=udp:127.0.0.1:14550 --out=tcpin:0.0.0.0:5762 --out=udpout:127.0.0.1:15001
