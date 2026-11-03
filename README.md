# Imobiliária — Trabalho Final (Programação Web IV, IFFar)

Sistema de imobiliária com backend em Spring Boot (API REST + JWT) e frontend em Angular.

## Estrutura

```
backend/   API Spring Boot (Java 17, MySQL, JWT, upload de fotos, e-mail)
frontend/  Angular (em construção)
docs/      Anotações das aulas e enunciado do trabalho (docs/aulas.md)
```

## Pré-requisitos

- Java 17 e Maven (ou o `./mvnw` incluso)
- MySQL 8
- Node.js e Angular CLI (para o frontend)

## Banco de dados

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS restaurante"
mysql -u root restaurante < backend/dump.sql
```

Banco usado: `restaurante` (usuário `root`, sem senha, em dev — ver `backend/src/main/resources/application.properties`).

## Rodar o backend

```bash
cd backend
cp mail.properties.example mail.properties   # preencher com as credenciais SMTP
mvn spring-boot:run                          # sobe em http://localhost:8080
```

## Variáveis de ambiente

| Variável        | Uso                                           |
|-----------------|-----------------------------------------------|
| `MAIL_USERNAME` | usuário SMTP do Mailgun (ou em mail.properties) |
| `MAIL_PASSWORD` | senha SMTP do Mailgun (ou em mail.properties)   |
| `JWT_SECRET`    | chave do JWT (mín. 32 caracteres; tem padrão só para dev) |

## Frontend

Em construção.

---

Histórico das aulas em github.com/2004ariel/JavaWeb
