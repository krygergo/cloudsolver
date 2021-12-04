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
    docker-compose -f docker-compose.dev.yml up -d
}

stop () {
    if [ "$(docker container inspect -f '{{.State.Running}}' gateway)" == "true" ]
        then
            docker stop gateway
    fi
    if [ "$(docker container inspect -f '{{.State.Running}}' firestore)" == "true" ]
        then
            docker stop firestore
    fi
}

build () {
    docker-compose -f docker-compose.dev.yml build
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
            statusContainer gateway 3001; statusContainer firestore 8080; return
    fi
    case $1 in
        express)
            statusContainer gateway 3001
            ;;
        firestore)
            statusContainer firestore 8080
            ;;
        *)
            help
            ;;
    esac
}

reset () {
    docker rm gateway firestore &&
    docker rmi gateway-server:latest firestore-emulator:latest
}

help () {
    printf "\n"
    printf "Specified commands for the gateway\n\n"
    printf "Options:\n"
    printf "    dp, deploy                    Deploy the gateway for local developing\n"
    printf "    stop                          Stop all running gateway containers\n"
    printf "    build                         Build or rebuild gateway images\n"
    printf "    test                          Run unit tests\n"
    printf "    st, status                    See status of all containers\n"
    printf "    st, status gateway            See status of gateway\n"
    printf "    st, status firestore          See status of firestore\n"
    printf "    rs, reset                     Reset gateway containers\n"
    printf "\n"
}

main $@; exit
