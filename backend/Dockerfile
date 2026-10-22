# Build multi-stage para Spring Boot (Maven).
# Render usa este Dockerfile (ver render.yaml na raiz).

# --- Stage 1: build ---
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copia o wrapper e o pom primeiro para aproveitar cache de dependências.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline

# Copia o código e empacota (testes rodam no CI, aqui pulamos p/ build mais rápido).
COPY src ./src
RUN ./mvnw -B clean package -DskipTests

# --- Stage 2: runtime ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render injeta a porta via $PORT; Spring lê server.port.
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]
