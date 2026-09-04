from fastapi import FastAPI, HTTPException, APIRouter, Depends
from pydantic import BaseModel
from .services.trip_service import (
    get_trip_category,
    calculate_daily_budget,
    get_transportation_recommendation,
    get_travel_season,
    recommended_places)
from datetime import datetime
from typing import Optional
from .models.conversation import Conversation
from .services.bedrock_service import get_ai_recommendation
from .services.auth_service import register, login, get_current_user
from .models.user import User
from .models.trip import Trip
from .models.conversation import Conversation, Message
from .services.bedrock_service import get_ai_recommendation, get_chat_response
from .database import SessionLocal, init_db
from .services.kb_service import ask_knowledge_base
from fastapi.middleware.cors import CORSMiddleware
import os

class ConversationResponse(BaseModel):
    id: int
    title: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class MessageOut(BaseModel):
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionRequest(BaseModel):
    question: str

class MessageRequest(BaseModel):
    content: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TripUpdateRequest(BaseModel):
    budget: float

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str

app = FastAPI()

init_db()

# Allow Next.js to Communicate with fastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins = os.getenv("FRONTEND_URL", "http://localhost:3000"),
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

@app.get("/api/data")
def read_root():
    return {"message": "Hello from FastAPI backend!"}

@app.get("/")
def home():
    """Menampilkan Pesan Selamat Datang di Awal"""
    return {
        "message": "Welcome to KelanaAI"
    }

@app.get("/health")
def check_health():
    """Mengembalikan nilai OK jika server berjalan dengan baik"""
    return {
        "status": "OK"
    }

@app.get("/api/v1/trip-categories")
def trip_categories():
    """Mengambil dan Menampilkan data sebagai daftar kategori perjalanan"""
    return [
        "Backpacker",
        "Standard",
        "Luxury"
    ]

@app.get("/api/v1/recommendations")
def recommendations():
    "Mengambil list data tempat rekomendasi"
    return [
        'Tokyo Tower',
        'Mount Fuji',
        'Shibuya'
    ]

@app.get("/api/v1/transportations")
def transportations():
    """Mengambil list kategori transportasi"""
    return [
        "Bus",
        "Train",
        "Flight"
    ]

@app.get("/api/v1/trips")
def list_trips(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    trips = db.query(Trip).filter(Trip.user_id == current_user.id).all()
    db.close()
    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()

    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: Kamu tidak bisa trips user lain")
    
    return trip

@app.post('/api/v1/trips')
def create_trip(request: TripRequest,
                current_user: User = Depends(get_current_user)):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)

    trip = Trip(
        user_id = current_user.id,
        destination = request.destination,
        days = request.days,
        budget = request.budget,
        category = category,
        daily_budget = daily_budget,
        travel_style = request.travel_style
    )

    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)
    db.close()

    return trip

@app.post('/api/v1/trips/{id}/generate')
def generate_trip_recommendation(id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {id} not found")

    ai_recommendation = get_ai_recommendation(
        destination = trip.destination,
        days = trip.days,
        budget = trip.budget,
        travel_style = trip.travel_style
    )

    trip.ai_recommendation = ai_recommendation
    db.commit()
    db.refresh(trip)
    db.close()

    return {
        "trip_id": trip.id,
        "destination": trip.destination,
        'recommendation': trip.ai_recommendation
    }

@app.post('/api/v1/auth/register')
def register_user(request: RegisterRequest):
    """
    Endpoint mendaftarkan user baru dengan memanggil SessionLocal
    """
    # Memanggil koneksi ke database
    db = SessionLocal()

    try:
        new_user = register(
            db=db,
            name=request.name,
            email=request.email,
            password=request.password
        )

        return {
            "message": "Registrasi berhasil dilakukan!",
            "data": {
                "name": new_user.name,
                "email": new_user.email
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Registrasi gagal: {str(e)}")
    finally:
        db.close()

@app.post('/api/v1/auth/login')
def login_user(request: LoginRequest):
    """
    Endpoint untuk login dan mendapatkan JWT TOKEN Access
    """
    db = SessionLocal()

    try:
        access_token = login(db=db, email=request.email, password=request.password)
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.delete('/api/v1/trips/{id}')
def delete_trip(id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code = 404, detail=f"Trip with id {id} not found")

    if trip.user_id != current_user.id:
        db.close()
        raise HTTPException(status_code=403, detail="Forbidden: Kamu tidak boleh hapus trips orang lain")
    db.delete(trip)
    db.commit()
    db.close()

    return {"message": f"Trip with id {id} berhasil dihapus"}

@app.put('/api/v1/trips/{trip_id}')
def update_trip(trip_id: int, request: TripUpdateRequest):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    trip.budget = request.budget
    trip.category = get_trip_category(request.budget)
    trip.daily_budget = calculate_daily_budget(request.budget, trip.days)

    db.commit()
    db.refresh(trip)
    db.close()

    return trip

@app.post('/api/v1/ask')
def asking_ai(request: QuestionRequest):
    """
    Endpoint bertanya ke LLM Amazon Bedrock Knowledge Base
    """
    answer = ask_knowledge_base(request.question)

    if answer is None:
        answer = "Maaf, saya tidak dapat menemukan jawaban untuk pertanyaan tersebut saat ini."

    return {
        "question": request.question,
        "answer": answer
    }

@app.post('/api/v1/conversations', status_code=201)
def create_conversation(current_user: User = Depends(get_current_user)):
    db = SessionLocal()

    conversation = Conversation(
        user_id = current_user.id
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    db.close()

    return {"conversation_id": conversation.id}

@app.post('/api/v1/conversations/{id}/messages')
def send_message(id: int, request: MessageRequest, current_user: User = Depends(get_current_user)):
    """Kirim pesan user, reload history, panggil Bedrock, simpan balasan AI."""
    db = SessionLocal()

    conversation = db.query(Conversation).filter(Conversation.id == id).first()
    if conversation is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Conversation with id {id} not found")
    if conversation.user_id != current_user.id:
        db.close()
        raise HTTPException(status_code=403, detail="Forbidden: Kamu tidak boleh akses conversation orang lain")

    user_message = Message(conversation_id=id, role="user", content=request.content)
    db.add(user_message)

    # Auto-generate title dari pesan pertama
    if conversation.title is None:
        conversation.title = request.content[:50]

    db.commit()
    db.refresh(user_message)

    previous_messages = (
        db.query(Message)
        .filter(Message.conversation_id == id)
        .order_by(Message.created_at.asc())
        .all()
    )

    prompt_messages = [{"role": m.role, "content": m.content} for m in previous_messages]
    ai_response_text = get_chat_response(prompt_messages)

    ai_message = Message(conversation_id=id, role="assistant", content=ai_response_text)
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)
    db.refresh(conversation)

    result = {
        "conversation_id": id,
        "conversation_title": conversation.title,
        "user_message": {
            "role": user_message.role,
            "content": user_message.content,
            "created_at": user_message.created_at,
        },
        "assistant_message": {
            "role": ai_message.role,
            "content": ai_message.content,
            "created_at": ai_message.created_at,
        },
    }
    db.close()
    return result

@app.get('/api/v1/conversations/{id}/messages', response_model=list[MessageOut])
def list_messages(id: int, current_user: User = Depends(get_current_user)):
    """Reload semua pesan sebelumnya sebelum lanjut chat."""
    db = SessionLocal()
    conversation = db.query(Conversation).filter(Conversation.id == id).first()

    if conversation is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Conversation with id {id} not found")
    if conversation.user_id != current_user.id:
        db.close()
        raise HTTPException(status_code=403, detail="Forbidden: Kamu tidak boleh akses conversation orang lain")

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == id)
        .order_by(Message.created_at.asc())
        .all()
    )
    db.close()
    return messages

@app.get('/api/v1/conversations', response_model=list[ConversationResponse])
def list_conversation(current_user: User = Depends(get_current_user)):
    db = SessionLocal()

    conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.created_at.desc())
        .all()
    )

    db.close()
    return conversations

    
# def print_trip_summary(destination, country, days, budget, currency, travel_month):
    # print("="*20)
    # print("KelanaAI")
    # print("="*20)
    # print(f"Destination: {destination}")
    # print(f"Country: {country}")
    # print(f"Days: {days}")
    # print(f"Budget: {budget}")
    # print(f"Currency: {currency}")
    # print(f"Travel Month: {travel_month}")
    # return destination, country, days, budget, currency, travel_month

# if __name__ == "__main__":
    # destinasi = []
    # negara = []

    # while True:
        # user_destinasi = str(input("Destinasi: "))
        # if user_destinasi.lower() == 'exit':
            # break

        # destinasi.append(user_destinasi)

    # while True:
        # user_country = str(input("Country: "))
        # if user_country.lower() == 'exit':
            # break

        # negara.append(user_country)

    # hari = int(input("Days: "))
    # budget = float(input("Budget: "))
    # mata_uang = str(input("Currency: "))
    # travel_month = str(input("travel_month: "))

    # trip_summary = print_trip_summary(destinasi, negara, hari, budget, mata_uang, travel_month)
    # daily_budget = calculate_daily_budget(budget, hari)
    # category = get_trip_category(budget)
    # transport = get_transportation_recommendation(category)
    # season = get_travel_season(travel_month)

    # print(f"daily_budget: {daily_budget} {mata_uang}/day")
    # print(f"category: {category}")
    # print(f"transport: {transport}")
    # print(f"Seasons: {season}")
    # print(f"Recommended Places: {recommended_places}") 
