# Χρησιμοποιούμε Node.js image
FROM node:20-alpine

# Ορίζουμε τον φάκελο εργασίας μέσα στο container
WORKDIR /app

# Αντιγράφουμε τα αρχεία ρυθμίσεων
COPY package*.json ./

# Εγκαθιστούμε τα dependencies
RUN npm install

# Αντιγράφουμε όλο τον υπόλοιπο κώδικα
COPY . .

# Ανοίγουμε την πόρτα του Vite 
EXPOSE 5173

# Ξεκινάμε την εφαρμογή με --host για να είναι προσβάσιμη έξω από το docker
CMD ["npm", "run", "dev", "--", "--host"]