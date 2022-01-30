FROM node:17

WORKDIR /app
COPY package.json .
COPY nginx .
CMD ["npm", "start"]
