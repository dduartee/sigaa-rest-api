module.exports = async function (req, res) {
  const Sigaa = require("sigaa-api").Sigaa;

  const sigaa = new Sigaa({
    url: "https://sigaa.ifsc.edu.br",
  });
  var bondsJSON = [];
  var coursesJSON = [];

  const username = req.body.username;
  const password = req.body.password;
  const args = req.body.args || [];

  const account = await sigaa.login(username, password);
  const activeBonds = await account.getActiveBonds();
  const inactiveBonds = await account.getInactiveBonds();

  var allBonds = [];
  allBonds.push(activeBonds, inactiveBonds);

  function findValue(args, obj) {
    for (let [key_arg, value_arg] of Object.entries(args)) {
      for (let [key, value] of Object.entries(obj)) {
        if (key_arg == key && value_arg == value) {
          return obj;
        }
      }
    }
  }

  function pushGrades(gradesGroups) {
    var gradeJSON = [];
    for (const gradesGroup of gradesGroups) {
      switch (gradesGroup.type) {
        case 'only-average':
          gradeJSON.push({
            name: gradesGroup.name,
            value: gradesGroup.value
          })
          break;
        case 'weighted-average':
          var personalGrade = [];
          for (const grade of gradesGroup.grades) {
            personalGrade.push({
              name: grade.name,
              weight: grade.weight,
              value: grade.value,
            })
          }
          gradeJSON.push({
            personalGrade: personalGrade,
            groupGrade: gradesGroup.value
          })
          break;
        case 'sum-of-grades':
          var personalGrade = [];
          for (const grade of gradesGroup.grades) {
            personalGrade.push({
              name: grade.name,
              maxValue: grade.maxValue,
              value: grade.value
            })
          }
          gradeJSON.push({
            personalGrade: personalGrade,
            groupGrade: gradesGroup.value
          })
          break;
      }
    }
    return gradeJSON;
  }

  function pushCourses(course, gradesJSON) {
    return {
      id: course.id,
      title: course.title,
      code: course.code,
      period: course.period,
      schedule: course.schedule,
      grades: gradesJSON
    }
  }
  async function gradesHandler(course) {
    const gradesGroups = await course.getGrades();
    const gradesJSON = pushGrades(gradesGroups);
    coursesJSON.push(pushCourses(course, gradesJSON))
  }

  function pushBonds(bond) {
    return {
      program: bond.program,
      registration: bond.registration,
      courses: coursesJSON
    }
  }
  for (const bonds of allBonds) {
    for (let i = 0; i < bonds.length; i++) {
      coursesJSON = [];
      const bond = bonds[i];
      if (req.body.args && !findValue(args, bond)) break; // se nao for valido
      else if (!req.body.args) {
        res.json({
          error: true,
          msg: "Rota requer argumentos"
        })
        return;
      }
      const courses = await bond.getCourses();
      for (const course of courses) {
        if (findValue(args, course)) await gradesHandler(course);
      }
      bondsJSON.push(pushBonds(bond))
    }
  }
  res.json({
    bonds: bondsJSON
  });
  await account.logoff();
}