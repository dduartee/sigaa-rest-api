import { Sigaa, StudentBond, CourseStudent, Account } from "sigaa-api";
import { Request, Response } from "express";
import isEmpty from "../../util/isEmpty";
import findValue from "../../util/findValue";
const sigaa = new Sigaa({
  url: "https://sigaa.ifsc.edu.br",
});
export default async function (req: Request, res: Response) {
  var bondsJSON: any = [];

  const username = req.body.username;
  const password = req.body.password;
  const args = req.query;

  function pushCourses(course: CourseStudent) {
    return {
      id: course.id,
      title: course.title,
      code: course.code,
      period: course.period,
      schedule: course.schedule,
    };
  }

  function pushBonds(bond: StudentBond) {
    return {
      program: bond.program,
      registration: bond.registration,
      courses: coursesJSON,
    };
  }

  function courseHandler(course: CourseStudent) {
    coursesJSON.push(pushCourses(course));
  }
  var account:Account;
  try {
    var account = await sigaa.login(username, password);
    const activeBonds = await account.getActiveBonds();
    const inactiveBonds = await account.getInactiveBonds();

    var allBonds = [];
    allBonds.push(activeBonds, inactiveBonds);
    if (isEmpty(allBonds[0])) {
      throw new Error("Não foi possivel receber os vinculos");
    }

    for (const bonds of allBonds) {
      for (let i = 0; i < bonds.length; i++) {
        var coursesJSON: any = [];
        const bond: StudentBond = bonds[i];
        const courses = await bond.getCourses();
        for (const course of courses) {
          if (!isEmpty(args) && findValue(course, args)) courseHandler(course);
          // se tiver argumentos e for valido
          else if (isEmpty(args)) courseHandler(course); //se nao tiver argumentos
        }
        bondsJSON.push(pushBonds(bond));
      }
    }
    await account.logoff();
    return res.json({
      bonds: bondsJSON,
    });
  } catch (error) {
    await account.logoff();
    return res.json({ error: true, message: error.message });
  }
}
