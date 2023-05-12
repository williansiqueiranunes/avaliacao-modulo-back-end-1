import express from 'express';
import session from 'express-session';
import cors from 'cors';
const app = express();
const port = 3030;


app.use(cors({
  origin: '*',
  methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));
app.use(express.json());
app.use(session({
  genid: () => 'id-' + (new Date()).getTime(),
  secret: 'fjm4938fhfjv92348hf9023cdk',
  resave: false,
  saveUninitialized: true
}));

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
  let login = usuarioLogado.find(u => u.sessionId == request.sessionID)
  if (login == null) {
    login = {sessionId: request.sessionID, usuarioId: usuario.id};
    usuarioLogado.push(login);
  }
  response.status(200).send('login ok');
}
const validaLogin = (request, response, next) => {
  const login = usuarioLogado.find(u => u.sessionId == request.sessionID)
  if (login == null) {
    return response.status(401).send('Não foi feito o login, entre em /login');
  }
  next();
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
  response.status(200).json(recados.filter(r => r.usuarioId == getIdUsuarioLogado(request)));
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
  <li>GET: /recado -> lista recados</li>
  <li>GET: /recado/1 -> detalhe recado por id</li>
  <li>POST: /recado -> grava recedo</li>
  <li>PUT: /recado/:id -> edita recedo</li>
  <li>DELETE: /recado:id -> deleta recado</li>
  </ul>
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
