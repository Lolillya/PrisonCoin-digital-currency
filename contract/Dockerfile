FROM node:20-alpine

# Install Ganache CLI globally
RUN npm install -g ganache

# Expose the default Ganache port
EXPOSE 7545

# Run Ganache on 0.0.0.0 so it can be accessed outside the container
CMD ["ganache", "--host", "0.0.0.0", "--port", "7545", "--chain.chainId", "1337", "--wallet.totalAccounts", "10"]
