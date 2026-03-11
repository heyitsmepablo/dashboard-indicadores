import pandas as pd
import psycopg2
import os
import re
from datetime import datetime

# ============================================================================
# CONFIGURAÇÕES DO BANCO DE DADOS E DIRETÓRIO
# ============================================================================
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASS = "postgres"

NOME_PASTA = "relatorios_indicadores"

def limpar_nome_arquivo(nome):
    """
    Remove caracteres que são inválidos para nomes de arquivos (Windows/Linux)
    e substitui espaços por sublinhados para manter o padrão.
    """
    nome_limpo = re.sub(r'[\\/*?:"<>|]', "", str(nome))
    return nome_limpo.strip().replace(" ", "_")

def main():
    try:
        print("Conectando ao banco de dados...")
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )

        query = """
            SELECT 
                tu.nome AS tipo_unidade,
                i.id, 
                i.descricao, 
                i.fonte_formula, 
                i.unidade_de_medida, 
                i.meta
            FROM tipo_de_unidade tu
            JOIN indicador_tipo_unidade itu ON tu.id = itu.tipo_unidade_id
            JOIN indicadores i ON itu.indicador_id = i.id
            ORDER BY tu.nome, i.id;
        """

        print("Extraindo os dados...")
        df = pd.read_sql(query, conn)
        
    except Exception as e:
        print(f"Erro ao acessar o banco de dados: {e}")
        return
    finally:
        if 'conn' in locals() and conn:
            conn.close()

    if df.empty:
        print("Nenhum dado encontrado com os relacionamentos atuais.")
        return

    # 1. Cria a pasta se ela não existir
    os.makedirs(NOME_PASTA, exist_ok=True)
    
    # 2. Pega a data atual no formato YYYYMMDD (ex: 20260306)
    # Você pode mudar para "%d-%m-%Y" se preferir dia-mes-ano
    data_atual = datetime.now().strftime("%Y%m%d") 

    tipos_unidade = df['tipo_unidade'].unique()
    
    print(f"Gerando arquivos na pasta '{NOME_PASTA}'...")
    
    # 3. Gera um arquivo separado para cada tipo de unidade
    for tipo in tipos_unidade:
        df_tipo = df[df['tipo_unidade'] == tipo].copy()
        df_tipo = df_tipo.drop(columns=['tipo_unidade'])
        
        nome_tipo_limpo = limpar_nome_arquivo(tipo)
        nome_arquivo = f"indicadores_{nome_tipo_limpo}_{data_atual}.xlsx"
        
        # Junta o caminho da pasta com o nome do arquivo
        caminho_completo = os.path.join(NOME_PASTA, nome_arquivo)
        
        df_tipo.to_excel(caminho_completo, index=False)
        print(f" ✅ Criado: {caminho_completo}")

    print("\nProcesso concluído com sucesso!")

if __name__ == "__main__":
    main()