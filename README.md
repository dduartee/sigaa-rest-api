# sigaa-rest-api
### Projeto esta em PRODUÇÃO na AWS
http://18.231.111.243:3000/

### Projeto esta em STAGE na AWS
http://18.231.111.243:3003/

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

Com argumentos, informando pela url (informe argumentos sobre os courses[materias] como por exemplo: id e codigo da materia
```
URL: https://sigaa-rest-api.herokuapp.com/api/news?id={id da materia}

{
    "username": "usuario",
    "password": "senha"
}
```

Fiz uma demonstração ([_sigaa-rest-api-demo_][sigaa-rest-api-demo]) do uso da api com um sistema simples de cache usando o localstorage.

[sigaa-rest-api-demo]: https://github.com/dduartee/sigaa-rest-api-demo