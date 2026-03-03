import sys
import os
import argparse
import psycopg2
import pandas as pd
import json
import time
from datetime import datetime
from contextlib import contextmanager
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

@contextmanager
def silenciar_logs_pysus():
    """
    Bloqueia temporariamente o sys.stderr (onde o PySUS cospe os logs de it/s)
    para manter o terminal limpo e focado na barra principal.
    """
    with open(os.devnull, 'w') as devnull:
        old_stderr = sys.stderr
        sys.stderr = devnull
        try:
            yield
        finally:
            sys.stderr = old_stderr

def get_connection():
    return psycopg2.connect(**DB_CONFIG)

def reset_database():
    """Limpa as tabelas de log e de registros para testes."""
    print("⚠️  Iniciando limpeza do banco de dados (--reset-db)...")
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                TRUNCATE TABLE datasus_sync_log, sih_registros, sia_registros CASCADE;
            """)
            conn.commit()
            print("✅ Tabelas limpas com sucesso!\n")
    except Exception as e:
        print(f"❌ Erro ao limpar o banco de dados: {e}\n")
    finally:
        conn.close()

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

def executar_etl_datasus(save_to_disk=False, load_from_disk=False):
    print("Iniciando rotina de extração pySUS com Retry System...\n")
    
    if save_to_disk or load_from_disk:
        os.makedirs("data", exist_ok=True)

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

    sih = SIH().load() if not load_from_disk else None
    sia = SIA().load() if not load_from_disk else None
    
    # Relatório Final
    sucessos = []
    falhas = []
    MAX_RETRIES = 3

    if not load_from_disk:
        print("Conectando aos servidores do Ministério da Saúde...")

    with tqdm(total=len(tarefas), desc="Progresso Geral", unit="lote", dynamic_ncols=True, file=sys.stdout) as pbar:
        for tarefa in tarefas:
            uf, ano, mes, sistema = tarefa['uf'], tarefa['ano'], tarefa['mes'], tarefa['sistema']
            cnes_dict, lista_cnes_db = tarefa['cnes_dict'], list(tarefa['cnes_dict'].keys())
            lote_id = f"{sistema} {uf} {mes:02d}/{ano}"
            
            pbar.set_postfix(lote=lote_id, status="Checking...")

            if sync_concluido(uf, sistema, ano, mes):
                sucessos.append(lote_id)
                pbar.update(1)
                continue

            processado = False
            for tentativa in range(1, MAX_RETRIES + 1):
                try:
                    df = None
                    arquivo_local = f"data/{sistema}_{uf}_{ano}_{mes:02d}.parquet"

                    if load_from_disk:
                        pbar.set_postfix(lote=lote_id, status="Loading Disk")
                        if os.path.exists(arquivo_local):
                            df = pd.read_parquet(arquivo_local)
                        else:
                            raise FileNotFoundError(f"Arquivo local não encontrado: {arquivo_local}")
                    else:
                        pbar.set_postfix(lote=lote_id, status=f"Download T{tentativa}")
                        arquivos_baixados = None
                        
                        with silenciar_logs_pysus():
                            if sistema == 'SIH':
                                arquivos_ftp = sih.get_files("RD", uf=uf, year=ano, month=mes)
                                if arquivos_ftp: arquivos_baixados = sih.download(arquivos_ftp)
                            else:
                                arquivos_ftp = sia.get_files("PA", uf=uf, year=ano, month=mes)
                                if arquivos_ftp: arquivos_baixados = sia.download(arquivos_ftp)

                        if arquivos_baixados is not None:
                            pbar.set_postfix(lote=lote_id, status=f"Parsing T{tentativa}")
                            try:
                                if hasattr(arquivos_baixados, 'to_dataframe'):
                                    df = arquivos_baixados.to_dataframe()
                                elif isinstance(arquivos_baixados, list) and arquivos_baixados:
                                    df = pd.read_parquet(arquivos_baixados[0])
                                else:
                                    df = pd.read_parquet(arquivos_baixados)
                            except ValueError as ve:
                                if "concatenate" in str(ve).lower():
                                    df = None # Lote reconhecidamente vazio no servidor
                                    tqdm.write(f"  -> [INFO] Lote {lote_id} está vazio no Governo.")
                                    break # Não adianta tentar de novo se o MS diz que está vazio
                                raise ve
                            
                            if save_to_disk and df is not None:
                                df.to_parquet(arquivo_local)

                    # Se chegou aqui com dados, salva no DB
                    if df is not None and not df.empty:
                        pbar.set_postfix(lote=lote_id, status="Saving DB")
                        col_cnes = 'CNES' if sistema == 'SIH' else ('PA_CODUNI' if 'PA_CODUNI' in df.columns else 'CNES')
                        if col_cnes in df.columns:
                            df[col_cnes] = df[col_cnes].astype(str).str.zfill(7)
                            df_alvo = df[df[col_cnes].isin(lista_cnes_db)]
                            salvar_registros(sistema, df_alvo, cnes_dict, ano, mes)
                    
                    registrar_sync(uf, sistema, ano, mes)
                    sucessos.append(lote_id)
                    processado = True
                    break # Sai do loop de retentativa pois deu certo

                except Exception as err:
                    if tentativa < MAX_RETRIES:
                        time.sleep(3) # Espera antes da próxima tentativa
                    else:
                        falhas.append(f"{lote_id} Error: {str(err)}")
            
            pbar.update(1)

    # --- RELATÓRIO FINAL ---
    print("\n" + "="*60)
    print(f"📊  RESUMO DA SINCRONIZAÇÃO")
    print(f"✅  Sucessos: {len(sucessos)}")
    print(f"❌  Falhas:   {len(falhas)}")
    print("="*60)
    
    if falhas:
        print("\nLista de Falhas (Verificar conexão ou disponibilidade no MS):")
        for f in falhas:
            print(f"  • {f}")
    
    print("\nConcluído!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ETL DataSUS Dashify - Optimized Sync.")
    parser.add_argument("--save", action="store_true", help="Cache local em .parquet")
    parser.add_argument("--load", action="store_true", help="Usa apenas cache local")
    parser.add_argument("--reset-db", action="store_true", help="Limpa tabelas antes de iniciar")
    args = parser.parse_args()

    if args.reset_db:
        reset_database()

    executar_etl_datasus(save_to_disk=args.save, load_from_disk=args.load)