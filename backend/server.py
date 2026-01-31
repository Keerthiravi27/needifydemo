from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'needify_secret_key_2024')
JWT_ALGORITHM = 'HS256'

# ========== MODELS ==========
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    college: str
    phone: Optional[str] = None
    picture: Optional[str] = None
    rating: float = 0.0
    rating_count: int = 0
    terms_accepted: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    college: str
    phone: Optional[str] = None
    terms_accepted: bool

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    college: Optional[str] = None
    phone: Optional[str] = None
    picture: Optional[str] = None

class Gig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str
    price: float
    status: str = "open"  # open, accepted, completed, cancelled
    poster_id: str
    poster_name: str = ""
    acceptor_id: Optional[str] = None
    acceptor_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GigCreate(BaseModel):
    title: str
    description: str
    category: str
    price: float

class GigAccept(BaseModel):
    gig_id: str

class GigUpdateStatus(BaseModel):
    status: str

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    price: float
    creator_id: str
    creator_name: str = ""
    rating: float = 0.0
    rating_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ServiceCreate(BaseModel):
    title: str
    description: str
    price: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_type: str  # "gig" or "service"
    gig_id: Optional[str] = None
    service_id: Optional[str] = None
    buyer_id: str
    buyer_name: str = ""
    provider_id: str
    provider_name: str = ""
    total_amount: float
    commission: float  # 15%
    status: str = "active"  # active, completed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    cancelled_at: Optional[datetime] = None

class Rating(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    from_user_id: str
    from_user_name: str = ""
    to_user_id: str
    to_user_name: str = ""
    rating: float
    review: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RatingCreate(BaseModel):
    order_id: str
    to_user_id: str
    rating: float
    review: Optional[str] = None

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    message: str
    type: str  # gig_accepted, completed, cancelled, review
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ========== HELPER FUNCTIONS ==========
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def create_notification(user_id: str, message: str, notif_type: str):
    notif = Notification(user_id=user_id, message=message, type=notif_type)
    doc = notif.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.notifications.insert_one(doc)

# ========== AUTH ROUTES ==========
@api_router.post("/auth/signup")
async def signup(user_data: UserCreate):
    if not user_data.terms_accepted:
        raise HTTPException(status_code=400, detail="Must accept terms and conditions")
    
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    password_hash = hash_password(user_data.password)
    user = User(
        name=user_data.name,
        email=user_data.email,
        college=user_data.college,
        phone=user_data.phone,
        terms_accepted=user_data.terms_accepted
    )
    
    doc = user.model_dump()
    doc['password_hash'] = password_hash
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    token = create_token(user.id)
    return {"token": token, "user": user}

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user_doc = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(login_data.password, user_doc.get('password_hash', '')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**user_doc)
    token = create_token(user.id)
    return {"token": token, "user": user}

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ========== USER ROUTES ==========
@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

@api_router.put("/users/profile", response_model=User)
async def update_profile(update_data: UserUpdate, current_user: User = Depends(get_current_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        await db.users.update_one({"id": current_user.id}, {"$set": update_dict})
    updated_user = await db.users.find_one({"id": current_user.id}, {"_id": 0, "password_hash": 0})
    return User(**updated_user)

# ========== GIG ROUTES ==========
@api_router.post("/gigs", response_model=Gig)
async def create_gig(gig_data: GigCreate, current_user: User = Depends(get_current_user)):
    gig = Gig(**gig_data.model_dump(), poster_id=current_user.id, poster_name=current_user.name)
    doc = gig.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.gigs.insert_one(doc)
    return gig

@api_router.get("/gigs", response_model=List[Gig])
async def get_gigs(status: Optional[str] = None):
    query = {} if not status else {"status": status}
    gigs = await db.gigs.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for gig in gigs:
        if isinstance(gig['created_at'], str):
            gig['created_at'] = datetime.fromisoformat(gig['created_at'])
    return gigs

@api_router.get("/gigs/{gig_id}", response_model=Gig)
async def get_gig(gig_id: str):
    gig = await db.gigs.find_one({"id": gig_id}, {"_id": 0})
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    if isinstance(gig['created_at'], str):
        gig['created_at'] = datetime.fromisoformat(gig['created_at'])
    return Gig(**gig)

@api_router.post("/gigs/{gig_id}/accept")
async def accept_gig(gig_id: str, current_user: User = Depends(get_current_user)):
    gig = await db.gigs.find_one({"id": gig_id}, {"_id": 0})
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    if gig['status'] != 'open':
        raise HTTPException(status_code=400, detail="Gig not available")
    if gig['poster_id'] == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot accept your own gig")
    
    await db.gigs.update_one(
        {"id": gig_id},
        {"$set": {"status": "accepted", "acceptor_id": current_user.id, "acceptor_name": current_user.name}}
    )
    
    # Create order
    commission = gig['price'] * 0.15
    order = Order(
        order_type="gig",
        gig_id=gig_id,
        buyer_id=gig['poster_id'],
        buyer_name=gig['poster_name'],
        provider_id=current_user.id,
        provider_name=current_user.name,
        total_amount=gig['price'],
        commission=commission
    )
    order_doc = order.model_dump()
    order_doc['created_at'] = order_doc['created_at'].isoformat()
    await db.orders.insert_one(order_doc)
    
    # Notify poster
    await create_notification(
        gig['poster_id'],
        f"{current_user.name} accepted your gig: {gig['title']}",
        "gig_accepted"
    )
    
    return {"message": "Gig accepted", "order_id": order.id}

@api_router.put("/gigs/{gig_id}/status", response_model=Gig)
async def update_gig_status(gig_id: str, status_data: GigUpdateStatus, current_user: User = Depends(get_current_user)):
    gig = await db.gigs.find_one({"id": gig_id}, {"_id": 0})
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    
    if gig['poster_id'] != current_user.id and gig.get('acceptor_id') != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.gigs.update_one({"id": gig_id}, {"$set": {"status": status_data.status}})
    
    # Update order status if completed or cancelled
    if status_data.status in ['completed', 'cancelled']:
        await db.orders.update_one({"gig_id": gig_id}, {"$set": {"status": status_data.status}})
        
        # Notify participants
        if gig.get('acceptor_id'):
            msg = f"Gig '{gig['title']}' has been {status_data.status}"
            await create_notification(gig['acceptor_id'], msg, status_data.status)
        await create_notification(gig['poster_id'], f"Your gig '{gig['title']}' has been {status_data.status}", status_data.status)
    
    updated_gig = await db.gigs.find_one({"id": gig_id}, {"_id": 0})
    if isinstance(updated_gig['created_at'], str):
        updated_gig['created_at'] = datetime.fromisoformat(updated_gig['created_at'])
    return Gig(**updated_gig)

@api_router.get("/gigs/my/posted", response_model=List[Gig])
async def get_my_gigs(current_user: User = Depends(get_current_user)):
    gigs = await db.gigs.find({"poster_id": current_user.id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for gig in gigs:
        if isinstance(gig['created_at'], str):
            gig['created_at'] = datetime.fromisoformat(gig['created_at'])
    return gigs

@api_router.get("/gigs/my/accepted", response_model=List[Gig])
async def get_my_accepted_gigs(current_user: User = Depends(get_current_user)):
    gigs = await db.gigs.find({"acceptor_id": current_user.id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for gig in gigs:
        if isinstance(gig['created_at'], str):
            gig['created_at'] = datetime.fromisoformat(gig['created_at'])
    return gigs

# ========== SERVICE ROUTES ==========
@api_router.post("/services", response_model=Service)
async def create_service(service_data: ServiceCreate, current_user: User = Depends(get_current_user)):
    service = Service(**service_data.model_dump(), creator_id=current_user.id, creator_name=current_user.name)
    doc = service.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.services.insert_one(doc)
    return service

@api_router.get("/services", response_model=List[Service])
async def get_services():
    services = await db.services.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for service in services:
        if isinstance(service['created_at'], str):
            service['created_at'] = datetime.fromisoformat(service['created_at'])
    return services

@api_router.get("/services/{service_id}", response_model=Service)
async def get_service(service_id: str):
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    if isinstance(service['created_at'], str):
        service['created_at'] = datetime.fromisoformat(service['created_at'])
    return Service(**service)

@api_router.post("/services/{service_id}/book")
async def book_service(service_id: str, current_user: User = Depends(get_current_user)):
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    if service['creator_id'] == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot book your own service")
    
    # Create order
    commission = service['price'] * 0.15
    order = Order(
        order_type="service",
        service_id=service_id,
        buyer_id=current_user.id,
        buyer_name=current_user.name,
        provider_id=service['creator_id'],
        provider_name=service['creator_name'],
        total_amount=service['price'],
        commission=commission
    )
    order_doc = order.model_dump()
    order_doc['created_at'] = order_doc['created_at'].isoformat()
    await db.orders.insert_one(order_doc)
    
    # Notify provider
    await create_notification(
        service['creator_id'],
        f"{current_user.name} booked your service: {service['title']}",
        "service_booked"
    )
    
    return {"message": "Service booked", "order_id": order.id}

@api_router.get("/services/my/created", response_model=List[Service])
async def get_my_services(current_user: User = Depends(get_current_user)):
    services = await db.services.find({"creator_id": current_user.id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for service in services:
        if isinstance(service['created_at'], str):
            service['created_at'] = datetime.fromisoformat(service['created_at'])
    return services

# ========== ORDER ROUTES ==========
@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: User = Depends(get_current_user)):
    orders = await db.orders.find(
        {"$or": [{"buyer_id": current_user.id}, {"provider_id": current_user.id}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        if order.get('cancelled_at') and isinstance(order['cancelled_at'], str):
            order['cancelled_at'] = datetime.fromisoformat(order['cancelled_at'])
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: User = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order['buyer_id'] != current_user.id and order['provider_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if isinstance(order['created_at'], str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    if order.get('cancelled_at') and isinstance(order['cancelled_at'], str):
        order['cancelled_at'] = datetime.fromisoformat(order['cancelled_at'])
    return Order(**order)

@api_router.post("/orders/{order_id}/cancel")
async def cancel_order(order_id: str, current_user: User = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order['buyer_id'] != current_user.id and order['provider_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if order['status'] != 'active':
        raise HTTPException(status_code=400, detail="Order already completed or cancelled")
    
    created_at = datetime.fromisoformat(order['created_at']) if isinstance(order['created_at'], str) else order['created_at']
    time_diff = datetime.now(timezone.utc) - created_at
    
    # 50% fee after 2 minutes
    cancellation_fee = 0
    if time_diff.total_seconds() > 120:
        cancellation_fee = order['total_amount'] * 0.5
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": "cancelled", "cancelled_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Update gig/service status
    if order.get('gig_id'):
        await db.gigs.update_one({"id": order['gig_id']}, {"$set": {"status": "cancelled"}})
    
    # Notify other party
    other_user_id = order['provider_id'] if order['buyer_id'] == current_user.id else order['buyer_id']
    await create_notification(other_user_id, f"Order #{order_id[:8]} has been cancelled", "cancelled")
    
    return {"message": "Order cancelled", "cancellation_fee": cancellation_fee}

# ========== RATING ROUTES ==========
@api_router.post("/ratings", response_model=Rating)
async def create_rating(rating_data: RatingCreate, current_user: User = Depends(get_current_user)):
    order = await db.orders.find_one({"id": rating_data.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order['status'] != 'completed':
        raise HTTPException(status_code=400, detail="Can only rate completed orders")
    if order['buyer_id'] != current_user.id and order['provider_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if already rated
    existing = await db.ratings.find_one({"order_id": rating_data.order_id, "from_user_id": current_user.id}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Already rated this order")
    
    to_user = await db.users.find_one({"id": rating_data.to_user_id}, {"_id": 0})
    if not to_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    rating = Rating(
        order_id=rating_data.order_id,
        from_user_id=current_user.id,
        from_user_name=current_user.name,
        to_user_id=rating_data.to_user_id,
        to_user_name=to_user['name'],
        rating=rating_data.rating,
        review=rating_data.review
    )
    doc = rating.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.ratings.insert_one(doc)
    
    # Update user rating
    user_ratings = await db.ratings.find({"to_user_id": rating_data.to_user_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r['rating'] for r in user_ratings) / len(user_ratings) if user_ratings else 0
    await db.users.update_one(
        {"id": rating_data.to_user_id},
        {"$set": {"rating": round(avg_rating, 2), "rating_count": len(user_ratings)}}
    )
    
    # Update service rating if applicable
    if order.get('service_id'):
        service_ratings = await db.ratings.find({"to_user_id": to_user['id']}, {"_id": 0}).to_list(1000)
        service_avg = sum(r['rating'] for r in service_ratings) / len(service_ratings) if service_ratings else 0
        await db.services.update_one(
            {"id": order['service_id']},
            {"$set": {"rating": round(service_avg, 2), "rating_count": len(service_ratings)}}
        )
    
    # Notify rated user
    await create_notification(
        rating_data.to_user_id,
        f"{current_user.name} rated you {rating_data.rating} stars",
        "review"
    )
    
    return rating

@api_router.get("/ratings/user/{user_id}", response_model=List[Rating])
async def get_user_ratings(user_id: str):
    ratings = await db.ratings.find({"to_user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for rating in ratings:
        if isinstance(rating['created_at'], str):
            rating['created_at'] = datetime.fromisoformat(rating['created_at'])
    return ratings

# ========== NOTIFICATION ROUTES ==========
@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(current_user: User = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    for notif in notifications:
        if isinstance(notif['created_at'], str):
            notif['created_at'] = datetime.fromisoformat(notif['created_at'])
    return notifications

@api_router.post("/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: str, current_user: User = Depends(get_current_user)):
    notif = await db.notifications.find_one({"id": notif_id}, {"_id": 0})
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notif['user_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.notifications.update_one({"id": notif_id}, {"$set": {"read": True}})
    return {"message": "Notification marked as read"}

# ========== ADMIN ROUTES ==========
@api_router.get("/admin/users", response_model=List[User])
async def admin_get_users(current_user: User = Depends(get_current_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users

@api_router.get("/admin/gigs", response_model=List[Gig])
async def admin_get_gigs(current_user: User = Depends(get_current_user)):
    gigs = await db.gigs.find({}, {"_id": 0}).to_list(1000)
    for gig in gigs:
        if isinstance(gig['created_at'], str):
            gig['created_at'] = datetime.fromisoformat(gig['created_at'])
    return gigs

@api_router.get("/admin/services", response_model=List[Service])
async def admin_get_services(current_user: User = Depends(get_current_user)):
    services = await db.services.find({}, {"_id": 0}).to_list(1000)
    for service in services:
        if isinstance(service['created_at'], str):
            service['created_at'] = datetime.fromisoformat(service['created_at'])
    return services

@api_router.get("/admin/orders", response_model=List[Order])
async def admin_get_orders(current_user: User = Depends(get_current_user)):
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        if order.get('cancelled_at') and isinstance(order['cancelled_at'], str):
            order['cancelled_at'] = datetime.fromisoformat(order['cancelled_at'])
    return orders

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()