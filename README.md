# LazyMonitor - HealthChecker 🌜

The LazyMonitor project is a OpenSource HealthChecker to WebApplications to monitoring using HTTP requests and PING tests to notificate the change of application health by Telegram, it's inspired in LazyMoon-MRI available in this [LINK](https://github.com/Mewbi/LazyMoon/tree/master/LM-MRI).

<div align="center">
	<img src="https://github.com/user-attachments/assets/be4ce3f6-b9e2-4438-a4d7-a1de4109cc5b" alt="LazyMonitorLogo" width="500" height="500">
</div>

# Features
- Notifications by HTTP Requests monitoring;
- WebSocket to receive your Ping Tests results;
- WebSocket to receive your HTTP Tests results;
- CRUD by API to controll your web applications.

# Requirements

- Docker;
- Docker Compose plugin
- Active TelegramBot API Key;
- Telegram ChatID;

## Installation

To use the LazyMonitor, follow these steps:

- Clone this repository or download the source code.
- Create the *.env* file following the example:

```
CONNECTION_STRING=postgres://{postgresql_user_here}:{postgresql_password_here}@database:5432/{db_name_here}
PORT=3001
TELEGRAM_TOKEN=your_telegrambot_token_here
CHAT_ID=your_telegram_chat_id_here
INTERVAL_FOR_TESTS=interval_in_seconds_here
```
- Create the *postgres.env* file following the example:
```
POSTGRES_PASSWORD=postgresql_password_here
POSTGRES_USER=postgresql_user_here
POSTGRES_DB=db_name_here
```
- Run the Docker Compose:
```bash
docker compose up
```

## API 

### GET All Servers

- **GET** /servers


### GET Server

- **GET** /server:${serverID}



### Create Server

- **POST** /server
- **JSON Data:**
``` json
 {
 	"name": "Teste2",
 	"hostname": "api.menherabot.xyz",
 	"monitoringPing": true,
 	"monitoringHTTP": true,
 	"monitoringURI": "/info/ping"
 }
```


| Field          | Type | Description                   |Required                     |
|----------------|---------|-------------------------------|-----------------------------|
|name|STRING|web aplication name            |YES            |
|hostname |STRING |Domain or IP to acess your aplication    | YES          |
|monitoringPing|BOOLEAN|Permission to tests by ICMP    | YES          |
|monitoringHTTP|BOOLEAN|Permission to tests by HTTP    | YES          |
|monitoringURI|BOOLEAN|URL's Path to tests by HTTP    | YES          |

### Update Server

- **POST** /server:${serverID}


- **JSON Data:**
``` json
 {
 	"name": "Teste2",
 	"hostname": "api.menherabot.xyz",
 	"monitoringPing": true,
 	"monitoringHTTP": true,
 	"monitoringURI": "/info/ping"
 }
```

| Field          | Type | Description                   |Required                     |
|----------------|---------|-------------------------------|-----------------------------|
|name|STRING|web aplication name            |NO           |
|hostname |STRING |Domain or IP to acess your aplication    | NO           |
|monitoringPing|BOOLEAN|Permission to tests by ICMP    | NO          |
|monitoringHTTP|BOOLEAN|Permission to tests by HTTP    | NO         |
|monitoringURI|BOOLEAN|URL's Path to tests by HTTP    | NO          |

### DELETE Server

- **DELETE** /server:${serverID}

### WEBSOCKET Ping

- **WS** /servers/ping

- **JSON Data:**
``` json
{
	"serversList": [
		"1"
	]
}
```
| Field          | Type | Description                   |Required                     |
|----------------|---------|-------------------------------|-----------------------------|
|serversList|LIST|Server`s IDs |YES         |

### WEBSOCKET HTTP

- **WS** /servers/http

- **JSON Data:**
``` json
{
	"serversList": [
		"1"
	]
}
```
| Field          | Type | Description                   |Required                     |
|----------------|---------|-------------------------------|-----------------------------|
|serversList|LIST|Server`s IDs |YES         |

## ChangeLog

### Version: 1.0.0

The first operating version of LazyMonitor, may have bugs or improvements points to do.
