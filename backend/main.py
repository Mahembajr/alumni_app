from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

import models
import schemas
import auth
from database import engine, get_db, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SUZA Alumni Management System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Seed default admin ──────────────────────────────────────────────────────
@app.on_event("startup")
def seed():
    db = next(get_db())
    admin = db.query(models.User).filter(models.User.email == "admin@suza.ac.tz").first()
    if not admin:
        admin = models.User(
            full_name="SUZA Administrator",
            email="admin@suza.ac.tz",
            hashed_password=auth.get_password_hash("admin123"),
            role=models.UserRole.admin,
        )
        db.add(admin)

        # Seed sample data
        jobs = [
            models.Job(title="Software Engineer", company="Zanzibar Tech Ltd", location="Zanzibar", description="Develop and maintain web applications.", requirements="BSc Computer Science, 2+ years experience", salary="TZS 2,000,000 - 3,500,000", job_type="full-time", posted_by=1),
            models.Job(title="Data Analyst", company="Blue Ocean Analytics", location="Dar es Salaam", description="Analyze business data and produce insights.", requirements="BSc Statistics/Math, Excel, Python", salary="TZS 1,800,000", job_type="full-time", posted_by=1),
            models.Job(title="Network Administrator", company="Zantel", location="Zanzibar", description="Manage and monitor network infrastructure.", requirements="BSc IT/Networking, CCNA preferred", salary="TZS 2,500,000", job_type="full-time", posted_by=1),
        ]
        clubs = [
            models.Club(name="Tech Alumni Club", description="For all technology graduates and enthusiasts.", category="academic", created_by=1),
            models.Club(name="Business & Finance Club", description="Alumni in banking, finance and entrepreneurship.", category="academic", created_by=1),
            models.Club(name="Zanzibar Regional Chapter", description="Alumni based in Zanzibar Island.", category="regional", created_by=1),
            models.Club(name="Education & Research Club", description="Alumni pursuing teaching and research careers.", category="interest", created_by=1),
        ]
        events = [
            models.Event(title="Annual Alumni Gala 2026", description="Join us for the annual SUZA Alumni Gala dinner, a night of networking and celebration.", location="Serena Hotel, Zanzibar", event_date=datetime(2026, 6, 15, 18, 0), posted_by=1),
            models.Event(title="Career Fair 2026", description="Connect with top employers and explore career opportunities.", location="SUZA Main Campus", event_date=datetime(2026, 4, 20, 9, 0), posted_by=1),
            models.Event(title="Tech Talk: AI & the Future of Work", description="A panel discussion on artificial intelligence and its impact on careers.", location="SUZA ICT Centre", event_date=datetime(2026, 5, 10, 14, 0), posted_by=1),
        ]
        announcements = [
            models.Announcement(title="Welcome to the SUZA Alumni Portal!", content="We are excited to launch the new SUZA Alumni Management System. Register today and connect with thousands of SUZA graduates worldwide.", posted_by=1),
            models.Announcement(title="Update Your Profile", content="Please make sure your profile is up to date including your current employment details so we can better serve you.", posted_by=1),
        ]
        for obj in jobs + clubs + events + announcements:
            db.add(obj)
        db.commit()


# ── AUTH ─────────────────────────────────────────────────────────────────────
@app.post("/api/auth/register", response_model=schemas.Token)
def register(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        full_name=user_in.full_name,
        email=user_in.email,
        hashed_password=auth.get_password_hash(user_in.password),
        graduation_year=user_in.graduation_year,
        program=user_in.program,
        phone=user_in.phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = auth.create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}}

@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}}

@app.get("/api/auth/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


# ── USERS ─────────────────────────────────────────────────────────────────────
@app.get("/api/users", response_model=List[schemas.UserOut])
def list_users(search: Optional[str] = None, program: Optional[str] = None, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    q = db.query(models.User).filter(models.User.role == models.UserRole.alumni, models.User.is_active == True)
    if search:
        q = q.filter(models.User.full_name.ilike(f"%{search}%"))
    if program:
        q = q.filter(models.User.program.ilike(f"%{program}%"))
    return q.all()

@app.get("/api/users/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/api/users/me", response_model=schemas.UserOut)
def update_profile(data: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user

@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Not found")
    user.is_active = False
    db.commit()
    return {"detail": "User deactivated"}


# ── JOBS ──────────────────────────────────────────────────────────────────────
@app.get("/api/jobs", response_model=List[schemas.JobOut])
def list_jobs(db: Session = Depends(get_db)):
    return db.query(models.Job).filter(models.Job.is_active == True).order_by(models.Job.created_at.desc()).all()

@app.post("/api/jobs", response_model=schemas.JobOut)
def create_job(job_in: schemas.JobCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    job = models.Job(**job_in.model_dump(), posted_by=current_user.id)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Not found")
    job.is_active = False
    db.commit()
    return {"detail": "Deleted"}


# ── EVENTS ────────────────────────────────────────────────────────────────────
@app.get("/api/events", response_model=List[schemas.EventOut])
def list_events(db: Session = Depends(get_db)):
    events = db.query(models.Event).filter(models.Event.is_active == True).order_by(models.Event.event_date.asc()).all()
    result = []
    for e in events:
        out = schemas.EventOut.model_validate(e)
        out.rsvp_count = len(e.rsvps)
        result.append(out)
    return result

@app.post("/api/events", response_model=schemas.EventOut)
def create_event(event_in: schemas.EventCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_admin)):
    event = models.Event(**event_in.model_dump(), posted_by=current_user.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    out = schemas.EventOut.model_validate(event)
    out.rsvp_count = 0
    return out

@app.post("/api/events/{event_id}/rsvp")
def rsvp_event(event_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    existing = db.query(models.EventRSVP).filter_by(event_id=event_id, user_id=current_user.id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"detail": "RSVP removed"}
    rsvp = models.EventRSVP(event_id=event_id, user_id=current_user.id)
    db.add(rsvp)
    db.commit()
    return {"detail": "RSVP confirmed"}

@app.delete("/api/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Not found")
    event.is_active = False
    db.commit()
    return {"detail": "Deleted"}


# ── CLUBS ─────────────────────────────────────────────────────────────────────
@app.get("/api/clubs", response_model=List[schemas.ClubOut])
def list_clubs(db: Session = Depends(get_db)):
    clubs = db.query(models.Club).filter(models.Club.is_active == True).all()
    result = []
    for c in clubs:
        out = schemas.ClubOut.model_validate(c)
        out.member_count = len(c.members)
        result.append(out)
    return result

@app.post("/api/clubs", response_model=schemas.ClubOut)
def create_club(club_in: schemas.ClubCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_admin)):
    club = models.Club(**club_in.model_dump(), created_by=current_user.id)
    db.add(club)
    db.commit()
    db.refresh(club)
    out = schemas.ClubOut.model_validate(club)
    out.member_count = 0
    return out

@app.post("/api/clubs/{club_id}/join")
def join_club(club_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    existing = db.query(models.ClubMember).filter_by(club_id=club_id, user_id=current_user.id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"detail": "Left club"}
    member = models.ClubMember(club_id=club_id, user_id=current_user.id)
    db.add(member)
    db.commit()
    return {"detail": "Joined club"}

@app.delete("/api/clubs/{club_id}")
def delete_club(club_id: int, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Not found")
    club.is_active = False
    db.commit()
    return {"detail": "Deleted"}


# ── ACHIEVEMENTS ──────────────────────────────────────────────────────────────
@app.get("/api/achievements", response_model=List[schemas.AchievementOut])
def list_achievements(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Achievement).filter(models.Achievement.user_id == current_user.id).all()

@app.post("/api/achievements", response_model=schemas.AchievementOut)
def add_achievement(ach: schemas.AchievementCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    a = models.Achievement(**ach.model_dump(), user_id=current_user.id)
    db.add(a)
    db.commit()
    db.refresh(a)
    return a

@app.delete("/api/achievements/{ach_id}")
def delete_achievement(ach_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    a = db.query(models.Achievement).filter(models.Achievement.id == ach_id, models.Achievement.user_id == current_user.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(a)
    db.commit()
    return {"detail": "Deleted"}


# ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────
@app.get("/api/announcements", response_model=List[schemas.AnnouncementOut])
def list_announcements(db: Session = Depends(get_db)):
    return db.query(models.Announcement).filter(models.Announcement.is_active == True).order_by(models.Announcement.created_at.desc()).all()

@app.post("/api/announcements", response_model=schemas.AnnouncementOut)
def create_announcement(ann: schemas.AnnouncementCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_admin)):
    a = models.Announcement(**ann.model_dump(), posted_by=current_user.id)
    db.add(a)
    db.commit()
    db.refresh(a)
    return a

@app.delete("/api/announcements/{ann_id}")
def delete_announcement(ann_id: int, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    a = db.query(models.Announcement).filter(models.Announcement.id == ann_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Not found")
    a.is_active = False
    db.commit()
    return {"detail": "Deleted"}


# ── MESSAGES ──────────────────────────────────────────────────────────────────
@app.get("/api/messages", response_model=List[schemas.MessageOut])
def get_messages(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Message).filter(
        (models.Message.receiver_id == current_user.id) | (models.Message.sender_id == current_user.id)
    ).order_by(models.Message.created_at.desc()).all()

@app.post("/api/messages", response_model=schemas.MessageOut)
def send_message(msg: schemas.MessageCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    m = models.Message(**msg.model_dump(), sender_id=current_user.id)
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


# ── CERTIFICATES ──────────────────────────────────────────────────────────────
@app.get("/api/certificates", response_model=List[schemas.CertificateRequestOut])
def list_cert_requests(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role == models.UserRole.admin:
        return db.query(models.CertificateRequest).order_by(models.CertificateRequest.created_at.desc()).all()
    return db.query(models.CertificateRequest).filter(models.CertificateRequest.user_id == current_user.id).all()

@app.post("/api/certificates", response_model=schemas.CertificateRequestOut)
def create_cert_request(req: schemas.CertificateRequestCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    r = models.CertificateRequest(**req.model_dump(), user_id=current_user.id)
    db.add(r)
    db.commit()
    db.refresh(r)
    return r

@app.put("/api/certificates/{req_id}")
def update_cert_request(req_id: int, status: str, admin_note: Optional[str] = None, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    r = db.query(models.CertificateRequest).filter(models.CertificateRequest.id == req_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    r.status = status
    r.admin_note = admin_note
    db.commit()
    return {"detail": "Updated"}


# ── ADMIN STATS ────────────────────────────────────────────────────────────────
@app.get("/api/admin/stats")
def admin_stats(db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    return {
        "total_alumni": db.query(models.User).filter(models.User.role == models.UserRole.alumni).count(),
        "total_jobs": db.query(models.Job).filter(models.Job.is_active == True).count(),
        "total_events": db.query(models.Event).filter(models.Event.is_active == True).count(),
        "total_clubs": db.query(models.Club).filter(models.Club.is_active == True).count(),
        "pending_certificates": db.query(models.CertificateRequest).filter(models.CertificateRequest.status == "pending").count(),
        "total_announcements": db.query(models.Announcement).filter(models.Announcement.is_active == True).count(),
    }
