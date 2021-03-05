import { Sigaa, CourseStudent, GradeGroup, StudentBond } from 'sigaa-api';
import { Request, Response } from "express";
import isEmpty from "../../util/isEmpty";
import findValue from "../../util/findValue";

const sigaa = new Sigaa({
  url: "https://sigaa.ifsc.edu.br",
});
export default async function (req: Request, res: Response) {
  var bondsJSON:any = [];
  var coursesJSON:any = [];

  const username = req.body.username;
  const password = req.body.password;
  const args = req.query;

  const account = await sigaa.login(username, password);
  const activeBonds = await account.getActiveBonds();
  const inactiveBonds = await account.getInactiveBonds();
  var allBonds = [];
  allBonds.push(activeBonds, inactiveBonds);
  
  function pushGrades(gradesGroups: GradeGroup[]) {
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

  function pushCourses(course: CourseStudent, gradesJSON:any) {
    return {
      id: course.id,
      title: course.title,
      code: course.code,
      period: course.period,
      schedule: course.schedule,
      grades: gradesJSON
    }
  }
  async function gradesHandler(course: CourseStudent) {
    const gradesGroups = await course.getGrades();
    const gradesJSON = pushGrades(gradesGroups);
    coursesJSON.push(pushCourses(course, gradesJSON))
  }

  function pushBonds(bond: StudentBond, coursesJSON) {
    return {
      program: bond.program,
      registration: bond.registration,
      courses: coursesJSON
    }
  }
  for (const bonds of allBonds) {
    for (let i = 0; i < bonds.length; i++) {
      coursesJSON = [];
      const bond:StudentBond = bonds[i];
      if (!isEmpty(args) && !findValue(args, bond)) break; // se tiver argumentos e não for valido
      else if (isEmpty(args)) { //verifica se existem argumentos
        res.json({
          error: true,
          msg: "Rota requer argumentos"
        })
        return;
      }
      const courses:CourseStudent[] = await bond.getCourses();
      for (const course of courses) {
        if (findValue(args, course)) await gradesHandler(course);
      }
      bondsJSON.push(pushBonds(bond, coursesJSON))
    }
  }
  await account.logoff();
  return res.json({
    bonds: bondsJSON
  });
}