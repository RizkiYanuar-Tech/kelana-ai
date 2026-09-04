import os
import boto3
from dotenv import load_dotenv

# Memuat kredensial dan konfigurasi dari file .env
load_dotenv()

def get_ai_recommendation(days, destination, budget, travel_style):
    """
    Menghubungkan ke AWS Bedrock untuk mendapatkan rencana perjalanan (itinerary).
    """

    prompt = (
        f"You are an experienced travel planner.\n"
        f"Plan a {days}-day itinerary for {destination}.\n"
        f"Budget: USD {budget}\n"
        f"Travel Style: {travel_style}\n\n"
        f"For EACH day, structure the recommendation using EXACTLY this format:\n"
        f"Give at least 2-3 activities each:"
        f"- Morning Activities\n"
        f"- Afternoon: Culture site or local experience\n"
        f"- Dinner spot suggestion and nightlife option\n"
        f"- Local food recommendation for that day\n"
        f"- Transport suggestion for that day, based on the estimated daily budget\n\n"
        f"Give travel tips section on every day"
        f"Also include the estimated daily budget at the top of each day's section.\n"
        f"Use bullet points for every list of suggestions."
        f"GIVE BOLD Font for Every Section"
    )

    client = boto3.client(
        service_name='bedrock-runtime',
        region_name=os.getenv('AWS_REGION')
    )

    try:
        response = client.converse(
            modelId=os.getenv("MODEL_ID"),
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"text": prompt}
                    ]
                }
            ]
        )
        ai_response = response['output']['message']['content'][0]['text']
        return ai_response

    except Exception as e:
        return f"Terjadi kesalahan saat menghubungi Bedrock: {e}"

def get_chat_response(messages, system_prompt=None):
    """
    Mengirim riwayat percakapan (list of {role, content}) ke AWS Bedrock
    dan mengembalikan balasan AI. Dipakai oleh endpoint chat (send_message),
    berbeda dari get_ai_recommendation yang hanya kirim satu prompt sekali jalan.
    """
 
    client = boto3.client(
        service_name='bedrock-runtime',
        region_name=os.getenv('AWS_REGION')
    )
 
    # Format ulang messages ke struktur yang diminta Bedrock Converse API
    bedrock_messages = [
        {
            "role": m["role"],
            "content": [{"text": m["content"]}]
        }
        for m in messages
    ]
 
    request_kwargs = {
        "modelId": os.getenv("MODEL_ID"),
        "messages": bedrock_messages
    }
 
    if system_prompt:
        request_kwargs["system"] = [{"text": system_prompt}]
 
    try:
        response = client.converse(**request_kwargs)
        ai_response = response['output']['message']['content'][0]['text']
        return ai_response
 
    except Exception as e:
        return f"Terjadi kesalahan saat menghubungi Bedrock: {e}"