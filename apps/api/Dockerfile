FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

RUN mkdir -p /var/data /app/uploads

COPY --from=build /workspace/target/*.jar /app/app.jar

ENV SPRING_PROFILES_ACTIVE=portfolio
ENV PORT=8080
ENV PORTFOLIO_DB_PATH=/var/data/darlemlih
ENV UPLOAD_PATH=/app/uploads

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
