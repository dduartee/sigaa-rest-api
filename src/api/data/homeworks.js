module.exports = async function (req, res) {
    const Sigaa = require("sigaa-api").Sigaa;

    const sigaa = new Sigaa({
        url: "https://sigaa.ifsc.edu.br",
    });
    var bondsJSON = [];
    var coursesJSON = [];

    const username = req.body.username;
    const password = req.body.password;
    const args = req.query;

    const account = await sigaa.login(username, password);
    const activeBonds = await account.getActiveBonds();
    const inactiveBonds = await account.getInactiveBonds();

    var allBonds = [];
    allBonds.push(activeBonds, inactiveBonds);

    function isEmpty (val) {
        let typeOfVal = typeof val;
        switch(typeOfVal){
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

    function pushCourses(course, homeworksJSON) {
        return {
            id: course.id,
            title: course.title,
            code: course.code,
            period: course.period,
            schedule: course.schedule,
            homeworks: homeworksJSON
        }

    }
    async function homeworkHandler(course) {
        const homeworkList = await course.getHomeworks();
        const homeworksJSON = await pushHomeworks(homeworkList);
        coursesJSON.push(pushCourses(course, homeworksJSON))
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
            if (!isEmpty(args) && !findValue(args, bond)) break; // se tiver argumentos e não for valido
            else if (isEmpty(args)) { //verifica se existem argumentos
                res.json({
                    error: true,
                    msg: "Rota requer argumentos"
                })
                return;
            }
            const courses = await bond.getCourses();
            for (const course of courses) {
                if (findValue(args, course)) await homeworkHandler(course); // se nao for valido
            }
            bondsJSON.push(pushBonds(bond));
        }
    }
    res.json({
        bonds: bondsJSON
    });
    await account.logoff();
}