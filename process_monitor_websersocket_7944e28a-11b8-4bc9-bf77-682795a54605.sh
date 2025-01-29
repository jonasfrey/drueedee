pid_websersocket=$(pgrep -f "websersocket_7944e28a-11b8-4bc9-bf77-682795a54605.js")
watch -n 1 ps -p $pid_websersocket -o pid,etime,%cpu,%mem,cmd