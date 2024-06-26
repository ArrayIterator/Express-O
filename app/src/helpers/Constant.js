export const TIMEOUT = 30000;
export const PORT_RANGE_START = 3000;
export const PORT_RANGE_END = 5000;
export const BLACKLIST_PORT = [
    1, // tcpmux
    7, // echo
    9, // discard
    11, // systat
    13, // daytime
    15, // netstat
    17, // qotd
    19, // chargen
    20, // ftp
    21, // ftp
    22, // ssh,
    23, // telnet
    25, // smtp
    37, // time
    42, // nameserver
    43, // nicname
    53, // domain
    77, // priv-rjs
    79, // finger
    87, // ttylink
    95, // supdup
    101, // hostriame
    102, // iso-tsap
    103, // gppitnp
    104, // acr-nema
    109, // pop2
    110, // pop3
    111, // sunrpc
    113, // auth
    115, // sftp
    117, // uucp-path
    119, // nntp
    123, // NTP
    135, // loc-srv / epmap
    139, // netbios
    143, // imap2
    179, // BGP
    389, // ldap
    465, // smtp+ssl
    512, // print / exec
    513, // login
    514, // shell
    515, // printer
    526, // tempo
    530, // courier
    531, // chat
    532, // netnews
    540, // uucp
    556, // remotefs
    563, // nntp+ssl
    587, // stmp?
    601, // syslog-conn
    636, // ldap+ssl
    993, // ldap+ssl
    995, // pop3+ssl
    2049, // nfs
    3659, // apple-sasl / PasswordServer
    4045, // lockd
    6000, // X11
    6665, // Alternate IRC [Apple addition]
    6666, // Alternate IRC [Apple addition]
    6667, // Standard IRC [Apple addition]
    6668, // Alternate IRC [Apple addition]
    6669, // Alternate IRC [Apple addition]
    6697, // IRC + TLS
    10080, // Amanda
    11371, // OpenPGP
    11720, // h323 Call Signal Alternate
    13720, // h323 Call Signal Alternate
    13721, // h323 Call Signal Alternate
    13722, // h323 Call Signal Alternate
    13724, // h323 Call Signal Alternate
    13782, // Netbackup
    13783, // VOPIED
    22273, // wnn6
    26000, // quake
    26208, // wnn6-ds
    33434, // traceroute
    37777, // sshd
    44818, // EtherNet/IP-1
    47808, // BACnet Building Automation and Control Networks
    47809, // BACnet Building Automation and Control Networks
    65535, // No service
    3306, // MySQL
    5432, // PostgreSQL
    27017, // MongoDB
    6379, // Redis
    9200, // Elasticsearch
    11211, // Memcached
    27018, // MongoDB
    28017, // MongoDB
];
