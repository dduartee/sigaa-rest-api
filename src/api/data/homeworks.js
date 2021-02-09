module.exports = async function (req, res) {
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
    const bondsArgs = req.body.bondargs;
    const courseArgs = req.body.courseargs;

    const account = await sigaa.login(username, password);
    const activeBonds = await account.getActiveBonds();
    const inactiveBonds = await account.getInactiveBonds();

    var allBonds = [];
    allBonds.push(activeBonds, inactiveBonds);

    function findValue(args, obj) {
        for (let [key_arg, value_arg] of Object.entries(args)) {
            for (let [key, value] of Object.entries(obj)) {
                if (key_arg == key && value_arg == value) {
                    return obj;
                }
            }
        }
    }

    async function pushHomeworks(homeworkList) {
        var homeworks = [];
        for (const homework of homeworkList) {
            try {
                var file = await homework.getAttachmentFile();
            } catch (err) {
                var file = [];
            }

            var description = await homework.getDescription();
            var haveGrade = (await homework.getHaveGrade()) ? 'Vale nota' : 'Não vale nota'
            var startDate = homework.startDate;
            var endDate = homework.endDate;

            homeworks.push({
                title: homework.title,
                fileTitle: file.title,
                description: description,
                startDate: startDate,
                endDate: endDate,
                haveGrade: haveGrade
            })
        }
        return homeworks;
    }
    async function handler(course) {
        const homeworkList = await course.getHomeworks();
        const homeworksJSON = await pushHomeworks(homeworkList);
        coursesJSON.push({
            id: course.id,
            title: course.title,
            code: course.code,
            period: course.period,
            schedule: course.schedule,
            homeworks: homeworksJSON
        })
    }
    function pushBonds(bond) {
        return {
            program: bond.program,
            registration: bond.registration,
            courses: coursesJSON
        }
        
    }
    for (const bonds of allBonds) {
        for (let i = 0; i < bonds.length; i++) {
            coursesJSON = [];
            const bond = bonds[i];
            var courses = await bond.getCourses();
            for (const course of courses) {
                if (args)
                    if (findValue(course, args)) await handler(course); //se tiver args e for valido
                    else;
                else await handler(course);
            }
            bondsJSON.push(pushBonds(bond));
        }
    }

    resultJSON.push({
        bonds: bondsJSON
    })
    if (resultJSON) {
        res.json(resultJSON);
    }
    await account.logoff();
}