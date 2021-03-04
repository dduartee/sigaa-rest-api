import { Sigaa } from "sigaa-api";
import { Request, Response } from "express";
import isEmpty from "../../util/isEmpty";
import findValue from "../../util/findValue";
const sigaa = new Sigaa({
    url: "https://sigaa.ifsc.edu.br",
});

export default async function (req:Request, res:Response) {
    var bondsJSON:any = [];

    const username = req.body.username;
    const password = req.body.password;
    const args = req.query;

    const account = await sigaa.login(username, password);

    const activeBonds = await account.getActiveBonds();
    const inactiveBonds = await account.getInactiveBonds();

    var allBonds = [];
    allBonds.push(activeBonds, inactiveBonds);


    function pushBond(bond:any) {
        return {
            program: bond.program,
            registration: bond.registration
        }
    }

    function bondHandler(bond:any) {
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