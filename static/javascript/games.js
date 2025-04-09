const respostaErrada = new CustomEvent("respostaErrada");
const respostaCerta = new CustomEvent("respostaCerta");
const vidasEsgotadas = new CustomEvent("vidasEsgotadas");
const proximaEtapa = new CustomEvent("proximaEtapa");
const exlpanacaoLida = new CustomEvent("explanacaoLida");

const iniciarJogo = new CustomEvent("iniciarJogo");
const atualizarInfo = new CustomEvent("atualizarInfo");


// Etapas
const Explanacao = (titulo, texto, idAudio, audios = []) => { // Adicionar a possibilidade de anexar imagens
    class InternalExplanacao{

        constructor(titulo, texto, audios) {
            this.titulo = titulo;
            this.texto = texto;
            this.idAudio = idAudio;
            this.audios = audios;
        }

        instance() {
            const divExplanacao = document.createElement("div");
            divExplanacao.id = "etapa";

            const titulo = document.createElement("h2");
            titulo.innerText = this.titulo;

            const audioTexto = obterAudio(this.idAudio);
            audioTexto.autoplay = true;

            const audioTextoBtn = document.createElement("button");
            audioTextoBtn.onclick = () => {
                audioTexto.play();
            }

            const texto = document.createElement("p");
            texto.innerText = this.texto;

            const divTexto = document.createElement("div");
            divTexto.append(audioTextoBtn, texto);

            const listaAudios = document.createElement("ul");
            
            this.audios.forEach(value => {
                const buttonAudio = document.createElement("button");
                buttonAudio.innerText = value;

                buttonAudio.onclick = () => {
                    const audio = obterAudio(value);
                    audio.play();
                }

                listaAudios.appendChild(buttonAudio);
            })

            const continuarBtn = document.createElement("button");
            continuarBtn.innerText = "Continuar"
            continuarBtn.onclick = () => {
                dispatchEvent(exlpanacaoLida);
            }

            divExplanacao.appendChild(titulo);
            divExplanacao.appendChild(divTexto);
            divExplanacao.appendChild(listaAudios);
            divExplanacao.appendChild(continuarBtn);

            return divExplanacao;
        }
    }
    return new InternalExplanacao(titulo, texto, audios);
}

const Quiz = (pergunta, resposta, alternativas) => {
    class InternalQuiz {
        constructor(pergunta, resposta, alternativas) {
            this.pergunta = pergunta;
            this.resposta = resposta;
            this.alternativas = alternativas;
        }

        instance() {
            const quizDiv = document.createElement("div");
            quizDiv.id = "etapa";

            const fieldset = document.createElement("fieldset");

            fieldset.id = "pergunta"
            fieldset.setAttribute("value", resposta);

            const pergunta = document.createElement("legend");
            pergunta.innerText = this.pergunta;
            fieldset.appendChild(pergunta);

            const todasAlternativas = [this.resposta, ...this.alternativas]
            todasAlternativas.sort(function (a, b){ 
                return Math.floor(Math.random() * 10);
            });
              

            todasAlternativas.forEach((element, index) => {
                const alternativaDiv = document.createElement("div");

                const alternativaInput = document.createElement("input");
                alternativaInput.type = "radio";
                alternativaInput.id = `${index}`;
                alternativaInput.name = "resposta";
                alternativaInput.value = element;

                const alternativaLabel = document.createElement("label");
                alternativaLabel.for = `${index}`;
                alternativaLabel.innerText = element;

                alternativaInput.onclick = () => {
                    const audio = new Audio("../media/audio/fonemas/vogais/e.mp3");
                    audio.play();
                }            
                alternativaLabel.appendChild(alternativaInput)
                alternativaDiv.append(
                    //alternativaInput,
                    alternativaLabel,
                )   

                fieldset.appendChild(alternativaDiv);
            });

            const confirmarBtn = document.createElement("button");
            confirmarBtn.innerText = "Confirmar";
            confirmarBtn.hidden = true;
            //confirmarBtn.style.display = "block";
            

            confirmarBtn.onclick = () => {
                fieldset.disabled = true;
                confirmarBtn.hidden = true;
                let opcaoSelecionada = document.querySelector("#pergunta input[name='resposta']:checked");

                if (opcaoSelecionada.value === resposta){
                    dispatchEvent(respostaCerta);
                }else{
                    dispatchEvent(respostaErrada);
                }
            }

            fieldset.appendChild(confirmarBtn);

            fieldset.onchange = () => {
                confirmarBtn.hidden = false;
            };



            quizDiv.appendChild(fieldset);

            return quizDiv;
        }
    }

    return new InternalQuiz(pergunta, resposta, alternativas);
}

// Sub-Elementos

function InterfaceInicial(){
    return `
    <div>
        <span> 5 Vidas</span>
        <progress max="10" value="1">Etapa 1</progress>
    </div>
    `
}

function popUpAcerto(){
    const popUP = document.createElement("div");
    popUP.classList.add("popUp");

    popUP.innerHTML =  `<p>Você Acertou</p>`;

    const botaoContinuar = document.createElement("button");
    botaoContinuar.onclick = () => dispatchEvent(proximaEtapa);
    botaoContinuar.innerText = "Continuar";

    popUP.appendChild(botaoContinuar);

    return popUP;
}

function popUpErro(resposta){
    const popUP = document.createElement("div");
    popUP.classList.add("popUp");

    popUP.innerHTML =  `
        <p>Incorreto!</p>
        <p>Resposta: ${resposta}</p>
    `;

    const botaoContinuar = document.createElement("button");
    botaoContinuar.onclick = () => dispatchEvent(proximaEtapa);
    botaoContinuar.innerText = "Continuar";

    popUP.appendChild(botaoContinuar);

    return popUP;
}

function popUpVidasEsgotadas(){
    const popUP = document.createElement("div");
    popUP.classList.add("popUp");

    popUP.innerHTML =  `<p>Vidas esgotadas</p>`;

    const botaoContinuar = document.createElement("button");
    botaoContinuar.onclick = () => dispatchEvent(proximaEtapa);
    botaoContinuar.innerText = "Continuar";

    popUP.appendChild(botaoContinuar);

    return popUP;
}

function popUpLicaoConcluida(){
    const popUP = document.createElement("div");
    popUP.classList.add("popUp");

    popUP.innerHTML =  `<p>Você completou a Lição</p>`;

    const botaoContinuar = document.createElement("button");
    botaoContinuar.onclick = () => dispatchEvent(proximaEtapa);
    botaoContinuar.innerText = "Continuar";

    popUP.appendChild(botaoContinuar);

    return popUP;
}

// Controlador
class Controlador{
    constructor(elementoPai, etapas){
        this.elementoPai = elementoPai;
        
        this.acertos = 0;
        this.numeroEtapa = 0;

        this.etapas = etapas;
        this.documentElement;
    }

    iniciar() {
        this.documentElement = document.createElement('div');
        this.documentElement.classList.add("controlador");

        const vidaSpan = document.createElement("span");
        vidaSpan.innerText = `${this.acertos} acertos`;

        const progress = document.createElement("progress")
        progress.value = 0;
        progress.max = this.etapas.length;

        this.etapaAtual = this.etapas.shift();

        const divIu = document.createElement("div");
        divIu.id = "divIu";
        divIu.appendChild(vidaSpan);
        divIu.appendChild(progress);

        this.documentElement.appendChild(divIu);
        this.documentElement.appendChild(this.etapaAtual.instance());

        document.getElementById(this.elementoPai).appendChild(this.documentElement);

        addEventListener("respostaCerta", () => this.exibirAcerto())
        addEventListener("respostaErrada", () => this.exibirErro())
        addEventListener("proximaEtapa", () => this.exibirProximaEtapa())
        addEventListener("atualizarInfo", () => this.atualizarInfo())
        addEventListener("explanacaoLida", () => this.exlpanacaoLida())
    }

    atualizarInfo(){
        console.log(this)
        const divIu = document.getElementById("divIu");
        const vidaSpan = divIu.querySelector("span");
        const progress = divIu.querySelector("progress");

        vidaSpan.innerText = `${this.acertos} Acertos`
        progress.value = this.numeroEtapa;
    }

    exibirProximaEtapa(){
        const etapaAtual = document.getElementById("etapa");
        if (etapaAtual) etapaAtual.remove();

        const popUps = document.querySelectorAll(".popUp");
        popUps.forEach(value => value.remove());
        

        const proximaEtapa = this.etapas.shift();
        if (proximaEtapa){
            this.etapaAtual = proximaEtapa;
            this.documentElement.appendChild(proximaEtapa.instance());
        } else {
            this.documentElement.appendChild(popUpLicaoConcluida());
        }
    }

    exibirAcerto(){
        this.numeroEtapa += 1;
        this.acertos += 1;
        dispatchEvent(atualizarInfo)
        this.documentElement.appendChild(popUpAcerto());
    }

    exibirErro(){
        this.numeroEtapa += 1;
        dispatchEvent(atualizarInfo);

        this.documentElement.appendChild(popUpErro(this.etapaAtual.resposta))
    }

    exlpanacaoLida() {
        this.numeroEtapa += 1;
        dispatchEvent(atualizarInfo);
        dispatchEvent(proximaEtapa);
    }
}