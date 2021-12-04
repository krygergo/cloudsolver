FROM firebase-emulator-base

WORKDIR /app

COPY .firebaserc ./
COPY firebase.json ./
COPY storage.rules ./

EXPOSE 9199
EXPOSE 8080
EXPOSE 4000

CMD firebase emulators:start