FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY SkillForge.Api.csproj ./
RUN dotnet restore

COPY . .

RUN dotnet publish \
    --configuration Release \
    --output /out/publish \
    --no-restore

RUN dotnet tool install \
    --tool-path /tools \
    dotnet-ef \
    --version 10.0.13

RUN ASPNETCORE_ENVIRONMENT=Production \
    ConnectionStrings__SkillForge="Host=localhost;Database=build_only;Username=build_only;Password=unused" \
    /tools/dotnet-ef migrations bundle \
    --configuration Release \
    --output /out/efbundle

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_HTTP_PORTS=8080

COPY --from=build /out/publish ./

RUN mkdir -p /app/keys \
    && chown "$APP_UID" /app/keys \
    && chmod 700 /app/keys

USER $APP_UID

EXPOSE 8080


FROM runtime AS migrate

COPY --from=build /out/efbundle /app/efbundle

ENTRYPOINT ["/app/efbundle"]


FROM runtime AS final

ENTRYPOINT ["dotnet", "SkillForge.Api.dll"]