import boto3
import os
from dotenv import load_dotenv

load_dotenv()

client = boto3.client("bedrock-agent-runtime",
                      region_name=os.getenv("AWS_REGION"))

def ask_knowledge_base(question: str):
    """
    Fungsi mengirim pertanyaan ke Knowledge Base
    dan mendapatkan jawaban yang dihasilkan oleh Model AI bedrock.
    """
    try:
        response = client.retrieve(
            knowledgeBaseId = os.getenv('KNOWLEDGE_BASE_ID'),
            retrievalQuery ={'text': question},
            retrievalConfiguration={
                'managedSearchConfiguration':{
                    'numberOfResults': 1,
                },
            },
        )

        # Ambil informasi urutan pertama
        result = response.get('retrievalResults', [])

        # Jika informasi tidak ditemukan
        if not result:
            return "Informasi tidak ditemukan di dalam dokumen"

        teks_dokumen = result[0].get('content', {}).get('text', '')

        return f"Berdasarkan dokumen Anda: \n{teks_dokumen}"

    except Exception as e:
        print("======== ERROR DARI AWS BEDROCK ========")
        print(e)
        print("========================================")
        return f"Gagal menghubungi AWS. Detail error: {str(e)}"
