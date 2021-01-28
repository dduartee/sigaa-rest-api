# sigaa-rest-api
### PROJETO NÃO ESTA FUNCIONAL NA VERCEL POR ENQUANTO

Forma de requisições em rotas:
`
/api/courses/
/api/bonds/
/api/grades/
`
```
{
    "username": "usuario",
    "password": "senha"
}
```

`
/api/specificCourse/
/api/specificCourseGrades/
`
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
