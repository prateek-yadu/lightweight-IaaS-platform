FROM node:24.15.0

WORKDIR /site

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 5173

CMD [ "npm", "run", "dev", "--", "--host" ]

