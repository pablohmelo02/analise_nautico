# Análise do Náutico — Série B 2026

Painel interativo criado a partir de `nautico_serie_b_2026_todos_jogos.csv`.

## Como abrir

- Para visualizar imediatamente, abra `index.html` no navegador.
- Para que alterações futuras no CSV sejam carregadas automaticamente, execute nesta pasta (sem instalar dependências):

```powershell
node server.js
```

Depois acesse `http://localhost:8000`.

## Executar com Streamlit

O projeto também está pronto para publicação no Streamlit Community Cloud.

```powershell
python -m pip install -r requirements.txt
python -m streamlit run streamlit_app.py
```

Depois acesse o endereço exibido no terminal, normalmente `http://localhost:8501`.

### Publicar na internet

1. Envie esta pasta para um repositório no GitHub.
2. Acesse `share.streamlit.io` e conecte sua conta do GitHub.
3. Selecione o repositório, a branch e o arquivo `streamlit_app.py`.
4. Clique em **Deploy**.

O `requirements.txt` já contém a dependência necessária. A dashboard incorpora o CSS, o JavaScript, a logo e o CSV na página do Streamlit, portanto mantém os filtros e as interações da versão atual.

## Regras usadas

- Vitória: 3 pontos
- Empate: 1 ponto
- Derrota: 0 ponto
- Aproveitamento: pontos conquistados ÷ pontos possíveis

O painel considera apenas registros com `status` igual a `finished` e resultado `V`, `E` ou `D`.

## Modelo probabilístico

As probabilidades usam uma distribuição preditiva bayesiana, com prior de Jeffreys, separando o rendimento como mandante e visitante. Os dez jogos restantes foram identificados pelo espelhamento da tabela do primeiro turno.

- G6: probabilidade de terminar com 60 pontos ou mais
- Acesso direto: probabilidade de terminar com 65 pontos ou mais
- Acesso pelos playoffs: 50% da probabilidade de terminar entre 60 e 64 pontos
- Rebaixamento: probabilidade de terminar com 44 pontos ou menos

Essas faixas são referências de cenário, não cortes garantidos. O CSV não contém a campanha completa dos outros clubes; portanto, posição final, desempates e força dos adversários não fazem parte do modelo.
