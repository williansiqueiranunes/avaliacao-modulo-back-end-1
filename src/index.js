import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
const app = express();
const port = 3030;
const TOKEN_SECRET = '09f26e402586e2faa8da4c98a35f1b20d6b033c6097befa8be3486a829587fe2';

app.use(cors());
app.use(express.json());

let sequenciaIdUsuario = 0;
let sequenciaIdRecado = 0;
const usuarios = [];
const recados = [];
const usuarioLogado = [];


/****** FUNÇOES ******/
const validaEmail = email => {
  return email.indexOf('@') > -1 && email.indexOf('.') > email.indexOf('@');
}
const validaCampoNomeUsuario = (request, response, next) => {
  if (request.body.nome == null) {
    response.status(400).send('Não foi informado o campo NOME');
  } else if (request.body.nome.length == 0) {
    response.status(400).send('Informe o NOME do usuário');
  } else {
    next();
  }
}
const validaCampoEmailUsuario = (request, response, next) => {
  if (request.body.email == null) {
    response.status(400).send('Não foi informado o campo EMAIL');
  } else if (!validaEmail(request.body.email)) {
    response.status(400).send('Informe um EMAIL valido do usuário');
  } else {
    next();
  }
}
const validaCampoSenhaUsuario = (request, response, next) => {
  if (request.body.senha == null) {
    response.status(400).send('Não foi informado o campo SENHA');
  } else if (request.body.senha.length == 0) {
    response.status(400).send('Informe uma SENHA');
  } else {
    next();
  }
}
const validaCampoTituloRecado = (request, response, next) => {
  if (request.body.titulo == null) {
    response.status(400).send('Não foi informado o campo TITULO');
  } else if (request.body.titulo.length == 0) {
    response.status(400).send('Informe um TITULO');
  } else {
    next();
  }
}
const validaCampoDescricaoRecado = (request, response, next) => {
  if (request.body.descricao == null) {
    response.status(400).send('Não foi informado o campo DESCRICAO');
  } else if (request.body.descricao.length == 0) {
    response.status(400).send('Informe uma DESCRICAO');
  } else {
    next();
  }
}
const addUsuario = (request, response) => {
  const temUsuario = usuarios.find(u => u.email === request.body.email);
  if (temUsuario) {
    return response.status(400).send('Usuário já cadastrado');
  }
  const novoUsuario = {
    id: ++sequenciaIdUsuario,
    nome: request.body.nome,
    email: request.body.email,
    senha: request.body.senha
  }
  usuarios.push(novoUsuario);
  response.status(200).json(novoUsuario);
}
const loginUsuario = (request, response) => {
  const usuario = usuarios.find(u => u.email === request.body.email);
  if (usuario == null || usuario.senha !== request.body.senha) {
    return response.status(400).send('Email ou senha inválidos');
  }
  const token = jwt.sign({email: request.body.email}, TOKEN_SECRET, { expiresIn: 84600 }); 
  let indexLogin = usuarioLogado.findIndex(u => u.usuarioId == usuario.id);
  if (indexLogin == -1) {
    usuarioLogado.push({token: token, usuarioId: usuario.id});
  } else {
    usuarioLogado[indexLogin].token = token;
  }
  response.status(200).json({token});
}
const validaLogin = (request, response, next) => {
  const authHeader = request.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    return response.status(401).send('Informe o token');
  }
  const login = usuarioLogado.find(u => u.token == token);
  if (login == null) {
    return response.status(401).send('Não foi feito o login, entre em /login');
  }
  jwt.verify(token, TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403).send('Token invalido, entre em /login');
    }
    next();
  });
}
const getIdUsuarioLogado = request => {
  let login = usuarioLogado.find(u => u.sessionId == request.sessionID)
  return login.usuarioId;
}
const adicionarRecado = (request, response) => {
  const recado = {
    id: ++sequenciaIdRecado,
    usuarioId: getIdUsuarioLogado(request),
    titulo: request.body.titulo,
    descricao: request.body.descricao
  }
  recados.push(recado);
  response.status(200).json(recado);
}
const listarRecados = (request, response) => {
  const recadosUsuario = recados.filter(r => r.usuarioId == getIdUsuarioLogado(request));
  let page = request.query.page != null ? (parseInt(request.query.page) - 1) : 0;
  let size = request.query.size != null ? parseInt(request.query.size) : 0;
  if (page < 0) {
    page = 0;
  }
  if (size <= 0) {
    size = 6;
  }
  if (size > 10) {
    size = 10;
  }
  const pagens = Math.ceil(recadosUsuario.length / size);
  const result = {
    next: (page + 2) > pagens ? '' : 'page=' + (page + 2),
    prev: page <= 0 ? '' : 'page=' + page,
    data: recadosUsuario.slice(page * size, page * size + size)
  }
  response.status(200).json(result);
}
const obterRecadoID = (request, response) => {
  const id = parseInt(request.params.id);
  if (isNaN(id) || id <= 0) {
    return response.status(400).send('Informe um id válido');
  }
  const recado = recados.find(r => r.id == id && r.usuarioId == getIdUsuarioLogado(request));
  if (recado == null) {
    return response.status(400).send(`Náo foi encontrado nunhum recado com ID ${id}`);
  }
  response.status(200).json(recado);
}
const atualizarRecadoID = (request, response) => {
  const id = parseInt(request.params.id);
  if (isNaN(id) || id <= 0) {
    return response.status(400).send('Informe um id válido');
  }
  const recadoIndex = recados.findIndex(r => r.id == id && r.usuarioId == getIdUsuarioLogado(request));
  if (recadoIndex == -1) {
    return response.status(400).send(`Náo foi encontrado nunhum recado com ID ${id}`);
  }
  recados[recadoIndex].titulo = request.body.titulo;
  recados[recadoIndex].descricao = request.body.descricao;
  response.status(200).json(recados[recadoIndex]);
}
const deletarRecadoID = (request, response) => {
  const id = parseInt(request.params.id);
  if (isNaN(id) || id <= 0) {
    return response.status(400).send('Informe um id válido');
  }
  const recadoIndex = recados.findIndex(r => r.id == id && r.usuarioId == getIdUsuarioLogado(request));
  if (recadoIndex == -1) {
    return response.status(400).send(`Náo foi encontrado nunhum recado com ID ${id}`);
  }
  recados.splice(recadoIndex, 1);
  response.status(200).send('recado deletado');
}


app.get('/', (request, response) => {
  const texto = `
  <h1>Olá, use as seguintes rotas</h1>
  <ul>
  <li>POST: /usuario -> add novo usuario</li>
  <li>POST: /login -> login no sistema</li>
  <li>GET: /recado -> lista recados (6 primeiros)</li>
  <li>GET: /recado?page=1 -> Proxima pagina de recados</li>
  <li>GET: /recado?page=1&size=8 -> Numero de recados por pagina (max 10)</li>
  <li>GET: /recado/1 -> detalhe recado por id</li>
  <li>POST: /recado -> grava recedo</li>
  <li>PUT: /recado/:id -> edita recedo</li>
  <li>DELETE: /recado/:id -> deleta recado</li>
  </ul>
  <br><br>
  <b>Autencicação por token (headers)</b>
  <pre><code>Key: Authorization - Value: token umaChaveRetornadaAposLogin</code></pre>
  <br><br>
  <b>json cadastro usuario</b>
  <pre><code>{ "nome": "", "email": "", "senha": "" }</code></pre>
  <b>json login</b>
  <pre><code>{ "email": "", "senha": "" }</code></pre>
  <b>json recado</b>
  <pre><code>{ "titulo": "", "descricao": "" }</code></pre>
  `;
  return response.send(texto);
});

app.post('/usuario', validaCampoNomeUsuario, validaCampoEmailUsuario, validaCampoSenhaUsuario, addUsuario);
app.post('/login', validaCampoEmailUsuario, validaCampoSenhaUsuario, loginUsuario);

app.get('/recado', validaLogin, listarRecados);
app.get('/recado/:id', validaLogin, obterRecadoID);
app.post('/recado', validaLogin, validaCampoTituloRecado, validaCampoDescricaoRecado, adicionarRecado);
app.put('/recado/:id', validaLogin, validaCampoTituloRecado, validaCampoDescricaoRecado, atualizarRecadoID);
app.delete('/recado/:id', validaLogin, deletarRecadoID);


/* Config Servidor */
app.listen(port, () => console.log(`Servidor iniciado em http://localhost:${port}`));
