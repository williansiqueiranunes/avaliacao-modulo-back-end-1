# Avaliação Final do Módulo

**instalar as dependência**
```
npm install
```

**executar o projeto**
```
npm run start
```

**testar a API (postman)**

- baixar o ".json" e importe no postman
- no postman, vai ter as chamadas http com o json no body


# 
## Use as seguintes rotas

| Metodo | Rota     | Descrição |
|--------|-------------|-----------------------|
| POST   | /usuario    | add novo usuário      | 
| POST   | /login      | login no sistema      |
| GET    | /recado     | lista recados         |
| GET    | /recado/1   | detalhe recado por id |
| POST   | /recado     | grava recedo          |
| PUT    | /recado/:id | edita recedo          |
| DELETE | /recado/:id | deleta recado         |

_As rotas dos **recados** precisam de login, use a rota **/login** para criar uma sessão. No postman, a sessão vai em cada requisição como um cookie no header._

**json cadastro usuario**
```
{ "nome": "", "email": "", "senha": "" }
```
**json login**
```
{ "email": "", "senha": "" }
```
**json recado**
```
{ "titulo": "", "descricao": "" }
```
