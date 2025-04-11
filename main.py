from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import json, random

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates("pages")

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

@app.get("/licao", name='licao')
def licao_page(request: Request, num: int):
    return templates.TemplateResponse(f"licao_{num}.html", {'request': request})

@app.get("/quiz", name="quiz")
def quiz_page(request: Request):
        return templates.TemplateResponse("quiz.html", {'request': request})

@app.get("/sobre", name="sobre")
def sobre_page(request: Request):
     return templates.TemplateResponse("sobre.html", {'request': request})

@app.get("/wait", name='wait')
def wait_page(request: Request):
    return templates.TemplateResponse("wait.html", {"request": request})