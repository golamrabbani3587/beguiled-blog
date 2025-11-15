# ---- Build Stage ----
FROM node:22.10.10 AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source & build NestJS
COPY . .
RUN npm run build


# ---- Production Stage ----
FROM node:22.10.10 AS production

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built dist/
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
