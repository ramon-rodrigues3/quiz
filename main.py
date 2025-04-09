from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

@app.get("/home")
def home_page():
    return {"mensagem": "Olá, Mundo!"}