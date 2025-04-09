from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates("pages")

@app.get("/")
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