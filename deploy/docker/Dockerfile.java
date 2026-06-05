FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /src

COPY backend/java/pom.xml ./backend/java/
COPY backend/java/src ./backend/java/src

RUN mvn -f ./backend/java/pom.xml -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app

ENV SERVER_PORT=41736
ENV TZ=Asia/Shanghai
ENV JAVA_OPTS="-Duser.timezone=Asia/Shanghai"

COPY --from=build /src/backend/java/target/gold-collector-1.0.0.jar ./gold-collector.jar

EXPOSE 41736

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/gold-collector.jar"]
