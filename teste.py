import json

caminho = "teste.json"

with open(caminho, encoding="utf-8") as file:
    dicionario = json.loads(file.read())
    print(dicionario)