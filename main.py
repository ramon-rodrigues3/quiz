from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import json, random

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates("pages")

@app.get("/favicon.ico", include_in_schema=False)
def return_favicon():
    return FileResponse("static/media/img/android-chrome-192x192.png")

@app.get("/questions", name="questions")
def get_questions(num: int = 10):
    caminho = "teste.json"

    with open(caminho, encoding="utf-8") as file:
        dicionario = json.loads(file.read())
        perguntas = dicionario["perguntas"]
        random.shuffle(perguntas)
        return perguntas[:num]     

@app.get("/", name='home')
def home_page(request: Request):
    return templates.TemplateResponse("index.html", {'request': request})

@app.get("/quiz", name="quiz")
def quiz_page(request: Request):
        return templates.TemplateResponse("quiz.html", {'request': request})

@app.get("/sobre", name="sobre")
def sobre_page(request: Request):
     return templates.TemplateResponse("sobre.html", {'request': request})

@app.get("/wait", name='wait', include_in_schema=False)
def wait_page(request: Request):
    return templates.TemplateResponse("wait.html", {"request": request})