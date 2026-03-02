import psycopg2
import pandas as pd
import json
from datetime import datetime
from pysus import SIH, SIA 
from tqdm import tqdm

# Configurações de conexão com o PostgreSQL
DB_CONFIG = {
    "host": "localhost",
    "database": "postgres",
    "user": "postgres",
    "password": "postgres",
    "port": "5432"
}

def get_connection():
    return psycopg2.connect(**DB_CONFIG)

def fetch_unidades_ativas():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, lpad(cnes, 7, '0'), uf FROM unidades WHERE cnes IS NOT NULL;")
            return cur.fetchall()
    finally:
        conn.close()

def sync_concluido(uf, sistema, ano, mes):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 1 FROM datasus_sync_log 
                WHERE uf = %s AND sistema = %s AND ano = %s AND mes = %s
            """, (uf, sistema, ano, mes))
            return cur.fetchone() is not None
    finally:
        conn.close()

def registrar_sync(uf, sistema, ano, mes):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO datasus_sync_log (uf, sistema, ano, mes) 
                VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING
            """, (uf, sistema, ano, mes))
            conn.commit()
    finally:
        conn.close()

def inserir_registros_db(query, dados):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.executemany(query, dados)
            conn.commit()
    finally:
        conn.close()

def salvar_registros(sistema, df_filtrado, cnes_dict, ano, mes):
    if df_filtrado.empty:
        return

    registros = df_filtrado.to_dict(orient='records')
    dados_insercao = []
    
    for row in registros:
        cnes_val = row.get('CNES') or row.get('PA_CODUNI')
        cnes_str = str(cnes_val).zfill(7) if pd.notna(cnes_val) else None
        
        if not cnes_str or cnes_str not in cnes_dict:
            continue

        unidade_id = cnes_dict[cnes_str]
        row_json = json.dumps(row, default=str)
        
        if sistema == 'SIH':
            n_aih = row.get('N_AIH', None)
            dados_insercao.append((unidade_id, cnes_str, ano, mes, n_aih, row_json))
        elif sistema == 'SIA':
            dados_insercao.append((unidade_id, cnes_str, ano, mes, row_json))
            
    if not dados_insercao:
        return

    if sistema == 'SIH':
        query = """
            INSERT INTO sih_registros (unidade_id, cnes, ano, mes, n_aih, dados)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
    else:
        query = """
            INSERT INTO sia_registros (unidade_id, cnes, ano, mes, dados)
            VALUES (%s, %s, %s, %s, %s)
        """
        
    inserir_registros_db(query, dados_insercao)

def executar_etl_datasus():
    print("Iniciando rotina de extração pySUS...\n")
    unidades = fetch_unidades_ativas()
    
    if not unidades:
        print("Nenhuma unidade com CNES encontrada no banco.")
        return

    mapa_unidades = {}
    for uid, cnes, uf in unidades:
        uf_key = uf if uf else 'MA'
        if uf_key not in mapa_unidades:
            mapa_unidades[uf_key] = {}
        mapa_unidades[uf_key][cnes] = uid

    ano_inicial = 2024
    data_atual = datetime.now()
    
    tarefas = []
    for uf, cnes_dict in mapa_unidades.items():
        for ano in range(ano_inicial, data_atual.year + 1):
            for mes in range(1, 13):
                if ano == data_atual.year and mes > data_atual.month:
                    break 
                
                tarefas.append({'uf': uf, 'cnes_dict': cnes_dict, 'ano': ano, 'mes': mes, 'sistema': 'SIH'})
                tarefas.append({'uf': uf, 'cnes_dict': cnes_dict, 'ano': ano, 'mes': mes, 'sistema': 'SIA'})

    tqdm.write("Conectando aos servidores do Ministério da Saúde...")
    sih = SIH().load()
    sia = SIA().load()

    with tqdm(total=len(tarefas), desc="Preparando...", unit="lote", dynamic_ncols=True) as pbar:
        
        for tarefa in tarefas:
            uf = tarefa['uf']
            cnes_dict = tarefa['cnes_dict']
            ano = tarefa['ano']
            mes = tarefa['mes']
            sistema = tarefa['sistema']
            lista_cnes_db = list(cnes_dict.keys())
            
            pbar.set_description(f"Processando {sistema} - {uf} {mes:02d}/{ano}")

            if sync_concluido(uf, sistema, ano, mes):
                pbar.update(1)
                continue

            try:
                arquivos_baixados = None
                
                if sistema == 'SIH':
                    arquivos_ftp = sih.get_files("RD", uf=uf, year=ano, month=mes)
                    if arquivos_ftp:
                        arquivos_baixados = sih.download(arquivos_ftp)
                else:
                    arquivos_ftp = sia.get_files("PA", uf=uf, year=ano, month=mes)
                    if arquivos_ftp:
                        arquivos_baixados = sia.download(arquivos_ftp)

                # --- LÓGICA CORRIGIDA PARA O PARQUETSET ---
                if arquivos_baixados is not None:
                    # Se for o objeto ParquetSet nativo das versões novas
                    if hasattr(arquivos_baixados, 'to_dataframe'):
                        df = arquivos_baixados.to_dataframe()
                    # Caso de fallback para compatibilidade
                    elif isinstance(arquivos_baixados, list):
                        df = pd.read_parquet(arquivos_baixados[0])
                    else:
                        df = pd.read_parquet(arquivos_baixados)
                    
                    col_cnes = 'CNES' if sistema == 'SIH' else ('PA_CODUNI' if 'PA_CODUNI' in df.columns else 'CNES')
                    
                    if col_cnes in df.columns:
                        df[col_cnes] = df[col_cnes].astype(str).str.zfill(7)
                        df_alvo = df[df[col_cnes].isin(lista_cnes_db)]
                        salvar_registros(sistema, df_alvo, cnes_dict, ano, mes)
                        
                registrar_sync(uf, sistema, ano, mes)
                
            except Exception as err:
                tqdm.write(f"  -> [AVISO] Falha ao processar lote {sistema} {uf} {mes:02d}/{ano}: {err}")
            
            pbar.update(1)

    print("\nSincronização concluída com sucesso!")

if __name__ == "__main__":
    executar_etl_datasus()