import { Request, Response } from "express";
export default function (req: Request, res: Response) {
    const pjson = require("./../package.json");
    return res.json({name: pjson.name, version: pjson.version, dependencies: pjson.dependencies})
}
