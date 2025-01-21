// Referenciando os elementos principais
let MODALIDADE = document.getElementById('ip_modalidade');
let ANO_EMPRESTIMO = document.getElementById('ip_ano')
let MES_EMPRESTIMO = document.getElementById('ip_mes')
let TAXA_MENSAL_CONTRATUAL = document.getElementById('ip_taxa_mensal_contratual');
let TAXA_ANUAL_CONTRATUAL = document.getElementById('ip_taxa_anual_contratual');
let TAXA_MENSAL_BACEN = document.getElementById('ip_taxa_mensal_bacen');
let TAXA_ANUAL_BACEN = document.getElementById('ip_taxa_anual_bacen');
let TAXA_ANUAL_BACEN_LIMIT50 = document.getElementById('ip_taxa_anual_bacen_limit50');
let TAXA_MENSAL_BACEN_LIMIT50 = document.getElementById('ip_taxa_mensal_bacen_limit50');
let TAXA_ANUAL_BACEN_LIMIT20 = document.getElementById('ip_taxa_anual_bacen_limit20');
let TAXA_MENSAL_BACEN_LIMIT20 = document.getElementById('ip_taxa_mensal_bacen_limit20');


let CONCLUS = '';
let TLDR = '';

// Variavel para guardar informação do banco
let data = '';

// Adicionando event listeners para as mudanças de modalidade e data
MODALIDADE.addEventListener('change', (event) => {
    MODALIDADE.blur();
});

MODALIDADE.addEventListener('blur', (event) => {
    mudar_modalidade(event);
});

MODALIDADE.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Evita comportamento padrão (como envio de formulário)
        this.blur(); // Força o disparo do evento blur
    }
});


ANO_EMPRESTIMO.addEventListener('change', (event) => {
    verificarEChamarGetTaxa(event)
});


MES_EMPRESTIMO.addEventListener('change', (event) => {
    verificarEChamarGetTaxa(event)
});


ANO_EMPRESTIMO.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === 'Tab'){
        ANO_EMPRESTIMO.blur(); // Força o disparo do evento blur
        }
});

ANO_EMPRESTIMO.addEventListener('blur', function(event) {
        if (this.value.length < 4) {
            this.style.borderColor = 'red'; // Deixa a borda vermelha
        } else {
            this.style.borderColor = 'black';
            verificarEChamarGetTaxa(event);
        }
        
});

MES_EMPRESTIMO.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === 'Tab'){
        MES_EMPRESTIMO.blur(); // Força o disparo do evento blur
        }
});

MES_EMPRESTIMO.addEventListener('blur', function(event) {
    if (this.value.length == 1) {
        this.value = '0' + this.value[0];
    }
    verificarEChamarGetTaxa(event);
});



MES_EMPRESTIMO.addEventListener("input", function () {
    let valor = parseInt(this.value, 10);
    if (isNaN(valor)) return;
    
    if (valor < 1) this.value = 1;
    if (valor > 12) this.value = 12;
});

document.getElementById('ip_cpf').addEventListener('input', function() {
    let valor = this.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos

    // Aplica a máscara CPF no formato 000.000.000-00
    if (valor.length <= 11) {
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    this.value = valor; // Atualiza o valor do campo com a máscara
});

document.getElementById('ip_cpf').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === 'Tab') {
        this.blur(); // Força o disparo do evento blur
    }
});

document.getElementById('ip_assistido').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        this.blur(); // Força o disparo do evento blur
    }
});

document.getElementById('ip_refcontrato').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        this.blur(); // Força o disparo do evento blur
    }
});


// Evento DOMContentLoaded para garantir que os elementos estão carregados
document.addEventListener('DOMContentLoaded', () => {
    // Dispara a função compararTaxas ao mudar o valor ou ao perder o foco no campo de taxa contratual
    if (TAXA_MENSAL_CONTRATUAL) {
        // Evento blur (saída do campo)
        TAXA_MENSAL_CONTRATUAL.addEventListener('blur', (event) => {
            let taxaMensal = parseFloatSeparator(TAXA_MENSAL_CONTRATUAL.value);
            if (taxaMensal < 0) {
                taxaMensal = 0; // Ajusta o valor para 0 se for inválido
            }

            TAXA_MENSAL_CONTRATUAL.value = taxaMensal; // Atualiza o valor no campo
            let taxaAnual = calcularTaxaAnualContratual(taxaMensal);
            TAXA_ANUAL_CONTRATUAL.value = taxaAnual; // Atualiza o valor da taxa anual
            compararTaxas();
        });

        // Evento keydown para capturar Enter
        TAXA_MENSAL_CONTRATUAL.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Evita comportamento padrão (como envio de formulário)
                this.blur(); // Força o disparo do evento blur
            }
        });

        // Função de evitar enter para imprimir
        submitButton.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Evita que o formulário seja enviado ao pressionar Enter
            }
        });

    };
});

// Função para imprimir o pdf
function imprimirSemReiniciar(event) {
    if (MODALIDADE.value == 'nihil'){
        alert('Insira uma modalidade.');
        event.preventDefault(); // Evita o comportamento padrão do botão (reiniciar o formulário)
        return;  
    }

    if (!ANO_EMPRESTIMO.value || !MES_EMPRESTIMO.value){
        alert('Insira uma data.');
        event.preventDefault(); // Evita o comportamento padrão do botão (reiniciar o formulário)
        return;
    }

    if(document.getElementById('ip_taxa_mensal_contratual').value.trim() == ''){
        alert('Insira uma taxa contratual');
        event.preventDefault(); // Evita o comportamento padrão do botão (reiniciar o formulário)
        return;
    }

    event.preventDefault(); // Evita o comportamento padrão do botão (reiniciar o formulário)
    window.print(); // Aciona a impressão
}

// Função para reiniciar as taxas
function resetTaxa(){
    // reinicia o texto caso a modalidade seja alterada
    TAXA_MENSAL_BACEN.value = "";
    TAXA_ANUAL_BACEN.value = "";
    TAXA_ANUAL_BACEN_LIMIT50.value = "";
    TAXA_MENSAL_BACEN_LIMIT50.value = "";
    TAXA_ANUAL_BACEN_LIMIT20.value = "";
    TAXA_MENSAL_BACEN_LIMIT20.value = "";
    document.getElementById('conclus').innerHTML = '';
    document.getElementById('tldr').value = '';
    
}

// Função para calcular as taxas
function get_taxa(event, data){
    resetTaxa();

    // Se a api do banco retornar uma data válida, faz a pesquisa através da data
    if(data && ANO_EMPRESTIMO.value.length == 4){
        data_para_busca = `${ANO_EMPRESTIMO.value}-${MES_EMPRESTIMO.value}`;
        data_para_busca = `${data_para_busca}-01`.split('-');
        data_para_busca = new Date(data_para_busca[0], data_para_busca[1] - 1, data_para_busca[2]).toLocaleDateString('pt-BR');
        let filtered_data = data.filter(row => row.data === data_para_busca)[0];;

        if(filtered_data){
                // Atualizando os campos de taxas médias e limites
                const valorTaxaMensal = filtered_data.valor;
                TAXA_MENSAL_BACEN.value = valorTaxaMensal;
                TAXA_ANUAL_BACEN.value = calcularTaxaAnualContratual(valorTaxaMensal);
                
                // Cálculo dos limites de 50% e 30%
                TAXA_MENSAL_BACEN_LIMIT50.value = (valorTaxaMensal * 1.5).toFixed(2);
                TAXA_ANUAL_BACEN_LIMIT50.value = calcularTaxaAnualContratual(TAXA_MENSAL_BACEN_LIMIT50.value);
                
                TAXA_MENSAL_BACEN_LIMIT20.value = (valorTaxaMensal * 1.2).toFixed(2);
                TAXA_ANUAL_BACEN_LIMIT20.value = calcularTaxaAnualContratual(TAXA_MENSAL_BACEN_LIMIT20.value);
        }
    }
}

// Função para mudar a modalidade
async function mudar_modalidade(event) {
    data = '';
    resetTaxa();
    // Verifica se a modalidade é 25463 ou 25477, exibe as mensagens e bloqueia a comparação de taxas
    if (MODALIDADE.value === "25463" || MODALIDADE.value === "25477") {

        CONCLUS = `Infelizmente, os cálculos envolvendo cartão de crédito rotativo e cheque especial costumam envolver maior complexidade, conforme o número de meses em que o consumidor permaneceu em débito com a instituição financeira, de forma que não é possível fazê-lo estaticamente, isto é, pensando apenas nos juros do momento em que a pessoa não pagou a fatura ou entrou no cheque especial. Assim, esta ferramenta não serve para a funcionalidade desejada, sendo aconselhável procurar assistência jurídica para analisar a viabilidade de ação revisional.`;
        TLDR = `DESCULPE, ESTA FERRAMENTA AINDA NÃO SERVE PARA ISSO.`;
        return;

    } 

    // Se é uma modalidade válida, faz a busca dos dados atraves da api do bcb
    if (MODALIDADE.value != 'nihil'){
        try {
            response = await fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${MODALIDADE.value}/dados?formato=json`);
            data = await response.json();
        }catch (err) {
            alert(`Dados não encontrados no SGS-BACEN: ${err}`);
        }
        verificarEChamarGetTaxa(event);
    }
}

function verificarEChamarGetTaxa(event) {
    if (ANO_EMPRESTIMO.value && MES_EMPRESTIMO.value && data) {
        console.log("Todos os dados estão preenchidos. Chamando get_taxa...");
        get_taxa(event, data);
        compararTaxas();
    }
}

// Função para comparar taxas
function compararTaxas() {
    
    if (MODALIDADE === "nihil" || MODALIDADE === "25463" || MODALIDADE === "25477") {
        console.log("A função compararTaxas foi bloqueada para a modalidade 'nihil' ou séries proibidas.");
        return;  // Sai da função sem fazer nada
    }

    // Formata as taxas 
    const taxaMensalContratual = parseFloatSeparator(TAXA_MENSAL_CONTRATUAL.value);
    const taxaMensalBacen = parseFloatSeparator(TAXA_MENSAL_BACEN.value);
    const taxaMensalBacenLimit50 = (taxaMensalBacen * 1.5).toFixed(2);
    const taxaMensalBacenLimit20 = (taxaMensalBacen * 1.2).toFixed(2);

    // Caso os valores forem inválidos, retorna
    if ((isNaN(taxaMensalContratual) || isNaN(taxaMensalBacen)) && taxaMensalContratual < 0.0) {
        return;
    }


    // Se possui uma taxa contratual valida gera a conclusao
    if (taxaMensalContratual && taxaMensalBacen){
        if(taxaMensalContratual > taxaMensalBacenLimit50) {
            CONCLUS = `Veja-se que a taxa de juros contratual (${formatarNumeroComVirgula(taxaMensalContratual)}% a.m.) é superior a ${formatarNumeroComVirgula(taxaMensalBacenLimit50)}% a.m., valor equivalente a 1,5x (uma vez e meia) o valor da taxa média de juros para o período da contratação, conforme apurado pelo BACEN (${formatarNumeroComVirgula(taxaMensalBacen)}%). Assim, é manifesta a abusividade dos juros praticados e é sugerido buscar atendimento para ação revisional, conforme entendimento jurisprudencial predominante sobre o tema, ao menos na Justiça Gaúcha.`;
            TLDR= 'SIM, OS JUROS CONTRATUAIS DO SEU CONTRATO TEM ABUSIVIDADE PATENTE';
        } else if (taxaMensalContratual > taxaMensalBacenLimit20 && taxaMensalContratual <= taxaMensalBacenLimit50) {
            CONCLUS = `Verifica-se que os juros contratuais (${formatarNumeroComVirgula(taxaMensalContratual)}% a.m.) são superiores a ${formatarNumeroComVirgula(taxaMensalBacenLimit20)}% a.m., equivalentes a uma margem tolerável hipotética de 20% sobre a taxa média de juros apurada pelo BACEN (${formatarNumeroComVirgula(taxaMensalBacen)}% a.m.). A margem de 20% vem sendo adotada adotada por uma parte ainda pequena de desembargadores com entendimentos mais benevolentes ao consumidor, mas repare que a taxa contratada não é superior à margem de 50% (que seria de ${formatarNumeroComVirgula(taxaMensalBacenLimit50)}% a.m.), acima da qual haveria mais clareza para falar em abusividade, conforme jurisprudência dominante. A constatação de abusividade entre as margens 20% a 50% acima da taxa média fica, assim, bastante dependente da oscilação jurisprudencial e do próprio acaso quanto aos julgadores que apreciarão o caso. É melhor procurar atendimento jurídico para ver se há outros fatores locais ou pessoais relevantes à defesa jurídica.`;
            TLDR = 'DEPENDE... A CONSTATAÇÃO DA ABUSIVIDADE ESTÁ NUMA ZONA CINZENTA DE VARIAÇÃO JURISPRUDENCIAL';
        } else if (taxaMensalContratual <= taxaMensalBacenLimit20 && taxaMensalContratual >= taxaMensalBacen) {
            CONCLUS = `Verifica-se que a taxa contratual (${formatarNumeroComVirgula(taxaMensalContratual)}% a.m.) até é superior à taxa média apurada pelo BACEN (${formatarNumeroComVirgula(taxaMensalBacen)}% a.m.), porém sem sequer exceder a margem tolerável de 20% (equivalente a ${formatarNumeroComVirgula(taxaMensalBacenLimit20)}% a.m.), correspondente aos entendimentos mais benéficos ao consumidor havidos pelos desembargadores atualmente, pelo que há imensa chance de simplesmente não ser considerada abusiva, conforme entendimento jurisprudencial predominante sobre o que não é abusivo. Portanto, se não houver outras situações jurídicas complicadas (contratação fraudulenta, diferença entre os juros contratuais e os juros praticados), fique atento à ação de golpistas que prometam soluções milagrosas envolvendo revisão de juros.`;
            TLDR = 'MUITO PROVAVELMENTE VAI SER DIFÍCIL CONSEGUIR ALEGAR JUROS ABUSIVOS NO SEU CONTRATO.';
        } else if (taxaMensalContratual < taxaMensalBacen) {
            CONCLUS = `Verifica-se que a taxa mensal contratual praticada (${formatarNumeroComVirgula(taxaMensalContratual)}% a.m.) chega a ser inclusive INFERIOR à taxa média do BACEN para idêntico produto financeiro (${formatarNumeroComVirgula(taxaMensalBacen)}% a.m.). Ou seja, não há qualquer possibilidade de se considerarem abusivos os juros que constam do contrato. Portanto, se não houver outras situações jurídicas complicadas (contratação fraudulenta, diferença entre os juros contratuais e os juros praticados), fique atento à ação de golpistas que prometam soluções milagrosas envolvendo revisão de juros.`;
            TLDR = 'NÃO, NÃO HÁ JUROS ABUSIVOS NO SEU CONTRATO. NÃO MESMO!';
        }
    }
}

function getResposta() {
    if (CONCLUS){

        makeFieldsImmutable();
        document.getElementById('conclus').innerHTML = CONCLUS;
        document.getElementById('tldr').innerText = TLDR;
        const conclusaoButton = document.getElementById('botao_conclusao');

        // Cria o primeiro botão
        const botao_alterar = document.createElement('button');
        botao_alterar.textContent = 'ALTERAR DADOS';
        botao_alterar.className = 'submit no-print';
        
        // se o botao de de alterar dados for pressionado, retorna os campos mutáveis e o botão de gerar conclusao
        botao_alterar.onclick = () => {
            makeFieldsMutable();
            document.getElementById('conclus').innerHTML = '';
            document.getElementById('tldr').innerText = '';
            event.preventDefault();
            botao_alterar.remove();
            botao_imprimir.remove();

            // Verifica se o botão já foi adicionado de volta
            if (document.getElementById('botao_conclusao')) 
                return;

            // Cria o botão novamente
            const button = document.createElement('button');
            button.id = 'botao_conclusao';
            button.type = 'button';
            button.className = 'submit no-print';
            button.textContent = 'GERAR CONCLUSÃO';
            button.setAttribute('onclick', 'getResposta()');

            // Adiciona o botão ao final do formulário ou onde for necessário
            const form = document.querySelector('form fieldset');
            if (form) {
                form.appendChild(button);
            }
        }
        // Cria o segundo botão
        const botao_imprimir = document.createElement('button');
        botao_imprimir.textContent = 'IMPRIMIR';
        botao_imprimir.className = 'submit no-print';
        botao_imprimir.onclick = () => imprimirSemReiniciar(event);
    
        // Insere os botões após o botão de conclusão
        conclusaoButton.insertAdjacentElement('afterend', botao_alterar);
        botao_alterar.insertAdjacentElement('afterend', botao_imprimir);
        conclusaoButton.remove();
    }else{
        // Verifica qual dos campos não foi inserido
        if (MODALIDADE.value == 'nihil'){
            alert('Insira uma modalidade.');
            return;  
        }
    
        if (!ANO_EMPRESTIMO.value || !MES_EMPRESTIMO.value){
            alert('Insira uma data.');
            return;
        }
    
        if(document.getElementById('ip_taxa_mensal_contratual').value.trim() == ''){
            alert('Insira uma taxa contratual');
            return;
        }
    }
}


// Função auxiliar para formatar números
function formatarNumeroComVirgula(numero) {
    return numero.toString().replace('.', ',');
}

// Função auxiliar para converter strings numéricas com separador de milhar
function parseFloatSeparator(str) {
    if (!str) {
        return 0;
    }
    str = str.replace(',', '.');
    return (parseFloat(str));
}

// Função para calcular taxa anual
function calcularTaxaAnualContratual(taxaMensal) {
    if (isNaN(taxaMensal)) {
        alert('Por favor, insira um valor válido para a taxa mensal contratual.');
        return '';
    }
    return ((((1 + (taxaMensal / 100)) ** 12) - 1) * 100).toFixed(2);
}

// Função para tornar todos os campos imutaveis
function makeFieldsImmutable() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.setAttribute('disabled', true);
    });
}

// Função para tornar todos os campos mutaveis
function makeFieldsMutable() {
    const inputs = document.querySelectorAll('change, input, select, textarea');
    inputs.forEach(input => {
        if (input.dataset.previousValue !== undefined) {
            input.value = input.dataset.previousValue; 
        }
        input.removeAttribute('disabled');
    });
    return;
}