//Criar os requimentos para fazer a conexão com server e banco
const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const { error } = require('console');

// Criar as rotas 
const app = express();
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Para colocar dados na tabela
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


//Cria a conexão do banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'cimatec',
    database: 'BANCO'
});

//Fazendo a tentativa de conexão banco
db.connect(err => {
    if(err){
        console.error('Error', err.message);
        return;
    }
    console.log('Sucesso');
})

//Puxa o html
app.get('/', (req,res)  => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));

});


//Login no site
app.post('/login', (req,res) =>{
    const {email, senha} = req.body;
    const sql = 'SELECT * FROM LOGIN WHERE EMAIL = ?';

    db.query(sql, [email], async (err,results) => {
        if(err) return res.status(500).json(err);

      if (results.length === 0) {
      return res.send('<script>alert("Usuário não encontrado!"); window.location.href="login.html";</script>');
     }

    const usuario = results[0];

    if ( senha !== usuario.SENHA) {
      return res.send('<script>alert("Senha incorreta!"); window.location.href="login.html";</script>');
    }

    
    res.send('<script>alert("Login realizado com sucesso!"); window.location.href="main.html";</script>');
  });
});

//Post - Cadastro de produto
app.post('/atividade/criar', (req,res) => {
    const {nome,data} = req.body;
    const sql = 'INSERT INTO ATIVIDADE (NOME, DATA_PREVISTA) VALUES (?,?)'

    db.query(sql, [nome,data], (err,results) => {
        if(err) {
            console.error('Erro ao inserir dados: ', err.message);
            return res.send('Erro ao salvar no banco.');
        }
        res.send('<script>alert("Dados Salvos com Sucesso!"); window.location.href="/main.html"</script>');
    })
});

//Colocar dados na tabela
app.get('/api/atividade', (req,res) => {
    const sql = 'SELECT * FROM ATIVIDADE';
    db.query(sql, (err,results) => {
        if(err) {
            return res.status (500).json({error: 'Erro ao buscar ao banco'});
        }

        res.json(results);
    });
});

//Apagar dados da tabela
app.post('/atividade/delete', (req,res) => {
    const {id} = req.body;
    const sql = 'DELETE FROM ATIVIDADE WHERE ID_ATIVIDADE = ?';
    db.query(sql, [id], (err,results) => {
        if(err){
            return res.status (500).json({error: 'Erro ao buscar ao banco'});
        }
        res.send('<script>alert("Dados Removidos com Sucesso!"); window.location.href="/main.html"</script>');
    })
});


//Enviar para página de edição
app.get('/atividade/edit', (req,res) => {
    const id = parseInt(req.query.id);
    const sql = 'SELECT * FROM ATIVIDADE WHERE ID_ATIVIDADE =?';

    db.query(sql, [id], (err,results) => {
        if(err){
            console.error(err);
            return res.status(500).send('Erro banco');
        }
        if (results.length ===0) return res.status(404).send('Produto não encontrado');
        
        res.redirect(`/edit.html?id=${id}`);
    });
});

//Editar atividade
app.post('/atividade/update', (req,res) => {
    const {id,nome,data} = req.body;
    const sql = 'UPDATE ATIVIDADE SET NOME =?, DATA_PREVISTA =? WHERE ID_ATIVIDADE =?';

    db.query(sql, [nome,data,id], (err,results) => {
        if(err) {
            console.error(err);
            return res.status(500).send('Erro ao banco');
        }
        res.redirect('/main.html?status=sucess');
    });
});



// Rota para atualizar APENAS o status da tarefa
app.put('/api/atividade/:id/status', (req, res) => {
    const id = req.params.id;
    const { concluida } = req.body; // Pega o valor enviado (1 ou 0)
    const sql = 'UPDATE ATIVIDADE SET STATS = ? WHERE ID_ATIVIDADE = ?';

    db.query(sql, [concluida, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro ao atualizar banco' });
        }
        res.json({ message: 'Status atualizado com sucesso!' });
    });
});


// Fazer servidor rodar
app.listen(3300, () => {
    console.log('Servidor rodando em http://localhost:3300');
});