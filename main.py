from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/home")
def home_page():
    return {"mensagem": "Olá, Mundo!"}