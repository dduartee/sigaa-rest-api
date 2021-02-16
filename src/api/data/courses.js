module.exports = async function (req, res) {
  const Sigaa = require("sigaa-api").Sigaa;

  const sigaa = new Sigaa({
    url: "https://sigaa.ifsc.edu.br",
  });
  var bondsJSON = [];

  const username = req.body.username;
  const password = req.body.password;
  const args = req.query;

  const account = await sigaa.login(username, password);
  const activeBonds = await account.getActiveBonds();
  const inactiveBonds = await account.getInactiveBonds();

  var allBonds = [];
  allBonds.push(activeBonds, inactiveBonds);

  function isEmpty(val) {
    let typeOfVal = typeof val;
    switch (typeOfVal) {
      case 'object':
        return (val.length == 0) || !Object.keys(val).length;
        break;
      case 'string':
        let str = val.trim();
        return str == '' || str == undefined;
        break;
      case 'number':
        return val == '';
        break;
      default:
        return val == '' || val == undefined;
    }
  };

  function findValue(args, obj) {
    for (let [key_arg, value_arg] of Object.entries(args)) {
      for (let [key, value] of Object.entries(obj)) {
        if (key_arg == key && value_arg == value) {
          return obj;
        }
      }
    }
  }

  function pushCourses(course) {
    return {
      id: course.id,
      title: course.title,
      code: course.code,
      period: course.period,
      schedule: course.schedule
    }
  }


  function pushBonds(bond) {
    return {
      program: bond.program,
      registration: bond.registration,
      courses: coursesJSON
    }
  }

  function courseHandler(course) {
    coursesJSON.push(pushCourses(course));
  }
  for (const bonds of allBonds) {
    for (let i = 0; i < bonds.length; i++) {
      coursesJSON = [];
      const bond = bonds[i];
      if (!isEmpty(args) && !findValue(args, bond)) break; // se tiver argumentos e não for valido
      const courses = await bond.getCourses();
      for (const course of courses) {
        if (!isEmpty(args) && findValue(course, args)) courseHandler(course); // se tiver argumentos e for valido
        else if (isEmpty(args)) courseHandler(course); //se nao tiver argumentos
      }
      bondsJSON.push(pushBonds(bond));
    }
  }
  res.json({
    bonds: bondsJSON
  });
  await account.logoff();
}