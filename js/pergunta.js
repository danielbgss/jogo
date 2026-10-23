// ---------- Estado do jogo ----------
let perguntas = [];      // perguntas do nível escolhido (já embaralhadas)
let atual = 0;           // índice da pergunta que está na tela
let acertos = 0;
let erros = 0;
let respondida = false;  // evita contar dois cliques na mesma pergunta


// ---------- Funções auxiliares ----------
function embaralhar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

// Mostra só uma das três telas e esconde as outras
function trocarTela(idDaTela) {
    ["tela_dificuldade", "tela_jogo", "tela_fim"].forEach(id => {
        document.getElementById(id).classList.toggle("d-none", id !== idDaTela);
    });
}


// ---------- Escolha da dificuldade ----------
// Cada botão tem data-nivel="facil" ou data-nivel="dificil"
document.querySelectorAll("[data-nivel]").forEach(botao => {
    botao.addEventListener("click", () => iniciar(botao.dataset.nivel));
});

document.getElementById("btn_reiniciar").addEventListener("click", () => {
    trocarTela("tela_dificuldade");
});


// ---------- Começar uma partida ----------
async function iniciar(nivel) {
    // Zera tudo, para uma nova partida não herdar números da anterior
    atual = 0;
    acertos = 0;
    erros = 0;
    respondida = false;
    document.getElementById("acertos").textContent = 0;
    document.getElementById("erros").textContent = 0;
    document.getElementById("mensagem_erro").textContent = "";

    try {
        const resposta = await fetch("../data/perguntas.json");
        if (!resposta.ok) {
            throw new Error("Arquivo não encontrado: " + resposta.status);
        }

        const dados = await resposta.json();
        if (!dados[nivel] || dados[nivel].length === 0) {
            throw new Error("Não há perguntas para o nível: " + nivel);
        }

        perguntas = embaralhar(dados[nivel]);
        trocarTela("tela_jogo");
        mostrarPergunta();
    } catch (erro) {
        document.getElementById("mensagem_erro").textContent =
            "Não foi possível carregar as perguntas.";
        console.error(erro);
    }
}


// ---------- Mostrar a pergunta e criar os botões ----------
function mostrarPergunta() {
    const p = perguntas[atual];
    respondida = false;

    document.getElementById("numero_jogo").textContent = `${atual + 1}/10`;
    document.getElementById("pergunta_jogo").textContent = p.pergunta;

    const area = document.getElementById("alternativas");
    area.innerHTML = "";   // limpa os botões da pergunta anterior

    p.alternativa.forEach((texto, i) => {
        const coluna = document.createElement("div");
        coluna.className = "col-6";

        const botao = document.createElement("button");
        botao.className = "btn btn-mc w-100 rounded-0";   // mesmas classes dos outros botões
        botao.textContent = texto;
        botao.addEventListener("click", () => responder(i));

        coluna.appendChild(botao);
        area.appendChild(coluna);
    });
}


// ---------- Responder ----------
function responder(escolhida) {
    if (respondida) return;
    respondida = true;

    const p = perguntas[atual];
    const botoes = document.querySelectorAll("#alternativas .btn-mc");

    // Pinta a correta de verde; se errou, pinta a escolhida de vermelho
    botoes[p.correta].classList.add("certa");
    if (escolhida === p.correta) {
        acertos++;
    } else {
        erros++;
        botoes[escolhida].classList.add("errada");
    }

    document.getElementById("acertos").textContent = acertos;
    document.getElementById("erros").textContent = erros;

    // Espera 1,2 s para o jogador ver o resultado e passa para a próxima
    setTimeout(() => {
        atual++;
        if (atual < 10) {
            mostrarPergunta();
        } else {
            fimDeJogo();
        }
    }, 1200);
}


// ---------- Fim de jogo ----------
function fimDeJogo() {
    const total = acertos + erros;
    document.getElementById("resultado_jogo").textContent =
        `Você acertou ${acertos} de ${total}`;
    trocarTela("tela_fim");
}



