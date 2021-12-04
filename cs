#!/bin/bash

main () {
    case $1 in
        dp|deploy)
            deploy
            ;;
        stop)
            stop
            ;;
        build)
            build
            ;;
        test)
            test
            ;;
        st|status)
            status ${@:2}
            ;;
        rs|reset)
            reset
            ;;
        help)
            help
            ;;
        *)
            help
            ;;
    esac
}

deploy () {
    docker-compose -f frontend/docker-compose.yml up -d && \
    docker-compose -f backend/docker-compose.yml up -d && \
    docker-compose -f emulator/docker-compose.yml up -d
}

stop () {
    if [ "$(docker container inspect -f '{{.State.Running}}' express)" == "true" ]
        then
            docker stop express
    fi
    if [ "$(docker container inspect -f '{{.State.Running}}' emulator)" == "true" ]
        then
            docker stop emulator
    fi
}

build () {
    docker-compose -f backend/docker-compose.yml \
                   -f emulator/docker-compose.yml \
                   build
}

test () {
    printf "Not yet implemented"
}

statusContainer () {
    CONTAINER=$1
    PORT=$2
    if [ "$(curl -f -s localhost:$PORT)" == "Ok" ]
        then
            printf "$CONTAINER is ready\n"; return
    fi
    if [ "$(docker container inspect -f '{{.State.Running}}' $CONTAINER)" == "false" ]
        then
            printf "$CONTAINER is not running\n"; return
    fi
    printf "$CONTAINER is starting up\n"
}

status () {
    if [ $# -eq 0 ]
        then
            statusContainer express 3001; statusContainer emulator 8080; return
    fi
    case $1 in
        express)
            statusContainer express 3001
            ;;
        emulator)
            statusContainer emulator 8080
            ;;
        *)
            help
            ;;
    esac
}

reset () {
    docker rm express emulator &&
    docker rmi express-server:latest emulator:latest
}

help () {
    printf "\n"
    printf "Specified commands for developing\n\n"
    printf "Options:\n"
    printf "    dp, deploy                    Deploy express for local developing\n"
    printf "    stop                          Stop all running containers\n"
    printf "    build                         Build or rebuild images\n"
    printf "    test                          Run unit tests\n"
    printf "    st, status                    See status of all containers\n"
    printf "    st, status express            See status of express\n"
    printf "    st, status emulator           See status of emulator\n"
    printf "    rs, reset                     Reset containers\n"
    printf "\n"
}

main $@; exit
