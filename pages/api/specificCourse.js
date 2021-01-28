async function specificCourse(req, res) {

  const Sigaa = require("sigaa-api").Sigaa;

  const sigaa = new Sigaa({
    url: "https://sigaa.ifsc.edu.br",
  });
  var resultJSON = [];
  var bondsJSON = [];
  var coursesJSON = [];

  const username = req.body.username;
  const password = req.body.password;
  const args = req.body.args;

  const account = await sigaa.login(username, password);

  const activeBonds = await account.getActiveBonds();
  const inactiveBonds = await account.getInactiveBonds();

  var allBonds = [];
  allBonds.push(activeBonds, inactiveBonds);

  function findCourse(course, args) {
    for (const key in course) {
      if (Object.hasOwnProperty.call(course, key)) {
        const value = course[key];
        for (const argKEY in args) {
          if (Object.hasOwnProperty.call(args, argKEY)) {
            const arg = args[argKEY];
            if (arg == value) {
              return course;
            }
          }
        }
      }
    }
  }

  var allBonds = [];
  allBonds.push(activeBonds, inactiveBonds);

  for (const bonds of allBonds) {
    for (let i = 0; i < bonds.length; i++) {
      coursesJSON = [];
      const bond = bonds[i];
      var courses = await bond.getCourses();
      for (const course of courses) {
        const validCourse = findCourse(course, args);
        if (validCourse) {
          coursesJSON.push({
            id: validCourse.id,
            title: validCourse.title,
            code: validCourse.code,
            period: validCourse.period,
            schedule: validCourse.schedule
          })
        }
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
  res.json(resultJSON);
  await account.logoff();
}

export default specificCourse;