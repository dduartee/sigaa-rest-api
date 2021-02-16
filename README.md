# sigaa-rest-api
### Projeto esta em produção na HEROKU
https://sigaa-rest-api.herokuapp.com/

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
/api/news/
/api/homeworks/

Com argumentos, informando pela url (informe argumentos sobre os courses[materias] e sobre os bonds[vinculos], como por exemplo: id e codigo da materia, registration[matricula] do vinculo)
```
URL: https://sigaa-rest-api.herokuapp.com/api/news?id=164215&registration={registration do vinculo}

body {
    "username": "usuario",
    "password": "senha"
}
```

