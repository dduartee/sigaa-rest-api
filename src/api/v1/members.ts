import { Sigaa, CourseStudent, MemberList, StudentBond, Account } from 'sigaa-api';
import { Request, Response } from "express";
import isEmpty from "../../util/isEmpty";
import findValue from "../../util/findValue";

const sigaa = new Sigaa({
  url: "https://sigaa.ifsc.edu.br",
});

export default async function (req: Request, res: Response) {
  var bondsJSON: any = [];
  var coursesJSON: any = [];
  var membersJSON: any = [];

  const username = req.body.username;
  const password = req.body.password;
  const args = req.query;

  function pushCourses(course: CourseStudent, membersJSON: any) {
    return {
      id: course.id,
      title: course.title,
      code: course.code,
      period: course.period,
      schedule: course.schedule,
      members: membersJSON,
      grades: [],
      news: [],
      homeworks: []
    };
  }

  function pushMembers(members: MemberList) {
    return {
      students: members.students,
      teachers: members.teachers,
    };
  }

  async function memberHandler(course: CourseStudent) {
    const members = await course.getMembers();
    membersJSON.push(pushMembers(members));
    coursesJSON.push(pushCourses(course, membersJSON));
  }
  function pushBonds(bond: StudentBond, coursesJSON: any) {
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
        var courses = await bond.getCourses();
        for (const course of courses) {
          membersJSON = [];
          if (findValue(course, args)) await memberHandler(course);
        }
        bondsJSON.push(pushBonds(bond, coursesJSON));
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
