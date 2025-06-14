# Use .NET SDK image for development
FROM mcr.microsoft.com/dotnet/sdk:8.0

WORKDIR /app

# Copy csproj and restore as distinct layers
COPY *.csproj ./
RUN dotnet restore

# Copy the entire project
COPY . ./

# Build the project
RUN dotnet build

# Use dotnet watch for development
CMD ["dotnet", "watch", "run"]
