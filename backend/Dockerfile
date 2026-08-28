FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

ENV UPLOAD_DIR=/var/data/uploads
RUN mkdir -p /var/data/uploads

EXPOSE 5001

CMD ["npm", "start"]
