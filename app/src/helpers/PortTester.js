import net from "net";
import {is_integer, is_string} from "./Is.js";
import {BLACKLIST_PORT} from "./Constants.js";
import InvalidArgumentException from "../errors/exceptions/InvalidArgumentException.js";
import RuntimeException from "../errors/exceptions/RuntimeException.js";
import {E_NOTICE} from "../errors/exceptions/ErrorCode.js";
import {sprintf} from "./Formatting.js";

/**
 * Test port
 *
 * @param {number} port port number
 * @param {string} hostname hostname
 * @returns {Promise<number>} port number
 */
export default function PortTester(port, hostname) {
    return new Promise((resolve, reject) => {
        if (!is_string(hostname)) {
            reject(new InvalidArgumentException(sprintf("Hostname must be a string, %s given", hostname === null ? hostname : typeof hostname)));
            return;
        }
        if (!is_integer(port)) {
            reject(new InvalidArgumentException(sprintf("Port must be an integer, %s given", port === null ? port : typeof port)));
            return;
        }
        if (port < 1 || port > 65535) {
            reject(new InvalidArgumentException("Port must be between 1 and 65535"));
            return;
        }
        if (BLACKLIST_PORT.includes(port)) {
            reject(new InvalidArgumentException(sprintf("Port %s is blacklisted", port)));
            return;
        }
        const server = net.createServer()
            .listen(port, hostname)
            .on("listening", () => {
                server.close();
                resolve(port);
            })
            .on("error", (err) => {
                reject(new RuntimeException(
                    `Port ${port} is already in use`,
                    E_NOTICE,
                    err
                ));
            });
    });
}
