# Introduction

I am using nginx proxy as a bridge b/w LXD server and Agent. For Project to work correctly you would need to configure nginx proxy correctly.

## Generate LXD Certificate

You would need to generate a cert file. You can either use the existing LXD cert file which you created while configuring LXD Web UI access. I recommend creating new one.

You can create new certs by following [LXD's Official docs](https://documentation.ubuntu.com/lxd/latest/howto/access_ui).

## Generate Key and cert file

To generate key and crt file enter the following command :-

```bash
openssl pkcs12 -in [pfx_file_name] -clcerts -nokeys -out mycertitificate.crt
openssl pkcs12 -in [pfx_file_name] -nocerts -nodes -out mykey.key
```

After running the above command you will have 2 files generated. If you are using docker-compose for running the project store the file to `__deploy__/nginx/certificates` directory and all setup will be done automatically.

If you are running nginx manually add following config to nginx config file :-

```nginx
server {
   listen 80;
   listen [::]:80;


   server_name _;


   proxy_ssl_certificate     [crt_file_location_here];
   proxy_ssl_certificate_key [key_file_location_here];


   proxy_set_header Host $host;
   proxy_set_header X-Real-IP $remote_addr;
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header X-Forwarded-Proto $scheme;


   location / {
       # eg https://192.168.29.102:8443;
       proxy_pass ${LXD_SERVER_URL};
   }


   location /1.0/events {
       # eg https://192.168.29.102:8443/1.0/events;
       proxy_pass ${LXD_SERVER_URL}/1.0/events;


       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection $connection_upgrade;


       proxy_read_timeout 1000d;
       proxy_send_timeout 1000d;
   }
}
```

Now, Nignx is ready to listen for lxd server's REST API.
