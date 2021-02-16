module.exports = async function (req, res) {

    const Sigaa = require("sigaa-api").Sigaa;

    const sigaa = new Sigaa({
        url: "https://sigaa.ifsc.edu.br",
    });
    var resultJSON = [];
    var bondsJSON = [];
    var coursesJSON = [];
    var membersJSON = [];

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

    function pushCourses(course, membersJSON) {
        return {
            id: course.id,
            title: course.title,
            code: course.code,
            period: course.period,
            schedule: course.schedule,
            members: membersJSON
        }
    }

    function pushMembers(members) {
        return {
            students: members.students,
            teachers: members.teachers
        }
    }

    async function memberHandler(course) {
        const members = await course.getMembers();
        membersJSON.push(pushMembers(members));
        coursesJSON.push(pushCourses(course, membersJSON));
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
            var courses = await bond.getCourses();
            for (const course of courses) {
                membersJSON = [];
                if (findValue(course, args)) await memberHandler(course);
            }
            bondsJSON.push({
                program: bond.program,
                registration: bond.registration,
                courses: coursesJSON
            })
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