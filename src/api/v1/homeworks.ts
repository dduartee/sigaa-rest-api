import { Sigaa, CourseStudent, StudentBond, SigaaHomework } from "sigaa-api";
import { Request, Response } from "express";
import isEmpty from "../../util/isEmpty";
import findValue from "../../util/findValue";

const sigaa = new Sigaa({
  url: "https://sigaa.ifsc.edu.br",
});
export default async function (req: Request, res: Response) {
  var bondsJSON: any = [];
  var coursesJSON: any = [];

  const username = req.body.username;
  const password = req.body.password;
  const args = req.query;

  async function pushHomeworks(homeworkList: SigaaHomework[]) {
    var homeworks = [];
    for (const homework of homeworkList) {
      var description = await homework.getDescription();
      var haveGrade = (await homework.getHaveGrade())
        ? "Vale nota"
        : "Não vale nota";
      var startDate = homework.startDate;
      var endDate = homework.endDate;

      homeworks.push({
        title: homework.title,
        description: description,
        startDate: startDate,
        endDate: endDate,
        haveGrade: haveGrade,
      });
    }
    return homeworks;
  }

  function pushCourses(course: CourseStudent, homeworksJSON: any) {
    return {
      id: course.id,
      title: course.title,
      code: course.code,
      period: course.period,
      schedule: course.schedule,
      homeworks: homeworksJSON,
    };
  }
  async function homeworkHandler(course: CourseStudent) {
    const homeworkList: any[] = await course.getHomeworks();
    const homeworksJSON = await pushHomeworks(homeworkList);
    coursesJSON.push(pushCourses(course, homeworksJSON));
  }

  function pushBonds(bond: StudentBond) {
    return {
      program: bond.program,
      registration: bond.registration,
      courses: coursesJSON,
    };
  }

  try {
    if (isEmpty(args)) {
      //verifica se existem argumentos
      throw new Error("Rota requer argumentos");
    }
    const account = await sigaa.login(username, password);
    const activeBonds = await account.getActiveBonds();
    const inactiveBonds = await account.getInactiveBonds();
    var allBonds = [];
    allBonds.push(activeBonds, inactiveBonds);
    if (isEmpty(allBonds[0])) {
      await account.logoff();
      throw new Error("Não foi possivel receber os vinculos");
    }

    for (const bonds of allBonds) {
      for (let i = 0; i < bonds.length; i++) {
        coursesJSON = [];
        const bond: StudentBond = bonds[i];
        const courses = await bond.getCourses();
        for (const course of courses) {
          if (findValue(args, course)) await homeworkHandler(course);
        }
        bondsJSON.push(pushBonds(bond));
      }
    }
    await account.logoff();
    return res.json({
      bonds: bondsJSON,
    });
  } catch (error) {
    return res.json({ error: true, message: error.message });
  }
}
