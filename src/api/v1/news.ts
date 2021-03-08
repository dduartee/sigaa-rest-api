import { Sigaa, CourseStudent, News, StudentBond } from "sigaa-api";
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

  function pushCourses(course: CourseStudent, newsJSON: any) {
    return {
      id: course.id,
      title: course.title,
      code: course.code,
      period: course.period,
      schedule: course.schedule,
      news: newsJSON,
    };
  }

  async function pushNews(newsList: News[]) {
    var newsJSON = [];
    for (const news of newsList) {
      newsJSON.push({
        id: news.id,
        title: news.title,
        description: await news.getContent(),
        date: (await news.getDate()).toString(),
      });
    }
    return newsJSON;
  }

  async function newsHandler(course: CourseStudent) {
    const newsList = await course.getNews();
    const newsJSON = await pushNews(newsList);
    coursesJSON.push(pushCourses(course, newsJSON));
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
      throw new Error("Não foi possivel receber os vinculos");
    }

    for (const bonds of allBonds) {
      for (let i = 0; i < bonds.length; i++) {
        coursesJSON = [];
        const bond: StudentBond = bonds[i];
        const courses = await bond.getCourses();
        for (const course of courses) {
          if (findValue(args, course)) await newsHandler(course);
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
