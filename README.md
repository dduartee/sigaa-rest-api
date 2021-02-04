# sigaa-rest-api
### PROJETO NÃO ESTA FUNCIONAL NA VERCEL POR ENQUANTO

Forma de requisições em rotas:
`
/api/courses/
/api/bonds/
/api/grades/

Sem argumentos
```
{
    "username": "usuario",
    "password": "senha"
}
```
/api/members/

Com argumentos (ex: código da matéria, id, matricula que podem ser pegos pela rota /api/courses|bonds sem argumentos)
```
{
    "username": "usuario",
    "password": "senha",
    "args" : {

        //Valores especificos de cursos ex:
        "id": "164215"

        //Podendo ter mais de um valor ex:
        "id": "164215",
        "title": "ARTES II"
    }
}
```

