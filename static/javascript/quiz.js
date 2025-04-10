// --- Custom Events (Kept for this structure, consider alternatives for larger apps) ---
const RESPOSTA_ERRADA = "app:respostaErrada";
const RESPOSTA_CERTA = "app:respostaCerta";
const PROXIMA_ETAPA = "app:proximaEtapa";
const EXPLANACAO_LIDA = "app:explanacaoLida";
const ATUALIZAR_INFO = "app:atualizarInfo"; // Could be handled internally by controller

// --- Utility Functions ---

/**
 * Shuffles array in place using the Fisher-Yates (Knuth) algorithm.
 * @param {Array} array Array items
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

/**
 * Placeholder for obtaining an Audio object. Implement this based on your setup.
 * @param {string} id - The identifier for the audio file.
 * @returns {HTMLAudioElement} - An audio element.
 */
function obterAudio(id) {
    console.warn(`Placeholder: obterAudio called with id "${id}". Needs implementation.`);
    // Example: return new Audio(`../media/audio/${id}.mp3`);
    // Return a dummy object for the code to run without errors
    return {
        play: () => console.log(`Playing audio: ${id}`),
        pause: () => console.log(`Pausing audio: ${id}`),
        autoplay: false, // Default value
        // Add other methods/properties as needed
    };
}


// --- Component Classes ---

class Quiz {
    /**
     * Creates a Quiz stage.
     * @param {string} pergunta - The question text.
     * @param {string} resposta - The correct answer text.
     * @param {string[]} alternativas - An array of incorrect answer texts.
     * @param {string|null} [perguntaAudioId=null] - Optional audio ID for the question.
     */
    constructor(pergunta, resposta, alternativas, perguntaAudioId = null) {
        this.pergunta = pergunta;
        this.resposta = resposta;
        this.alternativas = alternativas;
        this.perguntaAudioId = perguntaAudioId;
        this.todasAlternativas = [this.resposta, ...this.alternativas];
        shuffleArray(this.todasAlternativas);
    }

    render() {
        const quizDiv = document.createElement("div");
        quizDiv.id = "etapa";
        quizDiv.classList.add("quiz");

        const fieldset = document.createElement("fieldset");
        fieldset.id = `pergunta-${Date.now()}`;

        let legendaHtml = `<legend>${this.pergunta}</legend>`;
        if (this.perguntaAudioId) {
            legendaHtml = `
                <legend>
                    ${this.pergunta}
                    <button class="audio-button audio-button-question" aria-label="Ouvir pergunta" onclick="obterAudio('${this.perguntaAudioId}').play()">🔊</button>
                </legend>`;
        }
        fieldset.innerHTML = legendaHtml;


        this.todasAlternativas.forEach((element, index) => {
            const alternativaDiv = document.createElement("div");
            alternativaDiv.classList.add("alternativa");

            const inputId = `alt-${index}-${fieldset.id}`;

            const alternativaInput = document.createElement("input");
            alternativaInput.type = "radio";
            alternativaInput.id = inputId;
            alternativaInput.name = "resposta";
            alternativaInput.value = element;

            const alternativaLabel = document.createElement("label");
            alternativaLabel.htmlFor = inputId;
            alternativaLabel.textContent = element;

            alternativaInput.onclick = () => {
                // const clickSound = obterAudio("select-option-feedback");
                // clickSound.play();
                console.log(`Selected: ${element}`); // Feedback
            };

            alternativaDiv.appendChild(alternativaInput);
            alternativaDiv.appendChild(alternativaLabel);
            fieldset.appendChild(alternativaDiv);
        });

        const confirmarBtn = document.createElement("button");
        confirmarBtn.innerText = "Confirmar";
        confirmarBtn.classList.add("botao-confirmar");
        confirmarBtn.hidden = true;

        confirmarBtn.onclick = () => {
            fieldset.disabled = true;
            confirmarBtn.hidden = true;

            const opcaoSelecionada = fieldset.querySelector("input[name='resposta']:checked");

            if (opcaoSelecionada) {
                 if (opcaoSelecionada.value === this.resposta) {
                    window.dispatchEvent(new CustomEvent(RESPOSTA_CERTA));
                } else {
                    window.dispatchEvent(new CustomEvent(RESPOSTA_ERRADA));
                }
            } else {
                console.warn("Confirm button clicked but no option selected.");
                 fieldset.disabled = false;
                 confirmarBtn.hidden = false;
            }
        };

        fieldset.appendChild(confirmarBtn);

        fieldset.onchange = () => {
            confirmarBtn.hidden = false;
        };

        quizDiv.appendChild(fieldset);
        return quizDiv;
    }
}

// --- Popup Factory ---

/**
 * Creates a generic popup element.
 * @param {string} type - 'acerto', 'erro', 'concluido', 'vidas'.
 * @param {object} [options={}] - Optional data for the popup.
 * @param {string} [options.respostaCorreta] - The correct answer (for 'erro' type).
 * @returns {HTMLElement} - The popup element.
 */
function createPopup(type, options = {}) {
    const popUp = document.createElement("div");
    popUp.classList.add("popUp", `popUp-${type}`); // Add type-specific class

    let content = '';
    let buttonText = "Continuar";
    let eventToDispatch = PROXIMA_ETAPA;

    switch (type) {
        case 'acerto':
            content = `<p>Você Acertou! ✅</p>`;
            break;
        case 'erro':
            content = `
                <p>Incorreto! ❌</p>
                ${options.respostaCorreta ? `<p>Resposta correta: ${options.respostaCorreta}</p>` : ''}
            `;
            break;
        case 'concluido':
            content = `<p>🎉 Lição Concluída! 🎉</p>`;
            // Optional: Change button or behavior on completion
             buttonText = "Finalizar";
            // eventToDispatch = LICAO_FINALIZADA; // Example custom event
            break;
        case 'vidas': // Example if lives were implemented
            content = `<p>💔 Vidas esgotadas! 💔</p>`;
            buttonText = "Tentar Novamente";
             // eventToDispatch = REINICIAR_JOGO; // Example custom event
            break;
        default:
            content = `<p>Aviso</p>`; // Default case
    }

    popUp.innerHTML = content;

    const botaoContinuar = document.createElement("button");
    botaoContinuar.classList.add("botao-popup");
    botaoContinuar.innerText = buttonText;
    botaoContinuar.onclick = () => window.dispatchEvent(new CustomEvent(eventToDispatch));

    popUp.appendChild(botaoContinuar);
    return popUp;
}


// --- Controller Class ---

class Controlador {
    /**
     * Manages the flow of stages (Explanacao, Quiz).
     * @param {string} elementoPaiId - The ID of the HTML element to attach the controller to.
     * @param {Array<Explanacao|Quiz>} etapas - An array of stage instances.
     */
    constructor(elementoPaiId, etapas) {
        this.elementoPai = document.getElementById(elementoPaiId);
        if (!this.elementoPai) {
            throw new Error(`Elemento pai com ID "${elementoPaiId}" não encontrado.`);
        }

        this.etapas = [...etapas];
        this.totalEtapas = etapas.length;
        this.acertos = 0;
        this.numeroEtapaAtual = 0;
        this.etapaAtualInstance = null;

        this.containerElement = null;
        this.iuContainer = null;
        this.etapaContainer = null;
        this.vidasSpan = null;
        this.progressBar = null;

        this.handleRespostaCerta = this.handleRespostaCerta.bind(this);
        this.handleRespostaErrada = this.handleRespostaErrada.bind(this);
        this.handleProximaEtapa = this.handleProximaEtapa.bind(this);
        this.handleExplanacaoLida = this.handleExplanacaoLida.bind(this);
    }

    iniciar() {
        if (!this.elementoPai) return;

        this.containerElement = document.createElement('div');
        this.containerElement.classList.add("controlador-jogo");

        this.iuContainer = document.createElement('div');
        this.iuContainer.classList.add("iu-jogo");

        this.vidasSpan = document.createElement("span");
        this.vidasSpan.classList.add("iu-acertos");

        this.progressBar = document.createElement("progress");
        this.progressBar.classList.add("iu-progresso");
        this.progressBar.max = this.totalEtapas;
        this.progressBar.value = 0;

        this.iuContainer.appendChild(this.vidasSpan);
        this.iuContainer.appendChild(this.progressBar);

        this.etapaContainer = document.createElement('div');
        this.etapaContainer.classList.add("etapa-container");

        this.containerElement.appendChild(this.iuContainer);
        this.containerElement.appendChild(this.etapaContainer);


        this.elementoPai.innerHTML = '';
        this.elementoPai.appendChild(this.containerElement);


        window.addEventListener(RESPOSTA_CERTA, this.handleRespostaCerta);
        window.addEventListener(RESPOSTA_ERRADA, this.handleRespostaErrada);
        window.addEventListener(PROXIMA_ETAPA, this.handleProximaEtapa);
        window.addEventListener(EXPLANACAO_LIDA, this.handleExplanacaoLida);

        // --- Start First Stage ---
        this.numeroEtapaAtual = 0;
        this.atualizarInfoUI();
        this.exibirEtapaAtual();
    }

    atualizarInfoUI() {
        if (this.vidasSpan) {
            this.vidasSpan.innerText = `${this.acertos} Acerto(s)`;
        }
        if (this.progressBar) {
            // Progress reflects completed stages
            this.progressBar.value = this.numeroEtapaAtual;
             // Optional: Update progress bar text label if needed
             // this.progressBar.textContent = `Etapa ${this.numeroEtapaAtual + 1} de ${this.totalEtapas}`;
        }
         console.log(`UI Updated: Stage ${this.numeroEtapaAtual + 1}/${this.totalEtapas}, Score ${this.acertos}`);
    }

    exibirEtapaAtual() {
        this.limparConteudoEtapa(); // Clear previous stage and popups

        if (this.numeroEtapaAtual < this.totalEtapas) {
            this.etapaAtualInstance = this.etapas[this.numeroEtapaAtual];
            if (this.etapaAtualInstance && typeof this.etapaAtualInstance.render === 'function') {
                 const etapaElement = this.etapaAtualInstance.render();
                 this.etapaContainer.appendChild(etapaElement);
            } else {
                console.error(`Etapa ${this.numeroEtapaAtual} is invalid or has no render method.`);
                 // Maybe show an error message or skip the stage
                 this.avancarParaProximaEtapaLogica(); // Skip broken stage
            }
        } else {
            // All stages completed
            this.exibirPopup('concluido');
        }
        this.atualizarInfoUI(); // Update progress after showing new stage
    }

    avancarParaProximaEtapaLogica(){
         this.numeroEtapaAtual++; // Increment stage counter FIRST
         this.exibirEtapaAtual();   // Then display the new stage (or completion message)
    }

    handleProximaEtapa() {
         console.log("Received proximaEtapa event");
         this.avancarParaProximaEtapaLogica();
    }

    handleRespostaCerta() {
        console.log("Handling Correct Answer");
        this.acertos++;
        // Don't increment numeroEtapaAtual here, proximaEtapa handles progression
        this.atualizarInfoUI();
        this.exibirPopup('acerto');
    }

    handleRespostaErrada() {
        console.log("Handling Incorrect Answer");
        // Don't increment numeroEtapaAtual here, proximaEtapa handles progression
        this.atualizarInfoUI(); // Update score (if lives were deducted, etc.)
        let respostaCorreta = '';
         // Ensure we have a Quiz instance with a 'resposta' property
        if (this.etapaAtualInstance instanceof Quiz && this.etapaAtualInstance.resposta) {
             respostaCorreta = this.etapaAtualInstance.resposta;
        }
        this.exibirPopup('erro', { respostaCorreta });
    }

    handleExplanacaoLida() {
         console.log("Handling Explanacao Read");
         // Directly trigger moving to the next stage after explanation
         this.avancarParaProximaEtapaLogica();
    }

    exibirPopup(type, options = {}) {
        this.limparPopups(); // Remove any existing popups first
        const popUpElement = createPopup(type, options);
        // Append to etapaContainer or controller main container based on desired layering
        this.etapaContainer.appendChild(popUpElement);
    }

    limparConteudoEtapa() {
        if (this.etapaContainer) {
            this.etapaContainer.innerHTML = ''; // Clear stage content and any popups
        }
    }

    limparPopups() {
         const popUps = this.etapaContainer?.querySelectorAll(".popUp");
         popUps?.forEach(popup => popup.remove());
    }

    destroy() {
         console.log("Destroying Controlador and removing listeners.");
         window.removeEventListener(RESPOSTA_CERTA, this.handleRespostaCerta);
         window.removeEventListener(RESPOSTA_ERRADA, this.handleRespostaErrada);
         window.removeEventListener(PROXIMA_ETAPA, this.handleProximaEtapa);
         window.removeEventListener(EXPLANACAO_LIDA, this.handleExplanacaoLida);

         if (this.elementoPai) {
             this.elementoPai.innerHTML = '';
         }

         this.elementoPai = null;
         this.etapas = [];
         this.containerElement = null;
         this.iuContainer = null;
         this.etapaContainer = null;
         this.vidasSpan = null;
         this.progressBar = null;
         this.etapaAtualInstance = null;
    }
}
