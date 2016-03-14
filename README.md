# Setup

### Cassandra

Add the following aliases to your profile so you can run cassandra in docker-machine



```
alias cassandra-start="docker run -d -p 9042:9042 --name cassandra cassandra:3.3"
alias cassandra-stop="docker rm -f cassandra"
alias cassandra-cli="docker run -it --link cassandra:cassandra --rm cassandra:3.3 sh -c 'exec cqlsh 192.168.99.100'"
```

### Install

```
$ npm install
```

### Test

```
$ npm test
```

### Docker Build

```
$ npm run build
```

### Docker Run

```
$ npm run start-docker
```

### LocalHost Run

```
$ npm start
```

# Environment Variables that can be set

- LOG_LEVEL
	- info
	- debug
	- trace

- DB_HOST: cassandra database hostname/ip

- DB_PORT: cassanrda database port

- DB_KEYSPACE: cassandra database keyspace name to use