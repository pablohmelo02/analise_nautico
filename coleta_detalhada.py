import os
import requests
import pandas as pd
import time

API_KEY = os.environ.get("FSAPI_KEY")

if not API_KEY:
    raise RuntimeError(
        "Defina a variÃ¡vel de ambiente FSAPI_KEY antes de executar a coleta."
    )

SERIE_B_ID = "lg_1VQKEDM"
NAUTICO_ID = "tm_2GF105A"

BASE_URL = "https://api.footballsoccerapi.com/v1"

HEADERS = {
    "X-API-Key": API_KEY
}


# =========================================================
# 1. BUSCAR TODOS OS JOGOS DISPONÍVEIS
# =========================================================

def buscar_todos_jogos():

    url = f"{BASE_URL}/matches"

    params = {
        "league_id": SERIE_B_ID,
        "team_id": NAUTICO_ID,
        "season": 2026,
        "limit": 1000,
        "sort": "kickoff_utc"
    }

    todos = []
    cursor = None

    while True:

        if cursor:
            params["cursor"] = cursor

        response = requests.get(
            url,
            headers=HEADERS,
            params=params,
            timeout=30
        )

        print(
            "Busca geral:",
            response.status_code
        )

        response.raise_for_status()

        json = response.json()

        dados = json.get("data", [])

        todos.extend(dados)

        meta = json.get("meta", {})

        print(
            "Página:",
            meta.get("page"),
            "| Recebidos:",
            len(dados),
            "| Total informado:",
            meta.get("total")
        )

        cursor = meta.get("next_cursor")

        if not cursor:
            break

    return todos


# =========================================================
# 2. DETALHAR UM JOGO
# =========================================================

def buscar_detalhes(match_id):

    url = (
        f"{BASE_URL}/matches/{match_id}"
    )

    response = requests.get(
        url,
        headers=HEADERS,
        timeout=30
    )

    if response.status_code != 200:

        print(
            f"   Detalhes indisponíveis "
            f"({response.status_code})"
        )

        return None

    return response.json().get(
        "data"
    )


# =========================================================
# 3. ENCONTRAR ESTATÍSTICAS DE UM TIME
# =========================================================

def stats_time(jogo, nome_time):

    for item in jogo.get(
        "statistics",
        []
    ):

        if (
            item.get("team_name")
            == nome_time
        ):

            return item.get(
                "statistics",
                {}
            )

    return {}


def percentual_decimal(valor):
    """Converte percentuais da API (ex.: 63) para decimal (0.63).
    Esse formato é o ideal para o Power BI aplicar o formato Porcentagem.
    """
    if valor is None:
        return None

    try:
        return round(float(valor) / 100, 4)
    except (TypeError, ValueError):
        return None


# =========================================================
# 4. PROCESSAR
# =========================================================

jogos = buscar_todos_jogos()

print("\n" + "=" * 60)
print(
    "TOTAL DE JOGOS RETORNADOS:",
    len(jogos)
)
print("=" * 60)


resultado = []


for numero, basico in enumerate(
    jogos,
    start=1
):

    match_id = basico["match_id"]

    print(
        f"\n[{numero}/{len(jogos)}] "
        f"{basico.get('home_team_name')} x "
        f"{basico.get('away_team_name')}"
    )

    detalhe = None

    try:

        detalhe = buscar_detalhes(
            match_id
        )

    except Exception as erro:

        print(
            "   Erro no detalhe:",
            erro
        )

    # Se não conseguir detalhe,
    # mantém os dados básicos.
    jogo = detalhe or basico

    mandante = jogo.get(
        "home_team_name"
    )

    visitante = jogo.get(
        "away_team_name"
    )

    id_mandante = jogo.get(
        "home_team_id"
    )

    id_visitante = jogo.get(
        "away_team_id"
    )

    gols_mandante = jogo.get(
        "home_goals"
    )

    gols_visitante = jogo.get(
        "away_goals"
    )

    gols_1t_mandante = jogo.get(
        "half_time_home_goals"
    )

    gols_1t_visitante = jogo.get(
        "half_time_away_goals"
    )


    # =====================================================
    # IDENTIFICAR NÁUTICO
    # =====================================================

    if id_mandante == NAUTICO_ID:

        mando = "Casa"

        adversario = visitante

        gols_nautico = gols_mandante
        gols_adversario = gols_visitante
        gols_1t_nautico = gols_1t_mandante
        gols_1t_adversario = gols_1t_visitante

        nome_nautico = mandante
        nome_adversario = visitante

    else:

        mando = "Fora"

        adversario = mandante

        gols_nautico = gols_visitante
        gols_adversario = gols_mandante
        gols_1t_nautico = gols_1t_visitante
        gols_1t_adversario = gols_1t_mandante

        nome_nautico = visitante
        nome_adversario = mandante


    # =====================================================
    # RESULTADO
    # =====================================================

    resultado_nautico = None

    if (
        gols_nautico is not None
        and gols_adversario is not None
    ):

        if gols_nautico > gols_adversario:
            resultado_nautico = "V"

        elif gols_nautico < gols_adversario:
            resultado_nautico = "D"

        else:
            resultado_nautico = "E"


    # =====================================================
    # ESTATÍSTICAS
    # =====================================================

    gols_2t_nautico = None
    gols_2t_adversario = None
    resultado_intervalo = None

    if (
        gols_nautico is not None
        and gols_adversario is not None
        and gols_1t_nautico is not None
        and gols_1t_adversario is not None
    ):
        gols_2t_nautico = gols_nautico - gols_1t_nautico
        gols_2t_adversario = gols_adversario - gols_1t_adversario

        if gols_1t_nautico > gols_1t_adversario:
            resultado_intervalo = "V"
        elif gols_1t_nautico < gols_1t_adversario:
            resultado_intervalo = "D"
        else:
            resultado_intervalo = "E"


    # =====================================================
    # ESTATÃSTICAS

    stats_nautico = stats_time(
        jogo,
        nome_nautico
    )

    stats_adv = stats_time(
        jogo,
        nome_adversario
    )


    linha = {

        "id_jogo":
            match_id,

        "data":
            jogo.get(
                "kickoff_date"
            ),

        "status":
            jogo.get(
                "match_status"
            ),

        "adversario":
            adversario,

        "mando":
            mando,

        "gols_nautico":
            gols_nautico,

        "gols_adversario":
            gols_adversario,

        "resultado":
            resultado_nautico,

        "gols_1t_nautico":
            gols_1t_nautico,

        "gols_1t_adversario":
            gols_1t_adversario,

        "gols_2t_nautico":
            gols_2t_nautico,

        "gols_2t_adversario":
            gols_2t_adversario,

        "resultado_intervalo":
            resultado_intervalo,

        "estadio":
            jogo.get(
                "venue_name"
            ),

        "cidade":
            jogo.get(
                "city_name"
            ),

        # NÁUTICO

        "posse_nautico":
            percentual_decimal(
                stats_nautico.get(
                    "possession_pct"
                )
            ),

        "finalizacoes_nautico":
            stats_nautico.get(
                "shots_total"
            ),

        "chutes_alvo_nautico":
            stats_nautico.get(
                "shots_on_target"
            ),

        "chutes_fora_nautico":
            stats_nautico.get(
                "shots_off_target"
            ),

        "chutes_bloqueados_nautico":
            stats_nautico.get(
                "shots_blocked"
            ),

        "chutes_area_nautico":
            stats_nautico.get(
                "shots_inside_box"
            ),

        "chutes_fora_area_nautico":
            stats_nautico.get(
                "shots_outside_box"
            ),

        "escanteios_nautico":
            stats_nautico.get(
                "corners"
            ),

        "faltas_nautico":
            stats_nautico.get(
                "fouls"
            ),

        "impedimentos_nautico":
            stats_nautico.get(
                "offsides"
            ),

        "passes_nautico":
            stats_nautico.get(
                "passes_total"
            ),

        "passes_certos_nautico":
            stats_nautico.get(
                "passes_accurate"
            ),

        "amarelos_nautico":
            stats_nautico.get(
                "yellow_cards"
            ),

        "vermelhos_nautico":
            stats_nautico.get(
                "red_cards"
            ),

        "defesas_nautico":
            stats_nautico.get(
                "saves"
            ),

        # ADVERSÁRIO

        "posse_adversario":
            percentual_decimal(
                stats_adv.get(
                    "possession_pct"
                )
            ),

        "finalizacoes_adversario":
            stats_adv.get(
                "shots_total"
            ),

        "chutes_alvo_adversario":
            stats_adv.get(
                "shots_on_target"
            ),

        "escanteios_adversario":
            stats_adv.get(
                "corners"
            ),

        "faltas_adversario":
            stats_adv.get(
                "fouls"
            ),

        "passes_adversario":
            stats_adv.get(
                "passes_total"
            ),

        "passes_certos_adversario":
            stats_adv.get(
                "passes_accurate"
            ),

        "amarelos_adversario":
            stats_adv.get(
                "yellow_cards"
            ),

        "vermelhos_adversario":
            stats_adv.get(
                "red_cards"
            )
    }


    resultado.append(
        linha
    )

    print(
        "   OK | stats:",
        "SIM"
        if stats_nautico
        else "NÃO"
    )

    time.sleep(0.25)


# =========================================================
# DATAFRAME
# =========================================================

df = pd.DataFrame(
    resultado
)

df = df.drop_duplicates(
    subset=["id_jogo"]
)

df["data"] = pd.to_datetime(
    df["data"],
    errors="coerce"
)

df = df.sort_values(
    "data"
)


# =========================================================
# MÉTRICAS PERCENTUAIS
# Valores entre 0 e 1 para o Power BI.
# Ex.: 0.7188 -> formatado no Power BI como 71,88%
# =========================================================

passes_nautico = df["passes_nautico"].replace(0, pd.NA)
finalizacoes_nautico = df["finalizacoes_nautico"].replace(0, pd.NA)
passes_adversario = df["passes_adversario"].replace(0, pd.NA)
finalizacoes_adversario = df["finalizacoes_adversario"].replace(0, pd.NA)

df[
    "aproveitamento_passes_nautico"
] = (
    df["passes_certos_nautico"]
    / passes_nautico
).round(4)

df[
    "precisao_finalizacao_nautico"
] = (
    df["chutes_alvo_nautico"]
    / finalizacoes_nautico
).round(4)

df[
    "conversao_nautico"
] = (
    df["gols_nautico"]
    / finalizacoes_nautico
).round(4)

# Mesmas métricas para o adversário, úteis para comparação no Power BI.
df[
    "aproveitamento_passes_adversario"
] = (
    df["passes_certos_adversario"]
    / passes_adversario
).round(4)

df[
    "precisao_finalizacao_adversario"
] = (
    df["chutes_alvo_adversario"]
    / finalizacoes_adversario
).round(4)

df[
    "conversao_adversario"
] = (
    df["gols_adversario"]
    / finalizacoes_adversario
).round(4)


# =========================================================
# EXPORTAR
# =========================================================

arquivo = (
    "nautico_serie_b_2026_todos_jogos.csv"
)

df.to_csv(
    arquivo,
    index=False,
    encoding="utf-8-sig"
)


print("\n" + "=" * 60)
print("FINALIZADO")
print("=" * 60)

print(
    "Jogos encontrados:",
    len(df)
)

print(
    "Jogos encerrados:",
    (
        df["status"]
        == "finished"
    ).sum()
)

print(
    "Jogos com estatísticas:",
    df[
        "finalizacoes_nautico"
    ].notna().sum()
)

print(
    "Arquivo:",
    arquivo
)