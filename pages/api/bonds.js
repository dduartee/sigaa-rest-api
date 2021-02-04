export default async function bonds(req, res) {
    if (req.method === 'POST') {

        const Sigaa = require("sigaa-api").Sigaa;

        const sigaa = new Sigaa({
            url: "https://sigaa.ifsc.edu.br",
        });
        var resultJSON = [];
        var bondsJSON = [];

        const username = req.body.username;
        const password = req.body.password;
        const args = req.body.args;

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

        function pushBond(bond) {
            return {
                program: bond.program,
                registration: bond.registration
            }
        }

        for (const bonds of allBonds) {
            bonds.forEach(bond => {
                if (args) {
                    const valid = findValue(bond, args)
                    if (valid) {
                        bondsJSON.push(pushBond(bond));
                    }
                } else {
                    bondsJSON.push({
                        program: bond.program,
                        registration: bond.registration
                    })
                }
            });
        }
        resultJSON.push({
            bonds: bondsJSON
        })
        if (resultJSON) {
            res.json(resultJSON);
        }
        await account.logoff();
    }
}