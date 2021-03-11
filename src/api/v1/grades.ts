import { Sigaa, CourseStudent, GradeGroup, StudentBond, Account } from 'sigaa-api';
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

  function pushGrades(gradesGroups: GradeGroup[]) {
    var gradeJSON = [];
    for (const gradesGroup of gradesGroups) {
      switch (gradesGroup.type) {
        case "only-average":
          gradeJSON.push({
            name: gradesGroup.name,
            value: gradesGroup.value,
          });
          break;
        case "weighted-average":
          var personalGrade = [];
          for (const grade of gradesGroup.grades) {
            personalGrade.push({
              name: grade.name,
              weight: grade.weight,
              value: grade.value,
            });
          }
          gradeJSON.push({
            personalGrade: personalGrade,
            groupGrade: gradesGroup.value,
          });
          break;
        case "sum-of-grades":
          var personalGrade = [];
          for (const grade of gradesGroup.grades) {
            personalGrade.push({
              name: grade.name,
              maxValue: grade.maxValue,
              value: grade.value,
            });
          }
          gradeJSON.push({
            personalGrade: personalGrade,
            groupGrade: gradesGroup.value,
          });
          break;
      }
    }
    return gradeJSON;
  }

  function pushCourses(course: CourseStudent, gradesJSON: any) {
    return {
      id: course.id,
      title: course.title,
      code: course.code,
      period: course.period,
      schedule: course.schedule,
      grades: gradesJSON,
      homeworks: [],
      news: [],
      members: []
    };
  }
  async function gradesHandler(course: CourseStudent) {
    const gradesGroups = await course.getGrades();
    const gradesJSON = pushGrades(gradesGroups);
    console.log(gradesJSON);
    
    coursesJSON.push(pushCourses(course, gradesJSON));
  }

  function pushBonds(bond: StudentBond, coursesJSON) {
    return {
      program: bond.program,
      registration: bond.registration,
      courses: coursesJSON,
    };
  }
  var account:Account;
  try {
    if (isEmpty(args)) {
      //verifica se existem argumentos
      throw new Error("Rota requer argumentos");
    }
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
        coursesJSON = [];
        const bond: StudentBond = bonds[i];
        const courses: CourseStudent[] = await bond.getCourses();
        for (const course of courses) {
          if (findValue(args, course)) await gradesHandler(course);
        }
        bondsJSON.push(pushBonds(bond, coursesJSON));
      }
    }
    await account.logoff();
    return res.json({
      bonds: bondsJSON,
    });
  } catch (error) {
    if(account) await account.logoff();
    return res.json({ error: true, message: error.message });
  }
}
