import SerialConnectionStatus from '../../../serial/SerialConnectionStatus'
import shutdown from 'electron-shutdown-command';
import WebSocket from 'ws';
// import { connect } from 'net';

const WEBSOCKET_HOST = 'ws://localhost:8888/';
const CONNECTION_CHECK_INTERVAL_MS = 5000;

const singleton = function() {
    let didConnect = false;
    let store = null;
    let hasReceivedValidData = false;
    let statusUpdateCallback = null;

    let ws = null;
    let timeout = null;

    const listen = (storeParam, statusUpdateReceivedParam) => {
        if (!storeParam || didConnect || !statusUpdateReceivedParam) {
            return;
        }
        store = storeParam;
        statusUpdateCallback = statusUpdateReceivedParam;
        statusUpdateCallback(SerialConnectionStatus.connecting);

        attemptToConnect();
    }

    const attemptToConnect = () => {
        connectToSocket();
        timeout = setInterval(function startClient() {
            connectToSocket();
        }, CONNECTION_CHECK_INTERVAL_MS);
    }

    const connectToSocket = () => {
        ws = new WebSocket(WEBSOCKET_HOST);
        ws.on('open', function open() {
            console.log("Connected to websocket");
            if (timeout) {
                clearInterval(timeout);
            }
            didConnect = true;
            statusUpdateCallback(SerialConnectionStatus.connected);
            ws.on("message", dataReceived);
        });

        ws.on('close', function close() {
            statusUpdateCallback(SerialConnectionStatus.disconnected);
            if (didConnect) {
                didConnect = false;
                attemptToConnect();
            }
        });

        ws.on('error', function error(e) {
            console.log("Websocket error: ", e);
        });
    }

    const stopListening = () => {
        didConnect = false;
        if (!ws) { 
            return 
        }

        ws.close();
        statusUpdateCallback(SerialConnectionStatus.disconnected);
    }


    // callbacks

    const dataReceived = (data) => { 
        if (!data || typeof data !== "string") {
            return;
        }    

        const parsed = JSON.parse(data);
        const payload = parsed.payload;

        store.commit("UPDATE_DATA", payload);

        if (typeof payload.rpm !== "undefined") {
            if (payload.rpm > 300) {
                hasReceivedValidData = true;
            } else if (hasReceivedValidData && (payload.rpm <= 0)) {
                console.log("Engine not running. Shutting down in 3 seconds.");
                shutdown.shutdown({
                    force: true,
                    timerseconds: 3,
                    sudo: true,
                    debug: false,
                    quitapp: false
                });
            }
        }
    }

    return { 
        listen,
        stopListening
    }
}();

export default singleton;