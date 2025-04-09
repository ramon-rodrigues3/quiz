import json

caminho = "teste.json"

with open(caminho) as file:
    dicionario = json.loads(file.read())
    print(dicionario)