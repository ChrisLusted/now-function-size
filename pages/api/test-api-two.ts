import { NextApiRequest, NextApiResponse } from "next";
import getScreenshot from "../../screenshot";

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  const file = await getScreenshot("https://www.microsoft.com/en-gb/");
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/pdf");
  res.end(file);
};
