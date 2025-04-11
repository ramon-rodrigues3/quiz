import json, random

caminho = "teste.json"

with open(caminho, encoding="utf-8") as file:
    dicionario = json.loads(file.read())
    lista = dicionario["perguntas"]

    lista2 = [1, 2, 3]
    random.shuffle(lista)
    print(lista)