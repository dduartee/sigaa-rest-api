async function grades(req, res) {

    const Sigaa = require("sigaa-api").Sigaa;

    const sigaa = new Sigaa({
        url: "https://sigaa.ifsc.edu.br",
    });
    var resultJSON = [];
    var bondsJSON = [];
    var coursesJSON = [];
    var gradesJSON = [];
    const account = await sigaa.login(req.body.username, req.body.password);
    const activeBonds = await account.getActiveBonds();
    const inactiveBonds = await account.getInactiveBonds();

    var allBonds = [];
    allBonds.push(activeBonds, inactiveBonds);

    for (const bonds of allBonds) {
        for (let i = 0; i < bonds.length; i++) {
          coursesJSON = [];
          const bond = bonds[i];
          var courses = await bond.getCourses();
          for (const course of courses) {
            gradesJSON = [];
            const gradesGroups = await course.getGrades();
            for (const gradesGroup of gradesGroups) {
              switch (gradesGroup.type) {
                // O primiro tipo (only-average) é somente o valor final, mesmo assim, pode ser que o valor ainda seja indefinido
                case 'only-average':
                  gradesJSON.push({
                    name: gradesGroup.name,
                    value: gradesGroup.value
                  })
                  break;
    
                  // O segundo (weighted-average) é um grupo com notas ponderadas (tem peso), mas os pesos podem serem todos iguais
                case 'weighted-average':
                  //Para cada nota do grupo
                  var personalGrade = [];
                  for (const grade of gradesGroup.grades) {
                    personalGrade.push({
                      name: grade.name,
                      weight: grade.weight,
                      value: grade.value,
                    })
                  }
                  gradesJSON.push({
                    personalGrade: personalGrade,
                    groupGrade: gradesGroup.value
                  })
                  break;
    
                  // O terceiro (sum-of-grades) é um grupo de soma de notas, não tem peso, mas cada nota tem um valor máximo
                case 'sum-of-grades':
                  //Para cada nota do grupo
                  var personalGrade = [];
                  for (const grade of gradesGroup.grades) {
                    personalGrade.push({
                      name: grade.name,
                      maxValue: grade.maxValue,
                      value: grade.value
                    })
                  }
                  gradesJSON.push({
                    personalGrade: personalGrade,
                    groupGrade: gradesGroup.value
                  })
                  break;
              }
            }
            coursesJSON.push({
              id: course.id,
              title: course.title,
              code: course.code,
              period: course.period,
              scheudule: course.scheudule,
              grades: gradesJSON
            })
          }
          bondsJSON.push({
            program: bond.program,
            registration: bond.registration,
            courses: coursesJSON
          })
        }
      }
    
      resultJSON.push({
        bonds: bondsJSON
      })
    res.json(resultJSON)
    await account.logoff();
}

export default grades;