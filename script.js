document.addEventListener('DOMContentLoaded', function () {
    const resolverBtn = document.getElementById('resolverBtn');
    const labirintoInput = document.getElementById('labirinto');
    const resultadoDiv = document.getElementById('resultado');

    resolverBtn.addEventListener('click', function () {
        try {
            // Obter o valor do textarea e limpar possíveis problemas de formatação
            let inputText = labirintoInput.value.trim();

            // Substituir aspas simples por aspas duplas para JSON válido
            inputText = inputText.replace(/'/g, '"');

            // Converter a entrada de texto para uma matriz JavaScript
            const labirinto = JSON.parse(inputText);

            // Validar o labirinto
            if (!Array.isArray(labirinto)) {
                throw new Error("A entrada deve ser uma matriz (array).");
            }

            if (labirinto.length === 0) {
                throw new Error("O labirinto não pode estar vazio.");
            }

            // Verificar se todas as linhas são arrays
            for (let i = 0; i < labirinto.length; i++) {
                if (!Array.isArray(labirinto[i])) {
                    throw new Error(`A linha ${i + 1} não é uma matriz válida.`);
                }
            }

            // Encontrar a posição inicial (S) e final (E)
            let inicio = null;
            let fim = null;

            for (let i = 0; i < labirinto.length; i++) {
                for (let j = 0; j < labirinto[i].length; j++) {
                    if (labirinto[i][j] === 'S') {
                        inicio = [i, j];
                    } else if (labirinto[i][j] === 'E') {
                        fim = [i, j];
                    }
                }
            }

            if (!inicio) {
                throw new Error("Não foi encontrado o ponto de início 'S' no labirinto.");
            }

            if (!fim) {
                throw new Error("Não foi encontrado o ponto de saída 'E' no labirinto.");
            }

            // Resolver o labirinto usando BFS (Breadth-First Search)
            const caminho = encontrarCaminho(labirinto, inicio, fim);

            if (caminho.length === 0) {
                resultadoDiv.textContent = "Não foi possível encontrar um caminho válido para a saída.";
            } else {
                // Formatando o resultado para exibição
                const caminhoFormatado = caminho.map(pos => `(${pos[0]}, ${pos[1]})`).join(' → ');
                resultadoDiv.textContent = caminhoFormatado;

                // Opcional: destacar o caminho no labirinto
                labirintoInput.value = formatarLabirintoComCaminho(labirinto, caminho);
            }
        } catch (error) {
            resultadoDiv.textContent = `Erro: ${error.message}`;
            console.error(error);
        }
    });

    /**
     * Função para formatar o labirinto com o caminho encontrado
     */
    function formatarLabirintoComCaminho(labirinto, caminho) {
        // Criar uma cópia do labirinto para não modificar o original
        const labirintoComCaminho = JSON.parse(JSON.stringify(labirinto));

        // Marcar o caminho (exceto início e fim)
        for (let i = 1; i < caminho.length - 1; i++) {
            const [x, y] = caminho[i];
            labirintoComCaminho[x][y] = '•'; // Usar um caractere especial para o caminho
        }

        // Converter para string formatada
        return JSON.stringify(labirintoComCaminho, null, 2)
            .replace(/"/g, "'") // Voltar para aspas simples para melhor visualização
            .replace(/],/g, '],\n '); // Melhorar formatação
    }

    /**
     * Função para encontrar o caminho mais curto no labirinto usando BFS
     */
    function encontrarCaminho(labirinto, inicio, fim) {
        const linhas = labirinto.length;
        const colunas = labirinto[0].length;

        // Direções possíveis: cima, baixo, esquerda, direita
        const direcoes = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        // Fila para o BFS
        const fila = [[inicio[0], inicio[1]]];

        // Matriz para rastrear células visitadas e seus predecessores
        const visitado = Array.from({ length: linhas }, () => new Array(colunas).fill(false));
        const predecessor = Array.from({ length: linhas }, () => new Array(colunas));

        visitado[inicio[0]][inicio[1]] = true;

        // Executar BFS
        while (fila.length > 0) {
            const [atualLinha, atualColuna] = fila.shift();

            // Verificar se chegamos ao fim
            if (atualLinha === fim[0] && atualColuna === fim[1]) {
                // Reconstruir o caminho a partir do fim
                return reconstruirCaminho(predecessor, inicio, fim);
            }

            // Explorar todas as direções possíveis
            for (const [dl, dc] of direcoes) {
                const novaLinha = atualLinha + dl;
                const novaColuna = atualColuna + dc;

                // Verificar se a nova posição é válida e não visitada
                if (novaLinha >= 0 && novaLinha < linhas &&
                    novaColuna >= 0 && novaColuna < colunas &&
                    (labirinto[novaLinha][novaColuna] === '.' || labirinto[novaLinha][novaColuna] === 'E') &&
                    !visitado[novaLinha][novaColuna]) {

                    visitado[novaLinha][novaColuna] = true;
                    predecessor[novaLinha][novaColuna] = [atualLinha, atualColuna];
                    fila.push([novaLinha, novaColuna]);
                }
            }
        }

        // Se não encontrou caminho, retornar array vazio
        return [];
    }

    /**
     * Função para reconstruir o caminho a partir da matriz de predecessores
     */
    function reconstruirCaminho(predecessor, inicio, fim) {
        const caminho = [];
        let [linha, coluna] = fim;

        // Adicionar o fim ao caminho
        caminho.push([linha, coluna]);

        // Voltar até o início através dos predecessores
        while (linha !== inicio[0] || coluna !== inicio[1]) {
            [linha, coluna] = predecessor[linha][coluna];
            caminho.unshift([linha, coluna]); // Adicionar no início do array
        }

        return caminho;
    }
});