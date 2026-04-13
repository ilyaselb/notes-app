# Stage 1: Builder
FROM rust:slim-bookworm AS builder

WORKDIR /usr/src/app

COPY . .

RUN cargo build --release

# Stage 2: Production Runtime
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/local/bin

COPY --from=builder /usr/src/app/target/release/notes-app ./backend-api

EXPOSE 3000

CMD ["./backend-api"]
