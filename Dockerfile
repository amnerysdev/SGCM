FROM FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base

WORKDIR /app

COPY ["./SGCM/SGCM.Web.csproj", "./SGCM/"]
COPY ["./SGCM.Data/SGCM.Data.csproj", "./SGCM.Data/"]
COPY ["./SGCM.Test/SGCM.Test.csproj", "./SGCM.Test/"]

RUN 

EXPOSE 8080

