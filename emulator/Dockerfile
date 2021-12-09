FROM firebase-emulator-base

WORKDIR /app

COPY firebase.json ./

EXPOSE 8080
EXPOSE 4000

CMD firebase emulators:start --project demo-development