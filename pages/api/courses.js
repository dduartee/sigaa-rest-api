async function courses(req, res) {

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
          coursesJSON.push({
            id: course.id,
            title: course.title,
            code: course.code,
            period: course.period,
            schedule: course.schedule,
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
    res.json(resultJSON);
    await account.logoff();
}

export default courses;