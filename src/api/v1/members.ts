import { Sigaa, CourseStudent, MemberList, StudentBond } from 'sigaa-api';
import { Request, Response } from "express";
import isEmpty from "../../util/isEmpty";
import findValue from "../../util/findValue";

const sigaa = new Sigaa({
  url: "https://sigaa.ifsc.edu.br",
});

export default async function (req: Request, res:Response) {
    var bondsJSON:any = [];
    var coursesJSON:any = [];
    var membersJSON:any = [];

    const username = req.body.username;
    const password = req.body.password;
    const args = req.query;

    const account = await sigaa.login(username, password);
    const activeBonds = await account.getActiveBonds();
    const inactiveBonds = await account.getInactiveBonds();

    var allBonds = [];
    allBonds.push(activeBonds, inactiveBonds);

    function pushCourses(course: CourseStudent, membersJSON:any) {
        return {
            id: course.id,
            title: course.title,
            code: course.code,
            period: course.period,
            schedule: course.schedule,
            members: membersJSON
        }
    }

    function pushMembers(members:MemberList) {
        return {
            students: members.students,
            teachers: members.teachers
        }
    }

    async function memberHandler(course: CourseStudent) {
        const members = await course.getMembers();
        membersJSON.push(pushMembers(members));
        coursesJSON.push(pushCourses(course, membersJSON));
    }
    function pushBonds(bond:StudentBond, coursesJSON:any) {
        bondsJSON.push({
            program: bond.program,
            registration: bond.registration,
            courses: coursesJSON
        })
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
            var courses = await bond.getCourses();
            for (const course of courses) {
                membersJSON = [];
                if (findValue(course, args)) await memberHandler(course);
            }
        }
    }

    await account.logoff();
    return res.json({
        bonds: bondsJSON
    })
}