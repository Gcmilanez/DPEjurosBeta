// Referenciando os elementos principais
let MODALIDADE = document.getElementById('ip_modalidade');
let DATA_EMPRESTIMO = document.getElementById('ip_data');
let submitButton = document.getElementById('submit');
let TAXA_MENSAL_CONTRATUAL = document.getElementById('ip_taxa_mensal_contratual');
let TAXA_ANUAL_CONTRATUAL = document.getElementById('ip_taxa_anual_contratual');
let TAXA_MENSAL_BACEN = document.getElementById('ip_taxa_mensal_bacen');
let TAXA_ANUAL_BACEN = document.getElementById('ip_taxa_anual_bacen');
let TAXA_ANUAL_BACEN_LIMIT50 = document.getElementById('ip_taxa_anual_bacen_limit50');
let TAXA_MENSAL_BACEN_LIMIT50 = document.getElementById('ip_taxa_mensal_bacen_limit50');
let TAXA_ANUAL_BACEN_LIMIT20 = document.getElementById('ip_taxa_anual_bacen_limit20');
let TAXA_MENSAL_BACEN_LIMIT20 = document.getElementById('ip_taxa_mensal_bacen_limit20');
let CONCLUS = document.getElementById('conclus');
let TLDR = document.getElementById('tldr');

// Variavel para guardar informação do banco
let data = '';

// Adicionando event listeners para as mudanças de modalidade e data
MODALIDADE.addEventListener('input', (event) => {
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

DATA_EMPRESTIMO.addEventListener('input', (event) => {
    if (MODALIDADE.value != 'nihil'){
        get_taxa(event, data);
        compararTaxas();
    }
});

DATA_EMPRESTIMO.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Evita comportamento padrão (como envio de formulário)
        this.blur(); // Força o disparo do evento blur
    }
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
    if (event.key === 'Enter') {
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

    if (!DATA_EMPRESTIMO.value){
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
    document.getElementById('tldr').innerText = '';
}

// Função para calcular as taxas
function get_taxa(event, data){
    resetTaxa();
    if(data){
        data_para_busca = `${DATA_EMPRESTIMO.value}-01`.split('-');
        data_para_busca = new Date(data_para_busca[0], data_para_busca[1] - 1, data_para_busca[2]).toLocaleDateString('pt-BR');
        let filtered_data = data.filter(row => row.data === data_para_busca)[0];
         
        if(filtered_data.valor){
            // Atualizando os campos de taxas médias e limites
            const valorTaxaMensal = filtered_data.valor;
            TAXA_MENSAL_BACEN.value = valorTaxaMensal;
            TAXA_ANUAL_BACEN.value = calcularTaxaAnualContratual(valorTaxaMensal);
            
            // Cálculo dos limites de 50% e 30%
            TAXA_MENSAL_BACEN_LIMIT50.value = (valorTaxaMensal * 1.5).toFixed(2);
            TAXA_ANUAL_BACEN_LIMIT50.value = calcularTaxaAnualContratual(TAXA_MENSAL_BACEN_LIMIT50.value);
            
            TAXA_MENSAL_BACEN_LIMIT20.value = (valorTaxaMensal * 1.2).toFixed(2);
            TAXA_ANUAL_BACEN_LIMIT20.value = calcularTaxaAnualContratual(TAXA_MENSAL_BACEN_LIMIT20.value);
        }else{
            alert("Data não encontrada.")
        }
    }
}

// Função para mudar a modalidade
async function mudar_modalidade(event) {
    resetTaxa();;
    // Verifica se a modalidade é 25463 ou 25477, exibe as mensagens e bloqueia a comparação de taxas
    if (MODALIDADE.value === "25463" || MODALIDADE.value === "25477") {

        document.getElementById('conclus').innerHTML = `Infelizmente, os cálculos envolvendo cartão de crédito rotativo e cheque especial costumam envolver maior complexidade, conforme o número de meses em que o consumidor permaneceu em débito com a instituição financeira, de forma que não é possível fazê-lo estaticamente, isto é, pensando apenas nos juros do momento em que a pessoa não pagou a fatura ou entrou no cheque especial. Assim, esta ferramenta não serve para a funcionalidade desejada, sendo aconselhável procurar assistência jurídica para analisar a viabilidade de ação revisional.`;
        document.getElementById('tldr').innerText = `DESCULPE, ESTA FERRAMENTA AINDA NÃO SERVE PARA ISSO.`;
        return;

    } 


    if (MODALIDADE.value != 'nihil'){
        try {
            response = await fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${MODALIDADE.value}/dados?formato=json`);
            data = await response.json();
            if (DATA_EMPRESTIMO.value){
                get_taxa(event, data);
                if(TAXA_MENSAL_CONTRATUAL.value){
                    compararTaxas();
                    }
            }

        }catch (err) {
            alert(`Erro ao buscar dados da modalidade: ${err.message}`);
        }
    }
}

// Função para comparar taxas
function compararTaxas() {
    
    if (MODALIDADE === "nihil" || MODALIDADE === "25463" || MODALIDADE === "25477") {
        console.log("A função compararTaxas foi bloqueada para a modalidade 'nihil' ou séries proibidas.");
        return;  // Sai da função sem fazer nada
    }


    const taxaMensalContratual = parseFloatSeparator(TAXA_MENSAL_CONTRATUAL.value);
    const taxaMensalBacen = parseFloatSeparator(TAXA_MENSAL_BACEN.value);
    const taxaMensalBacenLimit50 = (taxaMensalBacen * 1.5).toFixed(2);
    const taxaMensalBacenLimit20 = (taxaMensalBacen * 1.2).toFixed(2);

    if ((isNaN(taxaMensalContratual) || isNaN(taxaMensalBacen)) && taxaMensalContratual < 0.0) {
        CONCLUS.value = 'Por favor, insira valores válidos para as taxas.';
        TLDR.value = '';
        return;
    }


    // Se possui uma taxa contratual valida
    if (taxaMensalContratual && taxaMensalBacen){
        if(taxaMensalContratual > taxaMensalBacenLimit50) {
            CONCLUS.innerHTML = `Veja-se que a taxa de juros contratual (${formatarNumeroComVirgula(taxaMensalContratual)}% a.m.) é superior a ${formatarNumeroComVirgula(taxaMensalBacenLimit50)}% a.m., valor equivalente a 1,5x (uma vez e meia) o valor da taxa média de juros para o período da contratação, conforme apurado pelo BACEN (${formatarNumeroComVirgula(taxaMensalBacen)}%). Assim, é manifesta a abusividade dos juros praticados e é sugerido buscar atendimento para ação revisional, conforme entendimento jurisprudencial predominante sobre o tema, ao menos na Justiça Gaúcha.`;
            TLDR.value = 'SIM, OS JUROS CONTRATUAIS DO SEU CONTRATO TEM ABUSIVIDADE PATENTE';
        } else if (taxaMensalContratual > taxaMensalBacenLimit20 && taxaMensalContratual <= taxaMensalBacenLimit50) {
            CONCLUS.innerHTML = `Verifica-se que os juros contratuais (${formatarNumeroComVirgula(taxaMensalContratual)}% a.m.) são superiores a ${formatarNumeroComVirgula(taxaMensalBacenLimit20)}% a.m., equivalentes a uma margem tolerável hipotética de 20% sobre a taxa média de juros apurada pelo BACEN (${formatarNumeroComVirgula(taxaMensalBacen)}% a.m.). A margem de 20% vem sendo adotada adotada por uma parte ainda pequena de desembargadores com entendimentos mais benevolentes ao consumidor, mas repare que a taxa contratada não é superior à margem de 50% (que seria de ${formatarNumeroComVirgula(taxaMensalBacenLimit50)}% a.m.), acima da qual haveria mais clareza para falar em abusividade, conforme jurisprudência dominante. A constatação de abusividade entre as margens 20% a 50% acima da taxa média fica, assim, bastante dependente da oscilação jurisprudencial e do próprio acaso quanto aos julgadores que apreciarão o caso. É melhor procurar atendimento jurídico para ver se há outros fatores locais ou pessoais relevantes à defesa jurídica.`;
            TLDR.value = 'DEPENDE... A CONSTATAÇÃO DA ABUSIVIDADE ESTÁ NUMA ZONA CINZENTA DE VARIAÇÃO JURISPRUDENCIAL';
        } else if (taxaMensalContratual <= taxaMensalBacenLimit20 && taxaMensalContratual >= taxaMensalBacen) {
            CONCLUS.innerHTML = `Verifica-se que a taxa contratual (${formatarNumeroComVirgula(taxaMensalContratual)}% a.m.) até é superior à taxa média apurada pelo BACEN (${formatarNumeroComVirgula(taxaMensalBacen)}% a.m.), porém sem sequer exceder a margem tolerável de 20% (equivalente a ${formatarNumeroComVirgula(taxaMensalBacenLimit20)}% a.m.), correspondente aos entendimentos mais benéficos ao consumidor havidos pelos desembargadores atualmente, pelo que há imensa chance de simplesmente não ser considerada abusiva, conforme entendimento jurisprudencial predominante sobre o que não é abusivo. Portanto, se não houver outras situações jurídicas complicadas (contratação fraudulenta, diferença entre os juros contratuais e os juros praticados), fique atento à ação de golpistas que prometam soluções milagrosas envolvendo revisão de juros.`;
            TLDR.value = 'MUITO PROVAVELMENTE VAI SER DIFÍCIL CONSEGUIR ALEGAR JUROS ABUSIVOS NO SEU CONTRATO.';
        } else if (taxaMensalContratual < taxaMensalBacen) {
            CONCLUS.innerHTML = `Verifica-se que a taxa mensal contratual praticada (${formatarNumeroComVirgula(taxaMensalContratual)}% a.m.) chega a ser inclusive INFERIOR à taxa média do BACEN para idêntico produto financeiro (${formatarNumeroComVirgula(taxaMensalBacen)}% a.m.). Ou seja, não há qualquer possibilidade de se considerarem abusivos os juros que constam do contrato. Portanto, se não houver outras situações jurídicas complicadas (contratação fraudulenta, diferença entre os juros contratuais e os juros praticados), fique atento à ação de golpistas que prometam soluções milagrosas envolvendo revisão de juros.`;
            TLDR.value = 'NÃO, NÃO HÁ JUROS ABUSIVOS NO SEU CONTRATO. NÃO MESMO!';
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

function calcularTaxaAnualContratual(taxaMensal) {
    if (isNaN(taxaMensal)) {
        alert('Por favor, insira um valor válido para a taxa mensal contratual.');
        return '';
    }
    return ((((1 + (taxaMensal / 100)) ** 12) - 1) * 100).toFixed(2);
}