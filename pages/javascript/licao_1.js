function executarInstrucao(){
    const audio = new Audio("media/audio/instrucoes/luvvoice.com-20250317-JA8rT4.mp3");
    audio.play();
}

function executarSom(letra){
    let audio;

    switch(letra){
        case "A":
            audio = new Audio("media/audio/fonemas/vogais/a.mp3");
            break;
        case "E":
            audio = new Audio("media/audio/fonemas/vogais/e.mp3");
            break;
        case "I":
            audio = new Audio("media/audio/fonemas/vogais/i.mp3");
            break;
        case "O":
            audio = new Audio("media/audio/fonemas/vogais/o.mp3");
            break;
        case "U":
            audio = new Audio("media/audio/fonemas/vogais/u.mp3");
            break;    
    }

    if (audio) audio.play();
}