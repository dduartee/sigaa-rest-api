module.exports = async function (req, res) {
    const Sigaa = require("sigaa-api").Sigaa;

    const sigaa = new Sigaa({
        url: "https://sigaa.ifsc.edu.br",
    });
    var bondsJSON = [];

    const username = req.body.username;
    const password = req.body.password;
    const args = req.query;

    const account = await sigaa.login(username, password);

    const activeBonds = await account.getActiveBonds();
    const inactiveBonds = await account.getInactiveBonds();

    var allBonds = [];
    allBonds.push(activeBonds, inactiveBonds);

    function isEmpty(val) {
        let typeOfVal = typeof val;
        switch (typeOfVal) {
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

    function pushBond(bond) {
        return {
            program: bond.program,
            registration: bond.registration
        }
    }

    function bondHandler(bond) {
        bondsJSON.push(pushBond(bond));
    }
    for (const bonds of allBonds) {
        for (let i = 0; i < bonds.length; i++) {
            const bond = bonds[i];
            if (!isEmpty(args) && findValue(args, bond)) bondHandler(bond); //se tiver argumentos e for valido
            else if (isEmpty(args)) bondHandler(bond); // se não tiver argumentos
        }
    }
    res.json({
        bonds: bondsJSON
    });
    await account.logoff();
}