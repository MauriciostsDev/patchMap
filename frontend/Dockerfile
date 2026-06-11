# Frontend Expo (React Native) — ambiente reprodutível p/ dev web + Metro.
# Para device físico, prefira rodar `npm start` no host com o app Expo Go.
FROM node:20-bookworm-slim

ENV CI=1 \
    EXPO_NO_TELEMETRY=1 \
    REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

WORKDIR /app

# Instala deps primeiro (cache de camada)
COPY package.json ./
RUN npm install

COPY . .

# 8081 Metro · 19000/19001 Expo · 19006 Expo Web
EXPOSE 8081 19000 19001 19006

CMD ["npm", "run", "web", "--", "--host", "lan"]
